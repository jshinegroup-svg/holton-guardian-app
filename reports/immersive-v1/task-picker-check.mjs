import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19246;
const userData = '/tmp/holton-taskpicker-v1-profile';
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
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/immersive-v1/${name}.png`,Buffer.from(r.data,'base64'))};
 await ready();await run(`localStorage.setItem('${key}',JSON.stringify({version:1,title:'',minutes:5,cardId:'mini-fighter',orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[{id:'old',title:'舊任務',minutes:5,at:'2026-10-18T00:00:00Z'}],guardian:{coreGuardianId:'tidefin'},guardianCards:[],dailyGoal:3}));localStorage.setItem('unrelated-legacy-test','keep')`);await reload();
 check(await run("!document.body.innerText.includes('家長入口')&&!document.body.innerText.includes('小朋友入口')"),'no role entrance');
 await click('準備出發');check((await read()).phase==='ready','blank task cannot start');
 await click('選擇任務');check(await run("document.querySelectorAll('[aria-label^=\"任務類別：\"]').length===5&&!!document.querySelector('[aria-label=自訂任務]')"),'six choices');
 check(await run("!document.querySelector('input[aria-label=自訂任務名稱]')"),'no typing by default');await shot('task-menu');
 await click('任務類別：寫作業');check((await read()).title==='寫作業'&&(await read()).taskCategory==='homework','one tap select');
 await reload();check((await read()).title==='寫作業','task persists');await click('選得更清楚');await click('細項：數學作業');check((await read()).title==='數學作業','optional detail');
 for(const category of ['幫忙家務','閱讀／練習','生活自理','特殊任務']){await click('修改任務');await click('任務類別：'+category);check((await read()).title===category,'category '+category)}
 await click('修改任務');await click('自訂任務');
 const fill=async value=>{await run(`(()=>{const el=document.querySelector('input[aria-label="自訂任務名稱"]');el.focus();el.select()})()`);await send('Input.insertText',{text:value});await wait(120)};
 await fill('   ');await click('儲存自訂任務');check((await read()).title==='特殊任務','empty custom rejected');check(await run("document.body.innerText.includes('先填一個任務名稱')"),'empty message');
 await fill('這個不要儲存');await click('取消修改任務');check((await read()).title==='特殊任務','cancel preserves');
 await click('修改任務');await click('自訂任務');await fill('數學習作第 12 頁');await click('儲存自訂任務');check((await read()).title==='數學習作第 12 頁','custom saved');
 await click('選擇 Turbo Knight 10 分鐘');await click('準備出發');check((await read()).title==='數學習作第 12 頁'&&(await read()).taskReward===2,'category does not change time reward');
 check(await run("!document.querySelector('[aria-label=修改任務]')"),'preparing locked');await click('我準備好了，開始！');
 check(await run("!!document.querySelector('[data-testid=world-scene-focus]')"),'focus scene');
 await click('設定');check(await run("!document.querySelector('[aria-label=儲存任務]')&&document.querySelector('input[aria-label=任務名稱]').readOnly"),'settings task edit locked');await click('回到世界');
 await click('我需要幫忙');check(await run("!!document.querySelector('[data-testid=world-scene-rest]')"),'rest scene');await click('選擇休息卡');await shot('rest-scene');await click('休息好了，繼續');
 check(await run("!!document.querySelector('[data-testid=world-scene-focus]')"),'resume focus');await click('完成');const cleanup=await run("[...document.querySelectorAll('[role=button]')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&x!=='設定'&&x!=='還有一點，回去繼續')[0]");await click(cleanup);
 const s=await read();check(s.orbs===50&&s.history.length===2&&s.history[1].title==='數學習作第 12 頁'&&s.history[1].reward===2,'exact history and credit');check(s.history[0].title==='舊任務','old record unchanged');
 check(await run("!!document.querySelector('[data-testid=world-scene-home]')"),'done home');await reload();check((await read()).orbs===50,'no duplicate credit');check(await run("localStorage.getItem('unrelated-legacy-test')==='keep'"),'legacy untouched');
 await click('再選一張任務卡');await click('修改任務');await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await shot('task-menu-320');check(await run('document.documentElement.scrollWidth<=innerWidth'),'picker narrow viewport');
 console.log('PASS: six categories, no forced typing, optional details, custom blank/cancel/save, persisted title, active editing locks, 3 scenes, exact reward/history, original data and 320 picker.');
}finally{proc.kill('SIGTERM')}
