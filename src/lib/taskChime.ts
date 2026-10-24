import {useCallback,useEffect,useRef} from 'react';
import {Platform} from 'react-native';
import {reminderNotes,reminderGain,type ReminderSound,type SoundLevel} from './reminderSounds';
/** Original, locally synthesized cues; never loop or change task data. */
export function useTaskChime(enabled:boolean,sound:ReminderSound='bell',level:SoundLevel='normal') {
 const context=useRef<AudioContext|null>(null),nodes=useRef<OscillatorNode[]>([]);
 const options=useRef({enabled,sound,level});options.current={enabled,sound,level};
 const stop=useCallback(()=>{for(const node of nodes.current){try{node.stop();}catch{}}nodes.current=[];},[]);
 const arm=useCallback(()=>{
  if(Platform.OS!=='web'||typeof window==='undefined')return;
  const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Constructor)return;
  try{context.current??=new Constructor();void context.current.resume().catch(()=>{});}catch{}
 },[]);
 useEffect(()=>{
  if(Platform.OS!=='web'||typeof document==='undefined'||!enabled)return;
  document.addEventListener('pointerdown',arm,true);document.addEventListener('keydown',arm,true);
  return()=>{document.removeEventListener('pointerdown',arm,true);document.removeEventListener('keydown',arm,true);};
 },[arm,enabled]);
 useEffect(()=>{if(!enabled)stop();},[enabled,stop]);
 useEffect(()=>{if(typeof document==='undefined')return;const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[stop]);
 useEffect(()=>()=>{stop();void context.current?.close().catch(()=>{});},[stop]);
 const play=useCallback(async(previewSound?:ReminderSound)=>{
  // Resume inside the actual tap and await it, rather than guessing a 100ms delay.
  if(previewSound){arm();try{await context.current?.resume();}catch{return false;}}
  const ctx=context.current,config=options.current;
  if((!config.enabled&&!previewSound)||!ctx||ctx.state!=='running')return false;
  try{
   stop();const start=ctx.currentTime+.025;
   for(const note of reminderNotes(previewSound??config.sound)){
    const osc=ctx.createOscillator(),gain=ctx.createGain(),at=start+note.at,end=at+note.duration;
    osc.type=note.type;osc.frequency.value=note.frequency;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(reminderGain[config.level],at+.02);gain.gain.exponentialRampToValueAtTime(.001,end);
    osc.connect(gain);gain.connect(ctx.destination);nodes.current.push(osc);osc.start(at);osc.stop(end+.03);
    osc.onended=()=>{nodes.current=nodes.current.filter(n=>n!==osc);osc.disconnect();gain.disconnect();};
   }
   window.dispatchEvent(new Event('holton-task-chime'));return true;
  }catch{stop();return false;}
 },[stop,arm]);
 return {arm,play,stop};
}
