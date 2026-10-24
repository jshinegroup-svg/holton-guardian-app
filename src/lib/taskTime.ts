export const CUSTOM_TIME_CARD_ID='custom-time';
export const DEFAULT_CUSTOM_MINUTES=30;
export const MAX_CUSTOM_MINUTES=999;
export const validCustomMinutes=(value:number)=>Number.isInteger(value)&&value>=1&&value<=MAX_CUSTOM_MINUTES;
export function parseCustomMinutes(text:string):number|null {
 if(!/^\d+$/.test(text.trim()))return null;
 const value=Number(text);
 return validCustomMinutes(value)?value:null;
}
/** New tasks only: active tasks keep their captured taskReward. Untimed remains five. */
export const rewardForMinutes=(minutes:number)=>minutes===0?5:Math.max(1,Math.min(5,Math.floor(minutes/5)));
