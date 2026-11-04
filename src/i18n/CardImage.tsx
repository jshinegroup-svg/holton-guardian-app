import React,{useEffect} from 'react';
import {Image as NativeImage,View,Text,StyleSheet,type ImageProps} from 'react-native';
import {useLocale,t} from './locale';
import {timeChallenges,heroCards,guardianBeasts,worldEvents,activeSkills,transitionCards,sopCards,supportTools,badgeImages,coreGuardianStageImages} from '../data/holtonCatalog';

type Face={title:string;detail?:string;symbol:string};
const key=(source:ImageProps['source'])=>JSON.stringify(source);
const faces=new Map<string,Face>();
for(const card of timeChallenges)faces.set(key(card.imageSource),{title:card.name,detail:card.minutes?`${card.minutes} minutes`:'At your own pace',symbol:'◷'});
for(const card of [...heroCards,...guardianBeasts])faces.set(key(card.imageSource),{title:card.name,symbol:'✦'});
for(const card of [...worldEvents,...activeSkills,...transitionCards,...sopCards,...supportTools])faces.set(key(card.imageSource),{title:card.title,symbol:'✧'});
for(const [name,source] of Object.entries(badgeImages))faces.set(key(source),{title:name.replace(/[-_]/g,' '),symbol:'★'});
const stages=['Young','Growing','Guardian','Awakened'];
for(const [id,images] of Object.entries(coreGuardianStageImages))for(const [i,source] of Object.values(images).entries())faces.set(key(source),{title:guardianBeasts.find(b=>b.id===id)?.name??id,detail:stages[i],symbol:'✦'});
faces.set(key(require('../../assets/cards/custom/master-mode-legendary.jpg')),{title:'Master Mode',detail:'Choose your own time',symbol:'◷'});
/** English cards are native UI, so the original Chinese raster lettering never leaks through. */
export default function CardImage(props:ImageProps & {englishTitle?:string}){
 const {locale}=useLocale();const face=faces.get(key(props.source));
 const english=locale==='en'&&(!!face||!!props.englishTitle);
 useEffect(()=>{if(english)props.onLoad?.({} as Parameters<NonNullable<ImageProps['onLoad']>>[0]);},[english,props.source]);
 if(!english)return <NativeImage {...props} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined}/>;
 const flat=StyleSheet.flatten(props.style)||{};const width=typeof flat.width==='number'?flat.width:150;
 return <View testID={props.testID??'english-card-face'} accessible={props.accessible!==false} aria-hidden={props['aria-hidden']} accessibilityRole="image" accessibilityLabel={t(props.englishTitle??face?.title??'Card')} style={[props.style,{overflow:'hidden',borderRadius:12,borderWidth:2,borderColor:'#dfc57d',backgroundColor:'#103b50',alignItems:'center',justifyContent:'center',padding:Math.max(3,width*.04),gap:5}]}>
 <Text style={{color:'#ffe6a5',fontSize:Math.min(40,width*.24)}}>{face?.symbol??'✧'}</Text>
 <Text numberOfLines={4} adjustsFontSizeToFit style={{color:'#fff0c4',textAlign:'center',fontWeight:'800',fontSize:Math.max(8,Math.min(21,width*.105)),textTransform:'none'}}>{t(props.englishTitle??face?.title??'Card')}</Text>
 {face?.detail&&width>=80?<Text style={{color:'#cde6ea',fontSize:Math.min(14,width*.08),textAlign:'center'}}>{t(face.detail)}</Text>:null}
 </View>;
}
