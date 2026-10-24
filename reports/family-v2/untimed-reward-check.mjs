import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[320,568],[390,700]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'active',deadline:null,remaining:300,help:false,supportUsed:['rest'],breakDeadline:null,focusElapsedMs:300000,focusStartedAt:Date.now(),rewardProgress:2,dailyGoal:1,taskReward:1,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
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
 await p.goto(base);console.log('loaded',await p.locator('body').innerText());await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();



 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();await p.getByTestId('task-outcome-choices').waitFor();const sibling=structuredClone(saves.get(b).state);const original={...seed('哥哥'),activeWorld:'forest',journeys:{version:2,counts:{forest:0,sky:0,cosmos:0},legacyCredit:0},rewardProgress:0,dailyGoal:20,reduceMotion:true,history:[{id:'legacy',title:'old',at:'2026-01-01T00:00:00Z',minutes:0,reward:5}]};
 for(const [mins,elapsed,want] of [[0,300000,1],[0,900000,3],[0,1500000,5],[0,30000,0],[25,300000,5]]){
 const startAt=await p.evaluate(()=>Date.now());saves.get(a).state={...original,minutes:mins,taskReward:5,focusElapsedMs:elapsed,focusStartedAt:startAt,deadline:mins?startAt+1200000:null,taskReminderShown:true};await p.reload();await p.getByTestId('focus-help').waitFor();
 if(elapsed===300000&&mins===0){await p.getByTestId('focus-help').click();await p.clock.install();await p.clock.fastForward(1200000);await p.getByRole('button',{name:'我準備好了，繼續',exact:true}).click();}
 const complete=p.getByRole('button',{name:mins===0&&elapsed>=600000?'我完成了':'完成',exact:true});await complete.click();await p.getByTestId('finishing-secondary-actions').waitFor();assert.equal(saves.get(a).state.taskReward,want);assert.equal(saves.get(a).state.orbs,10);const captured=saves.get(a).state.focusElapsedMs;
 if(elapsed===300000&&mins===0){await p.clock.fastForward(1200000);await p.reload();await p.getByTestId('finishing-secondary-actions').waitFor();}
 const finish=p.getByTestId('finishing-secondary-actions').locator('..').getByRole('button').first();if(mins===0&&elapsed===900000)failure='after';await finish.click();if(mins===0&&elapsed===900000){await p.getByTestId('sync-recovery').waitFor();await p.getByRole('button',{name:'重試同步',exact:true}).click();}await p.getByTestId('completion-task-label').waitFor();assert.equal(saves.get(a).state.orbs,10+want);assert.equal(saves.get(a).state.history.at(-1).reward,want);assert.equal(saves.get(a).state.focusElapsedMs,captured);assert.equal(saves.get(a).state.history[0].reward,5);assert.equal(saves.get(a).state.taskReward,want);
 await p.reload();await p.waitForTimeout(400);assert.equal(saves.get(a).state.orbs,10+want);
 }
 saves.get(a).state={...original,minutes:0,taskReward:5,focusElapsedMs:1500000,focusStartedAt:await p.evaluate(()=>Date.now()),deadline:null};await p.reload();await p.getByRole('button',{name:'這次先到這裡',exact:true}).click();await p.getByRole('button',{name:'確認結束',exact:true}).click();await p.getByTestId('unfinished-result').waitFor();assert.equal(saves.get(a).state.orbs,10);assert.equal(saves.get(a).state.history.at(-1).reward,0);
 assert.deepEqual(saves.get(b).state,sibling);assert.deepEqual(errors,[]);console.log('PASS untimed0/1/3/5 rewards, timed preserved, help/finishing excluded, history and reload no duplicate, sibling unchanged',width);await context.close();
}}finally{await browser.close();server.close();server.closeAllConnections();}

// All assertions and browser cleanup are awaited above; stop leftover fixture keepalive handles.
process.exit(0);
