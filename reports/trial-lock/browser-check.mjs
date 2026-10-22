import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19359;
const userData = '/tmp/holton-pin-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19105/';
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
 const click=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"],button')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(500)};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready: '+await run('document.body.innerText'))};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/spotlight-responsive/${name}.png`,Buffer.from(r.data,'base64'))};


 await wait(1200);
 const input=async(label,value)=>{await run(`(()=>{const el=document.querySelector('[aria-label="${label}"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100)};
 const {randomInt}=await import('node:crypto');const pin=String(randomInt(100000,999999)),newPin=String(randomInt(100000,999999));
 await run('localStorage.clear();location.reload()');await wait(1300);
 const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true};
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('holton-guardian-app::spotlight-v1',JSON.stringify({main:true,companions:true,wishes:true,parent:true}));location.reload()`);await wait(1200);
 check(await run("document.body.innerText.includes('設定家長密碼')"),'initial setup required');
 await input('6 位數家長密碼',pin);await input('再次輸入家長密碼',pin);await click('繼續設定');
 const recovery=await run(`document.body.innerText.match(/[a-f0-9]{32}/)[0]`);
 await click('已妥善保存，啟用家長密碼');await ready();check((await read()).orbs===48,'setup preserves points');
 await click('家長小屋');await input('6 位數家長密碼','000000');await click('確認');check(await run("document.body.innerText.includes('家長密碼不正確')"),'wrong pin denied');
 await input('6 位數家長密碼',pin);await click('確認');await click('設定與教學');await click('修改家長密碼');await input('6 位數家長密碼',pin);await click('確認');await input('6 位數家長密碼',newPin);await input('再次輸入家長密碼',newPin);await click('繼續設定');
 const recovery2=await run(`document.body.innerText.match(/[a-f0-9]{32}/)[0]`);check(recovery!==recovery2,'recovery rotated');await click('已妥善保存，啟用家長密碼');await click('回到村莊');await click('家長小屋');
 await input('6 位數家長密碼',pin);await click('確認');check(await run("document.body.innerText.includes('家長密碼不正確')"),'old pin denied');await click('忘記密碼，使用復原碼');await input('家長復原碼',recovery2);await click('確認');await input('6 位數家長密碼',pin);await input('再次輸入家長密碼',pin);await click('繼續設定');await click('已妥善保存，啟用家長密碼');
 check((await read()).orbs===48,'recovery preserves points');await click('回到村莊');await reload();await click('家長小屋');
 for(const [width,height] of [[320,740],[768,1024],[1024,768],[1366,900]]){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1100});check(await run('document.documentElement.scrollWidth<=innerWidth'),'no overflow '+width);}
 await input('6 位數家長密碼',pin);await click('確認');await run("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden");await wait(300);check(!await run("!!document.querySelector('[data-testid=parent-content]')"),'background locks settings');await click('家長小屋');
 const stored=await run("localStorage.getItem('holton-parent-lock-v1')");check(!stored.includes(pin)&&!stored.includes(recovery2),'no plaintext persisted');
 for(let i=0;i<5;i++){await input('6 位數家長密碼','000000');await click('確認');}await input('6 位數家長密碼',pin);await click('確認');check(await run("document.body.innerText.includes('一分鐘')"),'throttle blocks correct pin temporarily');
 console.log('PASS initial setup, wrong/correct PIN, change, recovery, no points changes, reload, 4 viewports, hashed storage, throttle');
}finally{proc.kill();}
