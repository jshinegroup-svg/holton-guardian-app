export type FocusSession = {phase:string;minutes:number;help?:boolean;focusTargetMs?:number;allowEarlyFinish?:boolean;deadline:number|null;remaining:number;focusElapsedMs?:number;focusStartedAt?:number|null};
export const minimumFocusMs=(minutes:number)=>minutes===0?60000:minutes*30000;
export function elapsedFocusMs(s:FocusSession,now:number):number {
 const saved=Number.isFinite(s.focusElapsedMs)?Math.max(0,s.focusElapsedMs!):0;
 return saved+(s.phase==='active'&&!s.help&&typeof s.focusStartedAt==='number'?Math.max(0,now-s.focusStartedAt):0);
}
export const canFinishFocus=(s:FocusSession,now:number)=>s.phase==='active'&&!s.help&&(s.allowEarlyFinish===true||elapsedFocusMs(s,now)>=minimumFocusMs(s.minutes));
export function pauseFocus<T extends FocusSession>(s:T,now:number):T {return {...s,focusElapsedMs:elapsedFocusMs(s,now),focusStartedAt:null};}
export function migrateFocus<T extends FocusSession>(s:T,now:number):T {
 if(s.focusElapsedMs!==undefined)return s;
 // Old timed tasks have a trustworthy remaining/deadline; old untimed tasks have no start timestamp.
 const left=s.deadline!==null?Math.max(0,s.deadline-now):s.remaining*1000;
 const elapsed=s.minutes>0?Math.max(0,s.minutes*60000-left):0;
 return {...s,focusElapsedMs:s.phase==='finishing'?Math.max(elapsed,minimumFocusMs(s.minutes)):s.phase==='active'?elapsed:0,focusStartedAt:s.phase==='active'&&!s.help?now:null};
}
export const clockText=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;

export const focusTargetMs=(s:FocusSession)=>s.focusTargetMs??(s.minutes===0?600000:s.minutes*60000);
export function extendFocus<T extends FocusSession>(s:T,now:number,minutes=2):T {
 if(!Number.isInteger(minutes)||minutes<1||minutes>999)return s;
 if(s.phase!=='active'||s.help||elapsedFocusMs(s,now)<focusTargetMs(s))return s;
 return {...s,focusTargetMs:elapsedFocusMs(s,now)+minutes*60000,remaining:minutes*60,deadline:now+minutes*60000,taskReminderShown:false,continueAfterDue:true};
}
