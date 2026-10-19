export type WorldId = 'sky' | 'forest' | 'cosmos';
export const worldIds:WorldId[] = ['forest','sky','cosmos'];
export type JourneyEvent = {id:string;world:WorldId;step:number};
export type Journeys = {version:1|2;retainedWorlds?:WorldId[];counts:Record<WorldId,number>;lastCompletionId?:string;event?:JourneyEvent;legacyCredit:number};
export type JourneyState = {journeys?:Journeys;activeWorld?:WorldId;history:{id:string;at:string;world?:WorldId}[]};
export const worlds = {
 sky:{name:'天空基地',symbol:'✧',intro:'這座基地睡了好久。我們一起把五顆星光點亮，讓它醒過來吧！',chapters:['喚醒天空基地','修復星光橋','啟動星際傳送門'],landmarks:['基地','星光橋','傳送門'],steps:['基地門前的水晶亮起了。','通往廣場的小路亮起了。','廣場的燈被點亮了。','基地旗幟升起了。','中央核心亮起，天空基地醒來了！','找到了第一塊星光橋石。','橋墩穩穩站好了。','橋面向對岸延伸。','橋邊的引路燈亮起了。','星光橋修好了，遠方的星海出現了！','傳送門的底座亮起。','星環環繞起傳送門。','門框的水晶接上星光。','星海的光芒穿過了門。','傳送門亮起，通往宇宙的航程準備好了！']},
 forest:{name:'森林秘境',symbol:'❧',intro:'生命樹的光散落在森林裡。一起走小路、修水道，讓森林重新發亮。',chapters:['喚醒林間小徑','修復月光水道','點亮生命樹'],landmarks:['林間小徑','月光水道','生命樹'],steps:['一片星光葉亮起。','第二盞蘑菇燈醒來。','小路旁開出一朵花。','藤蔓讓出通往樹屋的小路。','林間小徑亮起，樹屋重新打開了！','找到了水道的入口。','第一段石槽修好了。','清水流過小石橋。','月光倒映在水面。','月光水道恢復了，清水流向生命樹！','生命樹的第一條根發亮。','樹幹上出現星光紋路。','枝葉間長出水晶花。','樹冠接住了遠方的星光。','生命樹伸展出雲梯，天空基地開放了！']},
 cosmos:{name:'宇宙遠征',symbol:'✦',intro:'遠方的星航站正等著訊號。讓我們一站一站點亮星路，把溫暖的光送到星海。',chapters:['啟動星航站','連接星際航道','點亮星海燈塔'],landmarks:['星航站','星際航道','星海燈塔'],steps:['星航站的第一盞燈亮起。','太陽能帆板展開了。','觀測窗透出溫暖的光。','通訊天線對準星海。','星航站啟動，收到第一個問候！','第一顆航路星被點亮。','星橋接上了第二站。','導航環緩緩就位。','航道盡頭出現一座燈塔。','星際航道連通，可以走向燈塔了！','燈塔底座接通了光。','第二層星環亮起。','光穿過了水晶鏡片。','星海裡回應了一道光。','星海燈塔亮起！三個世界都留下了你的足跡。']}
} as const;
const clamp=(n:number)=>Number.isSafeInteger(n)?Math.max(0,Math.min(15,n)):0;
export function migrateJourneys<T extends JourneyState>(s:T):T & {journeys:Journeys;activeWorld:WorldId} {
 if(s.journeys?.version===1||s.journeys?.version===2) {
  const previous=s.journeys;
  const counts={sky:clamp(previous.counts.sky),forest:clamp(previous.counts.forest),cosmos:clamp(previous.counts.cosmos)};
  // Never revoke worlds already open under the previous sky-first route.
  const retainedWorlds:WorldId[]=previous.version===1?['sky',...(counts.sky>=15?['forest' as const]:[]),...(counts.sky>=15&&counts.forest>=15?['cosmos' as const]:[])]:previous.retainedWorlds??[];
  return {...s,activeWorld:worldIds.includes(s.activeWorld as WorldId)?s.activeWorld!:(previous.version===1?'sky':'forest'),journeys:{...previous,version:2,retainedWorlds,counts}};
 }
 const ids=new Set(s.history.filter(r=>r.id&&Number.isFinite(Date.parse(r.at))).map(r=>r.id));
 const credit=Math.min(15,ids.size);
 return {...s,activeWorld:'forest',journeys:{version:2,counts:{sky:0,forest:credit,cosmos:0},legacyCredit:credit}};
}
export function unlocked(j:Journeys,w:WorldId) {
 if(w==='forest'||j.retainedWorlds?.includes(w))return true;
 // Supports an in-memory v1 value before migration, without relocking prior access.
 if(j.version===1&&(w==='sky'||(j.counts.sky>=15&&j.counts.forest>=15)))return true;
 return w==='sky'?j.counts.forest>=15:j.counts.forest>=15&&j.counts.sky>=15;
}
export function enterWorld<T extends JourneyState & {phase:string}>(s:T,w:WorldId):T {
 const m=migrateJourneys(s);
 if(!['ready','done'].includes(s.phase)||!unlocked(m.journeys,w))return s;
 return {...m,activeWorld:w,phase:'ready'};
}
export function advanceJourney(j:Journeys,w:WorldId,completionId:string):Journeys {
 if(j.lastCompletionId===completionId||!unlocked(j,w))return j;
 if(j.counts[w]>=15)return {...j,lastCompletionId:completionId,event:undefined};
 const step=j.counts[w]+1;
 return {...j,counts:{...j.counts,[w]:step},lastCompletionId:completionId,event:{id:completionId,world:w,step}};
}
export function journeyHint(j:Journeys,w:WorldId) {
 const n=j.counts[w];
 return n>=15 ? w==='cosmos'?'三個世界的旅程已完成，隨時可以回訪。':w==='forest'?'森林旅程完成，天空基地已開放。':unlocked(j,'cosmos')?'天空旅程完成，宇宙遠征已開放。':'天空旅程已保留；完成森林旅程後即可前往宇宙。' : `再完成 ${5-n%5} 次，就能${worlds[w].chapters[Math.floor(n/5)]}。`;
}

// The scenery advances only at chapter boundaries; wallet/history are untouched.
export function chapterSceneIndex(completed:number) { return Math.min(2, Math.max(0, Math.floor(completed / 5))); }
