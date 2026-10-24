import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});

try{for(const recovery of [false,true]){
 const user=randomUUID(),family=randomUUID();let updates=0,resets=0,signups=0,loginFails=true;
 const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const exp=Math.floor(Date.now()/1000)+3600;
 const session={access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user,exp,role:'authenticated'})}.synthetic`,refresh_token:'synthetic-test',expires_in:3600,token_type:'bearer',user:{id:user,email:'fixture@example.invalid',aud:'authenticated'}};
 const context=await browser.newContext({viewport:{width:390,height:750}});const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await context.route('https://hzihwjpjcbsuqipaeeit.supabase.co/**',async route=>{const req=route.request(),url=new URL(req.url());let data={};
  if(url.pathname.endsWith('/token')){if(!recovery&&loginFails){loginFails=false;return route.fulfill({status:400,json:{error:'invalid_grant',error_description:'fixture invalid credentials'}});}data=session;}
  else if(url.pathname.endsWith('/recover')){resets++;data={};}
  else if(url.pathname.endsWith('/signup')){signups++;data={user:session.user,session:null};}
  else if(url.pathname.endsWith('/user')){if(req.method()==='PUT')updates++;data=session.user;}
  else if(url.pathname.endsWith('/logout'))return route.fulfill({status:204});
  else if(url.pathname.endsWith('/families'))data={id:family};
  else if(url.pathname.endsWith('/children'))data=[];
  else return route.fulfill({status:400,json:{message:'unmocked route'}});
  await route.fulfill({status:200,json:data});
 });
 if(recovery)await p.addInitScript(()=>localStorage.setItem('holton-family-v2-auth-code-verifier',JSON.stringify('synthetic-verifier/recovery')));
 await p.goto(base+(recovery?'/?code=synthetic-code':''));
 const secret=randomUUID();
 if(recovery){await p.getByRole('button',{name:'儲存新密碼',exact:true}).waitFor();await p.getByLabel('家庭帳號密碼',{exact:true}).fill('short');await p.getByRole('button',{name:'儲存新密碼',exact:true}).click();await p.getByRole('alert').filter({hasText:'至少 8'}).waitFor();assert.equal(updates,0);await p.getByLabel('家庭帳號密碼',{exact:true}).fill(secret);await p.getByRole('button',{name:'儲存新密碼',exact:true}).click();await p.getByLabel('6 位數家長密碼',{exact:true}).waitFor();assert.equal(updates,1);}
 else{await p.getByRole('button',{name:'忘記密碼',exact:true}).click();await p.getByRole('alert').filter({hasText:'請先填家長 Email'}).waitFor();assert.equal(resets,0);await p.getByLabel('家長 Email',{exact:true}).fill('fixture@example.invalid');await p.getByRole('button',{name:'忘記密碼',exact:true}).click();await p.getByRole('alert').filter({hasText:'將收到重設密碼信'}).waitFor();assert.equal(resets,1);
 await p.getByRole('button',{name:'第一次使用，建立家庭帳號',exact:true}).click();await p.getByLabel('家庭帳號密碼',{exact:true}).fill(secret);await p.getByRole('button',{name:'註冊',exact:true}).click();await p.getByRole('alert').filter({hasText:'請到信箱點選確認連結'}).waitFor();assert.equal(signups,1);
 await p.getByRole('button',{name:'已有帳號，登入',exact:true}).click();await p.getByLabel('家庭帳號密碼',{exact:true}).fill(secret);await p.getByRole('button',{name:'登入',exact:true}).click();await p.getByRole('alert').filter({hasText:'登入失敗'}).waitFor();await p.getByRole('button',{name:'登入',exact:true}).click();await p.getByLabel('6 位數家長密碼',{exact:true}).waitFor();}
 assert.deepEqual(errors,[]);console.log('PASS isolated auth fixture',recovery?'PKCE recovery/short-password guard/update':'forgot-password validation/request, signup verification prompt, incorrect/correct login');await context.close();
}}finally{await browser.close();server.close();server.closeAllConnections();}

// All assertions and browser cleanup are awaited above; stop leftover fixture keepalive handles.
process.exit(0);
