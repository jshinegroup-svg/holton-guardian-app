import {chromium} from '/Users/user/.openclaw/extensions/lossless-claw.disabled-backup/node_modules/playwright-core/index.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomInt} from 'node:crypto';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve('dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.resolve('dist')+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});

try{for(const width of [320,390,900]){
 const context=await browser.newContext({viewport:{width,height:750}});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base);await p.getByLabel('家長 Email',{exact:true}).waitFor();
 await p.getByLabel('家長 Email',{exact:true}).fill('sample@example.invalid');
 await p.getByLabel('家庭帳號密碼',{exact:true}).fill('synthetic-only');
 await p.getByTestId('language-en').click();
 assert.equal(await p.getByLabel('Parent email',{exact:true}).inputValue(),'sample@example.invalid');
 assert.equal(await p.getByLabel('Family account password',{exact:true}).inputValue(),'synthetic-only');
 assert.equal(await p.getByLabel('Family account password',{exact:true}).getAttribute('type'),'password');
 await p.getByRole('button',{name:'Show Family account password',exact:true}).click();
 assert.equal(await p.getByLabel('Family account password',{exact:true}).evaluate(e=>e.type),'text');
 await p.getByRole('button',{name:'New here? Create a family account',exact:true}).click();
 assert.equal(await p.getByLabel('Family account password',{exact:true}).getAttribute('type'),'password');
 await p.getByLabel('Parent email',{exact:true}).fill('');await p.getByLabel('Family account password',{exact:true}).fill('');
 await p.getByRole('button',{name:'Sign up',exact:true}).click();await p.getByRole('alert').filter({hasText:'Enter an email'}).waitFor();
 await p.reload();await p.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 assert.equal(await p.locator('html').getAttribute('lang'),'en');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.screenshot({path:`reports/family-v2/english-login-${width}.png`,fullPage:true});
 const chinese=await p.locator('body').innerText();assert(!/[\u3400-\u9fff]/.test(chinese.replace('繁體中文','')));
 await p.getByTestId('language-zh-TW').click();await p.getByRole('button',{name:'登入',exact:true}).waitFor();
 assert.deepEqual(errors,[]);await context.close();console.log('PASS login language, persistence, inputs, password masking, no overflow',width);
}}finally{await browser.close();server.close();}
