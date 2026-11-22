// Direct-manipulation toys. No account writes, recording, or external services.
(()=>{
 const stage=$('.stage'),sprite=pet.querySelector('.guardian-sprite');
 const feather=$('.prop-turn'),blower=$('.prop-stretch');
 const featherArt='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 50C4 32 25 4 51 8C58 29 40 47 18 50Z" fill="#67d9cf" stroke="#fce4a3" stroke-width="2"/><path d="M11 59L45 15M22 44L19 28M28 36L43 33M34 28L33 16" fill="none" stroke="#fff2bc" stroke-width="3" stroke-linecap="round"/></svg>';
 const bubbleArt='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 58L32 29" stroke="#e9bf76" stroke-width="7" stroke-linecap="round"/><circle cx="36" cy="21" r="13" fill="#72d9dc33" stroke="#a7f3ef" stroke-width="4"/><circle cx="14" cy="15" r="7" fill="#d4aff64d" stroke="#e6d4ff" stroke-width="2"/><path d="M30 16Q33 10 39 12" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>';
 for(const [b,name,label,art] of [[feather,'逗逗羽毛','羽毛，抓著移動逗夥伴',featherArt],[blower,'吹泡泡','泡泡棒，可拖進房間持續吹泡泡，也可點一下吹泡泡',bubbleArt]]){b.classList.add('interactive-toy','care-source');b.dataset.caption=name;b.setAttribute('aria-label',label);b.innerHTML=art;b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation()};b.removeAttribute('data-action');}
 let held=null,ghost=null,mode='',raf=0,last=0,nextBubble=0,until=0,tickled=0,pops=0,petPops=0;
 let wand=null,emitter=null,trailAnchor=null;
 let px=.5,py=.8,target=null;const bubbles=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function stopHold(){const h=held;held=null;if(h){h.b.classList.remove('care-held');h.b.setAttribute('aria-pressed','false');if(h.b.hasPointerCapture(h.id))h.b.releasePointerCapture(h.id)}ghost?.remove();ghost=null;}
 function recall(){wand?.remove();wand=null;emitter=null;trailAnchor=null;blower.classList.remove('wand-deployed');blower.dataset.caption='吹泡泡';blower.setAttribute('aria-label','泡泡棒，可拖進房間持續吹泡泡，也可點一下吹泡泡');}
 function clean(){stopHold();recall();cancelAnimationFrame(raf);raf=0;mode='';target=null;for(const q of bubbles)q.el.remove();bubbles.length=0;pet.classList.remove('toy-playing');sprite.style.transform='';sprite.style.backgroundPosition='';for(const k of ['left','top','width'])pet.style.removeProperty(k);}
 const prior=resetPet;resetPet=function(){clean();prior()};
 function pos(e){const r=stage.getBoundingClientRect();return{x:Math.max(.05,Math.min(.95,(e.clientX-r.left)/r.width)),y:Math.max(.12,Math.min(.94,(e.clientY-r.top)/r.height))};}
 function inRoom(e){const r=stage.parentElement.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;}
 function overDock(e){return !!document.elementFromPoint(e.clientX,e.clientY)?.closest('.play-toolbar');}
 function place(point){
  emitter={...point};
  if(!wand){wand=document.createElement('button');wand.type='button';wand.className='bubble-wand interactive-toy care-source';wand.setAttribute('aria-label','移動泡泡棒，按 Escape 收回');wand.innerHTML=bubbleArt;stage.append(wand);bind(wand,'bubbles');blower.classList.add('wand-deployed');blower.dataset.caption='收回泡泡棒';blower.setAttribute('aria-label','收回泡泡棒，停止持續吹泡泡');}
  wand.style.left=point.x*100+'%';wand.style.top=point.y*100+'%';
 }
 function move(e){
  if(!held||held.id!==e.pointerId)return;
  if(mode==='bubbles'){
   if(Math.hypot(e.clientX-held.startX,e.clientY-held.startY)<12&&!held.moved)return;
   held.moved=true;
   if(!inRoom(e)||overDock(e))return;
   const point=pos(e),prev=trailAnchor||emitter;place(point);
   if(prev){const steps=Math.min(12,Math.floor(Math.hypot((point.x-prev.x)*stage.clientWidth,(point.y-prev.y)*stage.clientHeight)/20));for(let i=1;i<=steps;i++)spawn({x:prev.x+(point.x-prev.x)*i/steps,y:prev.y+(point.y-prev.y)*i/steps},true);if(steps)trailAnchor={...point};}
   else{spawn(point,true);trailAnchor={...point};}
   return;
  }
  target=pos(e);if(ghost){ghost.style.left=target.x*100+'%';ghost.style.top=target.y*100+'%';}
 }

 function react(){sprite.style.backgroundPosition='100% 0%';tickled=performance.now();if(state.sound)tone();}
 function pop(q,byPet=false){const i=bubbles.indexOf(q);if(i<0)return;bubbles.splice(i,1);q.el.remove();pops++;if(byPet)petPops++;const star=document.createElement('span');star.className='toy-pop';star.textContent='✧';star.style.left=q.x*100+'%';star.style.top=q.y*100+'%';stage.append(star);setTimeout(()=>star.remove(),450);react();}
 function spawn(point=emitter,trail=false){if(bubbles.length>=90)return;const el=document.createElement('button');el.type='button';el.className='soap-bubble';el.setAttribute('aria-label','點破泡泡');const q={el,x:point?point.x:Math.max(.08,Math.min(.92,px+(Math.random()-.5)*.35)),y:point?Math.max(.04,point.y-.05):.9,born:performance.now(),speed:trail?.003:point?.018+Math.random()*.012:.025+Math.random()*.035,trail,phase:Math.random()*6};el.style.width=(44+Math.random()*14)+'px';el.style.height=el.style.width;el.onpointerdown=e=>{e.stopPropagation()};el.onclick=e=>{e.stopPropagation();pop(q)};el.style.left=q.x*100+'%';el.style.top=q.y*100+'%';stage.append(el);bubbles.push(q);}
 function draw(t){if(!mode)return;const dt=Math.min(.04,(t-last)/1000||.016);last=t;const h=stage.clientHeight,w=stage.clientWidth;let goal=target;
 if(mode==='bubbles'){
  if((held||emitter)&&t>=nextBubble){spawn();nextBubble=t+(emitter?240:420);}
  for(const q of [...bubbles]){q.y=Math.max(.04,q.y-q.speed*dt);if(!q.trail)q.x+=Math.sin(t/700+q.phase)*dt*.006;q.el.style.left=q.x*100+'%';q.el.style.top=q.y*100+'%';if(t-q.born>=10000){q.el.remove();bubbles.splice(bubbles.indexOf(q),1)}}
  const q=bubbles.reduce((a,b)=>!a||Math.abs(b.x-px)<Math.abs(a.x-px)?b:a,null);goal=q?{x:q.x,y:Math.max(.62,Math.min(.88,q.y+.15))}:null;
  if(q&&t-tickled>900&&Math.abs(q.x-px)<.09&&Math.abs(q.y-(py-.15))<.085&&t-q.born>700){pop(q,true);}
 }
 if(goal){const gx=Math.max(.16,Math.min(.84,goal.x)),gy=Math.max(.62,Math.min(.88,goal.y+.12));const dx=gx-px,dy=gy-py;const k=1-Math.exp(-dt*2);px+=dx*k;py+=dy*k;
  pet.style.left=(px-.16)*100+'%';pet.style.top=(py*h-.32*w*.82)/h*100+'%';pet.style.width='32%';
  const close=Math.hypot(goal.x-px,(goal.y-(py-.18))*h/w)<.15;
  if(mode==='feather'&&close){if(t-tickled>900)react();}
  sprite.style.backgroundPosition=t-tickled<600?'100% 0%':Math.abs(dx)>.02?(Math.sin(t/140)>0?'50% 100%':'100% 100%'):'50% 0%';
  sprite.style.transform=reduced?'':`translateY(${t-tickled<600?-Math.sin((t-tickled)/600*Math.PI)*7:Math.sin(t/180)*2}px) rotate(${Math.max(-5,Math.min(5,dx*22))}deg)`;
 }
 if(!held&&((mode==='feather'&&t>until)||(mode==='bubbles'&&!emitter&&!bubbles.length))){resetPet();return}raf=requestAnimationFrame(draw);
 }
 function start(e,b,kind){if(e.button!==0||held||panel.open||phase!=='idle'||voiceSource)return;e.preventDefault();e.stopPropagation();const continuing=kind==='bubbles'&&mode==='bubbles';if(!continuing){resetPet();mode=kind;px=.5;py=.8;tickled=0;}last=performance.now();pet.classList.add('toy-playing');held={id:e.pointerId,b,startX:e.clientX,startY:e.clientY,moved:false,recall:kind==='bubbles'&&b===blower&&!!emitter};b.classList.add('care-held');b.setAttribute('aria-pressed','true');b.setPointerCapture(e.pointerId);
  if(kind==='feather'){ghost=document.createElement('span');ghost.className='feather-ghost';ghost.innerHTML=featherArt;stage.append(ghost);move(e);say('把羽毛移到我旁邊，逗逗我吧！')}else{if(!emitter)for(let i=0;i<3;i++)spawn();nextBubble=performance.now()+240;say('把泡泡棒拖進小屋，放開也會繼續吹！拖著畫出泡泡路線。')}
  if(!raf)raf=requestAnimationFrame(draw);
 }
 function bind(b,kind){
  b.onpointerdown=e=>start(e,b,kind);b.onpointermove=move;
  b.onpointerup=e=>{if(held?.id!==e.pointerId)return;const h=held;stopHold();until=performance.now()+700;
   if(kind==='bubbles'&&((h.recall&&!h.moved)||(h.moved&&(!inRoom(e)||overDock(e))))){recall();say('泡泡棒收好了，剩下的泡泡還可以點破。');}
  };
  b.onpointercancel=()=>resetPet();b.onlostpointercapture=()=>{if(held?.b===b)resetPet()};b.oncontextmenu=e=>e.preventDefault();
  b.onclick=e=>{e.preventDefault();e.stopPropagation()};
  b.onkeydown=e=>{if(e.key==='Escape'&&kind==='bubbles'){e.preventDefault();recall();blower.focus();return;}
   if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();if(kind==='bubbles'){
    if(emitter){recall();blower.focus();return;}
    if(mode!=='bubbles'){resetPet();mode='bubbles';px=.5;py=.8;last=performance.now();pet.classList.add('toy-playing');}
    for(let i=0;i<3;i++)spawn();if(!raf)raf=requestAnimationFrame(draw);
   }else{say('抓著羽毛，移到夥伴的頭或身體旁。')}}
  };
 }
 for(const [b,kind] of [[feather,'feather'],[blower,'bubbles']])bind(b,kind);
 window.addEventListener('blur',()=>resetPet());window.addEventListener('pagehide',clean);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPet()});
 window.guardianToyState=()=>({mode,held:!!held,bubbles:bubbles.length,pops,petPops,tickled,emitter:emitter?{...emitter}:null});
})();
