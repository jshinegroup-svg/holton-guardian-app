import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');const server=createTrialServer({root:'dist',password,secure:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const KEY='holton-guardian-app::light-v1',GUIDE='holton-guardian-app::spotlight-v1';
const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true,focusMusicEnabled:false,reduceMotion:true};
try{for(const [width,height] of [[390,844]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});await context.request.post(base+'/trial/login',{form:{password}});const p=await context.newPage();p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);console.log('start',width);await p.clock.setFixedTime(new Date('2026-10-22T12:00:00+08:00'));await p.goto(base);
 await p.evaluate(({KEY,GUIDE,seed})=>{localStorage.setItem(KEY,JSON.stringify(seed));localStorage.setItem(GUIDE,JSON.stringify({main:true,companions:true,parent:true,wishes:true,companionTap:true,music:true}));},{KEY,GUIDE,seed});await p.reload();
 const pin=String(randomInt(100000,999999));await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);await p.getByRole('button',{name:'繼續設定',exact:true}).tap();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).tap();await p.waitForFunction(()=>!!localStorage.getItem('holton-parent-lock-v1'));
 const tap=async name=>{console.log('tap',name);await p.getByRole('button',{name,exact:true}).tap();};
 const state=()=>p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
 for(const world of ['forest'])for(let step=3;step<=4;step++){
  const chapter=Math.floor((step-1)/5),frame=(step-1)%5+1;
  const journeys={version:2,counts:{forest:15,sky:15,cosmos:15,[world]:step},legacyCredit:0,event:{id:`${world}-${step}`,world,step}};
  await p.evaluate(({KEY,seed,journeys,world})=>localStorage.setItem(KEY,JSON.stringify({...seed,activeWorld:world,journeys})),{KEY,seed,journeys,world});await p.reload();
  const scene=p.locator('[data-testid="chapter-reveal-scene"]');await scene.waitFor().catch(async e=>{console.log('DEBUG',await p.locator('body').innerText(),await state());await p.screenshot({path:'reports/journey-stages/debug.png'});throw e;});
  const current=`journey-frame-${world}-${chapter}-${frame}`;await scene.locator(`[data-testid="${current}"]`).waitFor();
  await p.waitForFunction(()=>{const img=document.querySelector('[data-testid="chapter-reveal-scene"] img');return img?.complete&&img.naturalWidth>0;});
  const beforeState=await state();await p.locator('[data-testid="journey-reveal"]').screenshot({path:`/Users/user/.openclaw/workspace/media/outbound/holton-journey-stages/forest-step-${step}.png`});
  const asset=await scene.evaluate(el=>{const img=el.querySelector('img');const r=el.getBoundingClientRect();return {w:r.width,h:r.height,source:img.src,ratio:img.naturalWidth/img.naturalHeight,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert(Math.abs(asset.w-asset.h)<2);assert(Math.abs(asset.ratio-1.5)<.01);assert.equal(asset.overflow,false);
  if([3,4,5,10,15].includes(step))await scene.screenshot({path:`reports/journey-stages/${world}-${step}-${width}-after.png`});
  await tap('對照完成前');await scene.locator(`[data-testid="journey-frame-${world}-${chapter}-${frame-1}"]`).waitFor();assert.deepEqual(await state(),beforeState);
  if([3,4,5,10,15].includes(step))await scene.screenshot({path:`reports/journey-stages/${world}-${step}-${width}-before.png`});
  await tap('看點亮後');await scene.locator(`[data-testid="${current}"]`).waitFor();assert.deepEqual(await state(),beforeState);
  await tap('看到了，繼續旅程');await p.waitForFunction(KEY=>!JSON.parse(localStorage.getItem(KEY)).journeys.event,KEY);assert.equal((await state()).orbs,48);assert.equal((await state()).journeys.counts[world],step);
  if(step===3||step===15){await p.getByRole('button',{name:'看看我的旅程',exact:true}).first().tap();await p.locator('[data-testid="journey-map"]').waitFor();await p.locator(`[data-testid="journey-chapter-${chapter}"] [data-testid="${current}"]`).waitFor();assert.equal((await state()).orbs,48);}
  console.log('PASS',width,world,step,'before/after same chapter, artwork loaded, saved progress unchanged');
 }
 await context.close();
}}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
