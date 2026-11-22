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
await p.goto(base+'/guardian-home/complete-home/index.html?companions=pip&companion=pip');await p.waitForFunction(()=>window.guardianToyState&&window.guardianFace?.ready);
await p.waitForTimeout(400);
await p.locator('.prop-turn').scrollIntoViewIfNeeded();let b=await p.locator('.prop-turn').boundingBox();const scroll=await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY}));
await touch(b.x+b.width/2,b.y+b.height/2);let r=await p.locator('.pet').boundingBox();await move(r.x+r.width*.5,r.y+r.height*.45);await p.waitForTimeout(1300);assert.equal(await p.evaluate(()=>guardianToyState().mode),'feather');assert(await p.evaluate(()=>guardianToyState().tickled)>0,'feather contact response');assert.deepEqual(await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY})),scroll);await end();await p.waitForTimeout(850);assert.equal(await p.evaluate(()=>guardianToyState().mode),'');
await p.locator('.prop-stretch').scrollIntoViewIfNeeded();b=await p.locator('.prop-stretch').boundingBox();await touch(b.x+b.width/2,b.y+b.height/2);await p.waitForTimeout(1700);assert(await p.evaluate(()=>guardianToyState().bubbles)>0);await end();assert.equal(await p.evaluate(()=>guardianToyState().held),false);
const originalBubbles=await p.locator('.soap-bubble').count();
await p.evaluate(()=>{window.retainedBubbles=[...document.querySelectorAll('.soap-bubble')];});
for(let i=0;i<5;i++){await touch(b.x+b.width/2,b.y+b.height/2);await end();}
assert(await p.evaluate(()=>retainedBubbles.some(b=>b.isConnected)),'repeated presses retain existing bubbles');
assert(await p.locator('.soap-bubble').count()>originalBubbles+8,'quick taps accumulate bubbles');
await p.locator('.soap-bubble').first().click({force:true});assert(await p.evaluate(()=>guardianToyState().pops)>0);await p.screenshot({path:'/tmp/new-toys.png'});
await p.locator('[data-room="1"]').click();assert.deepEqual(await p.evaluate(()=>({mode:guardianToyState().mode,bubbles:guardianToyState().bubbles})),{mode:'',bubbles:0});
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(400);b=await p.locator('.prop-stretch').boundingBox();await touch(b.x+b.width/2,b.y+b.height/2);await p.waitForTimeout(1000);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await p.evaluate(()=>guardianToyState().mode),'');
await p.locator('.prop-stretch').press('Enter');await p.waitForTimeout(3000);assert(await p.evaluate(()=>guardianToyState().petPops)>0,'pet pops reachable bubbles');await p.locator('.prop-jump').click();assert.equal(await p.evaluate(()=>guardianToyState().bubbles),0);
await p.evaluate(()=>resetPet());
await p.clock.install();
for(let i=0;i<15;i++)await p.locator('.prop-stretch').press('Enter');
// Retain an off-centre bubble to distinguish natural expiry from pet contact.
await p.evaluate(()=>{window.expiryBubble=document.querySelector('.soap-bubble');});
await p.clock.runFor(9000);
assert(await p.locator('.soap-bubble').count()>0,'un-popped bubbles remain before 10 seconds');
await p.clock.runFor(1100);
assert.equal(await p.locator('.soap-bubble').count(),0,'bubbles expire by 10 seconds');
assert.deepEqual(errors,[]);console.log('PASS feather touch/contact/release, scroll isolation, held bubbles, child and pet pops, room/cancel/toy cleanup, keyboard');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
