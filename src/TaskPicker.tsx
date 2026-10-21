import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
export const taskCategories = [
  { id: 'homework', icon: '📚', title: '寫作業', tasks: ['國語作業', '數學作業', '英文作業', '自然作業', '社會作業', '寫作文', '訂正作業', '生字練習', '預習課文', '複習功課'] },
  { id: 'housework', icon: '🧹', title: '幫忙家務', tasks: ['收玩具', '擦桌子', '摺衣服', '掃地'] },
  { id: 'practice', icon: '📖', title: '閱讀／練習', tasks: ['看書', '讀課文', '練字', '練樂器'] },
  { id: 'selfcare', icon: '🎒', title: '生活自理', tasks: ['整理書包', '刷牙', '換衣服', '準備明天用品'] },
  { id: 'special', icon: '⭐', title: '特殊任務', tasks: ['完成約定', '準備上台', '嘗試一件新事'] },
];
export function TaskPicker({ currentTitle, saving, onSelect, onClose, initialCustom = false, customCategory = 'custom' }: { initialCustom?: boolean; customCategory?: string; currentTitle: string; saving: boolean; onSelect: (title: string, category: string) => Promise<void>; onClose: () => void }) {
  const [custom, setCustom] = useState(initialCustom);
  const [draft, setDraft] = useState(currentTitle);
  const [invalid, setInvalid] = useState(false);
  return <View style={s.panel}>
    <Text style={s.heading}>今天要完成什麼？</Text><Text style={s.text}>點一下就選好，只有自訂需要打字。</Text>
    {!custom ? <View><View testID="tutorial-task-categories" style={s.grid}>{taskCategories.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`任務類別：${item.title}`} disabled={saving} onPress={() => void onSelect(item.title, item.id)} style={s.choice}><Text style={s.icon}>{item.icon}</Text><Text style={s.label}>{item.title}</Text></Pressable>)}</View><Pressable accessibilityRole="button" accessibilityLabel="自訂任務" disabled={saving} onPress={() => setCustom(true)} style={s.choice}><Text style={s.icon}>✏️</Text><Text style={s.label}>自訂任務</Text></Pressable></View> : <>
      <Text style={s.label}>自訂任務名稱</Text><TextInput accessibilityLabel="自訂任務名稱" value={draft} onChangeText={v => { setDraft(v); setInvalid(false); }} maxLength={80} style={s.input} placeholder="例如：數學習作第 12 頁" placeholderTextColor="#b5c9d4" editable={!saving} />
      {invalid ? <Text accessibilityRole="alert" style={s.error}>先填一個任務名稱。</Text> : null}
      <Pressable accessibilityRole="button" accessibilityLabel="儲存自訂任務" disabled={saving} style={s.primary} onPress={() => { if (!draft.trim()) { setInvalid(true); return; } void onSelect(draft.trim(), customCategory); }}><Text style={s.label}>儲存自訂任務</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="返回任務類別" disabled={saving} style={s.cancel} onPress={() => setCustom(false)}><Text style={s.text}>返回任務類別</Text></Pressable>
    </>}
    <Pressable accessibilityRole="button" accessibilityLabel="取消修改任務" disabled={saving} style={s.cancel} onPress={onClose}><Text style={s.text}>取消，保留原任務</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({
  panel: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: '#bca477', backgroundColor: 'rgba(8,34,54,0.97)', gap: 14 },
  heading: { color: '#fff1d0', fontSize: 25, fontWeight: '800' }, text: { color: '#d0e4eb', fontSize: 16, lineHeight: 25 }, label: { color: '#fff5dc', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, choice: { flexBasis: '45%', flexGrow: 1, minHeight: 100, borderWidth: 1, borderColor: '#7bb1bc', borderRadius: 16, backgroundColor: '#164357', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 7 }, icon: { fontSize: 26 },
  primary: { backgroundColor: '#087b93', minHeight: 54, justifyContent: 'center', borderRadius: 16, padding: 10 }, cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center', padding: 8 }, input: { color: '#fff', backgroundColor: '#123d50', borderColor: '#76bac7', borderWidth: 1, padding: 14, borderRadius: 12, fontSize: 18 }, error: { color: '#ffbaba', fontSize: 16 },
});
