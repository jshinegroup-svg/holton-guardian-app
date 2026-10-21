import React,{useEffect,useRef,useState} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createPortal} from 'react-dom';
export const GUIDE_KEY='holton-guardian-app::spotlight-v1';
type GuideStore={main:boolean;companions:boolean;wishes:boolean;parent:boolean};
export async function initializeGuide(fresh:boolean,force=false){
 if(force||!await AsyncStorage.getItem(GUIDE_KEY))await AsyncStorage.setItem(GUIDE_KEY,JSON.stringify({main:!fresh,companions:!fresh,wishes:!fresh,parent:!fresh}));
}
type Step={selector:string;text:string;action?:'mission'|'picker';info?:boolean};
const main:Step[]=[
 {selector:'[aria-label="開始任務"]',text:'先點這裡，進入今天的任務。',action:'mission'},
 {selector:'[aria-label="上一張時間卡"]',text:'點一下左箭頭，換一張時間卡。左右箭頭都可以選時間。'},
 {selector:'[data-testid="task-title-entry"]',text:'點這裡，挑今天想完成的一件小事。',action:'picker'},
 {selector:'[data-testid="tutorial-task-categories"]',text:'從亮起的五種類別中，點一件今天想做的事。'},
 {selector:'[aria-label="準備出發"]',text:'時間與任務選好了，點「準備出發」。現在還不會開始計時。'},
 {selector:'[aria-label="我準備好了，開始！"]',text:'準備好才按這裡，計時就會開始。也可以先結束教學，等一下再開始。',info:true},
];
const rooms:Record<string,Step[]>={
 companions:[{selector:'[data-testid="guardian-companion"] [aria-label^="摸摸"]',text:'點一下夥伴，他會發光、說話陪你，不會花點數。'},{selector:'[aria-label="我的守護獸收藏"]',text:'從這裡看收藏；點已擁有的角色，就能選他今天陪你。',info:true}],
 wishes:[{selector:'[data-testid="wish-guide-card"], [data-testid="wish-guide-empty"]',text:'這是心願卡與需要的點數。點數足夠時可以選取，最後確認才扣點；教學不會替你兌換。',info:true}],
 parent:[{selector:'[data-testid="parent-nav"]',text:'從這裡切換任務、獎勵、音樂與偏好。重看操作教學在「偏好與舊卡」，不必重置進度。',info:true}],
};
export default function SpotlightGuide({allowed,room,replay,phase,pickerOpen,hasTask,onMission,onPicker}:{allowed:boolean;room:string;replay:number;phase:string;pickerOpen:boolean;hasTask:boolean;onMission:()=>void;onPicker:()=>void}){
 const [store,setStore]=useState<GuideStore|null>(null),[mode,setMode]=useState<string|null>(null),[index,setIndex]=useState(0),[rect,setRect]=useState<DOMRect|null>(null),[size,setSize]=useState({w:0,h:0}),[notice,setNotice]=useState(''),[tipHeight,setTipHeight]=useState(180);
 const target=useRef<HTMLElement|null>(null),tip=useRef<HTMLDivElement|null>(null),lastReplay=useRef(0),saveLock=useRef(false);
 const steps=mode==='main'?main:rooms[mode??'']??[];const step=steps[index];
 useEffect(()=>{if(Platform.OS==='web')void AsyncStorage.getItem(GUIDE_KEY).then(raw=>{if(raw)setStore(JSON.parse(raw))});},[]);
 useEffect(()=>{if(replay>0&&replay!==lastReplay.current){lastReplay.current=replay;setMode('main');setIndex(0);setNotice('');}},[replay]);
 useEffect(()=>{if(!allowed||!store||mode)return;if(room==='village'&&!store.main&&phase==='ready'){setIndex(0);setMode('main');}else if(rooms[room]&&!store[room as keyof GuideStore]){setIndex(0);setMode(room);}},[allowed,store,mode,room,phase]);
 const finish=async()=>{
  if(!mode||!store||saveLock.current)return;saveLock.current=true;
  try{const next={...store,[mode]:true};await AsyncStorage.setItem(GUIDE_KEY,JSON.stringify(next));setStore(next);setMode(null);setIndex(0);setNotice('');}
  catch{setNotice('教學紀錄尚未存好，請再按一次；遊戲進度沒有改變。');}
  finally{saveLock.current=false;}
 };
 const advance=()=>{if(index+1>=steps.length)void finish();else setIndex(i=>i+1)};
 // Wait until the actual task choice has saved and closed its dialog.
 useEffect(()=>{if(mode==='main'&&index===3&&!pickerOpen&&hasTask)setIndex(4);},[mode,index,pickerOpen,hasTask]);
 const active=Platform.OS==='web'&&allowed&&!!step;
 useEffect(()=>{
  if(!active||!step){setRect(null);return;}
  let scrollTarget:HTMLElement|null=null;
  const measure=()=>{
   const el=document.querySelector<HTMLElement>(step.selector);target.current=el;
   setSize({w:window.innerWidth,h:window.innerHeight});
   if(tip.current){const measured=tip.current.offsetHeight;setTipHeight(old=>Math.abs(old-measured)>1?measured:old);}
   if(!el){setRect(null);return;}
   if(scrollTarget!==el){el.scrollIntoView({block:el.getBoundingClientRect().height>window.innerHeight*.4?'start':'center',inline:'nearest',behavior:'instant' as ScrollBehavior});scrollTarget=el;}
   const r=el.getBoundingClientRect();setRect(r.width&&r.height?r:null);
  };
  const resized=()=>{scrollTarget=null;measure();};
  measure();const timer=setInterval(measure,180);window.addEventListener('resize',resized);document.addEventListener('scroll',measure,true);
  return()=>{clearInterval(timer);window.removeEventListener('resize',resized);document.removeEventListener('scroll',measure,true);};
 },[active,step]);
 useEffect(()=>{
  if(!active||!step)return;
  const permitted=(node:EventTarget|null)=>node instanceof Node&&(target.current?.contains(node)||tip.current?.contains(node));
  const click=(event:MouseEvent)=>{
   if(tip.current?.contains(event.target as Node))return;
   if(!permitted(event.target)){event.preventDefault();event.stopImmediatePropagation();return;}
   const button=(event.target as HTMLElement).closest('[role="button"],button');
   if(button?.getAttribute('aria-disabled')==='true'||button?.hasAttribute('disabled'))return;
   if(step.info){event.preventDefault();event.stopImmediatePropagation();void finish();return;}
   if(step.action){event.preventDefault();event.stopImmediatePropagation();if(step.action==='mission')onMission();else onPicker();advance();return;}
   if(mode==='main'&&index===3)return;
   setTimeout(()=>advance(),0);
  };
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();void finish();return;}
   if(event.key==='Tab'){
    const elements=[...(target.current?.matches('[role="button"],button')?[target.current]:Array.from(target.current?.querySelectorAll<HTMLElement>('[role="button"],button,input')??[])),...Array.from(tip.current?.querySelectorAll<HTMLElement>('button')??[])].filter(e=>e.getAttribute('aria-disabled')!=='true'&&!e.hasAttribute('disabled'));
    if(elements.length){event.preventDefault();const at=elements.indexOf(document.activeElement as HTMLElement);elements[(at+(event.shiftKey?-1:1)+elements.length)%elements.length].focus();}
   }else if((event.key==='Enter'||event.key===' ')&&!permitted(event.target)){event.preventDefault();event.stopImmediatePropagation();tip.current?.focus();}
  };
  document.addEventListener('click',click,true);document.addEventListener('keydown',key,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('keydown',key,true);};
 },[active,step,index,mode,store,onMission,onPicker]);
 if(Platform.OS!=='web'||!active)return null;
 const w=size.w||window.innerWidth,h=size.h||window.innerHeight;
 const r=rect?{left:Math.max(0,rect.left-5),right:Math.min(w,rect.right+5),top:Math.max(0,rect.top-5),bottom:Math.min(h,rect.bottom+5)}:{left:0,right:0,top:0,bottom:0};
 const tipWidth=Math.min(340,w-24),below=h-r.bottom>=tipHeight+20;
 const tipTop=rect?(below?r.bottom+10:Math.max(8,r.top-tipHeight-10)):Math.max(12,h/2-90);
 const shade:React.CSSProperties={position:'fixed',background:'rgba(0,10,20,.82)',pointerEvents:'auto',touchAction:'none'};
 const buttonStyle:React.CSSProperties={border:'1px solid #d8b56c',borderRadius:10,background:'#125368',color:'#fff0c9',padding:'10px 14px',fontSize:14,cursor:'pointer',minHeight:42};
 return createPortal(<div data-testid="spotlight-guide" style={{position:'fixed',inset:0,zIndex:2147483000,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
  <div style={{...shade,left:0,top:0,width:w,height:r.top}}/><div style={{...shade,left:0,top:r.bottom,width:w,height:h-r.bottom}}/>
  <div style={{...shade,left:0,top:r.top,width:r.left,height:r.bottom-r.top}}/><div style={{...shade,left:r.right,top:r.top,width:w-r.right,height:r.bottom-r.top}}/>
  {rect?<div data-testid="spotlight-hole" style={{position:'fixed',left:r.left,top:r.top,width:r.right-r.left,height:r.bottom-r.top,border:'3px solid #ffe2a0',borderRadius:14,boxSizing:'border-box',boxShadow:'0 0 22px #f7c55977'}}/>:null}
  <div ref={tip} tabIndex={-1} role="dialog" aria-label="操作教學" aria-live="polite" data-testid="spotlight-tip" style={{position:'fixed',pointerEvents:'auto',left:Math.max(12,Math.min(w-tipWidth-12,rect?(rect.left+rect.right-tipWidth)/2:(w-tipWidth)/2)),top:tipTop,width:tipWidth,maxHeight:Math.max(140,h-tipTop-8),overflowY:'auto',boxSizing:'border-box',background:'#0b3046',color:'#fff0c9',border:'1px solid #e0bd75',borderRadius:16,padding:14,boxShadow:'0 8px 30px #0008'}}>
   <div style={{fontSize:13,color:'#e2c682'}}>操作教學 · {index+1}／{steps.length}</div>
   <p style={{fontSize:16,lineHeight:1.55,margin:'7px 0 10px'}}>{rect?step.text:'正在定位操作位置…'}</p>
   {notice?<p role="alert">{notice}</p>:null}
   <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button style={{...buttonStyle,background:'transparent'}} onClick={()=>void finish()}>略過教學</button>{step.info?<button style={buttonStyle} onClick={advance}>{mode==='main'?'完成教學，先不開始':'知道了'}</button>:null}</div>
  </div>
 </div>,document.body);
}
