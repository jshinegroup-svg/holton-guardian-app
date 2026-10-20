import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
export const CHILD_NAME_LIMIT = 20;
export function normalizeChildName(value:unknown):string {
  return typeof value==='string'?Array.from(value.replace(/\s+/g,' ').trim()).slice(0,CHILD_NAME_LIMIT).join(''):'';
}
export function ChildNameInput({value,onChange,busy=false}:{value:string;onChange:(value:string)=>void;busy?:boolean}) {
  return <><Text style={s.label}>名字／暱稱（選填）</Text><TextInput accessibilityLabel="小朋友名字或暱稱" value={value} onChangeText={onChange} editable={!busy} maxLength={40} autoCorrect={false} autoCapitalize="none" placeholder="例如：小宇、Holton" placeholderTextColor="#a9c6ce" style={s.input}/><Text style={s.note}>可以用暱稱，最多 20 個字。不填也能開始冒險。</Text></>;
}
export default function ChildProfile({name,busy,onSave}:{name?:string;busy:boolean;onSave:(name:string)=>Promise<boolean>}) {
  const [draft,setDraft]=useState(name??'');const [saved,setSaved]=useState(false);
  const preview=normalizeChildName(draft);
  return <View testID="child-profile" style={s.panel}><Text style={s.title}>小朋友資料</Text><ChildNameInput value={draft} busy={busy} onChange={v=>{setDraft(v);setSaved(false);}}/><Text style={s.note}>村莊首頁會顯示</Text><Text testID="child-name-preview" style={s.preview}>{preview?`${preview}的冒險村莊`:'冒險村莊'}</Text><Pressable accessibilityRole="button" accessibilityLabel="儲存小朋友名字" disabled={busy} onPress={()=>{void onSave(preview).then(ok=>{if(ok){setDraft(preview);setSaved(true);}});}} style={[s.button,busy&&{opacity:.5}]}><Text style={s.label}>儲存名字</Text></Pressable>{saved?<Text accessibilityLiveRegion="polite" style={s.note}>已儲存，點數與冒險進度不變。</Text>:null}<Text style={s.note}>想取消名字，清空後再儲存即可。</Text></View>;
}
const s=StyleSheet.create({panel:{gap:12,padding:18,borderRadius:22,borderWidth:1,borderColor:'#c7ae7d',backgroundColor:'#113848'},title:{fontSize:23,fontWeight:'800',color:'#ffe6a8'},label:{fontSize:17,fontWeight:'700',color:'#fff0c5'},input:{borderWidth:1,borderColor:'#93aeb1',borderRadius:10,color:'#fff',fontSize:18,padding:12},note:{fontSize:14,lineHeight:23,color:'#cadfdf'},preview:{fontSize:25,lineHeight:36,fontWeight:'800',color:'#fff0c5'},button:{minHeight:48,padding:12,alignItems:'center',justifyContent:'center',borderRadius:13,borderWidth:1,borderColor:'#bca879',backgroundColor:'#17586a'}});
