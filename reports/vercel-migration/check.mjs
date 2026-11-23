import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const hits=[];
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;hits.push(pathname);const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep))return res.writeHead(403).end();const data=await readFile(file);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome'});
try{
 const context=await browser.newContext();const p=await context.newPage();
 await p.goto(`http://127.0.0.1:${server.address().port}/`);
 await p.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});
 await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const manifest=JSON.parse(await readFile('dist/offline-manifest.json','utf8'));
 assert(!manifest.assets.some(x=>x.startsWith('/music/')));assert.equal(Object.keys(manifest.musicHashes).length,40);
 await p.evaluate(()=>new Promise((resolve,reject)=>{const c=new MessageChannel();c.port1.onmessage=({data})=>{if(data.done)resolve(true);if(data.error)reject(Error(data.error));};navigator.serviceWorker.controller.postMessage({type:'PREPARE'},[c.port2]);}));
 assert.equal(hits.filter(x=>x.startsWith('/music/')).length,0);
 const song=Object.keys(manifest.musicHashes)[0];
 const probe=()=>p.evaluate(async song=>{const r=await fetch(song,{headers:{Range:'bytes=0-99'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength,range:r.headers.get('content-range')};},song);
 const a=await probe();assert.equal(a.status,206);assert.equal(a.size,100);
 await probe();assert.equal(hits.filter(x=>x===song).length,1);
 await context.setOffline(true);assert.deepEqual(await probe(),a);
 const suffix=await p.evaluate(async song=>{const r=await fetch(song,{headers:{Range:'bytes=-50'}});return [r.status,(await r.arrayBuffer()).byteLength];},song);assert.deepEqual(suffix,[206,50]);
 console.log('PASS: PREPARE downloads no music; 40 songs retained; selected song fetched once; repeat/offline/iOS range and suffix reuse cached bytes.');
 await context.close();
}finally{await browser.close();server.close();}
