const fs=require('fs'),ts=require('typescript'),vm=require('vm'),a=require('assert/strict');
function read(file,require=()=>({})){const ctx={exports:{},require};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,ctx);return ctx.exports;}
const j=read('src/lib/journeys.ts'),v=read('src/JourneyStageScene.tsx',id=>id==='./lib/journeys'?j:{});
for(let n=0;n<=15;n++){const stage=v.journeyStage(n);a.equal(stage.chapter,Math.min(2,Math.floor(Math.max(0,n-1)/5)));a.equal(stage.step,n-stage.chapter*5);a(stage.step>=0&&stage.step<=5);}
for(const w of j.worldIds){const initial={version:2,counts:{forest:15,sky:15,cosmos:15,[w]:0},legacyCredit:0};let progress=initial;
 for(let n=1;n<=15;n++){const id=`${w}-${n}`,next=j.advanceJourney(progress,w,id);a.equal(next.counts[w],n);a.equal(next.event.step,n);a.equal(j.advanceJourney(next,w,id),next);progress=next;}
 a.equal(j.advanceJourney(progress,w,'extra').counts[w],15);
}
const legacy=j.migrateJourneys({history:[],journeys:{version:1,counts:{sky:7,forest:0,cosmos:0},legacyCredit:0}});a.equal(legacy.journeys.counts.sky,7);a(j.unlocked(legacy.journeys,'sky'));
console.log('PASS 0..15 frame mapping, all three worlds progress/idempotence/cap, legacy world access');
