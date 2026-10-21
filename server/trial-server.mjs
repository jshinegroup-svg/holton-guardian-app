import http from 'node:http';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const page=(error='')=>`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Holton Hero · 朋友試玩</title><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#072433;color:#fff2bc;font:18px system-ui}main{box-sizing:border-box;width:min(92vw,440px);padding:28px;border:1px solid #b99a50;border-radius:24px;background:#0b3445}input,button{box-sizing:border-box;width:100%;padding:16px;margin:12px 0;border-radius:12px;font:inherit}button{background:#08798a;color:white;border:1px solid #d9bd78}p{line-height:1.7;color:#d8e8ed}.password-field{position:relative}.password-field input{padding-right:100px}.password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:auto;margin:0;padding:10px;font-size:15px;background:#e7f0f3;color:#123b49;border:1px solid #71909c;min-height:44px}</style><main><h1>歡迎來到 Holton Hero</h1><p>請由家長輸入收到的試玩通關密碼。進入後，再設定自己家庭的家長小屋密碼。</p><form method="post" action="/trial/login"><label for="password">試玩通關密碼</label><div class="password-field"><input id="password" name="password" type="password" autocomplete="current-password" maxlength="128" required><button class="password-toggle" type="button" aria-label="顯示密碼" aria-controls="password" aria-pressed="false">👁 顯示</button></div><button type="submit">進入冒險</button></form><script>const toggle=document.querySelector(".password-toggle");function hidePassword(){document.querySelector("#password").type="password";toggle.textContent="👁 顯示";toggle.setAttribute("aria-label","顯示密碼");toggle.setAttribute("aria-pressed","false");}toggle.addEventListener("click",function(){const p=document.querySelector("#password"),show=p.type==="password";p.type=show?"text":"password";this.textContent=show?"👁 隱藏":"👁 顯示";this.setAttribute("aria-label",show?"隱藏密碼":"顯示密碼");this.setAttribute("aria-pressed",String(show));});document.addEventListener("visibilitychange",function(){if(document.hidden)hidePassword();});document.querySelector("form").addEventListener("submit",function(){const b=this.querySelector("button[type=submit]");b.disabled=true;b.textContent="正在驗證，請稍候…";});window.addEventListener("pageshow",function(){const b=document.querySelector("button[type=submit]");b.disabled=false;b.textContent="進入冒險";hidePassword();});</script><p role="alert">${error}</p></main></html>`;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ttf':'font/ttf','.woff2':'font/woff2','.ico':'image/x-icon'};
export function createTrialServer({root,password,secure=true,origin}){
 if(typeof password!=='string'||password.length<12)throw Error('Trial password must be configured securely (at least 12 characters).');
 const salt=randomBytes(16),expected=scryptSync(password,salt,32),sessions=new Map(),attempts=new Map();
 const rootPath=path.resolve(root);let globalWindow=Date.now(),globalCount=0;
 const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
 const send=(status,body,type='text/html; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type});res.end(body);};
 try{
 const url=new URL(req.url,'http://local');
 if(url.pathname==='/healthz')return send(200,'ok','text/plain');
 if(url.pathname==='/trial/login'&&req.method==='POST'){
 if(origin&&req.headers.origin!==origin)return send(403,page('請從試玩首頁重新登入。'));
 if(!String(req.headers['content-type']).startsWith('application/x-www-form-urlencoded'))return send(415,page('請使用登入表單。'));
 const now=Date.now();for(const [key,v] of attempts)if(now-v.start>60000)attempts.delete(key);
 for(const [key,expires] of sessions)if(now>expires)sessions.delete(key);
 const ip=req.socket.remoteAddress;const a=attempts.get(ip)||{start:now,count:0};
 if(now-globalWindow>60000){globalWindow=now;globalCount=0;}
 if(a.count>=10||globalCount>=60)return send(429,page('嘗試次數較多，請一分鐘後再試。'));
 a.count++;attempts.set(ip,a);globalCount++;
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>1024)return send(413,page('輸入太長。'));}
 const candidate=new URLSearchParams(body).get('password')||'';
 if(!timingSafeEqual(scryptSync(candidate,salt,32),expected))return send(401,page('通關密碼不正確，請向邀請你的家長確認。'));
 if(sessions.size>=10000)return send(503,page('目前忙碌，請稍後再試。'));
 const token=randomBytes(32).toString('hex');sessions.set(token,now+7*86400000);
 res.setHeader('Set-Cookie',`holton_trial=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure?'; Secure':''}`);res.writeHead(303,{Location:'/'});return res.end();
 }
 const token=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('holton_trial='))?.slice(13);
 if(!token||!sessions.has(token)||sessions.get(token)<Date.now())return send(401,page());
 if(req.method!=='GET'&&req.method!=='HEAD')return send(405,'Method not allowed','text/plain');
 let name=decodeURIComponent(url.pathname);if(name.includes('\0')||name.split('/').some(p=>p.startsWith('.')))return send(404,'Not found','text/plain');
 let file=path.resolve(rootPath,'.'+name);if(!file.startsWith(rootPath+path.sep)&&file!==rootPath)return send(404,'Not found','text/plain');
 try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');file=await realpath(file);}catch{return send(404,'Not found','text/plain');}
 if(!file.startsWith(rootPath+path.sep))return send(404,'Not found','text/plain');
 const data=await readFile(file);
 const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':data.length,'Accept-Ranges':'bytes'};
 // Safari probes media with byte ranges before it starts playback. Authentication
 // above applies equally to full files and partial responses.
 const range=req.method==='GET'?req.headers.range:undefined;
 if(range&&/^bytes=/.test(range)){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  // Ignore unsupported/malformed ranges (including multipart), returning the file.
  if(match&&(match[1]||match[2])){
   const start=match[1]?Number(match[1]):Math.max(0,data.length-Number(match[2]));
   const end=match[1]?(match[2]?Math.min(Number(match[2]),data.length-1):data.length-1):data.length-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=data.length||start>end){
    res.writeHead(416,{'Content-Range':`bytes */${data.length}`,'Content-Length':0,'Accept-Ranges':'bytes'});return res.end();
   }
   res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${data.length}`});return res.end(data.subarray(start,end+1));
  }
 }
 res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);
 }catch{if(!res.headersSent)send(500,'暫時無法開啟，請稍後再試。','text/plain');else res.end();}
 });server.requestTimeout=10000;server.headersTimeout=10000;return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 // Only hosting's protected environment editor supplies this value. Never log it.
 if(!process.env.PUBLIC_ORIGIN||!/^https:\/\/[^/]+$/.test(process.env.PUBLIC_ORIGIN))throw Error('Configure PUBLIC_ORIGIN as the HTTPS site origin.');
 const server=createTrialServer({root:'dist',password:process.env.TRIAL_ACCESS_PASSWORD,origin:process.env.PUBLIC_ORIGIN,secure:true});
 server.listen(Number(process.env.PORT||3000),'0.0.0.0');
}
