import type {LightState} from '../LightApp';
import {advanceJourney,migrateJourneys} from '../lib/journeys';
export type HomeworkTask={id:string;title:string;detail:string;reported?:boolean;confirmed?:boolean;waived?:boolean};
export type HomeworkDay={tasks:HomeworkTask[];claimedAt?:string};
export type Homework={enabled?:boolean;days:Record<string,HomeworkDay>;timer?:{date:string;task:string;mode:'focus'|'rest';deadline:number|null;remaining:number}};
export const homework=(s:LightState):Homework=>s.homework??{days:{}};
export const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const allConfirmed=(d?:HomeworkDay)=>!!d?.tasks.length&&d.tasks.every(t=>t.confirmed)&&!d.claimedAt;
export function claimHomework(s:LightState,date:string,now=new Date()):LightState{
 const h=homework(s),d=h.days[date];
 if(!h.enabled||!allConfirmed(d)||date>dateKey(now)||!['ready','done'].includes(s.phase))return s;
 const id=`homework:${date}`,at=now.toISOString(),world=s.activeWorld??'forest';
 // Claim marker, wallet, history and journey commit as a single revisioned child save.
 return {...s,orbs:s.orbs+10,homework:{...h,timer:undefined,days:{...h.days,[date]:{...d,claimedAt:at}}},journeys:advanceJourney(migrateJourneys(s).journeys,world,id),history:[{id,title:`功課冒險 ${date}`,at,minutes:0,reward:10,world,outcome:'completed',finishId:id},...s.history]};
}
export function updateDay(s:LightState,date:string,fn:(d:HomeworkDay)=>HomeworkDay):LightState{
 const h=homework(s),d=h.days[date]??{tasks:[]};if(d.claimedAt)return s;
 return {...s,homework:{...h,days:{...h.days,[date]:fn(d)}}};
}
