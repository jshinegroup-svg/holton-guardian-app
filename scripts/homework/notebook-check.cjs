const ts=require('typescript'),fs=require('fs'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {NotebookRepository}=require('../../src/homework/notebookRepository.ts');
const {notebookBlob}=require('../../src/homework/notebookCloud.ts');
const local=()=>{const m=new Map();return {getItem:async k=>m.get(k)??null,setItem:async(k,v)=>{m.set(k,v)}}};
(async()=>{
const m=new Map(),a=local(),b=local();let fail=false,race=false;
const cloud={read:async d=>{if(fail)throw Error('offline');return m.get(d)??null},write:async(d,v,replace)=>{if(fail)throw Error('offline');if(race){m.set(d,'other-device');race=false}if(replace||!m.has(d))m.set(d,v)}};
const first=new NotebookRepository(a,cloud),second=new NotebookRepository(b,cloud);
await first.write('2026-11-15','photo-A');assert.equal(await second.read('2026-11-15'),'photo-A');
await second.write('2026-11-15','photo-B');assert.equal(await first.read('2026-11-15'),'photo-B');assert.equal(await a.getItem('homework-photo:2026-11-15'),'photo-B');
await a.setItem('homework-photo:2026-11-14','legacy');assert.equal(await first.read('2026-11-14'),'legacy');assert.equal(await second.read('2026-11-14'),'legacy');
await a.setItem('homework-photo:2026-11-13','legacy-race');race=true;assert.equal(await first.read('2026-11-13'),'other-device');assert.equal(await a.getItem('homework-photo:2026-11-13'),'other-device');
fail=true;await first.write('2026-11-12','offline-photo');assert.equal(await a.getItem('homework-photo:2026-11-12'),'offline-photo');assert.equal(await first.read('2026-11-12'),'offline-photo');fail=false;await first.flush();assert.equal(await first.read('2026-11-12'),'offline-photo');
const full=new NotebookRepository({getItem:async()=>null,setItem:async()=>{throw Error('quota')}},cloud);await assert.rejects(()=>full.write('2026-11-11','quota-photo'),/quota/);assert.equal(await second.read('2026-11-11'),null);
assert.equal(await second.read('2026-11-10'),null);
assert.equal(notebookBlob('data:application/pdf;base64,JVBERi0=').type,'application/pdf');assert.throws(()=>notebookBlob('data:image/svg+xml;base64,PHN2Zz4='));assert.throws(()=>notebookBlob('https://example.invalid/image'));
console.log('PASS: two devices, legacy migration, race-safe insert, offline fallback retention/retry, quota failure surfaced, PDF and MIME restriction');
})().catch(e=>{console.error(e);process.exit(1)});
