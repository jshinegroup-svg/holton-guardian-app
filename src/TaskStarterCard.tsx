import React,{useEffect,useRef,useState} from 'react';
import {Animated,type ImageSourcePropType} from 'react-native';
import Image from './i18n/CardImage';
import {Pressable,Text} from './i18n/ui';

/** Keep the original artwork; the whole card is the accessible start control. */
export default function TaskStarterCard({source,disabled,reduced,onStart}:{source:ImageSourcePropType|undefined;disabled:boolean;reduced:boolean;onStart:()=>Promise<unknown>}){
 const scale=useRef(new Animated.Value(1)).current;
 const locked=useRef(false),alive=useRef(true),origin=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);
 const [starting,setStarting]=useState(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;scale.stopAnimation();};},[scale]);
 const restore=()=>{if(reduced)scale.setValue(1);else Animated.spring(scale,{toValue:1,speed:24,bounciness:7,useNativeDriver:true}).start();};
 const start=async()=>{
  if(disabled||locked.current||dragged.current)return;
  locked.current=true;setStarting(true);
  try{
   if(!reduced)await new Promise<void>(resolve=>Animated.sequence([Animated.timing(scale,{toValue:.96,duration:60,useNativeDriver:true}),Animated.spring(scale,{toValue:1,speed:28,bounciness:8,useNativeDriver:true})]).start(()=>resolve()));
   if(alive.current)await onStart();
  }finally{locked.current=false;if(alive.current)setStarting(false);}
 };
 return <Pressable testID="task-starter-card" accessibilityRole="button" accessibilityLabel="點卡片，開始任務" accessibilityState={{disabled:disabled||starting,busy:starting}} disabled={disabled||starting}
  onTouchStart={event=>{const touch=event.nativeEvent.touches?.[0]??event.nativeEvent;origin.current={x:touch.pageX,y:touch.pageY};dragged.current=false;}}
  onTouchMove={event=>{const p=origin.current,touch=event.nativeEvent.touches?.[0]??event.nativeEvent;if(p&&Math.hypot(touch.pageX-p.x,touch.pageY-p.y)>10){dragged.current=true;restore();}}}
  onPressIn={()=>{if(!reduced&&!locked.current)Animated.timing(scale,{toValue:.96,duration:90,useNativeDriver:true}).start();}}
  onPressOut={restore} onPress={()=>void start()}
  style={{alignSelf:'center',width:'90%',alignItems:'center',opacity:disabled?.55:1}}>
  <Animated.View style={{width:'100%',transform:[{scale}]}}><Image source={source} accessibilityLabel="Task Starter 任務啟動卡" style={{height:252,width:'100%'}} resizeMode="contain" /></Animated.View>
  <Text style={{color:'#fff0b3',fontSize:18,fontWeight:'bold',textAlign:'center',paddingVertical:12}}>點卡片，開始任務</Text>
 </Pressable>;
}
