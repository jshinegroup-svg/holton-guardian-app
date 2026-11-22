import * as THREE from 'three';
import {createRenderSize} from './render-size.js?v=1';
// A chroma-key atlas is rendered in WebGL; source bitmaps remain unchanged.
// Existing gameplay still drives pose, movement, food, brush and recorded voice.
const profile=window.guardianProfile,host=document.querySelector('.stage .guardian-sprite');
const pet=document.querySelector('.stage .pet');
host.classList.add('species-renderer');
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
host.appendChild(renderer.domElement);
const texture=await new THREE.TextureLoader().loadAsync(profile.atlas);
texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
const uniforms={atlas:{value:texture},cell:{value:new THREE.Vector2()},mouth:{value:new THREE.Vector2(...profile.mouth)},chew:{value:0}};
const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,
 vertexShader:`varying vec2 localUV; uniform vec2 mouth; uniform float chew;
 void main(){localUV=uv;vec3 p=position;vec2 q=vec2(uv.x,1.-uv.y);
 float jaw=1.-smoothstep(.04,.15,length(q-mouth));p.y-=jaw*chew*.012;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`varying vec2 localUV;uniform sampler2D atlas;uniform vec2 cell;
 void main(){vec2 uv=(vec2(localUV.x,localUV.y)+vec2(cell.x,1.-cell.y))/vec2(3.,2.);
 vec4 c=texture2D(atlas,uv);float key=min(c.r,c.b)-c.g;
 float alpha=1.-smoothstep(.18,.62,key);if(alpha<.015)discard;
 gl_FragColor=vec4(c.rgb,alpha);}`});
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.5,.5,.5,-.5,.1,10);camera.position.z=2;
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1,24,24),material));
const renderSize=createRenderSize(renderer,host);
let pose=0,mouth=0,nextBlink=performance.now()+3000,blinkUntil=0;
renderer.setAnimationLoop(ms=>{
 if(document.hidden)return;
 const state=window.guardianHome.state();
 const style=getComputedStyle(host),xy=style.backgroundPosition.split(' ');
 let col=Math.round(parseFloat(xy[0])/50)||0,row=Math.round(parseFloat(xy[1])/100)||0;
 if(ms>nextBlink){blinkUntil=ms+140;nextBlink=ms+3500+Math.random()*2500;}
 mouth=Math.max(state.voiceLevel,state.care==='ready'?.8:state.care==='eating'?(Math.sin(ms/90)+1)/2:0);
 if(!state.poseOnly&&!pet.classList.contains('ball-chase')&&!pet.classList.contains('being-called')){
  if(state.comfort||ms<blinkUntil){col=2;row=0;}
  else if(mouth>.12){col=Math.sin(ms/100)>-.3?1:0;row=0;}
 }
 col=THREE.MathUtils.clamp(col,0,2);row=THREE.MathUtils.clamp(row,0,1);
 pose=row*3+col;uniforms.cell.value.set(col,row);uniforms.chew.value=mouth;
 renderSize.apply();renderer.render(scene,camera);
});
window.addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);renderSize.dispose();texture.dispose();material.dispose();renderer.dispose();});
window.guardianFace={ready:true,state:()=>({mouth,active:true,pose,character:profile.id})};
