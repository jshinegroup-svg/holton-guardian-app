import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19261;
const userData = '/tmp/holton-character-film-profile';
const url = process.env.SKY_TEST_URL || 'http://127.0.0.1:19091/holton-guardian-app/';
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
 const click=async label=>{await run(`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const el=[...document.querySelectorAll('[role="button"],[role="switch"]')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}||e.textContent===${JSON.stringify(label)});if(el){clearInterval(timer);el.click();resolve(true)}else if(++tries>70){clearInterval(timer);reject(Error('missing '+${JSON.stringify(label)}))}},80)})`);await wait(220)};
 const ready=async()=>{for(let i=0;i<60;i++){if(await run("document.body.innerText.includes('HOLTON HERO')"))return;await wait(100)}throw Error('page not ready: '+await run('document.body.innerText'))};
 const reload=async()=>{await run('location.reload()');await wait(700);await ready()};
 const shot=async name=>{await wait(300);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`reports/character-film-integration/${name}.png`,Buffer.from(r.data,'base64'))};

 await send('Page.addScriptToEvaluateOnNewDocument',{source:`{const NativeDate=Date;const epoch=NativeDate.parse('2026-10-25T12:00:00+08:00');window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[epoch]))}static now(){return epoch}}}`});
 await reload();
 const seed={version:1,title:'國語作業',taskCategory:'homework',minutes:20,cardId:'super-hero',orbs:50,phase:'ready',deadline:null,remaining:1200,help:false,history:[],guardian:{coreGuardianId:'tidefin'},guardianCards:[],dailyGoal:3};
 await run(`localStorage.setItem('${key}',JSON.stringify(${JSON.stringify(seed)}));localStorage.setItem('battle-unrelated','preserve')`);await reload();
 const openCard=async(name='Tidefin Shark Mini')=>{await click('✧ 基地收藏室');await click('我的守護獸收藏');await click('查看待兌換 '+name)};
 const visible=label=>run(`[...document.querySelectorAll('[role=button]')].some(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}&&e.getClientRects().length)`);
 await openCard();const before=await read();await click('預覽挑戰動畫（不扣點）');await shot('preview-390');
 await wait(1200);check(await run('document.querySelector("video").duration > 16 && document.querySelector("video").duration < 18'),'17sec asset');check(await run('document.querySelector("video").muted && document.querySelector("video").playsInline'),'muted inline');await wait(17000);check(await visible('結束預覽'),'natural video end');await shot('preview-victory');await click('結束預覽');check(JSON.stringify(await read())===JSON.stringify(before),'preview no wallet/card writes');
 await click('挑戰守護獸 · 10 點');check((await read()).orbs===50,'confirmation not charged');await shot('confirmation');await click('先不挑戰，不扣點');check((await read()).orbs===50,'cancel not charged');
 await click('挑戰守護獸 · 10 點');
 // A failed local write must not start an animation or debit the wallet.
 await run(`window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='${key}')throw Error('synthetic quota failure');return window.originalStorageSet.call(this,k,v)}`);
 await click('確認出戰 · 扣 10 點');check((await read()).orbs===50&&!(await read()).guardianChallenge,'write failure preserves wallet');check(await run("document.body.innerText.includes('尚未儲存成功')"),'save error visible');await run('Storage.prototype.setItem=window.originalStorageSet');
 await run(`const b=[...document.querySelectorAll('[role=button]')].find(e=>e.getAttribute('aria-label')==='確認出戰 · 扣 10 點');b.click();b.click()`);await wait(400);
 let data=await read();check(data.orbs===40&&data.guardianCards.length===0&&data.guardianChallenge.status==='battling','one debit, no early award');check(data.guardianChallenge.heroCardId==='super-hero','chosen robot snapshot');const id=data.guardianChallenge.id;
 await shot('battle-390');await reload();data=await read();check(data.orbs===40&&data.guardianChallenge.id===id,'reload resumes without debit');check(await run("!!document.querySelector('[aria-label=\"出戰：Super Hero Mode\"]')"),'original selected robot shown');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await wait(250);check(await run('document.documentElement.scrollWidth<=innerWidth'),'320 no overflow');await shot('battle-320');
 await click('跳過動畫，看試煉結果');check((await read()).guardianCards.length===0,'skip shows result before bond');
 await run(`const b=[...document.querySelectorAll('[role=button]')].find(e=>e.getAttribute('aria-label')==='締結夥伴 · 收下守護獸');b.click();b.click()`);await wait(400);data=await read();check(data.orbs===40&&data.guardianCards.length===1&&data.guardianChallenge.status==='won','one grant, no second charge');await shot('bonded');
 await reload();check((await read()).guardianCards.length===1&&await visible('今天就陪我'),'won reload restores celebration');await click('今天就陪我');data=await read();check(data.companionCardId==='tidefin:0'&&!data.guardianChallenge,'set companion and clear pending');check(await visible('正在陪伴你'),'owned card shown');
 await click('回到卡冊');await click('查看待兌換 Tidefin Shark Mid');await click('挑戰守護獸 · 20 點');await click('確認出戰 · 扣 20 點');check((await read()).orbs===20,'next tier charges correct cost');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(250);check(await visible('發動夥伴之光'),'reduced motion goes directly to action');await click('跳過動畫，看試煉結果');await click('締結夥伴 · 收下守護獸');await click('回到守護獸收藏');data=await read();check(data.guardianCards.length===2&&data.orbs===20&&data.companionCardId==='tidefin:0','second tier independent, no forced companion change');
 check(await run("localStorage.getItem('battle-unrelated')==='preserve'"),'unrelated data untouched');
 // Real Monday: restore native date on reload by removing override, then verify preview remains accessible.
 await run(`localStorage.setItem('${key}',JSON.stringify(${JSON.stringify({...seed,reduceMotion:true})}))`);
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`{const NativeDate=Date;const epoch=NativeDate.parse('2026-10-26T12:00:00+08:00');window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[epoch]))}static now(){return epoch}}}`});
 await reload();await openCard();check(await run("document.querySelector('[aria-label=\"挑戰守護獸 · 10 點\"]').getAttribute('aria-disabled')==='true'"),'Monday challenge disabled');await click('預覽挑戰動畫（不扣點）');await click('結束預覽');check((await read()).orbs===50&&!(await read()).guardianCards.length,'Monday preview free');
 // A media failure remains recoverable; no debit in preview, and reduced motion never loads video.
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await run(`localStorage.setItem('${key}',JSON.stringify(${JSON.stringify(seed)}))`);await reload();await openCard();await click('預覽挑戰動畫（不扣點）');
 await run(`document.querySelector('video').dispatchEvent(new Event('error'))`);await wait(150);check(await run("document.body.innerText.includes('影片暫時無法載入')"),'media failure feedback');await click('跳過動畫，看試煉結果');await click('結束預覽');check((await read()).orbs===50,'media failure preview no debit');
 await run(`localStorage.setItem('${key}',JSON.stringify(${JSON.stringify({...seed,reduceMotion:true})}))`);await reload();await openCard();await click('預覽挑戰動畫（不扣點）');check(await run('!document.querySelector("video")'),'reduced motion no media');await click('結束預覽');
 console.log('PASS character film: preview/cancel no charge; storage failure; double-click start/grant; chosen hero; 320/390; interrupted/reloaded battle and victory; skip; bond and optional companion; next tier; reduced motion; Monday restriction and preview.');
} finally {proc.kill('SIGTERM')}
