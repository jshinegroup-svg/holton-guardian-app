import {useCallback,useEffect,useRef,useState} from 'react';
import {Platform} from 'react-native';
import {focusMusicUrl,type FocusMusicId} from './focusMusicCatalog';
type Status='idle'|'loading'|'playing'|'blocked'|'error';
/** One player shared by task playback and previews. Never changes task data. */
export function useFocusMusic({enabled,active,trackId,previewAllowed}:{enabled:boolean;active:boolean;trackId:FocusMusicId;previewAllowed:boolean}) {
 const player=useRef<HTMLAudioElement|null>(null),context=useRef<AudioContext|null>(null),gain=useRef<GainNode|null>(null),loaded=useRef<FocusMusicId|null>(null),generation=useRef(0);
 const [previewId,setPreviewId]=useState<FocusMusicId|null>(null),[status,setStatus]=useState<Status>('idle');
 const desired=previewAllowed&&previewId?previewId:active&&enabled?trackId:null;
 const desiredRef=useRef(desired);desiredRef.current=desired;
 const stop=useCallback(()=>{generation.current++;player.current?.pause();setStatus('idle');},[]);
 const prepare=useCallback(()=>{
  if(Platform.OS!=='web'||typeof window==='undefined')return null;
   if(!player.current){
    const audio=new Audio();audio.preload='none';audio.loop=true;audio.setAttribute('playsinline','');audio.dataset.testid='focus-music-player';
    // Keep an inspectable, non-interactive media element; only the visible app controls it.
    audio.style.display='none';document.body.appendChild(audio);player.current=audio;
    const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(Constructor){context.current=new Constructor();gain.current=context.current.createGain();gain.current.gain.value=.25;context.current.createMediaElementSource(audio).connect(gain.current);gain.current.connect(context.current.destination);}else{audio.volume=.25;}
    audio.onerror=()=>{generation.current++;audio.pause();setStatus('error');};
   }
  return player.current;
 },[]);
 const play=useCallback((id:FocusMusicId)=>{
  if(Platform.OS!=='web'||typeof window==='undefined'){setStatus('error');return;}
  const attempt=++generation.current;
  try {
   const audio=prepare();if(!audio){setStatus('error');return;}
   if(loaded.current!==id){audio.pause();audio.src=focusMusicUrl(id);loaded.current=id;}
   if(audio.error)audio.load();
   setStatus('loading');
   setTimeout(()=>{if(generation.current===attempt&&(audio.paused||(context.current&&context.current.state!=='running')))setStatus('blocked');},5000);
   const resume=context.current?.resume();
   // Initiate both calls in the user's gesture when invoked from a visible control.
   const playing=audio.play();
   void Promise.all([resume,playing]).then(()=>{
    if(generation.current!==attempt)return;
    if(context.current&&context.current.state!=='running'){audio.pause();setStatus('blocked');return;}
    setStatus('playing');
   }).catch(e=>{if(generation.current!==attempt)return;audio.pause();setStatus(e?.name==='NotAllowedError'?'blocked':'error');});
  }catch{if(generation.current===attempt)setStatus('error');}
 },[prepare]);
 useEffect(()=>{
  if(!enabled||Platform.OS!=='web')return;
  const arm=()=>{try{prepare();void context.current?.resume().catch(()=>{});}catch{/* A visible retry remains available. */}};
  document.addEventListener('pointerdown',arm,true);document.addEventListener('keydown',arm,true);
  return()=>{document.removeEventListener('pointerdown',arm,true);document.removeEventListener('keydown',arm,true);};
 },[enabled,prepare]);
 useEffect(()=>{if(desired&&typeof document!=='undefined'&&!document.hidden)play(desired);else stop();},[desired,play,stop]);
 useEffect(()=>{if(!previewAllowed)setPreviewId(null);},[previewAllowed]);
 useEffect(()=>{if(!previewAllowed||!previewId)return;const timer=setTimeout(()=>{setPreviewId(null);stop();},20000);return()=>clearTimeout(timer);},[previewAllowed,previewId,stop]);
 useEffect(()=>{
  if(Platform.OS!=='web')return;
  const wake=()=>{if(document.hidden){stop();setPreviewId(null);}else if(desiredRef.current)play(desiredRef.current);};
  const hide=()=>{stop();setPreviewId(null);};
  document.addEventListener('visibilitychange',wake);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',wake);
  return()=>{document.removeEventListener('visibilitychange',wake);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',wake);};
 },[play,stop]);
 useEffect(()=>()=>{generation.current++;player.current?.pause();player.current?.remove();void context.current?.close().catch(()=>{});},[]);
 const preview=(id:FocusMusicId)=>{if(previewId===id){setPreviewId(null);stop();}else{setPreviewId(id);play(id);}};
 return {status,previewId,preview,stopPreview:()=>{setPreviewId(null);stop();},retry:()=>{if(desiredRef.current)play(desiredRef.current);},play,stop};
}
