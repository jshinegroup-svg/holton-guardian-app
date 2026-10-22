import {useFamilyStorage} from './family/context';
import React,{useEffect,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const MUSIC_HINT_KEY='holton-guardian-app::task-music-hint-v1';
/** Inline and dismissible: never blocks the task or starts audio. */
export default function TaskMusicHint({enabled}:{enabled:boolean}){
 const {storage}=useFamilyStorage();
 const [show,setShow]=useState(false);
 useEffect(()=>{let live=true;void storage.getItem(MUSIC_HINT_KEY).then(value=>{if(live)setShow(value!=='done')});return()=>{live=false;};},[]);
 if(!show)return null;
 return <View testID="task-music-hint" style={{maxWidth:280,padding:10,gap:6,borderRadius:12,backgroundColor:'#123a4b',borderWidth:1,borderColor:'#c7ae7d'}}><Text style={{color:'#fff0c9',fontSize:14,lineHeight:21}}>{enabled?'音樂已開啟，點上方開關可以關閉。':'想要音樂陪伴，可以點上方開關開啟。'}家長小屋的「音樂」可以試聽、選曲；安靜做任務也很好。</Text><Pressable accessibilityRole="button" accessibilityLabel="知道了，關閉音樂提示" onPress={()=>{void storage.setItem(MUSIC_HINT_KEY,'done').then(()=>setShow(false));}} style={{padding:8,minHeight:44,justifyContent:'center'}}><Text style={{color:'#ffe2a0',textAlign:'right'}}>知道了</Text></Pressable></View>;
}
