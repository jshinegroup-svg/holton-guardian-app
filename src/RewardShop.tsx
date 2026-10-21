import DeferredCardImage from './DeferredCardImage';
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
export type Wish = { id: string; name: string; cost: number; enabled: boolean; custom?: boolean; style?: 'gold'|'scroll'|'crystal'; note?: string };
export type WishReceipt = { id: string; name: string; cost: number; at: string; fulfilled?: boolean; wishId?: string; custom?: boolean; style?: Wish['style']; note?: string; balanceBefore?: number; balanceAfter?: number; usedAt?: string };
export type ShopData = { shopEnabled?: boolean; wishes?: Wish[]; wishReceipts?: WishReceipt[]; orbs: number };
const wishArt: Record<string, number> = { 'wish-0': require('../assets/cards-mobile/rewards/toy.jpg'), 'wish-1': require('../assets/cards-mobile/rewards/drink.jpg'), 'wish-2': require('../assets/cards-mobile/rewards/family.jpg'), 'wish-3': require('../assets/cards-mobile/rewards/movie.jpg') };
const extraArt: Record<string, number> = {
  'wish-4': require('../assets/cards-mobile/rewards/snack.jpg'), 'wish-5': require('../assets/cards-mobile/rewards/indoor.jpg'),
  'wish-6': require('../assets/cards-mobile/rewards/outdoor.jpg'), 'wish-7': require('../assets/cards-mobile/rewards/activity.jpg'),
  'wish-8': require('../assets/cards-mobile/rewards/adventure.jpg'), 'wish-9': require('../assets/cards/rewards/game.jpg'),
};
const customArt: Record<string, number> = {gold:require('../assets/cards-mobile/rewards/extra.jpg'),scroll:require('../assets/cards-mobile/rewards/custom/scroll.jpg'),crystal:require('../assets/cards-mobile/rewards/custom/crystal.jpg')};
const recommendations = [100,20,20,60,20,30,30,30,60,20];
export const defaultWishes: Wish[] = ['小禮物', '喜歡的飲料', '親子遊戲 15 分鐘', '一起看電影', '喜歡的點心', '自選室內活動', '自選戶外活動', '自選活動', '戶外冒險', '自選遊戲'].map((name, i) => ({ id: `wish-${i}`, name, cost: recommendations[i], enabled: false }));
export const starterWishes = ():Wish[] => defaultWishes.map(w=>({...w,enabled:true}));
export const customSlot = (n:number):Wish => ({id:`custom-${n}`,name:'',cost:0,enabled:false,custom:true,style:(['gold','scroll','crystal'] as const)[(n-1)%3],note:''});
export function catalog(wishes?:Wish[]):Wish[] {
  const old = (wishes??[]).map(w=>({...w,cost:w.cost>0?w.cost:defaultWishes.find(d=>d.id===w.id)?.cost??w.cost}));
  const all = [...old,...defaultWishes.filter(w=>!old.some(x=>x.id===w.id)).map(w=>({...w}))];
  for(let n=1;all.filter(w=>w.custom).length<3;n++) if(!all.some(w=>w.id===`custom-${n}`)) all.push(customSlot(n));
  return all;
}
function Art({wish,small=false}:{wish:Wish|WishReceipt;small?:boolean}) {
  const id='wishId' in wish ? wish.wishId : wish.id;
  const art=wish.custom ? customArt[wish.style??'gold'] : wishArt[id??'']??extraArt[id??''];
  return <View style={s.cardTap}><DeferredCardImage source={art??customArt.gold} accessibilityLabel={`${wish.name||'自訂心願'}${wish.custom?'造型':'原卡'}`} style={{width:small?120:170,height:small?180:255,alignSelf:'center'}} resizeMode="contain"/>{wish.custom?<View style={s.customCaption}><Text style={s.title}>{wish.name||'填入你的心願'}</Text><Text style={s.text}>{wish.note||'內容與點數，由你們一起約定'}</Text></View>:null}</View>;
}
export function redeemWish<T extends ShopData>(s: T, id: string, receiptId: string): T {
  const w = catalog(s.wishes).find(x => x.id === id);
  if (!s.shopEnabled || !w?.enabled || !Number.isSafeInteger(w.cost) || w.cost <= 0 || s.orbs < w.cost || s.wishReceipts?.some(r => r.id === receiptId)) return s;
  return { ...s, orbs: s.orbs - w.cost, wishReceipts: [...(s.wishReceipts ?? []), { id: receiptId, wishId:w.id, name: w.name, cost: w.cost, note:w.note, custom:w.custom, style:w.style, balanceBefore:s.orbs, balanceAfter:s.orbs-w.cost, at: new Date().toISOString() }] };
}
export function redeemWishes<T extends ShopData>(state: T, items: Wish[], token: string): T {
  if (!items.length || new Set(items.map(w => w.id)).size !== items.length) return state;
  let next = state;
  for (const item of items) {
    const live = catalog(next.wishes).find(w => w.id === item.id);
    if (!live || live.name !== item.name || live.cost !== item.cost || live.note !== item.note || live.style !== item.style) return state;
    const updated = redeemWish(next, item.id, `${token}:${item.id}`);
    if (updated === next) return state;
    next = updated;
  }
  return next;
}
export default function RewardShop<T extends ShopData>({ data, settings, saving, change }: { data: T; settings: boolean; saving: boolean; change: (fn: (s: T) => T) => Promise<boolean> }) {
  const [draft, setDraft] = useState(()=>catalog(data.wishes));
  const [selected, setSelected] = useState<Wish[]>([]);
  const submitting = useRef(false);
  const [note, setNote] = useState('');
  const action = (label: string, fn: () => void, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || saving} onPress={fn} style={({pressed})=>[s.button, pressed && s.pressed, (disabled || saving) && { opacity: .45 }]}><Text style={s.text}>{label}</Text></Pressable>;
  const edit=(id:string,patch:Partial<Wish>)=>setDraft(old=>old.map(w=>w.id===id?{...w,...patch}:w));
  const total = selected.reduce((sum, w) => sum + w.cost, 0);
  const toggle = (wish: Wish) => {
    setNote('');
    setSelected(old => old.some(w => w.id === wish.id) ? old.filter(w => w.id !== wish.id) : [...old, {...wish}]);
  };
  const checkout = async () => {
    if (submitting.current || !selected.length) return;
    submitting.current = true;
    try {
      const token = `wish-${Date.now()}-${Math.random()}`;
      let accepted = false;
      const saved = await change(state => {
        const next = redeemWishes(state, selected, token);
        accepted = next !== state;
        return next;
      });
      if (saved && accepted) { setSelected([]); setNote('✓ 兌換完成！已記下所有心願，和大人一起安排實現吧！'); }
      else setNote('尚未完成兌換。請核對點數與品項，或稍後再試；選擇已保留。');
    } finally { submitting.current = false; }
  };
  return <View style={s.panel}><Text testID={!data.shopEnabled||!catalog(data.wishes).some(w=>w.enabled&&w.name.trim()&&w.cost>0)?"wish-guide-empty":undefined} style={s.title}>✧ 心願小屋</Text><Text style={s.text}>可用能量球 {data.orbs} 顆</Text>
    {settings ? <>
      <Text style={s.text}>由大人決定是否開放。關閉不扣點、不清空餘額，也不影響守護獸收藏。這是共同設定，不是家長身分驗證。</Text>
      {action(`生活獎勵：${data.shopEnabled ? '開啟' : '關閉'}`, () => void change(s => ({ ...s, shopEnabled: !s.shopEnabled })))}
      <Text style={s.text}>原卡已預填建議點數，可直接使用；也可以修改價格或關閉項目。自訂卡請先約定內容與點數，再開放。陪伴並不需要先賺點數，這裡是額外約定的活動。</Text>
      {draft.map((w, i) => <View key={w.id} style={s.item}>
        <Art wish={w} small/><Text style={s.text}>{w.custom?`自訂心願卡 ${w.id.split('-')[1]}`:`推薦 ${recommendations[Number(w.id.split('-')[1])]??'自訂'} 點（已預填，可自行調整）`}</Text><TextInput accessibilityLabel={`獎勵名稱 ${i + 1}`} value={w.name} onChangeText={name => setDraft(draft.map(x => x.id === w.id ? { ...x, name } : x))} maxLength={40} style={s.input} />
        <TextInput accessibilityLabel={`${w.name}點數`} keyboardType="number-pad" placeholder="請設定點數" placeholderTextColor="#b8ccd2" value={w.cost ? String(w.cost) : ''} onChangeText={v => setDraft(draft.map(x => x.id === w.id ? { ...x, cost: /^\d{1,6}$/.test(v) ? Number(v) : 0 } : x))} style={s.input} />
        {w.custom?<><TextInput accessibilityLabel={`小約定 ${w.id}`} value={w.note??''} onChangeText={note=>edit(w.id,{note})} maxLength={120} placeholder="小約定（選填）" placeholderTextColor="#b8ccd2" style={s.input}/><Text style={s.text}>選擇造型（不影響點數）</Text><View style={s.styleRow}>{(['gold','scroll','crystal'] as const).map((style,j)=><Pressable key={style} accessibilityRole="button" accessibilityLabel={`${w.id} ${['金色寶箱','星光卷軸','水晶寶箱'][j]}`} aria-pressed={w.style===style} onPress={()=>edit(w.id,{style})} style={[s.styleChoice,w.style===style&&s.productSelected]}><DeferredCardImage source={customArt[style]} style={{width:52,height:78}} resizeMode="contain"/><Text style={s.text}>{w.style===style?'✓ ':''}{['金色寶箱','星光卷軸','水晶寶箱'][j]}</Text></Pressable>)}</View></>:null}
        {action(`${w.name||w.id}：${w.enabled ? '已勾選' : '未開放'}`, () => setDraft(draft.map(x => x.id === w.id ? { ...x, enabled: !x.enabled } : x)))}
      </View>)}
      {draft.filter(w=>w.custom).length<5?action('＋新增自訂卡',()=>setDraft(old=>{if(old.filter(w=>w.custom).length>=5)return old;let n=1;while(old.some(w=>w.id===`custom-${n}`))n++;return [...old,customSlot(n)];})):null}
      <Text style={s.text}>原卡共 10 張；自訂卡先提供 3 張，最多 5 張。未命名或未開放的自訂卡不會出現在小舖。</Text>
      {action('儲存生活獎勵', async () => {
        if (draft.some(w => w.enabled && (!w.name.trim() || !Number.isSafeInteger(w.cost) || w.cost <= 0))) { setNote('請填寫名稱及大於零的整數點數，再開放項目。'); return; }
        if (await change(s => ({ ...s, wishes: draft.map(w => ({ ...w, name: w.name.trim(), note:w.note?.trim() })) }))) setNote('生活獎勵已儲存。');
      })}
    </> : data.shopEnabled ? <>
      <Text style={s.text}>① 按「我想兌換」選心願，可選多項。② 滑到下方核對，最後一次確認才扣點。</Text>
      <Text accessibilityLiveRegion="polite" style={s.text}>已選 {selected.length} 項 · 合計 {total} 點</Text>
      {catalog(data.wishes).filter(w => w.enabled && w.name.trim() && w.cost > 0).map(w => {
        const picked = selected.some(x => x.id === w.id);
        const unavailable = !picked && total + w.cost > data.orbs;
        return <View key={w.id} style={[s.product, picked && s.productSelected]}>
          <Pressable testID="wish-guide-card" accessibilityRole="button" accessibilityLabel={`${picked?'取消選擇':'選擇'}${w.name}卡片`} aria-pressed={picked} accessibilityState={{disabled:unavailable||saving}} disabled={unavailable||saving} onPress={()=>toggle(w)} style={({pressed})=>[s.cardTap,pressed&&s.pressed]}>
            <Text style={[s.badge,picked&&s.badgeSelected]}>{picked?'✓ 已選取 · 1 張':'點卡片也可以選擇'}</Text>
            <Art wish={w}/>
            {!w.custom?<Text style={s.title}>{w.name}</Text>:null}{!w.custom&&w.note?<Text style={s.text}>{w.note}</Text>:null}<Text style={s.text}>{w.cost} 點／張</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`${picked?'取消選擇':'我想兌換'}${w.name}`} aria-pressed={picked} accessibilityState={{disabled:unavailable||saving}} disabled={unavailable||saving} onPress={()=>toggle(w)} style={({pressed})=>[s.button,picked&&s.selectedButton,pressed&&s.pressed,(unavailable||saving)&&{opacity:.45}]}><Text style={s.text}>{picked?'✓ 已選取｜先不換，取消':'＋ 我想兌換'}</Text></Pressable>
          {picked?<Text accessibilityLiveRegion="polite" style={s.text}>已加入清單，尚未扣點。共選 {selected.length} 項／{total} 點；往下確認。</Text>:unavailable?<Text style={s.text}>再選這項還差 {total+w.cost-data.orbs} 點，可先取消其他選擇。</Text>:null}
        </View>;
      })}
      {!(data.wishes ?? []).some(w => w.enabled && w.cost > 0) ? <Text style={s.text}>目前還沒有開放的心願，點數會繼續累積。</Text> : null}
      <Text style={s.text}>更多心願：10 張原卡與寶箱／卷軸自訂卡，可請家長在「家長小屋 → 心願獎勵」填寫點數並開放。</Text>
      <View style={s.summary}><Text style={s.title}>最後確認 · 我的兌換清單</Text>
        {!selected.length?<Text style={s.text}>還沒選心願。先在喜歡的卡片按「我想兌換」。</Text>:<>
          {selected.map(w=><View key={w.id} style={s.item}><Text style={s.text}>{w.name} × 1 · {w.cost} 點</Text>{action(`移除${w.name}`,()=>toggle(w))}</View>)}
          <Text style={s.title}>{selected.length} 項，共 {total} 點</Text>
          <Text style={s.text}>{total<=data.orbs?`目前 ${data.orbs} − 兌換 ${total} ＝ 剩餘 ${data.orbs-total} 點`:`點數不足，還差 ${total-data.orbs} 點，請移除部分心願。`}</Text>
          <Text style={s.text}>按下面的確認按鈕，才會一次扣除點數。</Text>
          {action(`確認兌換 ${selected.length} 項 · ${total} 點`,()=>void checkout(),total>data.orbs)}
          {action('全部先不換',()=>{setSelected([]);setNote('已取消選擇，沒有扣點。');})}
        </>}
      </View>
    </> : <Text style={s.text}>生活獎勵尚未開放。點數繼續累積，不會過期。</Text>}
    {note ? <Text accessibilityRole="alert" style={s.text}>{note}</Text> : null}
    <Text style={s.title}>心願紀錄</Text>
    {[...(data.wishReceipts ?? [])].reverse().map(r => <View key={r.id} style={s.item}><Text style={s.text}>{r.name} · {r.cost} 點 · {r.fulfilled ? '已實現' : '待實現'}</Text><Text style={s.text}>{new Date(r.at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}{r.note?` · 約定：${r.note}`:''}</Text>{settings && !r.fulfilled ? action(`標記${r.name}已實現`, () => void change(s => ({ ...s, wishReceipts: (s.wishReceipts ?? []).map((x: WishReceipt) => x.id === r.id ? { ...x, fulfilled: true } : x) }))) : null}</View>)}
  </View>;
}
const s = StyleSheet.create({ panel: { padding: 18, borderRadius: 24, borderWidth: 2, borderColor: '#d4b977', backgroundColor: 'rgba(10,38,52,.94)', gap: 14 }, title: { fontSize: 22, fontWeight: '800', color: '#ffe7ad' }, text: { fontSize: 16, lineHeight: 26, color: '#edf6f5' }, item: { gap: 10, paddingVertical: 12, borderTopWidth: 1, borderColor: '#557783' }, button: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#bba66f', borderRadius: 20, backgroundColor: '#105c70', alignItems: 'center' }, product: { gap: 12, padding: 12, borderWidth: 2, borderColor: '#557783', borderRadius: 20, backgroundColor: '#102f40' }, productSelected: { borderColor: '#ffe19a', backgroundColor: '#18515b' }, cardTap: { gap: 10 }, badge: { color: '#d4e5e7', fontSize: 16, fontWeight: '700', textAlign: 'center', padding: 8 }, badgeSelected: { color: '#fff0b5', backgroundColor: '#246875', borderRadius: 10 }, selectedButton: { backgroundColor: '#287967', borderColor: '#ffe19a', borderWidth: 2 }, pressed: { opacity: .75, transform: [{scale: .97}], backgroundColor: '#327f88' }, summary: { padding: 14, gap: 12, borderWidth: 2, borderColor: '#d4b977', borderRadius: 18, backgroundColor: '#143e50' }, customCaption:{padding:12,gap:6,borderWidth:1,borderColor:'#d4b977',borderRadius:12,backgroundColor:'#123c50'},styleRow:{flexDirection:'row',flexWrap:'wrap',gap:8},styleChoice:{alignItems:'center',padding:8,borderWidth:2,borderColor:'#557783',borderRadius:12,minWidth:90},input: { color: '#fff', borderWidth: 1, borderColor: '#7199a1', borderRadius: 12, padding: 12, fontSize: 18 } });
