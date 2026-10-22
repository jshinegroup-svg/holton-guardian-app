import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19375;
const userData = '/tmp/holton-clock-entry-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19088/holton-guardian-app/';
const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--window-size=390,844', `--remote-debugging-port=${port}`,
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
 const click=async label=>{const p=await run(`(()=>{const e=[...document.querySelectorAll('[role="button"],[role="switch"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await wait(220)};
 const reload=async()=>{await run('location.reload()');for(let i=0;i<100;i++){await wait(100);if(await run("!!document.querySelector('[data-testid=\"mission-stage\"], [data-testid=\"adventure-village\"]')"))return;}throw Error('not ready')};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,onboardingDone:true,title:'國語作業',minutes:15,cardId:'power-ranger',orbs:41,phase:'active',deadline:Date.now()+900000,remaining:900,focusElapsedMs:0,focusStartedAt:Date.now(),help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true,activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0},taskSoundEnabled:true,taskReminderShown:false};
 const shot=async name=>{await wait(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/clock-focus-entry/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 const notes=()=>run('window.__chimeStarts');
 const waitDue=async()=>{for(let i=0;i<80;i++){if((await read()).taskReminderShown)return;await wait(150)}throw Error('reminder not triggered')};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/[0-9]+/g).map(Number),e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認進入')};
 await wait(1200);await seed(base);check(await run(`!document.querySelector('[data-testid="focus-unlock-hint"]')&&!document.body.innerText.includes('完成鍵就會亮起')&&!document.body.innerText.includes('做好了，再按完成')`),'requested helper text removed');const original=await read();check(await run(`!document.body.innerText.includes('暫時離開，任務繼續')`),'old button absent');await shot('clock-entry');
 await click('進入專注介面');check(await run(`!!document.querySelector('[data-testid="task-away-panel"]')`),'handoff shown');await shot('handoff-390');check((await read()).deadline===original.deadline&&(await read()).focusStartedAt===original.focusStartedAt&&!(await read()).help,'leave does not pause or reset');await wait(1200);await click('回到任務');check((await read()).deadline===original.deadline,'return same deadline');await reload();check((await read()).focusStartedAt===original.focusStartedAt,'reload same start');
 for(const minutes of [15,0]){
  const t=Date.now(),target=minutes?900000:600000;
  await seed({...base,minutes,remaining:minutes*60,deadline:minutes?t+5000:null,focusElapsedMs:target-5000,focusStartedAt:t});
  await click('進入專注介面');await waitDue();await wait(300);check(await notes()===3,'one original three-note chime '+minutes);check((await read()).phase==='active'&&(await read()).history.length===0&&(await read()).orbs===41,'no auto-completion/reward');await shot(minutes?'timed-due':'untimed-due');await wait(1800);check(await notes()===3,'no repeating alarm');await reload();await wait(1000);check(await notes()===0,'reload no replay');check(await run(`!!document.querySelector('[data-testid="task-due-reminder"]')`),'visual reminder retained');
 }
 const t=Date.now();await seed({...base,focusElapsedMs:899000,focusStartedAt:t,deadline:t+1000,taskSoundEnabled:false});await waitDue();check(await notes()===0,'off means no sound');
 await seed({...base,focusElapsedMs:450000,focusStartedAt:Date.now(),deadline:Date.now()+450000});await wait(1300);check(!(await read()).taskReminderShown,'half time unlock is not timed alarm');
 await click('我需要幫忙');const paused=await read();await wait(1500);check((await read()).focusElapsedMs===paused.focusElapsedMs&&!paused.taskReminderShown,'help pauses reminder time');await click('我準備好了，繼續');
 await click('家長小屋');await unlock();await click('設定與教學');await shot('parent-sound');await click('任務到時提示音');check((await read()).taskSoundEnabled===false,'setting off saved');await click('試聽到時提示音');check(await notes()===3,'explicit preview works even if automatic sound off');await reload();check((await read()).taskSoundEnabled===false,'setting persists reload');
 // Autoplay-blocked fallback: no user gesture before due, visual message and manual replay.
 await seed({...base,minutes:0,deadline:null,remaining:0,focusElapsedMs:600000,focusStartedAt:Date.now()});await waitDue();check(await notes()===0,'no fabricated playback when locked');check(await run(`document.body.innerText.includes('裝置未能自動播放聲音')`),'blocked playback visible');await click('播放到時提示音');await wait(300);check(await notes()===3,'manual replay succeeds via gesture');
 // Browser lifecycle suspension models a page that cannot run timers in the background.
 await seed({...base,focusElapsedMs:898000,focusStartedAt:Date.now(),deadline:Date.now()+2000});await send('Page.setWebLifecycleState',{state:'frozen'});await wait(3000);await send('Page.setWebLifecycleState',{state:'active'});await waitDue();check((await read()).taskReminderShown,'reminder catches up after lifecycle resume');
 await seed({...base,phase:'ready',deadline:null,focusStartedAt:null,focusElapsedMs:0,taskSoundEnabled:false});await click('開始任務');await click('準備出發');await click('我準備好了，開始！');check(!(await read()).taskReminderShown&&(await read()).focusElapsedMs===0,'new task resets reminder');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await click('進入專注介面');await shot('handoff-320');check(await run('document.documentElement.scrollWidth<=320'),'no320overflow');

 await click('回到任務');await click('我需要幫忙');check(await run(`!document.querySelector('[data-testid="focus-time-panel"]')`),'help excludes active focus entry');await click('我準備好了，繼續');
 await seed({...base,title:'國語作業：完成第二課生字與課後練習並檢查',deadline:Date.now()-1000,remaining:0,focusElapsedMs:900000,focusStartedAt:Date.now(),taskReminderShown:true});
 await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Page.bringToFront');await run(`document.querySelector('[data-testid="focus-time-panel"]').focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(1100);
 check(await run(`document.querySelector('[data-testid="away-clock"]')?.textContent==='00:00'`),'keyboard opens focus at zero');await shot('long-title-zero-320');check(await run('document.documentElement.scrollWidth<=320'),'long task wraps');
 await click('回到任務');const pos=await run(`(()=>{const e=document.querySelector('[data-testid="focus-time-panel"]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+15,y:r.y+r.height/2}})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pos]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(300);check(await run(`!!document.querySelector('[data-testid="task-away-panel"]')`),'whole time frame touch entry');check((await read()).orbs===41&&(await read()).history.length===0,'entry never awards');
 console.log('PASS clock direct entry/return/reload without pause or reset; actual WebAudio three scheduled notes at full timed /10min untimed; no half-time alarm or auto-award; once only across reload; sound off/persistent/explicit preview; autoplay-blocked visual/manual fallback; page freeze/resume catch-up; new task resets;320/390');
} finally {proc.kill('SIGTERM')}
