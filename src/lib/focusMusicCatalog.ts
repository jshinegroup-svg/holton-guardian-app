export const focusMusicTracks = [
 {id:'meditation',name:'靜心鋼琴',title:'Meditation Impromptu 01',isrc:'USUAN1100163',kind:'輕柔鋼琴'},
 {id:'morning',name:'晨光輕語',title:'Morning',isrc:'USUAN2300003',kind:'吉他・豎琴・長笛'},
 {id:'evening',name:'晚風陪伴',title:'Evening',isrc:'USUAN2300002',kind:'吉他・大提琴・雙簧管'},
 {id:'prelude',name:'晨光前奏',title:'Prelude in C (BWV 846)',isrc:'USUAN1100689',kind:'巴赫鋼琴前奏曲'},
 {id:'ripples',name:'水面漣漪',title:'Ripples',isrc:'USUAN1100691',kind:'撥弦琴音'},
 {id:'dreams',name:'夢境漫步',title:'Dreams Become Real',isrc:'USUAN1500027',kind:'鋼琴・環境音色'},
 {id:'mesmerize',name:'琴音流動',title:'Mesmerize',isrc:'USUAN1500005',kind:'緩緩流動的鋼琴'},
] as const;
export type FocusMusicId=typeof focusMusicTracks[number]['id'];
export const DEFAULT_FOCUS_MUSIC:FocusMusicId='meditation';
export const validFocusMusicId=(id:unknown):id is FocusMusicId=>focusMusicTracks.some(t=>t.id===id);
export const focusMusicUrl=(id:FocusMusicId)=>`${process.env.EXPO_PUBLIC_BASE_URL||''}/music/${id}.mp3`;
