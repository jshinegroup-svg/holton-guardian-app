import type {ChildSave, FamilyEvent} from './types';
import {childStorageKey} from './types';

export interface FamilyCloud {
  load<T>(childId:string):Promise<ChildSave<T>|null>;
  save<T>(args:{childId:string;expectedRevision:number;operationId:string;state:T;events:FamilyEvent[]}):Promise<{revision:number;duplicate:boolean}>;
}
export interface LocalStore {getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
type Pending<T>={operationId:string;expectedRevision:number;state:T;events:FamilyEvent[]};
type Cached<T>={schema:2;revision:number;state:T;pending?:Pending<T>};
/** One instance per child. Local pending writes survive a failed request/reload.
 * Conflicts must be surfaced; never substitute the newest server revision and retry old state.
 */
export class ProgressRepository<T> {
  private key:string;
  private busy=false;
  constructor(private familyId:string,private childId:string,private local:LocalStore,private cloud:FamilyCloud,private newId:()=>string){
    this.key=childStorageKey(familyId,childId);
  }
  private async cached():Promise<Cached<T>|null>{
    const raw=await this.local.getItem(this.key);
    if(!raw)return null;
    const data=JSON.parse(raw) as Cached<T>;
    if(data.schema!==2||!Number.isSafeInteger(data.revision)||data.revision<0||!data.state)throw Error('invalid_local_save');
    return data;
  }
  async load():Promise<{state:T;revision:number;pending:boolean}|null>{
    const cached=await this.cached();
    // Never overwrite unsent progress by loading an older cloud snapshot.
    if(cached?.pending)return {...cached,pending:true};
    const saved=await this.cloud.load<T>(this.childId);
    if(!saved)return cached?{...cached,pending:false}:null;
    if(saved.familyId!==this.familyId||saved.childId!==this.childId)throw Error('save_owner_mismatch');
    await this.local.setItem(this.key,JSON.stringify({schema:2,revision:saved.revision,state:saved.state}));
    return {state:saved.state,revision:saved.revision,pending:false};
  }
  async save(state:T,events:FamilyEvent[]=[]):Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{
      const previous=await this.cached();
      if(previous?.pending)throw Error('pending_save_requires_retry');
      const pending:Pending<T>={operationId:this.newId(),expectedRevision:previous?.revision??0,state,events};
      const next:Cached<T>={schema:2,revision:pending.expectedRevision,state,pending};
      await this.local.setItem(this.key,JSON.stringify(next));
      await this.flush(next);
    }finally{this.busy=false;}
  }
  async retry():Promise<void>{
    if(this.busy)throw Error('save_in_progress');
    this.busy=true;
    try{const cached=await this.cached();if(cached?.pending)await this.flush(cached);}finally{this.busy=false;}
  }
  private async flush(cached:Cached<T>):Promise<void>{
    const p=cached.pending!;
    const result=await this.cloud.save({childId:this.childId,...p});
    if(result.revision!==p.expectedRevision+1)throw Error('unexpected_revision');
    await this.local.setItem(this.key,JSON.stringify({schema:2,revision:result.revision,state:p.state}));
  }
}
