import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19266;
const userData = '/tmp/holton-wish-cart-profile';
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
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/wish-cart/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready();
 const seed={version:1,title:'寫作業',minutes:5,cardId:'mini-fighter',orbs:60,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],shopEnabled:true,wishes:[{id:'wish-0',name:'小禮物',cost:15,enabled:true},{id:'wish-1',name:'喜歡的飲料',cost:20,enabled:true},{id:'wish-2',name:'親子遊戲 15 分鐘',cost:20,enabled:true},{id:'wish-3',name:'一起看電影',cost:60,enabled:true}]};
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))})`); await reload();
 await click('✧ 心願小舖');
 await click('我想兌換親子遊戲 15 分鐘');
 check(await run(`document.querySelector('[aria-label="取消選擇親子遊戲 15 分鐘"]').getAttribute('aria-pressed')==='true'`),'selected accessibility state');
 check((await read()).orbs===60,'selection no debit');
 await run(`document.querySelector('[aria-label="取消選擇親子遊戲 15 分鐘"]').scrollIntoView({block:'center'})`);await shot('selected-390');
 await click('取消選擇親子遊戲 15 分鐘');check((await read()).orbs===60,'cancel free');
 await click('選擇親子遊戲 15 分鐘卡片');await click('我想兌換喜歡的飲料');
 check(await run(`document.querySelector('[aria-label="我想兌換一起看電影"]').getAttribute('aria-disabled')==='true'`),'combined balance guard');
 await click('移除喜歡的飲料');await click('我想兌換喜歡的飲料');
 await run(`document.querySelector('[aria-label="確認兌換 2 項 · 40 點"]').scrollIntoView({block:'center'})`);await shot('summary-390');
 await run(`(()=>{const b=document.querySelector('[aria-label="確認兌換 2 項 · 40 點"]');b.click();b.click()})()`);await wait(500);
 check((await read()).orbs===20&&(await read()).wishReceipts.length===2,'atomic batch double click');
 await reload();check((await read()).orbs===20&&(await read()).wishReceipts.length===2,'reload persists');await click('✧ 心願小舖');
 await click('我想兌換小禮物');await click('全部先不換');check((await read()).orbs===20,'clear free');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});
 check(await run('document.documentElement.scrollWidth<=320'),'320 no overflow');await shot('shop-320');
 console.log('PASS: card/button toggles, selected feedback, multi-select, remove/clear without debit, combined funds, atomic double-click, reload, 320 width');

} finally {proc.kill('SIGTERM')}
