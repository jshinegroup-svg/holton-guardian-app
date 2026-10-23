const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
function load(p){const m={exports:{}};new Function('exports','require','module',ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText )(m.exports,id=>id.startsWith('.')?load(require('path').resolve(require('path').dirname(p),id+'.ts')):require(id),m);return m.exports;}
const f=load('src/lib/focusSession.ts'),b=load('src/lib/familyBackup.ts');
const now=1800000000000;
for(const min of [0,5,10,15,20,30,40,60]){
 const limit=min===0?60000:min*30000;
 const s={phase:'active',minutes:min,help:false,deadline:min?now+min*60000:null,remaining:min*60,focusElapsedMs:0,focusStartedAt:now};
 assert.equal(f.canFinishFocus(s,now+limit-1),false);assert.equal(f.canFinishFocus(s,now+limit),true);
 const paused={...f.pauseFocus(s,now+10000),help:true};assert.equal(f.elapsedFocusMs(paused,now+900000),10000);assert.equal(f.canFinishFocus(paused,now+900000),false);
 const resumed={...paused,help:false,focusStartedAt:now+900000};assert.equal(f.elapsedFocusMs(resumed,now+910000),20000);
 assert.equal(f.elapsedFocusMs(s,now-10000),0);
}
assert.equal(f.migrateFocus({phase:'active',minutes:15,deadline:now+440000,remaining:900},now).focusElapsedMs,460000);
assert.equal(f.migrateFocus({phase:'active',minutes:0,deadline:null,remaining:0},now).focusElapsedMs,0);
const done={version:1,title:'國語作業',minutes:15,orbs:1,phase:'done',remaining:450,history:[],guardian:{},focusElapsedMs:450000,focusStartedAt:null};assert.deepEqual(b.parseBackup(b.createBackup(done)).state,done);
assert.throws(()=>b.createBackup({...done,focusElapsedMs:-1}));
console.log('PASS timed and untimed exact threshold; pause/resume; negative clock delta; timed/untimed legacy migration; backup roundtrip and invalid field rejection');

for(const minutes of [0,5]){
 const s={phase:'active',minutes,deadline:null,remaining:0,focusElapsedMs:minutes?300000:600000,focusStartedAt:now,help:false,supportUsed:['rest'],orbs:10,taskReward:1};
 const x=f.extendFocus(s,now);assert.equal(x.deadline,now+120000);assert.equal(x.focusTargetMs,s.focusElapsedMs+120000);assert.equal(x.remaining,120);assert.equal(x.minutes,minutes);assert.deepEqual(x.supportUsed,['rest']);assert.equal(x.orbs,10);assert.equal(x.taskReward,1);
 assert.deepEqual(f.extendFocus(x,now+1000),x);
 const paused={...f.pauseFocus(x,now+30000),help:true};assert.equal(f.focusTargetMs(paused)-f.elapsedFocusMs(paused,now+900000),90000);
 const resumed={...paused,help:false,focusStartedAt:now+900000};assert.equal(f.focusTargetMs(resumed)-f.elapsedFocusMs(resumed,now+930000),60000);
 const again=f.extendFocus(x,now+120000);assert.equal(again.focusTargetMs,x.focusTargetMs+120000);
 assert.equal(again.orbs,10);
}
console.log('PASS 2-minute extension timed/untimed, repeat guards, help pause/resume, original rewards');
