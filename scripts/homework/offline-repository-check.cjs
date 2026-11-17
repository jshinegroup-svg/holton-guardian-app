const ts=require('typescript'),fs=require('fs'),assert=require('node:assert/strict');require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {ProgressRepository}=require('../../src/family/progressRepository.ts'),{NotebookRepository}=require('../../src/homework/notebookRepository.ts');
const family='11111111-1111-4111-8111-111111111111',child='22222222-2222-4222-8222-222222222222';
let online=true;Object.defineProperty(global,'navigator',{value:{get onLine(){return online}},configurable:true});
const data=new Map(),local={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>data.set(k,v)};let id=0,remote=null,lost=false;const ops=new Map();
const cloud={load:async()=>remote,save:async p=>{if(!online)throw Error('network');if(ops.has(p.operationId))return ops.get(p.operationId);assert.equal(p.expectedRevision,remote?.revision??0);const result={revision:p.expectedRevision+1,duplicate:false};remote={familyId:family,childId:child,state:p.state,revision:result.revision};ops.set(p.operationId,result);if(lost){lost=false;throw Error('Failed to fetch')}return result}};
const repo=()=>new ProgressRepository(family,child,local,cloud,()=>String(++id));
(async()=>{
 let r=repo();await r.load();await r.save({points:0,step:0});online=false;
 await r.save({points:0,step:1});await r.save({points:10,step:2});await r.save({points:10,step:3});assert.equal(remote.state.step,0);
 r=repo();assert.equal((await r.load()).state.step,3);assert(await r.hasPending());
 online=true;lost=true;await assert.rejects(()=>r.retry());assert.equal(remote.state.step,1);await r.retry();assert.deepEqual(remote.state,{points:10,step:3});assert.equal(ops.size,4);assert(!await r.hasPending());
 // A second tab may not silently overwrite state cached by the first tab.
 const tab=repo();await tab.load();await r.save({points:10,step:4});await assert.rejects(()=>tab.save({points:20,step:5}),/revision_conflict/);
 // A separate-device conflict preserves all local queued operations.
 online=false;await r.save({points:10,step:5});await r.save({points:10,step:6});online=true;
 const original=cloud.save;cloud.save=async()=>{throw Error('revision_conflict')};await assert.rejects(()=>r.retry(),/revision_conflict/);assert.equal((await r.load()).state.step,6);assert(await r.hasPending());cloud.save=original;
 // Quota failure must never return a successful save or mutate the server.
 const broken=new ProgressRepository(family,child,{...local,setItem:async()=>{throw Error('quota')}},cloud,()=>String(++id));await broken.load();await assert.rejects(()=>broken.save({points:100}),/quota/);assert.equal(remote.state.points,10);
 const photos=new Map();const n=new NotebookRepository(local,{read:async d=>photos.get(d)??null,write:async(d,v)=>photos.set(d,v)});
 photos.set('2026-11-17','original');assert.equal(await n.read('2026-11-17'),'original');online=false;await n.write('2026-11-17','new');assert.equal(await n.read('2026-11-17'),'new');online=true;await n.flush();assert.equal(photos.get('2026-11-17'),'new');
 online=false;await n.write('2026-11-17','local-change');photos.set('2026-11-17','other-device');online=true;await assert.rejects(()=>n.flush(),/revision_conflict/);assert.equal(photos.get('2026-11-17'),'other-device');assert.equal(await n.read('2026-11-17'),'local-change');
 console.log('PASS offline queue/reload/replay, lost ACK exactly once, cross-tab and remote conflicts, quota failure, cached photos and photo conflict preservation');
})().catch(e=>{console.error(e);process.exit(1)});
