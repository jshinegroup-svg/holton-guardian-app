import React,{useEffect,useState} from 'react';
import {AppState,Pressable,Text,TextInput,View,type TextInputProps} from 'react-native';
export default function PasswordInput({resetKey,...props}:TextInputProps&{resetKey?:string}){
 const [shown,setShown]=useState(false);
 useEffect(()=>setShown(false),[resetKey]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{if(s!=='active')setShown(false);});const hide=()=>{if(document.hidden)setShown(false);};if(typeof document!=='undefined')document.addEventListener('visibilitychange',hide);return()=>{sub.remove();if(typeof document!=='undefined')document.removeEventListener('visibilitychange',hide);};},[]);
 return <View style={{position:'relative'}}><TextInput {...props} secureTextEntry={!shown} style={[props.style,{paddingRight:80}]}/><Pressable accessibilityRole="button" accessibilityLabel={`${shown?'隱藏':'顯示'}${props.accessibilityLabel??'密碼'}`} accessibilityState={{checked:shown}} onPress={()=>setShown(v=>!v)} style={{position:'absolute',right:4,top:4,bottom:4,minWidth:64,minHeight:44,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff0c1',fontSize:14}}>👁 {shown?'隱藏':'顯示'}</Text></Pressable></View>;
}
