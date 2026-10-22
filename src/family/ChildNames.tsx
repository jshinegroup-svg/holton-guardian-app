import React,{useRef,useState} from 'react';
import {View,Text,TextInput,Pressable,Modal} from 'react-native';
import {supabase,listChildren} from './client';
import {validateChildProfile,type ChildProfile} from './types';
type Archived={id:string;nickname:string};
export default function ChildNames({family,children,onSaved}:{family:string;children:ChildProfile[];onSaved:(kids:ChildProfile[])=>void}){
 const [names,setNames]=useState(()=>children.length?children.map(c=>c.nickname):['']);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[editing,setEditing]=useState<number|null>(null),[deleting,setDeleting]=useState<ChildProfile|null>(null),[archived,setArchived]=useState<Archived[]|null>(null);
 const lock=useRef(false),inputs=useRef<(TextInput|null)[]>([]);
 const dirty=names.some((n,i)=>n.trim()!==(children[i]?.nickname??''));
 const button=(label:string,fn:()=>void,danger=false)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={fn} style={{padding:12,minHeight:44,borderWidth:1,borderColor:danger?'#d5a08b':'#a18c59',borderRadius:10,opacity:busy?.5:1}}><Text style={{color:danger?'#ffd2bc':'#fff2cf',textAlign:'center'}}>{label}</Text></Pressable>;
 async function refresh(){const kids=await listChildren(family);setNames(kids.length?kids.map(c=>c.nickname):['']);setEditing(null);onSaved(kids);}
 async function loadArchived(){const {data,error}=await supabase.rpc('list_archived_children');if(error)throw error;setArchived(data??[]);}
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{await action();}catch(e){setNotice(e instanceof Error?e.message:'操作未完成，請確認網路後再試；原有進度保留。');}finally{lock.current=false;setBusy(false);}}
 async function save(){await run(async()=>{
  const values=names.map(n=>n.trim());if(!values.some(Boolean))throw Error('請填寫冒險者名字。');
  values.forEach((name,i)=>{if(name)validateChildProfile(name,children[i]?.ageYears??null);else if(children[i])throw Error('名字不能清空；要移除請按刪除。');});
  if(new Set(values.filter(Boolean)).size!==values.filter(Boolean).length)throw Error('請使用不同的名字，方便辨認。');
  for(let i=0;i<values.length;i++){if(!values[i]||values[i]===children[i]?.nickname)continue;
   const result=children[i]?await supabase.from('children').update({nickname:values[i]}).eq('id',children[i].id).eq('family_id',family):await supabase.from('children').insert({family_id:family,nickname:values[i],age_years:null});
   if(result.error){await refresh();throw Error('尚未全部儲存，請確認名字與網路後再試；已有進度不會刪除。');}
  }
  await refresh();setNotice('名字已儲存，原有進度保留。');
 });}
 function requestDelete(child:ChildProfile){if(dirty){setNotice('請先儲存或取消正在編輯的名字，再刪除冒險者。');return;}setDeleting(child);}
 async function archive(child:Archived,hidden:boolean){await run(async()=>{const {error}=await supabase.rpc('set_child_archived',{p_child_id:child.id,p_archived:hidden});if(error)throw Error('操作未完成，請確認網路；復原時請確認小隊沒有同名冒險者。');await refresh();await loadArchived();setDeleting(null);setNotice(hidden?`已從小隊移除 ${child.nickname}，進度保留，可在下方復原。`:`已復原 ${child.nickname}，原有進度保留。`);});}
 return <View style={{gap:12}}><Text style={{color:'#fff0c1',fontSize:22}}>管理冒險者</Text>{names.map((_,i)=><View key={children[i]?.id??`new-${i}`} style={{gap:8}}><TextInput ref={el=>{inputs.current[i]=el;}} accessibilityLabel={`孩子 ${i+1} 的名字`} placeholder="冒險者名字" placeholderTextColor="#a8bdc5" value={names[i]} maxLength={20} editable={!busy&&(!children[i]||editing===i)} onChangeText={v=>setNames(old=>old.map((n,j)=>j===i?v:n))} style={{borderWidth:1,borderColor:editing===i?'#ffe0a0':'#a18c59',borderRadius:12,padding:14,color:'#fff',fontSize:18}}/><View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{children[i]?<>{button(`編輯 ${children[i].nickname}`,()=>{setEditing(i);setTimeout(()=>inputs.current[i]?.focus(),0);})}{button(`刪除 ${children[i].nickname}`,()=>requestDelete(children[i]),true)}</>:button('取消新增',()=>setNames(old=>old.filter((_,j)=>j!==i)))}</View></View>)}
 <Text style={{color:'#c7e1e7'}}>可以建立多位冒險者，同畫面最多選兩位一起玩。</Text>{button('新增冒險者',()=>setNames(old=>[...old,'']))}{button('儲存名字',()=>void save())}{dirty?button('取消編輯',()=>{setNames(children.length?children.map(c=>c.nickname):['']);setEditing(null);setNotice('');}):null}
 {button('已刪除的冒險者',()=>void run(loadArchived))}{archived?<View style={{gap:8}}>{archived.length?archived.map(c=><View key={c.id}>{button(`復原 ${c.nickname}`,()=>{if(dirty){setNotice('請先儲存或取消編輯。');return;}void archive(c,false);})}</View>):<Text style={{color:'#c7e1e7'}}>沒有已刪除的冒險者。</Text>}</View>:null}
 {notice?<Text accessibilityRole="alert" style={{color:'#ffd2b0'}}>{notice}</Text>:null}
 <Modal visible={!!deleting} transparent onRequestClose={()=>!busy&&setDeleting(null)}><View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,.8)',padding:20}}><View style={{width:'100%',maxWidth:420,padding:20,gap:16,borderRadius:16,backgroundColor:'#103448'}}><Text style={{color:'#fff0c1',fontSize:22}}>刪除 {deleting?.nickname}？</Text><Text style={{color:'#d5e5ea',fontSize:16,lineHeight:24}}>會從冒險小隊移除，進度仍保留。之後可在「已刪除的冒險者」復原。</Text>{button('取消刪除',()=>setDeleting(null))}{button('確認刪除',()=>{if(deleting)void archive(deleting,true);},true)}{notice?<Text accessibilityRole="alert" style={{color:'#ffd2b0'}}>{notice}</Text>:null}</View></View></Modal>
 </View>;
}
