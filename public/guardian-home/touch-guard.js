// The room is a direct-manipulation surface, not a page-scroll handle.
// Non-passive touchmove complements touch-action on iOS/WebKit webviews.
// Listeners stay on the room: normal page/dialog scrolling is unaffected.
(()=>{
 const room=document.querySelector('.stage');
 room.addEventListener('touchmove',e=>{
  if(e.touches.length===1&&e.cancelable)e.preventDefault();
 },{passive:false});
 room.addEventListener('dragstart',e=>e.preventDefault());
})();
