const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('assert/strict');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/journeys.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);const {migrateJourneys,advanceJourney,unlocked,enterWorld}=ctx.exports;
const old={history:Array.from({length:21},(_,i)=>({id:String(i),at:'2026-10-18T08:00:00Z'})),phase:'ready',orbs:41,collection:[{id:'keep'}]};
const migrated=migrateJourneys(old);assert.equal(migrated.journeys.counts.sky,15);assert.equal(migrated.journeys.counts.forest,0);assert.equal(migrated.history,old.history);assert.equal(migrated.collection,old.collection);assert.equal(migrated.orbs,41);assert.equal(migrateJourneys(migrated).journeys.counts.sky,15);
const unique=migrateJourneys({...old,history:[old.history[0],old.history[0],{id:'x',at:'invalid'}]});assert.equal(unique.journeys.counts.sky,1);
let j=migrateJourneys({history:[]}).journeys;
assert(!unlocked(j,'forest'));assert(!unlocked(j,'cosmos'));
assert.equal(advanceJourney(j,'forest','x'),j);
for(const w of ['sky','forest','cosmos']){
 for(let n=1;n<=15;n++){const id=w+n;const prev=j;j=advanceJourney(j,w,id);assert.equal(j.counts[w],n);assert.equal(prev.counts[w],n-1);assert.equal(j.event.step,n);assert.equal(advanceJourney(j,w,id),j);if(w==='sky')assert.equal(unlocked(j,'forest'),n===15);if(w==='forest')assert.equal(unlocked(j,'cosmos'),n===15);}
 const capped=advanceJourney(j,w,w+'16');assert.equal(capped.counts[w],15);assert.equal(capped.event,undefined);
}
const active={...migrated,phase:'active'};assert.equal(enterWorld(active,'forest'),active);assert.equal(enterWorld({...migrated,phase:'done'},'forest').phase,'ready');
const locked={...unique};assert.equal(enterWorld(locked,'forest'),locked);
console.log('PASS legacy unique migration and no carryover, 45 steps, boundary unlocks, per-world counts, duplicate id, completion cap, active lock, shared wallet preserved');
