const fs=require('fs'),ts=require('typescript'),vm=require('vm'),path=require('path'),a=require('assert/strict');
function load(file){const ctx={exports:{},require:id=>load(path.resolve(path.dirname(file),id+'.ts'))};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);return ctx.exports;}
const f=load('src/lib/guardianChallenge.ts'),b=load('src/lib/familyBackup.ts');
const thu=Date.parse('2026-10-22T12:00:00+08:00'),sat=Date.parse('2026-10-24T23:59:59+08:00'),sun=sat+1000,mon=Date.parse('2026-10-26T00:00:00+08:00');
const base={version:1,phase:'ready',title:'test',minutes:5,remaining:300,orbs:48,history:[],guardian:{},guardianCards:[]};const target={id:'wolf:0',beastId:'wolf',index:0,cost:10};
for(const guardianSundayOnly of [undefined,true,'false',0]){const s={...base,guardianSundayOnly};for(const t of [thu,sat,mon])a.equal(f.beginGuardianChallenge(s,target,'hero',t),s);a.equal(f.beginGuardianChallenge(s,target,'hero',sun).orbs,38);}
const s={...base,guardianSundayOnly:false};for(const t of [thu,sat,sun,mon])a.equal(f.beginGuardianChallenge(s,target,'hero',t).orbs,38);
for(const patch of [{phase:'active'},{orbs:9},{guardianCards:[{cardId:'wolf:0'}]}]){const v={...s,...patch};a.equal(f.beginGuardianChallenge(v,target,'hero',thu),v);}
a.equal(f.beginGuardianChallenge(s,{...target,id:'wolf:1',index:1},'hero',thu),s);
const started=f.beginGuardianChallenge(s,target,'hero',thu);a.equal(f.beginGuardianChallenge(started,target,'hero',thu),started);const won=f.winGuardianChallenge(started,started.guardianChallenge.id,thu);a.equal(won.orbs,38);a.equal(won.guardianCards.length,1);a.equal(f.winGuardianChallenge(won,started.guardianChallenge.id,thu),won);
for(const guardianSundayOnly of [true,false])a.equal(b.parseBackup(b.createBackup({...base,guardianSundayOnly})).state.guardianSundayOnly,guardianSundayOnly);
a.equal(b.parseBackup(b.createBackup(base)).state.guardianSundayOnly,undefined);a.throws(()=>b.createBackup({...base,guardianSundayOnly:'false'}));
console.log('PASS Taipei date boundaries; strict false-only override; balance/stage/phase guards; single debit/grant; old/new backups');
