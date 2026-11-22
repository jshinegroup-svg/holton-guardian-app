import React from 'react';
import {Modal,Platform,SafeAreaView,View} from 'react-native';
import {Pressable,Text} from './i18n/ui';

/** Same-origin, isolated game surface. No access to task/reward mutations. */
export default function GuardianHome({visible,onClose,companions,selected}:{visible:boolean;onClose:()=>void;companions:string[];selected?:string}) {
 if(!visible)return null; // Unmounting the frame releases its microphone and audio graph.
 return <Modal visible animationType="none" onRequestClose={onClose}>
  <SafeAreaView testID="guardian-home-screen" style={{flex:1,backgroundColor:'#071820'}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:8,gap:12}}>
    <Pressable accessibilityRole="button" accessibilityLabel="離開守護獸小屋，回到村莊" onPress={onClose} style={{padding:12,borderWidth:1,borderColor:'#c6ac67',borderRadius:12}}><Text style={{color:'#fff0c1'}}>‹ 回到村莊</Text></Pressable>
    <Text style={{color:'#fff0c1',flex:1}}>守護獸小屋</Text>
   </View>
   {Platform.OS==='web'?React.createElement('iframe',{
    title:'守護獸互動小屋',src:'/guardian-home/complete-home/index.html?v=floating-tools1&companions='+encodeURIComponent(companions.join(','))+'&companion='+encodeURIComponent(selected||companions[0]||''),
    allow:'microphone',style:{border:0,width:'100%',flex:1,minHeight:0,background:'#071820'},
    'data-testid':'guardian-home-frame'
   }):<Text style={{color:'#fff0c1',padding:20}}>請使用網頁版開啟互動小屋。</Text>}
  </SafeAreaView>
 </Modal>;
}
