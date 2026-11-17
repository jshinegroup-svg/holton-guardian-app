import {offline,transportFailure} from './connectivity';
import type {ChildSave, FamilyEvent} from './types';
import {childStorageKey} from './types';

export interface FamilyCloud {
  load<T>(childId:string):Promise<ChildSave<T>|null>;
  save<T>(args:{childId:string;expectedRevision:number;operationId:string;state:T;events:FamilyEvent[]}):Promise<{revision:number;duplicate:boolean}>;
}
export interface LocalStore {getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
type Pending<T>={operationId:string;expectedRevision:number;state:T;events:FamilyEvent[];baseState?:T};
type Cached<T>={schema:2;revision:number;state:T;pending?:Pending<T>;queue?:Pending<T>[]};
// PostgreSQL JSONB may reorder object keys; order is not a progress change.
function snapshot(value:unknown){return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);}
/** One instance per child. Local pending writes survive a failed request/reload.
 * Conflicts must be surfaced; never substitute the newest server revision and retry old state.
 */
export class ProgressRepository<T> {
  private key:string;
  private busy=false;
  private retryAfter=0;
  private revision:number|undefined;
  private knownState:string|undefined;
  constructor(private familyId:string,private childId:string,private local:LocalStore,private cloud:FamilyCloud,private newId:()=>string){
    this.key=childStorageKey(familyId,childId);
  }
  private async cached():Promise<Cached<T>|null>{
    const raw=await this.local.getItem(this.key);
    if(!raw)return null;
    const data=JSON.parse(raw) as Cached<T>;
    if(data.schema!==2||!Number.isSafeInteger(data.revision)||data.revision<0||!data.state)throw Error('invalid_local_save');
    if(!data.queue)data.queue=data.pending?[data.pending]:[];
    return data;
  }
  async load():Promise<{state:T;revision:number;pending:boolean}|null>{
    const cached=await this.cached();
    this.knownState=cached?snapshot(cached.state):undefined;
    // Never overwrite unsent progress by loading an older cloud snapshot.
    if(cached?.queue?.length){this.revision=cached.revision;return {...cached,pending:true};}
    let saved:ChildSave<T>|null;
    try{if(offline())throw Error('offline');saved=await this.cloud.load<T>(this.childId);}
    catch(e){if(cached&&transportFailure(e)){this.revision=cached.revision;return {...cached,pending:false};}throw e;}
    if(!saved){this.revision=cached?.revision??0;return cached?{...cached,pending:false}:null;}
    if(saved.familyId!==this.familyId||saved.childId!==this.childId)throw Error('save_owner_mismatch');
    await this.local.setItem(this.key,JSON.stringify({schema:2,revision:saved.revision,state:saved.state}));
    this.revision=saved.revision;this.knownState=snapshot(saved.state);
    return {state:saved.state,revision:saved.revision,pending:false};
  }
  async save(state:T,events:FamilyEvent[]=[]):Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{
      const previous=await this.cached();
      if(previous&&this.knownState!==undefined&&snapshot(previous.state)!==this.knownState)throw Error('revision_conflict');
      const queue=previous?.queue??[];
      // Reads/migrations that change nothing must not create a stale outgoing write.
      if(previous&&snapshot(previous.state)===snapshot(state)&&!events.length){
        if(queue.length&&!offline()){try{await this.flush(previous);this.knownState=snapshot((await this.cached())?.state);}catch(e){if(!transportFailure(e))throw e;this.retryAfter=Date.now()+30000;}}
        return;
      }
      const pending:Pending<T>={operationId:this.newId(),expectedRevision:(previous?.revision??this.revision??0)+queue.length,state,events,baseState:previous?.state};
      const next:Cached<T>={schema:2,revision:previous?.revision??this.revision??0,state,pending:queue[0]??pending,queue:[...queue,pending]};
      await this.local.setItem(this.key,JSON.stringify(next));
      this.knownState=snapshot(state);
      try{if(!offline()&&Date.now()>=this.retryAfter){await this.flush(next);this.knownState=snapshot((await this.cached())?.state);}}catch(e){if(!transportFailure(e))throw e;this.retryAfter=Date.now()+30000;}
    }finally{this.busy=false;}
  }
  async retry():Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{const cached=await this.cached();if(cached?.queue?.length&&!offline())await this.flush(cached);}finally{this.busy=false;}
  }
  /** Explicit user-selected conflict resolution. Never writes the server or loses the pending snapshot. */
  async useCloud():Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{
      const cached=await this.cached();
      const saved=await this.cloud.load<T>(this.childId);
      if(!saved)throw Error('cloud_save_missing');
      if(saved.familyId!==this.familyId||saved.childId!==this.childId)throw Error('save_owner_mismatch');
      if(!Number.isSafeInteger(saved.revision)||saved.revision<0||!saved.state)throw Error('invalid_cloud_save');
      if(cached?.pending)await this.local.setItem(`${this.key}::conflict-backup::${cached.pending.operationId}`,JSON.stringify(cached));
      await this.local.setItem(this.key,JSON.stringify({schema:2,revision:saved.revision,state:saved.state}));
      this.revision=saved.revision;this.knownState=snapshot(saved.state);
    }finally{this.busy=false;}
  }
  async localState(){return (await this.cached())?.state??null;}
  async hasPending(){return !!(await this.cached())?.queue?.length;}
  private async flush(cached:Cached<T>):Promise<void>{
    let queue=[...(cached.queue??[])];
    let recovered=false;
    while(queue.length){
      const p=queue[0];
      let result:{revision:number;duplicate:boolean};
      try{result=await this.cloud.save({childId:this.childId,...p});}
      catch(error){
        const message=String((error as any)?.message??error);
        if(recovered||!/revision_conflict/.test(message))throw error;
        const remote=await this.cloud.load<T>(this.childId);
        if(!remote)throw error;
        if(remote.familyId!==this.familyId||remote.childId!==this.childId)throw Error('save_owner_mismatch');
        if(!Number.isSafeInteger(remote.revision)||remote.revision<cached.revision||!remote.state)throw Error('invalid_cloud_save');
        const equal=(a:unknown,b:unknown)=>snapshot(a)===snapshot(b);
        const noEvents=queue.every(op=>!op.events.length);
        // Legacy queues lack baseState: only an exact cloud match proves them redundant.
        const redundant=noEvents&&(equal(cached.state,remote.state)||queue.every(op=>op.baseState!==undefined&&equal(op.baseState,op.state)));
        if(redundant){
          await this.local.setItem(`${this.key}::conflict-backup::${p.operationId}`,JSON.stringify(cached));
          await this.local.setItem(this.key,JSON.stringify({schema:2,revision:remote.revision,state:remote.state,queue:[]}));
          this.revision=remote.revision;return;
        }
        // Rebase only if the entire base snapshot still equals cloud. Never merge points,
        // timers or completed work by guessing; preserve the original operation IDs.
        if(p.baseState===undefined||!equal(p.baseState,remote.state))throw error;
        queue=queue.map((op,index)=>({...op,expectedRevision:remote.revision+index}));
        cached={...cached,revision:remote.revision,queue,pending:queue[0]};
        await this.local.setItem(this.key,JSON.stringify(cached));
        recovered=true;continue;
      }
      if(result.revision!==p.expectedRevision+1)throw Error('unexpected_revision');
      queue.shift();
      // A lost acknowledgement retries the original operation ID, never a new award.
      await this.local.setItem(this.key,JSON.stringify({schema:2,revision:result.revision,state:cached.state,queue,pending:queue[0]}));
      this.revision=result.revision;
    }
  }
}
