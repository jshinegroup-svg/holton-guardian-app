import React,{useState} from 'react';
import {View,Text,TextInput,Pressable} from 'react-native';
import {supabase,listChildren} from './client';
import {validateChildProfile,type ChildProfile} from './types';
export default function ChildNames({family,children,onSaved}:{family:string;children:ChildProfile[];onSaved:(kids:ChildProfile[])=>void}){
 const [names,setNames]=useState(()=>children.length?children.map(c=>c.nickname):['']);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function save(){if(busy)return;setBusy(true);setNotice('');try{
  const values=names.map(n=>n.trim());if(!values[0])throw Error('請先填第一位孩子的名字。');
  values.forEach((name,i)=>{if(name)validateChildProfile(name,children[i]?.ageYears??null);else if(children[i])throw Error('已有進度的名字不能清空；可以直接修改名字。');});
  if(new Set(values.filter(Boolean)).size!==values.filter(Boolean).length)throw Error('請使用不同的名字，方便辨認。');
  for(let i=0;i<values.length;i++){if(!values[i]||values[i]===children[i]?.nickname)continue;
   const result=children[i]?await supabase.from('children').update({nickname:values[i]}).eq('id',children[i].id).eq('family_id',family):await supabase.from('children').insert({family_id:family,nickname:values[i],age_years:null});
   if(result.error)throw result.error;
  }
  const kids=await listChildren(family);setNames(kids.map(c=>c.nickname));onSaved(kids);setNotice('名字已儲存，原有進度保留。');
 }catch{try{onSaved(await listChildren(family));}catch{}setNotice('尚未全部儲存，請確認名字與網路後再試；已有進度不會刪除。');}finally{setBusy(false);}}
 return <View style={{gap:12}}><Text style={{color:'#fff0c1',fontSize:22}}>管理冒險者</Text>{names.map((_,i)=><TextInput key={i} accessibilityLabel={`孩子 ${i+1} 的名字`} placeholder={i?'冒險者名字':'第一位冒險者'} placeholderTextColor="#a8bdc5" value={names[i]} maxLength={20} editable={!busy} onChangeText={v=>setNames(old=>old.map((n,j)=>j===i?v:n))} style={{borderWidth:1,borderColor:'#a18c59',borderRadius:12,padding:14,color:'#fff',fontSize:18}}/>)}<Text style={{color:'#c7e1e7'}}>可以建立多位冒險者，同畫面最多選兩位一起玩。</Text><Pressable accessibilityRole="button" accessibilityLabel="新增冒險者" disabled={busy} onPress={()=>setNames(old=>[...old,''])} style={{padding:14,borderWidth:1,borderColor:'#a18c59',borderRadius:12}}><Text style={{color:'#fff2cf',textAlign:'center'}}>＋ 新增冒險者</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="儲存名字" disabled={busy} onPress={()=>void save()} style={{padding:14,backgroundColor:'#1b5668',borderRadius:12}}><Text style={{color:'#fff2cf',textAlign:'center'}}>儲存名字</Text></Pressable>{notice?<Text accessibilityRole="alert" style={{color:'#ffd2b0'}}>{notice}</Text>:null}</View>;
}
