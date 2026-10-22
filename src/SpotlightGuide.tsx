import React,{useEffect,useRef,useState} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MUSIC_HINT_KEY} from './TaskMusicHint';
import {createPortal} from 'react-dom';
export const GUIDE_KEY='holton-guardian-app::spotlight-v1';
type GuideStore={main:boolean;companions:boolean;wishes:boolean;parent:boolean;companionTap?:boolean;music?:boolean;mainSkipped?:boolean};
export async function initializeGuide(fresh:boolean,force=false,mainSkipped=false){
 if(force)await AsyncStorage.removeItem(MUSIC_HINT_KEY);
 if(force||!await AsyncStorage.getItem(GUIDE_KEY))await AsyncStorage.setItem(GUIDE_KEY,JSON.stringify({main:!fresh,companions:!fresh,wishes:!fresh,parent:!fresh,mainSkipped}));
}
type Step={selector:string;text:string;delay?:number;action?:'mission'|'picker';info?:boolean;passThrough?:boolean};
const companionStep:Step={selector:'[data-testid="guardian-companion"] [data-testid="companion-reaction"]',text:'點點你的夥伴，看看他想跟你說什麼！他會用文字泡泡回應，做任務時也可以點他陪你一下。',delay:1400};
const main:Step[]=[
 {selector:'[aria-label="開始任務"]',text:'先點這裡，進入今天的任務。',action:'mission'},
 {selector:'[aria-label="上一張時間卡"]',text:'點一下左箭頭，換一張時間卡。左右箭頭都可以選時間。'},
 {selector:'[data-testid="task-title-entry"]',text:'點這裡，挑今天想完成的一件小事。',action:'picker'},
 {selector:'[data-testid="tutorial-task-categories"]',text:'從亮起的五種類別中，點一件今天想做的事。'},
 companionStep,
 {selector:'[aria-label="準備出發"]',text:'時間與任務選好了，點「準備出發」。現在還不會開始計時。'},
 {selector:'[aria-label="我準備好了，開始！"]',text:'準備好才按這裡，計時就會開始。也可以先結束教學，等一下再開始。',info:true},
];
const rooms:Record<string,Step[]>={
 companionTap:[companionStep],
 music:[
  {selector:'[data-testid="music-categories"]',text:'先選一個音樂分類：專注或放鬆。安靜做任務也很好。'},
  {selector:'[data-testid^="music-track-"] [aria-label^="展開"]',text:'點一首曲名，展開試聽與選用。'},
  {selector:'[aria-label^="試聽"]',text:'點這裡試聽 20 秒。試聽不等於選用，也不會開啟任務自動播放。'},
  {selector:'[role="radio"][aria-label^="選用"]',text:'喜歡這首就按「選用」。任務開始是否播放，由「任務開始時播放」開關決定；也能在計時器旁開關。'},
 ],
 companions:[{selector:'[data-testid="guardian-companion"] [aria-label^="摸摸"]',text:'點一下夥伴，他會發光、用文字泡泡陪你，不會花點數。'},{selector:'[aria-label="我的守護獸收藏"]',text:'點這裡打開收藏；點已擁有的角色，就能選他今天陪你。',info:true,passThrough:true}],
 wishes:[{selector:'[data-testid="wish-guide-card"], [data-testid="wish-guide-empty"]',text:'這是心願卡與需要的點數。點數足夠時可以選取，最後確認才扣點；教學不會替你兌換。',info:true}],
 parent:[{selector:'[aria-label="任務與目標"]',text:'先點「任務與目標」看看設定。也能切換其他分類；重看操作教學在「設定與教學」。',info:true,passThrough:true}],
};
export default function SpotlightGuide({allowed,room,replay,phase,pickerOpen,hasTask,onMission,onPicker,onMusicDone,onResumeChange}:{allowed:boolean;room:string;replay:number;phase:string;pickerOpen:boolean;hasTask:boolean;onMission:()=>void;onPicker:()=>void;onMusicDone:()=>void;onResumeChange:(available:boolean)=>void}){
 const [store,setStore]=useState<GuideStore|null>(null),[mode,setMode]=useState<string|null>(null),[index,setIndex]=useState(0),[rect,setRect]=useState<DOMRect|null>(null),[size,setSize]=useState({w:0,h:0,top:0,left:0}),[notice,setNotice]=useState(''),[tipHeight,setTipHeight]=useState(180),[confirmSkip,setConfirmSkip]=useState(false);
 const target=useRef<HTMLElement|null>(null),tip=useRef<HTMLDivElement|null>(null),lastReplay=useRef(0),saveLock=useRef(false),advanceTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const steps=mode==='main'?main:rooms[mode??'']??[];const step=steps[index];
 useEffect(()=>{if(Platform.OS==='web')void AsyncStorage.getItem(GUIDE_KEY).then(raw=>{if(raw)setStore({...JSON.parse(raw),...(replay>0?{companionTap:false,music:false}:{})})});},[]);
 useEffect(()=>{if(replay>0&&replay!==lastReplay.current){lastReplay.current=replay;setStore(old=>old?{...old,companionTap:false,music:false}:old);setMode('main');setIndex(phase==='preparing'?6:0);if(phase==='preparing')onMission();setNotice('');}},[replay]);
 useEffect(()=>{if(!allowed||!store||mode)return;if(room==='village'&&!store.main&&phase==='ready'){setIndex(0);setMode('main');}else if(room==='mission'&&store.main&&!store.companionTap&&(phase==='ready'||phase==='preparing')){setIndex(0);setMode('companionTap');}else if(rooms[room]&&!store[room as keyof GuideStore]){setIndex(0);setMode(room);}},[allowed,store,mode,room,phase]);
 useEffect(()=>{if(mode&&mode!=='main'&&room!==(mode==='companionTap'?'mission':mode)){setMode(null);setIndex(0);}},[room,mode]);
 useEffect(()=>{onResumeChange(!!store?.mainSkipped&&!mode);},[store?.mainSkipped,mode,onResumeChange]);
 useEffect(()=>{setConfirmSkip(false);},[mode,index]);
 useEffect(()=>{if(confirmSkip)tip.current?.querySelector('button')?.focus();},[confirmSkip]);
 const requestSkip=()=>{if(advanceTimer.current){clearTimeout(advanceTimer.current);advanceTimer.current=null;}setConfirmSkip(true);};
 const finish=async(skipped=false)=>{
  if(!mode||!store||saveLock.current)return;saveLock.current=true;
  try{if(advanceTimer.current){clearTimeout(advanceTimer.current);advanceTimer.current=null;}const next={...store,[mode]:true,...(mode==='main'?{companionTap:true,mainSkipped:skipped}:{})};await AsyncStorage.setItem(GUIDE_KEY,JSON.stringify(next));setStore(next);setConfirmSkip(false);if(mode==='music')onMusicDone();setMode(null);setIndex(0);setNotice('');}
  catch{setNotice('教學紀錄尚未存好，請再按一次；遊戲進度沒有改變。');}
  finally{saveLock.current=false;}
 };
 const advance=()=>{if(index+1>=steps.length)void finish();else setIndex(i=>i+1)};
 // Wait until the actual task choice has saved and closed its dialog.
 useEffect(()=>{if(mode==='main'&&index===3&&!pickerOpen&&hasTask)setIndex(4);},[mode,index,pickerOpen,hasTask]);
 useEffect(()=>()=>{if(advanceTimer.current)clearTimeout(advanceTimer.current);advanceTimer.current=null;},[mode,index,allowed]);
 const active=Platform.OS==='web'&&allowed&&!!step;
 useEffect(()=>{
  if(!active||!step){setRect(null);return;}
  let anchor:HTMLElement|null=null,attempts=0,userMoved=false,frame=0,layoutWidth=window.innerWidth;
  const viewport=()=>{const vv=window.visualViewport;return {w:vv?.width??window.innerWidth,h:vv?.height??window.innerHeight,top:vv?.offsetTop??0,left:vv?.offsetLeft??0};};
  const measure=()=>{
   const el=document.querySelector<HTMLElement>(step.selector);target.current=el;
   const view=viewport();setSize(old=>Object.keys(view).every(k=>Math.abs(old[k as keyof typeof old]-view[k as keyof typeof view])<.5)?old:view);
   if(tip.current){const measured=tip.current.offsetHeight;setTipHeight(old=>Math.abs(old-measured)>1?measured:old);}
   const r=el?.getBoundingClientRect();
   setRect(old=>!r||!r.width||!r.height?null:old&&['left','top','width','height'].every(k=>Math.abs((old[k as keyof DOMRect] as number)-(r[k as keyof DOMRect] as number))<.5)?old:r);
  };
  // Measurement never scrolls. Only bounded initial alignment can move the page;
  // mobile toolbar / visual viewport events must not create a scroll feedback loop.
  const align=()=>{
   const el=document.querySelector<HTMLElement>(step.selector);if(!el||userMoved)return;
   const v=viewport(),r=el.getBoundingClientRect();
   const outside=r.bottom<=v.top+12||r.top>=v.top+v.h-12;
   if((anchor!==el||outside)&&attempts<4){attempts++;anchor=el;el.scrollIntoView({block:r.height>v.h*.4?'start':'center',inline:'nearest',behavior:'instant' as ScrollBehavior});}
   measure();
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;measure();});};
  const manual=()=>{userMoved=true;};
  const resized=()=>{if(Math.abs(window.innerWidth-layoutWidth)>40){layoutWidth=window.innerWidth;attempts=0;anchor=null;userMoved=false;align();}schedule();};
  align();const retries=[120,450,1000,1600].map(ms=>setTimeout(align,ms));const timer=setInterval(measure,250);
  window.addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);document.addEventListener('scroll',schedule,true);document.addEventListener('touchmove',manual,{passive:true,capture:true});document.addEventListener('wheel',manual,{passive:true,capture:true});
  return()=>{retries.forEach(clearTimeout);clearInterval(timer);cancelAnimationFrame(frame);window.removeEventListener('resize',resized);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);document.removeEventListener('scroll',schedule,true);document.removeEventListener('touchmove',manual,true);document.removeEventListener('wheel',manual,true);};
 },[active,step]);
 useEffect(()=>{
  if(!active||!step)return;
  const permitted=(node:EventTarget|null)=>node instanceof Node&&(target.current?.contains(node)||tip.current?.contains(node));
  const click=(event:MouseEvent)=>{
   if(tip.current?.contains(event.target as Node))return;
   if(confirmSkip||!permitted(event.target)){event.preventDefault();event.stopImmediatePropagation();return;}
   const button=(event.target as HTMLElement).closest('[role="button"],button');
   if(button?.getAttribute('aria-disabled')==='true'||button?.hasAttribute('disabled'))return;
   if(step.info){if(!step.passThrough){event.preventDefault();event.stopImmediatePropagation();}else if(!button)return;advance();return;}
   if(step.action){event.preventDefault();event.stopImmediatePropagation();if(step.action==='mission')onMission();else onPicker();advance();return;}
   if(mode==='main'&&index===3)return;
   if(!button&&!(event.target as HTMLElement).closest('[role="radio"]'))return;
   if(advanceTimer.current)return;
   advanceTimer.current=setTimeout(()=>{advanceTimer.current=null;advance();},step.delay??0);
  };
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(confirmSkip)setConfirmSkip(false);else requestSkip();return;}
   if(event.key==='Tab'){
    const elements=[...(!confirmSkip&&target.current?.matches('[role="button"],button')?[target.current]:Array.from(!confirmSkip?target.current?.querySelectorAll<HTMLElement>('[role="button"],button,input')??[]:[])),...Array.from(tip.current?.querySelectorAll<HTMLElement>('button')??[])].filter(e=>e.getAttribute('aria-disabled')!=='true'&&!e.hasAttribute('disabled'));
    if(elements.length){event.preventDefault();const at=elements.indexOf(document.activeElement as HTMLElement);elements[(at+(event.shiftKey?-1:1)+elements.length)%elements.length].focus();}
   }else if((event.key==='Enter'||event.key===' ')&&!permitted(event.target)){event.preventDefault();event.stopImmediatePropagation();tip.current?.focus();}
  };
  document.addEventListener('click',click,true);document.addEventListener('keydown',key,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('keydown',key,true);};
 },[active,step,index,mode,store,confirmSkip,onMission,onPicker]);
 if(Platform.OS!=='web'||!active)return null;
 const w=size.w||window.innerWidth,h=size.h||window.innerHeight,viewTop=size.top,viewBottom=viewTop+h,viewLeft=size.left,viewRight=viewLeft+w,layoutW=window.innerWidth;
 const r=rect?{left:Math.max(viewLeft,Math.min(viewRight,rect.left-5)),right:Math.max(viewLeft,Math.min(viewRight,rect.right+5)),top:Math.min(viewBottom,Math.max(viewTop,rect.top-5)),bottom:Math.max(viewTop,Math.min(viewBottom,rect.bottom+5))}:{left:0,right:0,top:0,bottom:0};
 const tipWidth=Math.min(340,w-24),below=viewBottom-r.bottom>=tipHeight+20;
 const side=rect&&!below&&r.top-viewTop<tipHeight+20?(viewRight-r.right>=tipWidth+24?'right':r.left-viewLeft>=tipWidth+24?'left':null):null;
 const tipLeft=side==='right'?r.right+12:side==='left'?r.left-tipWidth-12:Math.max(viewLeft+12,Math.min(viewRight-tipWidth-12,rect?(rect.left+rect.right-tipWidth)/2:viewLeft+(w-tipWidth)/2));
 const desiredTop=side?(r.top+r.bottom-tipHeight)/2:rect?(below?r.bottom+10:r.top-tipHeight-10):viewTop+h/2-90;
 const tipTop=Math.max(viewTop+8,Math.min(viewBottom-tipHeight-8,desiredTop));
 const shade:React.CSSProperties={position:'fixed',background:'rgba(0,10,20,.82)',pointerEvents:'auto',touchAction:'pan-y'};
 const buttonStyle:React.CSSProperties={border:'1px solid #d8b56c',borderRadius:10,background:'#125368',color:'#fff0c9',padding:'10px 14px',fontSize:14,cursor:'pointer',minHeight:42};
 return createPortal(<div data-testid="spotlight-guide" style={{position:'fixed',inset:0,zIndex:2147483000,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
  <div style={{...shade,left:0,top:0,width:layoutW,height:r.top}}/><div style={{...shade,left:0,top:r.bottom,width:layoutW,height:Math.max(0,window.innerHeight-r.bottom)}}/>
  <div style={{...shade,left:0,top:r.top,width:r.left,height:r.bottom-r.top}}/><div style={{...shade,left:r.right,top:r.top,width:Math.max(0,layoutW-r.right),height:r.bottom-r.top}}/>
  {rect?<div data-testid="spotlight-hole" style={{position:'fixed',left:r.left,top:r.top,width:r.right-r.left,height:r.bottom-r.top,border:'3px solid #ffe2a0',borderRadius:14,boxSizing:'border-box',boxShadow:'0 0 22px #f7c55977'}}/>:null}
  <div ref={tip} tabIndex={-1} role="dialog" aria-label="操作教學" aria-live="polite" data-testid="spotlight-tip" style={{position:'fixed',pointerEvents:'auto',left:tipLeft,top:tipTop,width:tipWidth,maxHeight:Math.max(80,viewBottom-tipTop-8),overflowY:'auto',boxSizing:'border-box',background:'#0b3046',color:'#fff0c9',border:'1px solid #e0bd75',borderRadius:16,padding:14,boxShadow:'0 8px 30px #0008'}}>
   {confirmSkip?<><h2 style={{fontSize:20,margin:'0 0 8px'}}>✨ 想先自己探索嗎？</h2><p style={{fontSize:16,lineHeight:1.55}}>教學還沒結束喔！繼續跟著操作，認識更多功能，讓第一次冒險更順手。也可以先自己試試看。</p><p style={{fontSize:13,lineHeight:1.5}}>之後想再看，可以到「家長小屋 → 設定與教學 → 重新觀看操作教學」。</p>{notice?<p role="alert">{notice}</p>:null}<div style={{display:'flex',flexDirection:'column',gap:8}}><button style={buttonStyle} onClick={()=>setConfirmSkip(false)}>繼續帶我玩</button><button style={{...buttonStyle,background:'transparent'}} onClick={()=>void finish(true)}>先自己探索</button></div></>:<>
   <div style={{fontSize:13,color:'#e2c682'}}>操作教學 · {index+1}／{steps.length}</div>
   <p style={{fontSize:16,lineHeight:1.55,margin:'7px 0 10px'}}>{rect?step.text:'正在定位操作位置…'}</p>
   {notice?<p role="alert">{notice}</p>:null}
   <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button style={{...buttonStyle,background:'transparent'}} onClick={requestSkip}>略過教學</button>{step.info?<button style={buttonStyle} onClick={advance}>{mode==='main'?'完成教學，先不開始':'知道了'}</button>:null}</div>
   </>}
  </div>
 </div>,document.body);
}
