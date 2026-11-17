import AsyncStorage from '@react-native-async-storage/async-storage';
let database:Promise<IDBDatabase>|undefined;
function db(){return database??=new Promise((resolve,reject)=>{const r=indexedDB.open('holton-offline-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export function photoStore(prefix:string){return {
 async getItem(key:string):Promise<string|null>{
  if(typeof indexedDB==='undefined')return AsyncStorage.getItem(prefix+key);
  const d=await db();const value=await new Promise<string|null>((resolve,reject)=>{const r=d.transaction('photos').objectStore('photos').get(prefix+key);r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);});
  return value??await AsyncStorage.getItem(prefix+key);
 },
 async setItem(key:string,value:string){
  if(typeof indexedDB==='undefined')return AsyncStorage.setItem(prefix+key,value);
  const d=await db();await new Promise<void>((resolve,reject)=>{const t=d.transaction('photos','readwrite');t.objectStore('photos').put(value,prefix+key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error??Error('photo_storage_failed'));});
 }
};}
