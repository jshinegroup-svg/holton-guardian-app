import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+pathname);if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.mp3'?'audio/mpeg':ext==='.m4a'?'audio/mp4':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const context=await browser.newContext({viewport:{width:Number(process.env.TEST_WIDTH||390),height:Number(process.env.TEST_HEIGHT||844)},hasTouch:true,isMobile:true,permissions:['microphone']});
const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
const cdp=await context.newCDPSession(p);
async function touch(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});}
async function move(x,y){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});}
async function end(){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
try{
 for(const id of (process.env.TEST_COMPANIONS||'pip,stoneback').split(',')){
  await p.goto(base+'/guardian-home/complete-home/index.html?companions='+id+'&companion='+id);await p.waitForFunction(()=>window.guardianFace?.ready);
  await p.evaluate(()=>{window.renderProbe={changes:0,blank:0,observations:0};const c=document.querySelector('.guardian-sprite canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');window.probeObserver=new ResizeObserver(()=>{renderProbe.observations++;const px=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,px);let alpha=0;for(let i=3;i<px.length;i+=4)alpha+=px[i];if(!alpha)renderProbe.blank++;});probeObserver.observe(c.parentElement);window.probeMutation=new MutationObserver(r=>renderProbe.changes+=r.length);probeMutation.observe(c,{attributes:true,attributeFilter:['width','height']});});
  await p.locator('.ball').click();await p.waitForTimeout(6500);
  const result=await p.evaluate(()=>({...renderProbe,contacts:guardianBallState().contacts}));console.log(id,JSON.stringify(result));
  if(process.env.EXPECT_STABLE){assert.equal(result.blank,0,'canvas must retain pixels during layout resize');assert(result.contacts>0);}
  await p.evaluate(()=>{probeObserver.disconnect();probeMutation.disconnect();resetPet()});
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
