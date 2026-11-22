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
for(const [width,height] of [[320,740],[390,844],[844,390],[1024,768]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(200);
 assert.equal(await p.locator('.landscape-hint').isVisible(),height>width);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal page overflow');
 await p.getByRole('button',{name:'小屋玩法指南',exact:true}).click();
 assert(await p.locator('#panel').evaluate(el=>el.open));
 const text=await p.locator('.home-guide').innerText();for(const phrase of ['3 秒','10 秒','9 秒','不是 AI','泡泡棒','梳毛','玩球'])assert(text.includes(phrase));
 await p.locator('.home-guide li').last().scrollIntoViewIfNeeded();assert(await p.locator('.home-guide li').last().isVisible());
 await p.locator('#panel').evaluate(el=>el.scrollTop=0);await p.getByRole('button',{name:'關閉',exact:true}).click();
 assert(!(await p.locator('#panel').evaluate(el=>el.open)));
 await p.screenshot({path:`/tmp/home-guide-${width}.png`});
 await p.locator('.prop-stretch').click();assert(await p.evaluate(()=>guardianToyState().bubbles)>0,'play remains usable after guide');await p.evaluate(()=>resetPet());
 console.log('PASS home guide',width,'orientation, open/close, content, scroll, gameplay');
}
assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
