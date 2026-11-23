import React,{useEffect,useState,useRef} from 'react';
import type {LightState} from './LightApp';
import {playAccount,playBalance,startPlay,settlePlay} from './lib/homePlay';
import {Modal,Platform,SafeAreaView,View,ScrollView} from 'react-native';
import {Pressable,Text} from './i18n/ui';

/** Same-origin, isolated game surface. No access to task/reward mutations. */
export default function GuardianHome({visible,onClose,companions,selected,state,change}:{state:LightState;change:(fn:(s:LightState)=>LightState)=>Promise<boolean>;visible:boolean;onClose:()=>void;companions:string[];selected?:string}) {
 const [now,setNow]=useState(Date.now()),[paused,setPaused]=useState(false),[ended,setEnded]=useState(false),[pending,setPending]=useState(false),[notice,setNotice]=useState('');
 const latest=useRef({state,change,onClose});latest.current={state,change,onClose};
 const account=playAccount(state,now),deadline=account.session?.deadline;
 const left=deadline==null?0:Math.max(0,deadline-now);
 const pauseWrite=useRef<Promise<boolean>|null>(null);
 const pause=()=>{setPaused(true);setPending(true);if(pauseWrite.current)return pauseWrite.current;const at=Date.now();
 const task=(async()=>{for(let i=0;i<4;i++){if(await latest.current.change(s=>settlePlay(s,at)))return true;await new Promise(r=>setTimeout(r,250));}return false;})();
 pauseWrite.current=task;void task.finally(()=>{pauseWrite.current=null;setPending(false);});return task;};
 const close=async()=>{await pause();latest.current.onClose();};
 useEffect(()=>{if(!visible)return;setEnded(false);setPaused(false);setNow(Date.now());const tick=setInterval(()=>setNow(Date.now()),200);
 const hide=()=>{if(document.hidden)void pause();};
 document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',pause);
 return()=>{clearInterval(tick);document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',pause);};},[visible]);
 useEffect(()=>{if(!visible||ended)return;if((deadline!=null&&left<=0)||(state.homePlay?.session&&state.homePlay.day!==account.day)){setEnded(true);void latest.current.change(s=>settlePlay(s));}},[visible,deadline,left,ended,account.day,state.homePlay]);
 useEffect(()=>{if(!visible||!ended)return;const t=setTimeout(()=>latest.current.onClose(),5000);return()=>clearTimeout(t);},[ended,visible]);
 const start=async()=>{setPending(true);const ok=await change(s=>startPlay(s));if(ok){setPaused(false);setNotice('');setNow(Date.now());}else setNotice('尚未確認保存，請先返回村莊查看同步提示，再試一次。');setPending(false);};
 const active=!paused&&!ended&&left>0;
 if(!visible)return null; // Unmounting the frame releases its microphone and audio graph.
 return <Modal visible animationType="none" onRequestClose={()=>void close()}>
  <SafeAreaView testID="guardian-home-screen" style={{flex:1,backgroundColor:'#071820'}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:8,gap:12}}>
    <Pressable accessibilityRole="button" accessibilityLabel="離開守護獸小屋，回到村莊" onPress={()=>void close()} style={{padding:12,borderWidth:1,borderColor:'#c6ac67',borderRadius:12}}><Text style={{color:'#fff0c1'}}>‹ 回到村莊</Text></Pressable>
    <Text style={{color:'#fff0c1',flex:1}}>守護獸小屋{active?` · ${Math.ceil(left/1000)} 秒`:""}</Text>
   </View>
   {active&&left<=30000?<Text accessibilityRole="alert" style={{color:'#fff0c1',padding:10}}>再玩一下，就要休息囉！</Text>:null}
   {!active?<ScrollView testID="home-play-gate" contentContainerStyle={{padding:24,gap:18}}><Text style={{color:'#fff0c1',fontSize:24}}>{ended?'🐾 謝謝你陪我玩！我們回村莊囉。':'🐾 夥伴在小屋等你'}</Text><Text style={{color:'#fff0c1'}}>{ended?'5 秒後自動返回村莊。':`今日剩餘可玩 ${Math.ceil(playBalance(account)/60000)} 分鐘。小任務確認完成 +2 分鐘；全部完成再 +10，每日最多 15 分鐘。`}</Text>{!ended&&(account.session||playBalance(account)>0&&(account.bonus||account.receipts.length>account.gate))?<Pressable accessibilityRole="button" disabled={pending} onPress={()=>void start()} style={{padding:18,backgroundColor:'#176975',borderRadius:12}}><Text style={{color:'#fff'}}>▶ {pending?'正在保存…':account.session?'繼續陪夥伴玩':`開始玩（最多 ${account.bonus?10:2} 分鐘）`}</Text></Pressable>:!ended?<Text style={{color:'#fff0c1'}}>完成並確認下一個小任務，就能再陪我玩。今日已達上限則明天再來。</Text>:null}<Pressable accessibilityRole="button" onPress={()=>void close()} style={{padding:20,backgroundColor:'#176975',borderRadius:12}}><Text style={{color:'#fff',fontSize:22}}>🏡 回到村莊</Text></Pressable>{notice?<Text accessibilityRole="alert" style={{color:'#fff0c1'}}>{notice}</Text>:null}</ScrollView>:Platform.OS==='web'?React.createElement('iframe',{
    title:'守護獸互動小屋',src:'/guardian-home/complete-home/index.html?v=play-time1&companions='+encodeURIComponent(companions.join(','))+'&companion='+encodeURIComponent(selected||companions[0]||''),
    allow:'microphone',style:{border:0,width:'100%',flex:1,minHeight:0,background:'#071820'},
    'data-testid':'guardian-home-frame'
   }):<Text style={{color:'#fff0c1',padding:20}}>請使用網頁版開啟互動小屋。</Text>}
  </SafeAreaView>
 </Modal>;
}
