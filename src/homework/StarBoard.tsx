import React from 'react';
import type {HomeworkDay} from './model';
export default function StarBoard({day,date,onTask,onPortal,en}:{day?:HomeworkDay;date:string;onTask:(id:string)=>void;onPortal:()=>void;en:boolean}){
 const tasks=day?.tasks??[],n=tasks.filter(t=>t.confirmed).length,ready=tasks.length>0&&n===tasks.length&&!day?.claimedAt;
 return <div className="hw-stars"><style>{`
 .hw-stars{position:relative;width:100%;aspect-ratio:1/2;background:url('/homework/reference-plate.png') center/100% 100%;container-type:inline-size;color:#fff2cc;font-family:serif}
 .hw-stars .plaque{position:absolute;inset:0 0 auto;height:18.8%;background:url('/homework/reference-ui.jpg') left top/300.4695% auto;mask-image:linear-gradient(#000 94%,transparent)}
 .hw-stars .date{position:absolute;top:12.35%;left:33.5%;width:33%;text-align:center;background:#10203a;border-radius:50%;font-size:4cqw}
 .hw-stars .progress{position:absolute;top:19.3%;width:100%;text-align:center;font-size:5.5cqw}
 .hw-stars .disc{position:absolute;inset:23% 0 auto;height:49%}
 .hw-stars button{cursor:pointer;font-family:inherit;color:#fff3c8;-webkit-tap-highlight-color:transparent}
 .hw-stars button:active{scale:.96}.hw-stars button:focus-visible{outline:3px solid #fff}
 .hw-stars .rune{position:absolute;transform:translate(-50%,-50%);width:25%;padding:0;border:0;background:none;display:flex;align-items:center;flex-direction:column}
 .hw-stars .badge{width:21cqw;height:21cqw;border-radius:50%;background:url('/homework/reference-ui.jpg');background-size:1454.545% 969.318%;box-shadow:0 0 0 1px #f6df9b88,0 4px 7px #0008}
 .hw-stars .done .badge{box-shadow:0 0 18px #ffd45a}
 .hw-stars .rune strong{font-size:4.5cqw;line-height:1.2;margin:-1cqw 0 0;border:1px solid #d7bd77;border-radius:30%;padding:.7cqw;background:linear-gradient(#14284c,#020a1a);text-shadow:1px 2px #000}
 .hw-stars .portal{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:26%;aspect-ratio:1;border-radius:50%;border:1px solid #96f6ed;background:#082638aa;font-size:4cqw}
 .hw-stars .portal.ready{box-shadow:0 0 26px #55ffe6;animation:hw-pulse 2s infinite alternate}
 .hw-stars .foot{position:absolute;top:76%;width:100%;text-align:center;font-size:4.5cqw}
 @keyframes hw-pulse{to{box-shadow:0 0 44px #ffdf83}}@media(prefers-reduced-motion:reduce){.hw-stars .portal.ready{animation:none}}
 `}</style><div className="plaque" aria-hidden/><div className="date">{date}</div><div className="progress">{en?'Complete':'完成'}：{n}/{tasks.length}</div><div className="disc"><svg viewBox="0 0 350 396" style={{position:'absolute',width:'100%',height:'100%'}} aria-hidden><polygon points="175,71 241,286 68,153 282,153 109,286" fill="none" stroke={ready?'#ffdf83':'#73e8ef'} strokeWidth="2"/></svg><button className={`portal ${ready?'ready':''}`} disabled={!ready} onClick={onPortal}>{day?.claimedAt?'✓':ready?(en?'Teleport':'點此傳送'):`${n}/${tasks.length}`}</button>{tasks.slice(0,7).map((t,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.min(tasks.length,7),k=/數學/.test(t.title)?1:/詞|作文|訂正/.test(t.title)?4:/背|讀課/.test(t.title)?3:/閱讀/.test(t.title)?2:0;const q=(t.confirmed?[[1066,259],[1204,353],[1148,509],[975,509],[926,353]]:[[210,259],[347,353],[294,509],[122,509],[74,353]])[k];return <button key={t.id} className={`rune ${t.confirmed?'done':''}`} style={{left:`${(175+125*Math.cos(a))/350*100}%`,top:`${(190+133*Math.sin(a))/396*100}%`}} onClick={()=>onTask(t.id)} aria-label={t.title}><span className="badge" style={{backgroundPosition:`${(q[0]-44)/1192*100}% ${(q[1]-44)/765*100}%`}}/><strong>{t.confirmed?'✓ ':''}{t.title}</strong></button>})}</div><div className="foot">{en?'Choose any subject':'自由選科目，不限順序'}<br/>{day?.claimedAt?(en?'Reward collected':'本日已領獎'):en?'Complete all tasks: 10 points + 1 journey':'全部確認：10點＋旅程1次'}</div></div>
}
