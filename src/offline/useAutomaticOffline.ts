import {useEffect,useRef,useState,useCallback} from 'react';
import type {ScopedStorage} from '../family/context';
import {prepareAssets} from './prepare';
export function useAutomaticOffline(storage:ScopedStorage){
 const [status,setStatus]=useState(navigator.onLine?'正在自動準備離線資料…':'離線使用中・僅可使用已下載內容');
 const [busy,setBusy]=useState(false);
 const running=useRef(false),pending=useRef(false);
 const prepare=useCallback(async(force=false)=>{
  if(!navigator.onLine||document.hidden)return;
  if(running.current){pending.current=true;return;}
  running.current=true;setBusy(true);setStatus('正在自動準備離線資料…');
  try{
   // A failed photo request must not prevent the public package downloading.
   const results=await Promise.allSettled([storage.prepareOffline?.(),prepareAssets(setStatus,force)]);
   if(results.some(result=>result.status==='rejected'))throw Error('offline_incomplete');
   setStatus('已可離線使用・音樂需先連網播放下載');
  }catch{setStatus('離線準備未完成・連網時會自動重試');}
  finally{running.current=false;setBusy(false);if(pending.current){pending.current=false;void prepare();}}
 },[storage]);
 useEffect(()=>{
  const run=()=>{void prepare();};
  const changed=(event:Event)=>{if((event as CustomEvent).detail===storage)run();};
  const first=setTimeout(run,0),timer=setInterval(run,60000);
  window.addEventListener('holton-offline-changed',changed);window.addEventListener('pageshow',run);
  window.addEventListener('online',run);document.addEventListener('visibilitychange',run);
  return()=>{window.removeEventListener('holton-offline-changed',changed);window.removeEventListener('pageshow',run);clearTimeout(first);clearInterval(timer);window.removeEventListener('online',run);document.removeEventListener('visibilitychange',run);};
 },[prepare]);
 return {status,busy,retry:()=>void prepare(true)};
}
