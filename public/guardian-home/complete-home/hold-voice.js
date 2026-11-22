// Press-to-talk over the existing local recording/1.35x playback pipeline.
(()=>{
 const mic=$('#voice'),room=$('.stage');
 const status=document.createElement('div');status.id='voice-status';status.className='hold-voice-status';status.setAttribute('role','status');status.textContent='長按麥克風錄音 · 放開回放 · 最長 9 秒';room.append(status);
 mic.dataset.caption='長按錄音';mic.setAttribute('aria-label','長按麥克風錄音，放開回放，最長九秒');mic.setAttribute('aria-pressed','false');mic.onclick=null;
 let held=null,holdTimer=null;
 function releaseHold(){clearTimeout(holdTimer);holdTimer=null;const previous=held;held=null;mic.classList.remove('is-held');mic.setAttribute('aria-pressed','false');if(typeof previous==='number'&&mic.hasPointerCapture(previous))mic.releasePointerCapture(previous);}
 function abort(){releaseHold();cancelVoice();voiceStatus('長按麥克風錄音 · 放開回放 · 最長 9 秒');}
 const resetBefore=resetPet;resetPet=function(){abort();resetBefore()};
 const finishBefore=finishVoice;finishVoice=function(){releaseHold();finishBefore()};
 function begin(id){if(held!==null||phase==='decoding'||panel.open)return;resetPet();held=id;mic.classList.add('is-held');mic.setAttribute('aria-pressed','true');
 // Unlock audio synchronously in the actual user gesture for mobile Safari.
 try{voiceContext??=new(window.AudioContext||window.webkitAudioContext)();voiceContext.resume().catch(()=>{})}catch{}
 holdTimer=setTimeout(()=>{holdTimer=null;if(held!==null)startVoice()},180);
 }
 function end(id,cancel=false){if(held!==id)return;if(cancel){abort();return}if(phase==='recording'||phase==='requesting')finishVoice();else{releaseHold();voiceStatus('長按麥克風錄音 · 放開回放 · 最長 9 秒');}}
 mic.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();begin(e.pointerId);if(held===e.pointerId)mic.setPointerCapture(e.pointerId)});
 mic.addEventListener('pointerup',e=>{e.preventDefault();end(e.pointerId)});
 mic.addEventListener('pointercancel',e=>end(e.pointerId,true));mic.addEventListener('lostpointercapture',e=>end(e.pointerId,true));
 mic.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)begin('keyboard')}else if(e.code==='Escape')abort()});
 mic.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();end('keyboard')}});mic.addEventListener('blur',()=>{if(held==='keyboard')abort()});
 // Suppress synthetic click (and the old click-to-open/reset listeners).
 room.addEventListener('click',e=>{if(e.target.closest('#voice')){e.preventDefault();e.stopImmediatePropagation()}},true);
 for(const name of ['contextmenu','selectstart','dragstart'])room.addEventListener(name,e=>e.preventDefault());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)abort()});window.addEventListener('pagehide',abort);window.addEventListener('blur',()=>{if(held!==null)abort()});
 $('.hint').textContent='長按麥克風錄音 · 放開回放 · 拖道具一起玩';
 $('footer').innerHTML='長按麥克風錄音，放開即結束；最長 9 秒自動回放。<br>錄音只在本頁暫存，不上傳；其他玩法與既有聲音保留。';
 window.guardianHoldState=()=>({held:held!==null,phase,recording:recorder?.state==='recording',playing:!!voiceSource,tracks:stream?.getTracks().filter(t=>t.readyState==='live').length||0});
})();
