import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 19351;
const userData = '/tmp/holton-range-regression';
const {createTrialServer}=await import('../../server/trial-server.mjs');
const {randomBytes}=await import('node:crypto');
const password=randomBytes(24).toString('hex');
const server=createTrialServer({root:'dist',password,secure:false});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`;
const login=await fetch(url+'trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password}),redirect:'manual'});
const cookie=login.headers.get('set-cookie').split(';')[0].split('=')[1];
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
 const send=await connect(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await send('Network.enable');await send('Network.setCookie',{name:'holton_trial',value:cookie,url,httpOnly:true});
 await send('Page.navigate',{url});await wait(1500);
 const r=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,userGesture:true,expression:`(async()=>{
 const a=new Audio('/music/meditation.mp3'); const c=new AudioContext(); const source=c.createMediaElementSource(a);const analyser=c.createAnalyser();source.connect(analyser);analyser.connect(c.destination);
 await c.resume();await a.play(); await new Promise(r=>setTimeout(r,2000));
 const b=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(b);
 const result={playing:!a.paused,time:a.currentTime,decoded:b.some(x=>Math.abs(x)>.00001),error:a.error?.code||null};a.pause();await c.close();return result;
 })()`});
 if(r.exceptionDetails||!r.result.value?.decoded||!r.result.value?.playing)throw Error(JSON.stringify(r));
 console.log('PASS authenticated server real media decode and nonzero waveform',JSON.stringify(r.result.value));
}catch(error){console.error(error);process.exitCode=1;}finally{proc.kill();await new Promise(r=>server.close(r));process.exit(process.exitCode||0);}
