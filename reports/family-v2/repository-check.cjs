const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
function load(file){const ctx={exports:{},require:id=>load(path.resolve(path.dirname(file),id+'.ts'))};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);return ctx.exports;}
const {ProgressRepository}=load('src/family/progressRepository.ts');
const {childStorageKey,validateChildProfile}=load('src/family/types.ts');
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
 const s=setup();s.lose();await s.repo(a).save({orbs:10});
 const reloaded=s.repo(a);assert.equal((await reloaded.load()).pending,true);
 // The persisted operation is retried before a new reward is applied.
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
 assert.throws(()=>childStorageKey('../v1',a));assert.throws(()=>validateChildProfile(' ',6));assert.throws(()=>validateChildProfile('A',1.5));assert.equal(JSON.stringify(validateChildProfile(' A ',6)),JSON.stringify({nickname:'A',ageYears:6}));
});

test('same-browser second tab cannot adopt newer cache revision to overwrite stale state',async()=>{
 const s=setup(),one=s.repo(a),two=s.repo(a);await one.save({orbs:10});await two.load();
 await one.save({orbs:20});await assert.rejects(two.save({orbs:11}),/revision_conflict/);
 assert.equal(s.saves.get(a).state.orbs,20);
 await two.useCloud();assert.equal((await two.load()).state.orbs,20);
 const backups=[...s.storage].filter(([key])=>key.includes('::conflict-backup::'));
 assert.equal(backups.length,0); // Stale tab was rejected before staging a write.
 await two.save({orbs:21});assert.equal(s.saves.get(a).state.orbs,21);
});
test('conflict recovery does not mutate cloud, sibling, or pending operation when cloud load fails',async()=>{
 const s=setup();const repo=s.repo(a);await repo.save({orbs:10});await s.repo(b).save({orbs:30});
 s.saves.set(a,{familyId:family,childId:a,revision:2,state:{orbs:50}});
 await assert.rejects(repo.save({orbs:11}),/revision_conflict/);const before=JSON.stringify([...s.storage]);
 const original=s.cloud.load;s.cloud.load=async()=>{throw Error('offline');};
 await assert.rejects(repo.useCloud(),/offline/);assert.equal(JSON.stringify([...s.storage]),before);
 s.cloud.load=async()=>({familyId:b,childId:a,revision:2,state:{orbs:100}});
 await assert.rejects(repo.useCloud(),/save_owner_mismatch/);assert.equal(JSON.stringify([...s.storage]),before);
 s.cloud.load=original;const operations=s.operations.size;await repo.useCloud();
 assert.equal(s.operations.size,operations);assert.equal(s.saves.get(b).state.orbs,30);assert.equal((await repo.load()).state.orbs,50);
});

test('unchanged save does not create an outgoing operation or bump revision',async()=>{
 const s=setup(),r=s.repo(a);await r.save({orbs:10});const count=s.operations.size;
 await r.save({orbs:10});assert.equal(s.operations.size,count);assert.equal((await r.load()).pending,false);
});
test('revision-only difference rebases original queued IDs, lost ACK stays exactly once',async()=>{
 const s=setup(),r=s.repo(a);await r.save({orbs:10});
 s.saves.set(a,{familyId:family,childId:a,revision:3,state:{orbs:10}});
 s.lose();await r.save({orbs:20});assert.equal(s.saves.get(a).revision,4);
 assert.equal(await r.hasPending(),true);const id=JSON.parse(s.storage.get(childStorageKey(family,a))).pending.operationId;
 await s.repo(a).retry();assert.equal(s.operations.size,2);assert(s.operations.has(id));assert.equal(s.saves.get(a).state.orbs,20);
});
test('legacy identical queue auto-recovers with backup without cloud mutation',async()=>{
 const s=setup(),key=childStorageKey(family,a);const pending={operationId:'legacy',expectedRevision:1,state:{orbs:20},events:[]};
 s.storage.set(key,JSON.stringify({schema:2,revision:1,state:pending.state,pending,queue:[pending]}));
 s.saves.set(a,{familyId:family,childId:a,revision:3,state:{orbs:20}});
 const r=s.repo(a);await r.load();await r.retry();assert.equal(await r.hasPending(),false);assert.equal(s.operations.size,0);
 assert(s.storage.has(key+'::conflict-backup::legacy'));assert.equal(s.saves.get(a).revision,3);
});
test('proven no-op queue adopts newer cloud; unknown legacy differences never discarded',async()=>{
 const s=setup(),key=childStorageKey(family,a),p={operationId:'noop',expectedRevision:1,state:{orbs:10},baseState:{orbs:10},events:[]};
 s.storage.set(key,JSON.stringify({schema:2,revision:1,state:p.state,pending:p,queue:[p]}));s.saves.set(a,{familyId:family,childId:a,revision:2,state:{orbs:30}});
 const r=s.repo(a);await r.load();await r.retry();assert.equal((await r.localState()).orbs,30);assert.equal(s.operations.size,0);
 delete p.baseState;s.storage.set(key,JSON.stringify({schema:2,revision:1,state:p.state,pending:p,queue:[p]}));
 await assert.rejects(s.repo(a).retry(),/revision_conflict/);assert.equal(JSON.parse(s.storage.get(key)).state.orbs,10);
});
test('matching state with unacknowledged events still requires review',async()=>{
 const s=setup(),key=childStorageKey(family,a),p={operationId:'reward',expectedRevision:1,state:{orbs:20},events:[{kind:'task_completed',id:'event'}]};
 s.storage.set(key,JSON.stringify({schema:2,revision:1,state:p.state,pending:p,queue:[p]}));s.saves.set(a,{familyId:family,childId:a,revision:2,state:{orbs:20}});
 await assert.rejects(s.repo(a).retry(),/revision_conflict/);assert.equal(s.operations.size,0);assert.equal(JSON.parse(s.storage.get(key)).pending.operationId,'reward');
});
