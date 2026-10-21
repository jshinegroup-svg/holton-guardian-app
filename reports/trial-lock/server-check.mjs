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
 assert.equal((await fetch(base+'/.git/config',{headers:{cookie}})).status,404);
 assert.equal((await fetch(base+'/server/trial-server.mjs',{headers:{cookie}})).status,404);
 for(let i=0;i<9;i++)assert.equal((await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://trial.example'},body:'password=wrong'})).status,401);
 assert.equal((await fetch(base+'/trial/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':'https://trial.example'},body:'password=wrong'})).status,429);
 console.log('PASS: unauthenticated assets denied; login cookie; authenticated index; hidden/source files denied; throttling');
}finally{await new Promise(r=>s.close(r));}
