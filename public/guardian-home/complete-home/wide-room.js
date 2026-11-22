(()=>{
 const stage=$('.stage'),viewport=document.createElement('div');viewport.className='room-viewport';viewport.setAttribute('aria-label','加寬小屋，左右滑動查看');stage.before(viewport);viewport.append(stage);
 const controls=document.createElement('div');controls.className='view-controls';controls.innerHTML='<button type="button" aria-label="向左看">‹</button><p>左右滑看小屋 · 橫向更寬敞</p><button type="button" aria-label="回到夥伴">找夥伴</button><button type="button" aria-label="向右看">›</button>';viewport.after(controls);
 const toolbar=document.createElement('div');toolbar.className='play-toolbar';toolbar.setAttribute('aria-label','小屋玩具與照護');controls.after(toolbar);
 for(const selector of ['.prop-feed','.prop-brush','.prop-bell','#voice','.prop-dance','.prop-jump','.prop-turn','.prop-stretch'])toolbar.append($(selector));
 toolbar.after($('.hold-voice-status'));
 let manualUntil=0,followFrame=0,previous=0;
 function camera(){stage.style.setProperty('--camera-x',viewport.scrollLeft+'px');stage.style.setProperty('--camera-width',Math.min(viewport.clientWidth,stage.clientWidth)+'px')}
 function center(smooth=false){const r=pet.getBoundingClientRect(),v=viewport.getBoundingClientRect();viewport.scrollTo({left:viewport.scrollLeft+r.left+r.width/2-v.left-v.width/2,behavior:smooth?'smooth':'instant'});camera()}
 const btn=controls.querySelectorAll('button');btn[0].onclick=()=>{manualUntil=performance.now()+4000;viewport.scrollBy({left:-viewport.clientWidth*.65,behavior:'smooth'})};btn[2].onclick=()=>{manualUntil=performance.now()+4000;viewport.scrollBy({left:viewport.clientWidth*.65,behavior:'smooth'})};btn[1].onclick=()=>{manualUntil=0;center(true)};
 viewport.addEventListener('scroll',camera,{passive:true});viewport.addEventListener('pointerdown',()=>manualUntil=performance.now()+3000,{passive:true});
 const rooms=[['forest',4/3,56,29],['cloud',3/2,79,26],['cosmos',1672/941,65,25]];
 function sync(){stage.classList.add('room-changing');const [name,ratio,bx,by]=rooms[state.room];stage.style.setProperty('--room-ratio',ratio);stage.style.setProperty('--idle-top',(80-.32*.82*ratio*100)+'%');stage.style.setProperty('--bed-x',bx+'%');stage.style.setProperty('--bed-y',by+'%');$('.room').style.backgroundImage=`url(assets/room-wide-${name}-v1.png)`;stage.dataset.wideRoom=name;void pet.offsetWidth;requestAnimationFrame(()=>{center();stage.classList.remove('room-changing')});}
 const oldRender=render;render=function(){oldRender();sync()};sync();
 const observer=new ResizeObserver(()=>{resetPet();sync()});observer.observe(viewport);
 function follow(t){const dt=Math.min(40,t-previous||16);previous=t;if(!document.hidden&&!panel.open&&t>manualUntil&&(pet.classList.contains('ball-chase')||pet.classList.contains('being-called'))){const r=pet.getBoundingClientRect(),v=viewport.getBoundingClientRect(),dx=r.left+r.width/2-v.left-v.width/2;viewport.scrollLeft+=dx*(1-Math.exp(-dt/220));camera();}followFrame=requestAnimationFrame(follow)}followFrame=requestAnimationFrame(follow);
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(followFrame);observer.disconnect()});
 window.guardianWideRoom={center,viewport,room:()=>state.room};
})();
