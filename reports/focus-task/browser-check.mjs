import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19361;
const userData = '/tmp/holton-focus-profile';
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
 const check=(v,m)=>{if(!v)throw Error(m)};
 const key='holton-guardian-app::light-v1';const read=()=>run(`JSON.parse(localStorage.getItem('${key}'))`);
 const click=async label=>{await run(`(()=>{const el=[...document.querySelectorAll('[role="button"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!el)throw Error('missing '+${JSON.stringify(label)});el.click()})()`);await wait(200)};
 const reload=async()=>{await run('location.reload()');for(let i=0;i<100;i++){await wait(100);if(await run("!!document.querySelector('[data-testid=\"mission-stage\"], [data-testid=\"adventure-village\"]')"))return;}throw Error('not ready')};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,onboardingDone:true,title:'國語作業',minutes:15,cardId:'power-ranger',orbs:41,phase:'ready',deadline:null,remaining:900,help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true,activeWorld:'sky',journeys:{version:2,counts:{forest:15,sky:0,cosmos:0},legacyCredit:0}};
 const disabled=()=>run(`document.querySelector('[data-testid="focus-complete"]').getAttribute('aria-disabled')==='true'`);
 const shot=async name=>{await run('window.scrollTo(0,0)');await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/focus-task/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 await wait(1200);await seed(base);await click('開始任務');await click('準備出發');await click('我準備好了，開始！');
 check(await disabled(),'fresh timed locked');check((await read()).focusElapsedMs===0,'start elapsed zero');const started=(await read()).focusStartedAt;
 await click('完成');check((await read()).phase==='active','disabled click no completion');
 await reload();check((await read()).focusStartedAt===started,'reload start preserved');check(await disabled(),'reload remains locked');
 for(const width of [390,320]){await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await shot('focus-'+width);check(await run(`document.documentElement.scrollWidth<=${width}`),'no horizontal overflow');check(await run(`!!document.querySelector('[data-testid="quiet-focus-backdrop"]')&&!document.querySelector('[data-testid="guardian-companion"]')&&!document.querySelector('[data-testid="crystal-clock"]')`),'quiet surface and no large cards');check(await run(`parseInt(getComputedStyle(document.querySelector('[data-testid="focus-task-title"]')).fontSize)>=36`),'task prominent');}
 const lockedColor=await run(`getComputedStyle(document.querySelector('[data-testid="focus-complete"]')).backgroundColor`);check(lockedColor==='rgb(70, 86, 95)','gray locked');
 await click('我需要幫忙');const paused=await read();check(paused.help&&paused.focusStartedAt===null,'help stops focus');await wait(1300);await reload();check((await read()).focusElapsedMs===paused.focusElapsedMs,'paused reload unchanged');await click('我準備好了，繼續');check((await read()).focusElapsedMs===paused.focusElapsedMs&&(await read()).focusStartedAt>started,'resume preserves elapsed');
 for(const minutes of [15,0]){
  const t=Date.now(),limit=minutes?450000:600000;
  await seed({...base,minutes,phase:'active',remaining:minutes*60,deadline:minutes?t+minutes*60000:null,focusElapsedMs:limit-4500,focusStartedAt:t});check(await disabled(),'just before threshold locked '+minutes);await wait(5000);check(!await disabled(),'threshold unlock '+minutes);
  check(await run(`getComputedStyle(document.querySelector('[data-testid="focus-complete"]')).backgroundColor==='rgb(9, 126, 134)'`),'colored unlocked');await shot(minutes?'timed-unlocked':'untimed-unlocked');
  await click('完成');check((await read()).phase==='finishing','finishing after threshold');const elapsed=(await read()).focusElapsedMs;await click('還有一點，回去繼續');check((await read()).focusElapsedMs===elapsed,'return retains focus');check(!await disabled(),'return remains eligible');await click('完成');
  await run(`(()=>{const e=document.querySelector('[data-testid="mission-stage"] [data-testid="primary-action"]');e.click();e.click()})()`);await wait(350);check((await read()).history.length===1&&(await read()).orbs===42,'single reward after double click');await reload();check((await read()).history.length===1,'completion persists');
 }
 await seed({...base,minutes:0,phase:'active',remaining:0,deadline:null,focusElapsedMs:0,focusStartedAt:Date.now()});check(await disabled(),'fresh untimed locked');await shot('untimed-locked');
 await click('我需要幫忙');await click('選擇休息卡');const rest=await read();check(rest.focusStartedAt===null&&rest.breakDeadline,'rest pauses focus');await reload();check((await read()).focusElapsedMs===rest.focusElapsedMs,'rest reload no elapsed');await click('休息好了，繼續');check(await disabled(),'rest no bypass');
 await seed({...base,phase:'active',deadline:Date.now()+400000,remaining:900});check(!await disabled(),'old timed remaining migrates eligible');
 await seed({...base,minutes:0,phase:'active',deadline:null,remaining:0});check(await disabled(),'old untimed safe migration');check((await read()).focusStartedAt>0,'old untimed start persisted');
 await seed({...base,title:'國語作業：先讀課文第一段，再完成今天的生字練習，寫完後檢查一次',phase:'active',deadline:Date.now()+900000,focusElapsedMs:0,focusStartedAt:Date.now()});await shot('long-title-320');check(await run('document.documentElement.scrollWidth<=320'),'long title wraps');
 console.log('PASS quiet focus 320/390; real start; disabled no-op; exact threshold timer unlock timed/untimed; gray to color; reload; help/rest pause; finishing return; double-click single reward; legacy migrations; long title');
} finally {proc.kill('SIGTERM')}
