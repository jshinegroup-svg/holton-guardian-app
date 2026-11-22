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
for(const [width,height] of [[390,844],[844,390]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(300);await p.evaluate(()=>resetPet());
 await p.locator('.prop-stretch').scrollIntoViewIfNeeded();
 const room=await p.locator('.room-viewport').boundingBox(),b=await p.locator('.prop-stretch').boundingBox();
 const target={x:room.x+room.width*.5,y:room.y+room.height*.4};
 const scroll=await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY}));
 await touch(b.x+b.width/2,b.y+b.height/2);await move(target.x,target.y);await end();
 let state=await p.evaluate(()=>guardianToyState());assert(state.emitter&&!state.held,'release leaves active emitter');
 assert.equal(await p.locator('.bubble-wand').count(),1);
 assert.deepEqual(await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY})),scroll,'wand drag must not pan');
 const n=state.bubbles;await p.waitForTimeout(1100);assert((await p.evaluate(()=>guardianToyState().bubbles))>n,'keeps blowing after release');
 const emission=await p.evaluate(()=>{const s=document.querySelector('.stage').getBoundingClientRect(),w=document.querySelector('.bubble-wand').getBoundingClientRect(),q=[...document.querySelectorAll('.soap-bubble')].at(-1).getBoundingClientRect();return Math.abs(q.x+q.width/2-(w.x+w.width/2))<60;});assert(emission,'new bubble originates at wand, not pet');
 let w=await p.locator('.bubble-wand').boundingBox();await touch(w.x+w.width/2,w.y+w.height/2);
 for(let i=0;i<=24;i++){const angle=i/24*Math.PI*2;await move(target.x+Math.cos(angle)*70,target.y+Math.sin(angle)*35);}
 await end();assert.equal(await p.locator('.bubble-wand').count(),1,'drag existing wand never duplicates');
 assert(await p.evaluate(()=>guardianToyState().bubbles)>15,'drawing leaves a bubble trail');
 await p.screenshot({path:`/tmp/bubble-wand-${width}.png`});
 await p.locator('.prop-stretch').click();assert.equal((await p.evaluate(()=>guardianToyState())).emitter,null,'dock recalls emitter');assert.equal(await p.locator('.bubble-wand').count(),0);
 const remaining=await p.locator('.soap-bubble').count();assert(remaining>0,'recall preserves existing bubbles');await p.waitForTimeout(600);assert(await p.locator('.soap-bubble').count()<=remaining,'recall stops generation');
 await p.evaluate(()=>resetPet());
 // Keep moving for a dense trail beyond the previous 90-bubble ceiling.
 await touch(b.x+b.width/2,b.y+b.height/2);
 for(let i=0;i<160;i++){await move(target.x+(i%2?65:-65),target.y);await p.waitForTimeout(12);}
 assert(await p.evaluate(()=>guardianToyState().bubbles)>90,'dense drawing exceeds old cap');
 const oldFirst=await p.locator('.soap-bubble').first().elementHandle();
 for(let i=0;i<60;i++)await move(target.x+(i%2?65:-65),target.y);
 assert(await p.locator('.soap-bubble').count()<=360,'bounded population');
 assert(!(await oldFirst.evaluate(el=>el.isConnected)),'at capacity new bubbles replace oldest, never freeze');
 await end();await p.waitForTimeout(2200);assert(await p.locator('.bubble-wand').count()===1,'not recalled early');
 await p.waitForTimeout(1000);assert.equal(await p.locator('.bubble-wand').count(),0,'3 seconds idle recalls wand');
 assert(await p.locator('.soap-bubble').count()>0,'auto recall preserves bubbles');
 await p.waitForTimeout(10000);assert.equal(await p.locator('.soap-bubble').count(),0,'bubbles expire after recall');
 await p.evaluate(()=>resetPet());
 // Re-deploy then change toy/room; neither leaves an emitter running.
 await touch(b.x+b.width/2,b.y+b.height/2);await move(target.x,target.y);await end();
 await p.locator('.prop-jump').click();assert.equal((await p.evaluate(()=>guardianToyState())).emitter,null);
 await p.evaluate(()=>resetPet());await touch(b.x+b.width/2,b.y+b.height/2);await move(target.x,target.y);await end();
 await p.locator('[data-room="1"]').click();assert.equal(await p.locator('.bubble-wand').count(),0);assert.equal(await p.locator('.soap-bubble').count(),0);
 await p.evaluate(()=>resetPet());await touch(b.x+b.width/2,b.y+b.height/2);await move(target.x,target.y);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal((await p.evaluate(()=>guardianToyState())).emitter,null,'cancel clears placement');
 await touch(b.x+b.width/2,b.y+b.height/2);await move(target.x,target.y);await end();
 await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await p.locator('.bubble-wand').count(),0,'background cleanup');
 console.log('PASS draggable wand',width,'place, continuous emission, source position, shape trail, recall, cleanup');
}
assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
