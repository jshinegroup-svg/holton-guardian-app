const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function load(file){const ctx={exports:{},AbortController,setTimeout,clearTimeout};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);return ctx.exports;}
const {selectHelpCard,migrateHelpSession}=load('src/lib/helpSession.ts');const {cloudRequest,syncErrorMessage}=load('src/family/cloudRequest.ts');
test('all four cards consume once; exact durations and early exit do not restore a use',()=>{
 let state={phase:'active',help:true,supportUsed:[]};for(const [id,ms] of [['rest',120000],['pause',60000],['energy',60000],['breathe',60000]]){const used=selectHelpCard(state,id,1000);assert.equal(used.breakDeadline,1000+ms);assert.equal(selectHelpCard(used,id,2000),used);state={...used,supportCardId:undefined,breakDeadline:null};assert.equal(selectHelpCard(state,id,3000),state);}assert.equal(state.supportUsed.length,4);assert.equal(selectHelpCard({...state,supportUsed:[]},'rest',4000).breakDeadline,124000);
});
test('old active help migration starts one minute once, preserves expired deadlines and consumed cards',()=>{
 const old={phase:'active',help:true,supportCardId:'energy',supportUsed:[]};const next=migrateHelpSession(old,1000);assert.equal(next.breakDeadline,61000);assert.equal(migrateHelpSession(next,999999),next);assert(next.supportUsed.includes('energy'));
});
test('hung request releases after timeout and aborts, late response cannot become success',async()=>{let signal;let finish;const pending=cloudRequest(s=>{signal=s;return new Promise(r=>finish=r);},15);await assert.rejects(pending,/cloud_timeout/);assert.equal(signal.aborted,true);finish({revision:1});assert.equal(await cloudRequest(async()=>42,100),42);});
test('conflicts are distinguished, never suggested as permission to overwrite',()=>{assert.match(syncErrorMessage({message:'revision_conflict'}),/避免覆蓋/);assert.match(syncErrorMessage(Error('cloud_timeout')),/重試同步/);});
