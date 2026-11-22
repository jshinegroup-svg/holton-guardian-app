// Interruptible choreography over the approved 2.5D poses, not a 3D skeleton.
const actionDeck=document.createElement('section');actionDeck.className='room-playthings';actionDeck.setAttribute('aria-label','岩背龜動作');$('.stage').append(actionDeck);
const motionSprite=pet.querySelector('.guardian-sprite');
const ground=document.createElement('span');ground.className='ground-shadow';ground.setAttribute('aria-hidden','true');pet.prepend(ground);
let choreography=[],motionVersion=0,idleTurn=0,lastPlay=Date.now();
const baseReset=resetPet;
function cancelChoreography(){motionVersion++;choreography.forEach(a=>a.cancel());choreography=[];motionSprite.style.animation='';ground.style.opacity='';pet.removeAttribute('data-action');$('.stage').classList.remove('action-active');for(const b of actionDeck.querySelectorAll('button'))b.setAttribute('aria-pressed','false')}
resetPet=function(){cancelChoreography();baseReset();lastPlay=Date.now()};
const neutral='0% 0%',wavePose='50% 0%',closed='100% 0%',stepA='50% 100%',stepB='100% 100%';
const frame=(offset,transform,backgroundPosition=neutral)=>({offset,transform,backgroundPosition});
const jumpFrames=[frame(0,'translateY(0) scale(1,1)'),frame(.15,'translateY(4px) scale(1.10,.88)',closed),frame(.28,'translateY(-28px) scale(.94,1.08)',stepA),frame(.46,'translateY(-60px) scale(1,1)',wavePose),frame(.65,'translateY(-27px) scale(.96,1.04)',stepB),frame(.78,'translateY(5px) scale(1.13,.85)',closed),frame(.9,'translateY(-6px) scale(.98,1.03)'),frame(1,'translateY(0) scale(1,1)')];
const landingShadow=[{offset:0,transform:'scale(1)',opacity:.23},{offset:.15,transform:'scale(1.1)',opacity:.3},{offset:.46,transform:'scale(.58)',opacity:.08},{offset:.78,transform:'scale(1.2)',opacity:.32},{offset:1,transform:'scale(1)',opacity:.23}];
const actions={
 feed:{label:'吃蘋果',text:'啊姆、啊姆……蘋果好香！謝謝你！',ms:2400,frames:[frame(0,'scale(1)'),frame(.2,'translateY(5px) rotate(-4deg)',closed),frame(.4,'translateY(-2px)',wavePose),frame(.6,'translateY(3px) scale(1.03,.97)',closed),frame(.8,'translateY(-3px)',wavePose),frame(1,'scale(1)')]},
 brush:{label:'梳梳背',text:'輕輕刷、慢慢刷，好舒服～',ms:2500,frames:[frame(0,'rotate(0)'),frame(.2,'rotate(-5deg)',closed),frame(.4,'rotate(5deg)',closed),frame(.6,'rotate(-4deg)',closed),frame(.8,'rotate(4deg)',closed),frame(1,'rotate(0)')]},
 bell:{label:'搖鈴鐺',text:'叮鈴！我在這裡，找我玩嗎？',ms:1700,frames:[frame(0,'scale(1)'),frame(.2,'translateY(-9px) rotate(-4deg)',stepA),frame(.45,'rotate(4deg)',stepB),frame(.7,'translateY(-5px)',wavePose),frame(1,'scale(1)')]},
 jump:{label:'⬆ 跳高高',text:'蹲低……跳！咚，穩穩落地！',ms:1150,frames:jumpFrames,shadow:landingShadow},
 hops:{label:'🐾 連跳三下',text:'一、二、三！一起跳起來！',ms:850,iterations:3,frames:jumpFrames.map(f=>({...f,transform:f.transform.replace('-60px','-37px').replace('-28px','-20px').replace('-27px','-19px')})),shadow:landingShadow},
 dance:{label:'🎉 開心跳舞',text:'左邊搖，右邊搖，今天真開心！',ms:2200,frames:[frame(0,'rotate(0)'),frame(.15,'translate(-13px,-6px) rotate(-8deg)',wavePose),frame(.3,'translate(13px,-3px) rotate(8deg)',stepB),frame(.45,'translate(-10px,-12px) rotate(-7deg)',wavePose),frame(.6,'translate(11px,-6px) rotate(7deg)',stepA),frame(.8,'translateY(-25px) scale(.96,1.04)',wavePose),frame(.9,'translateY(3px) scale(1.08,.91)'),frame(1,'rotate(0)')]},
 turn:{label:'↔ 左右轉身',text:'看看這邊，再看看那邊！',ms:1800,frames:[frame(0,'scaleX(1)'),frame(.25,'scaleX(.18)',stepA),frame(.4,'scaleX(-1)',stepB),frame(.65,'scaleX(-1)',wavePose),frame(.82,'scaleX(.18)',stepA),frame(1,'scaleX(1)')]},
 bow:{label:'♡ 點頭謝謝',text:'謝謝你陪我玩！',ms:1500,frames:[frame(0,'rotate(0)'),frame(.3,'translateY(8px) rotate(-7deg) scale(1.03,.88)',closed),frame(.55,'translateY(8px) rotate(-7deg) scale(1.03,.88)',closed),frame(.8,'translateY(-3px) rotate(2deg)',wavePose),frame(1,'rotate(0)')]},
 stretch:{label:'☀ 伸伸懶腰',text:'呼～伸伸腳，再慢慢放鬆。',ms:2200,frames:[frame(0,'scale(1)'),frame(.3,'translateY(-6px) scale(1.08,1.06)',closed),frame(.55,'translateY(-6px) scale(1.08,1.06)',closed),frame(.8,'translateY(2px) scale(.98,.97)',stepA),frame(1,'scale(1)')]},
 look:{label:'看看四周',ms:1800,frames:[frame(0,'rotate(0)'),frame(.3,'translateX(-5px) rotate(-3deg)',stepA),frame(.65,'translateX(5px) rotate(3deg)',stepB),frame(1,'rotate(0)')]}
};
function performAction(name,automatic=false){const action=actions[name];if(!action||panel.open||phase!=='idle'||voiceSource)return;resetPet();lastPlay=Date.now();const version=motionVersion;pet.dataset.action=name;pet.classList.add('choreographed');$('.stage').classList.add('action-active');for(const b of actionDeck.querySelectorAll('button'))b.setAttribute('aria-pressed',b.dataset.action===name);if(!automatic){say(action.text);chirp(name==='dance'?'laugh':'wave');if(['dance','feed','brush'].includes(name))hearts()}
 const finish=()=>{if(version!==motionVersion)return;cancelChoreography();pet.classList.remove('choreographed');lastPlay=Date.now()};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){pet.classList.add('wave');later(()=>{pet.classList.remove('wave');finish()},650);return}
 motionSprite.style.animation='none';const timing={duration:action.ms,iterations:action.iterations||1,easing:'ease-in-out',fill:'none'};const movement=motionSprite.animate(action.frames.map(({backgroundPosition,...f})=>f),timing);const poses=motionSprite.animate(action.frames.map(f=>({offset:f.offset,backgroundPosition:f.backgroundPosition,easing:'steps(1,end)'})),{...timing,easing:'linear'});choreography.push(movement,poses);if(action.shadow)choreography.push(ground.animate(action.shadow,timing));movement.onfinish=finish;
}
const propNames={feed:['蘋果','餵牠吃蘋果'],brush:['梳子','梳梳背'],bell:['鈴鐺','呼喚岩背龜'],jump:['彈跳墊','點一下跳高高，再點連跳'],dance:['音樂盒','開心跳舞'],turn:['鏡子','左右轉身'],stretch:['軟墊','伸伸懶腰']};
for(const name of Object.keys(propNames)){const b=document.createElement('button');b.className='room-prop prop-'+name;b.dataset.action=name;b.dataset.caption=propNames[name][0];b.setAttribute('aria-label',propNames[name].join('，'));b.setAttribute('aria-pressed','false');b.onclick=()=>performAction(name==='jump'&&pet.dataset.action==='jump'?'hops':name);actionDeck.append(b)}
const voiceProp=$('#voice');voiceProp.classList.add('room-prop','prop-voice');voiceProp.dataset.caption='學我說話';voiceProp.setAttribute('aria-label','🎙 學我說話');voiceProp.textContent='';$('.stage').append(voiceProp);
const ballProp=$('.ball');ballProp.classList.add('room-prop','prop-ball');ballProp.dataset.caption='玩球';ballProp.setAttribute('aria-label','玩球');ballProp.textContent='';
const bedProp=$('.bed');bedProp.classList.add('room-prop','prop-bed');bedProp.dataset.caption='睡覺／起床';bedProp.setAttribute('aria-label','睡覺或起床');
pet.addEventListener('dblclick',e=>{e.preventDefault();performAction('jump')});
// Existing touch/pet/bed/ball actions call resetPet, so rapid switching cancels old tracks.
// Dialogs and background transitions also interrupt animation, never recording controls.
for(const id of ['voice','chat','decorate','invite'])$('#'+id).addEventListener('click',()=>resetPet(),{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPet()});
setInterval(()=>{if(document.hidden||panel.open||phase!=='idle'||voiceSource||pet.className!=='pet'||Date.now()-lastPlay<11000)return;performAction(idleTurn++%2?'stretch':'look',true)},4000);
$('.hint').textContent='點房裡的玩具 · 彈跳墊再點一次連跳';

for(const prop of $$('.room-prop')){let glowTimer;prop.addEventListener('click',()=>{clearTimeout(glowTimer);prop.classList.add('tapped');glowTimer=setTimeout(()=>prop.classList.remove('tapped'),700)})}
