const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(path){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date});return exports;}
const {photoDate}=load('src/homework/photoDate.ts');
for(const [input,reference,want] of [['11月16日','2026-11-15','2026-11-16'],['11/15','2026-11-15','2026-11-15'],['10月16日','2026-11-15','2026-10-16'],['12月1日','2026-11-30','2026-12-01'],['1月1日','2026-12-31','2027-01-01'],['12月31日','2027-01-01','2026-12-31'],['2024年2月29日','2026-11-15','2024-02-29'],['１１月１６日（星期一）','2026-11-15','2026-11-16']])assert.equal(photoDate(input,reference)?.date,want);
for(const text of ['','今天','11月16或17日','11月31日','2026-02-29','11月16日（不確定）'])assert.equal(photoDate(text,'2026-11-15'),null);
assert.equal(photoDate('11/16','2026-11-15').inferredYear,true);
assert.equal(photoDate('2026-11-16','2026-11-15').inferredYear,false);
const {historyGroups}=load('src/homework/history.ts');
const complete={tasks:[{id:'a',title:'test',detail:'',confirmed:true}],claimedAt:'done'},pending={tasks:[{id:'a',title:'test',detail:'',reported:true}]};
const days={'2026-11-09':complete,'2026-11-08':pending,'2026-11-07':{tasks:complete.tasks},'2026-11-10':complete,'2026-11-15':pending,'2026-11-16':pending,'2026-11-18':pending};const before=JSON.stringify(days);const groups=historyGroups(days,'2026-11-15');
assert.equal(groups.start,'2026-11-10');assert.equal(groups.end,'2026-11-16');
assert.equal(groups.recent.map(([k])=>k).join(','),'2026-11-16,2026-11-15,2026-11-10');assert.equal(groups.unfinished.map(([k])=>k).join(','),'2026-11-08,2026-11-07');assert.equal(groups.future[0][0],'2026-11-18');assert.equal(JSON.stringify(days),before);
assert.equal(historyGroups({},'2027-01-01').start,'2026-12-27');
console.log('PASS literal photo dates, ambiguity, leap dates, year boundary suggestions, seven-day window, pending/unclaimed/future preservation; no mutation');
