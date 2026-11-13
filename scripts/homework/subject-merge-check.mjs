import assert from 'node:assert/strict';
import {normalizeSubjectTasks} from '../../src/homework/subjects.ts';
const original=[
 {id:'words',title:'圈詞／全詞',detail:'第8課',confirmed:true},
 {id:'read',title:'讀課文',detail:'第8課3次',confirmed:true,reported:true},
 {id:'recite',title:'背課文',detail:'第9課',confirmed:false},
 {id:'poetry',title:'童詩A+10 x5次',detail:'',confirmed:true},
];
const snapshot=JSON.stringify(original),result=normalizeSubjectTasks(original);
assert.deepEqual(result.map(t=>t.title),['圈詞','讀／背課文','童詩']);
assert.equal(result[0].confirmed,true);
assert.equal(result[1].id,'read');assert.equal(result[1].confirmed,false);
assert.equal(result[1].detail,'第8課3次；第9課');
assert.equal(result[2].detail,'A+10 x5次');assert.equal(result[2].confirmed,true);
assert.equal(JSON.stringify(original),snapshot);
assert.deepEqual(normalizeSubjectTasks(result),result);
const duplicate=normalizeSubjectTasks([...original,{id:'poetry2',title:'童詩',detail:'第2段',confirmed:false}]);
assert.equal(duplicate.length,3);assert.equal(duplicate[2].confirmed,false);
assert.equal(duplicate[2].detail,'A+10 x5次；第2段');
assert.equal(normalizeSubjectTasks([{id:'x',title:'童詩創作',detail:''}])[0].title,'童詩創作');
console.log('PASS legacy merge, detail retention, conservative completion, idempotence, no mutation');
