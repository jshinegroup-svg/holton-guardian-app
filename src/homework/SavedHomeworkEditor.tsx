import React,{useState} from 'react';
import {View} from 'react-native';
import {Text,TextInput} from '../i18n/ui';
import {useLocale} from '../i18n/locale';
import {useFamilyStorage} from '../family/context';
import type {LightState} from '../LightApp';
import {homework,editSavedHomework} from './model';
type Props={state:LightState;date:string;change:(fn:(s:LightState)=>LightState)=>Promise<boolean>;button:(label:string,fn:()=>void,secondary?:boolean,disabled?:boolean)=>React.ReactNode;onClose:()=>void;onSaved:(date:string)=>void};
export default function SavedHomeworkEditor({state,date,change,button,onClose,onSaved}:Props){
 const {locale}=useLocale(),tr=(zh:string,en:string)=>locale==='en'?en:zh,{storage}=useFamilyStorage();
 const [original]=useState(()=>structuredClone(homework(state).days[date]));
 const [target,setTarget]=useState(date),[items,setItems]=useState(()=>original.tasks.map(({id,title,detail})=>({id,title,detail}))),[review,setReview]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const panel={padding:12,gap:8,borderWidth:1,borderColor:'#bca568',borderRadius:12,backgroundColor:'#102f40'},text={color:'#fff0c1',fontSize:16},input={color:'#fff',backgroundColor:'#173d50',padding:10,borderRadius:8,fontSize:16};
 const occupied=target!==date&&!!homework(state).days[target]?.tasks.length;
 const invalid=!target||occupied||items.some(t=>!t.title.trim()||t.title.length>80||t.detail.length>1000);
 async function save(){
  if(busy||invalid)return;setBusy(true);setError('');let applied=false;
  try{
   // Copy local reference before the cloud move, retaining the original as a fallback.
   if(target!==date){const source=await storage.getItem(`homework-photo:${date}`),existing=await storage.getItem(`homework-photo:${target}`);if(source&&existing&&source!==existing){setError(tr('目標日期已有不同照片，請先核對；尚未搬移功課。','The target date has a different photo. Review it first; homework was not moved.'));return}if(source&&!existing)await storage.setItem(`homework-photo:${target}`,source)}
   const ok=await change(s=>{const next=editSavedHomework(s,date,target,original,items);applied=next!==s;return next});
   if(ok&&applied)onSaved(target);else setError(tr('尚未完成修改。資料可能已更新、日期已有功課或正在計時；請返回核對，原資料不會被覆蓋。','Not saved. Data may have changed, the date may be occupied, or a timer is running. Go back and review; existing data is not overwritten.'));
  }catch{setError(tr('保存失敗，請重試。原功課保留。','Could not save. Original homework is retained.'))}finally{setBusy(false)}
 }
 return <View style={{gap:12}}><Text style={[text,{fontSize:22,fontWeight:'700'}]}>{tr('編輯已保存功課','Edit saved homework')}</Text><Text style={text}>{tr('修改日期或辨識錯字，不需重新辨識。完成狀態與已獲得的獎勵保留。','Correct dates or recognition errors without scanning again. Completion status and earned rewards are retained.')}</Text>
 <label style={{color:'#fff'}}> {tr('保存到日期','Save to date')} <input aria-label={tr('修改功課日期','Edit homework date')} type="date" value={target} disabled={busy||review||!!original.claimedAt} onChange={e=>setTarget(e.target.value)} style={{maxWidth:'100%',background:'#102f40',color:'#fff',colorScheme:'dark',padding:8,fontSize:16}}/></label>
 {original.claimedAt?<Text style={text}>{tr('這天已領獎，可更正文字；日期維持不變，避免重複領獎。','This day was rewarded. Text can be corrected; the date remains locked to prevent duplicate rewards.')}</Text>:null}
 {occupied?<Text accessibilityRole="alert" style={text}>{tr('該日期已有功課，先不覆蓋或合併。請選其他日期，或返回該日編輯。','That date already has homework. Nothing will be overwritten or merged. Choose another date or edit that day instead.')}</Text>:null}
 {items.map((item,i)=><View key={item.id} style={panel}><Text style={text}>{tr('原內容：','Original: ')}{original.tasks[i].title} · {original.tasks[i].detail||'—'}</Text>{review?<Text style={text}>{tr('修改後：','Updated: ')}{item.title} · {item.detail||'—'}</Text>:<><TextInput accessibilityLabel={tr(`第${i+1}項科目`,`Task ${i+1} subject`)} value={item.title} maxLength={80} editable={!busy} onChangeText={title=>setItems(v=>v.map(t=>t.id===item.id?{...t,title}:t))} style={input}/><TextInput accessibilityLabel={tr(`第${i+1}項內容`,`Task ${i+1} details`)} value={item.detail} maxLength={1000} multiline editable={!busy} onChangeText={detail=>setItems(v=>v.map(t=>t.id===item.id?{...t,detail}:t))} style={input}/></>}</View>)}
 {error?<Text accessibilityRole="alert" style={text}>{error}</Text>:null}
 {review?<><Text style={text}>{tr(`確認將${items.length}項功課由 ${date} 保存至 ${target}。`,`Confirm saving ${items.length} tasks from ${date} to ${target}.`)}</Text>{button(tr(busy?'保存中…':'確認保存修改',busy?'Saving…':'Confirm changes'),()=>void save(),false,busy||invalid)}{button(tr('返回修改','Back to editing'),()=>setReview(false),true,busy)}</>:button(tr('預覽修改','Review changes'),()=>setReview(true),false,invalid||busy)}
 {button(tr('取消修改','Cancel changes'),onClose,true,busy)}
 </View>;
}
