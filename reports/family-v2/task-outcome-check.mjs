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
 await p.goto(base);console.log('loaded',await p.locator('body').innerText());await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();

 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();
 await p.getByTestId('task-outcome-choices').waitFor();
 await p.getByRole('button',{name:'進入專注介面',exact:true}).click();await p.getByTestId('task-away-panel').getByTestId('task-outcome-choices').waitFor();
 await p.getByRole('button',{name:'還差一點',exact:true}).click();await p.getByText('已補上 2 分鐘 · 繼續努力中',{exact:true}).waitFor();
 assert.equal(saves.get(a).state.phase,'active');assert.deepEqual(saves.get(a).state.supportUsed,['rest']);assert.equal(saves.get(a).state.history.length,0);
 await p.screenshot({path:`reports/family-v2/extension-${width}.png`,fullPage:true});const extended=saves.get(a).state;assert.equal(extended.remaining,120);assert(extended.deadline>Date.now()+115000);assert.equal(extended.minutes,5);
 await p.reload();await p.getByTestId('crystal-clock').waitFor();assert.equal(await p.getByTestId('task-outcome-choices').count(),0);assert.match(await p.getByTestId('crystal-clock').innerText(),/0[12]:[0-5][0-9]/);
 // Expire first extension, then verify repeat extension and its once-only recovery.
 saves.get(a).state.focusElapsedMs=extended.focusTargetMs;saves.get(a).state.focusStartedAt=Date.now();saves.get(a).state.deadline=Date.now()-1;
 await p.reload();await p.getByTestId('task-outcome-choices').waitFor();failure='after';await p.getByRole('button',{name:'還差一點',exact:true}).click();await p.getByTestId('sync-recovery').waitFor();const retryTarget=saves.get(a).state.focusTargetMs;
 await p.getByRole('button',{name:'重試同步',exact:true}).click();await p.getByTestId('crystal-clock').waitFor();assert.equal(saves.get(a).state.focusTargetMs,retryTarget);
 saves.get(a).state.focusElapsedMs=retryTarget;saves.get(a).state.focusStartedAt=Date.now();saves.get(a).state.deadline=Date.now()-1;
 await p.reload();await p.getByTestId('task-outcome-choices').waitFor();
 const before=structuredClone(saves.get(a).state);failure='after';await p.getByRole('button',{name:'這次先到這裡',exact:true}).click();await p.getByTestId('sync-recovery').waitFor();
 await p.getByRole('button',{name:'重試同步',exact:true}).click();await p.getByTestId('unfinished-result').waitFor();
 const after=saves.get(a).state;assert.equal(after.orbs,10);assert.equal(after.rewardProgress,2);assert.equal(after.history.length,1);assert.equal(after.history[0].outcome,'unfinished');assert.equal(after.history[0].reward,0);assert(after.history[0].elapsedSeconds>=300);assert.deepEqual(after.history[0].supportUsed,['rest']);assert.deepEqual(after.journeys.counts,before.journeys.counts);assert.equal(after.draws?.length??0,0);assert.equal(completions,0);assert.equal(saves.get(b).state.orbs,30);
 await p.screenshot({path:`reports/family-v2/unfinished-${width}.png`,fullPage:true});
 await p.reload();await p.getByRole('button',{name:'開始任務',exact:true}).waitFor();assert.equal(saves.get(a).state.history.length,1);assert.equal(saves.get(a).state.taskOutcome,'unfinished');
 await p.getByRole('button',{name:'開始任務',exact:true}).click();await p.getByRole('button',{name:'準備出發',exact:true}).click();await p.getByRole('button',{name:'我準備好了，開始！',exact:true}).click();await p.getByTestId('focus-help').waitFor();assert.deepEqual(saves.get(a).state.supportUsed,[]);assert.equal(saves.get(a).state.taskOutcome,undefined);
 // Due completion still rewards once, and prior unfinished attempt is not a completion.
 saves.get(a).state.focusElapsedMs=300000;saves.get(a).state.deadline=Date.now()-1000;
 await p.reload();await p.getByRole('button',{name:'我完成了',exact:true}).click();await p.getByRole('button',{name:'還有一點，回去繼續',exact:true}).waitFor();await p.getByTestId('mission-stage').getByTestId('primary-action').click();
 await p.waitForTimeout(500);assert.equal(saves.get(a).state.history.length,2);assert.equal(saves.get(a).state.history[1].outcome,'completed');assert.equal(saves.get(a).state.orbs,11);assert.equal(completions,1);assert.equal(saves.get(b).state.history.length,0);
 const siblingBefore=structuredClone(saves.get(a).state);saves.get(b).state.minutes=0;saves.get(b).state.focusElapsedMs=60000;saves.get(b).state.allowEarlyFinish=false;
 await p.evaluate(family=>localStorage.removeItem(`holton-family-v2::${family}::solo-child`),family);await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();const panels=p.getByTestId('duo-child-task');await panels.nth(1).getByRole('button',{name:'完成任務',exact:true}).waitFor();assert.equal(await panels.nth(1).getByRole('button',{name:'完成任務',exact:true}).isEnabled(),true);
 saves.get(b).state.focusElapsedMs=600000;await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();await panels.nth(1).getByTestId('task-outcome-choices').waitFor();
 await panels.nth(1).getByRole('button',{name:'還差一點',exact:true}).click();await p.waitForTimeout(500);assert.equal(saves.get(b).state.remaining,120);assert.equal(saves.get(b).state.minutes,0);assert.deepEqual(saves.get(a).state,siblingBefore);assert.match(await panels.nth(1).getByLabel('任務倒數',{exact:true}).innerText(),/0[12]:[0-5][0-9]/);
 saves.get(b).state.focusElapsedMs=saves.get(b).state.focusTargetMs;saves.get(b).state.focusStartedAt=Date.now();await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();await panels.nth(1).getByTestId('task-outcome-choices').waitFor();
 await panels.nth(1).getByRole('button',{name:'這次先到這裡',exact:true}).click();await panels.nth(1).getByRole('button',{name:'下一個任務',exact:true}).waitFor();assert.equal(saves.get(b).state.orbs,30);assert.equal(saves.get(b).state.history[0].outcome,'unfinished');assert.equal(saves.get(a).state.orbs,siblingBefore.orbs);assert.deepEqual(saves.get(a).state.history,siblingBefore.history);assert.equal(completions,1);
 await p.screenshot({path:`reports/family-v2/outcome-duo-${width}.png`,fullPage:true});

 // Early abandonment is available before eligibility, in help/away, and after entering finishing.
 for(const mode of ['active','help','away','finishing']){
  const previous=saves.get(a);saves.set(a,{...previous,state:{...seed('哥哥'),minutes:0,allowEarlyFinish:false,focusElapsedMs:mode==='finishing'?60000:0,focusStartedAt:Date.now()}});
  const sibling=structuredClone(saves.get(b).state);
  await p.evaluate(({family,a})=>localStorage.setItem(`holton-family-v2::${family}::solo-child`,a),{family,a});await p.reload();await p.getByTestId('focus-complete').waitFor();
  if(mode==='active')assert.equal(await p.getByTestId('focus-complete').isDisabled(),true);
  if(mode==='help')await p.getByRole('button',{name:'我需要幫忙',exact:true}).click();
  if(mode==='away'){await p.getByRole('button',{name:'進入專注介面',exact:true}).click();assert.equal(await p.getByTestId('task-away-panel').getByTestId('early-stop-choice').count(),0);await p.screenshot({path:'reports/family-v2/clean-focus-'+width+'.png',fullPage:true});await p.getByRole('button',{name:'回到任務',exact:true}).click();}
  if(mode==='finishing'){await p.getByTestId('focus-complete').click();await p.getByRole('button',{name:'還有一點，回去繼續',exact:true}).waitFor();}
  await p.getByRole('button',{name:'這次先到這裡',exact:true}).click();await p.getByTestId('unfinished-result').waitFor();
  const stopped=saves.get(a).state;assert.equal(stopped.history.length,1);assert.equal(stopped.history[0].outcome,'unfinished');assert.equal(stopped.history[0].reward,0);assert.equal(stopped.orbs,10);assert.equal(stopped.rewardProgress,2);assert.equal(completions,1);assert.deepEqual(saves.get(b).state,sibling);
 }

 const lastSave=saves.get(a);saves.set(a,{...lastSave,state:{...seed('哥哥'),focusElapsedMs:0,focusStartedAt:Date.now(),allowEarlyFinish:false}});const bBeforeStop=structuredClone(saves.get(b).state);
 await p.evaluate(family=>localStorage.removeItem(`holton-family-v2::${family}::solo-child`),family);await p.reload();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();
 await panels.nth(0).getByRole('button',{name:'這次先到這裡',exact:true}).click();await panels.nth(0).getByRole('button',{name:'下一個任務',exact:true}).waitFor();assert.equal(saves.get(a).state.history[0].outcome,'unfinished');assert.equal(saves.get(a).state.orbs,10);assert.equal(completions,1);assert.deepEqual(saves.get(b).state,bBeforeStop);
 console.log('PASS early stop before1min, help, away, finishing: no reward or sibling changes',width);
 console.log('PASS due choices, away, continue/reload, unfinished lost response idempotency, no rewards/progress, reset, completed branch',width);assert.deepEqual(errors,[]);await context.close();
}}finally{await browser.close();server.close();}
