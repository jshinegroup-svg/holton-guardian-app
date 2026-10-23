const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),path=require('path');
function load(p){const m={exports:{}};new Function('exports','require','module',ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports,id=>id.startsWith('.')?load(path.resolve(path.dirname(p),id+'.ts')):require(id),m);return m.exports;}
const t=load('src/lib/taskTime.ts'),b=load('src/lib/familyBackup.ts');
for(let n=1;n<=60;n++){assert.equal(t.parseCustomMinutes(String(n)),n);assert.equal(t.rewardForMinutes(n),n<10?1:n<15?2:n<20?3:n<25?4:5);}
assert.equal(t.rewardForMinutes(0),5);
for(const s of ['', ' ', '0','61','-1','2.5','1e1','0x10','abc'])assert.equal(t.parseCustomMinutes(s),null);
const state={version:1,title:'test',minutes:16,lastCustomMinutes:16,cardId:'custom-time',orbs:10,phase:'ready',remaining:960,history:[],guardian:{}};
assert.deepEqual(b.parseBackup(b.createBackup(state)).state,state);
assert.throws(()=>b.createBackup({...state,lastCustomMinutes:0}));
console.log('PASS all60 minute rewards,untimed5,invalid input,custom backup roundtrip');
