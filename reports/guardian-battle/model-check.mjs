import assert from 'node:assert/strict';
import { beginGuardianChallenge as begin, winGuardianChallenge as win, dismissGuardianChallenge as close } from '../../src/lib/guardianChallenge.ts';
const sun=Date.parse('2026-10-25T12:00:00+08:00'), mon=Date.parse('2026-10-26T12:00:00+08:00');
const target={id:'tidefin:0',beastId:'tidefin',index:0,cost:10};
const original={orbs:50,phase:'ready',guardianCards:[],history:[{id:'preserved'}]};
const battle=begin(original,target,'super-hero',sun);
assert.equal(battle.orbs,40);assert.equal(battle.guardianCards.length,0);assert.equal(battle.guardianChallenge.heroCardId,'super-hero');
assert.equal(begin(battle,target,'mini-warrior',sun),battle);
assert.equal(close(battle,battle.guardianChallenge.id),battle);
const reloaded=JSON.parse(JSON.stringify(battle));const won=win(reloaded,reloaded.guardianChallenge.id,mon);
assert.equal(won.orbs,40);assert.equal(won.guardianCards.length,1);assert.equal(won.guardianCards[0].cost,10);assert.equal(won.guardianChallenge.status,'won');assert.deepEqual(won.history,original.history);
assert.equal(win(won,won.guardianChallenge.id,mon),won);assert.equal(win(battle,'stale-id',sun),battle);
const done=close(won,won.guardianChallenge.id);assert.equal(done.guardianChallenge,undefined);assert.equal(begin(done,target,'mini-warrior',sun),done);
assert.equal(begin(original,target,'super-hero',mon),original);
for(const phase of ['preparing','active','finishing']){const s={...original,phase};assert.equal(begin(s,target,'super-hero',sun),s)}
const poor={...original,orbs:9};assert.equal(begin(poor,target,'super-hero',sun),poor);
const mid={...target,id:'tidefin:1',index:1,cost:20};assert.equal(begin(original,mid,'super-hero',sun),original);assert.equal(begin(done,mid,'super-hero',sun).orbs,20);
console.log('PASS atomic start, no card before victory, idempotent debit/grant, reload across day, preview-independent pure state, ownership/prerequisite/balance/weekday/phase guards.');
