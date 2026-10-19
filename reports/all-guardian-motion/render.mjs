import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import {setTimeout as wait} from 'node:timers/promises';import {once} from 'node:events';
const dir='reports/all-guardian-motion',species=['stoneback','emberwing','steel-eagle','bramblefang','tidefin'];
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--remote-debugging-port=19279','--user-data-dir=/tmp/holton-all-motion','--no-first-run','--disable-background-timer-throttling','about:blank'],{stdio:'ignore'});
try{let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:19279/json')).json();break}catch{await wait(200)}}const ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};const send=(method,params={})=>new Promise(r=>{const id=++seq;pending.set(id,r);ws.send(JSON.stringify({id,method,params}))});const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)throw Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value};
await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:720,height:900,deviceScaleFactor:1,mobile:false});
for(const name of species){for(let tier=0;tier<4;tier++){if(name==='tidefin'&&tier===0)continue;
 await send('Page.navigate',{url:`http://127.0.0.1:19100/?species=${name}&tier=${tier}`});await wait(400);await run('window.ready');
 const png=await run(`window.renderFrame(7.2);document.querySelector('canvas').toDataURL('image/png').split(',')[1]`);await fs.writeFile(`${dir}/${name}-${tier}-action.png`,Buffer.from(png,'base64'));
 const png2=await run(`window.renderFrame(16);document.querySelector('canvas').toDataURL('image/png').split(',')[1]`);await fs.writeFile(`${dir}/${name}-${tier}-bond.png`,Buffer.from(png2,'base64'));
 if(process.env.CHECK_ONLY){console.log('CHECK '+name+':'+tier+' 16 isolated poses');continue}
 await fs.mkdir('public/battles',{recursive:true});const out=`public/battles/${name}-${tier}-v1.mp4`;
 const encoder=spawn('/opt/homebrew/bin/ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-i',`${dir}/assets/sound.wav`,'-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-t','17','-movflags','+faststart',out],{stdio:['pipe','ignore','inherit']});
 const ended=once(encoder,'exit');
 for(let i=0;i<510;i++){const frame=await run(`window.renderFrame(${i/30});document.querySelector('canvas').toDataURL('image/jpeg',0.9).split(',')[1]`);if(!encoder.stdin.write(Buffer.from(frame,'base64')))await once(encoder.stdin,'drain')}
 encoder.stdin.end();const [code]=await ended;if(code!==0)throw Error('ffmpeg '+code);console.log('RENDERED '+name+':'+tier+' 17 seconds');
}}
ws.close();}finally{chrome.kill('SIGTERM')}
