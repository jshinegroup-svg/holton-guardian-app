const ts=require('typescript'),fs=require('fs'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {claimHomework,updateDay}=require('../../src/homework/model.ts');
const now=new Date('2026-11-12T12:00:00+08:00'),date='2026-11-12';
const s={version:1,orbs:25,phase:'ready',history:[],guardian:{},activeWorld:'forest',journeys:{version:2,counts:{forest:3,sky:0,cosmos:0},legacyCredit:0},homework:{enabled:true,days:{[date]:{tasks:[{id:'a',title:'Math',detail:'',confirmed:true}]}}}};
const next=claimHomework(s,date,now);assert.equal(next.orbs,35);assert.equal(next.journeys.counts.forest,4);assert.equal(next.history.length,1);assert.equal(s.orbs,25);assert.equal(claimHomework(next,date,now),next);
assert.equal(updateDay(next,date,d=>({...d,tasks:[]})),next);
for(const phase of ['active','preparing','finishing']){const b={...s,phase};assert.equal(claimHomework(b,date,now),b)}
for(const tasks of [[],[{id:'a',title:'Math',detail:'',reported:true}]]){const b={...s,homework:{enabled:true,days:{[date]:{tasks}}}};assert.equal(claimHomework(b,date,now),b)}
const future={...s,homework:{enabled:true,days:{'2026-11-13':s.homework.days[date]}}};assert.equal(claimHomework(future,'2026-11-13',now),future);
const off={...s,homework:{...s.homework,enabled:false}};assert.equal(claimHomework(off,date,now),off);
const copy=JSON.parse(JSON.stringify(next));assert.equal(claimHomework(copy,date,now),copy);
console.log('PASS: atomic reward + journey, replay/reload dedup, locked claimed day, empty/reported/future/active/disabled guards, original state preserved');
