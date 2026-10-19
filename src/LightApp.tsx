import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import RewardShop, { type Wish, type WishReceipt } from './RewardShop';
import EnergyMath from './EnergyMath';
import { WorldChrome, CardPedestal } from './WorldChrome';
import { TaskPicker, taskCategories } from './TaskPicker';
import { WorldBackdrop, CardLift, PortalCue, RewardArrival, useSystemReducedMotion } from './SkyWorld';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPersistedAppState } from './lib/persistence';
import { coreGuardianArchetypeImages, coreGuardianStageImages, timeChallenges, worldEvents, sopCards, badgeImages, guardianBeasts, supportTools, transitionCards, activeSkills } from './data/holtonCatalog';
import { chooseFinishEncouragement, finishEncouragements, type FinishContext } from './data/finishEncouragements';
import { planWorldRedemption, redeemWorldCards, worldExchangeDay, worldRewardLabel, type WorldDraw, type WorldRedemption } from './data/worldRedemption';
import type { PersistedAppState } from './types/holton';

const KEY = 'holton-guardian-app::light-v1';
type RecordItem = { reward?: number; id: string; title: string; at: string; minutes: number; cardId?: string; finishId?: string; helpUsed?: boolean; supportUsed?: string[] };
type GuardianReceipt = { cardId: string; at: string; cost: number; source: 'legacy' | 'parent-restore' | 'sunday' };
type State = { shopEnabled?: boolean; wishes?: Wish[]; wishReceipts?: WishReceipt[]; taskCategory?: string; reduceMotion?: boolean; taskReward?: number; worldReminderDismissedDay?: string; worldRedemptions?: WorldRedemption[]; supportCardId?: string; supportUsed?: string[]; breakDeadline?: number | null; helpUsed?: boolean; finishId?: string; guardianCards?: GuardianReceipt[]; companionCardId?: string; starterRestoreAt?: string; dailyGoal?: number; rewardProgress?: number; dailyRewardDay?: string; draws?: WorldDraw[]; collection?: WorldDraw[]; version: 1; cardId?: string; title: string; minutes: number; orbs: number; phase: 'ready' | 'preparing' | 'active' | 'finishing' | 'done'; deadline: number | null; remaining: number; help: boolean; history: RecordItem[]; guardian: Partial<PersistedAppState> };
const rewardForMinutes = (minutes: number) => timeChallenges.find(card => card.minutes === minutes)?.orbs ?? 1;
const day = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const initial = (old: Partial<PersistedAppState> | null): State => ({ version: 1, title: '', minutes: 5, orbs: typeof old?.orbs === 'number' ? old.orbs : 0, phase: 'ready', deadline: null, remaining: 300, help: false, history: [], guardian: { coreGuardianName: old?.coreGuardianName, coreGuardianId: old?.coreGuardianId, coreGuardianArchetype: old?.coreGuardianArchetype, coreGuardianStateVariant: old?.coreGuardianStateVariant, coreGuardianLevel: old?.coreGuardianLevel } });

const guardianCards = guardianBeasts.flatMap(beast => beast.stages.map((stage, index) => ({
  id: `${beast.id}:${index}`, beastId: beast.id, name: beast.name, vibe: beast.vibe, index, label: stage.label, cost: stage.cost,
  image: coreGuardianStageImages[beast.id as keyof typeof coreGuardianStageImages][(['stage1', 'stage2', 'stage3', 'stage4'] as const)[index]],
})));
const helpCards = [
  { id: 'pause', title: '暫停卡', line: '我想先停一下。', guide: '先停住，不用急。準備好了，再回到原本那一步。', resume: '我準備好了，繼續', image: supportTools.find(card => card.id === 'time-freeze')!.imageSource },
  { id: 'rest', title: '休息卡', line: '我想休息一下。', guide: '休息 2 分鐘，讓自己喘口氣。時間到只提醒，你準備好再回來。', resume: '休息好了，繼續', image: transitionCards.find(card => card.id === 'break-time')!.imageSource },
  { id: 'energy', title: '加油卡', line: '我需要補充能量。', guide: '可以喝口水、伸展一下，或請大人說一句加油。選一個適合你的方式。', resume: '補充好了，繼續', image: supportTools.find(card => card.id === 'energy-boost')!.imageSource },
  { id: 'breathe', title: '深呼吸卡', line: '我想先慢慢呼吸。', guide: '試試 3 次舒服的慢呼吸：輕輕吸氣，慢慢吐氣，不用憋氣。不用趕，照自己的節奏。', resume: '我準備好了，繼續', image: activeSkills.find(card => card.id === 'breather-1')!.imageSource },
];
const taipeiWeekday = (time: number) => new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', weekday: 'short' }).format(time);
function importGuardianCards(old: Partial<PersistedAppState> | null): GuardianReceipt[] {
  return guardianCards.filter(card => {
    const points = old?.guardianProgress?.[card.beastId]?.orbs;
    return (card.index === 0 && old?.guardianCatalog?.[card.beastId]?.status === 'captured') || (typeof points === 'number' && Number.isFinite(points) && points >= card.cost);
  }).map(card => ({ cardId: card.id, at: new Date().toISOString(), cost: 0, source: 'legacy' }));
}

