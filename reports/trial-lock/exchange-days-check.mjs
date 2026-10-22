import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');const server=createTrialServer({root:'dist',password,secure:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const KEY='holton-guardian-app::light-v1',GUIDE='holton-guardian-app::spotlight-v1';
const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true,focusMusicEnabled:false,reduceMotion:true};
try{for(const [width,height] of [[390,650],[320,568]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});await context.request.post(base+'/trial/login',{form:{password}});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);console.log('start',width);await p.clock.setFixedTime(new Date('2026-10-22T12:00:00+08:00'));await p.goto(base);
 await p.evaluate(({KEY,GUIDE,seed})=>{localStorage.setItem(KEY,JSON.stringify(seed));localStorage.setItem(GUIDE,JSON.stringify({main:true,companions:true,parent:true,wishes:true,companionTap:true,music:true}));},{KEY,GUIDE,seed});await p.reload();
 const pin=String(randomInt(100000,999999));await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);await p.getByRole('button',{name:'繼續設定',exact:true}).tap();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).tap();
 const tap=async name=>{console.log('tap',name);await p.getByRole('button',{name,exact:true}).tap();};
 const state=()=>p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
 const settings=async()=>{await tap('家長小屋');await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await tap('設定與教學');};
 await settings();const toggle=p.getByRole('switch',{name:'僅限星期日兌換',exact:true});assert.equal(await toggle.getAttribute('aria-checked'),'true');
 assert.equal(await p.getByRole('button',{name:'偏好與舊卡',exact:true}).count(),0);
 await tap('查看守護獸收藏');await p.getByRole('button',{name:/查看待兌換/}).first().tap();const challenge=p.getByRole('button',{name:'挑戰守護獸 · 10 點',exact:true});assert.equal(await challenge.getAttribute('aria-disabled'),'true');await tap('回到家長小屋');
 await toggle.tap();await p.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).guardianSundayOnly===false,KEY);assert.equal((await state()).orbs,48);
 await p.locator('[data-testid="guardian-exchange-setting"]').scrollIntoViewIfNeeded();await p.screenshot({path:`reports/trial-lock/exchange-setting-${width}.png`});
 await p.reload();await settings();assert.equal(await toggle.getAttribute('aria-checked'),'false');
 await tap('查看守護獸收藏');await p.getByRole('button',{name:/查看待兌換/}).first().tap();assert.notEqual(await challenge.getAttribute('aria-disabled'),'true');await challenge.tap();await tap('確認出戰 · 扣 10 點');
 await p.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).orbs===38,KEY);await p.reload();await tap('締結夥伴 · 收下守護獸');await tap('回到守護獸收藏');assert.equal((await state()).orbs,38);assert.equal((await state()).guardianCards.length,1);
 await tap('回到任務');await settings();await toggle.tap();await p.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).guardianSundayOnly===true,KEY);await tap('查看守護獸收藏');await p.getByRole('button',{name:/查看待兌換/}).first().tap();assert.equal(await p.getByRole('button',{name:/挑戰守護獸 ·/}).getAttribute('aria-disabled'),'true');assert.equal((await state()).orbs,38);
 console.log('PASS',width,'renamed tab, default Sunday block, toggle persists, Thursday exchange debit once across reload, re-enable block');await context.close();
}}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
