import React, { useState } from 'react';
import { Image, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
export type Wish = { id: string; name: string; cost: number; enabled: boolean };
export type WishReceipt = { id: string; name: string; cost: number; at: string; fulfilled?: boolean };
export type ShopData = { shopEnabled?: boolean; wishes?: Wish[]; wishReceipts?: WishReceipt[]; orbs: number };
const wishArt: Record<string, number> = { 'wish-0': require('../assets/cards/rewards/toy.png'), 'wish-1': require('../assets/cards/rewards/drink.png'), 'wish-2': require('../assets/cards/rewards/family.png'), 'wish-3': require('../assets/cards/rewards/movie.png') };
export const defaultWishes: Wish[] = ['小禮物', '喜歡的飲料', '親子遊戲 15 分鐘', '一起看電影'].map((name, i) => ({ id: `wish-${i}`, name, cost: 0, enabled: false }));
export function redeemWish<T extends ShopData>(s: T, id: string, receiptId: string): T {
  const w = (s.wishes ?? defaultWishes).find(x => x.id === id);
  if (!s.shopEnabled || !w?.enabled || !Number.isSafeInteger(w.cost) || w.cost <= 0 || s.orbs < w.cost || s.wishReceipts?.some(r => r.id === receiptId)) return s;
  return { ...s, orbs: s.orbs - w.cost, wishReceipts: [...(s.wishReceipts ?? []), { id: receiptId, name: w.name, cost: w.cost, at: new Date().toISOString() }] };
}
export default function RewardShop<T extends ShopData>({ data, settings, saving, change }: { data: T; settings: boolean; saving: boolean; change: (fn: (s: T) => T) => Promise<boolean> }) {
  const [draft, setDraft] = useState(data.wishes ?? defaultWishes);
  const [selected, setSelected] = useState<{ id: string; token: string } | null>(null);
  const [note, setNote] = useState('');
  const action = (label: string, fn: () => void, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || saving} onPress={fn} style={[s.button, (disabled || saving) && { opacity: .45 }]}><Text style={s.text}>{label}</Text></Pressable>;
  const chosen = (data.wishes ?? defaultWishes).find(w => w.id === selected?.id);
  return <View style={s.panel}><Text style={s.title}>✧ 心願小舖</Text><Text style={s.text}>可用能量球 {data.orbs} 顆</Text>
    {settings ? <>
      <Text style={s.text}>由大人決定是否開放。關閉不扣點、不清空餘額，也不影響守護獸收藏。這是共同設定，不是家長身分驗證。</Text>
      {action(`生活獎勵：${data.shopEnabled ? '開啟' : '關閉'}`, () => void change(s => ({ ...s, shopEnabled: !s.shopEnabled })))}
      <Text style={s.text}>先約定內容與點數，再開放項目；未填價格的項目不能兌換。陪伴並不需要先賺點數，這裡是額外約定的活動。</Text>
      {draft.map((w, i) => <View key={w.id} style={s.item}>
        <Image source={wishArt[w.id]} accessibilityLabel={`${w.name}原卡`} style={{ width: 96, height: 144, alignSelf: 'center' }} resizeMode="contain" /><TextInput accessibilityLabel={`獎勵名稱 ${i + 1}`} value={w.name} onChangeText={name => setDraft(draft.map(x => x.id === w.id ? { ...x, name } : x))} maxLength={40} style={s.input} />
        <TextInput accessibilityLabel={`${w.name}點數`} keyboardType="number-pad" placeholder="請設定點數" placeholderTextColor="#b8ccd2" value={w.cost ? String(w.cost) : ''} onChangeText={v => setDraft(draft.map(x => x.id === w.id ? { ...x, cost: /^\d{1,6}$/.test(v) ? Number(v) : 0 } : x))} style={s.input} />
        {action(`${w.name}：${w.enabled ? '已勾選' : '未開放'}`, () => setDraft(draft.map(x => x.id === w.id ? { ...x, enabled: !x.enabled } : x)))}
      </View>)}
      {action('儲存生活獎勵', async () => {
        if (draft.some(w => !w.name.trim() || (w.enabled && (!Number.isSafeInteger(w.cost) || w.cost <= 0)))) { setNote('請填寫名稱及大於零的整數點數，再開放項目。'); return; }
        if (await change(s => ({ ...s, wishes: draft.map(w => ({ ...w, name: w.name.trim() })) }))) setNote('生活獎勵已儲存。');
      })}
    </> : data.shopEnabled ? <>
      <Text style={s.text}>和大人約定好的小心願。確認才扣點，之後一起安排實現。</Text>
      {(data.wishes ?? defaultWishes).filter(w => w.enabled && w.cost > 0).map(w => <View key={w.id} style={s.item}><Image source={wishArt[w.id]} accessibilityLabel={`${w.name}原卡`} style={{ width: 170, height: 255, alignSelf: 'center' }} resizeMode="contain" /><Text style={s.title}>{w.name}</Text>{action(`選擇${w.name} · ${w.cost} 點`, () => { setNote(''); setSelected({ id: w.id, token: `wish-${Date.now()}-${Math.random()}` }); }, data.orbs < w.cost)}{data.orbs < w.cost ? <Text style={s.text}>還差 {w.cost - data.orbs} 點，慢慢累積。</Text> : null}</View>)}
      {!(data.wishes ?? []).some(w => w.enabled && w.cost > 0) ? <Text style={s.text}>目前還沒有開放的心願，點數會繼續累積。</Text> : null}
      {selected && chosen ? <View style={s.item}><Text style={s.title}>確認 {chosen.name}？</Text><Text style={s.text}>扣除 {chosen.cost} 點，剩餘 {Math.max(0, data.orbs - chosen.cost)} 點。</Text>{action('確認心願兌換', async () => { const token = selected.token; const id = selected.id; if (await change(s => redeemWish(s, id, token))) { setSelected(null); setNote('已記下心願，和大人一起安排時間吧！'); } }, data.orbs < chosen.cost)}{action('先不要兌換', () => setSelected(null))}</View> : null}
    </> : <Text style={s.text}>生活獎勵尚未開放。點數繼續累積，不會過期。</Text>}
    {note ? <Text accessibilityRole="alert" style={s.text}>{note}</Text> : null}
    <Text style={s.title}>心願紀錄</Text>
    {[...(data.wishReceipts ?? [])].reverse().map(r => <View key={r.id} style={s.item}><Text style={s.text}>{r.name} · {r.cost} 點 · {r.fulfilled ? '已實現' : '待實現'}</Text><Text style={s.text}>{new Date(r.at).toLocaleDateString('zh-TW')}</Text>{settings && !r.fulfilled ? action(`標記${r.name}已實現`, () => void change(s => ({ ...s, wishReceipts: (s.wishReceipts ?? []).map((x: WishReceipt) => x.id === r.id ? { ...x, fulfilled: true } : x) }))) : null}</View>)}
  </View>;
}
const s = StyleSheet.create({ panel: { padding: 18, borderRadius: 24, borderWidth: 2, borderColor: '#d4b977', backgroundColor: 'rgba(10,38,52,.94)', gap: 14 }, title: { fontSize: 22, fontWeight: '800', color: '#ffe7ad' }, text: { fontSize: 16, lineHeight: 26, color: '#edf6f5' }, item: { gap: 10, paddingVertical: 12, borderTopWidth: 1, borderColor: '#557783' }, button: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#bba66f', borderRadius: 20, backgroundColor: '#105c70', alignItems: 'center' }, input: { color: '#fff', borderWidth: 1, borderColor: '#7199a1', borderRadius: 12, padding: 12, fontSize: 18 } });
