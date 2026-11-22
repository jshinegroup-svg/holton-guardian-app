import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.css'?'text/css':ext==='.mp3'?'audio/mpeg':ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'],executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of [[390,844],[1024,900]]){
 const family=randomUUID(),user=randomUUID(),a=randomUUID(),b=randomUUID();
 const kids=[{id:a,family_id:family,nickname:'哥哥',age_years:8,age_recorded_at:new Date().toISOString()},{id:b,family_id:family,nickname:'妹妹',age_years:6,age_recorded_at:new Date().toISOString()}];
 const seed=name=>({version:1,starterChoiceVersion:1,starterCompanionId:'pip',onboardingDone:true,childName:name,title:name==='哥哥'?'數學作業':'閱讀',minutes:5,orbs:name==='哥哥'?10:30,phase:'ready',deadline:null,remaining:300,help:false,history:[],guardian:{},guardianCards:[],allowEarlyFinish:true,focusMusicEnabled:false});
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

 await p.goto(base);
 await p.getByLabel('6 位數家長密碼',{exact:true}).fill('493726');await p.getByLabel('再次輸入家長密碼',{exact:true}).fill('493726');
 await p.getByRole('button',{name:'繼續設定',exact:true}).click();await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();
 await p.getByRole('button',{name:'離開家長管理',exact:true}).click();
 await p.getByRole('button',{name:'只有 哥哥 玩',exact:true}).click();
 await p.getByTestId('adventure-village').waitFor();
 const before=JSON.stringify([...saves]);
 await p.getByRole('button',{name:'夥伴小屋',exact:true}).click();
 await p.getByRole('button',{name:'進入守護獸小屋',exact:true}).click();
 const frame=await p.getByTestId('guardian-home-frame').elementHandle();const f=await frame.contentFrame();
 await f.waitForFunction(()=>window.guardianFace?.ready);
 assert(await f.evaluate(()=>guardianFace.state().active));
 assert.equal(await f.locator('#voice').getAttribute('aria-label'),'長按麥克風錄音，放開回放，最長九秒');
 await f.locator('.ball').click();await p.waitForTimeout(800);
 await f.locator('[data-room="1"]').click();await f.locator('[data-room="2"]').click();await f.locator('[data-room="0"]').click();
 await f.locator('.sound').click();await f.waitForFunction(()=>guardianHome.state().speaking);
 const apple=await f.locator('.prop-feed').boundingBox(),pet=await f.locator('.stage .pet').boundingBox();
 await p.mouse.move(apple.x+apple.width/2,apple.y+apple.height/2);await p.mouse.down();await p.waitForTimeout(1400);const stablePet=await f.locator('.stage .pet').boundingBox();await p.mouse.move(stablePet.x+stablePet.width*.29,stablePet.y+stablePet.height*.55);await f.waitForFunction(()=>guardianCareState().eaten);await p.mouse.up();await f.waitForFunction(()=>guardianHome.state().joy);
 await p.screenshot({path:`reports/guardian-home-integration/home-${width}.png`,fullPage:true});
 const mic=await f.locator('#voice').boundingBox();await p.mouse.move(mic.x+mic.width/2,mic.y+mic.height/2);await p.mouse.down();await f.waitForFunction(()=>guardianHoldState().recording);await p.waitForTimeout(700);await p.mouse.up();await f.waitForFunction(()=>guardianHoldState().playing);
 await p.getByRole('button',{name:'離開守護獸小屋，回到村莊',exact:true}).click();
 await p.getByTestId('adventure-village').waitFor();assert.equal(await p.locator('iframe').count(),0);assert.equal(JSON.stringify([...saves]),before);
 if(width===390){
 await p.getByRole('button',{name:'夥伴小屋',exact:true}).click();await p.getByRole('button',{name:'進入守護獸小屋',exact:true}).click();
 const f2=await (await p.getByTestId('guardian-home-frame').elementHandle()).contentFrame();await f2.waitForFunction(()=>window.guardianFace?.ready);
 const m=await f2.locator('#voice').boundingBox();await p.mouse.move(m.x+m.width/2,m.y+m.height/2);await p.mouse.down();await f2.waitForFunction(()=>guardianHoldState().recording);
 await f2.evaluate(()=>{parent.__testMicTracks=stream.getTracks()});
 await p.getByRole('button',{name:'離開守護獸小屋，回到村莊',exact:true}).evaluate(e=>e.click());await p.mouse.up();
 await p.waitForFunction(()=>window.__testMicTracks.every(t=>t.readyState==='ended'));console.log('PASS microphone released on frame close');
 }
 await p.getByRole('button',{name:'家長小屋',exact:true}).click();
 await p.getByLabel('6 位數家長密碼',{exact:true}).fill('493726');await p.getByRole('button',{name:'確認',exact:true}).click();
 await p.getByRole('button',{name:'音樂',exact:true}).click();
 await p.getByRole('button',{name:'略過教學',exact:true}).click();await p.getByRole('button',{name:'先自己探索',exact:true}).click();await p.getByRole('button',{name:'音樂',exact:true}).click();
 for(const [category,title] of [['專注音樂',null],['放鬆音樂',null],['鋼琴組','Friday Morning'],['平靜環境音樂','That Zen Moment']]){
  await p.getByRole('button',{name:category,exact:true}).click();await p.locator('[data-testid^="music-track-"]').first().waitFor();assert.equal(await p.locator('[data-testid^="music-track-"]').count(),10);
  if(title){await p.getByRole('button',{name:'展開'+title,exact:true}).click();await p.getByRole('button',{name:'試聽'+title,exact:true}).click();await p.waitForFunction(()=>{const a=document.querySelector('audio[data-testid="focus-music-player"]');return a&&!a.paused&&a.currentTime>.1});}
  await p.getByRole('button',{name:'返回音樂分類',exact:true}).click();
 }
 await p.screenshot({path:`reports/guardian-home-integration/music-${width}.png`,fullPage:true});
 assert.equal(JSON.stringify([...saves]),before);assert.deepEqual(errors,[]);console.log('PASS',width,'embedded home, feed, ball, rooms, recording, exit, unchanged progress, four music categories');await context.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
