/** Bound hung mobile requests, including a stalled auth refresh before fetch starts.
 * A timed-out write may have committed: callers must retry the SAME operation ID. */
export async function cloudRequest<T>(request:(signal:AbortSignal)=>PromiseLike<T>,milliseconds=12000):Promise<T>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([
  Promise.resolve().then(()=>request(controller.signal)),
  new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(Error('cloud_timeout'));controller.abort();},milliseconds);}),
 ]);}finally{if(timer)clearTimeout(timer);}
}
export function syncErrorMessage(error:unknown):string {
 const message=typeof error==='object'&&error!==null&&'message' in error?String(error.message):String(error);
 return /revision_conflict|unexpected_revision/.test(message)
  ?'另一台裝置的進度已更新，為避免覆蓋，暫停同步。這台的待同步操作仍保留；請先停止在兩台同時操作同一位冒險者。'
  :'連線暫時中斷或回應太久，操作尚未確認同步。網路恢復後，點「重試同步」即可接續，不必重整或清除資料。';
}
