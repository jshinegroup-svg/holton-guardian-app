import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19306;
const userData = '/tmp/holton-chapter-scenery-profile';
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
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const imgs=[...document.images];if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>600){clearInterval(t);reject(Error('image load timeout'))}},100)})`);await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/chapter-scenery/${name}.png`,Buffer.from(r.data,'base64'))};


 await ready();
 const base={version:1,title:'國語作業',minutes:5,cardId:'mini-fighter',orbs:41,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],dailyGoal:20,reduceMotion:true};
 const seed=async(w,n)=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify({...base,activeWorld:w,journeys:{version:1,counts:{sky:w==='sky'?n:15,forest:w==='forest'?n:w==='cosmos'?15:0,cosmos:w==='cosmos'?n:0},legacyCredit:0}}))})`);await reload()};
 const names={sky:'天空基地',forest:'森林秘境',cosmos:'宇宙遠征'};
 await seed('sky',0);
 check(await run(`JSON.stringify([...document.querySelectorAll('[data-testid^="world-node-"]')].map(e=>e.dataset.testid))==='["world-node-sky","world-node-forest","world-node-cosmos"]'`),'ordered');
 check(await run(`getComputedStyle(document.querySelector('[data-testid="world-region-cosmos"] [data-testid="map-scenery"]')).filter.includes('grayscale')`),'locked grayscale');
 check(await run(`document.querySelector('[aria-label="尚未解鎖宇宙遠征"]').getAttribute('aria-disabled')==='true'`),'cosmos locked');
 check(await run(`document.querySelector('[data-testid="world-node-sky"]').getBoundingClientRect().width<=220`),'compact node');
 await shot('map-390');
 for(const w of ['sky','forest','cosmos']){
  const urls=[];
  for(const n of [0,4,5,9,10,15]){
   await seed(w,n);await click('進入'+names[w]);
   const src=await run(`document.querySelector('[data-testid="world-scene-home"] img').src`);urls.push(src);
   check((await read()).orbs===41,'wallet unchanged');
   if([0,5,10].includes(n))await shot(w+'-'+n);
  }
  check(urls[0]===urls[1]&&urls[2]===urls[3]&&urls[4]===urls[5]&&new Set(urls).size===3,'three chapter boundaries '+w);
 }
 // Actual completion must change scenery, persist once and show before/after.
 await seed('sky',4);await click('進入天空基地');
 const before=await run(`document.querySelector('[data-testid="world-scene-home"] img').src`);
 await click('準備出發');await click('我準備好了，開始！');await click('完成');
 const label=await run(`[...document.querySelectorAll('[role="button"]')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&x!=='設定'&&x!=='還有一點，回去繼續')[0]`);
 await click(label);check((await read()).journeys.counts.sky===5&&(await read()).orbs===42,'completion atomic');
 const after=await run(`document.querySelector('[data-testid="chapter-reveal-scene"] img').src`);check(after!==before,'scene changed on fifth');
 await click('對照完成前');check(await run(`document.querySelector('[data-testid="chapter-reveal-scene"] img').src`)===before,'before scene');await click('看點亮後');await shot('chapter-reveal');
 await reload();check((await read()).orbs===42&&(await read()).journeys.counts.sky===5,'reload no new grant');await click('看到了，繼續旅程');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await seed('sky',0);await shot('map-320');check(await run('document.documentElement.scrollWidth<=320'),'no overflow');
 console.log('PASS map order, locked grayscale, compact nodes, all 9 scenes, 0/4/5/9/10/15 boundaries, real completion before/after, unchanged wallet, reload idempotency, 320/390');
} finally {proc.kill('SIGTERM')}
