import {type StarterCompanionId} from './lib/starterCompanion';
export {isStarterCompanion,type StarterCompanionId} from './lib/starterCompanion';
import React,{useState} from 'react';
import {Image,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View} from 'react-native';
export const starterCompanions=[
 {id:'pip',name:'光核小機獸',english:'Pip',line:'我陪你，一起勇敢踏出第一步。',source:require('../assets/companions/pip-sheet.jpg'),column:1},
 {id:'hop',name:'長耳機兔',english:'HOP',line:'帶著好奇心，一起發現新冒險！',source:require('../assets/companions/hop-bomo-sheet.jpg'),column:0},
 {id:'bomo',name:'圓耳機熊',english:'BOMO',line:'不用急，我會陪你一步一步來。',source:require('../assets/companions/hop-bomo-sheet.jpg'),column:1},
] as const;
/** Non-destructive sprite framing keeps the exact approved characters. */
export function StarterCompanionArt({id,width=120}:{id:StarterCompanionId;width?:number}){
 const card=starterCompanions.find(c=>c.id===id)!;const height=width*4/3;
 return <View testID={`starter-art-${id}`} accessibilityLabel={`${card.english} ${card.name}`} style={{width,height,overflow:'hidden',borderRadius:10}}>
  <Image source={card.source} accessible={false} resizeMode="stretch" fadeDuration={0} style={{position:'absolute',left:-card.column*width,top:0,width:width*2,height}}/>
  <View pointerEvents="none" style={{position:'absolute',top:height*.075,left:width*.1,width:width*.8,height:height*.065,backgroundColor:'#062447',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:width*.1,color:'#ffe79a',fontWeight:'800'}}>{card.english}</Text></View>
 </View>;
}
export default function StarterCompanionPicker({busy,error,onChoose}:{busy:boolean;error:string;onChoose:(id:StarterCompanionId)=>void}){
 const [selected,setSelected]=useState<StarterCompanionId|null>(null);
 return <SafeAreaView style={s.root}><ScrollView contentContainerStyle={s.page} testID="starter-picker">
 <Text style={s.brand}>HOLTON HERO</Text><Text style={s.title}>選一位夥伴，一起出發</Text><Text style={s.note}>三位小夥伴都在等你。這次冒險，你想和誰一起開始？</Text>
 {starterCompanions.map(c=><Pressable key={c.id} accessibilityRole="radio" accessibilityLabel={`選擇${c.english}`} accessibilityState={{checked:selected===c.id,disabled:busy}} disabled={busy} onPress={()=>setSelected(c.id)} style={[s.choice,selected===c.id&&s.selected]}><StarterCompanionArt id={c.id} width={94}/><View style={{flex:1,gap:7}}><Text style={s.name}>{c.english} · {c.name}</Text><Text style={s.note}>{c.line}</Text><Text style={s.select}>{selected===c.id?'✓ 就是你了':'選這位夥伴'}</Text></View></Pressable>)}
 <Text style={s.note}>選定後，會陪你走過這次冒險。下次由家長確認重新開始，才能選另一位；之後也能挑戰並取得守護獸。</Text>
 {error?<Text accessibilityRole="alert" style={s.note}>{error}</Text>:null}
 <Pressable accessibilityRole="button" accessibilityLabel="確認初始夥伴" disabled={!selected||busy} onPress={()=>{if(selected)onChoose(selected);}} style={[s.button,(!selected||busy)&&{opacity:.45}]}><Text style={s.name}>{selected?`和 ${starterCompanions.find(c=>c.id===selected)!.english} 一起出發`:'先選一位夥伴'}</Text></Pressable>
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#071f32'},page:{padding:18,gap:14,maxWidth:520,width:'100%',alignSelf:'center',paddingBottom:36},brand:{color:'#d9bd78',textAlign:'center',letterSpacing:3,fontSize:15},title:{color:'#ffedba',fontSize:27,lineHeight:36,fontWeight:'800',textAlign:'center'},note:{color:'#d5e8eb',fontSize:15,lineHeight:24},name:{color:'#ffedba',fontSize:18,lineHeight:26,fontWeight:'700'},choice:{flexDirection:'row',alignItems:'center',gap:12,padding:10,borderWidth:2,borderColor:'#526d7d',borderRadius:18,backgroundColor:'#12364a'},selected:{borderColor:'#f4d78e',backgroundColor:'#1c4b5a'},select:{color:'#b6f2ee',fontSize:15,fontWeight:'700'},button:{minHeight:52,padding:12,alignItems:'center',justifyContent:'center',backgroundColor:'#116879',borderWidth:2,borderColor:'#e2c17f',borderRadius:17}});
