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
 await p.getByLabel('6 位數家長密碼',{exact:true}).fill('493726');
 await p.getByLabel('再次輸入家長密碼',{exact:true}).fill('493726');
 await p.getByRole('button',{name:'繼續設定',exact:true}).click();
 await p.getByRole('button',{name:'已妥善保存，啟用家長密碼',exact:true}).click();
 await p.getByRole('button',{name:'離開家長管理',exact:true}).click();
 const before=JSON.stringify([...saves]);
 await p.getByTestId('language-en').click();
 await p.getByRole('button',{name:'Start duo adventure',exact:true}).waitFor();
 assert.equal(JSON.stringify([...saves]),before);
 await p.reload();
 await p.getByRole('button',{name:'Start duo adventure',exact:true}).click();
 await p.getByTestId('duo-child-task').nth(1).waitFor();
 assert.equal(await p.locator('html').getAttribute('lang'),'en');
 const panels=p.getByTestId('duo-child-task');
 await p.getByRole('button',{name:'Start together',exact:true}).click();
 await p.waitForFunction(()=>[...document.querySelectorAll('[data-testid="duo-child-task"]')].every(e=>e.textContent.includes('Focusing')));
 const deadlines=[saves.get(a).state.deadline,saves.get(b).state.deadline];
 // A storage event changes UI language without remounting active timers.
 await p.evaluate(()=>{localStorage.setItem('holton-family-v2::interface-language','zh-TW');window.dispatchEvent(new StorageEvent('storage',{key:'holton-family-v2::interface-language',newValue:'zh-TW'}));});
 await p.getByRole('button',{name:'兩人一起開始',exact:true}).waitFor();
 assert.deepEqual([saves.get(a).state.deadline,saves.get(b).state.deadline],deadlines);
 await p.evaluate(()=>{localStorage.setItem('holton-family-v2::interface-language','en');window.dispatchEvent(new StorageEvent('storage',{key:'holton-family-v2::interface-language',newValue:'en'}));});
 await p.getByRole('button',{name:'Start together',exact:true}).waitFor();
 assert.deepEqual([saves.get(a).state.deadline,saves.get(b).state.deadline],deadlines);
 assert.equal(saves.get(a).state.orbs,10);assert.equal(saves.get(b).state.orbs,30);
 assert.equal(saves.get(a).state.title,'數學作業');assert.equal(kids[0].nickname,'哥哥');
 assert.equal(await p.evaluate(()=>localStorage.getItem('holton-guardian-app::light-v1')),'original-v1-sentinel');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.screenshot({path:`reports/family-v2/english-duo-${width}.png`,fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS language persistence, active timer and progress preservation',width,height);
 await context.close();
 }
}finally{await browser.close();server.close();}
