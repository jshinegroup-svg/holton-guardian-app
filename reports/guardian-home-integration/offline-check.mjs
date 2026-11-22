import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.mp3':'audio/mpeg'})[ext]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome'});
try {
 const c=await browser.newContext(),p=await c.newPage();
 const home='/guardian-home/complete-home/index.html?v=offline-test';await p.goto(base+home);await p.waitForFunction(()=>window.guardianFace?.ready);
 const assets=(await readdir('dist/guardian-home',{recursive:true})).filter(x=>/\.(js|css|html|png|mp3)$/.test(x)).map(x=>'/guardian-home/'+x);
 await p.evaluate(async assets=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;const cache=await caches.open('holton-public-fixture');await cache.addAll(assets);await cache.put('/index.html',new Response('WRONG MAIN APP'));const meta=await caches.open('holton-offline-meta');await meta.put('/active',new Response('fixture'));},assets);
 await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await c.setOffline(true);await p.reload();await p.waitForFunction(()=>window.guardianFace?.ready);
 assert.match(await p.locator('body').innerText(),/長按麥克風錄音/);assert.equal(await p.locator('#voice').count(),1);console.log('PASS offline playhouse HTML and assets, no recursive main app');await c.close();
}finally{await browser.close();server.close();}
