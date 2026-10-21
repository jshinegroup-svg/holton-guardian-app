import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');const server=createTrialServer({root:'dist',password,secure:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const KEY='holton-guardian-app::light-v1',GUIDE='holton-guardian-app::spotlight-v1';
const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'寫作業',minutes:3,cardId:'mini-warrior',orbs:48,phase:'ready',deadline:null,remaining:180,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true,focusMusicEnabled:false};
try{for(const [width,height] of [[390,650],[320,568],[844,390],[768,1024]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});await context.request.post(base+'/trial/login',{form:{password}});const p=await context.newPage();p.setDefaultTimeout(15000);
 await p.addInitScript(()=>{window.__scrollCalls=0;const original=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(...args){window.__scrollCalls++;return original.apply(this,args)};});
 await p.goto(base);await p.evaluate(({KEY,GUIDE,seed})=>{localStorage.setItem(KEY,JSON.stringify(seed));localStorage.setItem(GUIDE,JSON.stringify({main:true,companions:true,parent:false,wishes:true,companionTap:true,music:true}));localStorage.setItem('holton-guardian-app::task-music-hint-v1','done');},{KEY,GUIDE,seed});await p.reload();
 const pin=String(randomInt(100000,999999));const input=p.getByLabel('6 位數家長密碼',{exact:true});await input.waitFor();assert(Number.parseFloat(await input.evaluate(e=>getComputedStyle(e).fontSize))>=16,'PIN must not trigger small-input auto zoom');await input.fill(pin);await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);
 const tap=name=>p.getByRole('button',{name,exact:true}).tap();await tap('繼續設定');await tap('已妥善保存，啟用家長密碼');await tap('家長小屋');await input.fill(pin);await tap('確認');await p.locator('[data-testid="spotlight-tip"]').waitFor();await p.waitForTimeout(1800);
 // Simulate the webview's zoomed/panned viewport and toolbar height changes.
 const count=await p.evaluate(()=>window.__scrollCalls);
 await p.evaluate(()=>{window.__realViewport=window.visualViewport;const v=new EventTarget();Object.assign(v,{width:280,height:400,offsetLeft:35,offsetTop:45,scale:1.3});Object.defineProperty(window,'visualViewport',{configurable:true,value:v});v.dispatchEvent(new Event('resize'));});
 for(let i=0;i<6;i++){await p.evaluate(i=>{visualViewport.height=400+(i%2)*18;visualViewport.dispatchEvent(new Event('resize'));visualViewport.dispatchEvent(new Event('scroll'));},i);await p.waitForTimeout(120);}
 assert.equal(await p.evaluate(()=>window.__scrollCalls),count,'viewport events never force repeated scrolling');
 assert(await p.evaluate(()=>{const r=document.querySelector('[data-testid="spotlight-tip"]').getBoundingClientRect(),v=visualViewport;return r.left>=v.offsetLeft&&r.right<=v.offsetLeft+v.width+1&&r.top>=v.offsetTop&&r.bottom<=v.offsetTop+v.height+1;}),'tip fits zoomed visual viewport');
 assert(await p.evaluate(()=>{const t=document.querySelector('[data-testid="spotlight-tip"]').getBoundingClientRect(),b=document.querySelector('[aria-label="任務與目標"]').getBoundingClientRect();return b.bottom<=t.top||b.top>=t.bottom||b.right<=t.left||b.left>=t.right;}),'instruction must not cover navigation target');
 await p.screenshot({path:`reports/trial-lock/guide-viewport-${width}.png`});
 await p.evaluate(()=>{Object.defineProperty(window,'visualViewport',{configurable:true,value:window.__realViewport});visualViewport.dispatchEvent(new Event('resize'));});await p.waitForTimeout(350);
 await tap('任務與目標');await p.getByRole('switch',{name:'允許提早完成',exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('[data-testid="spotlight-guide"]'));
 assert(await p.evaluate(GUIDE=>JSON.parse(localStorage.getItem(GUIDE)).parent,GUIDE),'parent click both navigates and completes guide');
 await p.evaluate(({KEY,seed})=>localStorage.setItem(KEY,JSON.stringify({...seed,phase:'active',deadline:Date.now()+180000,focusStartedAt:Date.now(),focusElapsedMs:0})),{KEY,seed});await p.reload();await p.locator('[data-testid="focus-companion-panel"], [aria-label="繼續任務"]').first().waitFor();if(await p.getByRole('button',{name:'繼續任務',exact:true}).count())await tap('繼續任務');
 const panel=p.locator('[data-testid="focus-companion-panel"]');await panel.waitFor();await panel.scrollIntoViewIfNeeded();await p.waitForTimeout(300);
 const before=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
 assert(await p.evaluate(()=>{const panel=document.querySelector('[data-testid="focus-companion-panel"]'),text=panel.querySelector('[data-testid="companion-details"]').getBoundingClientRect(),art=panel.querySelector('[data-testid="companion-reaction-art"]').getBoundingClientRect(),card=panel.querySelector('[data-testid="companion-time-card"]').getBoundingClientRect();return Math.abs(text.top-art.top)<5&&card.width>=80&&card.height>=150&&document.documentElement.scrollWidth<=innerWidth;}),'top-aligned copy, larger time card, no horizontal overflow');
 await p.locator('[aria-label^="摸摸"]').tap();await p.locator('[data-testid="companion-reaction-reply"]').waitFor();await p.screenshot({path:`reports/trial-lock/companion-layout-${width}.png`});
 await tap('進入專注介面');await tap('回到任務');const after=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);assert.equal(after.deadline,before.deadline);assert.equal(after.orbs,48);
 console.log('PASS',width,height,'PIN font, viewport resize/offset stability, parent navigation, active layout, companion reply, focus return/timer/points');await context.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
