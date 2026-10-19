import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19276;
const userData = '/tmp/holton-wish-catalog-profile';
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
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/wish-catalog/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready();
 const seed={version:1,title:'寫作業',minutes:5,cardId:'mini-fighter',orbs:500,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],shopEnabled:true,wishes:[{id:'wish-0',name:'原本的小禮物',cost:17,enabled:true},{id:'wish-1',name:'喜歡的飲料',cost:20,enabled:false},{id:'wish-2',name:'親子遊戲 15 分鐘',cost:20,enabled:true},{id:'wish-3',name:'一起看電影',cost:60,enabled:false}],wishReceipts:[{id:'old',name:'舊心願',cost:5,at:'2026-10-18T08:00:00Z'}]};
 await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))})`); await reload();await click('設定');
 const input=async(label,value)=>{await run(`(()=>{const el=document.querySelector('input[aria-label="'+${JSON.stringify(label)}+'"]');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(150)};
 check(await run(`document.querySelectorAll('input[aria-label^="獎勵名稱 "]').length===13`),'10 originals 3 custom');
 await click('儲存生活獎勵');check((await read()).wishes.length===13&&(await read()).wishes[0].cost===17&&(await read()).wishReceipts[0].id==='old','migration preserves old data');
 const names=['喜歡的點心','自選室內活動','自選戶外活動','自選活動','戶外冒險','自選遊戲'];
 for(const name of names){await input(name+'點數','10');await click(name+'：未開放')}
 await input('獎勵名稱 11','一起做餅乾');await input('一起做餅乾點數','25');await input('小約定 custom-1','週末一起做');await click('custom-1 星光卷軸');await click('一起做餅乾：未開放');
 await click('＋新增自訂卡');await click('＋新增自訂卡');check(!await run(`document.querySelector('[aria-label="＋新增自訂卡"]')`),'five custom max');await click('儲存生活獎勵');
 await run(`document.querySelector('[aria-label="custom-1 星光卷軸"]').scrollIntoView({block:'center'})`);await shot('custom-settings');
 await click('回到世界');await click('✧ 心願小舖');
 for(const name of names)check(await run(`!!document.querySelector('[aria-label="我想兌換'+${JSON.stringify(name)}+'"]')`),'new original '+name);
 check(!await run(`document.body.innerText.includes('填入你的心願')`),'empty slots hidden');
 await click('我想兌換一起做餅乾');await click('我想兌換喜歡的點心');
 await run(`document.querySelector('[aria-label="取消選擇一起做餅乾"]').scrollIntoView({block:'center'})`);await shot('scroll-in-shop');
 await click('確認兌換 2 項 · 35 點');check((await read()).orbs===465&&(await read()).wishReceipts.length===3,'custom and original batch');
 let saved=(await read()).wishReceipts.find(r=>r.name==='一起做餅乾');check(saved.note==='週末一起做'&&saved.style==='scroll','snapshot');
 await reload();await click('設定');await input('獎勵名稱 11','改名的心願');await input('改名的心願點數','80');await click('custom-1 水晶寶箱');await click('儲存生活獎勵');
 saved=(await read()).wishReceipts.find(r=>r.name==='一起做餅乾');check(saved.cost===25&&saved.style==='scroll'&&saved.note==='週末一起做','snapshot immutable');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});check(await run('document.documentElement.scrollWidth<=320'),'320 no overflow');
 await run(`document.querySelector('[aria-label="custom-1 水晶寶箱"]').scrollIntoView({block:'center'})`);await shot('crystal-settings-320');
 console.log('PASS catalog migration, 10 originals/3-5 custom, original art, custom configure/style/note, empty hidden, combined checkout, immutable snapshot, reload and 320 width');

} finally {proc.kill('SIGTERM')}
