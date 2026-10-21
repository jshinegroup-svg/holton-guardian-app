const fs=require('fs'),ts=require('typescript'),vm=require('vm'),a=require('assert/strict');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/focusSession.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);const f=ctx.exports,t=1800000000000;
for(const minutes of [0,3,5,10,15,20,25,60]){
 const s={phase:'active',minutes,help:false,deadline:minutes?t+minutes*60000:null,remaining:minutes*60,focusElapsedMs:0,focusStartedAt:t};
 const limit=minutes?minutes*30000:600000;
 for(const allowEarlyFinish of [undefined,false,'true',1]){const off={...s,allowEarlyFinish};a.equal(f.canFinishFocus(off,t+limit-1),false);a.equal(f.canFinishFocus(off,t+limit),true);}
 const on={...s,allowEarlyFinish:true};a.equal(f.canFinishFocus(on,t),true);a.equal(f.canFinishFocus({...on,help:true},t),false);
 for(const phase of ['ready','preparing','finishing','done'])a.equal(f.canFinishFocus({...on,phase},t),false);
 const paused=f.pauseFocus(on,t+1500);a.equal(paused.focusElapsedMs,1500);a.equal(paused.focusStartedAt,null);a.equal(paused.deadline,on.deadline);
}
console.log('PASS exact old thresholds; strict true-only bypass; phase/help guards; pause/time unchanged');
