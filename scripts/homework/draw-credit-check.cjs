const ts=require('typescript'),fs=require('fs'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {confirmHomeworkTask,claimHomework,editSavedHomework}=require('../../src/homework/model.ts');
const {addDrawCredit}=require('../../src/lib/drawProgress.ts');
const now=new Date('2026-11-18T12:00:00+08:00'),date='2026-11-18';
const base=()=>({version:1,orbs:25,phase:'ready',history:[],guardian:{},rewardProgress:0,draws:[],dailyGoal:1,activeWorld:'forest',journeys:{version:2,counts:{forest:3,sky:0,cosmos:0},legacyCredit:0},homework:{days:{[date]:{tasks:Array.from({length:5},(_,i)=>({id:String(i),title:'Task '+i,detail:''}))}}}});
let s=base();for(let i=0;i<5;i++){s=confirmHomeworkTask(s,date,String(i),now);assert.equal(s.draws.length,Math.floor((i+1)/3));assert.equal(s.rewardProgress,(i+1)%3);assert.equal(confirmHomeworkTask(s,date,String(i),now),s)}
assert.equal(s.orbs,25);assert.equal(s.history.length,0);assert.equal(s.journeys.counts.forest,3);
s=claimHomework(s,date,now);assert.equal(s.orbs,35);assert.equal(s.journeys.counts.forest,4);assert.equal(s.rewardProgress,2);assert.equal(s.draws.length,1);assert.equal(claimHomework(s,date,now),s);
s=addDrawCredit(s,'normal-next-day');assert.equal(s.rewardProgress,0);assert.equal(s.draws.length,2);
let old=base();old.rewardProgress=2;old.draws=[{id:'existing'}];old.homework.days[date].tasks[0].confirmed=true;
assert.equal(confirmHomeworkTask(old,date,'0',now),old);old=confirmHomeworkTask(old,date,'1',now);assert.equal(old.draws.length,2);
old.homework.days[date].tasks[0].confirmed=false;old=confirmHomeworkTask(old,date,'0',now);assert.equal(old.draws.length,2);assert.equal(old.rewardProgress,0);
let moved=base();moved=confirmHomeworkTask(moved,date,'0',now);const expected=moved.homework.days[date];moved=editSavedHomework(moved,date,'2026-11-17',expected,expected.tasks);moved.homework.days['2026-11-17'].tasks[0].confirmed=false;moved=confirmHomeworkTask(moved,'2026-11-17','0',now);assert.equal(moved.rewardProgress,1);
let reload=JSON.parse(JSON.stringify(moved));assert.equal(confirmHomeworkTask(reload,'2026-11-17','0',now),reload);
let future=base();assert.equal(confirmHomeworkTask(future,date,'0',new Date('2026-11-17T12:00:00+08:00')),future);
const light=fs.readFileSync('src/LightApp.tsx','utf8');const completion=light.slice(light.indexOf('function completeTask'),light.indexOf('const taskDue'));assert(completion.includes('addDrawCredit'));assert(!completion.includes('allDone'));assert(!completion.includes('dailyRewardDay'));
console.log('PASS draw credits: 5 tasks, 3-credit threshold, chest separation, mixed/next-day carry, legacy preservation, repeat/reload, moved identity and future guard');
