import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19256;
const userData = '/tmp/holton-wish-shop-profile';
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
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready')};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/immersive-v2/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready(); await run(`localStorage.setItem('${key}',JSON.stringify({version:1,title:'寫作業',minutes:5,cardId:'mini-fighter',orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[]}))`); await reload();
 check(!await run("document.body.innerText.includes('心願小舖')"),'shop hidden default');
 await click('設定'); await click('生活獎勵：關閉'); check((await read()).shopEnabled,'enabled saved');
 const input=async(label,value)=>run(`(()=>{const el=document.querySelector('input[aria-label="'+${JSON.stringify(label)}+'"]');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await click('小禮物：未開放');await click('儲存生活獎勵');check(!(await read()).wishes,'zero cost rejected');
 await input('小禮物點數','20');await click('儲存生活獎勵');check((await read()).wishes[0].cost===20,'saved price');
 await click('回到世界');await click('✧ 心願小舖');await click('選擇小禮物 · 20 點');check((await read()).orbs===48,'preview free');await click('先不要兌換');check((await read()).orbs===48,'cancel free');await click('選擇小禮物 · 20 點');
 await run(`(()=>{const b=[...document.querySelectorAll('[role=button]')].find(e=>e.getAttribute('aria-label')==='確認心願兌換');b.click();b.click();})()`);await wait(500);
 check((await read()).orbs===28&&(await read()).wishReceipts.length===1,'double click charges once');await shot('wish-shop');await reload();check((await read()).orbs===28&&(await read()).wishReceipts.length===1,'receipt persists');
 await click('設定');await click('標記小禮物已實現');check((await read()).wishReceipts[0].fulfilled&&(await read()).orbs===28,'fulfilled no extra debit');await click('生活獎勵：開啟');await click('回到世界');check(!await run("document.body.innerText.includes('心願小舖')"),'disabled hidden');await reload();check((await read()).orbs===28&&(await read()).wishReceipts.length===1,'disable preserves balance receipts');
 await run(`let s=JSON.parse(localStorage.getItem('${key}'));s.shopEnabled=true;s.orbs=1;localStorage.setItem('${key}',JSON.stringify(s))`);await reload();await click('✧ 心願小舖');check(await run("[...document.querySelectorAll('[role=button]')].find(e=>e.getAttribute('aria-label')==='選擇小禮物 · 20 點').getAttribute('aria-disabled')==='true'"),'insufficient disabled');
 console.log('PASS shop: opt-in, validation, editable prices, preview/cancel, duplicate-click, debit, reload, fulfillment, disable/preserve, insufficient balance');
} finally {proc.kill('SIGTERM')}
