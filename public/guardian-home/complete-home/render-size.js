// Resize only immediately before drawing, never in the post-frame layout observer.
// CSS owns the displayed size; coarse backing sizes avoid per-step GPU reallocations.
export function createRenderSize(renderer,host){
 let dirty=true,width=0,height=0;
 const observer=new ResizeObserver(()=>{dirty=true});observer.observe(host);
 return {
  apply(){
   if(!dirty)return;dirty=false;
   const w=Math.max(64,Math.ceil(host.clientWidth/64)*64),h=Math.max(64,Math.ceil(host.clientHeight/64)*64);
   if(w===width&&h===height)return;
   width=w;height=h;renderer.setSize(w,h,false);
  },
  dispose(){observer.disconnect();}
 };
}
