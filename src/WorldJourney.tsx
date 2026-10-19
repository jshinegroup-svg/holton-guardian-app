import {chapterArt,chapterScene} from './ChapterScenery';
import React, {useEffect,useState} from 'react';
import {Image,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View,Platform} from 'react-native';
import {worldIds,worlds,unlocked,journeyHint,type Journeys,type WorldId,type JourneyEvent} from './lib/journeys';
export const journeyArt={sky:require('../assets/worlds/sky-base/island-v3.png'),forest:require('../assets/worlds/journeys/forest.png'),cosmos:require('../assets/worlds/journeys/cosmos.png')};
function Button({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}) {return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,pressed&&{opacity:.75,transform:[{scale:.98}]},disabled&&{opacity:.55}]}><Text style={s.buttonText}>{label}</Text></Pressable>;}
export function WorldMap({journeys,activeWorld,onEnter,onSettings,saving,error}:{journeys:Journeys;activeWorld:WorldId;onEnter:(w:WorldId)=>void;onSettings:()=>void;saving:boolean;error:string}) {
 return <SafeAreaView style={s.root} testID="world-map">{Platform.OS==='web'?React.createElement('style',null,worldIds.filter(w=>!unlocked(journeys,w)).map(w=>`[data-testid="world-region-${w}"] [data-testid="map-scenery"]{filter:grayscale(1)}`).join('\n')):null}<ScrollView contentContainerStyle={{flexGrow:1}}>
 <View style={s.mapHeading}><View><Text style={s.brand}>HOLTON HERO</Text><Text style={s.title}>星光世界地圖</Text></View><Pressable accessibilityRole="button" accessibilityLabel="設定" onPress={onSettings} style={{padding:12}}><Text style={s.small}>⚙ 設定</Text></Pressable></View>
 {error?<Text accessibilityRole="alert" style={s.text}>{error}</Text>:null}
 {worldIds.map(w=>{const open=unlocked(journeys,w);const n=journeys.counts[w];return <View key={w} testID={`world-region-${w}`} style={s.region}>
 <Image testID="map-scenery" source={chapterScene(w,n)} style={[s.background,!open&&{opacity:.35}]} resizeMode="cover" accessibilityLabel={`${worlds[w].name}${open?'已開放':'尚未解鎖，暗灰地景'}`}/>
 <View style={[s.regionShade,!open&&{backgroundColor:'rgba(12,15,22,.48)'}]}/>
 <View testID={`world-node-${w}`} style={[s.mapNode,open?s.available:s.locked]}>
 <Pressable accessibilityRole="button" accessibilityLabel={open?`進入${worlds[w].name}`:`尚未解鎖${worlds[w].name}`} disabled={!open||saving} onPress={()=>onEnter(w)} style={({pressed})=>[s.mapButton,pressed&&{opacity:.75},!open&&{backgroundColor:'rgba(52,55,62,.8)',borderColor:'#777c82'}]}><Text style={[s.buttonText,!open&&{color:'#b4b7bc'}]}>{open?'進入':'🔒 '}{worlds[w].name}</Text></Pressable>
 <Text style={[s.mapHint,!open&&{color:'#b4b7bc'}]}>{open?n>=15?'✓ 旅程完成 · 自由回訪':`${n}／15 步 · ${activeWorld===w?'目前所在':'已解鎖'}`:w==='sky'?'森林旅程 15 步後開放':'天空旅程 15 步後開放'}</Text>
 </View></View>})}
 <View style={{padding:12,alignItems:'center'}}><Text style={s.small}>每章 5 次任務換新場景 · 進入世界不花點數</Text>{journeys.legacyCredit>0?<Text style={s.small}>已保留 {journeys.legacyCredit} 次既有完成紀錄</Text>:null}</View>
 </ScrollView></SafeAreaView>;
}
// Small vector landmarks are game-state overlays, not replacement scenery.
function Landmark({world,chapter,steps}:{world:WorldId;chapter:number;steps:number}) {
 const lit='#ffe39a',dark='#446675';
 const lights=Array.from({length:5},(_,i)=>`<circle cx="${25+i*42}" cy="130" r="9" fill="${i<steps?lit:dark}" stroke="#d2b97d" stroke-width="2"/>`).join('');
 const glow=steps?'<circle cx="110" cy="68" r="53" fill="#52dccc" opacity=".12"/>':'';
 const color=steps>=5?lit:'#82b4bf';
 let body='';
 if(chapter===1) body=`<path d="M15 105 Q110 5 205 105" fill="none" stroke="${color}" stroke-width="8"/><path d="M15 108 H205" stroke="#779ba9" stroke-width="3"/>`+Array.from({length:steps},(_,i)=>`<path d="M${28+i*38} 108 V${68-Math.sin(i/4*Math.PI)*28}" stroke="${lit}" stroke-width="5"/>`).join('');
 else if(chapter===2)body=`<ellipse cx="110" cy="68" rx="47" ry="51" fill="${steps>=5?'#64dfd0':'#163f51'}" stroke="${color}" stroke-width="7"/><path d="M110 23 L117 56 L145 68 L117 80 L110 112 L103 80 L75 68 L103 56Z" fill="${steps>=3?lit:dark}"/>`;
 else if(world==='forest')body=`<path d="M110 110 V55 M110 80 L65 52 M110 70 L152 42" stroke="#a88d64" stroke-width="12"/><circle cx="73" cy="44" r="26" fill="${steps>=2?'#388e75':dark}"/><circle cx="145" cy="38" r="30" fill="${steps>=3?'#4aad81':dark}"/><circle cx="108" cy="23" r="27" fill="${steps>=5?lit:'#326e64'}"/>`;
 else body=`<path d="M65 110 V62 L110 20 L155 62 V110Z" fill="#153d53" stroke="${color}" stroke-width="4"/><path d="M45 64 L110 5 L175 64" fill="none" stroke="${color}" stroke-width="5"/><rect x="98" y="74" width="24" height="36" rx="4" fill="${steps>=1?'#62d4e6':dark}"/>${steps>=4?'<path d="M155 30 V0 L185 10 L155 20" fill="#f7d18c" stroke="#d5b576" stroke-width="2"/>':''}${steps>=3?'<circle cx="110" cy="48" r="11" fill="#ffe39a"/>':''}`;
 if(world==='sky'&&chapter===0&&steps>=2)body+='<path d="M105 112 L82 123 M116 112 L140 123" stroke="#ffe39a" stroke-width="4"/>';
 if(world==='forest'&&chapter===2) body=`<path d="M110 115 V48 M110 76 L65 42 M110 65 L156 32" stroke="#b39762" stroke-width="12"/><circle cx="66" cy="38" r="26" fill="#35755f"/><circle cx="152" cy="31" r="27" fill="#3b8966"/><circle cx="109" cy="22" r="27" fill="#409376"/>`+Array.from({length:steps},(_,i)=>`<circle cx="${70+i*20}" cy="${25+Math.sin(i)*18}" r="7" fill="${lit}"/>`).join('');
 if(world==='cosmos'&&chapter===0) body=`<path d="M48 105 V70 A62 62 0 0 1 172 70 V105Z" fill="#16364e" stroke="${color}" stroke-width="4"/><path d="M30 108 H190 M110 9 V-3" stroke="${color}" stroke-width="5"/><circle cx="110" cy="49" r="21" fill="${steps>=3?'#59d5e5':dark}"/>${steps>=4?'<path d="M180 70 L215 43 V92Z M40 70 L5 43 V92Z" fill="#96aec8" stroke="#ffe39a" stroke-width="3"/>':''}`;
 if(world==='cosmos'&&chapter===2) body=`<path d="M85 112 L95 32 H125 L138 112Z" fill="#174a67" stroke="${color}" stroke-width="4"/><ellipse cx="110" cy="58" rx="51" ry="14" fill="none" stroke="${steps>=2?lit:dark}" stroke-width="4"/><ellipse cx="110" cy="88" rx="43" ry="11" fill="none" stroke="${steps>=3?lit:dark}" stroke-width="4"/><path d="M110 1 L117 17 L135 23 L117 29 L110 45 L103 29 L85 23 L103 17Z" fill="${steps>=5?lit:dark}"/>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">${glow}${body}${lights}</svg>`;
 return <Image accessibilityLabel={`${worlds[world].landmarks[chapter]}，已點亮 ${steps} 個旅程節點`} source={{uri:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}} style={{width:230,height:150,maxWidth:'100%',alignSelf:'center'}}/>;
}
export function JourneyMap({journeys,world,onClose,onWorldMap}:{journeys:Journeys;world:WorldId;onClose:()=>void;onWorldMap:()=>void}) {
 const n=journeys.counts[world],info=worlds[world];
 return <SafeAreaView style={s.root} testID="journey-map"><Image source={chapterScene(world,n)} style={s.background} resizeMode="cover"/><ScrollView contentContainerStyle={s.page}>
 <View style={s.heading}><Text style={s.title}>{info.name} · 我的旅程</Text><Text style={s.text}>{info.intro}</Text><Text style={s.small}>星光只記錄旅程，不是貨幣。不扣能量球，也不因休息或求助倒退。</Text></View>
 <Button label="回到目前任務" onPress={onClose}/>
 {info.chapters.map((chapter,c)=>{const count=Math.max(0,Math.min(5,n-c*5));return <View key={chapter} testID={`journey-chapter-${c}`} style={[s.chapter,count===5&&s.available]}><Text style={s.title}>{count===5?'✓ ':''}第 {c+1} 章 · {chapter}</Text><Image source={chapterArt[world][c]} resizeMode="cover" accessibilityLabel={`第${c+1}章場景`} style={{width:'100%',height:150,borderRadius:12,opacity:n<c*5?.3:1}}/><Landmark world={world} chapter={c} steps={count}/><Text style={s.text}>{count===5?'這個地方已經亮起，會一直留在你的旅程裡。':count===0&&n<c*5?'完成前一章，就可以來到這裡。':`已點亮 ${count}／5 步`}</Text>{info.steps.slice(c*5,c*5+5).map((line,i)=><Text key={line} style={[s.step,i<count&&s.stepDone]}>{i<count?'✦':'○'} {i<count?line:`第 ${c*5+i+1} 步 · 完成一輪任務後揭曉`}</Text>)}</View>})}
 <View style={s.note}><Text style={s.text}>{journeyHint(journeys,world)}</Text>{n>=15&&world==='cosmos'?<Text style={s.title}>✦ 星海同行者</Text>:null}</View><Button label="前往世界地圖" onPress={onWorldMap}/>
 </ScrollView></SafeAreaView>;
}
export function JourneyReveal({event,onDismiss,saving}:{event:JourneyEvent;reduced:boolean;onDismiss:()=>void;saving:boolean}) {
 const [showBefore,setShowBefore]=useState(false);
 useEffect(()=>{setShowBefore(false);},[event.id]);
 const chapter=Math.floor((event.step-1)/5),complete=event.step%5===0;
 return <View style={s.revealOverlay}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center'}} style={{width:'100%'}}><View style={s.reveal} accessibilityLiveRegion="polite" testID="journey-reveal"><Text style={s.small}>{worlds[event.world].name} · 第 {event.step} 步</Text><Text style={s.title}>{complete?'一章故事完成！':'世界亮了一點'}</Text><Text style={s.small}>{showBefore?'完成前':'這次完成後 · 新增一顆星光'}</Text><Image testID="chapter-reveal-scene" source={chapterScene(event.world,showBefore?event.step-1:event.step)} accessibilityLabel={showBefore?'完成前場景':'完成後場景'} resizeMode="cover" style={{width:'100%',height:160,borderRadius:12}}/>{complete&&event.step<15?<Text style={s.small}>新場景已開放：{worlds[event.world].chapters[event.step/5]}</Text>:null}<Landmark world={event.world} chapter={chapter} steps={(event.step-1)%5+(showBefore?0:1)}/><Button label={showBefore?'看點亮後':'對照完成前'} onPress={()=>setShowBefore(v=>!v)}/><Text style={s.text}>{worlds[event.world].steps[event.step-1]}</Text><Text style={s.small}>變化已保存在旅程圖，之後也能回去看。</Text><Button label="看到了，繼續旅程" onPress={onDismiss} disabled={saving}/></View></ScrollView></View>;
}
export function JourneyHint({journeys,world,onPress}:{journeys:Journeys;world:WorldId;onPress:()=>void}) {
 const n=journeys.counts[world],chapter=Math.min(2,Math.floor(n/5)),steps=Math.min(5,n-chapter*5);
 return <Pressable accessibilityRole="button" accessibilityLabel="看看我的旅程" onPress={onPress} style={s.hint} testID="journey-visible-landmark">
 <Text style={s.small}>我的基地正在改變 · 第 {chapter+1} 章</Text>
 <Landmark world={world} chapter={chapter} steps={steps}/>
 <Text style={s.text}>{n===0?'完成一輪任務並收尾，第一顆星光就會自動亮起。':worlds[world].steps[n-1]}</Text>
 <Text style={s.small}>{journeyHint(journeys,world)}</Text>
 <Text style={s.small}>不用點燈、不花點數 · 查看全部地標 ›</Text></Pressable>;
}
const s=StyleSheet.create({mapHeading:{padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},region:{height:210,flexGrow:1,minHeight:180,overflow:'hidden',alignItems:'center',justifyContent:'center',borderBottomWidth:1,borderColor:'#324652'},regionShade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(5,18,30,.12)'},mapNode:{width:216,maxWidth:'80%',padding:7,gap:4,borderRadius:14,borderWidth:1},mapButton:{minHeight:44,paddingHorizontal:8,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#d9c187',borderRadius:10,backgroundColor:'rgba(8,49,64,.75)'},mapHint:{color:'#e4edf0',textAlign:'center',fontSize:12,lineHeight:18},root:{flex:1,backgroundColor:'#071c31'},background:{position:'absolute',width:'100%',height:'100%'},page:{padding:18,gap:18,maxWidth:540,width:'100%',alignSelf:'center',paddingBottom:40},heading:{padding:16,gap:8,backgroundColor:'rgba(5,25,46,.76)',borderRadius:20},brand:{color:'#ffdf9e',fontSize:13,letterSpacing:2},title:{color:'#fff0c4',fontSize:21,fontWeight:'800',lineHeight:30},text:{color:'#f1f7f8',fontSize:16,lineHeight:25},small:{color:'#cbe0e6',fontSize:13,lineHeight:21},world:{padding:12,gap:8,borderRadius:20,borderWidth:1,marginVertical:16,maxWidth:290,width:'100%',alignSelf:'center'},available:{borderColor:'#f2d99b',backgroundColor:'rgba(8,48,65,.58)'},locked:{borderColor:'#73909d',backgroundColor:'rgba(18,25,44,.58)'},button:{padding:12,minHeight:48,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#e0c58b',borderRadius:15,backgroundColor:'rgba(11,74,94,.92)'},buttonText:{color:'#fff1cc',fontSize:16,fontWeight:'700',textAlign:'center'},note:{padding:14,gap:6,backgroundColor:'rgba(5,28,44,.8)',borderRadius:16},chapter:{padding:16,gap:12,borderRadius:22,borderWidth:1,borderColor:'#6f929e',backgroundColor:'rgba(6,29,44,.76)'},step:{color:'#acc4cb',fontSize:15,lineHeight:24},stepDone:{color:'#ffe5a8'},hint:{padding:12,backgroundColor:'rgba(8,35,49,.67)',borderRadius:16,gap:3,borderWidth:1,borderColor:'#8e987d'},revealOverlay:{flex:1,backgroundColor:'rgba(3,15,30,.6)',alignItems:'center',justifyContent:'center',padding:20},reveal:{width:'100%',maxWidth:340,padding:20,gap:12,backgroundColor:'#10394b',borderWidth:2,borderColor:'#e7c985',borderRadius:24}});
