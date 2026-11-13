import React from 'react';
import SubjectIcon from './SubjectIcon';
import type {HomeworkDay} from './model';
export default function StarBoard({day,date,onTask,onPortal,en}:{day?:HomeworkDay;date:string;onTask:(id:string)=>void;onPortal:()=>void;en:boolean}){
 const tasks=day?.tasks??[],n=tasks.filter(t=>t.confirmed).length,ready=tasks.length>0&&n===tasks.length&&!day?.claimedAt;
 return <div className="hw-stars"><style>{`
 .hw-stars{position:relative;width:100%;aspect-ratio:1/2;background:url('/homework/reference-plate.png') center/100% 100%;container-type:inline-size;color:#fff2cc;font-family:serif;-webkit-text-size-adjust:100%;text-size-adjust:100%}
 .hw-stars .plaque{position:absolute;inset:0 0 auto;height:15.7%;background:url('/homework/reference-ui.jpg') left top/300.4695% auto;mask-image:linear-gradient(#000 94%,transparent)}
 .hw-stars .date{position:absolute;top:12.1%;left:34%;width:32%;height:3.1%;display:flex;align-items:center;justify-content:center;text-align:center;background:#10203a;border-radius:50%;font-size:3.8cqw;line-height:1.1}
 .hw-stars .progress{position:absolute;top:18.35%;left:32%;width:36%;height:3.8%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:4.5cqw;line-height:1.1}
 .hw-stars .disc{position:absolute;inset:24.8% 0 auto;height:47.2%}
 .hw-stars button{cursor:pointer;font-family:inherit;color:#fff3c8;-webkit-tap-highlight-color:transparent}
 .hw-stars button:active{scale:.96}.hw-stars button:focus-visible{outline:3px solid #fff}
 .hw-stars .rune{position:absolute;transform:translate(-50%,-50%);width:25%;padding:0;border:0;background:none;display:flex;align-items:center;flex-direction:column}
 .hw-stars .badge{width:21cqw;height:21cqw;border-radius:50%;box-shadow:0 0 0 1px #f6df9b88,0 4px 7px #0008}
 .hw-stars .done .badge{box-shadow:0 0 18px #ffd45a}
 .hw-stars .rune strong{font-size:3.8cqw;line-height:1.25;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;margin:-1cqw 0 0;border:1px solid #d7bd77;border-radius:30%;padding:.7cqw;background:linear-gradient(#14284c,#020a1a);text-shadow:1px 2px #000}
 .hw-stars .task-detail{display:block;margin-top:.5cqw;padding-top:.5cqw;border-top:1px solid #d7bd7755;color:#fff;font-size:3.2cqw;line-height:1.35;font-weight:400;white-space:pre-wrap;overflow-wrap:anywhere;text-shadow:none}
 .hw-stars .portal{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:26%;aspect-ratio:1;border-radius:50%;border:1px solid #96f6ed;background:#082638aa;font-size:4cqw}
 .hw-stars .portal.ready{box-shadow:0 0 26px #55ffe6;animation:hw-pulse 2s infinite alternate}
 .hw-stars .foot{position:absolute;top:73.6%;left:15%;width:70%;height:4.2%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:4cqw;line-height:1.2;box-sizing:border-box}
 .hw-stars .reward-label{position:absolute;top:81.8%;left:31%;width:38%;height:3.9%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:3.2cqw;line-height:1.2;box-sizing:border-box}
 [data-testid="homework-map-actions"] [role="button"]{height:100%;min-height:54px;padding:10px 5px!important;border-radius:18px!important}
 [data-testid="homework-map-actions"] [role="button"]>div{font-size:15px!important;line-height:21px!important;text-align:center;overflow-wrap:anywhere}
 @keyframes hw-pulse{to{box-shadow:0 0 44px #ffdf83}}@media(prefers-reduced-motion:reduce){.hw-stars .portal.ready{animation:none}}
 `}</style><div className="plaque" aria-hidden/><div className="date">{date}</div><div className="progress">{en?'Complete':'完成'}：{n}/{tasks.length}</div><div className="disc"><svg viewBox="0 0 350 396" style={{position:'absolute',width:'100%',height:'100%'}} aria-hidden><polygon points="175,71 241,286 68,153 282,153 109,286" fill="none" stroke={ready?'#ffdf83':'#73e8ef'} strokeWidth="2"/></svg><button className={`portal ${ready?'ready':''}`} disabled={!ready} onClick={onPortal}>{day?.claimedAt?'✓':ready?(en?'Teleport':'點此傳送'):`${n}/${tasks.length}`}</button>{tasks.slice(0,7).map((t,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.min(tasks.length,7);return <button key={t.id} className={`rune ${t.confirmed?'done':''}`} style={{left:`${(175+125*Math.cos(a))/350*100}%`,top:`${(190+133*Math.sin(a))/396*100}%`}} onClick={()=>onTask(t.id)} aria-label={[t.title,t.detail].filter(Boolean).join('：')}><SubjectIcon title={t.title} confirmed={!!t.confirmed} size="21cqw" className="badge"/><strong>{t.confirmed?'✓ ':''}{t.title}{t.detail?.trim()?<span className="task-detail">{t.detail}</span>:null}</strong></button>})}</div><div className="foot" aria-hidden/><div className="reward-label">{day?.claimedAt?(en?'Reward collected':'本日已領獎'):en?'All done: +10 pts':'全部確認：10點'}</div></div>
}
