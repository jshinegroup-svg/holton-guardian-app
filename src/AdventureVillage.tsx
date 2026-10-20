import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
export type VillageRoom = 'village' | 'mission' | 'wishes' | 'companions';
const destinations = [
  {id:'map', icon:'🌍', title:'冒險地圖', note:'選世界・看旅程', tint:'#8ddbd0'},
  {id:'wishes', icon:'🎁', title:'心願小屋', note:'選心願・換獎勵', tint:'#f8d994'},
  {id:'companions', icon:'🛡️', title:'夥伴小屋', note:'找夥伴・看收藏', tint:'#bfc8ff'},
  {id:'parent', icon:'🏡', title:'家長小屋', note:'訂目標・設獎勵', tint:'#f3bc9f'},
] as const;
export default function AdventureVillage({orbs,world,steps,today,goal,task,onStart,onVisit,saving}:{orbs:number;world:string;steps:number;today:number;goal:number;task:string;onStart:()=>void;onVisit:(place:typeof destinations[number]['id'])=>void;saving:boolean}) {
 return <View testID="adventure-village" style={s.content}>
  <View style={s.welcome}><Text style={s.eyebrow}>你的冒險，從這裡出發</Text><Text accessibilityRole="header" style={s.title}>冒險村莊</Text><Text style={s.subtitle}>每一小步，都有夥伴陪你。</Text></View>
  <View style={s.status}><Text style={s.balance}>✦ {orbs} 能量球</Text><Text style={s.small}>今天 {today}／{goal} 次任務</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel="開始任務" disabled={saving} onPress={onStart} style={({pressed})=>[s.start,pressed&&s.pressed,saving&&{opacity:.5}]}><Text style={s.startTitle}>▶ 開始任務</Text><Text style={s.startNote}>{task || '先選今天想完成的一件小事'}</Text><Text style={s.small}>{world} · 旅程 {steps}／15 步</Text></Pressable>
  <View style={s.grid}>{destinations.map(d=><Pressable key={d.id} accessibilityRole="button" accessibilityLabel={d.title} onPress={()=>onVisit(d.id)} style={({pressed})=>[s.house,{borderColor:d.tint},pressed&&s.pressed]}><Text style={s.icon}>{d.icon}</Text><Text style={s.houseTitle}>{d.title}</Text><Text style={s.note}>{d.note}</Text><Text style={[s.enter,{color:d.tint}]}>進入 →</Text></Pressable>)}</View>
  <Text style={s.footer}>先做一件小事，再回小屋看看。</Text>
 </View>;
}
export function VillageBackdrop(){return <><Image source={require('../assets/worlds/village/village.png')} resizeMode="cover" style={[StyleSheet.absoluteFillObject,{width:'100%',height:'100%'}]} accessibilityLabel="溫暖燈光的森林冒險村莊"/><View pointerEvents="none" style={[StyleSheet.absoluteFillObject,{backgroundColor:'rgba(4,23,34,.22)'}]}/></>;}
const s=StyleSheet.create({content:{gap:16},welcome:{gap:5,paddingTop:6,paddingBottom:8},eyebrow:{fontSize:12,letterSpacing:2,color:'#f1d89e'},title:{fontSize:34,fontWeight:'800',color:'#fff0c9'},subtitle:{fontSize:15,color:'#e2eeee'},status:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,padding:12,borderRadius:14,backgroundColor:'rgba(5,28,39,.82)'},balance:{color:'#ffe5a4',fontSize:16,fontWeight:'700'},small:{fontSize:13,lineHeight:20,color:'#d4e8e6'},start:{gap:6,padding:17,borderRadius:22,borderWidth:1,borderColor:'#ffe1a1',backgroundColor:'rgba(18,77,79,.93)'},startTitle:{fontSize:23,fontWeight:'800',color:'#fff0bc'},startNote:{fontSize:15,lineHeight:22,color:'#f5f4e5'},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},house:{width:'47%',flexGrow:1,minHeight:160,padding:12,borderRadius:22,borderWidth:1,backgroundColor:'rgba(9,34,46,.87)',gap:7},icon:{fontSize:33},houseTitle:{fontSize:19,fontWeight:'800',color:'#fff1cc'},note:{fontSize:12,lineHeight:18,color:'#e1e9ea'},enter:{fontSize:13,fontWeight:'700'},pressed:{opacity:.8,transform:[{scale:.98}]},footer:{color:'#edf3ed',textAlign:'center',fontSize:13,lineHeight:21,paddingVertical:4}});
