import React from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import EnergyAmount from './EnergyAmount';
import {DEFAULT_CUSTOM_MINUTES,parseCustomMinutes,rewardForMinutes} from './lib/taskTime';

export const customTimeImage=require('../assets/cards/custom/master-mode-legendary.jpg');

export default function CustomTimeCard({draft,onChange,onApply,disabled}:{draft:string;onChange:(text:string)=>void;onApply:()=>void;disabled:boolean}){
 const minutes=parseCustomMinutes(draft);
 const step=(delta:number)=>onChange(String(Math.max(1,Math.min(60,(minutes??DEFAULT_CUSTOM_MINUTES)+delta))));
 const control=(label:string,symbol:string,delta:number,locked:boolean)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled||locked} onPress={()=>step(delta)} style={[s.step,(disabled||locked)&&{opacity:.4}]}><Text style={s.symbol}>{symbol}</Text></Pressable>;
 return <View testID="custom-time-card" style={s.card}>
  <Text style={s.title}>自訂時間</Text><Text style={s.caption}>我來決定今天的步調</Text>
  <View style={s.controls}>{control('自訂時間減少 1 分鐘','−',-1,minutes===1)}
   <TextInput testID="custom-time-input" accessibilityLabel="自訂時間（分鐘）" value={draft} onChangeText={onChange} keyboardType="number-pad" editable={!disabled} selectTextOnFocus maxLength={3} style={s.input}/>
   {control('自訂時間增加 1 分鐘','＋',1,minutes===60)}
  </View>
  <Text style={s.caption}>分鐘 · 可設定 1～60 分鐘</Text>
  {minutes===null?<Text accessibilityRole="alert" style={s.error}>請輸入 1～60 的整數</Text>:<Text style={s.reward}>完成 <EnergyAmount kind="gain" value={rewardForMinutes(minutes)} size={18}/></Text>}
  <Pressable accessibilityRole="button" accessibilityLabel="用這個時間" disabled={disabled||minutes===null} onPress={onApply} style={[s.apply,(disabled||minutes===null)&&{opacity:.4}]}><Text style={s.applyText}>用這個時間</Text></Pressable>
 </View>;
}
const s=StyleSheet.create({
 card:{width:'100%',maxWidth:320,alignSelf:'center',marginHorizontal:3,paddingHorizontal:14,paddingVertical:12,borderWidth:3,borderColor:'#d5b976',borderRadius:22,backgroundColor:'#103b50',alignItems:'center',justifyContent:'center',gap:7},
 title:{fontSize:23,fontWeight:'800',color:'#ffe6a5'},caption:{fontSize:12,color:'#c9e3e8',textAlign:'center'},clock:{fontSize:36,lineHeight:40,color:'#60dfeb'},
 controls:{flexDirection:'row',alignItems:'center',gap:3,width:'100%',justifyContent:'center'},step:{width:44,height:44,borderRadius:12,borderWidth:1,borderColor:'#baa371',backgroundColor:'#16495f',alignItems:'center',justifyContent:'center'},symbol:{fontSize:25,color:'#fff0c1'},
 input:{flex:1,minWidth:38,maxWidth:70,height:48,textAlign:'center',fontSize:28,fontWeight:'800',color:'#fff0c1',borderBottomWidth:2,borderBottomColor:'#64d7dd',padding:0},
 reward:{color:'#ffe6a5',fontSize:16,fontWeight:'700'},error:{color:'#ffd7ac',fontSize:12,textAlign:'center'},apply:{minHeight:44,width:'100%',justifyContent:'center',alignItems:'center',backgroundColor:'#08748a',borderWidth:1,borderColor:'#d5b976',borderRadius:12},applyText:{fontSize:17,fontWeight:'700',color:'#fff0c1'},
});
