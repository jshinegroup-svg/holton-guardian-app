const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ProgressRepository}=require('./build/progressRepository');
const {childStorageKey,validateChildProfile}=require('./build/types');
const family='11111111-1111-4111-8111-111111111111';
const a='22222222-2222-4222-8222-222222222222';
const b='33333333-3333-4333-8333-333333333333';
const setup=()=>{
 const storage=new Map();let id=0;const saves=new Map();const operations=new Map();let loseResponse=false;
 const local={getItem:async k=>storage.get(k)??null,setItem:async(k,v)=>storage.set(k,v)};
 const cloud={load:async k=>saves.get(k)??null,save:async p=>{
   if(operations.has(p.operationId))return {...operations.get(p.operationId),duplicate:true};
   const revision=saves.get(p.childId)?.revision??0;
   if(p.expectedRevision!==revision)throw Error('revision_conflict');
   const result={revision:revision+1,duplicate:false};
   saves.set(p.childId,{familyId:family,childId:p.childId,revision:result.revision,state:p.state});operations.set(p.operationId,result);
   if(loseResponse){loseResponse=false;throw Error('network_response_lost');}return result;
 }};
 return {storage,saves,operations,local,cloud,lose:()=>loseResponse=true,repo:(child)=>new ProgressRepository(family,child,local,cloud,()=>`op-${++id}`)};
};
test('child save never overwrites sibling or V1 storage',async()=>{
 const s=setup();s.storage.set('holton-guardian-app::light-v1','original');
 await s.repo(a).save({orbs:10});await s.repo(b).save({orbs:30});await s.repo(a).save({orbs:11});
 assert.equal(s.saves.get(b).state.orbs,30);assert.equal(s.storage.get('holton-guardian-app::light-v1'),'original');
});
test('lost response survives repository recreation; retry uses same operation',async()=>{
 const s=setup();s.lose();await assert.rejects(s.repo(a).save({orbs:10}),/network_response_lost/);
 const reloaded=s.repo(a);assert.equal((await reloaded.load()).pending,true);
 await assert.rejects(reloaded.save({orbs:20}),/pending_save_requires_retry/);
 await reloaded.retry();assert.equal(s.operations.size,1);assert.equal((await reloaded.load()).pending,false);assert.equal(s.saves.get(a).revision,1);
});
test('stale-device write conflicts without overwriting cloud or pending local save',async()=>{
 const s=setup();const repo=s.repo(a);await repo.save({orbs:10});
 s.saves.set(a,{familyId:family,childId:a,revision:2,state:{orbs:50}});
 await assert.rejects(repo.save({orbs:11}),/revision_conflict/);
 assert.equal(s.saves.get(a).state.orbs,50);assert.equal((await repo.load()).state.orbs,11);assert.equal((await repo.load()).pending,true);
});
test('unexpected family response is rejected before cache write',async()=>{
 const s=setup();s.saves.set(a,{familyId:b,childId:a,revision:1,state:{orbs:1}});
 await assert.rejects(s.repo(a).load(),/save_owner_mismatch/);assert.equal(s.storage.size,0);
});
test('invalid profile and unsafe namespaces rejected',()=>{
 assert.throws(()=>childStorageKey('../v1',a));assert.throws(()=>validateChildProfile(' ',6));assert.throws(()=>validateChildProfile('A',1.5));assert.deepEqual(validateChildProfile(' A ',6),{nickname:'A',ageYears:6});
});
