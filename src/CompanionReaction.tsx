import {companionReplies,type CompanionMood} from './lib/companionReplies';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,Pressable,StyleSheet,Text,View} from 'react-native';

/** Local-only feedback: never writes game progress or touches the task clock. */
export default function CompanionReaction({name,character,mood,reduced,children}:{name:string;character:string;mood:CompanionMood;reduced:boolean;children:React.ReactNode}){
 const [reply,setReply]=useState('');
 const active=useRef(false),next=useRef(0);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const bounce=useRef(new Animated.Value(0)).current;
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);bounce.stopAnimation();},[bounce]);
 useEffect(()=>{if(reduced){bounce.stopAnimation();bounce.setValue(0);}},[reduced,bounce]);
 const greet=()=>{
  if(active.current)return;
  active.current=true;
  const lines=companionReplies(character,mood);
  setReply(lines[next.current++%lines.length]);
  if(!reduced)Animated.sequence([
   Animated.timing(bounce,{toValue:1,duration:160,useNativeDriver:true}),
   Animated.timing(bounce,{toValue:0,duration:240,useNativeDriver:true}),
  ]).start();
  timeout.current=setTimeout(()=>{setReply('');active.current=false;timeout.current=null;},2000);
 };
 return <View testID="companion-reaction" style={s.root}>
  <Pressable accessibilityRole="button" accessibilityLabel={`摸摸${name}`} accessibilityHint="夥伴會用一句話回應你" onPress={greet}>
   <Animated.View testID="companion-reaction-art" style={{transform:[{translateY:bounce.interpolate({inputRange:[0,1],outputRange:[0,-4]})},{scale:bounce.interpolate({inputRange:[0,1],outputRange:[1,1.035]})}]}}>
    {children}
    {reply&&!reduced?<View testID="companion-reaction-glow" pointerEvents="none" style={s.glow}/>:null}
   </Animated.View>
  </Pressable>
  {reply?<View testID="companion-reaction-reply" pointerEvents="none" style={s.bubble}><Text accessibilityLiveRegion="polite" style={s.text}>{reply}</Text></View>:null}
 </View>;
}
const s=StyleSheet.create({root:{position:'relative',alignSelf:'center'},glow:{...StyleSheet.absoluteFillObject,borderRadius:12,borderWidth:2,borderColor:'#91f5ff',backgroundColor:'rgba(55,211,245,.12)'},bubble:{position:'absolute',left:0,right:0,bottom:8,paddingVertical:7,paddingHorizontal:4,borderRadius:10,borderWidth:1,borderColor:'#edd68f',backgroundColor:'rgba(7,37,54,.96)'},text:{fontSize:14,lineHeight:20,textAlign:'center',fontWeight:'700',color:'#fff1bd'}});
