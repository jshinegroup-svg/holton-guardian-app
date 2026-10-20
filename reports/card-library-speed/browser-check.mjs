import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19403;
const userData = '/tmp/holton-library-speed-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19107/holton-guardian-app/';
const proc = spawn(chrome, [
  '--headless=new', '--mute-audio', '--disable-gpu', '--window-size=390,844', `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`, '--no-first-run', '--no-default-browser-check', url
], { stdio: 'ignore' });

async function json(path) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`);
  return res.json();
}
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  return (method, params = {}) => new Promise((resolve, reject) => {
    const thisId = ++id;
    pending.set(thisId, { resolve, reject });
    ws.send(JSON.stringify({ id: thisId, method, params }));
  });
}


try {
 let tabs;for(let i=0;i<50;i++){try{tabs=await json('/json');break;}catch{await wait(200)}}
 const send=await connect(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__chimeStarts=0;window.__chimeContexts=[];const create=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){if(!window.__chimeContexts.includes(this))window.__chimeContexts.push(this);const o=create.call(this),start=o.start.bind(o);o.start=(...args)=>{window.__chimeStarts++;return start(...args)};return o};`});
 const check=(v,m)=>{if(!v)throw Error(m)};
 const key='holton-guardian-app::light-v1';const read=()=>run(`JSON.parse(localStorage.getItem('${key}'))`);
 const click=async label=>{const p=await run(`(()=>{const e=[...document.querySelectorAll('[role="button"],[role="switch"],[role="radio"],[role="checkbox"],[role="tab"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await wait(220)};
 const reload=async()=>{await run('location.reload()');for(let i=0;i<100;i++){await wait(100);if(await run("!!document.querySelector('[data-testid=\"mission-stage\"], [data-testid=\"adventure-village\"]')"))return;}throw Error('not ready')};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,onboardingDone:true,title:'國語作業',minutes:15,cardId:'power-ranger',orbs:41,phase:'active',deadline:Date.now()+900000,remaining:900,focusElapsedMs:0,focusStartedAt:Date.now(),help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true,activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0},taskSoundEnabled:true,taskReminderShown:false};
 const shot=async name=>{await wait(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/card-library-speed/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 const notes=()=>run('window.__chimeStarts');
 const waitDue=async()=>{for(let i=0;i<80;i++){if((await read()).taskReminderShown)return;await wait(150)}throw Error('reminder not triggered')};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/[0-9]+/g).map(Number),e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認進入')};

 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__blockMusic=sessionStorage.getItem('block-music')==='yes';window.__musicPlayCalls=0;const oldPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.dataset.testid==='focus-music-player'){window.__musicPlayCalls++;if(window.__blockMusic)return Promise.reject(new DOMException('Blocked in test','NotAllowedError'));}return oldPlay.call(this)};const oldSource=AudioContext.prototype.createMediaElementSource;AudioContext.prototype.createMediaElementSource=function(el){const src=oldSource.call(this,el);if(el.dataset.testid==='focus-music-player'){window.__musicContext=this;const a=this.createAnalyser();src.connect(a);window.__musicAnalyser=a;}return src;};`});
 const audio=()=>run(`(()=>{const a=document.querySelector('[data-testid="focus-music-player"]');return a?{src:a.currentSrc,paused:a.paused,time:a.currentTime,loop:a.loop,ready:a.readyState,count:document.querySelectorAll('[data-testid="focus-music-player"]').length}:null})()`);
 const until=async(fn,label)=>{for(let i=0;i<100;i++){if(await fn())return;await wait(150)}throw Error(label)};
 const playing=()=>until(async()=>{const a=await audio();return a&&!a.paused&&a.time>.15},'audio playback did not start');
 const parent=async()=>{await click('回到村莊');await click('家長小屋');await unlock();await click('音樂')};



 await wait(1000);
 const names=['小禮物','喜歡的飲料','親子遊戲 15 分鐘','一起看電影','喜歡的點心','自選室內活動','自選戶外活動','自選活動','戶外冒險','自選遊戲'];
 const wishes=names.map((name,i)=>({id:'wish-'+i,name,cost:10,enabled:true})).concat(['gold','scroll','crystal'].map((style,i)=>({id:'custom-'+(i+1),name:'自訂'+i,cost:5,enabled:true,custom:true,style,note:'一起安排'})));
 await seed({...base,phase:'ready',deadline:null,focusStartedAt:null,shopEnabled:true,wishes,orbs:100});await click('心願小屋');
 await until(()=>run(`document.querySelectorAll('[data-testid="deferred-card-art"] img').length>0`),'initial art loads');
 const initial=await run(`document.querySelectorAll('[data-testid="deferred-card-art"] img').length`);check(initial<13,'offscreen card art deferred');
 const count=await run(`document.querySelectorAll('[data-testid="deferred-card-art"]').length`);check(count===13,'13 card slots');
 for(let i=0;i<count;i++){
 await run(`document.querySelectorAll('[data-testid="deferred-card-art"]')[${i}].scrollIntoView({block:'center'})`);
 await until(()=>run(`(()=>{const el=document.querySelectorAll('[data-testid="deferred-card-art"]')[${i}],img=el.querySelector('img');return img&&img.complete&&img.naturalWidth>0})()`),'decoded shop art '+i);
 if(i===0)await shot('shop-390');if(i===12)await shot('custom-crystal-390');
 }
 check(await run(`document.querySelectorAll('[data-testid="deferred-card-art"] img').length`)===13,'loaded cards retained');
 const before=await run(`performance.getEntriesByType('resource').filter(r=>r.name.includes('/rewards/')).length`);
 await run(`document.querySelectorAll('[data-testid="deferred-card-art"]')[0].scrollIntoView({block:'center'})`);await wait(300);
 check(await run(`performance.getEntriesByType('resource').filter(r=>r.name.includes('/rewards/')).length`)===before,'scroll back no repeat download');
 await click('我想兌換小禮物');await click('我想兌換喜歡的飲料');check((await read()).orbs===100,'selection no debit');await click('移除喜歡的飲料');await click('我想兌換喜歡的飲料');
 await run(`(()=>{const b=document.querySelector('[aria-label="確認兌換 2 項 · 20 點"]');b.click();b.click()})()`);await wait(400);check((await read()).orbs===80&&(await read()).wishReceipts.length===2,'doubleclick exact debit');
 await reload();check((await read()).orbs===80&&(await read()).wishReceipts.length===2,'reload purchase persists');await click('心願小屋');await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await run(`document.querySelector('[data-testid="deferred-card-art"]').scrollIntoView({block:'center'})`);await until(()=>run(`(()=>{const i=document.querySelector('[data-testid="deferred-card-art"] img');return i&&i.complete&&i.naturalWidth>0})()`),'320 art loaded');await shot('shop-320');check(await run('document.documentElement.scrollWidth<=320'),'320 no overflow');
 const artFiles=await fs.readdir('dist/assets/assets/cards-mobile',{recursive:true});const urls=artFiles.filter(f=>/\.(jpg|png)$/.test(f)).map(f=>new URL('assets/assets/cards-mobile/'+f,url).href);check(urls.length===42,'42 exported derivatives');
 const decoded=await run(`Promise.all(${JSON.stringify(urls)}.map(url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth>0);i.onerror=()=>reject(Error(url));i.src=url})))`);check(decoded.every(Boolean),'all42 optimized artwork decodes');
 console.log(JSON.stringify({all42Decoded:true,result:'PASS viewport-deferred shop artwork;all13 decode;scrollback retains;selection/remove/doubleclick/reload exact debit;320/390',initialLoaded:initial,total:count}));
}finally{proc.kill('SIGTERM')}
