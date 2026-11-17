import {photoStore} from '../offline/photoStore';
import {offline,transportFailure} from './connectivity';
import {NotebookRepository} from '../homework/notebookRepository';
import {notebookCloud} from '../homework/notebookCloud';
import {cloudRequest,syncErrorMessage} from './cloudRequest';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './publicConfig';
import {ProgressRepository,type FamilyCloud} from './progressRepository';
import type {ChildProfile,ChildSave} from './types';
import type {ScopedStorage} from './context';
// Capture metadata before the SDK consumes the callback; never retain URL credentials.
const params=typeof location==='undefined'?new URLSearchParams():new URLSearchParams(location.search);
const fragment=typeof location==='undefined'?new URLSearchParams():new URLSearchParams(location.hash.slice(1));
export const authCallback={
 recovery:params.get('auth')==='recovery'||fragment.get('type')==='recovery',
 code:params.has('code'),
 error:fragment.has('error')||fragment.has('error_code')||params.has('error'),
};
export function clearAuthCallback(){if(typeof history!=='undefined'){const url=new URL(location.href);for(const key of ['auth','code','error','error_code','error_description'])url.searchParams.delete(key);url.hash='';history.replaceState(null,'',url.pathname+url.search);}}
export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{storage:AsyncStorage,storageKey:'holton-family-v2-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:authCallback.code?'pkce':'implicit'}});
export async function getFamily(userId:string){
 try{
 if(offline()){const cached=await AsyncStorage.getItem('offline-family::'+userId);if(!cached)throw Error('offline_not_prepared');return cached;}
 const {data,error}=await cloudRequest(signal=>supabase.from('families').select('id').eq('owner_id',userId).abortSignal(signal).maybeSingle());if(error)throw error;if(data){await AsyncStorage.setItem('offline-family::'+userId,data.id);return data.id as string;}
 const added=await cloudRequest(signal=>supabase.from('families').insert({owner_id:userId}).select('id').abortSignal(signal).single());
 if(added.error){const again=await cloudRequest(signal=>supabase.from('families').select('id').eq('owner_id',userId).abortSignal(signal).single());if(again.error)throw added.error;await AsyncStorage.setItem('offline-family::'+userId,again.data.id);return again.data.id as string;}
 await AsyncStorage.setItem('offline-family::'+userId,added.data.id);return added.data.id as string;
 }catch(e){const cached=await AsyncStorage.getItem('offline-family::'+userId);if(cached&&transportFailure(e))return cached;throw e;}
}
export async function listChildren(familyId:string):Promise<ChildProfile[]>{
 try{
 if(offline()){const cached=await AsyncStorage.getItem('offline-children::'+familyId);if(!cached)throw Error('offline_not_prepared');return JSON.parse(cached);}
 const {data,error}=await cloudRequest(signal=>supabase.from('children').select('*').eq('family_id',familyId).order('created_at').abortSignal(signal));if(error)throw error;
 const kids=data.map(c=>({id:c.id,familyId:c.family_id,nickname:c.nickname,ageYears:c.age_years,ageRecordedAt:c.age_recorded_at}));
 await AsyncStorage.setItem('offline-children::'+familyId,JSON.stringify(kids));return kids;
 }catch(e){const cached=await AsyncStorage.getItem('offline-children::'+familyId);if(cached&&transportFailure(e))return JSON.parse(cached);throw e;}
}
export const cloud:FamilyCloud={
 async load<T>(childId:string){const {data,error}=await cloudRequest(signal=>supabase.from('child_saves').select('*').eq('child_id',childId).abortSignal(signal).maybeSingle());if(error)throw error;return data?{childId:data.child_id,familyId:data.family_id,revision:data.revision,state:data.state as T,updatedAt:data.updated_at} satisfies ChildSave<T>:null;},
 async save(p){const {data,error}=await cloudRequest(signal=>supabase.rpc('save_child_progress',{p_child_id:p.childId,p_expected_revision:p.expectedRevision,p_operation_id:p.operationId,p_state:p.state,p_events:p.events}).abortSignal(signal));if(error)throw error;return data;}
};
export function makeChildStorage(child:ChildProfile,onSync:(message:string)=>void):ScopedStorage {
 const repo=new ProgressRepository<Record<string,unknown>>(child.familyId,child.id,photoStore(''),cloud,()=>crypto.randomUUID());
 const prefix=`holton-family-v2::${child.familyId}::${child.id}::`;
 const notebooks=new NotebookRepository(photoStore(prefix),notebookCloud(supabase,child.id));
 const offlineChanged=()=>window.dispatchEvent(new CustomEvent('holton-offline-changed',{detail:guarded}));
 let syncConflict=false;
 let previous:Record<string,unknown>|null=null;
 const status=async()=>onSync(offline()?'離線使用中・進度已存本機':(await repo.hasPending()||await notebooks.hasPending())?'進度已存本機・待同步（含獎勵）':'雲端已同步');
 const store:ScopedStorage={
 async prepareOffline(){
  await notebooks.flush();await repo.retry();const saved=await repo.localState();
  if(!saved)throw Error('請先開啟這位孩子的功課，再下載。');
  const days=(saved as any)?.homework?.days??{};
  for(const date of Object.keys(days)){await notebooks.read(date,true);}
 },
 async sync(){if(offline()){await status();return;}if(syncConflict)return;try{await notebooks.flush();await repo.retry();await status();}catch(e){if(transportFailure(e))await status();else {syncConflict=true;onSync(syncErrorMessage(e));}}},
 async useCloud(){await repo.useCloud();previous=null;syncConflict=false;},
 async getItem(key){
  if(key.startsWith('homework-photo:'))return notebooks.read(key.slice('homework-photo:'.length));
  if(key!=='holton-guardian-app::light-v1')return AsyncStorage.getItem(prefix+key);
  try{let saved=await repo.load();
  if(saved?.pending&&!offline()){try{await repo.retry();saved=await repo.load();}catch(e){if(!transportFailure(e))throw e;}}
  previous=saved?.state??null;await status();offlineChanged();return previous?JSON.stringify(previous):null;}catch(e){onSync(syncErrorMessage(e));throw e;}
 },
 async setItem(key,value){
  if(key.startsWith('homework-photo:')){await notebooks.write(key.slice('homework-photo:'.length),value);await status();offlineChanged();return;}
  if(key!=='holton-guardian-app::light-v1')return AsyncStorage.setItem(prefix+key,value);
  const next=JSON.parse(value);const events:import('./types').FamilyEvent[]=[];const at=new Date().toISOString();
  if(next.phase==='active'&&previous?.phase==='preparing'){
   next.familyTaskId=crypto.randomUUID();events.push({id:crypto.randomUUID(),kind:'task_started',occurredAt:at,taskId:next.familyTaskId,cardId:next.cardId,plannedSeconds:next.minutes*60});
  }else if(previous?.familyTaskId)next.familyTaskId=previous.familyTaskId;
  if(next.phase==='done'&&next.taskOutcome==='unfinished'&&(previous?.phase==='active'||previous?.phase==='finishing'))events.push({id:crypto.randomUUID(),kind:'task_cancelled',occurredAt:at,taskId:next.familyTaskId,cardId:next.cardId,plannedSeconds:next.minutes*60,elapsedSeconds:Math.floor((next.focusElapsedMs??0)/1000)});
  if(next.phase==='done'&&next.taskOutcome!=='unfinished'&&previous?.phase==='finishing')events.push({id:crypto.randomUUID(),kind:'task_completed',occurredAt:at,taskId:next.familyTaskId,cardId:next.cardId,plannedSeconds:next.minutes*60,elapsedSeconds:Math.floor((next.focusElapsedMs??0)/1000),earlyFinish:!!next.allowEarlyFinish&&(next.focusElapsedMs??0)<next.minutes*60000});
  if(previous&&next.companionCardId!==previous.companionCardId&&next.companionCardId)events.push({id:crypto.randomUUID(),kind:'card_selected',occurredAt:at,cardId:next.companionCardId});
  if(previous&&next.cardId!==previous.cardId&&next.cardId)events.push({id:crypto.randomUUID(),kind:'card_selected',occurredAt:at,cardId:next.cardId});
  onSync(offline()?'離線使用中・進度已存本機':'正在儲存到雲端…');
  const homeworkChanged=JSON.stringify(next.homework?.days)!==JSON.stringify((previous as any)?.homework?.days);
  try{await repo.save(next,events);previous=next;await status();if(homeworkChanged)offlineChanged();}
  catch(e){onSync(syncErrorMessage(e));throw e;}
 },
 async removeItem(key){if(key==='holton-guardian-app::light-v1')throw Error('Protected child save');return AsyncStorage.removeItem(prefix+key);}
 };
 // Coordinate every read/write/flush across tabs as well as this instance.
 const guarded={} as ScopedStorage;
 for(const name of Object.keys(store) as (keyof ScopedStorage)[]){
  const fn=store[name] as (...args:any[])=>Promise<any>;
  (guarded as any)[name]=(...args:any[])=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request(prefix+'save',()=>fn(...args)):fn(...args);
 }
 return guarded;
}
