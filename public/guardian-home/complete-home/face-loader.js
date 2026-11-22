try {
 if(!window.guardianProfile)throw Error('no_available_companion');
 await import(window.guardianProfile.id==='stoneback'?'./face.js?v=1':'./companion-face.js?v=1');
} catch(error) {
 document.querySelector('.pet').hidden=true;
 const hint=document.querySelector('.hint');
 hint.textContent=window.guardianProfile?'夥伴暫時載入失敗，請返回村莊後重試。':'先選擇初始夥伴，再回小屋一起玩。';
 console.error('Companion rendering unavailable',error);
}
