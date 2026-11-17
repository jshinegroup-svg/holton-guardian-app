let running:Promise<void>|undefined;
let checkedAt=0;
export function prepareAssets(progress:(message:string)=>void,force=false){
 if(running)return running;
 if(!force&&Date.now()-checkedAt<300000)return Promise.resolve();
 running=downloadAssets(progress).then(()=>{checkedAt=Date.now();}).finally(()=>{running=undefined;});
 return running;
}
async function downloadAssets(progress:(message:string)=>void){
 if(!('serviceWorker' in navigator))throw Error('此瀏覽器不支援離線下載，請使用 Safari 或 Chrome。');
 const registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
 await registration.update();
 const installing=registration.installing;
 if(installing&&installing.state!=='activated')await new Promise<void>((resolve,reject)=>{
  const timer=setTimeout(()=>{installing.removeEventListener('statechange',check);reject(Error('offline_worker_update_timeout'));},45000);
  const check=()=>{if(installing.state==='activated'||installing.state==='redundant'){clearTimeout(timer);installing.removeEventListener('statechange',check);installing.state==='activated'?resolve():reject(Error('offline_worker_update_failed'));}};
  installing.addEventListener('statechange',check);check();
 });
 await navigator.serviceWorker.ready;
 const worker=registration.active;if(!worker)throw Error('offline_worker_not_ready');
 await navigator.storage?.persist?.();
 return new Promise<void>((resolve,reject)=>{
  const channel=new MessageChannel();let timer:ReturnType<typeof setTimeout>;
  const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{channel.port1.close();reject(Error('下載逾時，請保持網路後重試。'));},60000);};reset();
  channel.port1.onmessage=({data})=>{reset();if(data.error||data.done){clearTimeout(timer);channel.port1.close();if(data.error)reject(Error(data.error));else resolve();}else progress(`下載離線素材 ${data.completed}/${data.total}`);};
  worker.postMessage({type:'PREPARE'},[channel.port2]);
 });
}
