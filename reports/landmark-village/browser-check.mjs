import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19359;
const userData = '/tmp/holton-landmark-profile';
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
 const rawClick=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(220)};
 const unlock=async()=>{if(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`))return;await run(`(()=>{const q=document.querySelector('[data-testid="parent-gate-question"]').textContent.match(/\\d+/g).map(Number);const e=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(q[0]+q[1]));e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);await rawClick('確認進入')};
 const click=async label=>{await rawClick(label);await unlock()};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body?.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready')};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready();if(await run(`!!document.querySelector('[data-testid="welcome-guide"]')`))await rawClick('先逛村莊，跳過說明')};
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const imgs=[...document.images];if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>600){clearInterval(t);reject(Error('image load timeout'))}},100)})`);await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/landmark-village/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};




 const body=()=>run('document.body.innerText');
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,title:'收好積木',minutes:5,cardId:'mini-fighter',orbs:41,phase:'ready',deadline:null,remaining:300,history:[],guardian:{},guardianCards:[{cardId:'tidefin:0',at:'2026-10-19',cost:10,source:'sunday'}],companionCardId:'tidefin:0',dailyGoal:20,reduceMotion:true,activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0}};
 await ready();await seed(base);
 check(await run(`!!document.querySelector('[data-testid="adventure-village"]')`),'village startup');await shot('village-390');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await shot('village-320');check(await run('document.documentElement.scrollWidth<=320'),'no overflow 320');

 await seed({...base,reduceMotion:false});
 check(await run(`document.querySelectorAll('[data-testid="village-integrated-map"]').length===1 && !document.querySelector('[data-testid="cottage-crop"]')`),'single integrated image, no sprite cards');
 const roofDoor=[['map',25,9,26,24],['wishes',78,16,75,27],['companions',28,48,29,62],['parent',79,49,79,69]];
 const point=async(x,y)=>run(`(()=>{const e=document.querySelector('[data-testid="village-integrated-map"]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width*${x}/100,y:r.y+r.height*${y}/100}})()`);
 for(const width of [320,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  for(const [id,rx,ry,dx,dy] of roofDoor)for(const [x,y] of [[rx,ry],[dx,dy]]){const p=await point(x,y);check(await run(`document.elementFromPoint(${p.x},${p.y})?.closest('[role="button"]')?.getAttribute('data-testid')===${JSON.stringify('cottage-'+id)}`),'visual roof/door hit aligned '+id+' '+width);}
  check(await run(`document.documentElement.scrollWidth<=${width}`),'no map overflow');await shot('map-aligned-'+width);
 }
 const bounds=await run(`(()=>{const r=document.querySelector('[data-testid="village-integrated-map"]').getBoundingClientRect();return {w:r.width,h:r.height}})()`);check(Math.abs(bounds.w/bounds.h-2/3)<.01,'map aspect preserved');
 await seed({...base,reduceMotion:false});check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).animationName==='village-door-light'`),'entry glow');
 const opacity=await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).opacity`);await wait(650);check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).opacity!==${JSON.stringify(opacity)}`),'light changes');
 check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).animationIterationCount==='3'`),'finite glow');
 for(const [id,,,dx,dy] of roofDoor){const p=await point(dx,dy);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(180);check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-${id}"]')).backgroundColor==='rgba(255, 227, 153, 0.22)'`),'pressed map response '+id);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(250);
 if(id==='parent')await unlock();const text=await body();check(id==='map'?await run(`!!document.querySelector('[data-testid="world-map"]')`):text.includes(id==='wishes'?'和大人一起約定':id==='companions'?'你的夥伴與收藏':'一起約定目標與獎勵'),'map house destination '+id);await click('回到村莊');}
 const plaza=await point(51,44);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[plaza]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(await run(`!!document.querySelector('[data-testid="village-integrated-map"]')`),'blank plaza not a link');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(200);check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).animationName==='none'`),'system reduce motion');await send('Emulation.setEmulatedMedia',{features:[]});await seed(base);check(await run(`getComputedStyle(document.querySelector('[data-testid="cottage-halo"]')).animationName==='none'`),'app reduce motion');
 await send('Page.bringToFront');await run(`document.querySelector('[data-testid="cottage-parent"]').focus()`);await wait(150);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(200);await unlock();check((await body()).includes('一起約定目標與獎勵'),'keyboard map access');await click('回到村莊');
 const before=await read();await click('冒險地圖');check(await run(`!!document.querySelector('[data-testid="world-map"]')`),'map opens');check(await run(`document.querySelector('[aria-label="尚未解鎖天空基地"]').getAttribute('aria-disabled')==='true'`),'sky lock unchanged');await click('回到村莊');
 await click('心願小屋');check((await body()).includes('生活獎勵尚未開放'),'disabled shop accessible');await click('家長管理心願');check((await body()).includes('生活獎勵：關閉'),'direct reward settings');check(!(await body()).includes('1 · 設定今天的一件事'),'settings separated');await click('回到心願小屋');await click('回到村莊');
 await click('夥伴小屋');await click('我的守護獸收藏');check((await body()).includes('已收藏 1 張'),'collection preserved');await click('回到夥伴小屋');await click('世界卡換點數');await click('回到夥伴小屋');await click('回到村莊');check(JSON.stringify(await read())===JSON.stringify(before),'navigation makes no data writes');
 await click('家長小屋');check(!(await body()).includes('生活獎勵：關閉'),'rewards not stuffed in task pane');await click('完成紀錄');check((await body()).includes('今天還沒有完成紀錄'),'records pane');await click('設定與教學');check((await body()).includes('減少動畫：開啟'),'preferences pane');await shot('parent-320');await click('回到村莊');
 await click('開始任務');await click('準備出發');await reload();check(!(await body()).includes('冒險村莊'),'preparing resumes');check((await read()).phase==='preparing','preparing phase');await click('我準備好了，開始！');const deadline=(await read()).deadline;await reload();check((await read()).deadline===deadline,'active deadline retained');check(await run(`!document.querySelector('[data-testid="adventure-village"]')`),'active direct resume');await click('完成');await reload();check((await read()).phase==='finishing','finishing resumes');await run(`document.querySelector('[data-testid="mission-stage"] [data-testid="primary-action"]').click()`);await wait(500);check((await read()).orbs===42 && (await read()).history.length===1 && (await read()).journeys.counts.forest===5,'one task award and milestone');
 await seed({...base,phase:'done'});await click('開始任務');check((await read()).phase==='ready','done start resets to ready');check((await read()).orbs===41,'done start no reward');
 await run('localStorage.clear()');await reload();check((await read()).orbs===0,'fresh zero');check((await read()).shopEnabled===true&&(await read()).wishes.length===10&&(await read()).wishes.every(w=>w.cost>0&&w.enabled),'fresh recommendations ready');await click('家長小屋');await click('心願獎勵');check(await run(`document.querySelector('[aria-label="小禮物點數"]').value==='100'`),'prefilled toy');await run(`(()=>{const e=document.querySelector('[aria-label="小禮物點數"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'77');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('儲存生活獎勵');check((await read()).wishes.find(w=>w.id==='wish-0').cost===77,'parent can override');await reload();check((await read()).wishes.find(w=>w.id==='wish-0').cost===77,'custom price survives');await click('家長小屋');await run(`(()=>{const e=document.querySelector('[aria-label="今日任務數"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'4');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('儲存每日目標');check((await read()).dailyGoal===4,'save goal without task');await click('回到村莊');await click('開始任務');check((await body()).includes('點一下就選好'),'fresh starts picker');
 await seed({...base,shopEnabled:true,wishes:[{id:'wish-0',name:'小禮物',cost:10,enabled:true},{id:'wish-1',name:'喜歡的飲料',cost:5,enabled:true}]});await click('心願小屋');await click('我想兌換小禮物');await click('我想兌換喜歡的飲料');check((await read()).orbs===41,'selection no debit');await click('移除小禮物');await click('確認兌換 1 項 · 5 點');check((await read()).orbs===36&&(await read()).wishReceipts.length===1,'checkout atomic');await reload();check((await read()).orbs===36&&(await read()).wishReceipts.length===1,'checkout survives reload');await click('心願小屋');check((await body()).includes('待實現'),'receipt visible');await click('回到村莊');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await shot('final-village-390');
 console.log('PASS single integrated map; 320/390 roof/door hit alignment; all4 real touch destinations/feedback; blank-ground inert; keyboard; finite glow; both reduced-motion modes; 320/390 village, all four destinations/back links, parent tabs, fresh goal/no title, task picker, disabled shop, unchanged navigation state, old collections, map locks, preparing/active/finishing resumes, one reward/milestone, done restart, wish cancel/checkout/reload');
} finally {proc.kill('SIGTERM')}
