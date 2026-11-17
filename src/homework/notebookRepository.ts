import {offline,transportFailure} from '../family/connectivity';
// Photos never enter game-state JSON or reward transactions.
type Local={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export type NotebookCloud={read:(date:string)=>Promise<string|null>;write:(date:string,value:string,replace:boolean)=>Promise<void>};
type Pending={value:string;base:string|null};
export class NotebookRepository {
 constructor(private local:Local,private cloud:NotebookCloud){}
 private async pending():Promise<Record<string,Pending>>{return JSON.parse(await this.local.getItem('notebook-outbox')??'{}');}
 async read(date:string,strict=false){
  const pending=await this.pending();if(pending[date])return pending[date].value;
  const legacy=await this.local.getItem(`homework-photo:${date}`);
  try{
   if(offline())return legacy;
   const remote=await this.cloud.read(date);
   if(remote){await this.local.setItem(`homework-photo:${date}`,remote);return remote;}
   if(!legacy)return null;
   await this.cloud.write(date,legacy,false);
   const migrated=await this.cloud.read(date);if(migrated)await this.local.setItem(`homework-photo:${date}`,migrated);return migrated;
  }catch(e){if(!strict&&transportFailure(e))return legacy;throw e;}
 }
 async write(date:string,value:string){
  const all=await this.pending();
  const base=all[date]?.base??await this.local.getItem(`homework-photo:${date}`);
  // Durable intent first. Quota failure must not pretend the attachment was saved.
  all[date]={value,base};await this.local.setItem('notebook-outbox',JSON.stringify(all));
  await this.local.setItem(`homework-photo:${date}`,value);
  try{if(!offline())await this.flush();}catch(e){if(!transportFailure(e))throw e;}
 }
 async hasPending(){return Object.keys(await this.pending()).length>0;}
 async flush(){
  if(offline())return;
  const all=await this.pending();
  for(const [date,p] of Object.entries(all)){
   const remote=await this.cloud.read(date);
   // Never replace a photo changed on another device during an offline session.
   if(remote!==p.value&&remote!==p.base)throw Error('notebook_revision_conflict');
   if(remote!==p.value)await this.cloud.write(date,p.value,true);
   delete all[date];await this.local.setItem('notebook-outbox',JSON.stringify(all));
  }
 }
}
