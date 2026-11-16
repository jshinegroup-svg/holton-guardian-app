import {useSyncExternalStore} from 'react';
const KEY='holton-family-v2::companion-voice';
const read=()=>{try{return globalThis.localStorage?.getItem(KEY)==='on';}catch{return false;}};
let enabled=read();
let owner:object|null=null;
const listeners=new Set<()=>void>();
const supported=()=>typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';
export function stopCompanionVoice(who?:object){if(who&&who!==owner)return;if(supported())window.speechSynthesis.cancel();owner=null;}
export const companionVoiceProfiles:Record<string,{pitch:number;rate:number;voice:number}>={
 pip:{pitch:1.35,rate:1.02,voice:0},hop:{pitch:1.22,rate:.98,voice:1},bomo:{pitch:.78,rate:.82,voice:2},
 tidefin:{pitch:.9,rate:.96,voice:2},stoneback:{pitch:.72,rate:.78,voice:0},emberwing:{pitch:1.12,rate:1.04,voice:1},
 'steel-eagle':{pitch:.84,rate:1,voice:2},bramblefang:{pitch:1.04,rate:.88,voice:0},guardian:{pitch:1,rate:.9,voice:0},
};
export function speakCompanion(text:string,locale:string,who:object,character='guardian'){
 if(!enabled||!supported())return;
 try{
  stopCompanionVoice();owner=who;
  const utterance=new SpeechSynthesisUtterance(text);
  const profile=companionVoiceProfiles[character]||companionVoiceProfiles.guardian;
  utterance.lang=locale==='en'?'en-US':'zh-TW';utterance.rate=profile.rate;utterance.pitch=profile.pitch;
  const voices=window.speechSynthesis.getVoices();
  const exact=voices.filter(v=>v.lang.replace('_','-')===utterance.lang);
  const candidates=(exact.length?exact:voices.filter(v=>v.lang.startsWith(locale==='en'?'en':'zh'))).sort((a,b)=>a.voiceURI.localeCompare(b.voiceURI));
  const voice=candidates[profile.voice % candidates.length];
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
