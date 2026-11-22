(()=>{
 const profile=window.guardianProfile,catalog=window.guardianCompanions,allowed=window.guardianAllowed;
 const styles=document.createElement('style');styles.textContent=`
 html:not([data-companion="stoneback"]) .guardian-sprite{background-image:none!important}
 .guardian-sprite.species-renderer{background-image:none!important}
 .companion-picker{display:flex;align-items:center;gap:8px;margin:12px 0 0;text-align:left}
 .companion-picker label{font-size:13px;white-space:nowrap;color:#e6d4a4}
 .companion-picker button{display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:64px;font:inherit;font-size:16px;color:#fff2ce;background:#153e48;border:1px solid #ae925b;border-radius:12px;padding:6px 12px;text-align:left}
 .companion-thumb{width:64px;height:64px;flex:none;object-fit:contain;pointer-events:none}
 #home-roster{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 #home-roster .choice{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;gap:4px;padding:10px;font-size:16px}
 #home-roster .companion-thumb{width:96px;height:96px;max-width:100%}
 #home-roster .choice[aria-pressed="true"]{outline:3px solid #f3cf70;background:#285967}
 #home-companion:focus-visible,#home-roster .choice:focus-visible{outline:3px solid #fff2ce;outline-offset:3px}
 .companion-note{font-size:11px;line-height:1.5;color:#bfd4d6;margin:6px 0 0}
 .choice:disabled{opacity:.45;cursor:default}`;document.head.append(styles);
 if(!profile)return;
 const available=Object.values(catalog).filter(entry=>allowed.includes(entry.id));
 const row=document.createElement('div');row.className='companion-picker';
 const label=document.createElement('label');label.htmlFor='home-companion';label.textContent='陪我玩';
 // Render the existing first atlas pose, using the same chroma key as the pet.
 const portraits=new Map();
 function portrait(entry){
  const canvas=document.createElement('canvas');canvas.className='companion-thumb';canvas.width=128;canvas.height=128;canvas.setAttribute('aria-hidden','true');
  if(!portraits.has(entry.id))portraits.set(entry.id,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=entry.atlas;}));
  portraits.get(entry.id).then(img=>{if(!img)return;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,img.width/3,img.height/2,0,0,128,128);const pixels=ctx.getImageData(0,0,128,128),d=pixels.data;for(let i=0;i<d.length;i+=4){const key=(Math.min(d[i],d[i+2])-d[i+1])/255;const t=Math.max(0,Math.min(1,(key-.18)/.44));d[i+3]*=1-t*t*(3-2*t);}ctx.putImageData(pixels,0,0);canvas.dataset.ready='true';});
  return canvas;
 }
 const select=document.createElement('button');select.type='button';select.id='home-companion';select.dataset.companion=profile.id;select.setAttribute('aria-label','選擇小屋夥伴，目前是'+profile.name);select.setAttribute('aria-haspopup','dialog');
 const name=document.createElement('span');name.textContent=profile.name;const arrow=document.createElement('span');arrow.textContent='▾';arrow.style.marginLeft='auto';arrow.setAttribute('aria-hidden','true');
 select.append(portrait(profile),name,arrow);row.append(label,select);document.querySelector('header').append(row);
 const note=document.createElement('p');note.className='companion-note';note.textContent='切換不消耗點數，也不更換任務夥伴；守護獸以小屋基本造型登場。';row.after(note);
 function choose(id){if(!allowed.includes(id)||id===profile.id)return;const url=new URL(location.href);url.searchParams.set('companion',id);location.replace(url.href);}

 const updateLabels=()=>{
  document.querySelector('.badge').textContent=profile.name;
  document.querySelector('.pet').setAttribute('aria-label',profile.name+'，點一下打招呼');
  document.querySelector('.guardian-sprite').setAttribute('aria-label',profile.name);
  for(const [s,text] of [['.prop-feed','蘋果，拖到'+profile.name+'嘴邊餵食'],['.prop-brush','梳子，拖到'+profile.name+'身上來回梳'],['.prop-bell','鈴鐺，拖到地毯呼喚'+profile.name],['.ball','玩球，滑動球讓'+profile.name+'追逐']])document.querySelector(s)?.setAttribute('aria-label',text);
  const bed=document.querySelector('.bed');if(bed.textContent.includes('岩背龜'))bed.textContent=bed.textContent.replace('岩背龜',profile.name);
 };
 updateLabels();
 // Existing reset/ball/sleep actions can refresh legacy labels: update only on action boundaries.
 document.querySelector('.stage').addEventListener('pointerup',()=>setTimeout(updateLabels,0));
 document.querySelector('#invite').textContent='換個夥伴';
 function showRoster(){
  resetPet();open('<h2>今天和誰一起玩？</h2><p>已取得的夥伴都能來小屋，不會花掉點數或改變收藏。</p><div class="choices" id="home-roster"></div>');
  for(const entry of available){const button=document.createElement('button');button.className='choice';button.type='button';button.dataset.companion=entry.id;button.setAttribute('aria-pressed',String(entry.id===profile.id));const text=document.createElement('span');text.textContent=(entry.id===profile.id?'✓ ':'')+entry.name;button.append(portrait(entry),text);button.onclick=()=>{panel.close();choose(entry.id)};document.querySelector('#home-roster').append(button);}
 };
 select.onclick=showRoster;document.querySelector('#invite').onclick=showRoster;
 const oldOpen=open;open=function(html){oldOpen(html.replaceAll('岩背龜',profile.name));};
 window.guardianRoster={id:profile.id,allowed:[...allowed],mouth:[...profile.mouth]};
})();