export default function LightApp() {
  const [state, setState] = useState<State | null>(null);
  const systemReduced = useSystemReducedMotion();
  const reduceMotion = systemReduced || !!state?.reduceMotion;
  const [shopOpen, setShopOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [showWorldAlbum, setShowWorldAlbum] = useState(false);
  const celebrate = useRef(false);
  const current = useRef<State | null>(null);
  const busy = useRef(false);
  const pageScroll = useRef<ScrollView>(null);
  const taskTop = useRef(0);
  const lastPhase = useRef<State['phase'] | undefined>(undefined);
  useEffect(() => {
    const changed = state?.phase && lastPhase.current && lastPhase.current !== state.phase;
    lastPhase.current = state?.phase;
    if (!changed) return;
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => pageScroll.current?.scrollTo({ y: taskTop.current, animated: !reduceMotion })); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [state?.phase, reduceMotion]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [worldExchangeOpen, setWorldExchangeOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [guardianDetailId, setGuardianDetailId] = useState<string | null>(null);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('5');
  const [goal, setGoal] = useState('3');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const data: State = raw ? JSON.parse(raw) : initial(await loadPersistedAppState());
        if (data.version !== 1 || !Array.isArray(data.history) || !['ready', 'preparing', 'active', 'finishing', 'done'].includes(data.phase) || !Number.isFinite(data.orbs)) throw new Error('Invalid state');
        if (!data.guardianCards) {
          const old = await loadPersistedAppState();
          data.guardianCards = importGuardianCards(old);
          const companion = guardianBeasts.find(beast => old?.guardianCatalog?.[beast.id]?.companion);
          data.companionCardId = companion ? data.guardianCards.filter(item => item.cardId.startsWith(`${companion.id}:`)).at(-1)?.cardId : undefined;
          await AsyncStorage.setItem(KEY, JSON.stringify(data));
        } else if (!raw) await AsyncStorage.setItem(KEY, JSON.stringify(data));
        if (live) { current.current = data; setState(data); setTitle(data.title); setMinutes(String(data.minutes)); setGoal(String(data.dailyGoal ?? 3)); }
      } catch { if (live) setError('資料暫時無法讀取，請重新整理。原有紀錄未變更。'); }
    })();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { live = false; clearInterval(timer); };
  }, []);
  async function change(transform: (s: State) => State) {
    if (busy.current || !current.current) return false;
    busy.current = true; setSaving(true); setError('');
    try {
      const next = transform(current.current);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      if (next.phase === 'done' && current.current.phase === 'finishing') celebrate.current = true;
      if (next.phase !== 'done') celebrate.current = false;
      current.current = next; setState(next); setNow(Date.now()); return true;
    } catch { setError('尚未儲存成功，請再試一次；這次不會重複加分。'); return false; }
    finally { busy.current = false; setSaving(false); }
  }
  const button = (label: string, action: () => void, secondary = false, disabled = false) => <Pressable testID={secondary ? "secondary-action" : "primary-action"} accessibilityRole="button" accessibilityLabel={label} disabled={disabled || saving} onPress={action} style={[styles.button, secondary && styles.secondary, (disabled || saving) && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
  if (!state) return <SafeAreaView style={styles.root}><Text style={styles.body}>{error || '正在準備你的夥伴…'}</Text></SafeAreaView>;
  const remaining = state.deadline ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : state.remaining;
  const guardian = state.guardian;
  const stage = (guardian.coreGuardianLevel ?? 1) >= 61 ? 'stage4' : (guardian.coreGuardianLevel ?? 1) >= 31 ? 'stage3' : (guardian.coreGuardianLevel ?? 1) >= 11 ? 'stage2' : 'stage1';
  const guardianImage = (guardian.coreGuardianArchetype && coreGuardianArchetypeImages[guardian.coreGuardianArchetype]?.[guardian.coreGuardianStateVariant || 'companion']) || coreGuardianStageImages[guardian.coreGuardianId as keyof typeof coreGuardianStageImages]?.[stage] || coreGuardianStageImages.tidefin.stage1;
  const activeCategory = taskCategories.find(item => item.id === state.taskCategory || item.title === state.title || item.tasks.includes(state.title));
  const scene = state.help ? 'rest' : state.phase === 'active' || state.phase === 'finishing' ? 'focus' : 'home';
  const homePhase = ['ready', 'done'].includes(state.phase);
  const selectedCard = timeChallenges.find(card => card.id === state.cardId);
  const displayCard = selectedCard ?? timeChallenges.find(card => card.minutes === state.minutes) ?? timeChallenges[1];
  const stepCard = (delta: number) => { const index = timeChallenges.indexOf(displayCard); const card = timeChallenges[(index + delta + timeChallenges.length) % timeChallenges.length]; void change(s => s.phase !== 'ready' ? s : ({ ...s, cardId: card.id, minutes: card.minutes, remaining: card.minutes * 60 })); };
  const durationLabel = (n: number) => n === 0 ? '不限時' : `${n} 分鐘`;
  const today = state.history.filter(item => day(new Date(item.at)) === day(new Date(now)));
  const pending = state.draws?.[0];
  const ownedIds = new Set((state.guardianCards ?? []).map(item => item.cardId));
  const companion = guardianCards.find(card => card.id === state.companionCardId && ownedIds.has(card.id));
  const detail = guardianCards.find(card => card.id === guardianDetailId);
  const sunday = taipeiWeekday(now) === 'Sun';
  const starterMissing = guardianCards.filter(card => card.index === 0 && !ownedIds.has(card.id));
  function restoreStarters() {
    void change(s => {
      if (s.starterRestoreAt) return s;
      const at = new Date().toISOString();
      const existing = new Set((s.guardianCards ?? []).map(item => item.cardId));
      return { ...s, starterRestoreAt: at, guardianCards: [...(s.guardianCards ?? []), ...guardianCards.filter(card => card.index === 0 && !existing.has(card.id)).map(card => ({ cardId: card.id, at, cost: 0, source: 'parent-restore' as const }))] };
    });
  }
  function buyGuardian(cardId: string) {
    void change(s => {
      const card = guardianCards.find(item => item.id === cardId);
      const owned = new Set((s.guardianCards ?? []).map(item => item.cardId));
      if (!card || taipeiWeekday(Date.now()) !== 'Sun' || owned.has(cardId) || s.orbs < card.cost || (card.index > 0 && !owned.has(`${card.beastId}:${card.index - 1}`))) return s;
      return { ...s, orbs: s.orbs - card.cost, guardianCards: [...(s.guardianCards ?? []), { cardId, cost: card.cost, at: new Date().toISOString(), source: 'sunday' }] };
    });
  }
  const exchangePlan = planWorldRedemption(state.collection ?? [], state.worldRedemptions ?? [], now);
  const showWorldReminder = !settingsOpen && !pending && !collectionOpen && !worldExchangeOpen && ['ready', 'done'].includes(state.phase) && !exchangePlan.blocked && exchangePlan.points > 0 && state.worldReminderDismissedDay !== exchangePlan.day;
  const todayExchangePoints = (state.worldRedemptions ?? []).filter(item => item.day === worldExchangeDay(now)).reduce((sum, item) => sum + item.points, 0);
  function exchangeWorldCards() {
    void change(s => {
      const result = redeemWorldCards(s.collection ?? [], s.worldRedemptions ?? [], Date.now());
      return result ? { ...s, collection: result.collection, worldRedemptions: result.receipts, orbs: s.orbs + result.points } : s;
    });
  }
  const drawnCard = worldEvents.find(card => card.id === pending?.cardId);
  const helpCard = helpCards.find(card => card.id === state.supportCardId);
  const breakRemaining = state.breakDeadline ? Math.max(0, Math.ceil((state.breakDeadline - now) / 1000)) : 0;
  const usedHelpNames = (state.supportUsed ?? []).map(id => helpCards.find(card => card.id === id)?.title).filter(Boolean).join('、');
  function openHelp(s: State): State {
    if (s.phase !== 'active' || s.help) return s;
    return { ...s, help: true, helpUsed: true, supportCardId: undefined, breakDeadline: null, remaining: s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : s.remaining, deadline: null };
  }
  function selectHelp(s: State, id: string): State {
    if (s.phase !== 'active' || !s.help || !helpCards.some(card => card.id === id)) return s;
    return { ...s, supportCardId: id, supportUsed: [...new Set([...(s.supportUsed ?? []), id])], breakDeadline: id === 'rest' ? Date.now() + 120000 : null };
  }
  function resumeHelp(s: State): State {
    if (s.phase !== 'active' || !s.help) return s;
    return { ...s, help: false, supportCardId: undefined, breakDeadline: null, deadline: s.minutes === 0 ? null : Date.now() + s.remaining * 1000 };
  }
  const finish = finishEncouragements.find(item => item.id === state.finishId) ?? finishEncouragements[0];
  const finishImage = finish.art === 'pack-up' || finish.art === 'finish-mode' ? sopCards.find(card => card.id === finish.art)!.imageSource : badgeImages[finish.art];
  function enterFinishing(s: State): State {
    if (s.phase !== 'active') return s;
    const completedToday = s.history.filter(item => day(new Date(item.at)) === day(new Date())).length;
    const daily = completedToday + 1 === (s.dailyGoal ?? 3);
    const helped = !!(s.helpUsed || s.help);
    const context: FinishContext = daily ? helped ? 'daily-help' : 'daily' : helped ? 'help' : 'normal';
    const selected = chooseFinishEncouragement(context, s.history.map(item => item.finishId ?? '').filter(Boolean), s.finishId);
    return { ...s, phase: 'finishing', finishId: selected.id, helpUsed: helped, remaining: s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : s.remaining, deadline: null, help: false, supportCardId: undefined, breakDeadline: null };
  }
  function completeTask(s: State): State {
    if (s.phase !== 'finishing') return s;
    const at = new Date();
    const dateKey = day(at);
    const history = [...s.history, { id: String(at.getTime()), title: s.title, at: at.toISOString(), minutes: s.minutes, reward: s.taskReward ?? 1, cardId: s.cardId, finishId: s.finishId, helpUsed: s.helpUsed, supportUsed: s.supportUsed }];
    const count = history.filter(item => day(new Date(item.at)) === dateKey).length;
    const progress = (s.rewardProgress ?? 0) + 1;
    const triple = progress >= 3;
    const allDone = count >= (s.dailyGoal ?? 3) && s.dailyRewardDay !== dateKey;
    const reason = triple && allDone ? '完成 3 次任務，而且今天任務全完成了！' : triple ? '又完成 3 次任務！' : '今天任務全完成了！';
    return { ...s, phase: 'done', deadline: null, help: false, orbs: s.orbs + (s.taskReward ?? 1), history,
      rewardProgress: progress % 3, dailyRewardDay: allDone ? dateKey : s.dailyRewardDay,
      draws: [...(s.draws ?? []), ...(triple || allDone ? [{ id: String(at.getTime()), reason }] : [])] };
  }
  async function chooseTask(nextTitle: string, category: string) {
    if (!nextTitle.trim() || nextTitle.trim().length > 80 || !current.current || !['ready', 'done'].includes(current.current.phase)) return;
    const saved = await change(s => !['ready', 'done'].includes(s.phase) ? s : ({ ...s, title: nextTitle.trim(), taskCategory: category, phase: 'ready', deadline: null, remaining: s.minutes * 60, help: false }));
    if (saved) { setTitle(nextTitle.trim()); setTaskPickerOpen(false); setTaskDetailsOpen(false); }
  }
  function saveTask() {
    const n = Number(minutes);
    const target = Number(goal);
    if (!Number.isInteger(target) || target < 1 || target > 20) { setNotice('今日任務數請填 1～20 次。'); return; }
    if (!title.trim() || !Number.isInteger(n) || n < 0 || n > 60) { setNotice('請填任務名稱，時間為 1～60 分鐘，或填 0 表示不限時。'); return; }
    setNotice('');
    void change(s => ['preparing', 'active', 'finishing'].includes(s.phase) ? s : ({ ...s, title: title.trim(), taskCategory: undefined, dailyGoal: target, minutes: n, cardId: timeChallenges.find(card => card.minutes === n)?.id, phase: 'ready', remaining: n * 60, deadline: null, help: false }));
  }
  return <SafeAreaView testID="immersive-world" style={styles.root}><WorldChrome /><WorldBackdrop scene={scene} /><ScrollView ref={pageScroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View testID="world-title" style={styles.header}><View><Text style={styles.worldName}>{scene === 'rest' ? '休息小營地' : scene === 'focus' ? '專注平台' : '天空基地'}</Text><Text style={styles.brand}>HOLTON HERO</Text></View><Pressable accessibilityRole="button" accessibilityLabel={settingsOpen ? '回到世界' : '設定'} onPress={() => { setSettingsOpen(!settingsOpen); setNotice(''); setTitle(state.title); setMinutes(String(state.minutes)); setGoal(String(state.dailyGoal ?? 3)); }}><Text style={styles.link}>{settingsOpen ? '回到世界' : '設定'}</Text></Pressable></View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

    {settingsOpen ? <>
      <Text style={styles.heading}>世界設定與紀錄</Text><RewardShop data={state} settings saving={saving} change={change} />
      <View style={styles.card}><Text style={styles.section}>天空基地 · 動畫設定</Text><Text style={styles.body}>只在選卡、準備、完成時有短動畫。任務中場景靜止，這版不播放音效。</Text>
        <Pressable accessibilityRole="switch" accessibilityLabel="減少動畫" accessibilityState={{ checked: !!state.reduceMotion }} disabled={saving} onPress={() => void change(s => ({ ...s, reduceMotion: !s.reduceMotion }))} style={styles.secondarySetting}><Text style={styles.section}>減少動畫：{state.reduceMotion ? '開啟' : '關閉'}</Text></Pressable>
        <Text style={styles.caption}>{systemReduced ? '裝置已設定減少動態效果，這裡也會自動減少。' : '開啟後改用靜態提示，獎勵與任務流程不變。'}</Text>
        <Text style={styles.caption}>原卡獎勵：3／5 分鐘＋1、10 分鐘＋2、15 分鐘＋3、20 分鐘＋4、25 分鐘／不限時＋5。其他自訂時間＋1。休息與求助不扣獎勵。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>世界卡兌換紀錄</Text><Text style={styles.body}>今天已兌換 ＋{todayExchangePoints} 點。每天最多一次，可留到明天一起換。</Text>{button('查看世界卡兌換', () => setWorldExchangeOpen(true), true)}</View>
      <View style={styles.card}><Text style={styles.section}>守護獸收藏與舊卡恢復</Text><Text style={styles.body}>目前收藏 {ownedIds.size} 張。舊版能確認的卡片會自動帶入；更換陪伴夥伴不扣點，也不改變本命獸。</Text>{button('查看守護獸收藏', () => setCollectionOpen(true), true)}
        {starterMissing.length > 0 && !state.starterRestoreAt ? <><Text style={styles.caption}>若孩子以前已兌換完五隻 Mini 初階卡，可補回以前已取得的 {starterMissing.length} 張。只補卡，不扣點、不重複發卡。</Text>{button('補回已兌換的五隻初階卡', restoreStarters, true)}</> : <Text style={styles.caption}>初階收藏已保留，不需要重新購買。</Text>}
        <Text style={styles.caption}>星期日兌換以台北時間為準。Mini 10、Mid 20、Final 40、Legendary 60 點；每張扣完整標示點數，按階段取得，舊卡仍保留。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>1 · 設定今天的一件事</Text><Text style={styles.body}>寫一件做得到的小事，例如「收好桌上的積木」。</Text>
        <Text style={styles.label}>任務名稱</Text><TextInput accessibilityLabel="任務名稱" value={title} onChangeText={setTitle} maxLength={80} editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} placeholder="今天想完成的小事" placeholderTextColor="#b5c9d4" />
        <Text style={styles.label}>建議時間（分鐘，0 為不限時）</Text><TextInput accessibilityLabel="陪伴時間（分鐘）" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} />
        <Text style={styles.label}>今日預計完成幾次任務（1～20）</Text><TextInput accessibilityLabel="今日任務數" value={goal} onChangeText={setGoal} keyboardType="number-pad" editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} />
        <Text style={styles.caption}>達到今日目標可抽一次世界卡；每累積完成 3 次也可抽一次。同時達成合併一次。三次進度跨日保留；每日目標獎勵一天一次。</Text>
        {notice ? <Text accessibilityRole="alert" style={styles.error}>{notice}</Text> : null}
        {['preparing', 'active', 'finishing'].includes(state.phase) ? <Text style={styles.body}>任務正在進行，完成後再設定下一件事。</Text> : button('儲存任務', saveTask)}
        {state.phase === 'ready' && state.title ? <Text style={styles.caption}>目前任務：{state.title} · {durationLabel(state.minutes)}</Text> : null}
      </View>
      <View style={styles.card}><Text style={styles.section}>2 · 卡住時，這樣陪他說</Text><Text style={styles.quote}>「我在這裡。我們先做最小的一步，你想自己試，還是一起做？」</Text><Text style={styles.body}>時間到了也不用扣分。先看看需要幫忙，還是多一點時間。</Text></View>
      <View style={styles.card}><Text style={styles.section}>3 · 今天完成 {today.length} 件事</Text>{today.length ? today.map(item => <View key={item.id} style={styles.record}><Text style={styles.body}>✓ {item.title}</Text><Text style={styles.caption}>{new Date(item.at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} · {durationLabel(item.minutes)}{item.cardId ? ` · ${timeChallenges.find(card => card.id === item.cardId)?.name || "任務卡"}` : ""} · ＋{item.reward ?? 1} 能量球{item.supportUsed?.length ? ` · ${item.supportUsed.map(id => helpCards.find(card => card.id === id)?.title).filter(Boolean).join('、')}` : item.helpUsed ? ' · 有表達求助需要' : ''}</Text></View>) : <Text style={styles.body}>今天還沒有完成紀錄，慢慢來就好。</Text>}<Text style={styles.caption}>紀錄保存在這台裝置、這個瀏覽器；舊版資料保留。</Text></View>
    </> : <>

      
      <View testID="mission-stage" onLayout={event => { taskTop.current = event.nativeEvent.layout.y; }} style={[styles.card, styles.missionPanel]}><Text testID="mission-name" style={styles.heading}>{state.phase === 'done' ? '你做到了！' : state.title || '今天要完成什麼？'}</Text>
      {state.phase === 'ready' ? <>
        <View style={{flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap'}}><Pressable accessibilityRole="button" accessibilityLabel={state.title ? '修改任務' : '選擇任務'} onPress={() => { setTaskPickerOpen(true); setTaskDetailsOpen(false); }} style={styles.smallLink}><Text style={styles.cardMinutes}>{state.title ? '✎ 換個任務' : '✎ 選擇任務'}</Text></Pressable>
        {activeCategory ? <>
          <Pressable accessibilityRole="button" accessibilityLabel={taskDetailsOpen ? '收起任務細項' : '選得更清楚'} onPress={() => setTaskDetailsOpen(!taskDetailsOpen)} style={styles.smallLink}><Text style={styles.cardMinutes}>{taskDetailsOpen ? '收起任務細項' : '選得更清楚 ▾'}</Text></Pressable>
          {taskDetailsOpen ? <View style={styles.helpGrid}>{activeCategory.tasks.map(task => <Pressable key={task} accessibilityRole="button" accessibilityLabel={`細項：${task}`} disabled={saving} onPress={() => void chooseTask(task, activeCategory.id)} style={styles.detailChoice}><Text style={styles.body}>{task}</Text></Pressable>)}</View> : null}
        </> : null}
        
        </View><View style={styles.cardStage}>
          <Pressable accessibilityRole="button" accessibilityLabel="上一張時間卡" onPress={() => stepCard(-1)} disabled={saving} style={styles.arrow}><Text style={styles.section}>‹</Text></Pressable>
          <CardLift selected reduced={reduceMotion}><CardPedestal source={displayCard.imageSource} label={displayCard.name} /></CardLift>
          <Pressable accessibilityRole="button" accessibilityLabel="下一張時間卡" onPress={() => stepCard(1)} disabled={saving} style={styles.arrow}><Text style={styles.section}>›</Text></Pressable>
        </View>
        <Text style={styles.cardPlaque}>{durationLabel(state.minutes)} · 完成＋{rewardForMinutes(state.minutes)}</Text>
        {button('準備出發', () => void change(s => s.phase !== 'ready' || !s.title.trim() ? s : ({ ...s, phase: 'preparing', cardId: s.cardId ?? timeChallenges.find(c => c.minutes === s.minutes)?.id, taskReward: rewardForMinutes(s.minutes), supportCardId: undefined, supportUsed: [], breakDeadline: null, helpUsed: false, finishId: undefined, deadline: null, remaining: s.minutes * 60 })), false, !state.title.trim())}
      </> : state.phase === 'preparing' ? <>
        <PortalCue reduced={reduceMotion} />
        <Image source={sopCards.find(card => card.id === 'task-starter')!.imageSource} accessibilityLabel="Task Starter 任務啟動卡" style={styles.ritualArt} resizeMode="contain" />
        <Text style={styles.section}>Task Starter · 任務啟動</Text><Text style={styles.quote}>拿出 Task Starter，把需要的東西準備好。</Text><Text style={styles.body}>這次挑戰：{durationLabel(state.minutes)}。準備好再按，現在還沒有計時。</Text>
        {button('我準備好了，開始！', () => void change(s => s.phase !== 'preparing' ? s : ({ ...s, phase: 'active', help: false, deadline: s.minutes === 0 ? null : Date.now() + s.minutes * 60000, remaining: s.minutes * 60 })))}
        {button('回去選時間卡', () => void change(s => s.phase !== 'preparing' ? s : ({ ...s, phase: 'ready', deadline: null })), true)}
      </> : state.phase === 'finishing' ? <>
        <Image source={finishImage} accessibilityLabel={`${finish.title} 收尾鼓勵卡`} style={styles.ritualArt} resizeMode="contain" />
        <Text style={styles.caption}>{companion?.name || guardian.coreGuardianName || '守護夥伴'} 想對你說</Text>
        <Text style={styles.section}>{finish.title}</Text>{usedHelpNames ? <Text style={styles.caption}>這輪你選了{usedHelpNames}，表達自己的需要也是重要的一步。</Text> : null}<Text style={styles.quote}>{finish.line}</Text><Text style={styles.body}>{finish.reminder}</Text><Text style={styles.caption}>計時已停下。收尾後 ＋{state.taskReward ?? 1} 能量球。</Text>
        {button(finish.button, () => void change(completeTask))}
        {button('還有一點，回去繼續', () => void change(s => s.phase !== 'finishing' ? s : ({ ...s, phase: 'active', deadline: s.minutes === 0 ? null : Date.now() + s.remaining * 1000, help: false })), true)}
      </> : state.phase === 'active' ? <>
        {selectedCard && !state.help ? <CardPedestal source={selectedCard.imageSource} label={selectedCard.name} /> : null}
        {state.help ? null : state.minutes === 0 ? <Text style={styles.section}>不限時，慢慢完成就好。</Text> : <Text testID="crystal-clock" style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text>}
        <Text style={styles.body}>{state.help ? '任務已暫停' : state.minutes !== 0 && remaining === 0 ? '時間到了。還沒做好也沒關係，可以慢慢完成。' : '照自己的速度來。'}</Text>
        {state.help ? <>
          {!helpCard ? <Text style={styles.body}>拿出你的幫忙卡，再選同一張。</Text> : null}
          {helpCard ? <>
            <CardPedestal source={helpCard.image} label={helpCard.title} />
            {helpCard.id !== 'rest' ? <Text style={styles.body}>{helpCard.guide}</Text> : null}
            {helpCard.id === 'rest' ? <><Text testID="crystal-clock" style={styles.timer}>{String(Math.floor(breakRemaining / 60)).padStart(2, '0')}:{String(breakRemaining % 60).padStart(2, '0')}</Text><Text style={styles.body}>{breakRemaining === 0 ? '休息時間到了，準備好了再繼續；任務仍然暫停。' : '這是休息時間，任務時間不會減少。'}</Text></> : null}
            {button(helpCard.resume, () => void change(resumeHelp))}
            {button('換一張幫忙卡', () => void change(s => s.phase !== 'active' || !s.help ? s : ({ ...s, supportCardId: undefined, breakDeadline: null })), true)}
          </> : <>
            <View style={styles.helpGrid}>{helpCards.map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`選擇${card.title}`} disabled={saving} onPress={() => void change(s => selectHelp(s, card.id))} style={[styles.helpChoice, saving && styles.disabled]}><Image source={card.image} accessibilityLabel={card.title} style={styles.helpArt} resizeMode="contain" /><Text style={styles.cardName}>{card.title}</Text><Text style={styles.caption}>{card.line}</Text></Pressable>)}</View>
            {button('我準備好了，繼續', () => void change(resumeHelp), true)}
          </>}
        </> : button('我需要幫忙', () => void change(openHelp), true)}

        {!state.help ? button('完成', () => void change(enterFinishing)) : null}
      </> : <><Text style={styles.section}>{finish.title}</Text><Text style={styles.quote}>你完成了，也把這一輪收好了。每一小步都值得被看見。</Text><RewardArrival reward={state.taskReward ?? 1} balance={state.orbs} reduced={reduceMotion} animate={celebrate.current && !pending} /><Text style={styles.body}>{state.title}</Text><Text style={styles.caption}>這一輪結束了。休息一下，準備好再選卡。</Text>{button('再選一張任務卡', () => void change(s => ({ ...s, phase: 'ready', deadline: null, help: false, remaining: s.minutes * 60 })), true)}</>}
      </View>
      {homePhase ? <>
      {button(`✦ 能量球 ${state.orbs} · ${walletOpen ? '收起加法' : '看看加法'}`, () => setWalletOpen(!walletOpen), true)}
      {walletOpen ? <View style={styles.scorePanel} accessibilityLiveRegion="polite"><Text style={styles.section}>我的可用能量球</Text><EnergyMath total={state.orbs} /><Text accessibilityLabel={`可用能量球 ${state.orbs} 顆`} style={[styles.energyNumber, { fontSize: Math.min(40, 180 / String(state.orbs).length) }]}>{state.orbs} 顆</Text><Text style={styles.body}>今天任務 ＋{today.reduce((sum, item) => sum + (item.reward ?? 1), 0)} 顆 · 世界卡 ＋{todayExchangePoints} 顆</Text><Text style={styles.caption}>守護獸兌換已用 {(state.guardianCards ?? []).filter(item => item.source === 'sunday').reduce((sum, item) => sum + item.cost, 0)} 點</Text><Text style={styles.section}>今日任務 {today.length} / {state.dailyGoal ?? 3} {today.length >= (state.dailyGoal ?? 3) ? '✓ 全完成' : ''}</Text><Text style={styles.body}>{'● '.repeat(state.rewardProgress ?? 0)}{'○ '.repeat(3 - (state.rewardProgress ?? 0))} 再完成 {3 - (state.rewardProgress ?? 0)} 次抽世界卡</Text><Text style={styles.caption}>今天全完成也能抽卡 · 已收藏 {state.collection?.length ?? 0} 張</Text></View>
      : null}
      <View style={styles.companionRow}><Image source={companion?.image ?? guardianImage} accessibilityLabel="今日夥伴陪你做任務" style={styles.companionThumb} resizeMode="contain" /><Text style={styles.caption}>{companion?.name || guardian.coreGuardianName || '守護夥伴'} 陪你一起做</Text></View><View testID="scene-footer">{button(hubOpen ? '收起基地收藏室' : '✧ 基地收藏室', () => setHubOpen(!hubOpen), true)}{state.shopEnabled ? button('✧ 心願小舖', () => setShopOpen(true), true) : button('世界卡換點數', () => setWorldExchangeOpen(true), true)}</View>
      {hubOpen ? <View style={styles.card}><Text style={styles.section}>基地收藏室</Text><Text style={styles.caption}>本命獸：{guardian.coreGuardianName || '你的本命獸'} · 身分保留</Text>{button('我的守護獸收藏', () => setCollectionOpen(true), true)}{button('世界卡換點數', () => setWorldExchangeOpen(true), true)}{state.collection?.length ? button(showWorldAlbum ? '收起世界卡收藏' : '打開世界卡收藏', () => setShowWorldAlbum(!showWorldAlbum), true) : null}</View> : null}
      </> : null}
    </>}
    {showWorldReminder ? <View style={styles.reminder} accessibilityLiveRegion="polite"><Text style={styles.section}>你有世界卡可以換點數！</Text><Text style={styles.body}>目前可領 ＋{exchangePlan.points} 能量球，現在領取嗎？</Text><Text style={styles.caption}>先看明細，再確認。下次再換也不會過期。</Text>{button('去兌換', () => setWorldExchangeOpen(true))}{button('下次再說', () => void change(s => ({ ...s, worldReminderDismissedDay: worldExchangeDay(Date.now()) })), true)}</View> : null}
      {!settingsOpen && homePhase && showWorldAlbum && !!state.collection?.length ? <View style={styles.card}><Text style={styles.section}>我的世界卡</Text><Text style={styles.body}>{exchangePlan.blocked ? '今天已兌換，新卡留到明天。' : `目前可換 ＋${exchangePlan.points} 能量球`}</Text>{button('查看兌換明細', () => setWorldExchangeOpen(true), true)}<ScrollView horizontal contentContainerStyle={styles.deck}>{state.collection.map(item => { const card = worldEvents.find(c => c.id === item.cardId); return card ? <View key={item.id} style={styles.taskCard}><Image source={card.imageSource} accessibilityLabel={card.title} resizeMode="contain" style={styles.cardArt} /><Text style={styles.cardName}>{card.title}</Text><Text style={styles.caption}>{item.redeemedAt ? '✓ 已兌換 · 保留收藏' : worldRewardLabel(item.cardId)}</Text></View> : null; })}</ScrollView></View> : null}
  </ScrollView>
    <Modal visible={shopOpen && !!state.shopEnabled && !pending} animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setShopOpen(false)}><SafeAreaView style={styles.root}><WorldBackdrop scene="rest" /><ScrollView contentContainerStyle={styles.page}>{button('回到天空基地', () => setShopOpen(false), true)}<RewardShop data={state} settings={false} saving={saving} change={change} />{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</ScrollView></SafeAreaView></Modal>
    <Modal visible={taskPickerOpen && state.phase === 'ready'} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setTaskPickerOpen(false)}><View style={styles.overlay}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
      <TaskPicker currentTitle={state.title} saving={saving} onSelect={chooseTask} onClose={() => setTaskPickerOpen(false)} />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </ScrollView></View></Modal>
    <Modal visible={worldExchangeOpen && !pending} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => setWorldExchangeOpen(false)}><SafeAreaView style={styles.root}><WorldBackdrop scene="home" /><ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.heading}>世界卡換點數</Text><Text style={styles.section}>✦ 可用能量球 {state.orbs}</Text>{button('回到任務', () => setWorldExchangeOpen(false), true)}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.card}><Text style={styles.section}>{exchangePlan.blocked ? '今天已兌換完成' : '這次可兌換'}</Text>
        <Text style={styles.score}>＋{exchangePlan.blocked ? todayExchangePoints : exchangePlan.points} ✦</Text>
        <Text style={styles.body}>{exchangePlan.blocked ? `今天世界卡已換得 ${todayExchangePoints} 點。新卡保留到明天再換，不會消失。` : `${exchangePlan.basePoints} 基本點數 × ${exchangePlan.multiplier} ＝ ${exchangePlan.points} 能量球`}</Text>
        {exchangePlan.points === 0 && !exchangePlan.blocked ? <Text style={styles.body}>{exchangePlan.doublesWaiting ? '目前只有雙倍卡，等抽到點數卡再一起換；現在不會消耗它。' : '這批暫時沒有點數獎勵，也沒關係，故事卡仍然留在收藏裡。'}</Text> : null}
        {exchangePlan.bases.map(item => <View key={item.id} style={styles.record}><Text style={styles.body}>{worldEvents.find(card => card.id === item.cardId)?.title}</Text><Text style={styles.caption}>{worldRewardLabel(item.cardId)}</Text></View>)}
        {exchangePlan.double ? <Text style={styles.body}>使用 1 張 Double Mission：本批點數 ×2（加上 {exchangePlan.basePoints} 點）</Text> : null}
        {exchangePlan.doublesWaiting ? <Text style={styles.caption}>另有 {exchangePlan.doublesWaiting} 張雙倍卡留下來，等下次有點數卡再用。</Text> : null}
        <Text style={styles.caption}>故事卡 {exchangePlan.storyCount} 張：無點數、不扣分，留在收藏。兌換只使用上面列出的點數卡與至多一張雙倍卡。</Text>
        {button(exchangePlan.blocked ? '今天已換過，明天再來' : `確認兌換 · ＋${exchangePlan.points} 點`, exchangeWorldCards, false, exchangePlan.blocked || exchangePlan.points === 0)}
        <Text style={styles.caption}>台北時間每天最多一次；可以累積兩天再換，不過期。確認後加入同一個能量球餘額，星期日也能用來兌換守護獸。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>世界卡點數規則</Text>{['Bonus Energy 能量卡：＋1', 'Surprise Gift 驚喜禮物：＋2', 'Future Signal 未來訊號：＋1', 'Double Mission 雙倍卡：本批點數 ×2', '其餘世界卡：故事收藏，沒有點數'].map(line => <Text key={line} style={styles.body}>{line}</Text>)}<Text style={styles.caption}>以上為本版固定兌換規則。雙倍只加倍這批點數卡，不加倍手上餘額或任務點數；每批最多一張，不連乘。兌換後卡圖仍保留，但同一張不能再次領點。</Text></View>
      <View style={styles.card}><Text style={styles.section}>最近兌換紀錄</Text>{state.worldRedemptions?.length ? [...state.worldRedemptions].reverse().slice(0, 10).map(receipt => <View key={receipt.id} style={styles.record}><Text style={styles.section}>{receipt.day} · ＋{receipt.points} 點</Text><Text style={styles.caption}>{receipt.drawIds.length} 張卡 · {receipt.basePoints} × {receipt.multiplier}</Text>{receipt.lines.map(line => <Text key={line.drawId} style={styles.caption}>{worldEvents.find(card => card.id === line.cardId)?.title ?? '世界卡'} · ＋{line.points}</Text>)}</View>) : <Text style={styles.body}>還沒有兌換紀錄，卡片可以先慢慢累積。</Text>}</View>
    </ScrollView></SafeAreaView></Modal>
    <Modal visible={collectionOpen && !pending} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => { if (guardianDetailId) setGuardianDetailId(null); else setCollectionOpen(false); }}><SafeAreaView style={styles.root}><WorldBackdrop scene="home" /><ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.heading}>我的守護獸收藏</Text><Text style={styles.section}>✦ 可用能量球 {state.orbs}</Text>
      {button('回到任務', () => { setCollectionOpen(false); setGuardianDetailId(null); }, true)}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {detail ? <View style={styles.card}><Image source={detail.image} accessibilityLabel={`${detail.name} ${detail.label} 大圖`} style={styles.rewardArt} resizeMode="contain" /><Text style={styles.section}>{detail.name} · {detail.label}</Text><Text style={styles.body}>{detail.vibe}</Text>
        {ownedIds.has(detail.id) ? <><Text style={styles.body}>✓ 已收藏 · 選出陪伴不扣點、不消耗卡片。</Text>{button(state.companionCardId === detail.id ? '正在陪伴你' : '今天陪我', () => void change(s => !(s.guardianCards ?? []).some(item => item.cardId === detail.id) ? s : ({ ...s, companionCardId: detail.id })), false, state.companionCardId === detail.id)}</> : <><Text style={styles.section}>兌換需要 {detail.cost} 點</Text><Text style={styles.body}>{!sunday ? '星期日開放兌換，平日也能欣賞卡片。' : detail.index > 0 && !ownedIds.has(`${detail.beastId}:${detail.index - 1}`) ? '先收藏上一階，再來迎接這張卡。' : state.orbs < detail.cost ? `還差 ${detail.cost - state.orbs} 點，慢慢累積就好。` : '確認兌換後會扣點，卡片永久留在收藏裡。'}</Text>{button(`確認兌換 · ${detail.cost} 點`, () => buyGuardian(detail.id), false, !sunday || state.orbs < detail.cost || (detail.index > 0 && !ownedIds.has(`${detail.beastId}:${detail.index - 1}`)))}</>}
        {button('回到卡冊', () => setGuardianDetailId(null), true)}
      </View> : <>
        <Text style={styles.body}>已收藏 {ownedIds.size} 張 · 點卡片看大圖，再選「今天陪我」。</Text>
        {ownedIds.size ? <ScrollView horizontal contentContainerStyle={styles.deck}>{guardianCards.filter(card => ownedIds.has(card.id)).map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`查看已收藏 ${card.name} ${card.label}`} onPress={() => setGuardianDetailId(card.id)} style={[styles.taskCard, state.companionCardId === card.id && styles.selectedCard]}><Image source={card.image} style={styles.cardArt} resizeMode="contain" /><Text style={styles.cardName}>{card.name}</Text><Text style={styles.section}>{card.label}</Text><Text style={styles.caption}>{state.companionCardId === card.id ? '✓ 今日守護夥伴' : '已收藏'}</Text></Pressable>)}</ScrollView> : <Text style={styles.body}>還沒有收藏。以前已兌換的五隻初階卡，可到設定補回。</Text>}
        {companion ? button('改由本命獸陪我', () => void change(s => ({ ...s, companionCardId: undefined })), true) : null}
        <Text style={styles.section}>星期日兌換 · 尚未收藏</Text><Text style={styles.caption}>{sunday ? '今天開放兌換！點卡片查看，再確認扣點。' : '台北時間星期日開放；現在可以先看想收藏的卡。'} 每階卡片獨立收藏，依序兌換。</Text>
        <ScrollView horizontal contentContainerStyle={styles.deck}>{guardianCards.filter(card => !ownedIds.has(card.id)).map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`查看待兌換 ${card.name} ${card.label}`} onPress={() => setGuardianDetailId(card.id)} style={styles.taskCard}><Image source={card.image} style={styles.cardArt} resizeMode="contain" /><Text style={styles.cardName}>{card.name}</Text><Text style={styles.section}>{card.label} · {card.cost} 點</Text><Text style={styles.caption}>尚未收藏</Text></Pressable>)}</ScrollView>
      </>}
    </ScrollView></SafeAreaView></Modal>
    <Modal visible={!!pending} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => {}}><View style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll}><View style={styles.card}>
      <Text style={styles.heading}>{drawnCard ? '你的世界卡！' : '可以抽世界卡了！'}</Text><Text style={styles.body}>{pending?.reason}</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {drawnCard ? <><Image source={drawnCard.imageSource} accessibilityLabel={drawnCard.title} resizeMode="contain" style={styles.rewardArt} /><Text style={styles.section}>{drawnCard.title}</Text><Text style={styles.body}>{drawnCard.desc}</Text><Text style={styles.caption}>{worldRewardLabel(drawnCard.id)}。先收下，再到「世界卡換點數」結算；抽卡本身不會立刻加點。</Text>{button('收下世界卡', () => void change(s => ({ ...s, draws: (s.draws ?? []).slice(1) })))}</> : <><Text style={styles.score}>✦ ? ✦</Text><Text style={styles.body}>你的努力，帶來一張新的世界卡。</Text>{button('抽一張世界卡', () => void change(s => {
        const first = s.draws?.[0];
        if (!first || first.cardId) return s;
        const cardId = worldEvents[Math.floor(Math.random() * worldEvents.length)].id;
        const revealed = { ...first, cardId };
        return { ...s, draws: [revealed, ...(s.draws ?? []).slice(1)], collection: [...(s.collection ?? []), revealed] };
      }))}</>}
    </View></ScrollView></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  worldName: {fontSize: 28, fontWeight: '900', color: '#fff1b9', letterSpacing: 3},
  smallLink: { minHeight: 44, alignSelf: 'center', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 18, backgroundColor: 'rgba(8,31,49,.88)' },
  missionPanel: { gap: 7, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 4, alignItems: 'stretch' },
  cardStage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0, marginHorizontal: -8 },
  stageArt: { width: 165, height: 225 }, arrow: { width: 38, height: 44, borderRadius: 24, backgroundColor: '#124c63', borderWidth: 2, borderColor: '#c8b078', alignItems: 'center', justifyContent: 'center' },
  cardPlaque: { textAlign: 'center', color: '#ffe6a5', backgroundColor: '#123b51', borderWidth: 2, borderColor: '#bca476', borderRadius: 16, padding: 8, fontWeight: '800', fontSize: 18 },
  detailChoice: { minHeight: 48, padding: 12, borderRadius: 14, backgroundColor: '#17495b', borderWidth: 1, borderColor: '#83a3aa' },
  timeCard: { width: 132 }, timeArt: { width: 112, height: 168 },
  secondarySetting: { minHeight: 52, padding: 12, backgroundColor: '#153e54', borderRadius: 14, justifyContent: 'center' },
  reminder: { backgroundColor: '#153e4b', borderColor: '#9bbdab', borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  helpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, helpChoice: { flexBasis: '45%', flexGrow: 1, borderRadius: 14, padding: 8, borderWidth: 1, borderColor: '#c9d9cf', alignItems: 'center', gap: 4, backgroundColor: '#133e4b' }, helpArt: { width: '100%', height: 155 },
  companionArt: { width: 180, height: 250 }, companionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, companionThumb: { width: 32, height: 42 },
  ritualArt: { width: '100%', height: 280 },
  energyWallet: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(9,36,56,0.90)', borderWidth: 1, borderColor: '#e7d39e', borderRadius: 18, padding: 12 }, energyCardArt: { width: 96, height: 144, flexShrink: 0, borderRadius: 10 }, energyBalance: { flex: 1, minWidth: 0, gap: 5 }, energyNumber: { fontSize: 52, fontWeight: '900', color: '#ffe3a0', fontVariant: ['tabular-nums'] }, energyUnit: { fontSize: 17, fontWeight: '700', color: '#ffe3a0' },
  scorePanel: { backgroundColor: 'rgba(9,36,56,0.94)', borderWidth: 1, borderColor: '#bca476', borderRadius: 22, padding: 16, gap: 8, alignItems: 'center' }, score: { fontSize: 48, fontWeight: '900', color: '#ffe3a0', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(20,40,32,0.7)', justifyContent: 'center' }, modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 20, width: '100%', maxWidth: 520, alignSelf: 'center' }, rewardArt: { width: '100%', height: 300 },
  deck: { gap: 12, paddingVertical: 8, paddingHorizontal: 2 }, taskCard: { width: 160, padding: 8, borderRadius: 16, borderWidth: 2, borderColor: '#567c8a', alignItems: 'center', gap: 4, backgroundColor: '#123b51' }, selectedCard: { borderColor: '#62dfeb', backgroundColor: '#153e54' }, cardArt: { width: 140, height: 200 }, activeCardArt: { width: 170, height: 230, alignSelf: 'center' }, cardMinutes: { fontSize: 16, fontWeight: '800', color: '#fff0cf' }, cardName: { fontSize: 15, fontWeight: '600', color: '#deedf1', textAlign: 'center' },
  root: { flex: 1, backgroundColor: '#0b243b' }, page: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 14, paddingBottom: 44, gap: 10 },
  header: { borderRadius: 16, paddingHorizontal: 12, backgroundColor: 'rgba(8,31,49,0.92)', borderWidth: 1, borderColor: '#8e815f', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, brand: { fontSize: 10, fontWeight: '800', color: '#ffe3a0', letterSpacing: 2 }, caption: { textAlign: 'center', alignSelf: 'center', backgroundColor: 'rgba(8,31,49,.78)', borderRadius: 8, paddingHorizontal: 6, fontSize: 14, color: '#c1d9e3', lineHeight: 23 }, link: { color: '#d6f2f6', fontSize: 15, paddingVertical: 15 },
  companion: { alignItems: 'center', gap: 7 }, guardian: { width: 110, height: 110 }, guardianName: { fontSize: 19, fontWeight: '700', color: '#fff0cf' },
  card: { backgroundColor: 'rgba(9,36,56,0.90)', borderRadius: 22, padding: 16, gap: 14, borderWidth: 1, borderColor: '#bca476' }, heading: { textAlign: 'center', backgroundColor: 'rgba(8,31,49,.9)', borderRadius: 16, padding: 8, fontSize: 24, fontWeight: '700', color: '#fff0cf', lineHeight: 38 }, body: { textAlign: 'center', backgroundColor: 'rgba(8,31,49,.82)', borderRadius: 10, paddingHorizontal: 8, fontSize: 17, lineHeight: 28, color: '#deedf1' }, section: { fontSize: 20, fontWeight: '700', color: '#fff0cf' }, quote: { fontSize: 20, lineHeight: 33, color: '#d6f2f6' }, orbs: { fontSize: 19, fontWeight: '700', color: '#ffe3a0', padding: 10 }, timer: { padding: 16, borderWidth: 2, borderColor: '#94bfc8', borderRadius: 32, backgroundColor: '#0b2944', fontSize: 52, color: '#fff0cf', fontVariant: ['tabular-nums'], textAlign: 'center' },
  button: { minHeight: 58, borderWidth: 2, borderColor: '#c8b078', backgroundColor: '#076f89', borderRadius: 32, alignItems: 'center', justifyContent: 'center', padding: 14 }, buttonText: { fontSize: 20, fontWeight: '700', color: '#fff' }, secondary: { backgroundColor: '#153e54' }, secondaryText: { color: '#d6f2f6' }, disabled: { opacity: 0.5 }, label: { fontSize: 15, color: '#deedf1' }, input: { borderWidth: 1, borderColor: '#9aafa4', borderRadius: 12, padding: 14, fontSize: 18, color: '#fff0cf' }, error: { color: '#ffb8b8', fontSize: 16, lineHeight: 24 }, record: { borderBottomWidth: 1, borderBottomColor: '#567c8a', paddingBottom: 12, gap: 4 },
});
