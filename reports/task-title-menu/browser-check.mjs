import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19367;
const userData = '/tmp/holton-taskmenu-profile';
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
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{if([...document.images].every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>400){clearInterval(t);reject(Error('images not loaded'))}},100)})`);await run('window.scrollTo(0,0)');await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/task-title-menu/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};
 await wait(1200);await seed(base);await click('開始任務');
 const open=async()=>{await run(`document.querySelector('[data-testid="task-title-entry"]').click()`);await wait(200)};
 const entry=()=>run(`document.querySelector('[data-testid="task-title-entry"]').textContent`);
 const setInput=async value=>{await run(`(()=>{const e=document.querySelector('[aria-label="自訂任務名稱"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100)};
 for(const width of [390,320]){await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});check(await run(`![...document.querySelectorAll('[role="button"]')].some(e=>['換個任務','選得更清楚'].includes(e.getAttribute('aria-label')))`),'no permanent extra buttons');await shot('ready-'+width);const before=await read();await open();check(await run(`!!document.querySelector('[data-testid="task-actions-panel"]')`),'title opens menu');await shot('menu-'+width);await click('取消，保留原任務');check(JSON.stringify(await read())===JSON.stringify(before),'cancel unchanged');check(await run(`document.documentElement.scrollWidth<=${width}`),'no overflow');}
 await open();await click('選得更清楚');await shot('details-320');await click('細項：數學作業');check((await read()).title==='數學作業','detail save');check((await entry()).includes('數學作業'),'entry updates');await reload();await click('開始任務');check((await entry()).includes('數學作業'),'reload persists');
 await open();await click('換個任務');await click('任務類別：幫忙家務');check((await read()).title==='幫忙家務','category changed');await open();await click('選得更清楚');await click('細項：收玩具');check((await read()).title==='收玩具','new category details');
 await open();await click('選得更清楚');await click('細項：其他');await setInput('收好桌上的五本書');await click('儲存自訂任務');check((await read()).title==='收好桌上的五本書','custom detail');
 await open();await click('換個任務');await click('自訂任務');await setInput('');await click('儲存自訂任務');check((await read()).title==='收好桌上的五本書','empty does not save');await click('取消修改任務');
 await seed({...base,title:'自訂的一件事',taskCategory:'custom'});await click('開始任務');await open();await click('選得更清楚');check(await run(`!!document.querySelector('[aria-label="自訂任務名稱"]')`),'custom title can refine');await setInput('整理抽屜第一格');await click('儲存自訂任務');check((await read()).title==='整理抽屜第一格','custom refine saves');
 check((await read()).orbs===41&&(await read()).minutes===15&&(await read()).history.length===0,'no point or timer changes');
 await click('準備出發');check(await run(`!document.querySelector('[data-testid="task-title-entry"]')`),'preparing cannot edit');await click('我準備好了，開始！');check(await run(`!document.querySelector('[data-testid="task-title-entry"]')&&!document.querySelector('[data-testid="task-actions-panel"]')`),'active cannot edit');check(await disabled(),'completion gate retained');check(await run(`!!document.querySelector('[data-testid="focus-world-art"]')`),'glass focus retained');
 await seed({...base,title:''});await click('開始任務');check(await run(`!!document.querySelector('[aria-label="任務類別：寫作業"]')`),'fresh task picker retained');await click('任務類別：寫作業');await open();await click('選得更清楚');await click('細項：國語作業');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await shot('final-ready-390');
 console.log('PASS title tap opens two options; no permanent buttons;320/390; cancel no writes; category/detail/custom save and reload; blank rejected; unknown category refinement; fresh picker; no edits preparing/active; unchanged points/time; glass and completion gate retained');
} finally {proc.kill('SIGTERM')}
