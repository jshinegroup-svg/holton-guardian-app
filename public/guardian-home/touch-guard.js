// Lock only gestures that START on draggable props (or hold-to-record).
// Touch targets stay fixed through a gesture, even after leaving the prop.
(()=>{
 const room=document.querySelector('.stage');
 const controls='.ball,.care-source,#voice';
 room.addEventListener('touchmove',e=>{
  if(e.touches.length===1&&e.target.closest?.(controls)&&e.cancelable)e.preventDefault();
 },{passive:false});
 room.addEventListener('dragstart',e=>e.preventDefault());
})();
