import {companionReply,type CompanionMood} from './lib/companionReplies';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,Pressable,StyleSheet,Text,View} from 'react-native';

/** Local-only feedback: never writes game progress or touches the task clock. */
export default function CompanionReaction({name,adventurerName='',character,mood,reduced,children,onActivate,selected,disabled=false,alignTop=false,compact=false}:{name:string;adventurerName?:string;character:string;mood:CompanionMood;reduced:boolean;children:React.ReactNode;onActivate?:()=>void;selected?:boolean;disabled?:boolean;alignTop?:boolean;compact?:boolean}){
 const [reply,setReply]=useState('');
 const active=useRef(false),next=useRef(0);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const bounce=useRef(new Animated.Value(0)).current;
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);bounce.stopAnimation();},[bounce]);
 useEffect(()=>{if(reduced){bounce.stopAnimation();bounce.setValue(0);}},[reduced,bounce]);
 useEffect(()=>{if(timeout.current)clearTimeout(timeout.current);timeout.current=null;active.current=false;next.current=0;setReply('');bounce.stopAnimation();bounce.setValue(0);},[adventurerName,character,mood,bounce]);
 const greet=()=>{
  if(active.current)return;
  active.current=true;
  onActivate?.();
  const text=companionReply(character,mood,next.current++,adventurerName);
  setReply(text);
  if(!reduced)Animated.sequence([
   Animated.timing(bounce,{toValue:1,duration:160,useNativeDriver:true}),
   Animated.timing(bounce,{toValue:0,duration:240,useNativeDriver:true}),
  ]).start();
  timeout.current=setTimeout(()=>{setReply('');active.current=false;timeout.current=null;},Math.max(2000,Math.min(4500,Array.from(text).length*120)));
 };
 return <View testID="companion-reaction" style={[s.root,alignTop&&{alignSelf:'flex-start'},compact&&{zIndex:reply?10:0}]}>
  <Pressable accessibilityRole="button" accessibilityLabel={onActivate?`今天陪我：${name}`:`摸摸${name}`} accessibilityState={{selected,disabled}} disabled={disabled} accessibilityHint="夥伴會用一句話回應你" onPress={greet}>
   <Animated.View testID="companion-reaction-art" style={{transform:[{translateY:bounce.interpolate({inputRange:[0,1],outputRange:[0,-4]})},{scale:bounce.interpolate({inputRange:[0,1],outputRange:[1,1.035]})}]}}>
    {children}
    {reply&&!reduced?<View testID="companion-reaction-glow" pointerEvents="none" style={s.glow}/>:null}
   </Animated.View>
  </Pressable>
  <View testID="companion-speech-slot" pointerEvents="none" style={[s.slot,compact&&{position:'absolute',top:44,left:0,width:180}]}><View testID={reply?"companion-reaction-reply":undefined} style={[s.bubble,{opacity:reply?1:0}]}><View style={s.tail}/><Text accessibilityLiveRegion="polite" style={[s.text,Array.from(reply).length>26?{fontSize:10,lineHeight:12}:reply.length>18?{fontSize:12,lineHeight:14}:null]}>{reply || " "}</Text></View></View>
 </View>;
}
const s=StyleSheet.create({
 root:{position:'relative',alignSelf:'center'},
 glow:{...StyleSheet.absoluteFillObject,borderRadius:12,borderWidth:2,borderColor:'#91f5ff',backgroundColor:'rgba(55,211,245,.12)'},
 slot:{height:88,paddingTop:12,width:'100%',justifyContent:'flex-start'},
 bubble:{position:'absolute',left:0,right:0,top:12,minHeight:64,maxWidth:180,paddingVertical:8,paddingHorizontal:9,borderRadius:26,borderTopLeftRadius:22,borderBottomRightRadius:22,borderWidth:2,borderColor:'#dec68c',backgroundColor:'#fff8e5',justifyContent:'center'},
 tail:{position:'absolute',top:-7,left:'42%',width:12,height:12,backgroundColor:'#fff8e5',borderTopWidth:2,borderLeftWidth:2,borderColor:'#dec68c',transform:[{rotate:'45deg'}]},
 text:{fontSize:14,lineHeight:18,textAlign:'center',fontWeight:'700',color:'#193e50'},
});
