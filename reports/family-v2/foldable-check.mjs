import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[466,678]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
 const saves=new Map(kids.map(c=>[c.id,{child_id:c.id,family_id:family,revision:1,state:seed(c.nickname),updated_at:new Date().toISOString()}]));const ops=new Map();let completions=0;
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
  else if(pathname.endsWith('/rpc/save_child_progress')){const body=req.postDataJSON();if(ops.has(body.p_operation_id))data={...ops.get(body.p_operation_id),duplicate:true};else{const prev=saves.get(body.p_child_id);if(prev.revision!==body.p_expected_revision){await route.fulfill({status:409,json:{message:'revision_conflict'}});return;}const revision=prev.revision+1;saves.set(body.p_child_id,{...prev,revision,state:body.p_state});data={revision,duplicate:false};ops.set(body.p_operation_id,data);completions+=body.p_events.filter(e=>e.kind==='task_completed').length;}}
  else {await route.fulfill({status:400,json:{message:'unmocked route'}});return;}
  await route.fulfill({status:200,json:data});
 });
 // Only synthetic local test session; production does not contain a test bypass.
 await p.addInitScript(({user})=>{const enc=x=>btoa(JSON.stringify(x));const exp=Math.floor(Date.now()/1000)+3600;localStorage.setItem('holton-family-v2-auth',JSON.stringify({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.test`,refresh_token:'synthetic-test',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid'}}));localStorage.setItem('holton-guardian-app::light-v1','original-v1-sentinel');},{user});
 await p.goto(base);console.log('loaded',await p.locator('body').innerText());await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'顯示6 位數家長密碼',exact:true}).click();assert.equal(await p.getByLabel('6 位數家長密碼',{exact:true}).evaluate(e=>e.type),'text');assert.equal(await p.getByLabel('再次輸入家長密碼',{exact:true}).evaluate(e=>e.type),'password');await p.getByRole('button',{name:'隱藏6 位數家長密碼',exact:true}).click();await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();

 await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();
 const panels=p.getByTestId('duo-child-task');await panels.nth(1).waitFor();
 await p.getByRole('button',{name:'兩人一起開始',exact:true}).click();
 await p.waitForFunction(()=>[...document.querySelectorAll('[data-testid="duo-child-task"]')].every(e=>e.textContent.includes('努力中')));
 const before=[...saves].map(([id,s])=>[id,s.state.deadline,s.state.orbs,s.state.phase]);
 // Candidate CSS viewport sizes, not a claim of physical Safari device measurements.
 for(const [w,h] of [[466,678],[678,466],[626,890],[890,626],[744,1056],[1056,744],[390,600],[844,390],[466,678]]){
  await p.setViewportSize({width:w,height:h});await p.waitForTimeout(200);
  const boxes=await panels.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
  assert.equal(boxes.length,2);
  for(const r of boxes){assert(r.x>=0&&r.x+r.width<=w+1,JSON.stringify({w,h,r}));assert(r.y>=0&&r.y+r.height<=h+1,JSON.stringify({w,h,r}));}
  const horizontal=w>=700||(w>=640&&w>h);
  assert(horizontal?Math.abs(boxes[0].y-boxes[1].y)<2:boxes[1].y>=boxes[0].y+boxes[0].height);
  assert.deepEqual([...saves].map(([id,s])=>[id,s.state.deadline,s.state.orbs,s.state.phase]),before);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.screenshot({path:`reports/family-v2/foldable-${w}x${h}.png`});
  console.log('PASS live fold/rotate',w,h);
 }
 await panels.nth(0).getByRole('button',{name:'進入個人畫面',exact:true}).click();
 await p.getByRole('button',{name:'繼續任務',exact:true}).click();
 await p.getByTestId('focus-companion-panel').filter({visible:true}).waitFor();
 for(const [w,h] of [[466,678],[678,466],[626,890],[890,626],[466,678]]){
  await p.setViewportSize({width:w,height:h});await p.waitForTimeout(200);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual([...saves].map(([id,s])=>[id,s.state.deadline,s.state.orbs,s.state.phase]),before);
  const complete=p.getByRole('button',{name:'完成',exact:true});
  await complete.scrollIntoViewIfNeeded();assert(await complete.isVisible());
  await p.screenshot({path:`reports/family-v2/foldable-solo-${w}x${h}.png`});
  console.log('PASS solo fold/rotate',w,h);
 }
 assert.equal(completions,0);assert.deepEqual(errors,[]);
 await context.close();
}}finally{await browser.close();server.close();server.closeAllConnections();}
process.exit(0);
