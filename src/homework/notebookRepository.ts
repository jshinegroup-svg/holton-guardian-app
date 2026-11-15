// Photos never enter the game-state JSON or its reward transactions.
type Local={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export type NotebookCloud={read:(date:string)=>Promise<string|null>;write:(date:string,value:string,replace:boolean)=>Promise<void>};
export class NotebookRepository {
 constructor(private local:Local,private cloud:NotebookCloud){}
 async read(date:string){
  const remote=await this.cloud.read(date);
  // Cloud is authoritative. Leave any different local photo intact as a fallback.
  if(remote)return remote;
  const legacy=await this.local.getItem(`homework-photo:${date}`);
  if(!legacy)return null;
  // First open on the original device migrates legacy photos, never overwriting
  // an attachment that another device uploaded between the read and insert.
  await this.cloud.write(date,legacy,false);
  return await this.cloud.read(date);
 }
 async write(date:string,value:string){
  // Retain a local fallback when possible, but local quota must not block cloud save.
  try{await this.local.setItem(`homework-photo:${date}`,value)}catch{}
  await this.cloud.write(date,value,true);
 }
}
