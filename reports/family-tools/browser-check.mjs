import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19353;
const userData = '/tmp/holton-family-tools-profile';
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
 const click=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"],[role="checkbox"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(220)};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body?.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready')};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await run(`new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{const imgs=[...document.images];if(imgs.length&&imgs.every(i=>i.complete&&i.naturalWidth>0)){clearInterval(t);resolve(true)}else if(++n>600){clearInterval(t);reject(Error('image load timeout'))}},100)})`);await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/family-tools/${process.env.SKY_TEST_URL?'public-':''}${name}.png`,Buffer.from(r.data,'base64'))};





 const body=()=>run('document.body.innerText');
 const input=async(label,value)=>{await run(`(()=>{const e=document.querySelector('[aria-label='+${JSON.stringify(JSON.stringify(label))}+']');const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100)};
 const seed=async data=>{await run(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(data))})`);await reload()};
 const base={version:1,title:'收好積木',minutes:5,cardId:'mini-fighter',orbs:41,phase:'ready',deadline:null,remaining:300,history:[{id:'test-done',title:'收積木',at:new Date(Date.now()-3600000).toISOString(),minutes:5,helpUsed:true,supportUsed:['rest']}],guardian:{},guardianCards:[{cardId:'tidefin:0',at:'2026-10-19',cost:10,source:'sunday'}],companionCardId:'tidefin:0',dailyGoal:4,reduceMotion:true,shopEnabled:true,wishes:[{id:'wish-0',name:'特別禮物',cost:77,enabled:false}],wishReceipts:[{id:'pending-wish',name:'親子電影',cost:20,at:new Date().toISOString()}],activeWorld:'forest',journeys:{version:2,counts:{forest:4,sky:0,cosmos:0},legacyCredit:0}};
 const unlock=async()=>{const q=await run(`document.querySelector('[data-testid="parent-gate-question"]').textContent`);const nums=q.match(/\d+/g).map(Number);await input('家長確認答案',String(nums[0]+nums[1]));await click('確認進入')};
 const parent=async()=>{await click('家長小屋');await unlock()};
 const backupTab=async()=>{await parent();await click('備份與重置')};
 const failedWrites=async target=>run(`window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(target)})throw Error('test storage full');return window.__originalSet.call(this,k,v)}`);
 const enableWrites=()=>run('Storage.prototype.setItem=window.__originalSet');
 await ready();await run('localStorage.clear()');await reload();check(await run(`!!document.querySelector('[data-testid="welcome-guide"]')`),'fresh intro');await shot('onboarding-390');
 await failedWrites(key);await click('先逛村莊，跳過說明');check((await read()).onboardingDone===false,'failed intro save not dismissed');check((await body()).includes('尚未儲存成功'),'intro error shown');await enableWrites();await click('選我的第一個任務');check((await read()).onboardingDone===true&&(await read()).orbs===0,'intro no fake reward');check((await body()).includes('點一下就選好'),'guided task picker');await click('任務類別：幫忙家務');await reload();check(!await run(`!!document.querySelector('[data-testid="welcome-guide"]')`),'intro only once');
 await run('localStorage.clear()');await reload();await click('先逛村莊，跳過說明');await reload();check((await read()).onboardingDone===true,'skip persisted');
 await seed(base);check(!await run(`!!document.querySelector('[data-testid="welcome-guide"]')`),'existing users not interrupted');const original=await read();await click('家長小屋');check(await run(`!!document.querySelector('[data-testid="parent-gate"]')`),'parent gate');await click('取消，回到原畫面');check(JSON.stringify(await read())===JSON.stringify(original),'gate cancel no writes');await click('家長小屋');await input('家長確認答案','0');await click('確認進入');check((await body()).includes('答案還不對'),'wrong gate answer blocked');await unlock();await click('完成紀錄');check((await body()).includes('本週小足跡')&&(await body()).includes('1 次表達需要')&&(await body()).includes('親子電影'),'weekly real records and pending wishes');await shot('weekly-390');await click('回到村莊');
 await click('家長小屋');const holdPoint=await run(`(()=>{const e=document.querySelector('[aria-label="長按兩秒進入家長小屋"]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[holdPoint]});await wait(400);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(await run(`!!document.querySelector('[data-testid="parent-gate"]')`),'short hold blocked');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[holdPoint]});await wait(2250);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(!await run(`!!document.querySelector('[data-testid="parent-gate"]')`),'long hold enters');await click('備份與重置');
 const downloadDir=process.cwd()+'/reports/family-tools/downloads'+(process.env.SKY_TEST_URL?'-public':'');await fs.mkdir(downloadDir,{recursive:true});const oldFiles=new Set(await fs.readdir(downloadDir));await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});await click('匯出目前進度');let files=[];for(let i=0;i<50;i++){files=(await fs.readdir(downloadDir)).filter(f=>!oldFiles.has(f)&&f.endsWith('.json'));if(files.length)break;await wait(100)}check(files.length===1,'backup file actually downloaded: '+(await body()).slice(-500));const content=await fs.readFile(downloadDir+'/'+files[0],'utf8');const exported=JSON.parse(content);check(exported.state.orbs===41&&exported.state.wishes[0].cost===77&&exported.state.history.length===1,'export contains exact progress/preferences');
 await click('或貼上備份內容');await input('備份 JSON 內容','{"bad":true}');await click('檢查備份內容');check((await body()).includes('不是支援的'),'invalid backup blocked');check(JSON.stringify(await read())===JSON.stringify(original),'invalid import no changes');
 await input('備份 JSON 內容',content);await click('檢查備份內容');check(await run(`!!document.querySelector('[data-testid="backup-preview"]')`),'preview before restore');await click('取消還原');check(JSON.stringify(await read())===JSON.stringify(original),'cancel restore no changes');
 const replacement={...exported,state:{...exported.state,orbs:19}};const fixture=downloadDir+'/restore-19.json';await fs.writeFile(fixture,JSON.stringify(replacement));await send('Page.setInterceptFileChooserDialog',{enabled:true});await click('選擇備份檔');const doc=await send('DOM.getDocument');const node=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'input[type="file"]'});await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[fixture]});await wait(300);check((await body()).includes('19 能量球'),'real file import preview');check((await read()).orbs===41,'file preview not applied');
 await click('我知道還原會取代目前進度');await failedWrites('holton-guardian-app::before-replace-v1');await click('確認還原這份備份');check((await read()).orbs===41,'failed safety copy prevents restore');await enableWrites();await failedWrites(key);await click('確認還原這份備份');check((await read()).orbs===41,'failed main write preserves progress');await enableWrites();await click('確認還原這份備份');check((await read()).orbs===19,'restore replaces not adds');check(await run(`JSON.parse(localStorage.getItem('holton-guardian-app::before-replace-v1')).state.orbs===41`),'pre-restore snapshot retained');await reload();check((await read()).orbs===19,'restore survives reload');
 await backupTab();await click('取回上一次取代前的進度');await click('我知道還原會取代目前進度');await click('確認還原這份備份');check((await read()).orbs===41,'undo restore');
 await backupTab();await click('重新開始冒險');await input('輸入重新開始','錯誤');check(await run(`document.querySelector('[aria-label="確認清空進度，重新開始"]').getAttribute('aria-disabled')==='true'`),'reset requires exact confirmation');await click('取消重新開始');check((await read()).orbs===41,'reset cancel no writes');await click('重新開始冒險');await input('輸入重新開始','重新開始');await failedWrites(key);await click('確認清空進度，重新開始');check((await read()).orbs===41,'failed reset no changes');await enableWrites();await click('確認清空進度，重新開始');const reset=await read();check(reset.orbs===0&&reset.history.length===0&&!reset.guardianCards?.length&&!reset.wishReceipts?.length&&reset.journeys.counts.forest===0,'reset clears game progress');check(reset.dailyGoal===4&&reset.wishes[0].cost===77&&reset.wishes[0].enabled===false&&reset.reduceMotion===true&&reset.shopEnabled===true,'reset preserves parent settings');await reload();check((await read()).orbs===0,'reset persists');await backupTab();await click('取回上一次取代前的進度');await click('我知道還原會取代目前進度');await click('確認還原這份備份');check((await read()).orbs===41&&(await read()).guardianCards.length===1&&(await read()).history.length===1,'undo reset restores all');
 await seed({...base,phase:'active',deadline:Date.now()+300000});await backupTab();check(await run(`document.querySelector('[aria-label="重新開始冒險"]').getAttribute('aria-disabled')==='true'`),'active reset disabled');check(await run(`document.querySelector('[aria-label="選擇備份檔"]').getAttribute('aria-disabled')==='true'`),'active restore disabled');
 await seed(base);await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await backupTab();await shot('backup-320');check(await run('document.documentElement.scrollWidth<=320'),'backup no overflow');await click('重新開始冒險');await shot('reset-320');await click('取消重新開始');await click('完成紀錄');await shot('weekly-320');await click('回到村莊');await click('家長小屋');await shot('gate-320');await click('取消，回到原畫面');await run('localStorage.clear()');await reload();await shot('onboarding-320');
 console.log('PASS fresh guide/start/skip/failed save, old users unchanged, gate cancel/wrong answer/short-long hold, real weekly data, actual JSON download/file import, invalid/cancel previews, safety-copy/main-write failures, replacement/undo, reset cancel/exact confirmation/failure/persistence/undo/settings preservation, active-operation blocks,320/390 layout');
} finally {proc.kill('SIGTERM')}
