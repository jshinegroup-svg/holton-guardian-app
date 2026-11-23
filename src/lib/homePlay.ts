import type {LightState} from '../LightApp';
import {dateKey} from '../homework/model';
export type HomePlay={day:string;receipts:string[];bonus:boolean;usedMs:number;gate:number;session?:{remainingMs:number;deadline:number|null}};
export const DAILY_MS=15*60000;
export function playAccount(s:LightState,now=Date.now()):HomePlay {
 const day=dateKey(new Date(now));
 const p:HomePlay=s.homePlay?.day===day?{...s.homePlay,receipts:[...s.homePlay.receipts],session:s.homePlay.session?{...s.homePlay.session}:undefined}:{day,receipts:[],bonus:false,usedMs:0,gate:0};
 const tasks=s.homework?.days[day]?.tasks??[];
 for(const t of tasks)if(t.confirmed&&!t.waived&&!p.receipts.includes(t.id))p.receipts.push(t.id);
 if(tasks.length&&tasks.every(t=>t.confirmed))p.bonus=true;
 return p;
}
export function settlePlay(s:LightState,now=Date.now()):LightState {
 const p=playAccount(s,now),v=p.session;
 if(v?.deadline!=null){const left=Math.max(0,Math.min(v.remainingMs,v.deadline-now));p.usedMs=Math.min(DAILY_MS,p.usedMs+v.remainingMs-left);p.session=left>0?{remainingMs:left,deadline:null}:undefined;}
 return {...s,homePlay:p};
}
export function playBalance(p:HomePlay){return Math.max(0,Math.min(DAILY_MS,p.receipts.length*120000+(p.bonus?600000:0))-p.usedMs);}
export function startPlay(s:LightState,now=Date.now()):LightState {
 const next=settlePlay(s,now),p=next.homePlay!;
 if(p.session){p.session.deadline=now+p.session.remainingMs;return next;}
 const allowance=playBalance(p);
 if(allowance<=0||(!p.bonus&&p.receipts.length<=p.gate))return next;
 p.gate=p.receipts.length;
 const remainingMs=Math.min(allowance,p.bonus?600000:120000);
 p.session={remainingMs,deadline:now+remainingMs};return next;
}
