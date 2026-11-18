import React,{useEffect,useState,useRef} from 'react';
import {Modal,ScrollView,View,StyleSheet,Pressable} from 'react-native';
import {Text} from '../i18n/ui';
import {useLocale} from '../i18n/locale';

export const HOMEWORK_GUIDE_KEY='homework-guide-v1';
type Props={visible:boolean;onClose:()=>void;button:(label:string,fn:()=>void,secondary?:boolean,disabled?:boolean)=>React.ReactNode};
export default function HomeworkGuide({visible,onClose,button}:Props){
 const {locale}=useLocale(),en=locale==='en';
 const [step,setStep]=useState(0);
 const scroll=useRef<ScrollView>(null);
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false})},[step,visible]);
 useEffect(()=>{if(visible)setStep(0)},[visible]);
 const steps=[
  ['📚','從功課卡出發','在原本的左右選卡軸找到「功課冒險」，按「進入功課模式」。這不是分鐘卡，不會立刻開始倒數。','Find the homework card','Find Homework Quest in the task-card carousel and choose Enter homework mode. Entering does not start a timer.'],
  ['📅','先安排哪一天的功課','先選聯絡簿的功課日期，再由大人解鎖「安排功課」。左邊勾科目，右邊可填頁數、課次或次數；按保存才會更新星陣，也可以提前安排明天。','Prepare the right day','Choose the homework date, then ask a grown-up to unlock Prepare homework. Select subjects and optionally add pages or lessons. Save to update the stars. You can prepare tomorrow too.'],
  ['📷','照片隨時拿出來看','安排時可附聯絡簿照片或PDF；孩子按「查看聯絡簿」就能對照。也可選「拍照／上傳，自動填入」，辨識書寫、背誦與閱讀等任務，取消不需要的勾選，核對日期與頁數再保存；需要後端已設定辨識服務。登入家庭帳號後，保存的照片／PDF與功課可跨裝置查看。舊照片需先在原裝置開啟該日聯絡簿一次補同步；未保存草稿仍只暫存原分頁。查看不需家長密碼，可用昨天／今天／明天或日曆切換日期。','Keep the notebook nearby','Attach a notebook photo or PDF during preparation, then use View notebook to check it. Or choose Photo / upload — auto-fill, then review the date and pages before saving selected learning tasks. Recognition requires the backend service to be configured. Saved photos/PDFs and homework sync within your family account. Open older notebooks once on the original device to sync them. Unsaved drafts remain in the original tab. View without a parent PIN; choose Yesterday, Today, Tomorrow or the calendar.'],
  ['⏱','自己選科目，照節奏休息','點任何科目徽章開始，不用照順序。在功課頁直接點10或15分鐘原卡，再點Task Starter才開始；重選時間會回到功課頁。專注頁保留倒數與「返回／需要幫忙」按鈕；輕點一次開啟幫助卡、查看照片或提早回報。返回接續時間，時間到不等於功課完成。','Choose a subject and a rhythm','Tap any subject in any order. Choose a 10 or 15 minute card directly on the homework detail page, then tap Task Starter to start. Choose another time returns to the detail page. Tap Back / Need help once to open help cards, view the notebook or report completion. Resume keeps your remaining time. A finished timer does not finish the task.'],
  ['✨','請老師或家長點亮符文','孩子回報後，由大人進「老師／家長確認」解鎖核對。確認哪一項，哪一枚符文就轉金色。「7天紀錄」包含前5天、今天與明天，可回看功課內容；更早未完成、待確認或待領獎另列。','Ask a grown-up to light the rune','A grown-up unlocks Grown-up review and checks the work. Confirmed subjects turn gold. 7-day history includes the previous 5 days, today and tomorrow. Earlier unfinished, awaiting-review or unclaimed homework is listed separately.'],
  ['🎁','全部點亮，傳送領寶藏','當天全部功課確認完成，直接點中央發光傳送門，再按開寶箱領10點。同一天只領一次，計時與休息不另外加點。每項功課確認後累積1格抽卡進度，每3格抽1張，跨日保留。整份開箱不重複累積抽卡。','Light every rune and collect treasure','Once all homework for the day is confirmed, tap the glowing central portal and open the chest for 10 points. Each day pays once; focus and rest timers do not add extra points. Each confirmed task adds one card credit; three credits earn one draw, carried across days. The chest adds no extra card credit.'],
 ];
 const s=steps[step];
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.shade}><ScrollView ref={scroll} testID="homework-guide" style={styles.card} contentContainerStyle={styles.content} accessibilityViewIsModal>
  <Text style={styles.kicker}>{en?'Homework Quest guide':'功課冒險教學'} · {step+1}/{steps.length}</Text>
  <Text style={styles.icon}>{s[0]}</Text><Text accessibilityRole="header" style={styles.title}>{s[en?3:1]}</Text>
  <Text style={styles.body}>{s[en?4:2]}</Text>
  <Text style={styles.note}>{en?'This guide does not change tasks, timers or rewards.':'教學只做說明，不會替你勾選功課、啟動計時或領獎。'}</Text>
  <View style={{flexDirection:'row',gap:8}}>{step>0?<View style={{flex:1}}>{button(en?'Previous':'上一步',()=>setStep(v=>v-1),true)}</View>:null}<View style={{flex:1}}>
  {button(step===steps.length-1?(en?'Got it — explore':'知道了，開始探索'):(en?'Next':'下一步'),()=>step===steps.length-1?onClose():setStep(v=>v+1))}
  </View></View><Pressable accessibilityRole="button" onPress={onClose} style={{minHeight:44,justifyContent:'center'}}><Text style={styles.kicker}>{en?'Skip for now':'先略過'}</Text></Pressable>
 </ScrollView></View></Modal>;
}
const styles=StyleSheet.create({shade:{flex:1,backgroundColor:'#020c18dd',justifyContent:'center',alignItems:'center',padding:16},card:{width:'100%',maxWidth:480,maxHeight:'90%',flexGrow:0,borderWidth:2,borderColor:'#cfb56d',borderRadius:24,backgroundColor:'#103448'},content:{padding:16,gap:12},kicker:{color:'#e2ca86',fontSize:16,textAlign:'center'},icon:{fontSize:40,color:'#ffe6a6',textAlign:'center'},title:{color:'#fff0c1',fontSize:22,fontWeight:'700',textAlign:'center'},body:{color:'#edf6fa',fontSize:16,lineHeight:25},note:{color:'#b6d0dc',fontSize:14,lineHeight:21}});
