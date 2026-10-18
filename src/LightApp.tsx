import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPersistedAppState } from './lib/persistence';
import { coreGuardianArchetypeImages, coreGuardianStageImages, timeChallenges } from './data/holtonCatalog';
import type { PersistedAppState } from './types/holton';

const KEY = 'holton-guardian-app::light-v1';
type RecordItem = { id: string; title: string; at: string; minutes: number; cardId?: string };
type State = { version: 1; cardId?: string; title: string; minutes: number; orbs: number; phase: 'ready' | 'active' | 'done'; deadline: number | null; remaining: number; help: boolean; history: RecordItem[]; guardian: Partial<PersistedAppState> };
const day = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const initial = (old: Partial<PersistedAppState> | null): State => ({ version: 1, title: '', minutes: 5, orbs: typeof old?.orbs === 'number' ? old.orbs : 0, phase: 'ready', deadline: null, remaining: 300, help: false, history: [], guardian: { coreGuardianName: old?.coreGuardianName, coreGuardianId: old?.coreGuardianId, coreGuardianArchetype: old?.coreGuardianArchetype, coreGuardianStateVariant: old?.coreGuardianStateVariant, coreGuardianLevel: old?.coreGuardianLevel } });

export default function LightApp() {
  const [state, setState] = useState<State | null>(null);
  const current = useRef<State | null>(null);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [parent, setParent] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('5');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const data: State = raw ? JSON.parse(raw) : initial(await loadPersistedAppState());
        if (data.version !== 1 || !Array.isArray(data.history) || !['ready', 'active', 'done'].includes(data.phase) || !Number.isFinite(data.orbs)) throw new Error('Invalid state');
        if (!raw) await AsyncStorage.setItem(KEY, JSON.stringify(data));
        if (live) { current.current = data; setState(data); setTitle(data.title); setMinutes(String(data.minutes)); }
      } catch { if (live) setError('資料暫時無法讀取，請重新整理。原有紀錄未變更。'); }
    })();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { live = false; clearInterval(timer); };
  }, []);
  async function change(transform: (s: State) => State) {
    if (busy.current || !current.current) return;
    busy.current = true; setSaving(true); setError('');
    try {
      const next = transform(current.current);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      current.current = next; setState(next); setNow(Date.now());
    } catch { setError('尚未儲存成功，請再試一次；這次不會重複加分。'); }
    finally { busy.current = false; setSaving(false); }
  }
  const button = (label: string, action: () => void, secondary = false, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || saving} onPress={action} style={[styles.button, secondary && styles.secondary, (disabled || saving) && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
  if (!state) return <SafeAreaView style={styles.root}><Text style={styles.body}>{error || '正在準備你的夥伴…'}</Text></SafeAreaView>;
  const remaining = state.deadline ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : state.remaining;
  const guardian = state.guardian;
  const stage = (guardian.coreGuardianLevel ?? 1) >= 61 ? 'stage4' : (guardian.coreGuardianLevel ?? 1) >= 31 ? 'stage3' : (guardian.coreGuardianLevel ?? 1) >= 11 ? 'stage2' : 'stage1';
  const guardianImage = (guardian.coreGuardianArchetype && coreGuardianArchetypeImages[guardian.coreGuardianArchetype]?.[guardian.coreGuardianStateVariant || 'companion']) || coreGuardianStageImages[guardian.coreGuardianId as keyof typeof coreGuardianStageImages]?.[stage] || coreGuardianStageImages.tidefin.stage1;
  const selectedCard = timeChallenges.find(card => card.id === state.cardId);
  const durationLabel = (n: number) => n === 0 ? '不限時' : `${n} 分鐘`;
  const today = state.history.filter(item => day(new Date(item.at)) === day(new Date(now)));
  function saveTask() {
    const n = Number(minutes);
    if (!title.trim() || !Number.isInteger(n) || n < 0 || n > 60) { setNotice('請填任務名稱，時間為 1～60 分鐘，或填 0 表示不限時。'); return; }
    setNotice('');
    void change(s => s.phase === 'active' ? s : ({ ...s, title: title.trim(), minutes: n, cardId: timeChallenges.find(card => card.minutes === n)?.id, phase: 'ready', remaining: n * 60, deadline: null, help: false }));
  }
  return <SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><View><Text style={styles.brand}>HOLTON HERO</Text><Text style={styles.caption}>輕量版 · 一次一件事</Text></View><Pressable accessibilityRole="button" onPress={() => { setParent(!parent); setNotice(''); setTitle(state.title); setMinutes(String(state.minutes)); }}><Text style={styles.link}>{parent ? '回到孩子畫面' : '家長入口'}</Text></Pressable></View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {parent ? <>
      <Text style={styles.heading}>陪他完成，不必催他加速。</Text>
      <View style={styles.card}><Text style={styles.section}>1 · 設定今天的一件事</Text><Text style={styles.body}>寫一件做得到的小事，例如「收好桌上的積木」。</Text>
        <Text style={styles.label}>任務名稱</Text><TextInput accessibilityLabel="任務名稱" value={title} onChangeText={setTitle} maxLength={80} editable={state.phase !== 'active'} style={styles.input} placeholder="今天想完成的小事" />
        <Text style={styles.label}>建議時間（分鐘，0 為不限時）</Text><TextInput accessibilityLabel="陪伴時間（分鐘）" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" editable={state.phase !== 'active'} style={styles.input} />
        {notice ? <Text accessibilityRole="alert" style={styles.error}>{notice}</Text> : null}
        {state.phase === 'active' ? <Text style={styles.body}>任務正在進行，完成後再設定下一件事。</Text> : button('儲存任務', saveTask)}
        {state.phase === 'ready' && state.title ? <Text style={styles.caption}>目前任務：{state.title} · {durationLabel(state.minutes)}</Text> : null}
      </View>
      <View style={styles.card}><Text style={styles.section}>2 · 卡住時，這樣陪他說</Text><Text style={styles.quote}>「我在這裡。我們先做最小的一步，你想自己試，還是一起做？」</Text><Text style={styles.body}>時間到了也不用扣分。先看看需要幫忙，還是多一點時間。</Text></View>
      <View style={styles.card}><Text style={styles.section}>3 · 今天完成 {today.length} 件事</Text>{today.length ? today.map(item => <View key={item.id} style={styles.record}><Text style={styles.body}>✓ {item.title}</Text><Text style={styles.caption}>{new Date(item.at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} · {durationLabel(item.minutes)}{item.cardId ? ` · ${timeChallenges.find(card => card.id === item.cardId)?.name || "任務卡"}` : ""} · ＋1 能量球</Text></View>) : <Text style={styles.body}>今天還沒有完成紀錄，慢慢來就好。</Text>}<Text style={styles.caption}>輕量版紀錄保存在這台裝置、這個瀏覽器；舊版資料保留。</Text></View>
    </> : <>
      <View style={styles.companion}><Image accessibilityLabel="陪伴你的本命獸" source={guardianImage} style={styles.guardian} resizeMode="contain" /><Text style={styles.guardianName}>{guardian.coreGuardianName || '你的本命獸'}</Text><Text style={styles.body}>我陪你，一次完成一件小事。</Text><Text style={styles.orbs}>✦ 能量球 {state.orbs}</Text></View>
      <View style={styles.card}><Text style={styles.caption}>{state.phase === 'ready' ? '① 選一張任務卡' : state.phase === 'active' ? '② 一起做這件事' : '③ 完成了，休息一下'}</Text><Text style={styles.heading}>{state.phase === 'done' ? '你做到了！' : state.title || '今天想一起做什麼？'}</Text>
      {state.phase === 'ready' ? <>
        <Text style={styles.body}>{state.title ? '今天做這件事，時間由你選。' : '先想好一件小事，再選一張卡陪你完成。家長也能幫你填任務。'}</Text>
        <Text style={styles.caption}>左右滑動選卡 · 每完成一輪 ＋1 能量球</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.deck}>
          {timeChallenges.map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`選擇 ${card.name} ${durationLabel(card.minutes)}`} accessibilityState={{ selected: state.cardId === card.id }} disabled={saving} onPress={() => void change(s => s.phase !== 'ready' ? s : ({ ...s, cardId: card.id, minutes: card.minutes, remaining: card.minutes * 60, title: s.title || '完成一件小任務' }))} style={[styles.taskCard, state.cardId === card.id && styles.selectedCard]}>
            <Image source={card.imageSource} accessibilityLabel={card.name} resizeMode="contain" style={styles.cardArt} />
            <Text style={styles.cardMinutes}>{durationLabel(card.minutes)}</Text><Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.caption}>{state.cardId === card.id ? '✓ 已選擇' : '選這張'}</Text>
          </Pressable>)}
        </ScrollView>
        <Text style={styles.body}>{selectedCard ? `${selectedCard.name} · ${durationLabel(state.minutes)}` : `目前設定：${durationLabel(state.minutes)}，也可以換一張卡。`}</Text>
        {button('開始', () => void change(s => s.phase !== 'ready' ? s : ({ ...s, title: s.title || '完成一件小任務', phase: 'active', deadline: s.minutes === 0 ? null : Date.now() + s.minutes * 60000, remaining: s.minutes * 60 })))}
      </> : state.phase === 'active' ? <>
        {selectedCard ? <Image source={selectedCard.imageSource} accessibilityLabel={selectedCard.name} style={styles.activeCardArt} resizeMode="contain" /> : null}
        {state.minutes === 0 ? <Text style={styles.section}>不限時，慢慢完成就好。</Text> : <Text style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text>}
        <Text style={styles.body}>{state.help ? '先停一下，我們一起來。' : state.minutes !== 0 && remaining === 0 ? '時間到了。還沒做好也沒關係，可以慢慢完成。' : '照自己的速度來。'}</Text>
        {state.help ? <><Text style={styles.quote}>「我在這裡。我們先做最小的一步，好嗎？」</Text>{button('我準備好了，繼續', () => void change(s => ({ ...s, help: false, deadline: s.minutes === 0 ? null : Date.now() + s.remaining * 1000 })), true)}</> : button('我需要幫忙', () => void change(s => ({ ...s, help: true, remaining: s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : s.remaining, deadline: null })), true)}
        {button('完成', () => void change(s => s.phase !== 'active' ? s : ({ ...s, phase: 'done', deadline: null, help: false, orbs: s.orbs + 1, history: [...s.history, { id: String(Date.now()), title: s.title, at: new Date().toISOString(), minutes: s.minutes, cardId: s.cardId }] })))}
      </> : <><Text style={styles.quote}>你願意試、也完成了。每一小步都值得被看見。</Text><Text style={styles.orbs}>✦ ＋1 能量球</Text><Text style={styles.body}>{state.title}</Text><Text style={styles.caption}>這一輪結束了。休息一下，準備好再選卡。</Text>{button('再選一張任務卡', () => void change(s => ({ ...s, phase: 'ready', deadline: null, help: false, remaining: s.minutes * 60 })), true)}</>}
      </View>
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  deck: { gap: 12, paddingVertical: 8, paddingHorizontal: 2 }, taskCard: { width: 160, padding: 8, borderRadius: 16, borderWidth: 2, borderColor: '#e0e9e3', alignItems: 'center', gap: 4, backgroundColor: '#f8faf8' }, selectedCard: { borderColor: '#2b6857', backgroundColor: '#eaf2ed' }, cardArt: { width: 140, height: 200 }, activeCardArt: { width: 170, height: 230, alignSelf: 'center' }, cardMinutes: { fontSize: 24, fontWeight: '800', color: '#234b43' }, cardName: { fontSize: 15, fontWeight: '600', color: '#42584f', textAlign: 'center' },
  root: { flex: 1, backgroundColor: '#f4f7f4' }, page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 22, paddingBottom: 50, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, brand: { fontSize: 15, fontWeight: '800', color: '#204d45', letterSpacing: 1 }, caption: { fontSize: 14, color: '#61716a', lineHeight: 23 }, link: { color: '#285c50', fontSize: 15, paddingVertical: 15 },
  companion: { alignItems: 'center', gap: 7 }, guardian: { width: 110, height: 110 }, guardianName: { fontSize: 19, fontWeight: '700', color: '#234b43' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, borderColor: '#e0e9e3' }, heading: { fontSize: 27, fontWeight: '700', color: '#203c34', lineHeight: 38 }, body: { fontSize: 17, lineHeight: 28, color: '#42584f' }, section: { fontSize: 20, fontWeight: '700', color: '#234b43' }, quote: { fontSize: 20, lineHeight: 33, color: '#285c50' }, orbs: { fontSize: 19, fontWeight: '700', color: '#8b651d', padding: 10 }, timer: { fontSize: 48, color: '#234b43', fontVariant: ['tabular-nums'], textAlign: 'center' },
  button: { minHeight: 58, backgroundColor: '#2b6857', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 14 }, buttonText: { fontSize: 20, fontWeight: '700', color: '#fff' }, secondary: { backgroundColor: '#eaf2ed' }, secondaryText: { color: '#285c50' }, disabled: { opacity: 0.5 }, label: { fontSize: 15, color: '#42584f' }, input: { borderWidth: 1, borderColor: '#9aafa4', borderRadius: 12, padding: 14, fontSize: 18, color: '#203c34' }, error: { color: '#a13535', fontSize: 16, lineHeight: 24 }, record: { borderBottomWidth: 1, borderBottomColor: '#e0e9e3', paddingBottom: 12, gap: 4 },
});
