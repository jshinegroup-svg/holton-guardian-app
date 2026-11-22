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
 for(const [width,height] of [[390,844],[844,390],[1024,900]]){
 await p.setViewportSize({width,height});
 await p.goto(base+'/guardian-home/complete-home/index.html?companions=pip,stoneback,tidefin&companion=stoneback');await p.waitForFunction(()=>window.guardianFace?.ready&&window.guardianWideRoom);
 for(let room=0;room<3;room++){
 await p.locator(`[data-room="${room}"]`).click();await p.waitForTimeout(2000);
 await p.screenshot({path:`/tmp/wide-room-${width}-${room}.png`,fullPage:true});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no page overflow');
 const rect=await p.locator('.stage').boundingBox();assert(rect.width>=300);assert(rect.width/rect.height>1.3);
 const bg=await p.locator('.room').evaluate(e=>getComputedStyle(e).backgroundImage);assert(bg.includes('room-wide'));
 await p.getByRole('button',{name:'找夥伴',exact:true}).count();
 await p.locator('.prop-feed').scrollIntoViewIfNeeded();await p.evaluate(()=>guardianWideRoom.center());
 const a=await p.locator('.prop-feed').boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.waitForTimeout(100);
 const pet=await p.locator('.stage .pet').boundingBox(),mouth=await p.evaluate(()=>guardianProfile.mouth);await p.mouse.move(pet.x+pet.width*mouth[0],pet.y+pet.height*mouth[1]);await p.waitForFunction(()=>guardianCareState().eaten);await p.mouse.up();await p.waitForFunction(()=>guardianHome.state().joy);
 await p.locator('.prop-bell').click();await p.waitForFunction(()=>guardianMusicState().calling==='arrived');
 const inside=await p.evaluate(()=>{const a=document.querySelector('.stage').getBoundingClientRect(),b=document.querySelector('.stage .pet').getBoundingClientRect();return b.top>=a.top&&b.bottom<=a.bottom&&b.left>=a.left&&b.right<=a.right});assert(inside,'bell target inside');
 await p.locator('.ball').click();await p.waitForFunction(()=>guardianBallState().contacts>0,{},{timeout:12000});
 assert(await p.evaluate(()=>{const b=guardianBallState().ball,r=document.querySelector('.stage').getBoundingClientRect();return b.y<=r.height/r.width*.91}));
 await p.locator('.prop-dance').click();assert(await p.evaluate(()=>guardianMusicState().playing));await p.locator('.prop-dance').click();
 }
 await p.locator('#voice').scrollIntoViewIfNeeded();const m=await p.locator('#voice').boundingBox();await p.mouse.move(m.x+m.width/2,m.y+m.height/2);await p.mouse.down();await p.waitForFunction(()=>guardianHoldState().recording);await p.waitForTimeout(700);await p.mouse.up();await p.waitForFunction(()=>guardianHoldState().playing);
 console.log('PASS',width,'all three room ratios, feed, bell, ball, music, hold voice');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
