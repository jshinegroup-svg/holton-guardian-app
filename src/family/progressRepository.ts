import {offline,transportFailure} from './connectivity';
import type {ChildSave, FamilyEvent} from './types';
import {childStorageKey} from './types';

export interface FamilyCloud {
  load<T>(childId:string):Promise<ChildSave<T>|null>;
  save<T>(args:{childId:string;expectedRevision:number;operationId:string;state:T;events:FamilyEvent[]}):Promise<{revision:number;duplicate:boolean}>;
}
export interface LocalStore {getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
type Pending<T>={operationId:string;expectedRevision:number;state:T;events:FamilyEvent[]};
type Cached<T>={schema:2;revision:number;state:T;pending?:Pending<T>;queue?:Pending<T>[]};
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
    this.knownState=cached?JSON.stringify(cached.state):undefined;
    // Never overwrite unsent progress by loading an older cloud snapshot.
    if(cached?.queue?.length){this.revision=cached.revision;return {...cached,pending:true};}
    let saved:ChildSave<T>|null;
    try{if(offline())throw Error('offline');saved=await this.cloud.load<T>(this.childId);}
    catch(e){if(cached&&transportFailure(e)){this.revision=cached.revision;return {...cached,pending:false};}throw e;}
    if(!saved){this.revision=cached?.revision??0;return cached?{...cached,pending:false}:null;}
    if(saved.familyId!==this.familyId||saved.childId!==this.childId)throw Error('save_owner_mismatch');
    await this.local.setItem(this.key,JSON.stringify({schema:2,revision:saved.revision,state:saved.state}));
    this.revision=saved.revision;this.knownState=JSON.stringify(saved.state);
    return {state:saved.state,revision:saved.revision,pending:false};
  }
  async save(state:T,events:FamilyEvent[]=[]):Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{
      const previous=await this.cached();
      if(previous&&this.knownState!==undefined&&JSON.stringify(previous.state)!==this.knownState)throw Error('revision_conflict');
      const queue=previous?.queue??[];
      const pending:Pending<T>={operationId:this.newId(),expectedRevision:(previous?.revision??this.revision??0)+queue.length,state,events};
      const next:Cached<T>={schema:2,revision:previous?.revision??this.revision??0,state,pending:queue[0]??pending,queue:[...queue,pending]};
      await this.local.setItem(this.key,JSON.stringify(next));
      this.knownState=JSON.stringify(state);
      try{if(!offline()&&Date.now()>=this.retryAfter)await this.flush(next);}catch(e){if(!transportFailure(e))throw e;this.retryAfter=Date.now()+30000;}
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
      this.revision=saved.revision;this.knownState=JSON.stringify(saved.state);
    }finally{this.busy=false;}
  }
  async localState(){return (await this.cached())?.state??null;}
  async hasPending(){return !!(await this.cached())?.queue?.length;}
  private async flush(cached:Cached<T>):Promise<void>{
    const queue=[...(cached.queue??[])];
    while(queue.length){
      const p=queue[0];
      const result=await this.cloud.save({childId:this.childId,...p});
      if(result.revision!==p.expectedRevision+1)throw Error('unexpected_revision');
      queue.shift();
      // A lost acknowledgement retries the original operation ID, never a new award.
      await this.local.setItem(this.key,JSON.stringify({schema:2,revision:result.revision,state:cached.state,queue,pending:queue[0]}));
      this.revision=result.revision;
    }
  }
}
