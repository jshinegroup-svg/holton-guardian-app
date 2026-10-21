import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19348;
const userData = '/tmp/holton-guide-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19097/holton-guardian-app/';
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
 const guideKey='holton-guardian-app::spotlight-v1';
 const seed={version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,title:'整理書包',minutes:5,orbs:48,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},draws:[],collection:[],guardianCards:[],shopEnabled:true};
 const setSeed=async(guide)=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('${guideKey}',${JSON.stringify(JSON.stringify(guide))})`);await reload();};
 const done={main:true,companions:true,wishes:true,parent:true};
 const step=async n=>{for(let i=0;i<40;i++){if(await run(`document.querySelector('[data-testid=spotlight-tip]')?.textContent.includes('· ${n}／')`))return;await wait(100)}throw Error('missing guide step '+n+': '+await run('document.body.innerText'))};
 const parent=async()=>{await click('家長小屋');const q=await run(`document.querySelector('[data-testid=parent-gate-question]').textContent`);const nums=q.match(/\d+/g).map(Number);await run(`(()=>{const el=document.querySelector('[aria-label="家長確認答案"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'${nums[0]+nums[1]}');el.dispatchEvent(new Event('input',{bubbles:true}))})()`);await click('確認進入');};
 for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1366,900],[1024,1366]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1100});await setSeed(done);
  const bounds=await run(`(()=>{const r=document.querySelector('[data-testid=immersive-world]').getBoundingClientRect();const p=document.querySelector('[data-testid=main-scroll]').firstElementChild.getBoundingClientRect();return {root:r.width,left:p.left,right:p.right,width:p.width,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  check(bounds.root===width&&!bounds.overflow,'full width/no overflow '+width);check(Math.abs(bounds.left-(width-bounds.right))<3,'centered '+width);check(width<700||bounds.width>600,'tablet widened');await shot('village-'+width);
  await click('開始任務');await shot('mission-'+width);
  check(await run(`(()=>{const m=document.querySelector('[data-testid=mission-stage]').getBoundingClientRect();const c=document.querySelector('[data-testid=guardian-companion]').getBoundingClientRect();return ${width>=1200||(width>=1000&&width>height)}?c.left>=m.right:c.top>=m.bottom})()`),'mission columns '+width);
  await click('回到村莊');await parent();await click('任務與目標');await shot('parent-'+width);
 }
 // Legacy player lacking a tutorial key must never get forced into a new guide.
 await run(`localStorage.removeItem('${guideKey}')`);await reload();check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'legacy guide omitted');
 for(const [width,height] of [[390,844],[1024,768]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await setSeed({main:false,companions:false,wishes:false,parent:false});
  await step(1);await shot('guide-start-'+width);
  await click('心願小屋');check(await run(`!!document.querySelector('[data-testid=adventure-village]')`),'background clicks blocked');
  await click('開始任務');await step(2);await shot('guide-time-'+width);
  await send('Emulation.setDeviceMetricsOverride',{width:height,height:width,deviceScaleFactor:1,mobile:true});await wait(500);
  check(await run(`(()=>{const a=document.querySelector('[aria-label="上一張時間卡"]').getBoundingClientRect();const b=document.querySelector('[data-testid=spotlight-hole]').getBoundingClientRect();return Math.abs(a.left-b.left-5)<2&&Math.abs(a.top-b.top-5)<2})()`),'spotlight tracks rotation');
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await wait(400);
  const before=(await read()).minutes;const pos=await run(`(()=>{const r=document.querySelector('[aria-label="上一張時間卡"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...pos});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...pos});await wait(500);await step(3);check((await read()).minutes!==before,'real time choice');
  await run(`document.querySelector('[data-testid=task-title-entry]').click()`);await step(4);await shot('guide-task-'+width);
  await click('任務類別：寫作業');await step(5);check((await read()).title==='寫作業','real task saved');
  await click('準備出發');await step(6);check((await read()).phase==='preparing'&&(await read()).deadline===null&&(await read()).orbs===48,'no tutorial timer/points');await shot('guide-ready-'+width);
  await click('完成教學，先不開始');check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'finished overlay closes');await reload();check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'finished guide stays dismissed');
 }
 // Fresh welcome, initial companion, first guide; no synthetic timer starts.
 await run(`localStorage.clear()`);await run('location.reload()');await wait(900);
 await run(`document.querySelector('[aria-label="選擇pip" i]')?.click()`);
 // Names are English case-sensitive in the accessible label.
 await run(`document.querySelector('[aria-label="選擇Pip"]')?.click()`);await click('確認初始夥伴');await click('先跳過命名');await click('選我的第一個任務');await step(1);await click('略過教學');
 await reload();check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'skip persists');
 await click('夥伴小屋');await step(1);await run(`document.querySelector('[aria-label^="摸摸"]').click()`);await step(2);await click('知道了');await click('回到村莊');await click('夥伴小屋');check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'room guide once');
 await click('回到村莊');await click('心願小屋');await step(1);await shot('guide-wishes');const balance=(await read()).orbs;await click('知道了');check((await read()).orbs===balance,'wish guide never spends');
 await click('回到村莊');await parent();await click('知道了');await click('偏好與舊卡');await click('重新觀看操作教學');await step(1);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});check(await run(`document.activeElement?.closest('[data-testid=spotlight-tip]')!==null||document.activeElement?.getAttribute('aria-label')==='開始任務'`),'keyboard stays on guide/target');await click('略過教學');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await run(`localStorage.clear()`);await run('location.reload()');await wait(900);await run(`document.querySelector('[aria-label="選擇Pip"]')?.click()`);await click('確認初始夥伴');await click('先跳過命名');await click('先逛村莊，跳過說明');check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'skip welcome also skips automatic tour');
 console.log('PASS responsive 320/390/768/1024/1366; real guided actions; blocked background; no points/timer; fresh/legacy/skip/reload/room/replay');
}finally{proc.kill();}
