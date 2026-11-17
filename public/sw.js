/* Only public application resources enter CacheStorage. Family/photos stay account-scoped. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let preparing;
self.addEventListener('message',event=>{
 if(event.data?.type!=='PREPARE')return;
 const port=event.ports[0];
 if(preparing){port.postMessage({error:'另一個分頁正在下載，請稍後重試。'});return;}
 event.waitUntil((async()=>{
  try{
   preparing=true;
   const manifest=self.__OFFLINE_MANIFEST;
   if(!manifest?.hashes)throw Error('offline_manifest_not_built');
   const oldMeta=await caches.open('holton-offline-meta');
   const oldRecord=await oldMeta.match('/manifest');const old=oldRecord?await oldRecord.json():null;
   const oldCache=old?await caches.open('holton-public-'+old.version):null;
   const cache=await caches.open('holton-public-'+manifest.version);
   let completed=0;
   for(let offset=0;offset<manifest.assets.length;offset+=6){
    await Promise.all(manifest.assets.slice(offset,offset+6).map(async path=>{
     if(!await cache.match(path)){const reused=oldCache&&old.hashes?.[path]&&old.hashes[path]===manifest.hashes?.[path]?await oldCache.match(path):null;const r=reused||await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('asset_download_failed');
     const bytes=await r.clone().arrayBuffer();
     const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
     // The CDN optimizes raster images, so encoded bytes may differ from the build.
     // Require real image signatures; executable/page assets must match exactly.
     const b=new Uint8Array(bytes),raster=/\.(png|jpe?g|webp|gif|ico)$/.test(path);
     const imageBytes=(b[0]===255&&b[1]===216&&b[2]===255)||(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71)||(b[0]===71&&b[1]===73&&b[2]===70)||(b[0]===82&&b[1]===73&&b[2]===70&&b[3]===70&&b[8]===87&&b[9]===69&&b[10]===66&&b[11]===80)||(b[0]===0&&b[1]===0&&b[2]===1&&b[3]===0);
     if(raster?!imageBytes:digest!==manifest.hashes[path])throw Error('素材版本更新中，將自動重試。');
     await cache.put(path,r);}
     completed++;port.postMessage({completed,total:manifest.assets.length});
    }));
   }
   const meta=await caches.open('holton-offline-meta');await meta.put('/active',new Response(manifest.version));await meta.put('/manifest',new Response(JSON.stringify(manifest)));
   port.postMessage({done:true,version:manifest.version});
  }catch(e){port.postMessage({error:String(e.message||e)});}finally{preparing=false;}
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.searchParams.has('code')||url.searchParams.has('auth')||url.pathname.startsWith('/api/'))return;
 event.respondWith((async()=>{
  const meta=await caches.open('holton-offline-meta');const marker=await meta.match('/active');
  if(!marker)return fetch(request);
  const cache=await caches.open('holton-public-'+await marker.text());
  const navigation=request.mode==='navigate';
  const saved=await cache.match(navigation?'/index.html':url.pathname);
  if(navigation){try{return await fetch(request,{signal:AbortSignal.timeout(4000)});}catch{if(saved)return saved;throw Error('offline_not_prepared');}}
  if(!saved)return fetch(request);
  // iOS audio probes ranges even for downloaded media.
  const range=request.headers.get('range');
  if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(match){const bytes=await saved.arrayBuffer(),start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
   if(start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
   return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':saved.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
  }}
  return saved;
 })());
});
