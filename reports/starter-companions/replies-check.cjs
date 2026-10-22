const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('assert/strict');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/companionReplies.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);
for(const id of ['pip','hop','bomo','tidefin','stoneback','emberwing','steel-eagle','bramblefang','guardian']){
 const all=['ready','focus','rest','done'].flatMap(m=>Array.from(ctx.exports.companionReplies(id,m)));
 assert.equal(all.length,12);assert.equal(new Set(all).size,12);assert.ok(all.every(s=>s.length<=13));
}
for(const id of ['tidefin','stoneback','emberwing','steel-eagle','bramblefang'])for(let stage=0;stage<4;stage++)assert.deepEqual(Array.from(ctx.exports.companionReplies(id+':'+stage,'rest')),Array.from(ctx.exports.companionReplies(id,'rest')));
assert.deepEqual(Array.from(ctx.exports.companionReplies('unknown','rest')),Array.from(ctx.exports.companionReplies('guardian','rest')));
const signatures=['tidefin','stoneback','emberwing','steel-eagle','bramblefang'].map(id=>JSON.stringify(ctx.exports.companionReplies(id,'ready')));assert.equal(new Set(signatures).size,5);
console.log('PASS 96 character replies plus12 fallback; 12 unique short lines per character,4 moods, all20 guardian stages route to species');

for(const id of ['pip','hop','bomo','tidefin','stoneback','emberwing','steel-eagle','bramblefang'])for(const mood of ['ready','focus','rest','done']){
 const originals=ctx.exports.companionReplies(id,mood);
 for(let t=0;t<6;t++){const text=ctx.exports.companionReply(id,mood,t,'Holton');if(t%2)assert.equal(text,originals[Math.floor(t/2)]);else assert(text.includes('Holton'));}
 assert.equal(ctx.exports.companionReply(id,mood,0,''),originals[0]);
}
assert.equal(ctx.exports.companionReply('pip','rest',0,'Holton'),'Holton，伸個懶腰，補充能量吧！');
console.log('PASS personalized four moods alternate with all original personality lines, empty name fallback');
