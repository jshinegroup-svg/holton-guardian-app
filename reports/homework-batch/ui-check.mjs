import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.mp3'?'audio/mpeg':ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'],executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[320,740],[844,390]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const pin=String(randomInt(100000,999999));
 const seed=name=>({version:1,homeworkCardSelected:true,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],homework:{days:{[new Date().toLocaleDateString('en-CA')]:{tasks:[{id:'one',title:'數學',detail:'第1頁',reported:true},{id:'two',title:'國語',detail:'第2頁',reported:true},{id:'three',title:'閱讀',detail:'10分鐘'}]}}},allowEarlyFinish:true,focusMusicEnabled:false});
 const saves=new Map(kids.map(c=>[c.id,{child_id:c.id,family_id:family,revision:1,state:seed(c.nickname),updated_at:new Date().toISOString()}]));const ops=new Map();let completions=0;
 const context=await browser.newContext({viewport:{width,height},permissions:['microphone'],hasTouch:true,isMobile:width<800});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);const errors=[];console.log('viewport',width);p.on('pageerror',e=>errors.push(e.message));
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

 await p.addInitScript(({family,a})=>{localStorage.setItem(`holton-family-v2::${family}::${a}::homework-guide-v1`,'seen');localStorage.setItem(`holton-family-v2::${family}::${a}::holton-guardian-app::spotlight-v1`,JSON.stringify({main:true,companions:true,wishes:true,parent:true}));},{family,a});
 await p.goto(base);
 await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(pin);
 await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();
 await p.getByRole('button',{name:'離開家長管理',exact:true}).click();
 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();
 await p.getByTestId('adventure-village').waitFor();

 const sibling=JSON.stringify(saves.get(b)),day=new Date().toLocaleDateString('en-CA');
 await p.getByRole('button',{name:'開始任務',exact:true}).click();
 await p.waitForTimeout(500);
 if(await p.getByRole('button',{name:'略過教學',exact:true}).isVisible()){await p.getByRole('button',{name:'略過教學',exact:true}).click();await p.getByRole('button',{name:'先自己探索',exact:true}).click();}
 await p.getByRole('button',{name:'進入功課模式',exact:true}).click();
 await p.getByTestId('homework-page').waitFor();await p.waitForTimeout(300);
 if(await p.getByRole('button',{name:'先略過',exact:true}).isVisible())await p.getByRole('button',{name:'先略過',exact:true}).click();
 const tap=async name=>p.getByRole('button',{name,exact:true}).click();
 await tap('老師／家長確認');await p.getByTestId('homework-batch-review').waitFor();assert.equal(await p.getByTestId('parent-pin-gate').count(),0);
 await p.getByRole('checkbox',{name:'勾選 數學',exact:true}).click();await p.getByRole('checkbox',{name:'勾選 國語',exact:true}).click();
 await tap('確認這 2 項完成');await p.getByTestId('parent-pin-gate').waitFor();await tap('返回原畫面，不需要密碼');
 assert(!saves.get(a).state.homework.days[day].tasks.some(t=>t.confirmed));
 await tap('確認這 2 項完成');await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await p.getByTestId('homework-map-actions').waitFor();
 let state=saves.get(a).state;assert.deepEqual(state.homework.days[day].tasks.map(t=>!!t.confirmed),[true,true,false]);assert.equal(state.rewardProgress,2);assert.equal(state.orbs,10);
 await tap('老師／家長確認');assert.equal(await p.getByTestId('parent-pin-gate').count(),0);assert.equal(await p.getByRole('checkbox',{checked:true}).count(),0);
 await tap('全選待確認');await tap('清除勾選');assert.equal(await p.getByRole('checkbox',{checked:true}).count(),0);
 await p.screenshot({path:`/tmp/homework-batch-${width}.png`,fullPage:true});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.getByRole('button',{name:'確認這一項',exact:true}).click();await p.getByTestId('parent-pin-gate').waitFor();
 await p.getByLabel('6 位數家長密碼',{exact:true}).fill(pin);await tap('確認');await p.getByTestId('homework-map-actions').waitFor();
 state=saves.get(a).state;assert(state.homework.days[day].tasks.every(t=>t.confirmed));assert.equal(state.rewardProgress,0);assert.equal(state.draws.length,1);assert.equal(state.orbs,10);
 await tap('老師／家長確認');assert.equal(await p.getByRole('button',{name:'確認這一項',exact:true}).count(),0);assert.equal(JSON.stringify(saves.get(b)),sibling);assert.deepEqual(errors,[]);
 console.log('PASS',width,'select batch, cancel no mutation, one PIN confirms only selection, next action reauth, single item, rewards/draw dedup/sibling/viewport');await context.close();
}}finally{await browser.close();server.close();server.closeAllConnections();}
process.exit(0);
