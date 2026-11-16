import React,{useEffect,useRef,useState} from 'react';
import {View,ScrollView,Pressable,StyleSheet} from 'react-native';
import {Text} from '../i18n/ui';
import Image from '../i18n/CardImage';
import {useLocale} from '../i18n/locale';
import {WorldBackdrop,useSystemReducedMotion} from '../SkyWorld';
import TaskStarterCard from '../TaskStarterCard';
import {timeChallenges,sopCards,supportTools,transitionCards,activeSkills} from '../data/holtonCatalog';
import {helpDurations} from '../lib/helpSession';
import type {LightState} from '../LightApp';
import {homework,updateDay} from './model';
import {useFamilyStorage} from '../family/context';
const cards=[
 {id:'pause',zh:'暫停',en:'Pause',source:supportTools.find(c=>c.id==='time-freeze')?.imageSource},
 {id:'rest',zh:'休息',en:'Rest',source:transitionCards.find(c=>c.id==='break-time')?.imageSource},
 {id:'energy',zh:'加油',en:'Recharge',source:supportTools.find(c=>c.id==='energy-boost')?.imageSource},
 {id:'breathe',zh:'深呼吸',en:'Breathe',source:activeSkills.find(c=>c.id==='breather-1')?.imageSource},
] as const;
type Props={state:LightState;date:string;taskId:string;change:(fn:(s:LightState)=>LightState)=>Promise<boolean>;onBack:()=>void;error:string;recovery?:React.ReactNode};
export default function FocusFlow({state,date,taskId,change,onBack,error,recovery}:Props){
 const {locale}=useLocale(),en=locale==='en',tr=(a:string,b:string)=>en?b:a;
 const {storage}=useFamilyStorage();const reduced=useSystemReducedMotion();
 const timer=homework(state).timer,task=homework(state).days[timer?.date??date]?.tasks.find(t=>t.id===(timer?.task??taskId));
 const [minutes,setMinutes]=useState<number|null>(null),[now,setNow]=useState(Date.now()),[busy,setBusy]=useState(false),[photo,setPhoto]=useState<string|null>(null),[notice,setNotice]=useState('');
 const lock=useRef(false);
 useEffect(()=>{const tick=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(tick)},[]);
 const remaining=timer?Math.max(0,timer.deadline?Math.ceil((timer.deadline-now)/1000):timer.remaining):0;
 const help=!!timer&&(timer.helpOpen||!timer.deadline&&remaining>0),rest=timer?.mode==='rest';
 const digits=(v:number)=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;
 async function commit(fn:(s:LightState)=>LightState){if(lock.current)return false;lock.current=true;setBusy(true);setNotice('');try{return await change(fn)}finally{lock.current=false;setBusy(false)}}
 // Reject stale UI actions after a remote/recovery update.
 async function mutate(fn:(s:LightState,t:NonNullable<ReturnType<typeof homework>['timer']>)=>LightState){let applied=false;const ok=await commit(s=>{const t=homework(s).timer;if(!t||JSON.stringify(t)!==JSON.stringify(timer))return s;applied=true;return fn(s,t)});return ok&&applied}
 const patch=(fields:object)=>mutate((s,t)=>({...s,homework:{...homework(s),timer:{...t,...fields}}}));
 const begin=()=>commit(s=>{const h=homework(s),d=h.days[date],t=d?.tasks.find(t=>t.id===taskId);if(h.timer||!t||t.confirmed||d.claimedAt)return s;const seconds=(minutes??10)*60;return {...s,homework:{...h,timer:{date,task:taskId,mode:'focus',focusSeconds:seconds,remaining:seconds,deadline:Date.now()+seconds*1000,usedHelp:[]}}}});
 const openHelp=()=>{void mutate((s,t)=>({...s,homework:{...homework(s),timer:{...t,remaining:Math.max(0,t.deadline?Math.ceil((t.deadline-Date.now())/1000):t.remaining),deadline:null,helpOpen:true}}}))};
 const resume=()=>{const seconds=rest||remaining===0?(timer?.focusSeconds??600):remaining;return patch({mode:'focus',remaining:seconds,deadline:Date.now()+seconds*1000,helpOpen:false,helpCard:undefined,helpDeadline:undefined})};
 const report=async()=>{if(await mutate((s,t)=>{const next=updateDay(s,t.date,d=>({...d,tasks:d.tasks.map(x=>x.id===t.task?{...x,reported:true}:x)}));return {...next,homework:{...homework(next),timer:undefined}}}))onBack()};
 const button=(label:string,action:()=>void,disabled=false)=><Pressable accessibilityRole="button" disabled={busy||disabled} onPress={action} style={[s.button,(busy||disabled)&&{opacity:.45}]}><Text style={s.text}>{label}</Text></Pressable>;
 const world=state.activeWorld??'forest',completed=state.journeys?.counts?.[world]??0;
 const focus=!!timer&&!help&&!rest&&remaining>0;
 return <View testID="homework-focus-flow" style={s.root}><WorldBackdrop scene={focus?'focus':rest?'rest':'home'} world={world} completed={completed}/>
 <ScrollView contentContainerStyle={[s.content,focus&&{justifyContent:'center'}]}>
 {recovery}{error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}{notice?<Text accessibilityRole="alert" style={s.text}>{notice}</Text>:null}
 {photo!==null?<View style={s.panel}>{button(tr('返回／關閉照片','Back / Close photo'),()=>setPhoto(null))}{photo?(photo.startsWith('data:application/pdf')?<iframe title="Notebook PDF" src={photo} style={{width:'100%',height:'65vh',border:0}}/>:<img src={photo} alt={tr('聯絡簿','Notebook')} style={{width:'100%'}}/>):<Text style={s.text}>{tr('這一天尚未保存照片。','No notebook saved for this day.')}</Text>}</View>:
 !timer?<View style={s.panel}><Text style={s.title}>{task?.title}</Text><Text style={s.text}>{task?.detail}</Text>{minutes===null?<><Text style={s.title}>{tr('這次想專注多久？','Choose your focus time')}</Text><View style={s.row}>{timeChallenges.filter(c=>c.minutes===10||c.minutes===15).map(c=><Pressable key={c.id} testID={`homework-time-${c.minutes}`} accessibilityRole="button" accessibilityLabel={`${c.minutes} ${tr('分鐘','minutes')}`} onPress={()=>setMinutes(c.minutes)} style={s.timeCard}><Image source={c.imageSource} resizeMode="contain" style={{width:'100%',height:230}}/><Text style={s.title}>{c.minutes} {tr('分鐘','minutes')}</Text></Pressable>)}</View>{button(tr('回到功課','Back to homework'),onBack)}</>:<><Text style={s.title}>{minutes} {tr('分鐘 · 準備好再開始','minutes · Start when ready')}</Text><TaskStarterCard source={sopCards.find(c=>c.id==='task-starter')?.imageSource} disabled={busy} reduced={reduced||!!state.reduceMotion} onStart={begin}/>{button(tr('重選時間','Choose another time'),()=>setMinutes(null))}</>}</View>:
 focus?<><View testID="homework-focus-frame" style={s.clock}><Text style={s.label}>{tr('專注時間','FOCUS TIME')}</Text><Text testID="homework-countdown" style={s.digits}>{digits(remaining)}</Text></View><Pressable testID="homework-focus-help" accessibilityRole="button" accessibilityLabel={tr('返回／需要幫忙','Back / Need help')} disabled={busy} onPress={openHelp} style={[s.focusHelp,busy&&{opacity:.6}]}><Text selectable={false} style={s.focusHelpText}>{tr('返回／需要幫忙','Back / Need help')}</Text></Pressable></>:
 <View style={s.panel}><Text style={s.title}>{help?tr('需要哪一種幫忙？','What would help?'):rest?tr('休息一下','Take a break'):tr('這段專注完成了','Focus round finished')}</Text>
 <Text style={s.text}>{task?.title} · {tr('專注剩餘','Focus remaining')} {digits(rest?0:remaining)}</Text>
 {help?<>{timer.helpCard?<><Image source={cards.find(c=>c.id===timer.helpCard)?.source} resizeMode="contain" style={{width:'100%',height:230}}/><Text style={s.title}>{timer.helpDeadline?digits(Math.max(0,Math.ceil((timer.helpDeadline-now)/1000))):tr('準備好再回來','Return when ready')}</Text><Text style={s.text}>{timer.helpCard==='breathe'?tr('慢慢吸氣、吐氣，做三次。','Breathe in and out slowly, three times.'):timer.helpCard==='energy'?tr('喝口水，伸展一下。','Have some water and stretch.'):tr('讓身體放鬆一下。','Let your body relax.')}</Text>{button(tr('查看其他幫助卡','Other help cards'),()=>void patch({helpCard:undefined,helpDeadline:undefined}))}</>:<View style={[s.row,{flexWrap:'wrap'}]}>{cards.map(c=>{const used=timer.usedHelp?.includes(c.id);return <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`${tr(c.zh,c.en)}${used?tr(' 已使用',' Used'):''}`} disabled={busy||used} onPress={()=>void patch({helpCard:c.id,usedHelp:[...(timer.usedHelp??[]),c.id],helpDeadline:helpDurations[c.id]===null?undefined:Date.now()+helpDurations[c.id]!})} style={[s.helpCard,used&&{opacity:.4}]}><Image source={c.source} resizeMode="contain" style={{width:'100%',height:170}}/><Text style={s.text}>{tr(c.zh,c.en)} · {used?tr('已使用','Used'):helpDurations[c.id]===null?tr('不限時','No limit'):`${helpDurations[c.id]!/60000} ${tr('分鐘','min')}`}</Text></Pressable>})}</View>}
 {button(tr('查看聯絡簿','View notebook'),()=>{if(lock.current)return;setBusy(true);lock.current=true;void storage.getItem(`homework-photo:${timer.date}`).then(p=>setPhoto(p??'')).catch(()=>setNotice(tr('讀取失敗，請重試。','Could not load. Please retry.'))).finally(()=>{lock.current=false;setBusy(false)})})}</>:rest?<Text testID="homework-rest-countdown" style={s.title}>{digits(remaining)}</Text>:<Text style={s.text}>{tr('時間到了不代表功課做完；可以休息或再做一段。','Time elapsed is not task completion. Rest or focus again.')}</Text>}
 {button(remaining>0&&!rest?tr('接續專注','Resume focus'):tr(`繼續專注 ${(timer.focusSeconds??600)/60} 分鐘`,`Focus ${(timer.focusSeconds??600)/60} minutes`),()=>void resume())}
 {!help&&!rest?button(tr('休息2分鐘','Rest 2 minutes'),()=>void patch({mode:'rest',remaining:120,deadline:Date.now()+120000})):null}
 {button(tr('我完成了，請確認','I finished — please check'),()=>void report(),!!task?.reported)}
 {button(tr('結束計時，回到星陣','End timer and return'),()=>void (async()=>{if(await mutate((s)=>({...s,homework:{...homework(s),timer:undefined}})))onBack()})())}
 </View>}
 </ScrollView></View>;
}
const s=StyleSheet.create({root:{flex:1,minHeight:540,backgroundColor:'#071e2d'},content:{flexGrow:1,alignItems:'center',padding:18,gap:24},panel:{width:'100%',maxWidth:620,padding:16,gap:14,backgroundColor:'rgba(6,27,48,.84)',borderWidth:1,borderColor:'#b89a61',borderRadius:24},title:{color:'#fff0c1',fontSize:24,fontWeight:'700',textAlign:'center'},text:{color:'#fff0d5',fontSize:17,lineHeight:25,textAlign:'center'},label:{color:'#f4dfac',fontSize:15,textAlign:'center'},row:{flexDirection:'row',gap:10,justifyContent:'center'},timeCard:{flex:1,minWidth:0},helpCard:{width:'47%',alignItems:'center'},button:{minHeight:48,justifyContent:'center',padding:10,borderRadius:14,borderWidth:1,borderColor:'#b89a61',backgroundColor:'#102f40'},clock:{width:'100%',maxWidth:380,borderWidth:1,borderColor:'rgba(225,193,128,.65)',backgroundColor:'rgba(6,27,48,.72)',borderRadius:28,paddingVertical:30,gap:12},digits:{fontSize:72,lineHeight:90,color:'#fff',fontWeight:'700',fontVariant:['tabular-nums'],textAlign:'center'},focusHelp:{width:'100%',maxWidth:380,minHeight:56,alignItems:'center',justifyContent:'center',padding:14,borderRadius:16,borderWidth:2,borderColor:'#dfbd76',backgroundColor:'rgba(6,27,48,.94)',userSelect:'none'},focusHelpText:{color:'#fff0c1',fontSize:19,fontWeight:'700',textAlign:'center',userSelect:'none'},error:{color:'#ffbda5',fontSize:16}});
