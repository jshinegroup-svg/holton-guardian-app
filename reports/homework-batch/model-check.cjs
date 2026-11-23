const ts=require('typescript'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const result={};cache.set(file,result);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:result,require:name=>load(path.resolve(path.dirname(file),name)+'.ts'),Date,Math,Set,JSON,crypto:require('node:crypto')});return result;}
const {confirmHomeworkTasks}=load('src/homework/model.ts'),{playAccount,playBalance}=load('src/lib/homePlay.ts');
const now=new Date(2026,10,23,12),date='2026-11-23';
const tasks=[{id:'a',title:'math',detail:'1',reported:true},{id:'b',title:'read',detail:'2',reported:true},{id:'c',title:'write',detail:'3'}];
const state={version:1,phase:'ready',orbs:8,history:[],rewardProgress:0,homework:{days:{[date]:{tasks}}}};
const original=JSON.stringify(state);const next=confirmHomeworkTasks(state,date,tasks.slice(0,2),now);
assert.equal(next.rewardProgress,2);assert.equal(playBalance(playAccount(next,+now)),240000);assert.equal(JSON.stringify(state),original);
assert.equal(confirmHomeworkTasks(next,date,tasks.slice(0,2),now),next);
const last=confirmHomeworkTasks(next,date,[tasks[2]],now);assert.equal(last.rewardProgress,0);assert.equal(last.draws.length,1);assert.equal(last.orbs,8);assert.equal(playBalance(playAccount(last,+now)),900000);
for(const invalid of [[],[tasks[0],tasks[0]],[{...tasks[0],detail:'changed'}],[{...tasks[0],id:'gone'}]])assert.equal(confirmHomeworkTasks(state,date,invalid,now),state);
for(const modified of [{...state,homework:{...state.homework,timer:{}}},{...state,homework:{days:{[date]:{tasks,claimedAt:'done'}}}},{...state,homework:{days:{[date]:{tasks:[{...tasks[0],waived:true},tasks[1],tasks[2]]}}}}])assert.equal(confirmHomeworkTasks(modified,date,tasks,now),modified);
assert.equal(confirmHomeworkTasks(state,date,tasks,new Date(2026,10,22)),state);
console.log('PASS atomic batch, snapshot rejection, duplicate/waived/claimed/future/timer guards, draws and 2-minute/+10/15-minute play rules');
