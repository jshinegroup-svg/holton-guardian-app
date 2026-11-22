// Help is read-only: opening it never changes collections, tasks or points.
(()=>{
 const hint=document.createElement('p');hint.className='landscape-hint';hint.innerHTML='<span aria-hidden="true">↻ 📱</span> 橫向玩會更有趣喔！<small>看見更多空間，直向也能左右滑動。</small>';
 document.querySelector('header').append(hint);
 const help=document.createElement('button');help.type='button';help.className='home-guide-button';help.textContent='ⓘ 玩法指南';help.setAttribute('aria-label','小屋玩法指南');
 document.querySelector('.view-controls').append(help);
 help.onclick=()=>{
  resetPet();
  open('<div class="home-guide"><h2>一起玩小屋</h2><p>↻ 橫向玩會更有趣喔！直向也能玩，左右滑空白處看更多空間；左右兩側工具不會跟著滑走。按「找夥伴」回到牠身旁。</p><ul>'+[
   '🐾 <b>看圖選夥伴：</b>點上方「陪我玩」的小圖，或「換個夥伴」。只顯示目前可用角色，不扣點數、不改收藏或任務進度。',
   '🏡 <b>換房間：</b>上方可切換森林、雲海、星空三個小屋。',
   '🍎 <b>餵食：</b>拖蘋果到嘴邊停一下，吃完會開心回應。',
   '🪮 <b>梳毛：</b>拖梳子碰到身體，來回輕梳。',
   '⚽ <b>玩球：</b>滑動球讓它滾出去，夥伴會追球；點地毯也能傳球。',
   '🔔 <b>呼喚：</b>把鈴鐺拖到想讓夥伴前往的位置，放開呼喚牠。',
   '🪶 <b>逗逗羽毛：</b>拖著羽毛在夥伴旁移動，牠會靠近、開心回應。',
   '🫧 <b>泡泡棒：</b>點一下吹一小群；拖進房間持續吹，沿路畫泡泡。停住 3 秒自動收回，也可點工具列收回。泡泡可點破，約 10 秒消失；滿量時替換最舊的，繼續產生新的。',
   '🎵 <b>音樂盒：</b>點一下播放，再點停止。彈跳墊可以跳一跳，睡窩可以休息、叫醒。',
   '🎤 <b>學我說話：</b>長按麥克風錄音，放開就回放，最多 9 秒自動結束。第一次需允許麥克風；授權時若已放手，請再長按一次。',
   '💬 <b>聲音：</b>點夥伴有固定語音；♪ 可開關互動音效與台詞。目前不是 AI 自由對話。',
   '‹ <b>離開：</b>按「回到村莊」離開小屋，錄音與播放會停止。'
  ].map(line=>'<li>'+line+'</li>').join('')+'</ul></div>');
 };
})();
