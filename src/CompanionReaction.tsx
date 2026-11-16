import {useLocale} from './i18n/locale';
import {companionReply,type CompanionMood} from './lib/companionReplies';
import {useCompanionVoice,speakCompanion,stopCompanionVoice} from './lib/companionVoice';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,StyleSheet,View} from 'react-native';
import {Pressable,Text} from './i18n/ui';

/** Local-only feedback: never writes game progress or touches the task clock. */
export default function CompanionReaction({name,adventurerName='',character,mood,reduced,children,onActivate,selected,disabled=false,alignTop=false,compact=false}:{name:string;adventurerName?:string;character:string;mood:CompanionMood;reduced:boolean;children:React.ReactNode;onActivate?:()=>void;selected?:boolean;disabled?:boolean;alignTop?:boolean;compact?:boolean}){
 const {locale}=useLocale();
 const [reply,setReply]=useState('');
 const {enabled:voiceEnabled,setEnabled:setVoiceEnabled,supported:voiceSupported}=useCompanionVoice();
 const owner=useRef({}).current;
 const active=useRef(false),next=useRef(0);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const bounce=useRef(new Animated.Value(0)).current;
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);bounce.stopAnimation();stopCompanionVoice(owner);},[bounce,owner]);
 useEffect(()=>{if(reduced){bounce.stopAnimation();bounce.setValue(0);}},[reduced,bounce]);
 useEffect(()=>{if(timeout.current)clearTimeout(timeout.current);timeout.current=null;active.current=false;next.current=0;setReply('');stopCompanionVoice(owner);bounce.stopAnimation();bounce.setValue(0);},[adventurerName,character,mood,bounce,locale]);
 const greet=()=>{
  if(active.current)return;
  active.current=true;
  onActivate?.();
  const text=companionReply(character,mood,next.current++,adventurerName);
  setReply(text);
  if(voiceEnabled)speakCompanion(text,locale,owner,character);
  if(!reduced)Animated.sequence([
   Animated.timing(bounce,{toValue:1,duration:160,useNativeDriver:true}),
   Animated.timing(bounce,{toValue:0,duration:240,useNativeDriver:true}),
  ]).start();
  timeout.current=setTimeout(()=>{setReply('');active.current=false;timeout.current=null;},4000);
 };
 return <View testID="companion-reaction" style={[s.root,alignTop&&{alignSelf:'flex-start'},compact&&{zIndex:reply?10:0}]}>
  <Pressable accessibilityRole="button" accessibilityLabel={onActivate?`今天陪我：${name}`:`摸摸${name}`} accessibilityState={{selected,disabled}} disabled={disabled} accessibilityHint="夥伴會用一句話回應你" onPress={greet}>
   <Animated.View testID="companion-reaction-art" style={{transform:[{translateY:bounce.interpolate({inputRange:[0,1],outputRange:[0,-4]})},{scale:bounce.interpolate({inputRange:[0,1],outputRange:[1,1.035]})}]}}>
    {children}
    {reply&&!reduced?<View testID="companion-reaction-glow" pointerEvents="none" style={s.glow}/>:null}
   </Animated.View>
  </Pressable>
  <Pressable testID="companion-voice-toggle" accessibilityRole="switch" aria-checked={voiceEnabled} accessibilityState={{checked:voiceEnabled,disabled:!voiceSupported}} accessibilityLabel={locale==='en'?'Companion voice':'守護獸語音'} disabled={!voiceSupported} onPress={()=>{setVoiceEnabled(!voiceEnabled);if(!voiceEnabled)speakCompanion(reply||(locale==='en'?'Voice is on.':'語音已開啟。'),locale,owner,character);}} style={s.voice}><Text style={s.voiceText}>{!voiceSupported?(locale==='en'?'Voice unavailable':'裝置不支援語音'):voiceEnabled?(locale==='en'?'🔊 Voice on':'🔊 語音開'):(locale==='en'?'🔇 Voice off':'🔇 語音關')}</Text></Pressable>
  <View testID="companion-speech-slot" pointerEvents="none" style={[s.slot,compact&&{position:'absolute',top:100,left:0,width:180}]}><View testID={reply?"companion-reaction-reply":undefined} style={[s.bubble,{opacity:reply?1:0}]}><View style={s.tail}/><Text accessibilityLiveRegion="polite" style={[s.text,Array.from(reply).length>26?{fontSize:10,lineHeight:12}:reply.length>18?{fontSize:12,lineHeight:14}:null]}>{reply || " "}</Text></View></View>
 </View>;
}
const s=StyleSheet.create({
 voice:{minHeight:44,justifyContent:'center',alignItems:'center',alignSelf:'flex-start',paddingHorizontal:10,marginTop:6,borderRadius:16,borderWidth:1,borderColor:'#dec68c',backgroundColor:'#123d50'},
 voiceText:{fontSize:12,fontWeight:'700',color:'#fff5cf'},
 root:{position:'relative',alignSelf:'center'},
 glow:{...StyleSheet.absoluteFillObject,borderRadius:12,borderWidth:2,borderColor:'#91f5ff',backgroundColor:'rgba(55,211,245,.12)'},
 slot:{height:88,paddingTop:12,width:'100%',justifyContent:'flex-start'},
 bubble:{position:'absolute',left:0,right:0,top:12,minHeight:64,maxWidth:180,paddingVertical:8,paddingHorizontal:9,borderRadius:26,borderTopLeftRadius:22,borderBottomRightRadius:22,borderWidth:2,borderColor:'#dec68c',backgroundColor:'#fff8e5',justifyContent:'center'},
 tail:{position:'absolute',top:-7,left:'42%',width:12,height:12,backgroundColor:'#fff8e5',borderTopWidth:2,borderLeftWidth:2,borderColor:'#dec68c',transform:[{rotate:'45deg'}]},
 text:{fontSize:14,lineHeight:18,textAlign:'center',fontWeight:'700',color:'#193e50'},
});
