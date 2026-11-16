import {useSyncExternalStore} from 'react';
const KEY='holton-family-v2::companion-voice';
const read=()=>{try{return globalThis.localStorage?.getItem(KEY)==='on';}catch{return false;}};
let enabled=read();
let owner:object|null=null;
const listeners=new Set<()=>void>();
const supported=()=>typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';
export function stopCompanionVoice(who?:object){if(who&&who!==owner)return;if(supported())window.speechSynthesis.cancel();owner=null;}
export const companionVoiceProfiles:Record<string,{pitch:number;rate:number;voice:number}>={
 pip:{pitch:1.02,rate:1,voice:0},hop:{pitch:1,rate:.97,voice:1},bomo:{pitch:.97,rate:.92,voice:2},
 tidefin:{pitch:.99,rate:.96,voice:2},stoneback:{pitch:.96,rate:.9,voice:0},emberwing:{pitch:1.01,rate:1.02,voice:1},
 'steel-eagle':{pitch:.98,rate:1,voice:2},bramblefang:{pitch:1,rate:.94,voice:0},guardian:{pitch:1,rate:.96,voice:0},
};
// Web Speech does not expose gender. Prefer known male voice names, never
// manufacture a male voice by heavily lowering a female voice's pitch.
export function selectCompanionVoice(voices:SpeechSynthesisVoice[],lang:string,index:number){
 const normalize=(value:string)=>value.replace(/_/g,'-').toLowerCase();
 const matching=voices.filter(v=>normalize(v.lang).split('-')[0]===normalize(lang).split('-')[0]);
 const male=/(?:yun[- ]?jhe|yun[- ]?zhe|yunxi|yunjian|yunyang|yunfeng|yunhao|yunxia|yunze|yunyi|yung[- ]?yu|zhiwei|li-mu|\b(?:aaron|gordon|reed|rocko|evan|nathan|daniel|alex|david|mark|guy|andrew|brian|christopher|roger|eric|ryan)\b|雲哲|云哲|志偉|志伟|男聲|男声|\bmale\b)/i;
 const men=matching.filter(v=>male.test(v.name+' '+v.voiceURI));
 const pool=men.length?men:matching;
 const score=(v:SpeechSynthesisVoice)=>(normalize(v.lang)===normalize(lang)?10:0)+(/premium|enhanced|natural|neural/i.test(v.name+' '+v.voiceURI)?3:0);
 const ranked=[...pool].sort((a,b)=>score(b)-score(a)||a.voiceURI.localeCompare(b.voiceURI));
 const best=ranked.filter(v=>score(v)===score(ranked[0]));
 return best.length?best[index%best.length]:undefined;
}
export function speakCompanion(text:string,locale:string,who:object,character='guardian'){
 if(!enabled||!supported())return;
 try{
  stopCompanionVoice();owner=who;
  const utterance=new SpeechSynthesisUtterance(text);
  const profile=companionVoiceProfiles[character]||companionVoiceProfiles.guardian;
  utterance.lang=locale==='en'?'en-US':'zh-TW';utterance.rate=profile.rate;utterance.pitch=profile.pitch;
  const voices=window.speechSynthesis.getVoices();
  const voice=selectCompanionVoice(voices,utterance.lang,profile.voice);
  if(voice)utterance.voice=voice;
  window.speechSynthesis.speak(utterance);
 }catch{/* Text remains usable even if device speech is unavailable. */}
}
function setEnabled(value:boolean){enabled=value;try{globalThis.localStorage?.setItem(KEY,value?'on':'off');}catch{}if(!value)stopCompanionVoice();listeners.forEach(fn=>fn());}
export function useCompanionVoice(){return {enabled:useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>enabled,()=>false),setEnabled,supported:supported()};}
if(typeof window!=='undefined'){
 window.addEventListener('storage',event=>{if(event.key===KEY){setEnabled(read());}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCompanionVoice();});
}
