import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle} from 'react-native';

const webGlow=Platform.OS==='web'?({backgroundImage:'radial-gradient(circle, rgba(255,204,100,.9) 0%, rgba(240,174,55,.5) 35%, rgba(240,174,55,0) 72%)',shadowOpacity:0} as unknown as ViewStyle):undefined;

/** Visual choreography only; the parent saves each draw before revealing it. */
export default function WorldDrawArt({source,title,reduced,height,children,onCollect,saving}: {
  source?:ImageSourcePropType;title?:string;reduced:boolean;height:number;children:React.ReactNode;
  onCollect:()=>Promise<boolean>;saving:boolean;
}) {
  const initial=useRef(!!source).current;
  const breath=useRef(new Animated.Value(0)).current;
  const ritual=useRef(new Animated.Value(initial?1:0)).current;
  const departure=useRef(new Animated.Value(0)).current;
  const [loaded,setLoaded]=useState(initial);
  const [revealed,setRevealed]=useState(initial);
  const [leaving,setLeaving]=useState(false);
  const collecting=useRef(false);
  useEffect(()=>{
    if(source||reduced) {breath.stopAnimation();breath.setValue(0);return;}
    const loop=Animated.loop(Animated.sequence([
      Animated.timing(breath,{toValue:1,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(breath,{toValue:0,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));loop.start();return()=>loop.stop();
  },[source,reduced,breath]);
  useEffect(()=>{
    if(!source||!loaded)return;
    if(initial||reduced){ritual.setValue(1);setRevealed(true);return;}
    const animation=Animated.timing(ritual,{toValue:1,duration:1500,easing:Easing.linear,useNativeDriver:true});
    animation.start(({finished})=>{if(finished)setRevealed(true)});
    return()=>animation.stop();
  },[source,loaded,reduced,initial,ritual]);
  useEffect(()=>()=>departure.stopAnimation(),[departure]);
  const collect=()=>{
    if(collecting.current||saving)return;
    collecting.current=true;setLeaving(true);
    const finish=async()=>{const ok=await onCollect();if(!ok){departure.setValue(0);collecting.current=false;setLeaving(false)}};
    if(reduced){void finish();return;}
    Animated.timing(departure,{toValue:1,duration:260,useNativeDriver:true}).start(({finished})=>{if(finished)void finish()});
  };
  const interpolate=(inputRange:number[],outputRange:number[])=>ritual.interpolate({inputRange,outputRange,extrapolate:'clamp'});
  return <View style={styles.layout}>
    <View testID="world-ritual-stage" style={[styles.stage,{height:height+22}]}>
      <Animated.View pointerEvents="none" style={[styles.halo,webGlow,{width:height*1.25,height:height*1.25,borderRadius:height,
        opacity:source?interpolate([0,.3,.7,1],[.25,.7,.5,.18]):breath.interpolate({inputRange:[0,1],outputRange:[.18,.4]}),
        transform:[{scale:source?interpolate([0,.32,.65,1],[1,.72,1.2,1]):breath.interpolate({inputRange:[0,1],outputRange:[.93,1.06]})}]}]}/>
      {source&&!initial&&!reduced?<Animated.View testID="world-reveal-ring" pointerEvents="none" style={[styles.ring,{width:height*.8,height:height*.8,borderRadius:height,opacity:interpolate([0,.5,.62,1],[0,0,.65,0]),transform:[{scale:interpolate([0,.5,1],[.65,.65,1.6])}]}]}/>:null}
      {[-1,1].flatMap(side=>[0,1,2].map(i=><Animated.View key={`${side}-${i}`} pointerEvents="none" style={[styles.spark,{left:'50%',top:'50%',opacity:source?interpolate([0,.33,.65,1],[.5,.9,.65,0]):breath.interpolate({inputRange:[0,1],outputRange:[.18+i*.1,.75-i*.1]}),transform:[{translateX:source?interpolate([0,.33,.65,1],[side*(height*.4+i*5),side*22,side*(height*.43+i*8),side*(height*.44+i*8)]):side*(height*.4+i*5)},{translateY:source?interpolate([0,.33,.65,1],[(i-1)*55,0,(i-1)*68,(i-1)*74]):(i-1)*55}]}]}/>))}
      <Animated.View testID="world-draw-art" style={{height,width:height*2/3,opacity:departure.interpolate({inputRange:[0,1],outputRange:[1,0]}),transform:[{translateY:source?0:breath.interpolate({inputRange:[0,1],outputRange:[2,-3]})},{scale:Animated.multiply(source?interpolate([0,.33,.7,1],[1,1.055,1.025,1]):1,departure.interpolate({inputRange:[0,1],outputRange:[1,.82]}))}]}}>
        <Animated.View style={[styles.face,{transform:[{perspective:800},{rotateY:ritual.interpolate({inputRange:[0,.33,.73,1],outputRange:['0deg','0deg','180deg','180deg']})}]}]}>
          <Image source={require('../assets/world-draw/world-card-back.jpg')} accessibilityLabel="世界卡黑金卡背" resizeMode="contain" style={styles.image}/>
        </Animated.View>
        {source?<Animated.View style={[styles.face,{transform:[{perspective:800},{rotateY:ritual.interpolate({inputRange:[0,.33,.73,1],outputRange:['-180deg','-180deg','0deg','0deg']})}]}]}>
          <Image source={source} accessibilityLabel={title} resizeMode="contain" style={styles.image} onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}/>
        </Animated.View>:null}
      </Animated.View>
    </View>
    {source&&!revealed?<Text accessibilityLiveRegion="polite" style={styles.status}>{loaded?'你的努力，正在喚醒世界…':'世界卡正在到來…'}</Text>:null}
    <Animated.View testID="world-draw-details" pointerEvents={source&&!revealed?'none':'auto'} accessibilityElementsHidden={!!source&&!revealed} style={[styles.layout,{opacity:source?interpolate([0,.78,1],[0,0,1]):1}]}>
      {children}
      {source?<Pressable accessibilityRole="button" accessibilityLabel="收下世界卡" disabled={!revealed||leaving||saving} onPress={collect} style={[styles.button,(!revealed||leaving||saving)&&{opacity:.5}]}><Text style={styles.buttonText}>收下世界卡</Text></Pressable>:null}
    </Animated.View>
  </View>;
}
const styles=StyleSheet.create({
  layout:{gap:10},stage:{alignItems:'center',justifyContent:'center'},
  halo:{position:'absolute',backgroundColor:'transparent',borderWidth:0,shadowColor:'#ffc45c',shadowOpacity:.8,shadowRadius:28,shadowOffset:{width:0,height:0}},
  ring:{position:'absolute',borderWidth:2,borderColor:'#ffe5a0'},spark:{position:'absolute',width:4,height:4,borderRadius:2,backgroundColor:'#ffe7ac'},
  face:{...StyleSheet.absoluteFillObject,backfaceVisibility:'hidden'},image:{width:'100%',height:'100%',borderRadius:10},
  status:{position:'absolute',bottom:64,alignSelf:'center',color:'#ffe6a5',fontSize:16},
  button:{minHeight:58,borderWidth:2,borderColor:'#c8b078',backgroundColor:'#076f89',borderRadius:32,alignItems:'center',justifyContent:'center',padding:14},buttonText:{fontSize:20,fontWeight:'700',color:'#fff'},
});
