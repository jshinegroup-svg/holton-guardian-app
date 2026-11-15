import type {HomeworkDay} from './model';
export function historyGroups(days:Record<string,HomeworkDay>,today:string){
 const shift=(n:number)=>{const d=new Date(`${today}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const start=shift(-5),end=shift(1);
 const entries=Object.entries(days).filter(([,d])=>d.tasks.length).sort(([a],[b])=>b.localeCompare(a));
 return {start,end,recent:entries.filter(([k])=>k>=start&&k<=end),unfinished:entries.filter(([k,d])=>k<start&&(d.tasks.some(t=>!t.confirmed&&!t.waived)||(!d.claimedAt&&d.tasks.some(t=>t.confirmed)))),future:entries.filter(([k])=>k>end).reverse()};
}
