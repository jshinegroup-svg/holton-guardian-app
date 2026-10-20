export const focusMusicTracks = [
 {id:'meditation',name:'靜心鋼琴',title:'Meditation Impromptu 01',isrc:'USUAN1100163',category:'focus',kind:'輕柔鋼琴'},
 {id:'morning',name:'晨光輕語',title:'Morning',isrc:'USUAN2300003',category:'focus',kind:'吉他・豎琴・長笛'},
 {id:'evening',name:'晚風陪伴',title:'Evening',isrc:'USUAN2300002',category:'focus',kind:'吉他・大提琴・雙簧管'},
 {id:'prelude',name:'晨光前奏',title:'Prelude in C (BWV 846)',isrc:'USUAN1100689',category:'focus',kind:'巴赫鋼琴前奏曲'},
 {id:'ripples',name:'水面漣漪',title:'Ripples',isrc:'USUAN1100691',category:'focus',kind:'撥弦琴音'},
 {id:'dreams',name:'夢境漫步',title:'Dreams Become Real',isrc:'USUAN1500027',category:'focus',kind:'鋼琴・環境音色'},
 {id:'mesmerize',name:'琴音流動',title:'Mesmerize',isrc:'USUAN1500005',category:'focus',kind:'緩緩流動的鋼琴'},
 {"id": "waters", "name": "清澈琴音", "title": "Clear Waters", "isrc": "USUAN1100290", "kind": "鋼琴", "category": "focus"},
 {"id": "soul", "name": "安靜留白", "title": "Clean Soul", "isrc": "USUAN1300033", "kind": "電鋼琴・低音", "category": "focus"},
 {"id": "thought2", "name": "輕盈思緒", "title": "Light Thought var 2", "isrc": "USUAN1200007", "kind": "電鋼琴", "category": "focus"},
 {"id": "meditation2", "name": "靜心小憩", "title": "Meditation Impromptu 02", "isrc": "USUAN1100162", "kind": "輕柔鋼琴", "category": "relax"},
 {"id": "meditation3", "name": "柔光鋼琴", "title": "Meditation Impromptu 03", "isrc": "USUAN1100161", "kind": "輕柔鋼琴", "category": "relax"},
 {"id": "summer", "name": "仲夏天空", "title": "Midsummer Sky", "isrc": "USUAN1100158", "kind": "鋼琴", "category": "relax"},
 {"id": "lily", "name": "池畔睡蓮", "title": "Water Lily", "isrc": "USUAN1400035", "kind": "鋼琴・弦樂", "category": "relax"},
 {"id": "reawakening", "name": "溫柔甦醒", "title": "Reawakening", "isrc": "USUAN1400017", "kind": "鋼琴・大提琴", "category": "relax"},
 {"id": "thought1", "name": "慢慢呼吸", "title": "Light Thought var 1", "isrc": "USUAN1200006", "kind": "電鋼琴", "category": "relax"},
 {"id": "harps", "name": "雙豎琴卡農", "title": "Canon in D for Two Harps", "isrc": "USUAN2000015", "kind": "雙豎琴", "category": "relax"},
 {"id": "tales", "name": "故事微風", "title": "Teller of the Tales", "isrc": "USUAN1400020", "kind": "魯特琴・吉他", "category": "relax"},
 {"id": "valley", "name": "魔法山谷", "title": "Enchanted Valley", "isrc": "USUAN1200093", "kind": "鋼片琴・木管・弦樂", "category": "relax"},
 {"id": "pulse", "name": "片刻安寧", "title": "Touching Moments One - Pulse", "isrc": "USUAN1100039", "kind": "鋼琴", "category": "relax"},
] as const;
export type FocusMusicId=typeof focusMusicTracks[number]['id'];
export const DEFAULT_FOCUS_MUSIC:FocusMusicId='meditation';
export const validFocusMusicId=(id:unknown):id is FocusMusicId=>focusMusicTracks.some(t=>t.id===id);
export const focusMusicUrl=(id:FocusMusicId)=>`${process.env.EXPO_PUBLIC_BASE_URL||''}/music/${id}.mp3`;
