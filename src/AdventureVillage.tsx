import React from 'react';
import {Image, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
export type VillageRoom = 'village' | 'mission' | 'wishes' | 'companions';
const destinations = [
  {id:'map', title:'冒險地圖', note:'選世界・看旅程', tint:'#a8e6d5', column:0, row:0},
  {id:'wishes', title:'心願小屋', note:'選心願・換獎勵', tint:'#ffe0a0', column:1, row:0},
  {id:'companions', title:'夥伴小屋', note:'找夥伴・看收藏', tint:'#d1ccff', column:0, row:1},
  {id:'parent', title:'家長小屋', note:'訂目標・設獎勵', tint:'#ffd0ae', column:1, row:1},
] as const;
function CottageLightStyles() {
  if(Platform.OS!=='web') return null;
  return React.createElement('style',null,`
[data-testid="immersive-world"]:has([data-testid="adventure-village"]) [data-testid="world-title"]{margin-top:12px!important;margin-bottom:8px!important;padding-top:12px!important;padding-bottom:8px!important}
@keyframes cottage-welcome-light {0%,100%{opacity:.42;transform:scale(.94)}45%,60%{opacity:.95;transform:scale(1.06)}}
@keyframes cottage-window-light {0%,100%{filter:brightness(1) drop-shadow(0 2px 3px #061c28)}50%{filter:brightness(1.18) drop-shadow(0 0 7px #ffe49a88)}}
[data-testid="cottage-halo"]{background:radial-gradient(ellipse,#ffe49acc 0%,#e6b76555 40%,transparent 73%);animation:cottage-welcome-light 2.6s ease-in-out 3;pointer-events:none}
[data-testid="cottage-sprite"]{filter:brightness(1) drop-shadow(0 2px 3px #061c28);animation:cottage-window-light 2.6s ease-in-out 3;pointer-events:none}
[data-testid="cottage-wishes"] [data-testid="cottage-halo"],[data-testid="cottage-wishes"] [data-testid="cottage-sprite"]{animation-delay:.2s}
[data-testid="cottage-companions"] [data-testid="cottage-halo"],[data-testid="cottage-companions"] [data-testid="cottage-sprite"]{animation-delay:.4s}
[data-testid="cottage-parent"] [data-testid="cottage-halo"],[data-testid="cottage-parent"] [data-testid="cottage-sprite"]{animation-delay:.6s}
[data-testid^="cottage-"][role="button"]{cursor:pointer;transition:transform .15s ease,background-color .15s ease}
[data-testid^="cottage-"][role="button"]:focus-visible{outline:3px solid #ffe7a7;outline-offset:3px;background:#16435566!important}
@media(hover:hover){[data-testid^="cottage-"][role="button"]:hover [data-testid="cottage-sprite"]{filter:brightness(1.2) drop-shadow(0 0 8px #ffe49a99)!important}}
[data-testid="village-cottages-reduced"] [data-testid="cottage-halo"],[data-testid="village-cottages-reduced"] [data-testid="cottage-sprite"]{animation:none!important}
[data-testid="village-cottages-reduced"] [role="button"]{transition:none!important}
@media(prefers-reduced-motion:reduce){[data-testid="cottage-halo"],[data-testid="cottage-sprite"]{animation:none!important}[data-testid^="cottage-"][role="button"]{transition:none!important}}
`);
}
export default function AdventureVillage({orbs,world,steps,today,goal,task,onStart,onVisit,saving,reduced=false}:{orbs:number;world:string;steps:number;today:number;goal:number;task:string;onStart:()=>void;onVisit:(place:typeof destinations[number]['id'])=>void;saving:boolean;reduced?:boolean}) {
 return <View testID="adventure-village" style={s.content}>
  <CottageLightStyles/>
  <View style={s.welcome}><Text accessibilityRole="header" style={s.title}>冒險村莊</Text><Text style={s.subtitle}>每一小步，都有夥伴陪你。</Text></View>
  <View style={s.status}><Text style={s.balance}>✦ {orbs} 能量球</Text><Text style={s.small}>今天 {today}／{goal} 次任務</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel="開始任務" disabled={saving} onPress={onStart} style={({pressed})=>[s.start,pressed&&s.pressed,saving&&{opacity:.5}]}><Text style={s.startTitle}>▶ 開始任務</Text><Text style={s.startNote}>{task || '先選今天想完成的一件小事'}</Text><Text style={s.small}>{world} · 旅程 {steps}／15 步</Text></Pressable>
  <View style={s.signpost}><Text style={s.signpostText}>✦ 點亮的小屋，都可以點進去</Text></View>
  <View testID={reduced?'village-cottages-reduced':'village-cottages'} style={s.grid}>{destinations.map(d=><Pressable key={d.id} testID={`cottage-${d.id}`} accessibilityRole="button" accessibilityLabel={d.title} accessibilityHint={`${d.note}，點選整棟小屋即可進入`} onPress={()=>onVisit(d.id)} style={({pressed})=>[s.house,pressed&&s.housePressed]}>
    <View pointerEvents="none" style={s.art}>
      <View testID="cottage-halo" style={s.halo}/>
      <View testID="cottage-crop" style={s.crop}><Image testID="cottage-sprite" source={require('../assets/worlds/village/cottages.png')} accessible={false} resizeMode="stretch" style={[s.sprite,{left:d.column===0?'0%':'-100%',top:d.row===0?'0%':'-100%'}]}/></View>
    </View>
    <View pointerEvents="none" style={[s.plaque,{borderColor:d.tint}]}><Text style={s.houseTitle}>{d.title}</Text><Text style={s.note}>{d.note}</Text><Text style={[s.enter,{color:d.tint}]}>點我進入 →</Text></View>
  </Pressable>)}</View>
  <Text style={s.footer}>先做一件小事，再回小屋看看。</Text>
 </View>;
}
export function VillageBackdrop(){return <><Image source={require('../assets/worlds/village/village.png')} resizeMode="cover" style={[StyleSheet.absoluteFillObject,{width:'100%',height:'100%'}]} accessibilityLabel="溫暖燈光的森林冒險村莊"/><View pointerEvents="none" style={[StyleSheet.absoluteFillObject,{backgroundColor:'rgba(4,23,34,.38)'}]}/></>;}
const s=StyleSheet.create({content:{gap:11},welcome:{gap:4,paddingTop:2},title:{fontSize:29,fontWeight:'800',color:'#fff0c9'},subtitle:{fontSize:14,color:'#e2eeee'},status:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,padding:10,borderRadius:14,backgroundColor:'rgba(5,28,39,.82)'},balance:{color:'#ffe5a4',fontSize:16,fontWeight:'700'},small:{fontSize:12,lineHeight:18,color:'#d4e8e6'},start:{gap:4,padding:13,borderRadius:20,borderWidth:1,borderColor:'#ffe1a1',backgroundColor:'rgba(18,77,79,.93)'},startTitle:{fontSize:22,fontWeight:'800',color:'#fff0bc'},startNote:{fontSize:14,lineHeight:20,color:'#f5f4e5'},signpost:{alignSelf:'center',paddingHorizontal:12,paddingVertical:6,borderRadius:12,backgroundColor:'rgba(7,30,40,.8)'},signpostText:{fontSize:13,color:'#ffe6a7',fontWeight:'700'},grid:{flexDirection:'row',flexWrap:'wrap',columnGap:10,rowGap:12},house:{width:'47%',flexGrow:1,borderRadius:22,alignItems:'center',paddingBottom:4},art:{width:'90%',aspectRatio:1},crop:{...StyleSheet.absoluteFillObject,overflow:'hidden'},sprite:{position:'absolute',width:'200%',height:'200%'},halo:{position:'absolute',width:'100%',height:'50%',left:'0%',bottom:'0%',borderRadius:90,backgroundColor:'rgba(255,214,117,.16)',opacity:.65},plaque:{alignSelf:'stretch',marginHorizontal:4,marginTop:-5,paddingVertical:5,paddingHorizontal:3,borderRadius:10,borderWidth:1,backgroundColor:'rgba(43,35,26,.94)',alignItems:'center',gap:2},houseTitle:{fontSize:17,fontWeight:'800',color:'#fff1cc'},note:{fontSize:11,lineHeight:17,color:'#e1e9ea'},enter:{fontSize:11,lineHeight:17,fontWeight:'700'},pressed:{opacity:.8,transform:[{scale:.98}]},housePressed:{backgroundColor:'rgba(255,225,155,.2)',transform:[{scale:.96}]},footer:{color:'#edf3ed',textAlign:'center',fontSize:12,lineHeight:20,paddingVertical:3}});
