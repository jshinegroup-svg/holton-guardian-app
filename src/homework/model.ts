import {addDrawCredit} from '../lib/drawProgress';
import type {LightState} from '../LightApp';
import {advanceJourney,migrateJourneys} from '../lib/journeys';
export type HomeworkTask={id:string;title:string;detail:string;reported?:boolean;confirmed?:boolean;waived?:boolean;drawCounted?:boolean};
export type HomeworkDay={tasks:HomeworkTask[];claimedAt?:string};
export type Homework={enabled?:boolean;drawReceipts?:string[];days:Record<string,HomeworkDay>;timer?:{date:string;task:string;mode:'focus'|'rest';deadline:number|null;remaining:number;focusSeconds?:number;helpOpen?:boolean;helpCard?:string;helpDeadline?:number;usedHelp?:string[]}};
export const homework=(s:LightState):Homework=>s.homework??{days:{}};
export const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const allConfirmed=(d?:HomeworkDay)=>!!d?.tasks.length&&d.tasks.every(t=>t.confirmed)&&!d.claimedAt;
export function claimHomework(s:LightState,date:string,now=new Date()):LightState{
 const h=homework(s),d=h.days[date];
 if(!allConfirmed(d)||date>dateKey(now)||!['ready','done'].includes(s.phase))return s;
 const id=`homework:${date}`,at=now.toISOString(),world=s.activeWorld??'forest';
 // Claim marker, wallet, history and journey commit as a single revisioned child save.
 return {...s,orbs:s.orbs+10,homework:{...h,timer:undefined,days:{...h.days,[date]:{...d,claimedAt:at}}},journeys:advanceJourney(migrateJourneys(s).journeys,world,id),history:[{id,title:`功課冒險 ${date}`,at,minutes:0,reward:10,world,outcome:'completed',finishId:id},...s.history]};
}
export function updateDay(s:LightState,date:string,fn:(d:HomeworkDay)=>HomeworkDay):LightState{
 const h=homework(s),d=h.days[date]??{tasks:[]};if(d.claimedAt)return s;
 return {...s,homework:{...h,days:{...h.days,[date]:fn(d)}}};
}

// Edits retain task identity/status. Moving is atomic and never overwrites a day.
export function editSavedHomework(s:LightState,from:string,to:string,expected:HomeworkDay,edits:{id:string;title:string;detail:string}[]):LightState{
 const h=homework(s),day=h.days[from];
 const validDate=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 if(!day||h.timer||!validDate(to)||JSON.stringify(day)!==JSON.stringify(expected))return s;
 if(edits.length!==day.tasks.length||new Set(edits.map(t=>t.id)).size!==edits.length||edits.some(t=>!day.tasks.some(x=>x.id===t.id)||!t.title.trim()||t.title.trim().length>80||t.detail.length>1000))return s;
 if(from!==to&&(day.claimedAt||h.days[to]?.tasks.length||h.days[to]?.claimedAt||s.history.some(e=>e.finishId===`homework:${from}`||e.finishId===`homework:${to}`)))return s;
 const updated={...day,tasks:day.tasks.map(t=>{const e=edits.find(e=>e.id===t.id)!;return {...t,title:e.title.trim(),detail:e.detail.trim()}})};
 const days={...h.days};delete days[from];days[to]=updated;
 return {...s,homework:{...h,days}};
}

// Existing confirmed tasks are historical: never backfill rewards on upgrade.
export function confirmHomeworkTask(s:LightState,date:string,id:string,now=new Date()):LightState {
 const h=homework(s),d=h.days[date],t=d?.tasks.find(t=>t.id===id);
 if(!t||t.confirmed||t.waived||d.claimedAt||date>dateKey(now))return s;
 const receipt=JSON.stringify([date,id]);
 const receipts=new Set(h.drawReceipts??[]);
 for(const [key,day] of Object.entries(h.days))for(const task of day.tasks)
  if(task.confirmed||task.drawCounted)receipts.add(JSON.stringify([key,task.id]));
 const eligible=!t.drawCounted&&!receipts.has(receipt);
 receipts.add(receipt);
 const next={...s,homework:{...h,drawReceipts:[...receipts],days:{...h.days,[date]:{...d,tasks:d.tasks.map(task=>task.id===id?{...task,confirmed:true,drawCounted:true}:task)}}}};
 return eligible?addDrawCredit(next,`homework:${receipt}`):next;
}

// Validate the exact reviewed snapshot before applying the whole batch in one save.
export function confirmHomeworkTasks(s:LightState,date:string,expected:HomeworkTask[],now=new Date()):LightState {
 const h=homework(s),day=h.days[date];
 if(!expected.length||new Set(expected.map(t=>t.id)).size!==expected.length||h.timer||!day||day.claimedAt||date>dateKey(now))return s;
 if(expected.some(t=>{const current=day.tasks.find(x=>x.id===t.id);return !current||current.confirmed||current.waived||JSON.stringify(current)!==JSON.stringify(t)}))return s;
 return expected.reduce((next,t)=>confirmHomeworkTask(next,date,t.id,now),s);
}
