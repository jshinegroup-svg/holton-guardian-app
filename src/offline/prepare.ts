export async function prepareAssets(progress:(message:string)=>void){
 if(!('serviceWorker' in navigator))throw Error('此瀏覽器不支援離線下載，請使用 Safari 或 Chrome。');
 await navigator.serviceWorker.register('/sw.js');
 const registration=await navigator.serviceWorker.ready;
 const worker=registration.active;if(!worker)throw Error('offline_worker_not_ready');
 await navigator.storage?.persist?.();
 return new Promise<void>((resolve,reject)=>{
  const channel=new MessageChannel();let timer:ReturnType<typeof setTimeout>;
  const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{channel.port1.close();reject(Error('下載逾時，請保持網路後重試。'));},60000);};reset();
  channel.port1.onmessage=({data})=>{reset();if(data.error||data.done){clearTimeout(timer);channel.port1.close();if(data.error)reject(Error(data.error));else resolve();}else progress(`下載離線素材 ${data.completed}/${data.total}`);};
  worker.postMessage({type:'PREPARE'},[channel.port2]);
 });
}
