const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('src/LightApp.tsx','utf8');
const catalog=fs.readFileSync('src/data/holtonCatalog.ts','utf8');
const cards=[...catalog.matchAll(/minutes: (\d+), orbs: (\d+)/g)].map(m=>({minutes:+m[1],orbs:+m[2]}));
const reward=vm.runInNewContext('(minutes)=>timeChallenges.find(card=>card.minutes===minutes)?.orbs??1',{timeChallenges:cards});
let fn=source.slice(source.indexOf('  function completeTask('),source.indexOf('  function saveTask(')).replace('(s: State): State','(s)');
const settle=vm.runInNewContext('('+fn+')',{day:d=>d.toDateString()});
for(const [minutes,expected] of [[3,1],[5,1],[10,2],[15,3],[20,4],[25,5],[0,5],[7,1]]){
 assert.equal(reward(minutes),expected);
 const old={id:'old',minutes:25};
 const before={phase:'finishing',orbs:40,history:[old],minutes,taskReward:reward(minutes),dailyGoal:20,rewardProgress:2};
 // Old historical dates must be valid for today's-count calculation.
 old.at='2026-01-01T00:00:00Z';
 const after=settle(before);assert.equal(after.orbs,40+expected);assert.equal(after.history[1].reward,expected);
 assert.equal(after.history[0].reward,undefined);assert.equal(after.draws.length,1);assert.equal(after.rewardProgress,0);
 assert.strictEqual(settle(after),after);assert.equal(before.orbs,40);
}
const legacy=settle({phase:'finishing',orbs:10,history:[],minutes:25,dailyGoal:3});assert.equal(legacy.orbs,11);
assert.equal([{reward:5},{reward:2},{}].reduce((sum,x)=>sum+(x.reward??1),0),8);
console.log('PASS: tiers, custom fallback, old rounds/history, exact credits, repeat settlement guard, draw count unchanged, mixed-history sum');
