import {webkit,chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');
const server=createTrialServer({root:'dist',password,secure:false});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
try{for(const engine of (process.env.TEST_WEBKIT==='1'?[chromium,webkit]:[chromium])){
 const browser=await engine.launch(engine===chromium?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await context.request.post(base+'/trial/login',{form:{password}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.evaluate(()=>{localStorage.setItem('holton-guardian-app::light-v1',JSON.stringify({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true,focusMusicEnabled:true}));localStorage.setItem('holton-guardian-app::spotlight-v1',JSON.stringify({main:true,companions:true,wishes:true,parent:true}));});
 await page.reload();
 const pin=String(randomInt(100000,999999));
 await page.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await page.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);
 await page.getByRole('button',{name:'繼續設定',exact:true}).tap();await page.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).tap();
 await page.getByRole('button',{name:'家長小屋',exact:true}).tap();
 await page.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await page.getByRole('button',{name:'確認',exact:true}).tap();
 await page.getByRole('button',{name:'音樂',exact:true}).tap();await page.getByRole('button',{name:'專注音樂',exact:true}).tap();await page.getByRole('button',{name:'展開靜心鋼琴',exact:true}).tap();
 await page.getByRole('button',{name:'試聽靜心鋼琴',exact:true}).tap();
 await page.waitForTimeout(6000);
 const state=await page.evaluate(()=>{const a=document.querySelector('[data-testid="focus-music-player"]');return {button:!!document.querySelector('[aria-label="停止試聽"]'),time:a?.currentTime,paused:a?.paused,error:a?.error?.code,ready:a?.readyState,src:a?.currentSrc,retry:document.body.innerText.includes('暫時未能播放')}});
 console.log(engine.name(),JSON.stringify(state),'errors',JSON.stringify(errors));
 assert(state.button&&state.time>.1&&!state.paused);
 await page.getByRole('button',{name:'停止試聽',exact:true}).tap();
 assert(await page.evaluate(()=>document.querySelector('[data-testid="focus-music-player"]').paused));
 }finally{await browser.close()}
}}finally{await new Promise(r=>server.close(r));}
