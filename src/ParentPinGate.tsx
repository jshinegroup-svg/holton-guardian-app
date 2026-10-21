import React,{useEffect,useRef,useState} from 'react';
import {Modal,View,Text,TextInput,Pressable,ScrollView} from 'react-native';
import {hasParentPin,recoveryCode,saveParentPin,verifyParentPin} from './lib/parentLock';
export function ParentPinGate({visible,onConfirm,onCancel,change=false}:{visible:boolean;onConfirm:()=>void;onCancel:()=>void;change?:boolean}){
 const [mode,setMode]=useState<'loading'|'verify'|'setup'|'recovery'|'keep'>('loading');
 const [value,setValue]=useState(''),[repeat,setRepeat]=useState(''),[code,setCode]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 useEffect(()=>{if(visible){setMode('loading');setValue('');setRepeat('');setCode('');setNotice('');void hasParentPin().then(exists=>setMode(exists?'verify':'setup')).catch(()=>setNotice('無法讀取家長鎖，請勿清除瀏覽器資料。'));}},[visible]);
 const act=async()=>{if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{
 if(mode==='setup'){if(!/^\d{6}$/.test(value)||value!==repeat)throw Error('請輸入兩次相同的 6 位數字。');setCode(recoveryCode());setMode('keep');}
 else if(mode==='keep'){await saveParentPin(value,code);setValue('');setRepeat('');setCode('');onConfirm();}
 else if(await verifyParentPin(value,mode==='recovery')){setValue('');if(mode==='recovery'||change)setMode('setup');else onConfirm();}
 else throw Error(mode==='recovery'?'復原碼不正確。':'家長密碼不正確。');
 }catch(e){setNotice(e instanceof Error?e.message:'操作失敗，請再試一次。');}finally{lock.current=false;setBusy(false);}};
 const button=(label:string,fn:()=>void)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={fn} style={{padding:15,backgroundColor:'#086b80',borderRadius:14,marginTop:12}}><Text style={{color:'#fff',textAlign:'center',fontSize:18}}>{label}</Text></Pressable>;
 const input=(label:string,v:string,fn:(v:string)=>void)=><TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor="#9db6bd" secureTextEntry autoComplete="off" value={v} onChangeText={fn} keyboardType={mode==='recovery'?'default':'number-pad'} maxLength={mode==='recovery'?32:6} style={{fontSize:18,color:'#fff',borderColor:'#c3a65c',borderWidth:1,padding:14,borderRadius:12,marginTop:12}}/>;
 return <Modal visible={visible} transparent onRequestClose={()=>!busy&&onCancel()}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.8)',justifyContent:'center',padding:20}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center'}}><View testID="parent-pin-gate" style={{width:'100%',maxWidth:440,padding:24,backgroundColor:'#082b3d',borderRadius:20}}><Text style={{color:'#fff0b3',fontSize:24,fontWeight:'bold'}}>{mode==='setup'?'設定家長密碼':mode==='keep'?'請保管家長復原碼':mode==='recovery'?'使用復原碼':'家長小屋解鎖'}</Text><Text style={{color:'#d5e5e9',marginTop:12}}>這台裝置專用，與試玩通關密碼不同。請由家長操作，不要告訴孩子。</Text>
 {mode==='verify'||mode==='setup'||mode==='recovery'?input(mode==='recovery'?'家長復原碼':'6 位數家長密碼',value,setValue):null}
 {mode==='setup'?input('再次輸入家長密碼',repeat,setRepeat):null}
 {mode==='keep'?<><Text selectable style={{color:'#fff',fontSize:18,marginTop:18}}>{code}</Text><Text style={{color:'#d5e5e9',marginTop:12}}>請存入家長自己的密碼管理工具。忘記 PIN 時可用這組碼重新設定，不會清除孩子進度。這裡只顯示一次。</Text></>:null}
 {notice?<Text accessibilityRole="alert" style={{color:'#ffd0b0',marginTop:12}}>{notice}</Text>:null}
 {mode!=='loading'?button(mode==='keep'?'已妥善保存，啟用家長密碼':mode==='setup'?'繼續設定':'確認',()=>void act()):null}
 {mode==='verify'?button('忘記密碼，使用復原碼',()=>{setValue('');setMode('recovery');setNotice('');}):null}
 {button('取消，回到原畫面',onCancel)}
 </View></ScrollView></View></Modal>;
}
