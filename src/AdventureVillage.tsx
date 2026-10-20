import React from 'react';
import {Image, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
export type VillageRoom = 'village' | 'mission' | 'wishes' | 'companions';
// Percentages share the same coordinate space as the single map image.
const destinations = [
  {id:'map',title:'冒險地圖',name:'星門驛站',note:'選世界・看旅程',tint:'#bceee0',left:4,top:1,width:41,height:38,doorX:54,doorY:60},
  {id:'wishes',title:'心願小屋',name:'星願寶庫',note:'選心願・換獎勵',tint:'#ffe5ad',left:58,top:10,width:40,height:30,doorX:43,doorY:57},
  {id:'companions',title:'夥伴小屋',name:'守護獸基地',note:'找夥伴・看收藏',tint:'#ddd4ff',left:3,top:39,width:43,height:37,doorX:60,doorY:62},
  {id:'parent',title:'家長小屋',name:'智慧樹屋',note:'訂目標・設獎勵',tint:'#ffd6b8',left:58,top:40,width:40,height:44,doorX:53,doorY:66},
] as const;
function MapLightStyles() {
  if(Platform.OS!=='web')return null;
  return React.createElement('style',null,`
[data-testid="immersive-world"]:has([data-testid="adventure-village"]) [data-testid="world-title"]{margin-top:12px!important;margin-bottom:8px!important;padding-top:12px!important;padding-bottom:8px!important}
@keyframes village-door-light{0%,100%{opacity:.35;transform:scale(.9)}45%,60%{opacity:.9;transform:scale(1.12)}}
[data-testid="cottage-halo"]{background:radial-gradient(ellipse,#fff5bdd9 0%,#ffd77788 30%,#ffce4b22 58%,transparent 74%);animation:village-door-light 2.6s ease-in-out 3;pointer-events:none}
[data-testid="cottage-wishes"] [data-testid="cottage-halo"]{animation-delay:.2s}
[data-testid="cottage-companions"] [data-testid="cottage-halo"]{animation-delay:.4s}
[data-testid="cottage-parent"] [data-testid="cottage-halo"]{animation-delay:.6s}
[data-testid^="cottage-"][role="button"]{cursor:pointer;touch-action:manipulation}
[data-testid^="cottage-"][role="button"]:focus-visible{outline:3px solid #ffe7a7;outline-offset:-3px;background:#ffe5a422!important}
@media(hover:hover){[data-testid^="cottage-"][role="button"]:hover [data-testid="cottage-label"]{background:#5c4728!important;box-shadow:0 0 12px #ffe6a4aa}}
[data-testid="village-map-reduced"] [data-testid="cottage-halo"]{animation:none!important}
@media(prefers-reduced-motion:reduce){[data-testid="cottage-halo"]{animation:none!important}}
`);
}
export default function AdventureVillage({orbs,world,steps,today,goal,task,onStart,onVisit,saving,reduced=false}:{orbs:number;world:string;steps:number;today:number;goal:number;task:string;onStart:()=>void;onVisit:(place:typeof destinations[number]['id'])=>void;saving:boolean;reduced?:boolean}) {
 return <View testID="adventure-village" style={s.content}>
  <MapLightStyles/>
  <View style={s.welcome}><Text accessibilityRole="header" style={s.title}>冒險村莊</Text><Text style={s.subtitle}>沿著小路，找到你想去的小屋。</Text></View>
  <View style={s.status}><Text style={s.balance}>✦ {orbs} 能量球</Text><Text style={s.small}>今天 {today}／{goal} 次任務</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel="開始任務" disabled={saving} onPress={onStart} style={({pressed})=>[s.start,pressed&&s.pressed,saving&&{opacity:.5}]}><Text style={s.startTitle}>▶ 開始任務</Text><Text style={s.startNote}>{task||'先選今天想完成的一件小事'}</Text><Text style={s.small}>{world} · 旅程 {steps}／15 步</Text></Pressable>
  <Text style={s.hint}>✦ 直接點地圖上的小屋，就能進入</Text>
  <View testID={reduced?'village-map-reduced':'village-map-live'} style={s.map}>
    <Image testID="village-integrated-map" source={require('../assets/worlds/village/landmark-map.png')} accessible={false} style={s.mapImage} resizeMode="stretch"/>
    {destinations.map(d=><Pressable key={d.id} testID={`cottage-${d.id}`} accessibilityRole="button" accessibilityLabel={d.title} accessibilityHint={`${d.name}，${d.note}`} onPress={()=>onVisit(d.id)} style={({pressed})=>[s.hotspot,{left:`${d.left}%`,top:`${d.top}%`,width:`${d.width}%`,height:`${d.height}%`},pressed&&s.hotspotPressed]}>
      {({pressed})=><><View pointerEvents="none" testID="cottage-halo" style={[s.halo,{left:`${d.doorX-15}%`,top:`${d.doorY-12}%`},pressed&&{opacity:1}]}/><View testID="cottage-label" pointerEvents="none" style={[s.plaque,{borderColor:d.tint},pressed&&s.labelPressed]}><Text style={s.houseTitle}>{d.title} ›</Text><Text style={s.houseName}>{d.name}</Text></View></>}
    </Pressable>)}
  </View>
  <Text style={s.footer}>每一小步，都有夥伴陪你。</Text>
 </View>;
}
export function VillageBackdrop(){return <View pointerEvents="none" style={[StyleSheet.absoluteFillObject,{backgroundColor:'#0b2937'}]}/>;}
const s=StyleSheet.create({content:{gap:10},welcome:{gap:4,paddingTop:2},title:{fontSize:28,fontWeight:'800',color:'#fff0c9'},subtitle:{fontSize:14,color:'#d4e8e6'},status:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,padding:10,borderRadius:14,backgroundColor:'rgba(5,28,39,.82)'},balance:{color:'#ffe5a4',fontSize:16,fontWeight:'700'},small:{fontSize:12,lineHeight:18,color:'#d4e8e6'},start:{gap:4,padding:12,borderRadius:18,borderWidth:1,borderColor:'#ffe1a1',backgroundColor:'#154c4e'},startTitle:{fontSize:22,fontWeight:'800',color:'#fff0bc'},startNote:{fontSize:14,lineHeight:20,color:'#f5f4e5'},hint:{fontSize:13,color:'#ffe6a7',fontWeight:'700',textAlign:'center',paddingVertical:3},map:{width:'100%',aspectRatio:2/3,position:'relative',overflow:'hidden',borderRadius:24,backgroundColor:'#123b44'},mapImage:{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'},hotspot:{position:'absolute',borderRadius:20},hotspotPressed:{backgroundColor:'rgba(255,227,153,.22)'},halo:{position:'absolute',width:'30%',height:'24%',borderRadius:80,backgroundColor:'rgba(255,222,145,.2)',opacity:.6},plaque:{position:'absolute',left:'0%',right:'0%',bottom:0,alignSelf:'center',paddingHorizontal:3,paddingVertical:6,borderRadius:9,borderWidth:1,backgroundColor:'rgba(27,38,34,.9)',alignItems:'center'},labelPressed:{backgroundColor:'#715329',transform:[{scale:.96}]},houseName:{fontSize:11,lineHeight:15,color:'#e8d5a5',textAlign:'center'},houseTitle:{fontSize:14,fontWeight:'800',color:'#fff1cc',textAlign:'center'},pressed:{opacity:.8,transform:[{scale:.98}]},footer:{color:'#c5dedb',textAlign:'center',fontSize:12,lineHeight:20,paddingVertical:3}});
