import {useEffect,useRef,useState,useCallback} from 'react';
import type {ScopedStorage} from '../family/context';
import {prepareAssets} from './prepare';
export function useAutomaticOffline(storage:ScopedStorage){
 const [status,setStatus]=useState(navigator.onLine?'正在自動準備離線資料…':'離線使用中・僅可使用已下載內容');
 const [busy,setBusy]=useState(false);
 const running=useRef(false);
 const prepare=useCallback(async(force=false)=>{
  if(running.current||!navigator.onLine||document.hidden)return;
  running.current=true;setBusy(true);setStatus('正在自動準備離線資料…');
  try{
   await storage.prepareOffline?.();
   await prepareAssets(setStatus,force);
   setStatus('已可離線使用・連網時自動更新');
  }catch{setStatus('離線準備未完成・連網時會自動重試');}
  finally{running.current=false;setBusy(false);}
 },[storage]);
 useEffect(()=>{
  const run=()=>{void prepare();};
  const first=setTimeout(run,3000),timer=setInterval(run,60000);
  window.addEventListener('online',run);document.addEventListener('visibilitychange',run);
  return()=>{clearTimeout(first);clearInterval(timer);window.removeEventListener('online',run);document.removeEventListener('visibilitychange',run);};
 },[prepare]);
 return {status,busy,retry:()=>void prepare(true)};
}
