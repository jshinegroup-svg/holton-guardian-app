import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19255;
const userData = '/tmp/holton-immersive-v2-profile';
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
 await ready();await run(`localStorage.setItem('${key}',JSON.stringify({version:1,title:'整理書包',minutes:5,cardId:'mini-fighter',orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{coreGuardianId:'tidefin',coreGuardianName:'小浪'},guardianCards:[],dailyGoal:3}));localStorage.setItem('sky-test-preserve','untouched')`);await reload();
 await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const imgs=[...document.images].filter(i=>i.src.includes('mini-fighter'));if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(timer);resolve(true)}else if(++tries>150){clearInterval(timer);reject(Error('original art load timeout'))}},100)})`);
 check(await run('document.documentElement.scrollWidth<=innerWidth'),'390 no overflow');await shot('home-390');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await wait(250);check(await run('document.documentElement.scrollWidth<=innerWidth'),'320 no overflow');await shot('home-320');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 for(let i=0;i<4;i++) await click('下一張時間卡');await click('準備出發');check((await read()).taskReward===5 && (await read()).deadline===null,'prep snapshot no timing');
 check(await run("!document.querySelector('[data-testid=sky-base-hero]')&&!document.body.innerText.includes('基地收藏室')"),'focus hides hero and collections');
 await shot('preparing');await reload();check((await read()).phase==='preparing'&&(await read()).taskReward===5,'preparing reload retains reward');
 await click('我準備好了，開始！');check((await read()).deadline!==null,'explicit start timer');await shot('active');
 await click('我需要幫忙');await click('選擇深呼吸卡');let s=await read();check(s.help&&s.deadline===null&&s.orbs===48,'help pauses no penalty');await shot('help');
 await reload();check((await read()).supportCardId==='breathe','help reload');await click('我準備好了，繼續');await click('完成');check((await read()).orbs===48,'no credit until cleanup');await shot('finishing');
 await run(`document.querySelectorAll('[role=button]')[0] && 0`);
 // Completion button varies by contextual encouragement; locate the first button after finishing copy other than parent.
 const finishLabel=await run("[...document.querySelectorAll('[role=button]')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&x!=='設定'&&x!=='還有一點，回去繼續')[0]");
 await click(finishLabel);s=await read();check(s.orbs===53&&s.history[0].reward===5&&s.rewardProgress===1,'25min exactly +5 and one draw progress');await shot('done');
 await reload();check((await read()).orbs===53,'reload no duplicate reward');
 await click('設定');check(await run("document.body.innerText.includes('＋5 能量球')"),'settings actual receipt');await click('減少動畫');check((await read()).reduceMotion===true,'reduced motion saved');await reload();check((await read()).reduceMotion===true,'setting persists');
 // Isolated synthetic second round near milestone; preserve earlier real interactions in history.
 await run(`const s=JSON.parse(localStorage.getItem('${key}'));s.phase='ready';s.cardId='mini-warrior';s.minutes=3;s.remaining=180;s.rewardProgress=2;localStorage.setItem('${key}',JSON.stringify(s))`);await reload();
 await click('準備出發');await click('我準備好了，開始！');await click('完成');const finish2=await run("[...document.querySelectorAll('[role=button]')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&x!=='設定'&&x!=='還有一點，回去繼續')[0]");await click(finish2);
 s=await read();check(s.orbs===54&&s.draws.length===1&&s.rewardProgress===0,'one-point task milestone draw');await click('抽一張世界卡');s=await read();check(s.collection.length===1,'draw stored');await reload();check((await read()).collection.length===1,'draw reload stable');await click('收下世界卡');
 await click('再選一張任務卡');await click('上一張時間卡');await click('準備出發');await click('我準備好了，開始！');s=await read();check(s.minutes===0&&s.deadline===null&&s.taskReward===5,'untimed reward snapshot');
 await click('我需要幫忙');await click('選擇休息卡');s=await read();check(s.breakDeadline>Date.now()&&s.deadline===null,'rest separate clock');
 await run(`const s=JSON.parse(localStorage.getItem('${key}'));s.breakDeadline=Date.now()-1000;localStorage.setItem('${key}',JSON.stringify(s))`);await reload();check((await read()).help&&(await read()).deadline===null,'rest expiry still paused');check(await run("document.body.innerText.includes('休息時間到了')"),'rest expiry reminder');await click('休息好了，繼續');check((await read()).deadline===null,'untimed resumes untimed');
 check(await run("localStorage.getItem('sky-test-preserve')==='untouched'"),'unrelated storage preserved');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('設定');check(await run("document.body.innerText.includes('裝置已設定減少動態效果')"),'system reduced-motion respected');
 console.log('PASS Sky Base: 320/390 layout, original cards, focus mode, prep/active/help/finish/reload, reward tiers, historical receipts, reduced motion local+system, one milestone draw, untimed and rest timer, unrelated storage.');
} finally {proc.kill('SIGTERM')}
