import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19377;
const userData = '/tmp/holton-away-share-profile';
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
 const shot=async name=>{await wait(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/task-away-sound/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 const notes=()=>run('window.__chimeStarts');
 const waitDue=async()=>{for(let i=0;i<80;i++){if((await read()).taskReminderShown)return;await wait(150)}throw Error('reminder not triggered')};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/[0-9]+/g).map(Number),e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('確認進入')};
 await wait(1500);await seed(base);await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{if([...document.images].every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>300){clearInterval(t);reject(Error('image load'))}},100)})`);await shot('clean-focus-390');console.log('PASS capture latest clean focus');
} finally {proc.kill('SIGTERM')}
