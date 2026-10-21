import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex');
const s=createTrialServer({root:'dist',password,secure:false,origin:'https://trial.example'});await new Promise(r=>s.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${s.address().port}`;
try{
 assert.equal((await fetch(base)).headers.get('referrer-policy'),'same-origin');
 for(const origin of ['null','https://other.example'])assert.equal((await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:origin},body:'password='})).status,403);

 for(const p of ['/','/index.html','/assets/example.png','/server/trial-server.mjs'])assert.equal((await fetch(base+p)).status,401);
 const login=await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://trial.example'},body:new URLSearchParams({password}),redirect:'manual'});assert.equal(login.status,303);const cookie=login.headers.get('set-cookie');assert(cookie.includes('HttpOnly'));assert(cookie.includes('SameSite=Strict'));
 assert.equal((await fetch(base+'/',{headers:{cookie}})).status,200);
 const media='/music/meditation.mp3';
 assert.equal((await fetch(base+media,{headers:{Range:'bytes=0-1'}})).status,401);
 const full=await fetch(base+media,{headers:{cookie}});const bytes=new Uint8Array(await full.arrayBuffer());
 assert.equal(full.status,200);assert.equal(full.headers.get('content-type'),'audio/mpeg');assert(bytes.length>1000);
 for(const [range,start,end] of [['bytes=0-1',0,1],['bytes=100-',100,bytes.length-1],['bytes=-64',bytes.length-64,bytes.length-1],['bytes=0-999999999',0,bytes.length-1]]){
  const r=await fetch(base+media,{headers:{cookie,Range:range}});assert.equal(r.status,206);
  assert.equal(r.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes.slice(start,end+1));
 }
 for(const range of [`bytes=${bytes.length}-`,'bytes=100-20','bytes=-0']){
  const r=await fetch(base+media,{headers:{cookie,Range:range}});assert.equal(r.status,416);assert.equal(r.headers.get('content-range'),`bytes */${bytes.length}`);
 }
 const head=await fetch(base+media,{method:'HEAD',headers:{cookie,Range:'bytes=0-1'}});assert.equal(head.status,200);assert.equal(head.headers.get('accept-ranges'),'bytes');assert.equal((await head.arrayBuffer()).byteLength,0);
 console.log('PASS: protected MP3, Safari two-byte probe, open/suffix/clamped ranges, 416 and HEAD');
 assert.equal((await fetch(base+'/.git/config',{headers:{cookie}})).status,404);
 assert.equal((await fetch(base+'/server/trial-server.mjs',{headers:{cookie}})).status,404);
 for(let i=0;i<9;i++)assert.equal((await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://trial.example'},body:'password=wrong'})).status,401);
 assert.equal((await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://trial.example'},body:'password=wrong'})).status,429);
 console.log('PASS: unauthenticated assets denied; login cookie; authenticated index; hidden/source files denied; throttling');
}finally{await new Promise(r=>s.close(r));}
