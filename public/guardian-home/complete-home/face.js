import * as THREE from 'three';
const $=s=>document.querySelector(s),host=$('.stage .guardian-sprite'),stage=$('.stage');
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,512,512,0,.1,20);camera.position.z=10;
const texture=await new THREE.TextureLoader().loadAsync('assets/stoneback-poses-v1.png');texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
const uniforms={gaze:{value:new THREE.Vector2()},blink:{value:0},comfort:{value:0},chew:{value:0},breath:{value:0}};
const geometry=new THREE.PlaneGeometry(512,512,100,100);geometry.translate(256,256,0);const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,.5+uv.getY(i)/2);
const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
material.onBeforeCompile=s=>{Object.assign(s.uniforms,uniforms);s.vertexShader='uniform vec2 gaze;uniform float blink;uniform float comfort;uniform float chew;uniform float breath;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec2 p=vec2(position.x,512.-position.y);
 float head=1.-smoothstep(.65,1.1,length((p-vec2(145.,259.))/vec2(114.,93.)));
 vec2 delta=vec2(0.);
 for(int i=0;i<2;i++){
  vec2 center=i==0?vec2(77.,225.):vec2(178.,237.);
  vec2 radius=i==0?vec2(14.,20.):vec2(24.,25.);
  float r=length((p-center)/radius);float weight=1.-smoothstep(.62,1.35,r);
  delta+=gaze*vec2(2.5,1.8)*weight*(1.-blink);
  delta.y-=(p.y-center.y)*blink*.93*weight;
 }
 delta+=head*(gaze*vec2(1.5,1.)+vec2(comfort*2.,-comfort*3.));
 delta.x+=head*(p.y-259.)*.022*comfort;
 float jaw=(1.-smoothstep(.5,1.,length((p-vec2(137.,302.))/vec2(85.,35.))));
 delta.y+=jaw*chew*1.8;
 float torso=1.-smoothstep(.4,1.,length((p-vec2(270.,280.))/vec2(170.,100.)));
 delta.y-=torso*breath;
 transformed.xy=vec2(p.x+delta.x,512.-p.y-delta.y);
 `)};
const pet=new THREE.Mesh(geometry,material);scene.add(pet);
// Mouth pixels come from the original atlas's open-mouth pose, not a drawn replacement.
const mouthGeometry=new THREE.PlaneGeometry(94,52,1,1);const mu=mouthGeometry.attributes.uv;
for(let i=0;i<mu.count;i++)mu.setXY(i,(512+111+mu.getX(i)*94)/1536,1-(232+(1-mu.getY(i))*60)/1024);
const mouthMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false});
mouthMaterial.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec2 mouthUV=vec2((vMapUv.x*1536.-623.)/94.,(1.-vMapUv.y)*1024.);mouthUV.y=(mouthUV.y-232.)/60.;
 float edge=1.-smoothstep(.78,1.,length((mouthUV-.5)/vec2(.5,.46)));diffuseColor.a*=edge;
 `)};
const mouth=new THREE.Mesh(mouthGeometry,mouthMaterial);mouth.position.set(132,512-280,1);scene.add(mouth);

let elapsed=0,last=0,nextBlink=3,blinkStart=-10,eatStart=0,wasEating=false;
const target=new THREE.Vector2(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
stage.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();target.set(THREE.MathUtils.clamp(((e.clientX-r.left)/r.width*512-145)/180,-1,1),THREE.MathUtils.clamp(((e.clientY-r.top)/r.height*512-245)/180,-1,1))});
function resize(){renderer.setSize(host.clientWidth,host.clientHeight)}new ResizeObserver(resize).observe(host);resize();
renderer.setAnimationLoop(ms=>{const dt=Math.min(.035,(ms-last)/1000||.016);last=ms;if(document.hidden)return;elapsed+=dt;
 const s=window.guardianHome.state();
 const active=!s.poseOnly;host.classList.toggle('face-on',active);renderer.domElement.style.display=active?'block':'none';if(!active)return;
 if(elapsed>nextBlink){blinkStart=elapsed;nextBlink=elapsed+3+Math.random()*2.5}
 const eating=s.care==='eating';if(eating&&!wasEating)eatStart=elapsed;wasEating=eating;
 let opening=s.care==='ready'?.7:0;
 if(eating)opening=(.3+.6*Math.max(0,Math.sin((elapsed-eatStart)*13)))*Math.max(0,1-(elapsed-eatStart)/1.8);
 else opening=Math.max(opening,s.voiceLevel);
 const comfort=s.comfort?1:0;
 uniforms.gaze.value.lerp(target,1-Math.exp(-8*dt));uniforms.blink.value=Math.max(0,1-Math.abs((elapsed-blinkStart-.1)/.1));uniforms.comfort.value=comfort;uniforms.chew.value=eating?Math.sin((elapsed-eatStart)*13):0;uniforms.breath.value=reduced?0:Math.sin(elapsed*1.7)*.5;
 mouthMaterial.opacity=opening;mouth.scale.y=Math.max(.05,opening);mouth.position.x=132+uniforms.gaze.value.x*1.5+comfort*2;mouth.position.y=512-280-uniforms.gaze.value.y+comfort*3;renderer.render(scene,camera);
});
window.guardianFace={ready:true,state:()=>({mouth:mouthMaterial.opacity,active:host.classList.contains('face-on')})};
