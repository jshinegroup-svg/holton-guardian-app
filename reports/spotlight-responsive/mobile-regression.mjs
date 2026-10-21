import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19349;
const userData = '/tmp/holton-guide-regression';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19108/';
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

 await run(`localStorage.setItem('holton-parent-lock-v1',JSON.stringify({salt:'test-only',pin:'unused',recovery:'unused',failures:0,until:0}))`);
 const tap=async selector=>{
 await wait(600);
 const p=await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing target');const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {x,y,visible:y>0&&y<innerHeight,hit:e.contains(document.elementFromPoint(x,y))}})()`);
 check(p.visible&&p.hit,'target must be visible and hit-testable '+selector+' '+JSON.stringify(p));
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,x:p.x,y:p.y});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x:p.x,y:p.y});await wait(400);
 };
 for(const [width,height] of [[390,650],[320,568],[844,390],[768,1024]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
 await setSeed({main:false,companions:true,wishes:true,parent:true});
 await step(1);await tap('[aria-label="開始任務"]');await step(2);await tap('[aria-label="上一張時間卡"]');await step(3);await tap('[data-testid="task-title-entry"]');await step(4);await tap('[aria-label="任務類別：寫作業"]');await step(5);
 // Simulate a delayed scroll restoration after the task modal closes.
 await wait(500);await run(`document.querySelector('[data-testid="main-scroll"]').scrollTop=0`);await wait(900);
 await shot('regression-step5-'+width);
 await tap('[aria-label="準備出發"]');await step(6);
 check((await read()).phase==='preparing'&&(await read()).deadline===null&&(await read()).orbs===48,'no timer or rewards');
 await click('完成教學，先不開始');await reload();check(!await run(`!!document.querySelector('[data-testid=spotlight-guide]')`),'completion persists');
 console.log('PASS guided coordinate clicks and restored scroll '+width+'x'+height);
 }
}finally{proc.kill();process.exitCode=process.exitCode||0;setTimeout(()=>process.exit(process.exitCode),200);}
