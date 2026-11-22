(()=>{
 const profile=window.guardianProfile,catalog=window.guardianCompanions,allowed=window.guardianAllowed;
 const styles=document.createElement('style');styles.textContent=`
 html:not([data-companion="stoneback"]) .guardian-sprite{background-image:none!important}
 .guardian-sprite.species-renderer{background-image:none!important}
 .companion-picker{display:flex;align-items:center;gap:8px;margin:12px 0 0;text-align:left}
 .companion-picker label{font-size:13px;white-space:nowrap;color:#e6d4a4}
 .companion-picker select{width:100%;min-width:0;min-height:44px;font:inherit;font-size:16px;color:#fff2ce;background:#153e48;border:1px solid #ae925b;border-radius:12px;padding:8px}
 .companion-note{font-size:11px;line-height:1.5;color:#bfd4d6;margin:6px 0 0}
 .choice:disabled{opacity:.45;cursor:default}`;document.head.append(styles);
 if(!profile)return;
 const row=document.createElement('div');row.className='companion-picker';
 const label=document.createElement('label');label.htmlFor='home-companion';label.textContent='陪我玩';
 const select=document.createElement('select');select.id='home-companion';select.setAttribute('aria-label','選擇小屋夥伴');
 for(const entry of Object.values(catalog)){const option=document.createElement('option');option.value=entry.id;option.disabled=!allowed.includes(entry.id);option.textContent=entry.name+(option.disabled?'（尚未取得）':'');select.append(option);}
 select.value=profile.id;row.append(label,select);document.querySelector('header').append(row);
 const note=document.createElement('p');note.className='companion-note';note.textContent='切換不消耗點數，也不更換任務夥伴；守護獸以小屋基本造型登場。';row.after(note);
 function choose(id){if(!allowed.includes(id)||id===profile.id)return;const url=new URL(location.href);url.searchParams.set('companion',id);location.replace(url.href);}
 select.onchange=()=>choose(select.value);
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
 document.querySelector('#invite').onclick=()=>{
  resetPet();open('<h2>今天和誰一起玩？</h2><p>已取得的夥伴都能來小屋，不會花掉點數或改變收藏。</p><div class="choices" id="home-roster"></div>');
  for(const entry of Object.values(catalog)){const button=document.createElement('button');button.className='choice';button.textContent=(entry.id===profile.id?'✓ ':'')+entry.name+(allowed.includes(entry.id)?'':' · 尚未取得');button.disabled=!allowed.includes(entry.id);button.onclick=()=>{panel.close();choose(entry.id)};document.querySelector('#home-roster').append(button);}
 };
 const oldOpen=open;open=function(html){oldOpen(html.replaceAll('岩背龜',profile.name));};
 window.guardianRoster={id:profile.id,allowed:[...allowed],mouth:[...profile.mouth]};
})();
