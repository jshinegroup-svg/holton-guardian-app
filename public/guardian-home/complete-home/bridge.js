// Keep the existing music, chirps, bell and recorded voice playback unchanged.
(()=>{
 let context,analyser,source,epoch=0,joyTimer=0,lastBrush=0,recordAnalyser=null,recordSource=null;
 const buffers=new Map(),bytes=new Uint8Array(256);
 function init(){if(!context){context=new(window.AudioContext||window.webkitAudioContext)();analyser=context.createAnalyser();analyser.fftSize=256;analyser.connect(context.destination);}return context;}
 function stop(){epoch++;if(source){source.onended=null;source.stop();source=null;}}
 function level(a){if(!a)return 0;a.getByteTimeDomainData(bytes);let sum=0;for(const v of bytes)sum+=((v-128)/128)**2;return Math.min(1,Math.sqrt(sum/bytes.length)*6);}
 async function speak(name){stop();if(!state.sound||phase!=='idle'||voiceSource||document.hidden)return;const id=epoch;const clip=window.guardianProfile?.id!=='stoneback'?window.guardianProfile?.sounds[name]:null;if(clip)say(clip.text);try{await init().resume();if(!buffers.has(name))buffers.set(name,fetch(clip?.url||('source-voice/audio/'+name+'.mp3')).then(r=>{if(!r.ok)throw Error();return r.arrayBuffer()}).then(b=>context.decodeAudioData(b)));const b=await buffers.get(name);if(id!==epoch||!state.sound||document.hidden)return;source=context.createBufferSource();source.buffer=b;source.connect(analyser);source.onended=()=>{if(id===epoch)source=null};source.start();}catch{buffers.delete(name);}}
 const oldReset=resetPet;resetPet=function(){stop();clearTimeout(joyTimer);pet.classList.remove('fed-joy');oldReset()};
 const oldReact=react;react=function(kind,text){oldReact(kind,text);speak(kind==='cuddle'?'pet':kind==='laugh'?'play':'hello')};
 window.addEventListener('guardian-fed',()=>{pet.classList.add('fed-joy');say('好好吃！謝謝你，我吃得好開心！');hearts();speak('fed');clearTimeout(joyTimer);joyTimer=setTimeout(()=>pet.classList.remove('fed-joy'),1950)});
 new MutationObserver(()=>{if(pet.dataset.care==='comfortable'&&performance.now()-lastBrush>4000){lastBrush=performance.now();speak('pet')}}).observe(pet,{attributes:true,attributeFilter:['data-care']});
 $('.stage').addEventListener('pointerdown',()=>{if(state.sound)init().resume().catch(()=>{})},{capture:true});
 const oldSound=$('.sound').onclick;$('.sound').onclick=()=>{oldSound();if(!state.sound){stop();say('互動音效與固定台詞已關閉。')}else{say('互動音效與固定台詞已開啟。');speak('hello')}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();clearTimeout(joyTimer);pet.classList.remove('fed-joy')}});window.addEventListener('pagehide',stop);
 window.guardianHome={state:()=>{
  // Tap the old playback graph for animation only; never change its sound or speed.
  if(voiceSource&&voiceSource!==recordSource){recordSource=voiceSource;recordAnalyser=voiceContext.createAnalyser();recordAnalyser.fftSize=256;voiceSource.connect(recordAnalyser)}
  return {care:pet.dataset.care||null,comfort:pet.classList.contains('cuddle')||pet.classList.contains('care-brushed'),poseOnly:pet.classList.contains('walking')||pet.classList.contains('sleep')||pet.classList.contains('choreographed'),voiceLevel:source?level(analyser):voiceSource?level(recordAnalyser):0,speaking:!!source,joy:pet.classList.contains('fed-joy'),sound:state.sound};
 }};
 $('header small').textContent='夥伴小屋 · 一起玩與陪伴';
 $('footer').innerHTML='固定台詞沿用既有音檔；玩球、梳毛、餵食、音樂盒、鈴鐺與學說話都保留。<br>學說話只在你按開始後錄音，關閉即清除，不上傳；尚未啟用 AI 對話。';
 $('.sound').setAttribute('aria-label','開啟或關閉互動音效與固定台詞');
})();
