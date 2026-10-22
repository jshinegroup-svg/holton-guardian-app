import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[320,568],[390,600],[844,390],[900,700]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
 const saves=new Map(kids.map(c=>[c.id,{child_id:c.id,family_id:family,revision:1,state:seed(c.nickname),updated_at:new Date().toISOString()}]));const ops=new Map();let completions=0;
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<800});const p=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);const errors=[];console.log('viewport',width);p.on('pageerror',e=>errors.push(e.message));
 await context.route('https://hzihwjpjcbsuqipaeeit.supabase.co/**',async route=>{const req=route.request(),url=new URL(req.url()),pathname=url.pathname;let data;
  if(pathname.endsWith('/rpc/record_usage_event'))data=null;
  else if(pathname.includes('/auth/v1/user'))data={id:user,email:'fixture@example.invalid'};
  else if(pathname.endsWith('/families'))data={id:family};
  else if(pathname.endsWith('/children')){if(req.method()==='PATCH'){const kid=kids.find(c=>c.id===url.searchParams.get('id')?.replace('eq.',''));Object.assign(kid,req.postDataJSON());}data=kids;}
  else if(pathname.endsWith('/child_saves')){const id=url.searchParams.get('child_id').replace('eq.','');data=saves.get(id)??null;}
  else if(pathname.endsWith('/rpc/save_child_progress')){const body=req.postDataJSON();if(ops.has(body.p_operation_id))data={...ops.get(body.p_operation_id),duplicate:true};else{const prev=saves.get(body.p_child_id);if(prev.revision!==body.p_expected_revision){await route.fulfill({status:409,json:{message:'revision_conflict'}});return;}const revision=prev.revision+1;saves.set(body.p_child_id,{...prev,revision,state:body.p_state});data={revision,duplicate:false};ops.set(body.p_operation_id,data);completions+=body.p_events.filter(e=>e.kind==='task_completed').length;}}
  else {await route.fulfill({status:400,json:{message:'unmocked route'}});return;}
  await route.fulfill({status:200,json:data});
 });
 // Only synthetic local test session; production does not contain a test bypass.
 await p.addInitScript(({user})=>{const enc=x=>btoa(JSON.stringify(x));const exp=Math.floor(Date.now()/1000)+3600;localStorage.setItem('holton-family-v2-auth',JSON.stringify({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.test`,refresh_token:'synthetic-test',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid'}}));localStorage.setItem('holton-guardian-app::light-v1','original-v1-sentinel');},{user});
 await p.goto(base);console.log('loaded',await p.locator('body').innerText());await p.getByLabel('6 位數家長密碼',{exact:true}).fill(String(randomInt(100000,999999)));const value=await p.getByLabel('6 位數家長密碼',{exact:true}).inputValue();await p.getByLabel('再次輸入家長密碼',{exact:true}).fill(value);await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();
 await p.getByLabel('孩子 1 的名字',{exact:true}).fill('哥哥新版');await p.getByRole('button',{name:'儲存名字',exact:true}).click();await p.getByText('名字已儲存，原有進度保留。',{exact:true}).waitFor();assert.equal(kids[0].nickname,'哥哥新版');assert.equal(saves.get(a).state.orbs,10);assert.equal(await p.getByLabel('孩子 3 的名字',{exact:true}).count(),0);
 console.log('select children');await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();await p.getByTestId('duo-child-task').nth(1).waitFor();console.log('duo ready');
 const panels=p.getByTestId('duo-child-task');
 const fits=async(label)=>{const boxes=await panels.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}));assert.equal(boxes.length,2);for(const box of boxes){assert(box.top>=0&&box.bottom<=height,`${label}: ${width}x${height} ${JSON.stringify(box)}`);assert(box.left>=0&&box.right<=width);}console.log('both fully visible',label,boxes);};
 await fits('ready');await p.screenshot({path:`reports/family-v2/compact-ready-${width}.png`});await panels.nth(0).getByLabel('任務時間（分鐘）',{exact:true}).fill('5');await panels.nth(1).getByLabel('任務時間（分鐘）',{exact:true}).fill('10');await p.getByRole('button',{name:'兩人一起開始',exact:true}).click();
 await p.waitForFunction(()=>[...document.querySelectorAll('[data-testid="duo-child-task"]')].every(e=>e.textContent.includes('努力中')));
 await fits('active');await p.screenshot({path:`reports/family-v2/compact-active-${width}.png`});assert.equal(saves.get(a).state.focusStartedAt,saves.get(b).state.focusStartedAt);assert.equal(saves.get(b).state.deadline-saves.get(a).state.deadline,300000);
 const start=saves.get(a).state.focusStartedAt;await p.getByRole('button',{name:'兩人一起開始',exact:true}).click();await p.getByRole('alert').filter({hasText:'進行中的任務不會重啟'}).waitFor();assert.equal(saves.get(a).state.focusStartedAt,start);

 await panels.nth(1).getByRole('button',{name:'完成任務',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('[data-testid="duo-child-task"]')[1]?.textContent.includes('準備收尾'));
 await panels.nth(1).getByTestId('primary-action').click();await p.waitForFunction(()=>document.querySelectorAll('[data-testid="duo-child-task"]')[1]?.textContent.includes('完成了！'));
 assert.equal(saves.get(a).state.orbs,10);assert.equal(saves.get(a).state.phase,'active');assert.equal(saves.get(b).state.orbs,32);assert.equal(completions,1);
 await panels.nth(0).getByRole('button',{name:'進入個人畫面',exact:true}).click();await p.getByRole('button',{name:'回雙人畫面',exact:true}).click();await panels.nth(0).waitFor();assert.equal(saves.get(a).state.phase,'active');
 assert.equal(await p.evaluate(()=>localStorage.getItem('holton-guardian-app::light-v1')),'original-v1-sentinel');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.screenshot({path:`reports/family-v2/duo-${process.env.TEST_BASE_URL?'public-':''}${width}.png`,fullPage:true});
 await p.reload();console.log('select children');await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();await p.getByTestId('duo-child-task').nth(1).waitFor();console.log('duo ready');assert.equal(saves.get(b).state.orbs,32);assert.equal(completions,1);assert.deepEqual(errors,[]);
 await panels.nth(1).getByRole('button',{name:'下一個任務',exact:true}).click();await panels.nth(1).getByLabel('任務時間（分鐘）',{exact:true}).fill('15');const siblingDeadline=saves.get(a).state.deadline;await panels.nth(1).getByRole('button',{name:'開始任務',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('[data-testid="duo-child-task"]')[1]?.textContent.includes('努力中'));assert.equal(saves.get(a).state.deadline,siblingDeadline);assert.equal(saves.get(b).state.minutes,15);
 // Complete solo mode must keep the same child save, remove chrome, and survive reload.
 const beforeSolo=[saves.get(a).state.deadline,saves.get(b).state.deadline,saves.get(a).state.orbs,saves.get(b).state.orbs];
 await panels.nth(0).getByRole('button',{name:'進入個人畫面',exact:true}).click();
 const village=async()=>{await p.getByTestId('immersive-world').filter({visible:true}).waitFor();if(!await p.getByRole('button',{name:'家長小屋',exact:true}).count())await p.getByRole('button',{name:'回到村莊',exact:true}).click();await p.getByRole('button',{name:'家長小屋',exact:true}).waitFor();};
 const unlock=async()=>{await village();await p.getByRole('button',{name:'家長小屋',exact:true}).click();await p.getByLabel('6 位數家長密碼',{exact:true}).fill(value);await p.getByRole('button',{name:'確認',exact:true}).click();await p.getByTestId('family-mode-settings').waitFor();};
 await unlock();await p.getByRole('button',{name:'改為完整單人模式',exact:true}).click();
 await p.waitForFunction(()=>!document.querySelector('[data-testid="family-game-nav"]'));
 assert.deepEqual([saves.get(a).state.deadline,saves.get(b).state.deadline,saves.get(a).state.orbs,saves.get(b).state.orbs],beforeSolo);
 await p.reload();await village();assert.equal(await p.getByTestId('family-game-nav').count(),0);assert.equal(await p.getByRole('button',{name:'開始雙人冒險',exact:true}).count(),0);
 await p.screenshot({path:`reports/family-v2/solo-${width}.png`});await unlock();await p.getByRole('button',{name:'切換孩子／雙人模式',exact:true}).click();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).waitFor();
 await p.getByRole('button',{name:'只有 妹妹 玩',exact:true}).click();await village();assert.equal(await p.getByTestId('family-game-nav').count(),0);assert.equal(await p.evaluate(family=>localStorage.getItem(`holton-family-v2::${family}::solo-child`),family),b);
 await p.reload();await village();await unlock();await p.getByRole('button',{name:'切換孩子／雙人模式',exact:true}).click();await p.getByRole('button',{name:'開始雙人冒險',exact:true}).click();await panels.nth(1).waitFor();assert.deepEqual([saves.get(a).state.deadline,saves.get(b).state.deadline,saves.get(a).state.orbs,saves.get(b).state.orbs],beforeSolo);
 assert.deepEqual(errors,[]);console.log('PASS solo: no top chrome, parent-only mode controls, reload remembered, switch child, return duo, deadlines/balances intact');
 console.log(`PASS ${width}: sibling isolation, independent timers, completion once, expand/back, reload, V1 intact, no overflow/JS errors`);await context.close();
}}finally{await browser.close();server.close();}
