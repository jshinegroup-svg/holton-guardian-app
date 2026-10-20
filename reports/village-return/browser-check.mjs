import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19377;
const userData = '/tmp/holton-village-return-profile';
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
 const base={version:1,onboardingDone:true,title:'國語作業',minutes:15,cardId:'power-ranger',orbs:41,phase:'active',deadline:Date.now()+900000,remaining:900,focusElapsedMs:0,focusStartedAt:Date.now(),help:false,history:[],collection:[{id:'test-collected',cardId:'bonus-energy',at:'2026-10-19',redeemedAt:'2026-10-19'}],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true,activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0},taskSoundEnabled:true,taskReminderShown:false};
 const shot=async name=>{await wait(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/village-return/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 const notes=()=>run('window.__chimeStarts');
 const waitDue=async()=>{for(let i=0;i<80;i++){if((await read()).taskReminderShown)return;await wait(150)}throw Error('reminder not triggered')};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/[0-9]+/g).map(Number),e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認進入')};

 await wait(1200);
 for(const width of [390,320]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await seed({...base,deadline:Date.now()+900000,focusStartedAt:Date.now()});const before=await read();
  check(await run(`!!document.querySelector('[aria-label="回到村莊"]')&&!document.querySelector('[aria-label="家長小屋"]')`),'task header village not parent');
  await click('回到村莊');check(await run(`!!document.querySelector('[data-testid="adventure-village"]')&&!document.querySelector('[data-testid="mission-stage"]')`),'actual village');await shot('village-active-'+width);
  check(await run(`!!document.querySelector('[aria-label="繼續任務"]')&&!document.querySelector('[aria-label="開始任務"]')`),'resume not restart');
  await click('冒險地圖');check(await run(`!!document.querySelector('[data-testid="world-map"]')`),'map usable');check(await run(`document.querySelector('[aria-label="進入森林秘境"]').disabled`),'cannot change world midtask');await click('回到村莊');
  await click('心願小屋');check(await run(`!document.querySelector('[data-testid="mission-stage"]')`),'shop not task');await click('回到村莊');
  await click('夥伴小屋');check(await run(`document.body.innerText.includes('你的夥伴與收藏')`),'companions usable');await click('打開世界卡收藏');check(await run(`document.body.innerText.includes('我的世界卡')&&document.body.innerText.includes('Bonus Energy')`),'album opens during task');await click('回到村莊');
  await click('家長小屋');await unlock();await click('備份與重置');check(await run(`document.querySelector('[aria-label="重新開始冒險"]').getAttribute('aria-disabled')==='true'`),'reset blocked midtask');await click('回到村莊');
  await wait(1200);await click('繼續任務');let after=await read();check(after.deadline===before.deadline&&after.focusStartedAt===before.focusStartedAt&&after.orbs===before.orbs&&after.phase==='active'&&!after.help,'same task keeps running');check(await run(`!!document.querySelector('[data-testid="mission-stage"]')`),'resume task');await shot('task-return-'+width);
  await click('進入專注介面');await click('回到村莊');check(await run(`!!document.querySelector('[data-testid="adventure-village"]')&&!document.querySelector('[data-testid="task-away-panel"]')`),'focus can go village without duplicate screen');await click('繼續任務');
  await click('我需要幫忙');const help=await read();await click('回到村莊');await click('繼續任務');after=await read();check(after.help&&after.focusElapsedMs===help.focusElapsedMs&&after.focusStartedAt===help.focusStartedAt,'help remains paused');
  await reload();check((await read()).help,'reload preserves task');check(await run('document.documentElement.scrollWidth<='+width),'no horizontal overflow');
 }
 for(const phase of ['preparing','finishing']) {await seed({...base,phase,deadline:null,focusStartedAt:null,remaining:33});await click('回到村莊');await click('繼續任務');const after=await read();check(after.phase===phase&&after.remaining===33&&after.orbs===41,'preserve '+phase);}
 await seed({...base,deadline:Date.now()+1800,focusElapsedMs:898200,focusStartedAt:Date.now()});await click('回到村莊');await waitDue();check((await read()).phase==='active'&&(await read()).orbs===41,'due in village no reward');await click('繼續任務');check(await run(`!!document.querySelector('[data-testid="task-due-reminder"]')`),'due reminder on return');
 await seed({...base,phase:'ready',deadline:null,focusStartedAt:null});check(await run(`!!document.querySelector('[aria-label="開始任務"]')`),'ready still start');await click('開始任務');check(await run(`!!document.querySelector('[data-testid="mission-stage"]')`),'normal start preserved');
 console.log('PASS 320/390 actual village/resume from task and focus; ongoing timer, help/preparing/finishing/reload preserved; all cottages usable; world switch/reset locked during task; due catchup no award; normal fresh start unchanged');
} finally {proc.kill('SIGTERM')}
