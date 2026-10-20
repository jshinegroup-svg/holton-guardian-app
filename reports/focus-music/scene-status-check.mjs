import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19389;
const userData = '/tmp/holton-scene-status-profile';
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
 const click=async label=>{const p=await run(`(()=>{const e=[...document.querySelectorAll('[role="button"],[role="switch"],[role="radio"],[role="checkbox"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await wait(220)};
 const reload=async()=>{await run('location.reload()');for(let i=0;i<100;i++){await wait(100);if(await run("!!document.querySelector('[data-testid=\"mission-stage\"], [data-testid=\"adventure-village\"]')"))return;}throw Error('not ready')};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,onboardingDone:true,title:'國語作業',minutes:15,cardId:'power-ranger',orbs:41,phase:'active',deadline:Date.now()+900000,remaining:900,focusElapsedMs:0,focusStartedAt:Date.now(),help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true,activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0},taskSoundEnabled:true,taskReminderShown:false};
 const shot=async name=>{await wait(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/focus-music/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 const notes=()=>run('window.__chimeStarts');
 const waitDue=async()=>{for(let i=0;i<80;i++){if((await read()).taskReminderShown)return;await wait(150)}throw Error('reminder not triggered')};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/[0-9]+/g).map(Number),e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認進入')};

 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__blockMusic=sessionStorage.getItem('block-music')==='yes';window.__musicPlayCalls=0;const oldPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.dataset.testid==='focus-music-player'){window.__musicPlayCalls++;if(window.__blockMusic)return Promise.reject(new DOMException('Blocked in test','NotAllowedError'));}return oldPlay.call(this)};const oldSource=AudioContext.prototype.createMediaElementSource;AudioContext.prototype.createMediaElementSource=function(el){const src=oldSource.call(this,el);if(el.dataset.testid==='focus-music-player'){window.__musicContext=this;const a=this.createAnalyser();src.connect(a);window.__musicAnalyser=a;}return src;};`});
 const audio=()=>run(`(()=>{const a=document.querySelector('[data-testid="focus-music-player"]');return a?{src:a.currentSrc,paused:a.paused,time:a.currentTime,loop:a.loop,ready:a.readyState,count:document.querySelectorAll('[data-testid="focus-music-player"]').length}:null})()`);
 const until=async(fn,label)=>{for(let i=0;i<100;i++){if(await fn())return;await wait(150)}throw Error(label)};
 const playing=()=>until(async()=>{const a=await audio();return a&&!a.paused&&a.time>.15},'audio playback did not start');
 const parent=async()=>{await click('回到村莊');await click('家長小屋');await unlock();await click('音樂')};

 await wait(1200);const seen=new Set();
 for(const world of ['forest','sky','cosmos']){
 const sources=[];
 for(const count of [0,4,5,9,10,15]){
 const counts={forest:15,sky:15,cosmos:15};counts[world]=count;
 await seed({...base,activeWorld:world,journeys:{version:2,counts,legacyCredit:0},deadline:Date.now()+900000,focusStartedAt:Date.now()});
 const img=await run(`(()=>{const e=document.querySelector('[data-testid="world-scene-focus"] img');return e?.src})()`);check(img,'scene present');sources.push(img);seen.add(img);
 }
 check(sources[0]===sources[1]&&sources[2]===sources[3]&&sources[4]===sources[5]&&sources[0]!==sources[2]&&sources[2]!==sources[4],'5 task boundaries '+world);
 }
 check(seen.size===9,'nine distinct scenes');console.log('PASS LIVE three worlds x three distinct images; 0/4/5/9/10/15 scene boundaries');
}finally{proc.kill('SIGTERM')}
