const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('assert/strict');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/companionReplies.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);
for(const id of ['pip','hop','bomo','guardian']){
 const all=['ready','focus','rest','done'].flatMap(m=>Array.from(ctx.exports.companionReplies(id,m)));
 assert.equal(all.length,12);assert.equal(new Set(all).size,12);assert.ok(all.every(s=>s.length<=13));
}
assert.deepEqual(Array.from(ctx.exports.companionReplies('tidefin:0','rest')),Array.from(ctx.exports.companionReplies('guardian','rest')));
console.log('PASS 48 short replies,12 per personality,4 contexts, no duplicates within personality, guardian fallback');
