import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');const server=createTrialServer({root:'dist',password,secure:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const KEY='holton-guardian-app::light-v1',GUIDE='holton-guardian-app::spotlight-v1';
const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true,focusMusicEnabled:false};
try{for(const [width,height] of [[390,650],[320,568],[844,390],[768,1024]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});await context.request.post(base+'/trial/login',{form:{password}});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);console.log('start',width);await p.goto(base);
 await p.evaluate(({KEY,GUIDE,seed})=>{localStorage.setItem(KEY,JSON.stringify(seed));localStorage.setItem(GUIDE,JSON.stringify({main:false,companions:true,parent:true,wishes:true}));},{KEY,GUIDE,seed});await p.reload();
 const pin=String(randomInt(100000,999999));await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);await p.getByRole('button',{name:'繼續設定',exact:true}).tap();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).tap();
 const tap=async name=>{console.log('tap',name);await p.getByRole('button',{name,exact:true}).tap();};
 const step=async n=>{console.log('step',n);await p.waitForFunction(n=>document.querySelector('[data-testid="spotlight-tip"]')?.textContent.includes(`· ${n}／`),n);await p.waitForTimeout(350);};
 const state=()=>p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
 await step(1);await tap('開始任務');await step(2);await tap('上一張時間卡');await step(3);await p.locator('[data-testid="task-title-entry"]').tap();await step(4);await tap('任務類別：寫作業');await step(5);
 await p.locator('[aria-label^="摸摸"]').tap();await p.locator('[data-testid="companion-reaction-reply"]').waitFor();
 await p.screenshot({path:`reports/trial-lock/tutorial-companion-${width}.png`});
 assert(await p.evaluate(()=>{const b=document.querySelector('[data-testid="companion-reaction-reply"]').getBoundingClientRect(),t=document.querySelector('[data-testid="spotlight-tip"]').getBoundingClientRect();return b.bottom<=t.top||b.top>=t.bottom||b.right<=t.left||b.left>=t.right;}),'bubble not obscured by instruction');await step(6);await tap('準備出發');await step(7);await tap('完成教學，先不開始');
 assert.equal((await state()).deadline,null);assert.equal((await state()).orbs,48);assert.equal((await state()).phase,'preparing');
 await p.screenshot({path:`reports/trial-lock/tutorial-ready-${width}.png`});
 await tap('我準備好了，開始！');await p.locator('[data-testid="task-music-hint"]').waitFor();assert.equal((await state()).focusMusicEnabled,false);assert.equal(await p.locator('[data-testid="spotlight-guide"]').count(),0);
 await tap('知道了，關閉音樂提示');await tap('回到村莊');await tap('家長小屋');await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await tap('音樂');
 await step(1);await tap('專注音樂');await step(2);await tap('展開靜心鋼琴');await step(3);await tap('試聽靜心鋼琴');await step(4);
 await p.waitForFunction(()=>document.querySelector('[data-testid="focus-music-player"]')?.currentTime>.1);
 await p.getByRole('radio',{name:'選用靜心鋼琴',exact:true}).tap();await p.waitForFunction(()=>!document.querySelector('[data-testid="spotlight-guide"]'));
 assert.equal((await state()).focusMusicEnabled,false);assert.equal((await state()).orbs,48);assert(await p.evaluate(()=>document.querySelector('[data-testid="focus-music-player"]').paused));
 await tap('小朋友資料');await tap('音樂');assert.equal(await p.locator('[data-testid="spotlight-guide"]').count(),0);
 // Legacy player gets only the new companion step; skip is remembered.
 await p.evaluate(({KEY,GUIDE,seed})=>{localStorage.setItem(KEY,JSON.stringify(seed));localStorage.setItem(GUIDE,JSON.stringify({main:true,companions:true,parent:true,wishes:true,music:true}));},{KEY,GUIDE,seed});await p.reload();await tap('開始任務');await step(1);assert((await p.locator('[data-testid="spotlight-tip"]').innerText()).includes('文字泡泡'));await tap('略過教學');await tap('先自己探索');await tap('回到村莊');await tap('開始任務');assert.equal(await p.locator('[data-testid="spotlight-guide"]').count(),0);
 // Replay resets additive lessons but does not erase progress.
 await tap('回到村莊');await tap('家長小屋');await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await tap('設定與教學');await tap('重新觀看操作教學');await step(1);await tap('略過教學');await tap('先自己探索');await tap('家長小屋');await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await tap('音樂');await step(1);await tap('略過教學');await tap('先自己探索');assert.equal((await state()).orbs,48);
 console.log('PASS',width,height,'main companion interaction/no timer, inline music/dismiss, music guide real playback, legacy one-time, replay, unchanged points');await context.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
