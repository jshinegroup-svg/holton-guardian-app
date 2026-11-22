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
await p.goto(base+'/guardian-home/complete-home/index.html?companions=pip&companion=pip');await p.waitForFunction(()=>window.guardianFace?.ready&&window.guardianWideRoom);
await p.waitForTimeout(300);
const toolBefore=await p.locator('.prop-feed').boundingBox();
const room=await p.locator('.room-viewport').boundingBox(),before=await p.evaluate(()=>guardianWideRoom.viewport.scrollLeft);
await touch(300,room.y+150);for(let x=280;x>=80;x-=20){await move(x,room.y+150);await p.waitForTimeout(20);}await end();await p.waitForTimeout(500);
assert(await p.evaluate(()=>guardianWideRoom.viewport.scrollLeft)>before+50,'horizontal room pan');
assert.deepEqual(await p.locator('.prop-feed').boundingBox(),toolBefore,'floating tools stay fixed while room pans');
assert.equal(await p.locator('.play-toolbar .room-prop').count(),8);
const rightTool=await p.locator('.prop-stretch').boundingBox();assert(rightTool.x>innerWidthFallback()-80,'right tools align with viewport edge');
function innerWidthFallback(){return Number(process.env.TEST_WIDTH||390)}
await p.getByRole('button',{name:'回到夥伴',exact:true}).click();await p.waitForTimeout(600);
const pet=await p.locator('.stage .pet').boundingBox();assert(pet.x>=0&&pet.x+pet.width<=390,'find companion recenters');
await p.locator('.prop-feed').scrollIntoViewIfNeeded();const a=await p.locator('.prop-feed').boundingBox(),scroll=await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY}));
await touch(a.x+a.width/2,a.y+a.height/2);await move(a.x+a.width/2-40,a.y+a.height/2-100);await end();
assert.deepEqual(await p.evaluate(()=>({x:guardianWideRoom.viewport.scrollLeft,y:scrollY})),scroll,'prop drag must not pan either axis');
await p.locator('.ball').click();await p.waitForFunction(()=>guardianBallState().active);await p.setViewportSize({width:844,height:390});await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>guardianBallState().active),false,'rotation cancels old-coordinate simulation');
await p.locator('[data-room="2"]').click();await p.waitForTimeout(400);await p.screenshot({path:'/tmp/wide-landscape-final.png'});
const scene=await p.locator('.stage').boundingBox(),mic=await p.locator('#voice').boundingBox();assert(scene.y>=0&&scene.y+scene.height<=390);assert(mic.y>=0&&mic.y+mic.height<=390);
for(const [width,height] of [[320,740],[390,844],[844,390],[1024,900]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(250);
 const shell=await p.locator('.room-shell').boundingBox();
 for(const b of await p.locator('.play-toolbar .room-prop').all()){
  const r=await b.boundingBox();assert(r.width>=44&&r.height>=44);
  assert(r.x>=0&&r.x+r.width<=width&&r.y>=shell.y&&r.y+r.height<=shell.y+shell.height,'tools fit room shell');
  assert(await b.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'tool can receive touch');
 }
 await p.screenshot({path:`/tmp/floating-tools-${width}.png`,fullPage:true});
}
assert.deepEqual(errors,[]);console.log('PASS horizontal pan, recenter, prop gesture isolation, orientation reset, landscape controls fit');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
