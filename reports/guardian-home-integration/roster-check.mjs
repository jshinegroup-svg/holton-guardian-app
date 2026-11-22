import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+pathname);if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.mp3'?'audio/mpeg':ext==='.m4a'?'audio/mp4':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const context=await browser.newContext({viewport:{width:Number(process.env.TEST_WIDTH||390),height:844},hasTouch:true,isMobile:true,permissions:['microphone']});
const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
const cdp=await context.newCDPSession(p);
async function touch(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});}
async function move(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});}
async function end(){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
try{
 for(const [query,id,enabled] of [['','stoneback',1],['?companions=pip&companion=hop','pip',1],['?companions=pip,tidefin&companion=tidefin','tidefin',2],['?companions=pip,hop,bomo,stoneback,tidefin,emberwing,steel-eagle,bramblefang&companion=bomo','bomo',8]]){
  await p.goto(base+'/guardian-home/complete-home/index.html'+query);await p.waitForFunction(()=>window.guardianFace?.ready);assert.equal(await p.locator('#home-companion').getAttribute('data-companion'),id);await p.locator('#home-companion canvas[data-ready=true]').waitFor();
  const allowed=await p.evaluate(()=>window.guardianAllowed);
  await p.locator('#home-companion').click();
  assert.deepEqual(await p.locator('#home-roster button').evaluateAll(options=>options.map(o=>o.dataset.companion).sort()),[...allowed].sort());
  await p.waitForFunction(()=>[...document.querySelectorAll('#home-roster canvas')].every(c=>c.dataset.ready==='true'));
  await p.screenshot({path:'/tmp/guardian-picture-picker-'+enabled+'.png'});
  assert.equal(await p.locator('#home-roster button').count(),enabled);
  assert.equal(await p.locator('#home-roster button:disabled').count(),0);
  assert.equal(await p.locator('#home-roster').innerText().then(t=>t.includes('尚未取得')),false);
  await p.locator('#home-roster button').last().scrollIntoViewIfNeeded();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(enabled>1){await p.locator('#home-roster button').filter({hasText:'Pip'}).click();await p.waitForFunction(()=>window.guardianRoster?.id==='pip');assert.equal(await p.locator('#home-companion').getAttribute('data-companion'),'pip');}
 }
 assert.deepEqual(errors,[]);console.log('PASS legacy entry, owned-only fallback, explicit full roster');
}finally{await browser.close();await new Promise(r=>server.close(r));}
