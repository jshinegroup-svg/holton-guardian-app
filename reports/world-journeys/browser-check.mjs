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
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/world-journeys/${name}.png`,Buffer.from(r.data,'base64'))};

 await ready();
 const base={version:1,title:'國語作業',minutes:5,cardId:'mini-fighter',orbs:41,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify({...base,...data}))})`);await reload()};
 const dismissDraw=async()=>{if(await run(`!!document.querySelector('[aria-label="抽一張世界卡"]')`)){await click('抽一張世界卡');await click('收下世界卡')}};
 const finish=async()=>{await click('準備出發');await click('我準備好了，開始！');check(!await run(`!!document.querySelector('[aria-label="世界地圖"]')`),'active hides world switching');await click('我需要幫忙');await click('選擇深呼吸卡');await click('我準備好了，繼續');await click('完成');const label=await run(`[...document.querySelectorAll('[role="button"]')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&x!=='設定'&&x!=='還有一點，回去繼續')[0]`);return label};
 const journey=(sky=0,forest=0,cosmos=0)=>({version:1,counts:{sky,forest,cosmos},legacyCredit:0});
 await seed({});check(await run(`!!document.querySelector('[data-testid="world-map"]')`),'starts at world map');check((await read()).journeys.counts.sky===0,'fresh migration');
 check(await run(`document.querySelector('[aria-label="尚未解鎖森林秘境"]').getAttribute('aria-disabled')==='true'`),'forest locked');await shot('map-390');
 await click('進入天空基地');await click('看看我的旅程');await wait(350);check(await run(`[...document.images].filter(i=>i.src.startsWith('data:image/svg')).length===3&&[...document.images].filter(i=>i.src.startsWith('data:image/svg')).every(i=>i.complete&&i.naturalWidth>0)`),'landmark images render');await shot('sky-journey-0');await click('回到目前任務');
 let label=await finish();check((await read()).journeys.counts.sky===0,'no progress until final cleanup');
 await run(`(()=>{const b=document.querySelector('[aria-label="'+${JSON.stringify(label)}+'"]');b.click();b.click()})()`);await wait(300);
 check((await read()).orbs===42&&(await read()).journeys.counts.sky===1&&(await read()).history.length===1,'single atomic completion');await shot('story-step-1');
 await reload();check((await read()).journeys.counts.sky===1,'reload no repeat');await click('繼續旅程');await click('看看我的旅程');check(await run(`document.body.innerText.includes('基地門前的水晶亮起了')`),'persistent story node');await click('回到目前任務');
 // Save failure must leave points/progress/history unchanged.
 await seed({journeys:journey(4),activeWorld:'sky'});await click('進入天空基地');label=await finish();await run(`window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='${key}')throw Error('synthetic save failure');return window.originalSet.call(this,k,v)}`);await click(label);check((await read()).orbs===41&&(await read()).journeys.counts.sky===4,'write failure atomic');await run('Storage.prototype.setItem=window.originalSet');await click(label);await click('繼續旅程');await click('看看我的旅程');await shot('sky-chapter-1');check((await read()).journeys.counts.sky===5,'chapter1');
 // Boundary transitions in each world; each uses the real task flow and final cleanup.
 for(const [w,name,counts] of [['sky','天空基地',journey(14)],['forest','森林秘境',journey(15,14)],['cosmos','宇宙遠征',journey(15,15,14)]]){
   await seed({journeys:counts,activeWorld:w,rewardProgress:2});await click('進入'+name);await shot(w+'-home');label=await finish();await click(label);await dismissDraw();check((await read()).journeys.counts[w]===15,'unlock boundary '+w);await click('繼續旅程');await click('世界地圖');await shot(w+'-complete-map');
 }
 await click('進入森林秘境');check((await read()).activeWorld==='forest'&&(await read()).orbs===42,'free revisit shared points');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await shot('forest-320');check(await run('document.documentElement.scrollWidth<=320'),'320 no overflow');
 await click('世界地圖');check(await run('document.documentElement.scrollWidth<=320'),'map320 no overflow');await shot('map-320');
 // Legacy history counted once, unrelated storage preserved.
 const oldHistory=Array.from({length:7},(_,i)=>({id:'old'+i,at:'2026-10-18T08:00:00Z',minutes:5,title:'舊任務'}));await seed({history:oldHistory});check((await read()).journeys.counts.sky===7&&(await read()).orbs===41,'legacy credit no reward');await reload();check((await read()).journeys.counts.sky===7,'idempotent migration');
 // Active session reopens directly, not at map.
 await seed({journeys:journey(),phase:'active',deadline:null,minutes:0});check(!await run(`!!document.querySelector('[data-testid="world-map"]')`),'active recovery bypasses map');
 // Non-reduced story auto-dismisses and can still be reviewed.
 await seed({journeys:{...journey(1),event:{id:'auto',world:'sky',step:1}},phase:'done',reduceMotion:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await wait(3500);check(!(await read()).journeys.event,'short story auto-dismiss');
 console.log('PASS world map, locks, all-world task/help/finish, atomic save+double click, reload, persistent story, 5/15 boundaries, draw precedence, all unlocks, free revisits, migration, active recovery, reduced and auto story, 320/390');

} finally {proc.kill('SIGTERM')}
