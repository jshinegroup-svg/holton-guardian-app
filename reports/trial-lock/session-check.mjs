import {createTrialServer} from '../../server/trial-server.mjs';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const password=randomBytes(24).toString('hex'),origin='https://trial.example';
let now=Date.now();let server,base;
async function start(p=password){server=createTrialServer({root:'dist',password:p,origin,clock:()=>now});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
async function close(){await new Promise(r=>server.close(r));}
await start();
try{
 const r=await fetch(base+'/trial/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password}),redirect:'manual'});
 assert.equal(r.status,303);const header=r.headers.get('set-cookie'),cookie=header.split(';')[0];
 for(const flag of ['HttpOnly','Secure','SameSite=Lax','Max-Age=604800','Path=/'])assert(header.includes(flag));
 const access=async(c=cookie,p='/')=>(await fetch(base+p,{headers:{cookie:c}})).status;
 assert.equal(await access(),200);
 await close();await start();assert.equal(await access(),200,'survives fresh server instance');
 assert.equal(await access(cookie,'/music/meditation.mp3'),200);
 const token=cookie.slice('holton_trial='.length),parts=token.split('.');
 for(const bad of ['a'.repeat(64),token+'x',token.slice(0,-1)+(token.endsWith('a')?'b':'a'),`v1.${Number(parts[1])+86400000}.${parts[2]}.${parts[3]}`])assert.equal(await access('holton_trial='+bad),401);
 now+=7*86400000-1;assert.equal(await access(),200);now++;assert.equal(await access(),401,'expires at seven days');now-=7*86400000;
 await close();await start(randomBytes(24).toString('hex'));assert.equal(await access(),401,'password change revokes old cookie');
 console.log('PASS restart persistence, seven-day expiry boundary, tamper rejection, password-change revocation, secure Lax cookie and protected music');
}finally{await close();}
