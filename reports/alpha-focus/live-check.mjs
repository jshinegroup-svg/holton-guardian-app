import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'https://holton-family-v2.vercel.app';
const manifestResponse=await fetch(base+'/offline-manifest.json');
assert.equal(manifestResponse.status,200);
const manifest=await manifestResponse.json();
assert.deepEqual(manifest,JSON.parse(await readFile('dist/offline-manifest.json','utf8')));
assert.equal(Object.keys(manifest.musicHashes).length,41);
assert(!manifest.assets.some(x=>x.startsWith('/music/')));
const songs=await Promise.all(Object.keys(manifest.musicHashes).map(async song=>({song,size:(await stat('dist'+song)).size})));
songs.sort((a,b)=>a.song==='/music/alpha20.mp3'?-1:b.song==='/music/alpha20.mp3'?1:0);
for(const asset of ['/sw.js','/guardian-home/complete-home/index.html',songs[0].song]){
 const r=await fetch(base+asset);assert.equal(r.status,200,asset);
 assert.deepEqual(Buffer.from(await r.arrayBuffer()),await readFile('dist'+asset),asset);
}
const browser=await chromium.launch({channel:'chrome'});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByLabel('家長 Email',{exact:true}).waitFor();
 await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const probe=()=>page.evaluate(async song=>{const r=await fetch(song,{headers:{Range:'bytes=0-99'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength,range:r.headers.get('content-range')};},songs[0].song);
 const first=await probe();assert.equal(first.status,206);assert.equal(first.size,100);
 await context.setOffline(true);assert.deepEqual(await probe(),first);
 const suffix=await page.evaluate(async song=>{const r=await fetch(song,{headers:{Range:'bytes=-50'}});return [r.status,(await r.arrayBuffer()).byteLength];},songs[0].song);
 assert.deepEqual(suffix,[206,50]);assert.deepEqual(errors,[]);
 await page.screenshot({path:'/tmp/holton-vercel-login.png'});
 console.log('PASS hosted public login; exact deployed manifest/SW/house/song; 41 on-demand tracks; selected track range and offline replay/suffix.');
 await context.close();
}finally{await browser.close();}
