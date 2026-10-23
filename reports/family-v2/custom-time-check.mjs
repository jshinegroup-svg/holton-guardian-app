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
 const seed=name=>({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'ready',deadline:null,remaining:300,help:false,supportUsed:['rest'],breakDeadline:null,focusElapsedMs:0,focusStartedAt:Date.now(),rewardProgress:2,dailyGoal:1,taskReward:1,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
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
 await p.goto(base);console.log('loaded',await p.locator('body').innerText());await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();


 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();await p.getByRole('button',{name:'開始任務',exact:true}).click();
 const previous=p.getByRole('button',{name:'上一張時間卡',exact:true}),next=p.getByRole('button',{name:'下一張時間卡',exact:true});
 await previous.click();await p.waitForTimeout(100);await previous.click();await p.getByTestId('custom-time-card').waitFor();
 const input=p.getByLabel('自訂時間（分鐘）',{exact:true}),apply=p.getByRole('button',{name:'用這個時間',exact:true}),prepare=p.getByRole('button',{name:'準備出發',exact:true});
 assert.equal(await input.inputValue(),'10');assert.equal(await prepare.isDisabled(),true);
 const art=p.getByTestId('time-card-image-custom-time');assert.equal(await art.evaluate(e=>getComputedStyle(e).opacity),'1');await art.scrollIntoViewIfNeeded();await p.screenshot({path:'reports/family-v2/custom-art-'+width+'.png'});
 const sibling=structuredClone(saves.get(b).state);
 for(const invalid of ['','0','61','-1','1.5','abc']){await input.fill(invalid);assert.equal(await apply.isDisabled(),true);assert.equal(await prepare.isDisabled(),true);}
 await input.fill('1');assert.equal(await p.getByRole('button',{name:'自訂時間減少 1 分鐘',exact:true}).isDisabled(),true);
 await input.fill('60');assert.equal(await p.getByRole('button',{name:'自訂時間增加 1 分鐘',exact:true}).isDisabled(),true);
 await input.fill('15');await p.getByRole('button',{name:'自訂時間增加 1 分鐘',exact:true}).click();assert.equal(await input.inputValue(),'16');
 failure='after';await apply.click();await p.getByTestId('sync-recovery').waitFor();await p.getByRole('button',{name:'重試同步',exact:true}).click();await input.waitFor();assert.equal(await prepare.isEnabled(),true);assert.equal(saves.get(a).state.lastCustomMinutes,16);assert.equal(saves.get(a).state.cardId,'custom-time');assert.equal(saves.get(a).state.orbs,10);assert.deepEqual(saves.get(b).state,sibling);
 await next.click();await p.waitForTimeout(100);assert.equal(saves.get(a).state.minutes,3);await previous.click();await input.waitFor();assert.equal(await input.inputValue(),'16');await apply.click();
 await p.reload();await p.getByRole('button',{name:'開始任務',exact:true}).click();await input.waitFor();assert.equal(await input.inputValue(),'16');assert.equal(await prepare.isEnabled(),true);
 await p.getByTestId('custom-time-card').scrollIntoViewIfNeeded();await p.screenshot({path:'reports/family-v2/custom-controls-'+width+'.png'});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await prepare.click();await p.getByRole('button',{name:'我準備好了，開始！',exact:true}).click();await p.getByTestId('focus-complete').waitFor();
 const running=saves.get(a).state;assert.equal(running.minutes,16);assert.equal(running.taskReward,3);assert.equal(running.lastCustomMinutes,16);assert.equal(running.cardId,'custom-time');assert(running.deadline>Date.now()+950000);assert.equal(await p.getByTestId('custom-time-card').count(),0);
 saves.get(a).state.focusElapsedMs=16*60000;saves.get(a).state.focusStartedAt=Date.now();saves.get(a).state.deadline=Date.now()-1;await p.reload();await p.getByRole('button',{name:'還差一點',exact:true}).click();await p.getByTestId('crystal-clock').waitFor();assert.equal(saves.get(a).state.remaining,120);assert.equal(saves.get(a).state.taskReward,3);assert.equal(saves.get(a).state.minutes,16);
 await p.getByTestId('focus-complete').click();await p.getByRole('button',{name:'還有一點，回去繼續',exact:true}).waitFor();await p.getByTestId('mission-stage').getByTestId('primary-action').click();await p.waitForTimeout(300);
 assert.equal(saves.get(a).state.orbs,13);assert.equal(saves.get(a).state.history[0].reward,3);assert.equal(completions,1);assert.deepEqual(saves.get(b).state,sibling);
 await p.evaluate(family=>localStorage.removeItem('holton-family-v2::'+family+'::solo-child'),family);await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();
 const panels=p.getByTestId('duo-child-task');await panels.nth(0).getByRole('button',{name:'下一個任務',exact:true}).click();
 await panels.nth(0).getByLabel('任務時間（分鐘）',{exact:true}).fill('11');await panels.nth(1).getByLabel('任務時間（分鐘）',{exact:true}).fill('24');await p.getByRole('button',{name:'兩人一起開始',exact:true}).click();await p.waitForTimeout(400);
 assert.equal(saves.get(a).state.taskReward,2);assert.equal(saves.get(b).state.taskReward,4);assert.equal(saves.get(a).state.lastCustomMinutes,11);assert.equal(saves.get(b).state.lastCustomMinutes,24);assert.equal(saves.get(b).state.cardId,'custom-time');
 const beforeDeadline=saves.get(a).state.deadline;await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();assert.equal(saves.get(a).state.deadline,beforeDeadline);
 assert.deepEqual(errors,[]);console.log('PASS custom image,1-60 input,default10,plus/minus,apply gating,remember/reload,16min3orbs,duo11/24 isolated',width);await context.close();
}}finally{await browser.close();server.close();}
