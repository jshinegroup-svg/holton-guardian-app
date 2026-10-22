/** V2 identifiers never reuse the V1 singleton storage key. */
export type ChildProfile = {id:string;familyId:string;nickname:string;ageYears:number|null;ageRecordedAt:string};
export type FamilyEvent = {
  id:string;kind:'visit'|'task_started'|'task_completed'|'task_cancelled'|'card_selected'|'active_time';
  occurredAt:string;taskId?:string;cardId?:string;plannedSeconds?:number;elapsedSeconds?:number;earlyFinish?:boolean;
};
export type ChildSave<T> = {childId:string;familyId:string;revision:number;state:T;updatedAt:string};
export function childStorageKey(familyId:string,childId:string):string {
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if(!uuid.test(familyId)||!uuid.test(childId))throw Error('Invalid family or child identifier');
  return `holton-family-v2::${familyId}::${childId}`;
}
export function validateChildProfile(nickname:string,ageYears:number|null) {
  const name=nickname.trim();
  if(!name||Array.from(name).length>20)throw Error('暱稱請填寫 1～20 個字。');
  if(ageYears!==null&&(!Number.isInteger(ageYears)||ageYears<1||ageYears>18))throw Error('請選擇孩子的年齡。');
  return {nickname:name,ageYears};
}
