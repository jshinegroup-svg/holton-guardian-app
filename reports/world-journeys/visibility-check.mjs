import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19296;
const userData = '/tmp/holton-world-journey-profile';
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
 const click=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(220)};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body?.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready')};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const imgs=[...document.images];if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>600){clearInterval(t);reject(Error('image load timeout'))}},100)})`);await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/world-journeys/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready();await run(`localStorage.setItem('${key}',JSON.stringify({version:1,title:'國語作業',minutes:5,orbs:41,phase:'ready',remaining:300,history:[],guardian:{},guardianCards:[],journeys:{version:1,counts:{sky:2,forest:0,cosmos:0},legacyCredit:0}}))`);await reload();
 check(await run(`JSON.stringify([...document.querySelectorAll('[data-testid^="world-node-"]')].map(e=>e.dataset.testid))==='["world-node-sky","world-node-forest","world-node-cosmos"]'`),'world order');
 await shot('map-ordered');await click('進入天空基地');
 check(await run(`!!document.querySelector('[data-testid="journey-visible-landmark"] img')`),'visible landmark');await shot('landmark-home');
 await run(`let s=JSON.parse(localStorage.getItem('${key}'));s.journeys.event={id:'visibility-test',world:'sky',step:2};localStorage.setItem('${key}',JSON.stringify(s))`);await reload();await wait(3500);
 check(await run(`!!document.querySelector('[data-testid="journey-reveal"]')`),'story should remain visible');
 await click('對照完成前');check(await run(`document.body.innerText.includes('完成前')`),'before');await click('看點亮後');await shot('landmark-reveal');await click('看到了，繼續旅程');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});check(await run('document.documentElement.scrollWidth<=320'),'overflow');
 console.log('PASS world order, persistent home landmark, manual story dismissal, before/after, 320 width');

} finally {proc.kill('SIGTERM')}
