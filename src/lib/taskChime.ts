import {useCallback,useEffect,useRef} from 'react';
import {Platform} from 'react-native';

// Original three-note completion cue: C5–E5–G5, soft triangle with a long release.
export function useTaskChime(enabled:boolean) {
 const context=useRef<AudioContext|null>(null);
 const arm=useCallback(()=>{
  if(Platform.OS!=='web'||typeof window==='undefined')return;
  const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Constructor)return;
  try {context.current??=new Constructor();void context.current.resume().catch(()=>{});}catch {/* Visual reminder remains available. */}
 },[]);
 useEffect(()=>{
  if(Platform.OS!=='web'||typeof document==='undefined'||!enabled)return;
  const unlock=()=>arm();document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
  return ()=>{document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true);};
 },[arm,enabled]);
 useEffect(()=>()=>{void context.current?.close().catch(()=>{});},[]);
 const play=useCallback(async()=>{
  const ctx=context.current;
  // Never wait indefinitely for a suspended mobile AudioContext.
  if(!ctx||ctx.state!=='running')return false;
  try {
   const start=ctx.currentTime+.025;
   [523.25,659.25,783.99].forEach((frequency,i)=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();const at=start+i*.28,end=at+(i===2?.75:.4);
    osc.type='triangle';osc.frequency.value=frequency;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.065,at+.035);gain.gain.exponentialRampToValueAtTime(.001,end);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(end+.03);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
   });
   return true;
  }catch{return false;}
 },[]);
 return {arm,play};
}
