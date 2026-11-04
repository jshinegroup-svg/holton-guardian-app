import {t,useLocale} from './i18n/locale';
import React,{useEffect,useRef,useState,type Ref} from 'react';
import {AppState,View,type TextInputProps} from 'react-native';
import {Pressable,Text,TextInput} from './i18n/ui';
export default function PasswordInput({resetKey,inputRef,...props}:TextInputProps&{resetKey?:string;inputRef?:Ref<TextInput>}){
 useLocale();
 const field=useRef<TextInput|null>(null);
 const [shown,setShown]=useState(false);
 useEffect(()=>setShown(false),[resetKey]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{if(s!=='active')setShown(false);});const hide=()=>{if(document.hidden)setShown(false);};if(typeof document!=='undefined')document.addEventListener('visibilitychange',hide);return()=>{sub.remove();if(typeof document!=='undefined')document.removeEventListener('visibilitychange',hide);};},[]);
 return <View style={{position:'relative'}}><TextInput ref={node=>{field.current=node;if(typeof inputRef==='function')inputRef(node);else if(inputRef)inputRef.current=node;}} {...props} secureTextEntry={!shown} style={[props.style,{paddingRight:80}]}/><Pressable accessibilityRole="button" accessibilityLabel={`${t(shown?'隱藏':'顯示')}${t('顯示')==='Show'?' ':''}${t(props.accessibilityLabel??'密碼')}`} accessibilityState={{checked:shown}} onPress={()=>{const node=field.current as unknown as {value?:unknown}|null;if(typeof node?.value==='string'&&node.value!==props.value)props.onChangeText?.(node.value);setShown(v=>!v);}} style={{position:'absolute',right:4,top:4,bottom:4,minWidth:64,minHeight:44,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff0c1',fontSize:14}}>👁 {shown?'隱藏':'顯示'}</Text></Pressable></View>;
}
