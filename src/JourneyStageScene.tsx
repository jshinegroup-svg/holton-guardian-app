import React from 'react';
import {Image,View,type StyleProp,type ViewStyle} from 'react-native';
import {worlds,type WorldId} from './lib/journeys';

// Six locked-camera frames per chapter: dormant + five cumulative changes.
const sheets={
 forest:[require('../assets/worlds/journey-stages/forest-0.jpg'),require('../assets/worlds/journey-stages/forest-1.jpg'),require('../assets/worlds/journey-stages/forest-2.jpg')],
 sky:[require('../assets/worlds/journey-stages/sky-0.jpg'),require('../assets/worlds/journey-stages/sky-1.jpg'),require('../assets/worlds/journey-stages/sky-2.jpg')],
 cosmos:[require('../assets/worlds/journey-stages/cosmos-0.jpg'),require('../assets/worlds/journey-stages/cosmos-1.jpg'),require('../assets/worlds/journey-stages/cosmos-2.jpg')],
};
export function journeyStage(completed:number){const n=Math.max(0,Math.min(15,Math.trunc(completed)||0));const chapter=Math.min(2,Math.floor(Math.max(0,n-1)/5));return {chapter,step:n-chapter*5};}
export default function JourneyStageScene({world,chapter,step,style,testID='journey-stage-scene',label}:{world:WorldId;chapter:number;step:number;style?:StyleProp<ViewStyle>;testID?:string;label?:string}){
 const c=Math.max(0,Math.min(2,Math.trunc(chapter)||0)),frame=Math.max(0,Math.min(5,Math.trunc(step)||0));
 const description=label??`${worlds[world].chapters[c]} · ${frame===0?'尚未點亮':worlds[world].steps[c*5+frame-1]}`;
 return <View testID={testID} accessibilityLabel={description} accessibilityRole="image" style={[{width:'100%',aspectRatio:1,overflow:'hidden',borderRadius:12,backgroundColor:'#0a2337'},style]}>
  <View style={{position:'absolute',width:'101.2%',height:'101.2%',left:'-0.6%',top:'-0.6%'}}>
  <Image key={`${world}-${c}`} testID={`journey-frame-${world}-${c}-${frame}`} source={sheets[world][c]} resizeMode="stretch" accessible={false} style={{position:'absolute',width:'300%',height:'200%',left:`${-(frame%3)*100}%`,top:`${-Math.floor(frame/3)*100}%`}}/>
  </View>
 </View>;
}
