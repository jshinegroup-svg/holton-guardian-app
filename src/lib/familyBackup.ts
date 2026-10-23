import {validFocusMusicId} from './focusMusicCatalog';
// Versioned, local-only portable backups. Unknown versions/fields fail closed.
type Rule=(v:unknown)=>boolean;
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text:Rule=v=>typeof v==='string'&&v.length<=2000;
const date:Rule=v=>typeof v==='string'&&v.length<=64&&Number.isFinite(Date.parse(v));
const bool:Rule=v=>typeof v==='boolean';
const integer=(min=0,max=Number.MAX_SAFE_INTEGER):Rule=>v=>Number.isSafeInteger(v)&&Number(v)>=min&&Number(v)<=max;
const one=(...values:unknown[]):Rule=>v=>values.includes(v);
const list=(rule:Rule,max=30000):Rule=>v=>Array.isArray(v)&&v.length<=max&&v.every(rule);
const nullable=(rule:Rule):Rule=>v=>v===null||rule(v);
const shape=(required:Record<string,Rule>,optional:Record<string,Rule>={}):Rule=>v=>obj(v)&&Object.keys(required).every(k=>required[k](v[k]))&&Object.entries(v).every(([k,val])=>Object.hasOwn(required,k)?required[k](val):Object.hasOwn(optional,k)&&optional[k](val));
const world=one('forest','sky','cosmos');
const record=shape({id:text,title:text,at:date,minutes:integer(0,60)},{outcome:one('completed','unfinished'),elapsedSeconds:integer(),world,reward:integer(),cardId:text,finishId:text,helpUsed:bool,supportUsed:list(text,20)});
const wish=shape({id:text,name:text,cost:integer(),enabled:bool},{custom:bool,style:one('gold','scroll','crystal'),note:text});
const receipt=shape({id:text,name:text,cost:integer(),at:date},{fulfilled:bool,wishId:text,custom:bool,style:one('gold','scroll','crystal'),note:text,balanceBefore:integer(),balanceAfter:integer(),usedAt:date});
const draw=shape({id:text,reason:text},{cardId:text,redeemedAt:date,redemptionId:text});
const journey=shape({version:one(1,2),counts:shape({forest:integer(0,15),sky:integer(0,15),cosmos:integer(0,15)}),legacyCredit:integer(0,15)},{retainedWorlds:list(world,3),lastCompletionId:text,event:shape({id:text,world,step:integer(1,15)})});
const guardian=shape({}, {coreGuardianName:text,coreGuardianId:text,coreGuardianArchetype:text,coreGuardianStateVariant:text,coreGuardianLevel:integer(0,100000)});
const stateRule=shape({version:one(1),title:text,minutes:integer(0,60),orbs:integer(),phase:one('ready','done'),remaining:integer(0,3600),history:list(record),guardian},{taskOutcome:one('completed','unfinished'),continueAfterDue:bool,lastCustomMinutes:integer(1,60),focusTargetMs:integer(),starterChoiceVersion:one(1),starterCompanionId:one('pip','hop','bomo'),focusMusicEnabled:bool,focusMusicTrackId:validFocusMusicId,childName:v=>typeof v==='string'&&Array.from(v).length<=20,allowEarlyFinish:bool,guardianSundayOnly:bool,taskSoundEnabled:bool,taskReminderShown:bool,focusElapsedMs:integer(),focusStartedAt:nullable(integer()),onboardingDone:bool,cardId:text,help:bool,deadline:nullable(integer()),journeys:journey,activeWorld:world,shopEnabled:bool,wishes:list(wish,100),wishReceipts:list(receipt),taskCategory:text,reduceMotion:bool,taskReward:integer(),worldReminderDismissedDay:text,worldRedemptions:list(shape({id:text,at:date,day:text,rulesVersion:one(1),basePoints:integer(),multiplier:one(1,2),points:integer(),drawIds:list(text),lines:list(shape({drawId:text,cardId:text,points:integer()}))})),supportCardId:text,supportUsed:list(text,20),breakDeadline:nullable(integer()),helpUsed:bool,finishId:text,guardianCards:list(shape({cardId:text,at:date,cost:integer(),source:one('legacy','parent-restore','sunday')},{challengeId:text,heroCardId:text})),companionCardId:text,starterRestoreAt:date,dailyGoal:integer(1,20),rewardProgress:integer(0,2),dailyRewardDay:text,draws:list(draw),collection:list(draw),lastBackupAt:date});
export const BACKUP_LIMIT=8*1024*1024;
export type FamilySnapshot={version:1;title:string;minutes:number;orbs:number;phase:'ready'|'done';remaining:number;history:{outcome?:'completed'|'unfinished';elapsedSeconds?:number;id:string;title:string;at:string;minutes:number;helpUsed?:boolean;supportUsed?:string[]}[];guardian:Record<string,unknown>;wishes?:unknown[];wishReceipts?:{id:string;name:string;cost:number;at:string;fulfilled?:boolean}[];guardianCards?:unknown[];[key:string]:unknown};
export type Backup={format:'holton-hero-family';version:1;createdAt:string;state:FamilySnapshot};
export function parseBackup(raw:string):Backup {
 if(raw.length>BACKUP_LIMIT)throw Error('備份檔太大，請選擇 8 MB 以下的 Holton Hero 備份。');
 let v:unknown;try{v=JSON.parse(raw);}catch{throw Error('無法讀取這份檔案，請選擇匯出的 JSON 備份。');}
 if(!obj(v)||v.format!=='holton-hero-family'||v.version!==1)throw Error('這不是支援的 Holton Hero 備份版本。');
 if(!date(v.createdAt)||!stateRule(v.state))throw Error('備份內容不完整或格式不符；請使用任務與挑戰結束後匯出的備份。原有紀錄未變更。');
 const state=v.state as Record<string,unknown>;
 for(const key of ['history','wishReceipts','worldRedemptions','draws','collection']){const items=state[key] as {id:string}[]|undefined;if(items&&new Set(items.map(x=>x.id)).size!==items.length)throw Error('備份有重複紀錄，請重新匯出；原有紀錄未變更。');}
 return v as unknown as Backup;
}
export function createBackup(state:unknown,now=new Date()):string {
 const exportState=obj(state)?Object.fromEntries(Object.entries(state).filter(([key])=>key!=='familyTaskId')):state;
 const raw=JSON.stringify({format:'holton-hero-family',version:1,createdAt:now.toISOString(),state:exportState},null,2);
 parseBackup(raw);return raw;
}
export function backupSummary(b:Backup){return `${b.state.orbs} 能量球 · ${b.state.history.length} 筆任務 · ${b.state.guardianCards?.length??0} 張守護獸卡 · ${b.state.wishReceipts?.length??0} 筆心願紀錄`;}
export function weeklyFootprints(history:FamilySnapshot['history'],now=Date.now()) {
 const key=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const weekday=new Date(`${key}T12:00:00Z`).getUTCDay();const start=Date.parse(`${key}T00:00:00+08:00`)-((weekday+6)%7)*86400000;
 const attempts=[...new Map(history.filter(r=>Number.isFinite(Date.parse(r.at))&&Date.parse(r.at)>=start&&Date.parse(r.at)<start+7*86400000&&Date.parse(r.at)<=now).map(r=>[r.id,r])).values()];
 const rows=attempts.filter(r=>r.outcome!=='unfinished');
 const unfinished=attempts.filter(r=>r.outcome==='unfinished');
 const tasks=[...new Set(rows.map(r=>r.title))].map(title=>({title,count:rows.filter(r=>r.title===title).length}));
 return {start,end:start+6*86400000,rows,unfinished,tasks,helpCount:attempts.filter(r=>r.helpUsed||r.supportUsed?.length).length};
}
