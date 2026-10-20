import React,{useEffect,useRef,useState} from 'react';
import {Image,Platform,View,type ImageProps} from 'react-native';

/** Reserve layout; fetch nearby shop art once, retaining it when scrolled away. */
export default function DeferredCardImage(props:ImageProps){
 const ref=useRef<React.ElementRef<typeof View>>(null);
 const [visible,setVisible]=useState(Platform.OS!=='web');
 useEffect(()=>{
  if(visible)return;
  if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}
  const node=ref.current as unknown as Element|null;
  if(!node){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:'450px 0px'});
  observer.observe(node);return()=>observer.disconnect();
 },[visible]);
 return <View ref={ref} style={props.style} testID="deferred-card-art">
  {visible?<Image {...props} fadeDuration={0} style={{width:'100%',height:'100%'}}/>:null}
 </View>;
}
