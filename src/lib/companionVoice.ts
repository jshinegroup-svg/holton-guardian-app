import {useSyncExternalStore} from 'react';
import {companionVoiceClips} from './companionVoiceClips';
const KEY='holton-family-v2::companion-voice';
const read=()=>{try{return globalThis.localStorage?.getItem(KEY)==='on';}catch{return false;}};
let enabled=read();
let owner:object|null=null;
let current:HTMLAudioElement|null=null;
let generation=0;
const listeners=new Set<()=>void>();
const supported=()=>typeof window!=='undefined'&&typeof Audio!=='undefined';
/** Exact phrase matching; unknown phrases stay text-only, never system TTS. */
export function companionAudioSource(text:string,locale:string,character='guardian'){
 const species=character.split(':')[0];
 const role=Object.prototype.hasOwnProperty.call(companionVoiceClips,species)?species:'guardian';
 const file=companionVoiceClips[role]?.[locale==='en'?'en':'zh']?.[text];
 return file?`/companion-voices/v1/${file}`:undefined;
}
export function stopCompanionVoice(who?:object){
 if(who&&who!==owner)return;
 generation++;const previous=current;current=null;owner=null;
 if(previous){previous.onended=null;previous.onerror=null;previous.pause();previous.removeAttribute('src');previous.load();}
}
export function speakCompanion(text:string,locale:string,who:object,character='guardian'){
 if(!enabled||!supported())return;
 stopCompanionVoice();
 const src=companionAudioSource(text,locale,character);if(!src)return;
 const ticket=generation;
 try{
  const audio=new Audio(src);current=audio;owner=who;audio.preload='none';
  const finish=()=>{if(current===audio)stopCompanionVoice(who);};
  audio.onended=finish;audio.onerror=finish;
  // Called synchronously from the tap to preserve Safari's user-gesture permission.
  const playing=audio.play();
  if(playing)void playing.then(()=>{if(ticket!==generation||current!==audio)audio.pause();}).catch(finish);
 }catch{stopCompanionVoice(who);/* Text remains usable if playback is unavailable. */}
}
function setEnabled(value:boolean){enabled=value;try{globalThis.localStorage?.setItem(KEY,value?'on':'off');}catch{}if(!value)stopCompanionVoice();listeners.forEach(fn=>fn());}
export function useCompanionVoice(){return {enabled:useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>enabled,()=>false),setEnabled,supported:supported()};}
if(typeof window!=='undefined'){
 window.addEventListener('storage',event=>{if(event.key===KEY){setEnabled(read());}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCompanionVoice();});
}
