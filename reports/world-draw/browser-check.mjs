import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19327;
const userData = '/tmp/holton-world-draw-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19097/holton-guardian-app/';
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
    if(msg.method==='Runtime.exceptionThrown')console.error(JSON.stringify(msg.params));
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
 const send=await connect(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const check=(v,m)=>{if(!v)throw Error(m)};
 const key='holton-guardian-app::light-v1';const read=()=>run(`JSON.parse(localStorage.getItem('${key}'))`);
 const click=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(500)};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready: '+await run('document.body.innerText'))};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/world-draw/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready();
 const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'done',deadline:null,remaining:0,help:false,history:[],guardian:{},draws:[{id:'test-draw',reason:'又完成 3 次任務！'}],collection:[]};
 for(const width of [390,320]) {
 await send('Emulation.setDeviceMetricsOverride',{width,height:640,deviceScaleFactor:1,mobile:true});
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))})`);await reload();await wait(500);
 check(await run(`(()=>{const p=document.querySelector('[data-testid="world-draw-panel"]').getBoundingClientRect();const b=document.querySelector('[aria-label="抽一張世界卡"]').getBoundingClientRect();const i=document.querySelector('[aria-label="世界卡黑金卡背"]');return p.left>=0&&p.right<=innerWidth&&b.bottom<=innerHeight&&i&&[...i.querySelectorAll('img')].every(x=>x.complete&&x.naturalWidth>0)})()`),'card and button fit '+width);
 await shot('ready-'+width);
 await run(`(()=>{const b=document.querySelector('[aria-label="抽一張世界卡"]');for(let i=0;i<5;i++)b.click()})()`);await wait(180);
 check(await run(`Number(getComputedStyle(document.querySelector('[data-testid=world-draw-details]')).opacity)<1`),'details withheld during reveal');
 await shot('gather-'+width);await wait(1600);
 check(await run(`Number(getComputedStyle(document.querySelector('[data-testid=world-draw-details]')).opacity)===1`),'details revealed after ritual');
 let state=await read();check(state.collection.length===1&&state.orbs===48,'single draw, no points');const card=state.draws[0].cardId;check(!!card,'draw saved');await shot('revealed-'+width);
 await reload();check((await read()).draws[0].cardId===card&&(await read()).collection.length===1,'same reveal after reload');
 await click('收下世界卡');check((await read()).draws.length===0&&(await read()).collection.length===1,'accept only dismisses');
 }
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))})`);await reload();await run(`document.querySelector('[aria-label="抽一張世界卡"]').click()`);await wait(120);const midway=(await read()).draws[0].cardId;await reload();check((await read()).draws[0].cardId===midway&&(await read()).collection.length===1,'reload mid-animation keeps saved card');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))})`);await reload();await click('抽一張世界卡');await wait(400);check((await read()).collection.length===1,'reduced motion draw');check(await run(`!document.querySelector('[data-testid=world-reveal-ring]')&&Number(getComputedStyle(document.querySelector('[data-testid=world-draw-details]')).opacity)===1`),'reduced motion reveals immediately without ring');
 console.log('PASS 390/320 layout; double-click; persistence; accept; reduced motion; unchanged points');
} finally {proc.kill();}
