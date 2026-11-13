import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist-production','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist-production')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[320,568],[390,700],[844,390]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,activeWorld:'forest',journeys:{version:2,counts:{forest:0,sky:0,cosmos:0},legacyCredit:0},starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,homework:width===320?{enabled:false,days:{}}:undefined,phase:'ready',deadline:null,remaining:300,help:false,supportUsed:['rest'],breakDeadline:null,focusElapsedMs:0,focusStartedAt:null,rewardProgress:2,dailyGoal:1,taskReward:1,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
 const saves=new Map(kids.map(c=>[c.id,{child_id:c.id,family_id:family,revision:1,state:seed(c.nickname),updated_at:new Date().toISOString()}]));const ops=new Map();let completions=0;let failure='';const attempts=[];
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<800});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);const errors=[];console.log('viewport',width);p.on('pageerror',e=>errors.push(e.message));
 await context.route('https://hzihwjpjcbsuqipaeeit.supabase.co/**',async route=>{const req=route.request(),url=new URL(req.url()),pathname=url.pathname;let data;
  if(pathname.endsWith('/rpc/record_usage_event'))data=null;
  else if(pathname.endsWith('/rpc/list_archived_children'))data=kids.filter(c=>c.hidden_from_home).map(({id,nickname})=>({id,nickname,expires_at:new Date(Date.now()+30*86400000).toISOString()}));
  else if(pathname.endsWith('/rpc/permanently_delete_child')){const body=req.postDataJSON();const i=kids.findIndex(c=>c.id===body.p_child_id);assert(kids[i].hidden_from_home);kids.splice(i,1);saves.delete(body.p_child_id);data=null;}
  else if(pathname.endsWith('/rpc/set_child_archived')){const body=req.postDataJSON();kids.find(c=>c.id===body.p_child_id).hidden_from_home=body.p_archived;data=null;}
  else if(pathname.includes('/auth/v1/user'))data={id:user,email:'fixture@example.invalid'};
  else if(pathname.endsWith('/families'))data={id:family};
  else if(pathname.endsWith('/children')){if(req.method()==='PATCH'){const kid=kids.find(c=>c.id===url.searchParams.get('id')?.replace('eq.',''));Object.assign(kid,req.postDataJSON());}else if(req.method()==='POST'){const kid={id:randomUUID(),...req.postDataJSON(),age_recorded_at:new Date().toISOString()};kids.push(kid);saves.set(kid.id,{child_id:kid.id,family_id:family,revision:1,state:seed(kid.nickname),updated_at:new Date().toISOString()});}data=kids.filter(c=>!c.hidden_from_home);}
  else if(pathname.endsWith('/child_saves')){const id=url.searchParams.get('child_id').replace('eq.','');data=saves.get(id)??null;}
  else if(pathname.endsWith('/rpc/save_child_progress')){const body=req.postDataJSON();attempts.push(body.p_operation_id);if(failure==='before'){failure='';await route.fulfill({status:503,json:{message:'test_network_unavailable'}});return;}if(failure==='hang'){failure='';await new Promise(r=>setTimeout(r,14000));try{await route.abort();}catch{}return;}if(ops.has(body.p_operation_id))data={...ops.get(body.p_operation_id),duplicate:true};else{const prev=saves.get(body.p_child_id);if(prev.revision!==body.p_expected_revision){await route.fulfill({status:409,json:{message:'revision_conflict'}});return;}const revision=prev.revision+1;saves.set(body.p_child_id,{...prev,revision,state:body.p_state});data={revision,duplicate:false};ops.set(body.p_operation_id,data);completions+=body.p_events.filter(e=>e.kind==='task_completed').length;}}
  else {await route.fulfill({status:400,json:{message:'unmocked route'}});return;}
  if(failure==='after'&&pathname.endsWith('/rpc/save_child_progress')){failure='';await route.fulfill({status:503,json:{message:'test_response_lost'}});return;}await route.fulfill({status:200,json:data});
 });
 // Only synthetic local test session; production does not contain a test bypass.
 await p.addInitScript(({user})=>{const enc=x=>btoa(JSON.stringify(x));const exp=Math.floor(Date.now()/1000)+3600;localStorage.setItem('holton-family-v2-auth',JSON.stringify({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.test`,refresh_token:'synthetic-test',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid'}}));localStorage.setItem('holton-guardian-app::light-v1','original-v1-sentinel');},{user});
 await p.addInitScript(({family,a,b})=>{for(const id of [a,b])localStorage.setItem(`holton-family-v2::${family}::${id}::holton-guardian-app::spotlight-v1`,JSON.stringify({main:true,companions:true,wishes:true,parent:true,companionTap:true,music:true}));},{family,a,b});
 await p.addInitScript(()=>{
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
 await p.goto(base);await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();

 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();
 const storageKey=`holton-family-v2::${family}::${a}::holton-guardian-app::light-v1`;

 await p.getByRole('button',{name:'開始任務',exact:true}).click();
 for(let i=0;i<15&&await p.getByTestId('homework-card-title').count()===0;i++)await p.getByLabel('下一張任務卡',{exact:true}).click();
 await p.getByRole('button',{name:'進入功課模式',exact:true}).click();
 const guide=p.getByTestId('homework-guide');await guide.waitFor();
 const before=JSON.stringify(saves.get(a).state);
 for(let i=1;i<=6;i++){
  assert((await guide.innerText()).includes(`${i}/6`));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.screenshot({path:`reports/homework/guide-${width}-${i}.png`});
  await guide.getByRole('button',{name:i===6?'知道了，開始探索':'下一步',exact:true}).click();
 }
 await guide.waitFor({state:'hidden'});assert.equal(JSON.stringify(saves.get(a).state),before);
 await p.evaluate(()=>{document.querySelectorAll('*').forEach(e=>{if(e.scrollTop)e.scrollTop=0;});window.scrollTo(0,0)});
 const geometry=await p.evaluate(()=>{const star=document.querySelector('.hw-stars').getBoundingClientRect();const toolbar=document.querySelector('[data-testid=homework-toolbar]');const buttons=[...toolbar.querySelectorAll('[role=button]')].map(e=>e.getBoundingClientRect());return {starWidth:star.width,starHeight:star.height,toolbarTop:toolbar.getBoundingClientRect().top,buttonHeights:buttons.map(b=>b.height),sameRow:Math.abs(buttons[0].top-buttons[1].top)<2,overflow:document.documentElement.scrollWidth>innerWidth+1};});assert(geometry.starWidth<=321);assert(geometry.sameRow);assert(geometry.buttonHeights.every(h=>h>=44));assert(!geometry.overflow);console.log('PASS compact map',width,geometry);await p.screenshot({path:`reports/homework/compact-map-${width}.png`});
 await p.getByRole('button',{name:'返回任務卡',exact:true}).click();
 await p.getByRole('button',{name:'進入功課模式',exact:true}).click();await p.waitForTimeout(350);assert.equal(await guide.count(),0);
 await p.getByRole('button',{name:'功課冒險教學',exact:true}).click();await guide.waitFor();await guide.getByRole('button',{name:'先略過',exact:true}).click();
 await p.evaluate(()=>localStorage.setItem('holton-family-v2::interface-language','en'));await p.reload();
 await p.getByRole('button',{name:'Start task',exact:true}).click();
 for(let i=0;i<15&&await p.getByTestId('homework-card-title').count()===0;i++)await p.getByLabel('Next task card',{exact:true}).click();
 await p.getByRole('button',{name:'Enter homework mode',exact:true}).click();
 await p.getByRole('button',{name:'Homework Quest guide',exact:true}).click();await guide.waitFor();assert((await guide.innerText()).includes('Find the homework card'));
 await guide.getByRole('button',{name:'Skip for now',exact:true}).click();
 assert.equal(JSON.stringify(saves.get(a).state),before);assert.deepEqual(errors,[]);
 console.log('PASS homework guide first entry, 6 steps, skip, persistence, replay, English, no save/timer/reward changes',width);
 await context.close();
}}finally{await browser.close();server.close();}
