import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, StyleSheet, View, type ImageSourcePropType} from 'react-native';

/** Presentation only: the draw is saved before this reveal begins. */
export default function WorldDrawArt({source, title, reduced, height}: {source?:ImageSourcePropType; title?:string; reduced:boolean; height:number}) {
  const initiallyRevealed = useRef(!!source).current;
  const turn = useRef(new Animated.Value(initiallyRevealed ? 1 : 0)).current;
  const [loaded, setLoaded] = useState(initiallyRevealed);
  useEffect(() => {
    if (!source || !loaded) return;
    if (reduced) { turn.setValue(1); return; }
    const animation = Animated.timing(turn, {toValue:1,duration:580,useNativeDriver:true});
    animation.start();
    return () => animation.stop();
  }, [source, loaded, reduced, turn]);
  return <View testID="world-draw-art" style={[styles.stage,{height,width:height*2/3}]}>
    <Animated.View style={[styles.face,{transform:[{perspective:800},{rotateY:turn.interpolate({inputRange:[0,1],outputRange:['0deg','180deg']})}]}]}>
      <Image source={require('../assets/world-draw/world-card-back.jpg')} accessibilityLabel="世界卡黑金卡背" resizeMode="contain" style={styles.image}/>
    </Animated.View>
    {source ? <Animated.View style={[styles.face,{transform:[{perspective:800},{rotateY:turn.interpolate({inputRange:[0,1],outputRange:['-180deg','0deg']})}]}]}>
      <Image source={source} accessibilityLabel={title} resizeMode="contain" style={styles.image} onLoad={()=>setLoaded(true)}/>
    </Animated.View> : null}
  </View>;
}
const styles=StyleSheet.create({
  stage:{alignSelf:'center',marginVertical:3,shadowColor:'#f6bb48',shadowOpacity:0.25,shadowRadius:16,shadowOffset:{width:0,height:0}},
  face:{...StyleSheet.absoluteFillObject,backfaceVisibility:'hidden'},
  image:{width:'100%',height:'100%',borderRadius:10},
});
