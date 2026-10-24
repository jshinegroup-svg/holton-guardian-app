import PasswordInput from './PasswordInput';
import {useFamilyStorage} from './family/context';
import React,{useEffect,useRef,useState} from 'react';
import {Modal,View,Text,Pressable,ScrollView,Platform,TextInput} from 'react-native';
import {hasParentPin,normalizeParentPin,recoveryCode,saveParentPin,verifyParentPin} from './lib/parentLock';
export function ParentPinGate({visible,onConfirm,onCancel,change=false}:{visible:boolean;onConfirm:()=>void;onCancel:()=>void;change?:boolean}){
 const {pinKey}=useFamilyStorage();
 const valueInput=useRef<TextInput|null>(null),repeatInput=useRef<TextInput|null>(null);
 // Password managers may fill the DOM without emitting React's input event.
 const entered=(ref:React.RefObject<TextInput|null>,fallback:string)=>{const node=ref.current as unknown as {value?:unknown}|null;return Platform.OS==='web'&&typeof node?.value==='string'?node.value:fallback;};
 const [mode,setMode]=useState<'loading'|'verify'|'setup'|'recovery'|'keep'>('loading');
 const [value,setValue]=useState(''),[repeat,setRepeat]=useState(''),[code,setCode]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 useEffect(()=>{let live=true;if(visible){setMode('loading');setValue('');setRepeat('');setCode('');setNotice('');void hasParentPin(pinKey).then(exists=>{if(live)setMode(exists?'verify':'setup');}).catch(()=>{if(live)setNotice('無法讀取家長鎖，請勿清除瀏覽器資料。');});}return()=>{live=false;};},[visible,pinKey]);
 const act=async()=>{if(lock.current)return;const submitted=mode==='keep'?value:entered(valueInput,value),confirmed=entered(repeatInput,repeat);lock.current=true;setBusy(true);setNotice('');try{
 if(mode==='setup'){if(!/^\d{6}$/.test(normalizeParentPin(submitted))||normalizeParentPin(submitted)!==normalizeParentPin(confirmed))throw Error('請輸入兩次相同的 6 位數字。');setValue(normalizeParentPin(submitted));setRepeat('');setCode(recoveryCode());setMode('keep');}
 else if(mode==='keep'){await saveParentPin(value,code,pinKey);setValue('');setRepeat('');setCode('');onConfirm();}
 else if(await verifyParentPin(submitted,mode==='recovery',pinKey)){setValue('');if(mode==='recovery'||change)setMode('setup');else onConfirm();}
 else throw Error(mode==='recovery'?'復原碼不正確。':'家長密碼不正確。');
 }catch(e){setNotice(e instanceof Error?e.message:'操作失敗，請再試一次。');}finally{lock.current=false;setBusy(false);}};
 const button=(label:string,fn:()=>void)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={fn} style={{padding:15,backgroundColor:'#086b80',borderRadius:14,marginTop:12}}><Text style={{color:'#fff',textAlign:'center',fontSize:18}}>{label}</Text></Pressable>;
 const input=(label:string,v:string,fn:(v:string)=>void)=><PasswordInput inputRef={label==='再次輸入家長密碼'?repeatInput:valueInput} editable={!busy} autoCapitalize="none" autoCorrect={false} key={`${label}-${visible}-${mode}`} resetKey={`${visible}-${mode}`} accessibilityLabel={label} placeholder={label} placeholderTextColor="#9db6bd" autoComplete="off" value={v} onChangeText={fn} keyboardType={mode==='recovery'?'default':'number-pad'} maxLength={64} style={{fontSize:18,color:'#fff',borderColor:'#c3a65c',borderWidth:1,padding:14,borderRadius:12,marginTop:12}}/>;
 return <Modal visible={visible} transparent onRequestClose={()=>!busy&&onCancel()}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.8)',justifyContent:'center',padding:20}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center'}}><View testID="parent-pin-gate" style={{width:'100%',maxWidth:440,padding:24,backgroundColor:'#082b3d',borderRadius:20}}><Text style={{color:'#fff0b3',fontSize:24,fontWeight:'bold'}}>{mode==='setup'?'設定家長密碼':mode==='keep'?'請保管家長復原碼':mode==='recovery'?'使用復原碼':'家長小屋解鎖'}</Text><Text style={{color:'#d5e5e9',marginTop:12}}>此密碼僅儲存在目前瀏覽器，不會隨家庭進度同步。請使用設定密碼時的瀏覽器，並由家長操作。</Text>
 {mode==='verify'||mode==='setup'||mode==='recovery'?input(mode==='recovery'?'家長復原碼':'6 位數家長密碼',value,setValue):null}
 {mode==='setup'?input('再次輸入家長密碼',repeat,setRepeat):null}
 {mode==='keep'?<><Text selectable style={{color:'#fff',fontSize:18,marginTop:18}}>{code}</Text><Text style={{color:'#d5e5e9',marginTop:12}}>請存入家長自己的密碼管理工具。忘記 PIN 時可用這組碼重新設定，不會清除孩子進度。這裡只顯示一次。</Text></>:null}
 {notice?<Text accessibilityRole="alert" style={{color:'#ffd0b0',marginTop:12}}>{notice}</Text>:null}
 {mode!=='loading'?button(mode==='keep'?'已妥善保存，啟用家長密碼':mode==='setup'?'繼續設定':'確認',()=>void act()):null}
 {mode==='verify'?button('忘記密碼，使用復原碼',()=>{setValue('');setMode('recovery');setNotice('');}):null}
 {button('取消，回到原畫面',onCancel)}
 </View></ScrollView></View></Modal>;
}
