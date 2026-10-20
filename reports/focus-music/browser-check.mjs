import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19387;
const userData = '/tmp/holton-music-categories-profile';
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
 const rows=JSON.parse(await fs.readFile('reports/focus-music/source/tracks.json','utf8')).map(t=>[t.id,t.label]);
 await wait(1200);await seed({...base,focusMusicEnabled:false,focusMusicTrackId:'meditation',deadline:Date.now()+900000,focusStartedAt:Date.now()});const original=await read();check(!await audio(),'default off no player/download');await parent();check(await run(`document.querySelectorAll('[data-testid^="music-track-"]').length===0`),'category landing has no tracks');await shot('categories-390');await click('專注音樂');check(await run(`document.querySelectorAll('[data-testid^="music-track-"]').length===10`),'ten focus tracks');await shot('settings-390');
 for(const [id,label] of rows){if(id==='meditation2'){await click('返回音樂分類');await click('放鬆音樂');check(await run(`document.querySelectorAll('[data-testid^="music-track-"]').length===10`),'ten relaxation tracks');}await click('展開'+label);await click('選用'+label);check((await read()).focusMusicTrackId===id,'track persisted '+id);await click('試聽'+label);await playing();await wait(1100);const a=await audio();check(a.src.endsWith('/'+id+'.mp3')&&a.count===1&&a.loop,'single loop player '+id);await until(()=>run(`(()=>{const a=window.__musicAnalyser,b=new Float32Array(a.fftSize);a.getFloatTimeDomainData(b);return b.some(x=>Math.abs(x)>.00001)})()`),'decoded waveform '+id);await click('停止試聽');check((await audio()).paused,'preview stop '+id);}
 await click('返回音樂分類');await click('專注音樂');await click('展開靜心鋼琴');await click('試聽靜心鋼琴');await playing();await wait(20500);check((await audio()).paused,'20-second preview auto-stops');
 await click('專注音樂自動播放');check((await read()).focusMusicEnabled,'preference enabled');await click('回到村莊');check((await audio()).paused,'village silent');await click('繼續任務');await playing();check((await audio()).src.endsWith('/pulse.mp3'),'plays selected not preview track');const t=(await audio()).time;await click('進入專注介面');await wait(500);check((await audio()).time>=t,'focus entry does not restart track');await shot('focus-music-390');await click('專注音樂');check((await audio()).paused&&!(await read()).focusMusicEnabled,'clock toggle off');await click('專注音樂');await playing();await click('回到任務');await click('我需要幫忙');check((await audio()).paused,'help pauses');await click('我準備好了，繼續');await playing();
 await run(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))`);check((await audio()).paused,'hidden stops');await run(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))`);await playing();
 const stateNow=await read();check(stateNow.orbs===original.orbs&&JSON.stringify(stateNow.history)===JSON.stringify(original.history),'music no reward/history mutations');
 await seed({...base,focusMusicEnabled:true,focusMusicTrackId:'morning',focusElapsedMs:450000,focusStartedAt:Date.now(),deadline:Date.now()+450000});await click('進入專注介面');if(await run(`!!document.querySelector('[aria-label="播放專注音樂"]')`))await click('播放專注音樂');await click('回到任務');await click('完成');check((await audio()).paused&&(await read()).phase==='finishing','finishing stops music');
 await run(`sessionStorage.setItem('block-music','yes')`);await seed({...base,focusMusicEnabled:true,focusMusicTrackId:'evening',deadline:Date.now()+900000,focusStartedAt:Date.now()});await until(()=>run(`!!document.querySelector('[aria-label="播放專注音樂"]')`),'autoplay blocked fallback');check((await audio()).paused,'blocked no fake playback');await run(`window.__blockMusic=false;sessionStorage.removeItem('block-music')`);await click('播放專注音樂');await playing();
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await click('進入專注介面');await shot('focus-music-320');check(await run('document.documentElement.scrollWidth<=320'),'focus320 no overflow');await parent();check(await run(`document.querySelectorAll('[data-testid^="music-track-"]').length===0`),'reopen settings starts at categories');await shot('categories-320');await click('放鬆音樂');await click('展開片刻安寧');await click('試聽片刻安寧');await playing();await click('返回音樂分類');check((await audio()).paused,'category return stops preview');await click('專注音樂');await shot('settings-320');check(await run('document.documentElement.scrollWidth<=320'),'settings320 no overflow');await click('展開晨光輕語');await click('試聽晨光輕語');await playing();await click('小朋友資料');check((await audio()).paused,'leaving music tab stops preview');
 await seed({...base,phase:'ready',deadline:null,focusStartedAt:null,focusMusicEnabled:true,focusMusicTrackId:'ripples',taskSoundEnabled:false,childName:'小宇'});await click('家長小屋');await unlock();await click('備份與重置');await click('重新開始冒險');await run(`(()=>{const e=document.querySelector('[aria-label="輸入重新開始"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'重新開始');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認清空進度，重新開始');const reset=await read();check(reset.orbs===0&&reset.focusMusicEnabled&&reset.focusMusicTrackId==='ripples'&&!reset.taskSoundEnabled&&reset.childName==='小宇','reset preserves independent music/chime/name preferences');
 console.log('PASS two-category landing,10+10 tracks,back navigation; all20 real decoded audible waveforms/single player/loop/previews/persisted selection; 20s preview cutoff; task/focus off-on/help/village/parent/hidden/finish lifecycle; no points/history changes; blocked autoplay manual retry;320/390 layout; reset preserves music/chime/name separately. Browser media/gain not physical-phone listening.');
} finally {proc.kill('SIGTERM')}
