import {useSyncExternalStore} from 'react';
import {english} from './en';
import {patterns} from './patterns';
export type Locale='zh-TW'|'en';
export const LOCALE_KEY='holton-family-v2::interface-language';
const read=():Locale=>{try{return globalThis.localStorage?.getItem(LOCALE_KEY)==='en'?'en':'zh-TW';}catch{return 'zh-TW';}};
let locale:Locale=read();
const listeners=new Set<()=>void>();
export const getLocale=()=>locale;
export function setLocale(next:Locale){locale=next;try{globalThis.localStorage?.setItem(LOCALE_KEY,next);}catch{/* Language remains usable without storage. */}if(typeof document!=='undefined')document.documentElement.lang=next;listeners.forEach(fn=>fn());}
export function useLocale(){const value=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},getLocale,()=> 'zh-TW' as Locale);return {locale:value,setLocale};}
if(typeof window!=='undefined')window.addEventListener('storage',event=>{if(event.key===LOCALE_KEY){locale=read();document.documentElement.lang=locale;listeners.forEach(fn=>fn());}});
if(typeof document!=='undefined')document.documentElement.lang=locale;
/** Exact UI-copy lookup only. Never transforms persisted values or arbitrary substrings. */
export function t(value:string):string{if(locale==='zh-TW')return value;const key=value.trim();const translated=english[key];if(translated!==undefined)return value.replace(key,()=>translated);for(const [pattern,replacement] of patterns){if(pattern.test(key))return value.replace(key,()=>key.replace(pattern,replacement));}if(key.includes(' · ')){const parts=key.split(' · ').map(part=>t(part));return value.replace(key,()=>parts.join(' · '));}return value;}
