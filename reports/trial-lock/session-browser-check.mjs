import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes} from 'node:crypto';
import http from 'node:http';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');let server,port=0;
async function start(){server=createTrialServer({root:'dist',password,secure:false});await new Promise(r=>server.listen(port,'127.0.0.1',r));port=server.address().port;}
await start();const base=`http://127.0.0.1:${port}`;
const external=http.createServer((req,res)=>res.end(`<a href="${base}">Open game</a>`));await new Promise(r=>external.listen(0,r));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 let context=await browser.newContext();await context.request.post(base+'/trial/login',{form:{password}});
 const state=await context.storageState();assert(state.cookies.some(c=>c.name==='holton_trial'&&c.expires>Date.now()/1000+6*86400));await context.close();
 await new Promise(r=>server.close(r));await start();
 context=await browser.newContext({storageState:state});const page=await context.newPage();
 for(let i=0;i<2;i++){
 await page.goto(`http://localhost:${external.address().port}`);
 const response=page.waitForResponse(r=>r.url()===base+'/');await page.getByRole('link',{name:'Open game'}).click();assert.equal((await response).status(),200);
 assert.equal(await page.locator('form[action="/trial/login"]').count(),0);
 }
 console.log('PASS browser persistent-cookie restore, server restart and repeated cross-site link navigation without login');
}finally{await browser.close();await new Promise(r=>server.close(r));await new Promise(r=>external.close(r));}
