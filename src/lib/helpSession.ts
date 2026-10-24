export const helpDurations={pause:null,rest:120000,energy:60000,breathe:60000} as const;
export type HelpCardId=keyof typeof helpDurations;
export function isHelpCard(id:string):id is HelpCardId{return Object.prototype.hasOwnProperty.call(helpDurations,id);}
type HelpState={phase:string;help?:boolean;supportCardId?:string;supportUsed?:string[];breakDeadline?:number|null};
/** Choosing consumes one use, including an early exit. A new task resets supportUsed. */
export function selectHelpCard<T extends HelpState>(s:T,id:string,now:number):T {
 if(s.phase!=='active'||!s.help||s.supportCardId||!isHelpCard(id)||s.supportUsed?.includes(id))return s;
 return {...s,supportCardId:id,supportUsed:[...(s.supportUsed??[]),id],breakDeadline:helpDurations[id]===null?null:now+helpDurations[id]};
}
/** Pause is indefinite, including old timed pauses; timed cards keep their existing deadline. */
export function migrateHelpSession<T extends HelpState>(s:T,now:number):T {
 const id=s.supportCardId;
 if(s.phase!=='active'||!s.help||!id||!isHelpCard(id))return s;
 if(id==='pause'){
  if(s.breakDeadline===null&&s.supportUsed?.includes(id))return s;
  return {...s,breakDeadline:null,supportUsed:[...new Set([...(s.supportUsed??[]),id])]};
 }
 if(s.breakDeadline!=null&&s.supportUsed?.includes(id))return s;
 return {...s,breakDeadline:s.breakDeadline??now+helpDurations[id],supportUsed:[...new Set([...(s.supportUsed??[]),id])]};
}

export function helpDurationLabel(id:HelpCardId):string {const duration=helpDurations[id];return duration===null?'不限時':`${duration/60000} 分鐘`;}
