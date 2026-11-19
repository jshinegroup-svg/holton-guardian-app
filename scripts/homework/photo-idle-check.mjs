import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
let staleShell=process.env.TEST_STALE_PACKAGE==='1';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve(process.env.TEST_DIST||'dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve(process.env.TEST_DIST||'dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');if(staleShell&&pathname==='/index.html'){staleShell=false;res.end('<html>stale deployment</html>');}else res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of (process.env.LONG_IDLE==='1'?[[390,844]]:[[320,740],[390,844],[844,390]])){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,activeWorld:width===320?'forest':width===744?'sky':'cosmos',journeys:{version:2,counts:{forest:0,sky:0,cosmos:0},legacyCredit:0},starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,homework:{enabled:false,days:{'2026-11-16':{tasks:[{id:'old',title:'國語甲本',detail:'原有功課',reported:false,confirmed:false}]}}},phase:'ready',deadline:null,remaining:300,help:false,supportUsed:['rest'],breakDeadline:null,focusElapsedMs:0,focusStartedAt:null,rewardProgress:2,dailyGoal:1,taskReward:1,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false,taskSoundEnabled:width!==890});
 const saves=new Map(kids.map(c=>[c.id,{child_id:c.id,family_id:family,revision:1,state:seed(c.nickname),updated_at:new Date().toISOString()}]));const ops=new Map();let recognitionCalls=0;let recognitionMode='missing';let completions=0;let failure='';const attempts=[];
 const photos=new Map([[a+'/2026-11-16',{buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6kXAAAAAASUVORK5CYII=','base64'),mime:'image/png'}]]);let photoFailure=process.env.TEST_PHOTO_RECOVERY==='1';let photoReads=0;
 const context=await browser.newContext({viewport:{width,height},reducedMotion:"reduce",hasTouch:true,isMobile:width<800});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);const errors=[];console.log('viewport',width);p.on('pageerror',e=>errors.push(e.message));
 let networkAvailable=true;
 const apiRoute=async route=>{if(!networkAvailable){await route.abort('internetdisconnected');return;}const req=route.request(),url=new URL(req.url()),pathname=url.pathname;let data;
  if(pathname.startsWith('/storage/v1/object/')){
   if(photoFailure){await route.fulfill({status:503,json:{message:'offline'}});return;}
   const key=pathname.split('homework-notebooks/')[1];assert(key.startsWith(a+'/')||key.startsWith(b+'/'));
   if(req.method()==='POST'){
    const fields=await new Request(req.url(),{method:'POST',headers:await req.allHeaders(),body:req.postDataBuffer()}).formData();
    const file=fields.get('');assert(file);const replace=req.headers()['x-upsert']==='true';
    if(photos.has(key)&&!replace){await route.fulfill({status:409,json:{statusCode:'409',message:'The resource already exists'}});return;}
    photos.set(key,{buffer:Buffer.from(await file.arrayBuffer()),mime:file.type});await route.fulfill({status:200,json:{Key:key}});return;
   }
   photoReads++;const photo=photos.get(key);if(!photo){await route.fulfill({status:400,json:{statusCode:'404',error:'not_found',message:'Object not found'}});return;}
   await route.fulfill({status:200,contentType:photo.mime,body:photo.buffer});return;
  }
  if(pathname.endsWith('/functions/v1/homework-recognize')){recognitionCalls++;assert.equal(req.postDataJSON().childId,a);if(recognitionMode==='missing'){await route.fulfill({status:503,json:{error:'not_configured'}});return;}data={draft:{dateText:'11月16日',tasks:[{title:'圈詞',detail:'第7課2次，本別待確認',uncertainty:''},{title:'數學課本',detail:'94–待確認頁，訂正92頁',uncertainty:'末頁不清楚'},{title:'背課文',detail:'第八課',uncertainty:''},{title:'童詩朗誦',detail:'一遍',uncertainty:''},{title:'閱讀',detail:'十分鐘',uncertainty:''},{title:'作文',detail:'我的家庭',uncertainty:''}],excluded:[{text:'家長簽名',reason:'不是書寫功課'}],warnings:[]}};}else if(pathname.endsWith('/rpc/record_usage_event'))data=null;
  else if(pathname.endsWith('/rpc/list_archived_children'))data=kids.filter(c=>c.hidden_from_home).map(({id,nickname})=>({id,nickname,expires_at:new Date(Date.now()+30*86400000).toISOString()}));
  else if(pathname.endsWith('/rpc/permanently_delete_child')){const body=req.postDataJSON();const i=kids.findIndex(c=>c.id===body.p_child_id);assert(kids[i].hidden_from_home);kids.splice(i,1);saves.delete(body.p_child_id);data=null;}
  else if(pathname.endsWith('/rpc/set_child_archived')){const body=req.postDataJSON();kids.find(c=>c.id===body.p_child_id).hidden_from_home=body.p_archived;data=null;}
  else if(pathname.includes('/auth/v1/token')){const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64');const exp=Math.floor(Date.now()/1000)+3600;data={access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.test`,refresh_token:'synthetic-test',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid'}};}
  else if(pathname.includes('/auth/v1/user'))data={id:user,email:'fixture@example.invalid'};
  else if(pathname.endsWith('/families'))data={id:family};
  else if(pathname.endsWith('/children')){if(req.method()==='PATCH'){const kid=kids.find(c=>c.id===url.searchParams.get('id')?.replace('eq.',''));Object.assign(kid,req.postDataJSON());}else if(req.method()==='POST'){const kid={id:randomUUID(),...req.postDataJSON(),age_recorded_at:new Date().toISOString()};kids.push(kid);saves.set(kid.id,{child_id:kid.id,family_id:family,revision:1,state:seed(kid.nickname),updated_at:new Date().toISOString()});}data=kids.filter(c=>!c.hidden_from_home);}
  else if(pathname.endsWith('/child_saves')){const id=url.searchParams.get('child_id').replace('eq.','');data=saves.get(id)??null;}
  else if(pathname.endsWith('/rpc/save_child_progress')){const body=req.postDataJSON();attempts.push(body.p_operation_id);if(failure==='before'){failure='';await route.fulfill({status:503,json:{message:'test_network_unavailable'}});return;}if(failure==='hang'){failure='';await new Promise(r=>setTimeout(r,14000));try{await route.abort();}catch{}return;}if(ops.has(body.p_operation_id))data={...ops.get(body.p_operation_id),duplicate:true};else{const prev=saves.get(body.p_child_id);if(prev.revision!==body.p_expected_revision){await route.fulfill({status:409,json:{message:'revision_conflict'}});return;}const revision=prev.revision+1;saves.set(body.p_child_id,{...prev,revision,state:body.p_state});data={revision,duplicate:false};ops.set(body.p_operation_id,data);completions+=body.p_events.filter(e=>e.kind==='task_completed').length;}}
  else {await route.fulfill({status:400,json:{message:'unmocked route'}});return;}
  if(failure==='after'&&pathname.endsWith('/rpc/save_child_progress')){failure='';await route.fulfill({status:503,json:{message:'test_response_lost'}});return;}await route.fulfill({status:200,json:data});
 };
 await context.route('https://hzihwjpjcbsuqipaeeit.supabase.co/**',apiRoute);
 // Only synthetic local test session; production does not contain a test bypass.
 await p.addInitScript(({user})=>{const enc=x=>btoa(JSON.stringify(x));const exp=Math.floor(Date.now()/1000)+(localStorage.getItem('fixture-expired')?-3600:3600);localStorage.setItem('holton-family-v2-auth',JSON.stringify({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.test`,refresh_token:'synthetic-test',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid'}}));localStorage.setItem('holton-guardian-app::light-v1','original-v1-sentinel');},{user});
 await p.addInitScript(({family,a,b})=>{for(const id of [a,b])localStorage.setItem(`holton-family-v2::${family}::${id}::holton-guardian-app::spotlight-v1`,JSON.stringify({main:true,companions:true,wishes:true,parent:true,companionTap:true,music:true}));},{family,a,b});
 await p.addInitScript(()=>{
  window.__offlineChanges=0;window.addEventListener('holton-offline-changed',()=>window.__offlineChanges++);
  window.__audioLog=[];window.__playCount=0;window.__oscCount=0;window.__duckCount=0;window.addEventListener('holton-task-chime',()=>window.__duckCount++);
  class Context {constructor(){(window.__contexts??=[]).push(this);}state='suspended';destination={};get currentTime(){return Date.now()/1000;}resume(){if(this.state==='running')return Promise.resolve();return new Promise(resolve=>setTimeout(()=>{this.state='running';resolve();},350));}close(){this.state='closed';return Promise.resolve();}createGain(){const param={value:1,setValueAtTime(v){this.value=v;window.__audioLog.push(['value',v]);},linearRampToValueAtTime(v){this.value=v;window.__audioLog.push(['peak',v]);},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){},setTargetAtTime(v){this.value=v;window.__audioLog.push(['volume',v]);}};return {gain:param,connect(){},disconnect(){}};}createOscillator(){window.__oscCount++;return {type:'sine',frequency:{value:0},connect(){},disconnect(){},start(at){window.__audioLog.push(['start',at]);},stop(at){window.__audioLog.push(['stop',at]);}};}createMediaElementSource(){return {connect(){}};}}
  window.AudioContext=Context;
  const states=new WeakMap();const get=e=>{if(!states.has(e))states.set(e,{paused:true,time:0,at:Date.now(),src:''});return states.get(e);};
  Object.defineProperty(HTMLMediaElement.prototype,'paused',{get(){return get(this).paused;}});
  Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{get(){const s=get(this);return s.time+(s.paused?0:(Date.now()-s.at)/1000);},set(v){const s=get(this);s.time=v;s.at=Date.now();}});
  Object.defineProperty(HTMLMediaElement.prototype,'src',{get(){return get(this).src;},set(v){get(this).src=v;}});
  HTMLMediaElement.prototype.play=function(){const s=get(this);s.at=Date.now();s.paused=false;window.__playCount++;this.dispatchEvent(new Event('playing'));return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){const s=get(this);s.time=this.currentTime;s.paused=true;this.dispatchEvent(new Event('pause'));};HTMLMediaElement.prototype.load=function(){};
 });
 await p.clock.setFixedTime(new Date('2026-11-15T04:00:00Z'));await p.goto(base);await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();

 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();
 let firstEntry=true; const enter=async()=>{await p.getByRole('button',{name:'開始任務',exact:true}).click();for(let i=0;i<15&&await p.getByTestId('homework-card-title').count()===0;i++)await p.getByLabel('下一張任務卡',{exact:true}).click();await p.getByRole('button',{name:'進入功課模式',exact:true}).click();if(firstEntry){await p.getByRole('button',{name:'先略過',exact:true}).click();firstEntry=false;}};
 await enter();console.log('entered');

 const beforePhoto=JSON.stringify(saves.get(a).state);
 await p.getByRole('button',{name:'明天',exact:false}).first().click();
 await p.getByRole('button',{name:'查看 11/16 聯絡簿',exact:true}).click();
 const img=p.getByRole('img',{name:'Homework notebook',exact:true}).or(p.getByRole('img',{name:'聯絡簿',exact:true}));await img.waitFor();
 await p.evaluate(()=>{const el=document.querySelector('img[alt="聯絡簿"],img[alt="Homework notebook"]');window.photoNode=el;window.photoStats={loads:0,mutations:0,removed:0};el.addEventListener('load',()=>window.photoStats.loads++);new MutationObserver(ms=>{window.photoStats.mutations+=ms.length}).observe(el,{attributes:true});new MutationObserver(()=>{if(!el.isConnected)window.photoStats.removed++}).observe(document.body,{childList:true,subtree:true})});
 await p.waitForTimeout(process.env.LONG_IDLE==='1'?65000:6500);
 const stable=await p.evaluate(()=>({...window.photoStats,connected:window.photoNode.isConnected}));console.log('PHOTO IDLE',stable);assert.deepEqual(stable,{loads:0,mutations:0,removed:0,connected:true});
 await p.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await p.waitForTimeout(1500);assert(await p.evaluate(()=>window.photoNode.isConnected));
 await p.getByRole('button',{name:'重新讀取雲端照片',exact:true}).click();await p.waitForTimeout(500);assert(await img.isVisible());
 await p.getByRole('button',{name:'返回／關閉照片',exact:true}).click();await p.locator('.hw-stars').waitFor();
 assert.equal(JSON.stringify(saves.get(a).state),beforePhoto,'reading a notebook must not mutate family progress');
 
 assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();await new Promise(r=>server.close(r))}
