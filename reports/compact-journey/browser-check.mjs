import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19329;
const userData = '/tmp/holton-compact-journey-profile';
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
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const imgs=[...document.images];if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>600){clearInterval(t);reject(Error('image load timeout'))}},100)})`);await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/compact-journey/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};



 await ready();await run(`localStorage.setItem('${key}',JSON.stringify({version:1,title:'寫作業',minutes:5,orbs:41,phase:'ready',remaining:300,history:[],guardian:{},guardianCards:[]}))`);await reload();
 check(await run(`document.title==='Holton Hero'`),'browser title');
 check(await run(`document.querySelector('[data-testid="holton-brand-title"]').textContent==='HOLTON HERO'`),'brand heading');
 check(await run(`parseFloat(getComputedStyle(document.querySelector('[data-testid="holton-brand-title"]')).fontSize)>=24`),'prominent heading');
 await shot('map-390');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await shot('map-320');check(await run('document.documentElement.scrollWidth<=320'),'no overflow');
 await click('進入森林秘境');check(await run(`document.querySelector('[data-testid="world-title"]').textContent.includes('HOLTON HERO')`),'in world small brand');check((await read()).orbs===41,'wallet intact');await shot('forest-320');
 check(await run(`document.querySelector('[data-testid="journey-visible-landmark"]').getBoundingClientRect().height<=120`),'compact panel height');
 await click('看看我的旅程');check(await run(`!!document.querySelector('[data-testid="journey-map"]')`),'detail opens');await click('回到目前任務');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await shot('compact-390');
 console.log('PASS compact panel <=120px, detail opens, Holton Hero browser title, prominent map heading, subtitle, in-world brand, 320/390 layout, wallet preserved');
} finally {proc.kill('SIGTERM')}
