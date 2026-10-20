const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('src/RewardShop.tsx','utf8').split('export default function')[0].replace(/^import .*$/mg,'').replace(/^const wishArt:.*$/mg,'');
const ctx={exports:{},require:()=>0};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,ctx);
const {catalog,starterWishes}=ctx.exports;
const old=[{id:'wish-0',name:'保留名稱',cost:17,enabled:false},{id:'wish-1',name:'尚未定價',cost:0,enabled:false},{id:'custom-1',name:'還沒約定',cost:0,enabled:false,custom:true,style:'scroll'}];
const snapshot=JSON.stringify(old),next=catalog(old);
assert.equal(JSON.stringify(old),snapshot);assert.equal(next[0].cost,17);assert.equal(next[0].name,'保留名稱');assert.equal(next[0].enabled,false);assert.equal(next[1].cost,20);assert.equal(next[1].enabled,false);assert.equal(next[2].cost,0);assert.equal(next[2].enabled,false);assert.equal(JSON.stringify(catalog(next)),JSON.stringify(next));
const fresh=starterWishes();assert.equal(fresh.length,10);assert(fresh.every(w=>w.enabled&&w.cost>0));fresh[0].cost=1;assert.equal(starterWishes()[0].cost,100);
console.log('PASS existing positive prices/names/closed flags preserved; zero original prices filled; custom zero stays closed; catalog idempotent; starter defaults independent.');
