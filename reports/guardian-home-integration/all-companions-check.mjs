import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+pathname);if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.mp3'?'audio/mpeg':ext==='.m4a'?'audio/mp4':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,permissions:['microphone']});
const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
const cdp=await context.newCDPSession(p);
async function touch(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});}
async function move(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});}
async function end(){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
const ids=['stoneback','pip','hop','bomo','tidefin','emberwing','steel-eagle','bramblefang'];
try{
for(const id of ids){
 await p.goto(base+'/guardian-home/complete-home/index.html?companion='+id);
 await p.waitForFunction(()=>window.guardianFace?.ready);
 assert.equal(await p.locator('#home-companion').inputValue(),id);
 assert.equal(await p.locator('#home-companion option').count(),8);
 await p.screenshot({path:`reports/guardian-home-integration/companion-${id}.png`,fullPage:true});
 await p.locator('.sound').click();
 if(await p.locator('.sound').getAttribute('aria-pressed')==='false')await p.locator('.sound').click();
 await p.waitForFunction(()=>guardianHome.state().speaking);
 // An actual touch gesture feeds each species at its independently calibrated mouth.
 await p.locator('.prop-feed').scrollIntoViewIfNeeded();
 let apple=await p.locator('.prop-feed').boundingBox();await touch(apple.x+apple.width/2,apple.y+apple.height/2);await p.waitForTimeout(1400);
 let pet=await p.locator('.stage .pet').boundingBox();const mouth=await p.evaluate(()=>guardianProfile.mouth);
 await move(pet.x+pet.width*mouth[0],pet.y+pet.height*mouth[1]);
 await p.waitForFunction(()=>guardianCareState().eaten);await end();await p.waitForFunction(()=>guardianHome.state().joy);
 const brush=await p.locator('.prop-brush').boundingBox();await touch(brush.x+brush.width/2,brush.y+brush.height/2);await p.waitForTimeout(1400);pet=await p.locator('.stage .pet').boundingBox();
 for(const x of [.4,.7,.4,.7]){await move(pet.x+pet.width*x,pet.y+pet.height*.55);await p.waitForTimeout(60);}
 assert(await p.evaluate(()=>guardianCareState().strokes)>0);await end();
 await p.locator('.prop-bell').click();await p.waitForFunction(()=>guardianMusicState().called>0);
 await p.locator('[data-room="1"]').click();await p.locator('[data-room="0"]').click();
 await p.locator('.ball').click();assert(await p.evaluate(()=>guardianBallState().active));
 await p.locator('[data-room="2"]').click();
 await p.locator('.prop-dance').click();await p.waitForFunction(()=>guardianMusicState().playing);await p.locator('.prop-dance').click();
 await p.locator('#voice').scrollIntoViewIfNeeded();const mic=await p.locator('#voice').boundingBox();await touch(mic.x+mic.width/2,mic.y+mic.height/2);await p.waitForFunction(()=>guardianHoldState().recording);await p.waitForTimeout(400);await end();await p.waitForFunction(()=>guardianHoldState().playing);
 console.log('PASS',id,'render, fixed voice, touch feed/brush, bell, ball, rooms, music, hold recording');
}
await p.goto(base+'/guardian-home/complete-home/index.html?companions=pip,stoneback&companion=hop');await p.waitForFunction(()=>window.guardianFace?.ready);assert.equal(await p.locator('#home-companion').inputValue(),'pip');assert.equal(await p.locator('#home-companion option:disabled').count(),6);
await p.locator('#home-companion').selectOption('stoneback');await p.waitForFunction(()=>window.guardianProfile?.id==='stoneback'&&window.guardianFace?.ready);assert.equal(await p.locator('#home-companion option:disabled').count(),6);
assert.deepEqual(errors,[]);console.log('PASS roster ownership filtering, fallback and switching');
}finally{await browser.close();await new Promise(r=>server.close(r));}
