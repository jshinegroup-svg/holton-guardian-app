import fs from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import assert from 'node:assert/strict';
let handler;
const src=fs.readFileSync('supabase/functions/homework-recognize/index.ts','utf8').replace(/^import .*\n/,'');
vm.runInNewContext(stripTypeScriptTypes(src),{Set,Response,Request,JSON,Deno:{serve:f=>handler=f,env:{get:()=>''}},createClient:()=>({})});
for(const origin of ['https://holton-family-v2.vercel.app','https://holton-family-v2.onrender.com']){
 const pre=await handler(new Request('https://example.test',{method:'OPTIONS',headers:{Origin:origin}}));
 assert.equal(pre.status,200);assert.equal(pre.headers.get('access-control-allow-origin'),origin);assert.equal(pre.headers.get('vary'),'Origin');
 const post=await handler(new Request('https://example.test',{method:'POST',headers:{Origin:origin}}));
 assert.equal(post.status,401);assert.equal(post.headers.get('access-control-allow-origin'),origin);
}
for(const origin of ['https://evil.example','https://holton-family-v2.vercel.app.evil.example','null']){
 const res=await handler(new Request('https://example.test',{method:'OPTIONS',headers:{Origin:origin}}));
 assert.equal(res.status,403);assert.equal(res.headers.get('access-control-allow-origin'),null);
}
console.log('PASS: both origins preflight and auth errors; unknown origins rejected.');
