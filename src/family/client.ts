import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './publicConfig';
import {ProgressRepository,type FamilyCloud} from './progressRepository';
import type {ChildProfile,ChildSave} from './types';
import type {ScopedStorage} from './context';
export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{storage:AsyncStorage,storageKey:'holton-family-v2-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
export async function getFamily(userId:string){
 const {data,error}=await supabase.from('families').select('id').eq('owner_id',userId).maybeSingle();if(error)throw error;if(data)return data.id as string;
 const added=await supabase.from('families').insert({owner_id:userId}).select('id').single();
 if(added.error){const again=await supabase.from('families').select('id').eq('owner_id',userId).single();if(again.error)throw added.error;return again.data.id as string;}
 return added.data.id as string;
}
export async function listChildren(familyId:string):Promise<ChildProfile[]>{
 const {data,error}=await supabase.from('children').select('*').eq('family_id',familyId).order('created_at');if(error)throw error;
 return data.map(c=>({id:c.id,familyId:c.family_id,nickname:c.nickname,ageYears:c.age_years,ageRecordedAt:c.age_recorded_at}));
}
export const cloud:FamilyCloud={
 async load<T>(childId:string){const {data,error}=await supabase.from('child_saves').select('*').eq('child_id',childId).maybeSingle();if(error)throw error;return data?{childId:data.child_id,familyId:data.family_id,revision:data.revision,state:data.state as T,updatedAt:data.updated_at} satisfies ChildSave<T>:null;},
 async save(p){const {data,error}=await supabase.rpc('save_child_progress',{p_child_id:p.childId,p_expected_revision:p.expectedRevision,p_operation_id:p.operationId,p_state:p.state,p_events:p.events});if(error)throw error;return data;}
};
export function makeChildStorage(child:ChildProfile,onSync:(message:string)=>void):ScopedStorage {
 const repo=new ProgressRepository<Record<string,unknown>>(child.familyId,child.id,AsyncStorage,cloud,()=>crypto.randomUUID());
 const prefix=`holton-family-v2::${child.familyId}::${child.id}::`;
 let previous:Record<string,unknown>|null=null;
 return {
 async getItem(key){
  if(key!=='holton-guardian-app::light-v1')return AsyncStorage.getItem(prefix+key);
  let saved=await repo.load();
  if(saved?.pending){onSync('正在重試尚未同步的進度…');await repo.retry();saved=await repo.load();}
  previous=saved?.state??null;onSync('雲端已同步');return previous?JSON.stringify(previous):null;
 },
 async setItem(key,value){
  if(key!=='holton-guardian-app::light-v1')return AsyncStorage.setItem(prefix+key,value);
  const next=JSON.parse(value);const events:import('./types').FamilyEvent[]=[];const at=new Date().toISOString();
  if(next.phase==='active'&&previous?.phase==='preparing'){
   next.familyTaskId=crypto.randomUUID();events.push({id:crypto.randomUUID(),kind:'task_started',occurredAt:at,taskId:next.familyTaskId,cardId:next.cardId,plannedSeconds:next.minutes*60});
  }else if(previous?.familyTaskId)next.familyTaskId=previous.familyTaskId;
  if(next.phase==='done'&&previous?.phase==='finishing')events.push({id:crypto.randomUUID(),kind:'task_completed',occurredAt:at,taskId:next.familyTaskId,cardId:next.cardId,plannedSeconds:next.minutes*60,elapsedSeconds:Math.floor((next.focusElapsedMs??0)/1000),earlyFinish:!!next.allowEarlyFinish&&(next.focusElapsedMs??0)<next.minutes*60000});
  if(previous&&next.companionCardId!==previous.companionCardId&&next.companionCardId)events.push({id:crypto.randomUUID(),kind:'card_selected',occurredAt:at,cardId:next.companionCardId});
  if(previous&&next.cardId!==previous.cardId&&next.cardId)events.push({id:crypto.randomUUID(),kind:'card_selected',occurredAt:at,cardId:next.cardId});
  onSync('正在儲存到雲端…');
  try{await repo.save(next,events);previous=next;onSync('雲端已同步');}
  catch(e){onSync('尚未同步，請重新開啟此孩子重試；不要清除資料。');throw e;}
 },
 async removeItem(key){if(key==='holton-guardian-app::light-v1')throw Error('Protected child save');return AsyncStorage.removeItem(prefix+key);}
 };
}
