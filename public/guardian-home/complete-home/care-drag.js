// Contact-based care; pointer capture keeps finger drags reliable on mobile.
(()=>{
 const stage=$('.stage'),sprite=pet.querySelector('.guardian-sprite');
 let drag=null,ghost=null,mouthTimer=0,finishTimer=0,brushTimer=0,feeds=0,strokes=0;
 const originalReset=resetPet;
 function clean(){clearTimeout(mouthTimer);clearTimeout(finishTimer);clearTimeout(brushTimer);mouthTimer=finishTimer=brushTimer=0;const old=drag;drag=null;if(old?.source.hasPointerCapture(old.id))old.source.releasePointerCapture(old.id);ghost?.remove();ghost=null;for(const b of $$('.care-source'))b.classList.remove('care-held');pet.classList.remove('care-held-pet','care-brushed','care-eating');pet.removeAttribute('data-care');stage.classList.remove('care-active');}
 resetPet=function(){clean();originalReset()};
 function zones(x,y){const r=pet.getBoundingClientRect(),u=(x-r.left)/r.width,v=(y-r.top)/r.height;return {mouth:Math.hypot((u-(window.guardianProfile?.mouth[0]??.29))/.16,(v-(window.guardianProfile?.mouth[1]??.55))/.13)<1,body:Math.hypot((u-.51)/.44,(v-.53)/.36)<1,width:r.width};}
 function position(x,y){if(!ghost)return;const r=stage.getBoundingClientRect();ghost.style.left=`${Math.max(22,Math.min(r.width-22,x-r.left))}px`;ghost.style.top=`${Math.max(22,Math.min(r.height-22,y-r.top))}px`;}
 function eat(){if(!drag||drag.kind!=='feed'||drag.eaten)return;drag.eaten=true;feeds++;pet.dataset.care='eating';pet.classList.add('care-eating');ghost.classList.add('care-consumed');say('啊姆……吃到了！謝謝你餵我。');chirp('wave');hearts();finishTimer=setTimeout(()=>{clean();originalReset();window.dispatchEvent(new Event('guardian-fed'))},1800);}
 function move(e){if(!drag||e.pointerId!==drag.id||drag.eaten)return;const z=zones(e.clientX,e.clientY);position(e.clientX,e.clientY);const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>8;
 if(drag.kind==='feed'){if(z.mouth){pet.dataset.care='ready';ghost.classList.add('care-contact');if(!mouthTimer)mouthTimer=setTimeout(eat,450)}else{clearTimeout(mouthTimer);mouthTimer=0;ghost.classList.remove('care-contact');pet.dataset.care='holding';}}
 else {ghost.classList.toggle('care-contact',z.body);if(z.body&&drag.wasBody){drag.distance+=Math.hypot(dx,dy);const direction=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):Math.sign(dy);if(direction&&drag.direction&&direction!==drag.direction)drag.turns++;if(direction)drag.direction=direction;if(drag.distance>z.width*.22&&drag.turns>=1){drag.distance=0;drag.turns=0;strokes++;pet.classList.add('care-brushed');pet.dataset.care='comfortable';clearTimeout(brushTimer);brushTimer=setTimeout(()=>{pet.classList.remove('care-brushed');if(drag)pet.dataset.care='holding'},800);if(performance.now()-drag.lastPraise>1600){say('嗯～這樣來回梳，好舒服。');hearts();drag.lastPraise=performance.now();}}}else if(!z.body){drag.distance=0;drag.turns=0;drag.direction=0;pet.classList.remove('care-brushed');pet.dataset.care='holding';}drag.wasBody=z.body;}
 drag.x=e.clientX;drag.y=e.clientY;
 }
 function release(e,cancelled=false){if(!drag||e.pointerId!==drag.id)return;if(drag.eaten)return;const kind=drag.kind,moved=drag.moved;clean();originalReset();if(!cancelled&&moved)say(kind==='feed'?'把蘋果送到嘴邊，停一下，我才吃得到喔。':'梳子放好了，下次再幫我梳梳。');}
 for(const kind of ['feed','brush']){const source=$('.prop-'+kind);source.classList.add('care-source');source.setAttribute('aria-label',kind==='feed'?'蘋果，拖到岩背龜嘴邊餵食':'梳子，拖到岩背龜身上來回梳');source.onclick=()=>{if(!drag)say(kind==='feed'?'抓著蘋果拖到我的嘴邊，停一下喔。':'抓著梳子，在我身上輕輕來回梳。')};
 source.onpointerdown=e=>{if(e.button!==0||drag||panel.open)return;e.preventDefault();resetPet();pet.classList.add('care-held-pet');stage.classList.add('care-active');pet.dataset.care='holding';drag={source,kind,id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,distance:0,turns:0,direction:0,wasBody:false,lastPraise:-Infinity,eaten:false};ghost=document.createElement('span');ghost.className='care-ghost care-'+kind;ghost.setAttribute('aria-hidden','true');stage.append(ghost);source.classList.add('care-held');position(e.clientX,e.clientY);source.setPointerCapture(e.pointerId);};
 source.onpointermove=move;source.onpointerup=e=>release(e);source.onpointercancel=e=>{if(drag?.eaten){resetPet();return}release(e,true)};source.onlostpointercapture=e=>{if(drag&&!drag.eaten)release(e,true)};
 }
 window.addEventListener('pagehide',clean);
 $('.hint').textContent='拖蘋果到嘴邊 · 拿梳子來回梳 · 滑球一起玩';
 window.guardianCareState=()=>({active:!!drag,kind:drag?.kind||null,feeds,strokes,eaten:!!drag?.eaten});
})();
