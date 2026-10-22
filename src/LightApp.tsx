import {useFamilyStorage} from './family/context';
import {hasParentPin} from './lib/parentLock';
import {ParentPinGate} from './ParentPinGate';
import TaskMusicHint,{MUSIC_HINT_KEY} from './TaskMusicHint';
import SpotlightGuide,{initializeGuide} from './SpotlightGuide';
import WorldDrawArt from './WorldDrawArt';
import CompanionReaction from './CompanionReaction';
import {migrateStarterCompanion} from './lib/starterCompanion';
import StarterCompanionPicker,{StarterCompanionArt,starterCompanions,isStarterCompanion,type StarterCompanionId} from './StarterCompanions';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import FocusMusicSettings from './FocusMusicSettings';
import {useFocusMusic} from './lib/focusMusic';
import {DEFAULT_FOCUS_MUSIC,validFocusMusicId,type FocusMusicId} from './lib/focusMusicCatalog';
import ChildProfile, {normalizeChildName} from './ChildProfile';
import RewardShop, { starterWishes, type Wish, type WishReceipt } from './RewardShop';
import {WorldMap, JourneyMap, JourneyReveal, JourneyHint} from './WorldJourney';
import {migrateJourneys, advanceJourney, enterWorld, worlds, type Journeys, type WorldId} from './lib/journeys';
import EnergyMath from './EnergyMath';
import {WelcomeGuide,ParentGate,WeeklyFootprints,BackupTools} from './FamilyTools';
import {createBackup,type FamilySnapshot} from './lib/familyBackup';
import AdventureVillage, {VillageBackdrop, type VillageRoom} from './AdventureVillage';
import GuardianBattle from './GuardianBattle';
import { guardianExchangeOpen, beginGuardianChallenge, winGuardianChallenge, dismissGuardianChallenge, type GuardianChallenge, type GuardianReceipt } from './lib/guardianChallenge';
import { WorldChrome, CardPedestal } from './WorldChrome';
import { TaskPicker, taskCategories } from './TaskPicker';
import { WorldBackdrop, CardLift, PortalCue, RewardArrival, useSystemReducedMotion } from './SkyWorld';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPersistedAppState } from './lib/persistence';
import { coreGuardianStageImages, timeChallenges, worldEvents, sopCards, badgeImages, guardianBeasts, supportTools, transitionCards, activeSkills } from './data/holtonCatalog';
import { chooseFinishEncouragement, finishEncouragements, type FinishContext } from './data/finishEncouragements';
import { planWorldRedemption, redeemWorldCards, worldExchangeDay, worldRewardLabel, type WorldDraw, type WorldRedemption } from './data/worldRedemption';
import type { PersistedAppState } from './types/holton';

import {migrateFocus,elapsedFocusMs,canFinishFocus,pauseFocus,clockText} from './lib/focusSession';

import {useTaskChime} from './lib/taskChime';

const KEY = 'holton-guardian-app::light-v1';
const RECOVERY_KEY = 'holton-guardian-app::before-replace-v1';
type State=LightState;
type RecordItem = { world?:WorldId; reward?: number; id: string; title: string; at: string; minutes: number; cardId?: string; finishId?: string; helpUsed?: boolean; supportUsed?: string[] };
export type LightState = { guardianSundayOnly?:boolean; starterChoiceVersion?:1;starterCompanionId?:StarterCompanionId; focusMusicEnabled?:boolean;focusMusicTrackId?:FocusMusicId; childName?:string; allowEarlyFinish?:boolean;taskSoundEnabled?:boolean;taskReminderShown?:boolean; focusElapsedMs?:number;focusStartedAt?:number|null; onboardingDone?:boolean; journeys?:Journeys;activeWorld?:WorldId; guardianChallenge?: GuardianChallenge; shopEnabled?: boolean; wishes?: Wish[]; wishReceipts?: WishReceipt[]; taskCategory?: string; reduceMotion?: boolean; taskReward?: number; worldReminderDismissedDay?: string; worldRedemptions?: WorldRedemption[]; supportCardId?: string; supportUsed?: string[]; breakDeadline?: number | null; helpUsed?: boolean; finishId?: string; guardianCards?: GuardianReceipt[]; companionCardId?: string; starterRestoreAt?: string; dailyGoal?: number; rewardProgress?: number; dailyRewardDay?: string; draws?: WorldDraw[]; collection?: WorldDraw[]; version: 1; cardId?: string; title: string; minutes: number; orbs: number; phase: 'ready' | 'preparing' | 'active' | 'finishing' | 'done'; deadline: number | null; remaining: number; help: boolean; history: RecordItem[]; guardian: Partial<PersistedAppState> };
const rewardForMinutes = (minutes: number) => timeChallenges.find(card => card.minutes === minutes)?.orbs ?? 1;
const day = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const initial = (old: Partial<PersistedAppState> | null): State => ({ version: 1, starterChoiceVersion:1,...(old?{starterCompanionId:'pip' as const}:{}),onboardingDone:!!old, shopEnabled: true, wishes: starterWishes(), title: '', minutes: 5, orbs: typeof old?.orbs === 'number' ? old.orbs : 0, phase: 'ready', deadline: null, remaining: 300, help: false, history: [], guardian: { coreGuardianName: old?.coreGuardianName, coreGuardianId: old?.coreGuardianId, coreGuardianArchetype: old?.coreGuardianArchetype, coreGuardianStateVariant: old?.coreGuardianStateVariant, coreGuardianLevel: old?.coreGuardianLevel } });

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
function importGuardianCards(old: Partial<PersistedAppState> | null): GuardianReceipt[] {
  return guardianCards.filter(card => {
    const points = old?.guardianProgress?.[card.beastId]?.orbs;
    return (card.index === 0 && old?.guardianCatalog?.[card.beastId]?.status === 'captured') || (typeof points === 'number' && Number.isFinite(points) && points >= card.cost);
  }).map(card => ({ cardId: card.id, at: new Date().toISOString(), cost: 0, source: 'legacy' }));
}

export type DuoControl={ready:boolean;start:(at:number)=>Promise<boolean>};
export default function LightApp({childNickname,compact=false,musicOwner=true,onExpand,duoControl,familyNavigation}:{childNickname?:string;compact?:boolean;musicOwner?:boolean;onExpand?:()=>void;duoControl?:(control:DuoControl|null)=>void;familyNavigation?:{sync:string;onMenu:()=>void;onSolo?:()=>void}}={}) {
  const {storage,pinKey,familyMode}=useFamilyStorage();
  const {width: viewportWidth, height: viewportHeight} = useWindowDimensions();
  const [state, setState] = useState<State | null>(null);
  const systemReduced = useSystemReducedMotion();
  const reduceMotion = systemReduced || !!state?.reduceMotion;
  const [mapOpen,setMapOpen]=useState(false);
  const [room,setRoom]=useState<VillageRoom>('village');
  const [parentTab,setParentTab]=useState<'profile'|'tasks'|'rewards'|'music'|'preferences'|'records'|'backup'>('profile');
  const [parentReturn,setParentReturn]=useState<VillageRoom>('village');
  const [journeyOpen,setJourneyOpen]=useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
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
  const [taskAway,setTaskAway]=useState(false);
  const [soundBlocked,setSoundBlocked]=useState(false);
  const reminderBusy=useRef(false);
  const {arm:armChime,play:playChime}=useTaskChime(state?.taskSoundEnabled!==false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changePin,setChangePin]=useState(false);
  const [pinReady,setPinReady]=useState<boolean|null>(null);
  const [pinSetupVisible,setPinSetupVisible]=useState(true);
  useEffect(()=>{void hasParentPin(pinKey).then(setPinReady).catch(()=>setPinReady(false));},[]);
  useEffect(()=>{
    if(!settingsOpen||typeof window==='undefined')return;
    let timer:ReturnType<typeof setTimeout>;
    const close=()=>{setSettingsOpen(false);setChangePin(false);setCollectionOpen(false);setWorldExchangeOpen(false);};
    const reset=()=>{clearTimeout(timer);timer=setTimeout(close,120000);};
    const hidden=()=>{if(document.hidden)close();};
    reset();window.addEventListener('pointerdown',reset);window.addEventListener('keydown',reset);document.addEventListener('visibilitychange',hidden);
    return()=>{clearTimeout(timer);window.removeEventListener('pointerdown',reset);window.removeEventListener('keydown',reset);document.removeEventListener('visibilitychange',hidden);};
  },[settingsOpen]);
  const [parentGateTab,setParentGateTab]=useState<typeof parentTab|null>(null);
  const [introReplay,setIntroReplay]=useState(false);
  const [tutorialReplay,setTutorialReplay]=useState(0);
  const [resumeTutorial,setResumeTutorial]=useState(false);
  const [freshTutorial,setFreshTutorial]=useState(false);
  const [worldExchangeOpen, setWorldExchangeOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [challengeConfirmId, setChallengeConfirmId] = useState<string | null>(null);
  const [battlePreviewId, setBattlePreviewId] = useState<string | null>(null);
  const [guardianDetailId, setGuardianDetailId] = useState<string | null>(null);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [detailCustom, setDetailCustom] = useState(false);
  const [taskActionsOpen,setTaskActionsOpen]=useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('5');
  const [goal, setGoal] = useState('3');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const musicTrack=validFocusMusicId(state?.focusMusicTrackId)?state.focusMusicTrackId:DEFAULT_FOCUS_MUSIC;
  const musicActive=state?.phase==='active'&&!state.help&&!settingsOpen&&(compact||room==='mission');
  const music=useFocusMusic({enabled:musicOwner&&state?.focusMusicEnabled===true,active:musicActive,trackId:musicTrack,previewAllowed:musicOwner&&settingsOpen&&parentTab==='music'});
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const raw = await storage.getItem(KEY);
        let data: State = raw ? JSON.parse(raw) : {...initial(familyMode?null:await loadPersistedAppState()),...(childNickname?{childName:childNickname}:{}),...(familyMode?{onboardingDone:true}: {})};
        if (data.version !== 1 || !Array.isArray(data.history) || !['ready', 'preparing', 'active', 'finishing', 'done'].includes(data.phase) || !Number.isFinite(data.orbs)) throw new Error('Invalid state');
        if (!data.guardianCards) {
          const old = familyMode?null:await loadPersistedAppState();
          data.guardianCards = importGuardianCards(old);
          const companion = guardianBeasts.find(beast => old?.guardianCatalog?.[beast.id]?.companion);
          data.companionCardId = companion ? data.guardianCards.filter(item => item.cardId.startsWith(`${companion.id}:`)).at(-1)?.cardId : undefined;
          await storage.setItem(KEY, JSON.stringify(data));
        } else if (!raw) await storage.setItem(KEY, JSON.stringify(data));
        const starterMigration=data.starterChoiceVersion!==1;
        data=migrateStarterCompanion(data,!!raw);
        const focusMigration=data.focusElapsedMs===undefined;
        data=migrateFocus(data,Date.now());
        const needsJourneyMigration=data.journeys?.version!==2;
        data=migrateJourneys(data);
        if(needsJourneyMigration||focusMigration||starterMigration) await storage.setItem(KEY,JSON.stringify(data));
        await initializeGuide(data.onboardingDone===false,false,storage).catch(()=>{});
        if (live) { setFreshTutorial(data.onboardingDone===false);setMapOpen(false);setRoom(['ready','done'].includes(data.phase)&&!data.journeys?.event?'village':'mission'); current.current = data; setState(data); setTitle(data.title); setMinutes(String(data.minutes)); setGoal(String(data.dailyGoal ?? 3)); }
      } catch { if (live) setError('資料暫時無法讀取，請重新整理。原有紀錄未變更。'); }
    })();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const wake=()=>setNow(Date.now());
    if(typeof document!=='undefined')document.addEventListener('visibilitychange',wake);
    return () => { live = false; clearInterval(timer);if(typeof document!=='undefined')document.removeEventListener('visibilitychange',wake); };
  }, []);
  async function change(transform: (s: State) => State) {
    if (busy.current || !current.current) return false;
    busy.current = true; setSaving(true); setError('');
    try {
      const next = transform(current.current);
      await storage.setItem(KEY, JSON.stringify(next));
      if (next.phase === 'done' && current.current.phase === 'finishing') celebrate.current = true;
      if (next.phase !== 'done') celebrate.current = false;
      current.current = next; setState(next); setNow(Date.now()); return true;
    } catch { setError('尚未儲存成功，請再試一次；點數與收藏尚未變更。'); return false; }
    finally { busy.current = false; setSaving(false); }
  }
  const duoReady=!!state&&isStarterCompanion(state.starterCompanionId)&&['ready','preparing'].includes(state.phase)&&!!title.trim()&&minutes.trim()!==''&&Number.isInteger(Number(minutes))&&Number(minutes)>=0&&Number(minutes)<=60&&!saving;
  async function startDuo(at:number){
    if(!duoReady||busy.current)return false;
    const n=Number(minutes);
    if(!await change(s=>s.phase==='ready'?{...s,title:title.trim(),minutes:n,cardId:timeChallenges.find(c=>c.minutes===n)?.id,phase:'preparing',taskReminderShown:false,focusElapsedMs:0,focusStartedAt:null,taskReward:rewardForMinutes(n),supportCardId:undefined,supportUsed:[],breakDeadline:null,helpUsed:false,finishId:undefined,deadline:null,remaining:n*60}:s))return false;
    armChime();
    return change(s=>s.phase==='preparing'?{...s,phase:'active',focusElapsedMs:0,focusStartedAt:at,help:false,deadline:s.minutes===0?null:at+s.minutes*60000}:s);
  }
  useEffect(()=>{duoControl?.({ready:duoReady,start:startDuo});return()=>duoControl?.(null);},[duoControl,state,title,minutes,saving]);
  useEffect(()=>{
    if(!state||state.phase!=='active'||state.help||state.taskReminderShown||reminderBusy.current)return;
    const target=state.minutes===0?600000:state.minutes*60000;
    if(elapsedFocusMs(state,now)<target)return;
    reminderBusy.current=true;
    void (async()=>{
      const saved=await change(s=>s.phase==='active'&&!s.help&&!s.taskReminderShown?{...s,taskReminderShown:true}:s);
      if(saved&&current.current?.phase==='active'&&!current.current.help&&current.current.taskReminderShown&&current.current.taskSoundEnabled!==false)setSoundBlocked(!await playChime());
      reminderBusy.current=false;
    })();
  },[state,now,playChime]); // change uses only stable refs and setters.
  const button = (label: string, action: () => void, secondary = false, disabled = false) => <Pressable testID={secondary ? "secondary-action" : "primary-action"} accessibilityRole="button" accessibilityLabel={label} disabled={disabled || saving} onPress={action} style={[styles.button, secondary && styles.secondary, (disabled || saving) && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
  if (!state) return <SafeAreaView style={styles.root}><Text style={styles.body}>{error || '正在準備你的夥伴…'}</Text></SafeAreaView>;
  const journey=migrateJourneys(state).journeys;
  const world=state.activeWorld??'forest';
  const goWorld=async(w:WorldId)=>{const saved=await change(s=>enterWorld(s,w));if(saved&&current.current?.activeWorld===w){setMapOpen(false);setRoom('mission');setJourneyOpen(false);setSettingsOpen(false);pageScroll.current?.scrollTo({y:0,animated:false});}};
  const dismissStory=()=>void change(s=>!s.journeys||s.journeys.event?.id!==journey.event?.id?s:({...s,journeys:{...s.journeys,event:undefined}}));
  const remaining = state.deadline ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : state.remaining;
  const focusElapsed=elapsedFocusMs(state,now);
  const focusReady=canFinishFocus(state,now);
  const focusActive=state.phase==='active'&&!state.help&&!settingsOpen&&room==='mission';
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
  const starterId=isStarterCompanion(state.starterCompanionId)?state.starterCompanionId:undefined;
  const starter=starterCompanions.find(c=>c.id===starterId);
  const companionName=companion?.name || (starter?`${starter.english} · ${starter.name}`:'初始夥伴待選擇');
  const detail = guardianCards.find(card => card.id === guardianDetailId);
  const exchangeOpen = guardianExchangeOpen(state,now);
  const starterMissing = guardianCards.filter(card => card.index === 0 && !ownedIds.has(card.id));
  function restoreStarters() {
    void change(s => {
      if (s.starterRestoreAt) return s;
      const at = new Date().toISOString();
      const existing = new Set((s.guardianCards ?? []).map(item => item.cardId));
      return { ...s, starterRestoreAt: at, guardianCards: [...(s.guardianCards ?? []), ...guardianCards.filter(card => card.index === 0 && !existing.has(card.id)).map(card => ({ cardId: card.id, at, cost: 0, source: 'parent-restore' as const }))] };
    });
  }
  async function startGuardianChallenge(cardId: string) {
    const card = guardianCards.find(item => item.id === cardId);
    if (!card) return;
    const saved = await change(s => beginGuardianChallenge(s, card, displayCard.id, Date.now()));
    if (saved && current.current?.guardianChallenge?.cardId === cardId) {
      setChallengeConfirmId(null); setCollectionOpen(false); setGuardianDetailId(null);
    }
  }
  const challenge = state.guardianChallenge;
  const battleGuardian = guardianCards.find(card => card.id === (challenge?.cardId ?? battlePreviewId));
  const battleHero = timeChallenges.find(card => card.id === challenge?.heroCardId) ?? displayCard;
  const confirmGuardian = guardianCards.find(card => card.id === challengeConfirmId);
  const challengeBlocked = (card: typeof guardianCards[number]) => !homePhase || !exchangeOpen || ownedIds.has(card.id) || state.orbs < card.cost || (card.index > 0 && !ownedIds.has(`${card.beastId}:${card.index - 1}`));
  const closeBattle = async (asCompanion = false) => {
    if (!challenge) { setBattlePreviewId(null); return; }
    const saved = await change(s => {
      if (s.guardianChallenge?.id !== challenge.id || s.guardianChallenge.status !== 'won') return s;
      const next = dismissGuardianChallenge(s, challenge.id);
      return asCompanion ? { ...next, companionCardId: challenge.cardId } : next;
    });
    if (saved && !current.current?.guardianChallenge) { setCollectionOpen(true); setGuardianDetailId(challenge.cardId); }
  };
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
    return { ...pauseFocus(s,Date.now()), help: true, helpUsed: true, supportCardId: undefined, breakDeadline: null, remaining: s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : s.remaining, deadline: null };
  }
  function selectHelp(s: State, id: string): State {
    if (s.phase !== 'active' || !s.help || !helpCards.some(card => card.id === id)) return s;
    return { ...s, supportCardId: id, supportUsed: [...new Set([...(s.supportUsed ?? []), id])], breakDeadline: id === 'rest' ? Date.now() + 120000 : null };
  }
  function resumeHelp(s: State): State {
    if (s.phase !== 'active' || !s.help) return s;
    return { ...s, focusStartedAt:Date.now(), help: false, supportCardId: undefined, breakDeadline: null, deadline: s.minutes === 0 ? null : Date.now() + s.remaining * 1000 };
  }
  const finish = finishEncouragements.find(item => item.id === state.finishId) ?? finishEncouragements[0];
  const finishImage = finish.art === 'pack-up' || finish.art === 'finish-mode' ? sopCards.find(card => card.id === finish.art)!.imageSource : badgeImages[finish.art];
  function enterFinishing(s: State): State {
    if (!canFinishFocus(s,Date.now())) return s;
    const completedToday = s.history.filter(item => day(new Date(item.at)) === day(new Date())).length;
    const daily = completedToday + 1 === (s.dailyGoal ?? 3);
    const helped = !!(s.helpUsed || s.help);
    const context: FinishContext = daily ? helped ? 'daily-help' : 'daily' : helped ? 'help' : 'normal';
    const selected = chooseFinishEncouragement(context, s.history.map(item => item.finishId ?? '').filter(Boolean), s.finishId);
    return { ...pauseFocus(s,Date.now()), phase: 'finishing', finishId: selected.id, helpUsed: helped, remaining: s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)) : s.remaining, deadline: null, help: false, supportCardId: undefined, breakDeadline: null };
  }
  function completeTask(s: State): State {
    if (s.phase !== 'finishing') return s;
    const at = new Date();
    const dateKey = day(at);
    const completionId=`${at.getTime()}-${Math.random().toString(36).slice(2,8)}`;
    const history = [...s.history, { id: completionId, world:s.activeWorld??'forest', title: s.title, at: at.toISOString(), minutes: s.minutes, reward: s.taskReward ?? 1, cardId: s.cardId, finishId: s.finishId, helpUsed: s.helpUsed, supportUsed: s.supportUsed }];
    const count = history.filter(item => day(new Date(item.at)) === dateKey).length;
    const progress = (s.rewardProgress ?? 0) + 1;
    const triple = progress >= 3;
    const allDone = count >= (s.dailyGoal ?? 3) && s.dailyRewardDay !== dateKey;
    const reason = triple && allDone ? '完成 3 次任務，而且今天任務全完成了！' : triple ? '又完成 3 次任務！' : '今天任務全完成了！';
    return { ...s, journeys:advanceJourney(migrateJourneys(s).journeys,s.activeWorld??'forest',completionId), phase: 'done', taskReminderShown:!!s.taskReminderShown, focusStartedAt:null, deadline: null, help: false, orbs: s.orbs + (s.taskReward ?? 1), history,
      rewardProgress: progress % 3, dailyRewardDay: allDone ? dateKey : s.dailyRewardDay,
      draws: [...(s.draws ?? []), ...(triple || allDone ? [{ id: String(at.getTime()), reason }] : [])] };
  }
  const companionScene = (<View testID={focusActive?"focus-companion-panel":"guardian-companion"} style={[styles.companionRow,state.phase==='finishing'&&{paddingVertical:6},focusActive&&styles.focusCompanionPanel]}>{companion||starterId?<CompanionReaction alignTop={focusActive} key={`${companion?.id??starterId}:${state.phase}:${state.help}`} character={companion?companion.beastId:starterId!} mood={state.help?'rest':state.phase==='done'||state.phase==='finishing'?'done':state.phase==='active'?'focus':'ready'} name={companionName} reduced={reduceMotion}>{companion?<Image source={companion.image} accessibilityLabel="今日夥伴陪你做任務" style={[styles.companionThumb,focusActive&&{width:102,height:144}]} resizeMode="contain" />:starterId?<StarterCompanionArt id={starterId} width={focusActive?102:136}/>:null}</CompanionReaction>:null}<View testID="companion-details" style={{flex:1,minWidth:0,alignSelf:focusActive?'flex-start':undefined,gap:focusActive?6:8}}><Text style={[styles.guardianName,focusActive&&{fontSize:17}]}>{companionName}</Text><Text style={[styles.body,focusActive&&{fontSize:15,lineHeight:23}]}>{state.help ? '我陪你休息，準備好再一起走。' : state.phase === 'done' ? '我們一起完成了！' : '我在這裡，陪你一起做。'}</Text>{state.phase === 'active' && selectedCard && !state.help ? <Image testID="companion-time-card" source={selectedCard.imageSource} accessibilityLabel={selectedCard.name} style={{width:focusActive?'100%':80,maxWidth:focusActive?112:80,height:focusActive?156:112,alignSelf:'center'}} resizeMode="contain" /> : null}</View></View>);
  async function chooseTask(nextTitle: string, category: string) {
    if (!nextTitle.trim() || nextTitle.trim().length > 80 || !current.current || !['ready', 'done'].includes(current.current.phase)) return;
    const saved = await change(s => !['ready', 'done'].includes(s.phase) ? s : ({ ...s, title: nextTitle.trim(), taskCategory: category, phase: 'ready', deadline: null, remaining: s.minutes * 60, help: false }));
    if (saved) { setTitle(nextTitle.trim()); setTaskActionsOpen(false); setTaskPickerOpen(false); setTaskDetailsOpen(false); }
  }
  function navigateRoom(next:VillageRoom) { setTaskAway(false);setRoom(next);setMapOpen(false);setJourneyOpen(false);setSettingsOpen(false);setShowWorldAlbum(false);pageScroll.current?.scrollTo({y:0,animated:false}); }
  function openParent(tab:typeof parentTab='profile') {setParentGateTab(tab);}
  function enterParent(tab:typeof parentTab) {setParentGateTab(null); setParentReturn(room);setParentTab(tab);setSettingsOpen(true);setNotice('');setTitle(state!.title);setMinutes(String(state!.minutes));setGoal(String(state!.dailyGoal??3));pageScroll.current?.scrollTo({y:0,animated:false}); }
  async function startFromVillage() {
    if(current.current?.phase==='done' && !await change(s=>({...s,phase:'ready',deadline:null,help:false,remaining:s.minutes*60}))) return;
    navigateRoom('mission');
    if(!current.current?.title) setTaskPickerOpen(true);
  }
  async function finishGuide(start:boolean,name?:string) {
    if((current.current?.onboardingDone===false||name!==undefined)&&!await change(s=>({...s,onboardingDone:true,...(name!==undefined?{childName:normalizeChildName(name)}:{})}))) return;
    setIntroReplay(false);if(freshTutorial){if(!start){await initializeGuide(false,true,storage,true);setTutorialReplay(-1);}setFreshTutorial(false);navigateRoom('village');if(start)setTutorialReplay(n=>Math.abs(n)+1);}else if(start)await startFromVillage();
  }
  async function replaceProgress(snapshot:FamilySnapshot|null):Promise<boolean> {
    const old=current.current;
    if(busy.current||!old||!['ready','done'].includes(old.phase)||old.guardianChallenge)return false;
    busy.current=true;setSaving(true);setError('');
    try {
      const before=createBackup(old);
      const resetState={...initial(null),childName:normalizeChildName(old.childName),focusMusicEnabled:old.focusMusicEnabled===true,focusMusicTrackId:validFocusMusicId(old.focusMusicTrackId)?old.focusMusicTrackId:DEFAULT_FOCUS_MUSIC,dailyGoal:old.dailyGoal??3,shopEnabled:old.shopEnabled??true,wishes:old.wishes??starterWishes(),allowEarlyFinish:old.allowEarlyFinish===true,guardianSundayOnly:old.guardianSundayOnly!==false,taskSoundEnabled:old.taskSoundEnabled!==false,reduceMotion:old.reduceMotion??false};
      const restored=snapshot?{...snapshot,...(!isStarterCompanion(snapshot.starterCompanionId)&&isStarterCompanion(old.starterCompanionId)?{starterCompanionId:old.starterCompanionId}:{})}:resetState;
      const next=migrateJourneys(migrateStarterCompanion({...((restored) as State),help:false,deadline:null,onboardingDone:true},!!snapshot));
      createBackup(next); // Revalidate before any replacement write.
      await storage.setItem(RECOVERY_KEY,before);
      await storage.setItem(KEY,JSON.stringify(next));
      if(!snapshot){await initializeGuide(true,true,storage).catch(()=>{});setTutorialReplay(n=>-Math.abs(n)-1);}
      current.current=next;setState(next);setTitle(next.title);setMinutes(String(next.minutes));setGoal(String(next.dailyGoal??3));
      setParentGateTab(null);setSettingsOpen(false);setMapOpen(false);setJourneyOpen(false);setRoom('village');setWorldExchangeOpen(false);setCollectionOpen(false);setGuardianDetailId(null);setBattlePreviewId(null);setChallengeConfirmId(null);setTaskPickerOpen(false);setTaskDetailsOpen(false);setShowWorldAlbum(false);setWalletOpen(false);setIntroReplay(false);celebrate.current=false;
      pageScroll.current?.scrollTo({y:0,animated:false});return true;
    } catch {setError('備份保留或儲存未完成，原有進度未變更。請再試一次。');return false;}
    finally {busy.current=false;setSaving(false);}
  }
  function saveGoal() {
    const target=Number(goal);
    if(!Number.isInteger(target)||target<1||target>20){setNotice('今日任務數請填 1～20 次。');return;}
    void change(s=>({...s,dailyGoal:target})).then(saved=>{if(saved)setNotice('每日目標已儲存。');});
  }
  function saveTask() {
    const n = Number(minutes);
    const target = Number(goal);
    if (!Number.isInteger(target) || target < 1 || target > 20) { setNotice('今日任務數請填 1～20 次。'); return; }
    if (!title.trim() || !Number.isInteger(n) || n < 0 || n > 60) { setNotice('請填任務名稱，時間為 1～60 分鐘，或填 0 表示不限時。'); return; }
    setNotice('');
    void change(s => ['preparing', 'active', 'finishing'].includes(s.phase) ? s : ({ ...s, title: title.trim(), taskCategory: undefined, dailyGoal: target, minutes: n, cardId: timeChallenges.find(card => card.minutes === n)?.id, phase: 'ready', remaining: n * 60, deadline: null, help: false }));
  }
  if(pinReady!==true)return <SafeAreaView style={styles.root}><Text style={styles.body}>請先由家長設定這台裝置的家長小屋密碼。</Text>{button('設定家長密碼',()=>setPinSetupVisible(true),true)}<ParentPinGate visible={pinReady===false&&pinSetupVisible} onConfirm={()=>setPinReady(true)} onCancel={()=>setPinSetupVisible(false)}/></SafeAreaView>;
  const duoButton = (label:string, action:()=>void, secondary=false, disabled=false) => <Pressable testID={secondary?"secondary-action":"primary-action"} accessibilityRole="button" accessibilityLabel={label} disabled={disabled||saving} onPress={action} style={{flex:1,minHeight:44,justifyContent:'center',alignItems:'center',paddingHorizontal:6,borderRadius:12,backgroundColor:secondary?'#173f50':'#08748a',borderWidth:1,borderColor:'#bca66d',opacity:disabled||saving ? .45 : 1}}><Text style={{color:'#fff0c1',fontSize:16,fontWeight:'700',textAlign:'center'}}>{label}</Text></Pressable>;
  if(compact)return <View testID="duo-child-task" style={{padding:10,borderRadius:16,backgroundColor:'#103448',borderWidth:1,borderColor:'#bca66d',gap:6,marginHorizontal:8,marginVertical:3}}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Text numberOfLines={1} style={{color:'#fff0c1',fontSize:21,fontWeight:'800',flex:1}}>{childNickname||state.childName}</Text><Text style={{color:'#c7e1e7',fontSize:13}}>{state.orbs} 點</Text></View>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>{starterId?<StarterCompanionArt id={starterId} width={44}/>:null}<View style={{flex:1}}><Text numberOfLines={1} style={{color:'#fff0c1',fontSize:17,fontWeight:'700'}}>{state.title||'還沒選今天的任務'}</Text><Text accessibilityLabel="任務倒數" style={{color:'#fff0b3',fontSize:32,fontWeight:'bold'}}>{clockText(state.minutes===0?Math.floor(focusElapsed/1000):remaining)}</Text><Text style={{color:'#c7e1e7',fontSize:13}}>{state.help?'休息中':state.phase==='active'?'努力中':state.phase==='finishing'?'準備收尾':state.phase==='done'?'完成了！':'準備中'}</Text></View></View>
    {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
    {state.phase==='ready'?<View style={{flexDirection:'row',gap:8}}><TextInput accessibilityLabel="任務名稱" value={title} onChangeText={setTitle} maxLength={80} placeholder="任務名稱" placeholderTextColor="#a8bdc5" style={{flex:1,minWidth:0,height:44,borderWidth:1,borderColor:'#72909a',borderRadius:8,paddingHorizontal:8,color:'#fff',fontSize:16}}/><View style={{flexDirection:'row',alignItems:'center',gap:4}}><TextInput accessibilityLabel="任務時間（分鐘）" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" style={{width:48,height:44,borderWidth:1,borderColor:'#72909a',borderRadius:8,textAlign:'center',color:'#fff',fontSize:16}}/><Text style={{color:'#c7e1e7',fontSize:13}}>分</Text></View></View>:null}
    <View style={{flexDirection:'row',gap:8}}>
    {!starterId?duoButton('選擇自己的夥伴',()=>onExpand?.()):['ready','preparing'].includes(state.phase)?duoButton('開始任務',()=>void startDuo(Date.now()),false,!duoReady):state.phase==='active'?duoButton('完成任務',()=>void change(enterFinishing),false,!focusReady):state.phase==='finishing'?duoButton(finish.button,()=>void change(completeTask)):state.phase==='done'?duoButton('下一個任務',()=>void change(s=>({...s,phase:'ready',deadline:null,remaining:s.minutes*60,help:false,focusElapsedMs:0,focusStartedAt:null}))):null}
    {duoButton('進入個人畫面',()=>onExpand?.(),true)}
    </View>
  </View>;
  if(!starterId&&homePhase&&!state.guardianChallenge) return <StarterCompanionPicker busy={saving} error={error} onChoose={id=>{void change(s=>isStarterCompanion(s.starterCompanionId)?s:{...s,starterCompanionId:id});}}/>;
  if(mapOpen && !settingsOpen && !pending && !challenge) return <WorldMap journeys={journey} activeWorld={world} onEnter={w=>{if(homePhase)void goWorld(w);}} canEnter={homePhase} onSettings={()=>openParent()} onBack={()=>navigateRoom('village')} saving={saving} error={error}/>;
  if(journeyOpen && homePhase && !settingsOpen && !pending && !challenge) return <JourneyMap journeys={journey} world={world} onClose={()=>setJourneyOpen(false)} onWorldMap={()=>{setJourneyOpen(false);setMapOpen(true);}}/>;
  const inVillage=room==='village'&&!settingsOpen;
  async function toggleMusic() {
    const enabled=current.current?.focusMusicEnabled!==true;
    if(enabled&&musicActive)music.play(musicTrack);else music.stopPreview();
    if(!await change(s=>({...s,focusMusicEnabled:enabled})))music.stop();
  }
  const musicControl=<View testID="focus-music-control" style={{alignItems:'flex-end',gap:4}}><Pressable accessibilityRole="switch" accessibilityLabel="專注音樂" accessibilityState={{checked:state.focusMusicEnabled===true}} disabled={saving} onPress={()=>void toggleMusic()} style={{padding:10,borderRadius:14,borderWidth:1,borderColor:'#a7c8cc',backgroundColor:'rgba(9,36,56,.88)'}}><Text style={{fontSize:15,color:'#fff0cf'}}>♫ 音樂：{state.focusMusicEnabled?'開':'關'}</Text></Pressable>{state.focusMusicEnabled&&(music.status==='blocked'||music.status==='error')?<Pressable accessibilityRole="button" accessibilityLabel="播放專注音樂" onPress={music.retry} style={{padding:8}}><Text style={{fontSize:14,color:'#bcecf1'}}>點此播放音樂</Text></Pressable>:null}{musicActive?<TaskMusicHint enabled={state.focusMusicEnabled===true}/>:null}</View>;
  const roomTitle=settingsOpen?'家長小屋':room==='wishes'?'心願小屋':room==='companions'?'夥伴小屋':inVillage?'':scene === 'rest' ? '休息小營地' : scene === 'focus' ? `${worlds[world].name} · 專注` : worlds[world].name;
  return <SafeAreaView testID="immersive-world" style={styles.root}><WorldChrome />{inVillage?<VillageBackdrop/>:<WorldBackdrop scene={scene} world={world} completed={journey.counts[world]} />}<ScrollView testID="main-scroll" ref={pageScroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View testID="world-title" style={styles.header}>{familyNavigation?<Pressable testID="family-header-entry" accessibilityRole="button" accessibilityLabel="冒險小隊" onPress={familyNavigation.onMenu} style={{minWidth:48,minHeight:44,paddingHorizontal:8,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#c6ac67',borderRadius:10,backgroundColor:'#103448'}}><Text style={{color:'#fff0c1',fontSize:14,fontWeight:'700'}}>冒險小隊</Text></Pressable>:null}<View style={{flex:1}}>{roomTitle?<Text testID={focusActive?"focus-world-name":undefined} style={[styles.worldName,familyNavigation&&{fontSize:24,lineHeight:32},focusActive&&{fontSize:24,lineHeight:32,letterSpacing:1}]}>{roomTitle}</Text>:null}<Text testID="holton-brand-title" style={inVillage?[styles.brand,{fontSize:24,fontWeight:'800'}]:styles.brand}>HOLTON HERO</Text></View>{!inVillage?<Pressable accessibilityRole="button" accessibilityLabel={settingsOpen&&parentReturn==='wishes'?'回到心願小屋':settingsOpen&&parentReturn==='mission'?'回到任務':'回到村莊'} style={{padding:12}} onPress={()=>navigateRoom(settingsOpen?parentReturn:'village')}><Text style={styles.link}>{settingsOpen&&parentReturn==='wishes'?'回心願小屋':settingsOpen&&parentReturn==='mission'?'回到任務':'回到村莊'}</Text></Pressable>:null}</View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {soundBlocked&&state.phase==='active'&&state.taskSoundEnabled!==false?<View style={styles.card}><Text style={styles.caption}>時間到了。裝置未能自動播放聲音。</Text>{button('播放到時提示音',()=>{armChime();setTimeout(()=>void playChime().then(ok=>setSoundBlocked(!ok)),100);},true)}</View>:null}
    {inVillage&&resumeTutorial&&(homePhase||state.phase==='preparing')?button('繼續新手教學',()=>{void (async()=>{if(state.phase==='done'&&!await change(s=>({...s,phase:'ready',deadline:null,help:false,remaining:s.minutes*60})))return;setTutorialReplay(n=>Math.abs(n)+1);})();},true):null}
    {inVillage?<AdventureVillage childName={normalizeChildName(childNickname??state.childName)} reduced={reduceMotion} orbs={state.orbs} world={worlds[world].name} steps={journey.counts[world]} today={today.length} goal={state.dailyGoal??3} task={state.title} ongoing={!homePhase} saving={saving} onStart={()=>void startFromVillage()} onVisit={place=>{if(place==='map')setMapOpen(true);else if(place==='parent')openParent();else navigateRoom(place);}}/>:null}
    {!settingsOpen&&homePhase&&room==='mission'?<><View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}>{button('冒險地圖',()=>setMapOpen(true),true)}{button('看看我的旅程',()=>setJourneyOpen(true),true)}</View>{state.phase==='ready'?<View style={{gap:8}}>{journey.counts[world]===0?<Text style={[styles.body,{padding:12,backgroundColor:'rgba(8,35,49,.7)',borderRadius:14}]}>{worlds[world].intro}</Text>:null}<JourneyHint journeys={journey} world={world} onPress={()=>setJourneyOpen(true)}/></View>:null}</>:null}

    {settingsOpen ? <>
      <Text style={styles.body}>一起約定目標與獎勵，照孩子的步調來。</Text>
      <View testID="parent-layout">{familyNavigation?<View testID="family-mode-settings" style={styles.card}><Text style={styles.section}>小隊遊玩模式</Text><Text style={styles.caption}>{familyNavigation.sync}</Text>{familyNavigation.onSolo?button('改為完整單人模式',familyNavigation.onSolo,true):<Text style={styles.body}>目前為完整單人模式</Text>}{button('切換孩子／雙人模式',familyNavigation.onMenu,true)}</View>:null}<View testID="parent-nav" style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{([['profile','小朋友資料'],['tasks','任務與目標'],['rewards','心願獎勵'],['music','音樂'],['preferences','設定與教學'],['records','完成紀錄'],['backup','備份與重置']] as const).map(([id,label])=><Pressable key={id} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected:parentTab===id}} onPress={()=>{setParentTab(id);setNotice('');}} style={[styles.smallLink,parentTab===id&&styles.selectedCard]}><Text style={styles.body}>{label}</Text></Pressable>)}</View>
      <View testID="parent-content">{parentTab==='profile'?(familyNavigation?<View style={styles.card}><Text style={styles.section}>{normalizeChildName(childNickname??state.childName)}</Text>{button('管理冒險者名字',familyNavigation.onMenu,true)}</View>:<ChildProfile name={normalizeChildName(childNickname??state.childName)} busy={saving} onSave={name=>change(s=>({...s,childName:name}))}/>):null}
      {parentTab==='music'?<FocusMusicSettings enabled={state.focusMusicEnabled===true} selected={musicTrack} previewId={music.previewId} busy={saving} status={music.status} onToggle={()=>void toggleMusic()} onSelect={id=>{music.stopPreview();void change(s=>({...s,focusMusicTrackId:id}));}} onPreview={music.preview} onRetry={music.retry} onStopPreview={music.stopPreview}/>:null}
      {parentTab==='backup'?<BackupTools data={state} busy={saving} allowed={homePhase&&!challenge} onRestore={snapshot=>replaceProgress(snapshot)} onReset={()=>replaceProgress(null)} onReadRecovery={()=>storage.getItem(RECOVERY_KEY)}/>:null}
      {parentTab==='records'?<WeeklyFootprints history={state.history} receipts={state.wishReceipts??[]} now={now}/>:null}
      {parentTab==='rewards'?<RewardShop data={state} settings saving={saving} change={change}/>:null}
      {parentTab==='preferences'?<>
      {button('修改家長密碼',()=>setChangePin(true),true)}
      {button('重新觀看操作教學',()=>{void (async()=>{if(state.phase==='done'&&!await change(s=>({...s,phase:'ready',deadline:null,help:false,remaining:s.minutes*60})))return;await storage.removeItem(MUSIC_HINT_KEY);navigateRoom('village');setTutorialReplay(n=>Math.abs(n)+1);})();},true,!homePhase)}
      {button('再看新手帶領',()=>setIntroReplay(true),true,!homePhase)}
      <View style={styles.card} testID="guardian-exchange-setting"><Text style={styles.section}>守護獸兌換時間</Text>
        <Pressable accessibilityRole="switch" accessibilityLabel="僅限星期日兌換" aria-checked={state.guardianSundayOnly!==false} accessibilityState={{checked:state.guardianSundayOnly!==false,disabled:saving}} disabled={saving} onPress={()=>void change(s=>({...s,guardianSundayOnly:s.guardianSundayOnly===false}))} style={styles.secondarySetting}><Text style={styles.section}>僅限星期日兌換：{state.guardianSundayOnly===false?'關閉':'開啟'}</Text></Pressable>
        <Text style={styles.body}>{state.guardianSundayOnly===false?'已開放隨時兌換守護獸，不限星期幾。':'僅在台北時間星期日開放守護獸兌換；關閉後可隨時兌換。'}</Text>
        <Text style={styles.caption}>點數費用、依序取得各階卡片的規則不變；請先完成目前任務，再來挑戰。世界卡每天最多兌換一次的規則不受影響。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>世界 · 動畫設定</Text><Text style={styles.body}>選卡、準備、完成與守護獸挑戰有短動畫。任務中場景靜止，到時可播放柔和提示音。</Text>
        <Pressable accessibilityRole="switch" accessibilityLabel="減少動畫" accessibilityState={{ checked: !!state.reduceMotion }} disabled={saving} onPress={() => void change(s => ({ ...s, reduceMotion: !s.reduceMotion }))} style={styles.secondarySetting}><Text style={styles.section}>減少動畫：{state.reduceMotion ? '開啟' : '關閉'}</Text></Pressable>
        <Text style={styles.caption}>{systemReduced ? '裝置已設定減少動態效果，這裡也會自動減少。' : '開啟後改用靜態提示，獎勵與任務流程不變。'}</Text>
        <Pressable accessibilityRole="switch" accessibilityLabel="任務到時提示音" accessibilityState={{checked:state.taskSoundEnabled!==false}} disabled={saving} onPress={()=>{armChime();void change(s=>({...s,taskSoundEnabled:s.taskSoundEnabled===false}));}} style={styles.secondarySetting}><Text style={styles.section}>到時提示音：{state.taskSoundEnabled===false?'關閉':'開啟'}</Text></Pressable>
        <Text style={styles.caption}>柔和三音，不循環。限時任務倒數到零時提醒；不限時滿 10 分鐘提醒，不會自動完成或發點數。</Text>
        {button('試聽到時提示音',()=>{armChime();setTimeout(()=>void playChime().then(ok=>setNotice(ok?'已播放提示音':'裝置暫時無法播放，請確認媒體音量後再試。')),100);},true)}
        <Text style={styles.caption}>手機靜音、鎖定或切換 App 時可能聽不到；回到這裡仍會顯示到時提醒。</Text>
        <Text style={styles.caption}>原卡獎勵：3／5 分鐘＋1、10 分鐘＋2、15 分鐘＋3、20 分鐘＋4、25 分鐘／不限時＋5。其他自訂時間＋1。休息與求助不扣獎勵。</Text>
      </View>
      </>:null}
      {parentTab==='records'?<View style={styles.card}><Text style={styles.section}>世界卡兌換紀錄</Text><Text style={styles.body}>今天已兌換 ＋{todayExchangePoints} 點。每天最多一次，可留到明天一起換。</Text>{button('查看世界卡兌換', () => setWorldExchangeOpen(true), true)}</View>:null}
      {parentTab==='preferences'?<>
      {button('修改家長密碼',()=>setChangePin(true),true)}
      <View style={styles.card}><Text style={styles.section}>守護獸收藏與舊卡恢復</Text><Text style={styles.body}>目前收藏 {ownedIds.size} 張。舊版能確認的卡片會自動帶入；更換已取得的陪伴夥伴不扣點，也不改變初始夥伴。</Text>{button('查看守護獸收藏', () => setCollectionOpen(true), true)}
        {starterMissing.length > 0 && !state.starterRestoreAt ? <><Text style={styles.caption}>若孩子以前已兌換完五隻 Mini 初階卡，可補回以前已取得的 {starterMissing.length} 張。只補卡，不扣點、不重複發卡。</Text>{button('補回已兌換的五隻初階卡', restoreStarters, true)}</> : <Text style={styles.caption}>初階收藏已保留，不需要重新購買。</Text>}
        <Text style={styles.caption}>{state.guardianSundayOnly===false?'守護獸不限星期幾，隨時可兌換。':'星期日兌換以台北時間為準。'}Mini 10、Mid 20、Final 40、Legendary 60 點；每張扣完整標示點數，按階段取得，舊卡仍保留。</Text>
      </View>
      </>:null}
      {parentTab==='tasks'?<>
      <View style={styles.card} testID="early-finish-setting"><Text style={styles.section}>任務完成方式</Text>
        <Pressable accessibilityRole="switch" accessibilityLabel="允許提早完成" aria-checked={state.allowEarlyFinish===true} accessibilityState={{checked:state.allowEarlyFinish===true,disabled:saving}} disabled={saving} onPress={()=>void change(s=>({...s,allowEarlyFinish:s.allowEarlyFinish!==true}))} style={styles.secondarySetting}><Text style={styles.section}>允許提早完成：{state.allowEarlyFinish===true?'開啟':'關閉'}</Text></Pressable>
        <Text style={styles.body}>{state.allowEarlyFinish===true?'開啟：開始任務後，隨時可以按「完成」。':'關閉：限時任務進行一半後才能按「完成」；不限時任務需滿 10 分鐘。'}</Text>
        <Text style={styles.caption}>由家長決定，儲存後立即套用目前及之後的任務。休息時先回到任務；不會自動完成，獎勵規則不變。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>1 · 設定今天的一件事</Text><Text style={styles.body}>寫一件做得到的小事，例如「收好桌上的積木」。</Text>
        <Text style={styles.label}>任務名稱</Text><TextInput accessibilityLabel="任務名稱" value={title} onChangeText={setTitle} maxLength={80} editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} placeholder="今天想完成的小事" placeholderTextColor="#b5c9d4" />
        <Text style={styles.label}>建議時間（分鐘，0 為不限時）</Text><TextInput accessibilityLabel="陪伴時間（分鐘）" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} />
        <Text style={styles.label}>今日預計完成幾次任務（1～20）</Text><TextInput accessibilityLabel="今日任務數" value={goal} onChangeText={setGoal} keyboardType="number-pad" editable={!['preparing', 'active', 'finishing'].includes(state.phase)} style={styles.input} />
        <Text style={styles.caption}>達到今日目標可抽一次世界卡；每累積完成 3 次也可抽一次。同時達成合併一次。三次進度跨日保留；每日目標獎勵一天一次。</Text>
        {notice ? <Text accessibilityRole="alert" style={styles.error}>{notice}</Text> : null}
        {['preparing', 'active', 'finishing'].includes(state.phase) ? <Text style={styles.body}>任務正在進行，完成後再設定下一件事。</Text> : <>{button('儲存每日目標',saveGoal,true)}{button('儲存任務', saveTask)}</>}
        {state.phase === 'ready' && state.title ? <Text style={styles.caption}>目前任務：{state.title} · {durationLabel(state.minutes)}</Text> : null}
      </View>
      <View style={styles.card}><Text style={styles.section}>2 · 卡住時，這樣陪他說</Text><Text style={styles.quote}>「我在這裡。我們先做最小的一步，你想自己試，還是一起做？」</Text><Text style={styles.body}>時間到了也不用扣分。先看看需要幫忙，還是多一點時間。</Text></View>
      </>:null}
      {parentTab==='records'?<View style={styles.card}><Text style={styles.section}>3 · 今天完成 {today.length} 件事</Text>{today.length ? today.map(item => <View key={item.id} style={styles.record}><Text style={styles.body}>✓ {item.title}</Text><Text style={styles.caption}>{new Date(item.at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} · {durationLabel(item.minutes)}{item.cardId ? ` · ${timeChallenges.find(card => card.id === item.cardId)?.name || "任務卡"}` : ""} · ＋{item.reward ?? 1} 能量球{item.supportUsed?.length ? ` · ${item.supportUsed.map(id => helpCards.find(card => card.id === id)?.title).filter(Boolean).join('、')}` : item.helpUsed ? ' · 有表達求助需要' : ''}</Text></View>) : <Text style={styles.body}>今天還沒有完成紀錄，慢慢來就好。</Text>}<Text style={styles.caption}>{familyMode?'紀錄依孩子分開保存，可在家長小屋查看雲端同步狀態。':'紀錄保存在這台裝置、這個瀏覽器；舊版資料保留。'}</Text></View>:null}
    </View></View></> : room==='wishes'?<><Text style={styles.body}>和大人一起約定，讓努力變成小小心願。</Text>{button('家長管理心願',()=>openParent('rewards'),true)}<RewardShop data={state} settings={false} saving={saving} change={change}/></> : room==='companions'?<>
      {companionScene}<View style={styles.card}><Text style={styles.section}>你的夥伴與收藏</Text><Text style={styles.body}>已收藏 {ownedIds.size} 張守護獸卡 · {state.collection?.length??0} 張世界卡</Text>{button('我的守護獸收藏',()=>setCollectionOpen(true))}{button('世界卡換點數',()=>setWorldExchangeOpen(true),true)}{button(showWorldAlbum?'收起世界卡收藏':'打開世界卡收藏',()=>setShowWorldAlbum(!showWorldAlbum),true)}{!state.collection?.length?<Text style={styles.caption}>完成任務，慢慢收集你的第一張世界卡。</Text>:null}<Text style={styles.caption}>初始夥伴會一直保留。取得守護獸後，可在收藏中選擇「今天陪我」。</Text></View>
    </> : taskAway&&state.phase==='active'?<View testID="task-away-panel" style={styles.card}>
      <Text style={styles.heading}>專注時間</Text><Text testID="away-task-title" style={[styles.section,{fontSize:viewportWidth<360?32:36,lineHeight:48,textAlign:'center'}]}>{state.title}</Text>
      <Text testID="away-clock" style={[styles.timer,{fontSize:viewportWidth<360?72:88,lineHeight:112,fontWeight:'800',paddingHorizontal:4,paddingVertical:24}]}>{clockText(state.minutes===0?Math.floor(focusElapsed/1000):remaining)}</Text>
      {musicControl}
      {state.taskReminderShown?<Text testID="away-due" accessibilityLiveRegion="polite" style={styles.body}>{state.minutes===0?'已滿 10 分鐘，可以回任務確認是否完成。':'任務時間到了，可以回去確認是否完成。'}</Text>:null}
      {button('回到任務',()=>{armChime();setTaskAway(false);})}
    </View> : !inVillage ? <>

      
      <View testID="mission-layout" onLayout={event => { taskTop.current = event.nativeEvent.layout.y; }}><View testID="mission-stage" style={[styles.card, styles.missionPanel]}>{state.phase==='ready'?<Pressable testID="task-title-entry" accessibilityRole="button" accessibilityLabel={state.title?`修改任務：${state.title}`:'選擇任務'} accessibilityHint="點開後可換個任務或選得更清楚" disabled={saving} onPress={()=>{setTaskDetailsOpen(false);setTaskActionsOpen(true);}} style={({pressed})=>[styles.taskTitleEntry,pressed&&{opacity:.8}]}><Text testID="mission-name" style={styles.taskTitleText}>{state.title||'今天要完成什麼？'} ▾</Text><Text style={styles.taskTitleHint}>點一下選擇或調整任務</Text></Pressable>:<Text testID="mission-name" style={[styles.heading,focusActive&&styles.focusMissionName]}>{state.phase === 'done' ? '你做到了！' : state.title || '今天要完成什麼？'}</Text>}
      {state.phase === 'ready' ? <>
        <View style={styles.cardStage}>
          <Pressable accessibilityRole="button" accessibilityLabel="上一張時間卡" onPress={() => stepCard(-1)} disabled={saving} style={styles.arrow}><Text style={styles.section}>‹</Text></Pressable>
          <CardLift selected reduced={reduceMotion}><CardPedestal source={displayCard.imageSource} label={displayCard.name} deck={timeChallenges} selectedId={displayCard.id} /></CardLift>
          <Pressable accessibilityRole="button" accessibilityLabel="下一張時間卡" onPress={() => stepCard(1)} disabled={saving} style={styles.arrow}><Text style={styles.section}>›</Text></Pressable>
        </View>
        <Text style={styles.cardPlaque}>{durationLabel(state.minutes)} · 完成＋{rewardForMinutes(state.minutes)}</Text>
        {button('準備出發', () => void change(s => s.phase !== 'ready' || !s.title.trim() ? s : ({ ...s, phase: 'preparing', taskReminderShown:false, focusElapsedMs:0,focusStartedAt:null, cardId: s.cardId ?? timeChallenges.find(c => c.minutes === s.minutes)?.id, taskReward: rewardForMinutes(s.minutes), supportCardId: undefined, supportUsed: [], breakDeadline: null, helpUsed: false, finishId: undefined, deadline: null, remaining: s.minutes * 60 })), false, !state.title.trim())}
      </> : state.phase === 'preparing' ? <>
        <PortalCue reduced={reduceMotion} />
        <Image source={sopCards.find(card => card.id === 'task-starter')!.imageSource} accessibilityLabel="Task Starter 任務啟動卡" style={[styles.ritualArt,{height:252,width:'90%',alignSelf:'center'}]} resizeMode="contain" />
        <Text style={styles.section}>Task Starter · 任務啟動</Text><Text style={styles.body}>這次挑戰：{durationLabel(state.minutes)}。準備好再按，現在還沒有計時。</Text>
        {button('我準備好了，開始！', () => void change(s => s.phase !== 'preparing' ? s : ({ ...s, phase: 'active', taskReminderShown:false, focusElapsedMs:0,focusStartedAt:Date.now(), help: false, deadline: s.minutes === 0 ? null : Date.now() + s.minutes * 60000, remaining: s.minutes * 60 })))}
        {button('回去選時間卡', () => void change(s => s.phase !== 'preparing' ? s : ({ ...s, phase: 'ready', deadline: null })), true)}
      </> : state.phase === 'finishing' ? <>
        <Image source={finishImage} accessibilityLabel={`${finish.title} 收尾鼓勵卡`} style={[styles.ritualArt,{width:'85%',height:238,alignSelf:'center'}]} resizeMode="contain" />
        <Text style={styles.section}>{finish.title}</Text>{usedHelpNames ? <Text style={styles.caption}>這輪你選了{usedHelpNames}，表達自己的需要也是重要的一步。</Text> : null}<Text style={styles.quote}>{finish.line}</Text>
        {button(finish.button, () => void change(completeTask))}
        {button('還有一點，回去繼續', () => void change(s => s.phase !== 'finishing' ? s : ({ ...s, phase: 'active', focusStartedAt:Date.now(), deadline: s.minutes === 0 ? null : Date.now() + s.remaining * 1000, help: false })), true)}
      </> : state.phase === 'active' ? <>
        {companionScene}
        {!state.help?<>{state.minutes===0?<Text style={styles.caption}>不限時 · 已進行</Text>:null}<Pressable testID="focus-time-panel" accessibilityRole="button" accessibilityLabel="進入專注介面" accessibilityHint="放大任務與時間，計時繼續" onPress={()=>{armChime();setTaskAway(true);requestAnimationFrame(()=>pageScroll.current?.scrollTo({y:0,animated:false}));}}><Text testID="crystal-clock" style={[styles.timer,{fontSize:60}]}>{clockText(state.minutes===0?Math.floor(focusElapsed/1000):remaining)}</Text></Pressable>{musicControl}</>:null}
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
        </> : <Pressable testID="focus-help" accessibilityRole="button" accessibilityLabel="我需要幫忙" disabled={saving} onPress={()=>void change(openHelp)} style={[styles.button,styles.secondary,saving&&styles.disabled]}><Text style={[styles.buttonText,styles.secondaryText]}>我需要幫忙</Text></Pressable>}

        {!state.help ? <>
          {state.taskReminderShown?<Text testID="task-due-reminder" accessibilityLiveRegion="polite" style={styles.caption}>{state.minutes===0?'已滿 10 分鐘。':'任務時間到了。'}</Text>:null}
          <Pressable testID="focus-complete" accessibilityRole="button" accessibilityLabel="完成" accessibilityState={{disabled:!focusReady||saving}} disabled={!focusReady||saving} onPress={()=>void change(enterFinishing)} style={[styles.button,(!focusReady||saving)&&styles.focusLocked]}><Text style={styles.buttonText}>完成</Text></Pressable>

        </> : null}
      </> : <><Text style={styles.section}>{finish.title}</Text><Text style={styles.quote}>你完成了，也把這一輪收好了。每一小步都值得被看見。</Text><RewardArrival reward={state.taskReward ?? 1} balance={state.orbs} reduced={reduceMotion} animate={celebrate.current && !pending} /><Text testID="completion-task-label" style={[styles.body,{alignSelf:'center',width:'100%',maxWidth:220,textAlign:'center'}]}>{state.title}</Text><JourneyHint journeys={journey} world={world} onPress={()=>setJourneyOpen(true)}/><View testID="completion-next-card" style={{alignSelf:'center',width:'100%',maxWidth:220}}>{button('再選一張任務卡', () => void change(s => ({ ...s, phase: 'ready', deadline: null, help: false, remaining: s.minutes * 60 })), true)}</View></>}
      </View>
      {state.phase !== 'active' ? companionScene : null}</View>
      {homePhase ? <>
      {button(`✦ 能量球 ${state.orbs} · ${walletOpen ? '收起加法' : '看看加法'}`, () => setWalletOpen(!walletOpen), true)}
      {walletOpen ? <View style={styles.scorePanel} accessibilityLiveRegion="polite"><Text style={styles.section}>我的可用能量球</Text><EnergyMath total={state.orbs} /><Text accessibilityLabel={`可用能量球 ${state.orbs} 顆`} style={[styles.energyNumber, { fontSize: Math.min(40, 180 / String(state.orbs).length) }]}>{state.orbs} 顆</Text><Text style={styles.body}>今天任務 ＋{today.reduce((sum, item) => sum + (item.reward ?? 1), 0)} 顆 · 世界卡 ＋{todayExchangePoints} 顆</Text><Text style={styles.caption}>守護獸兌換已用 {(state.guardianCards ?? []).filter(item => item.source === 'sunday').reduce((sum, item) => sum + item.cost, 0)} 點</Text><Text style={styles.section}>今日任務 {today.length} / {state.dailyGoal ?? 3} {today.length >= (state.dailyGoal ?? 3) ? '✓ 全完成' : ''}</Text><Text style={styles.body}>{'● '.repeat(state.rewardProgress ?? 0)}{'○ '.repeat(3 - (state.rewardProgress ?? 0))} 再完成 {3 - (state.rewardProgress ?? 0)} 次抽世界卡</Text><Text style={styles.caption}>今天全完成也能抽卡 · 已收藏 {state.collection?.length ?? 0} 張</Text></View>
      : null}
      <View testID="scene-footer">{button('夥伴小屋',()=>navigateRoom('companions'),true)}{button('心願小屋',()=>navigateRoom('wishes'),true)}</View>

      </> : null}
    </>:null}
    {!inVillage && showWorldReminder ? <View style={styles.reminder} accessibilityLiveRegion="polite"><Text style={styles.section}>你有世界卡可以換點數！</Text><Text style={styles.body}>目前可領 ＋{exchangePlan.points} 能量球，現在領取嗎？</Text><Text style={styles.caption}>先看明細，再確認。下次再換也不會過期。</Text>{button('去兌換', () => setWorldExchangeOpen(true))}{button('下次再說', () => void change(s => ({ ...s, worldReminderDismissedDay: worldExchangeDay(Date.now()) })), true)}</View> : null}
      {!settingsOpen && showWorldAlbum && !!state.collection?.length ? <View style={styles.card}><Text style={styles.section}>我的世界卡</Text><Text style={styles.body}>{exchangePlan.blocked ? '今天已兌換，新卡留到明天。' : `目前可換 ＋${exchangePlan.points} 能量球`}</Text>{button('查看兌換明細', () => setWorldExchangeOpen(true), true)}<ScrollView horizontal contentContainerStyle={styles.deck}>{state.collection.map(item => { const card = worldEvents.find(c => c.id === item.cardId); return card ? <View key={item.id} style={styles.taskCard}><Image source={card.imageSource} accessibilityLabel={card.title} resizeMode="contain" style={styles.cardArt} /><Text style={styles.cardName}>{card.title}</Text><Text style={styles.caption}>{item.redeemedAt ? '✓ 已兌換 · 保留收藏' : worldRewardLabel(item.cardId)}</Text></View> : null; })}</ScrollView></View> : null}
  </ScrollView>
    <WelcomeGuide childName={normalizeChildName(childNickname??state.childName)} askName={state.onboardingDone===false} error={error} visible={(state.onboardingDone===false||introReplay)&&homePhase&&!pending&&!challenge} busy={saving} onClose={(start,name)=>void finishGuide(start,name)}/>
    <SpotlightGuide key={`guide-${tutorialReplay}`} allowed={!compact&&!freshTutorial&&state.onboardingDone!==false&&!introReplay&&!pending&&!challenge&&!journey.event&&parentGateTab===null&&!collectionOpen&&!worldExchangeOpen&&(settingsOpen||state.phase==='ready'||state.phase==='preparing')} room={settingsOpen?(parentTab==='music'?'music':'parent'):room} replay={tutorialReplay} phase={state.phase} pickerOpen={taskPickerOpen} hasTask={!!state.title} onMission={()=>navigateRoom('mission')} onPicker={()=>{setDetailCustom(false);setTaskPickerOpen(true);}} onMusicDone={music.stopPreview} onResumeChange={setResumeTutorial}/>
    <ParentPinGate visible={changePin} change onConfirm={()=>setChangePin(false)} onCancel={()=>setChangePin(false)}/>
    <ParentGate visible={parentGateTab!==null} onCancel={()=>setParentGateTab(null)} onConfirm={()=>parentGateTab&&enterParent(parentGateTab)}/>
    <Modal visible={!!journey.event && !pending && !challenge && !settingsOpen && homePhase} transparent animationType={reduceMotion?'none':'fade'} onRequestClose={dismissStory}>{journey.event?<JourneyReveal event={journey.event} reduced={reduceMotion} onDismiss={dismissStory} saving={saving}/>:null}{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}</Modal>

    <Modal visible={taskActionsOpen&&state.phase==='ready'} transparent animationType={reduceMotion?'none':'fade'} onRequestClose={()=>setTaskActionsOpen(false)}><View style={styles.overlay}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}><View testID="task-actions-panel" style={styles.card}>
      <Text style={styles.heading}>{taskDetailsOpen?'選得更清楚':state.title||'今天要完成什麼？'}</Text>
      {!taskDetailsOpen?<>
        {button('換個任務',()=>{setTaskActionsOpen(false);setDetailCustom(false);setTaskPickerOpen(true);})}
        {button('選得更清楚',()=>{if(activeCategory)setTaskDetailsOpen(true);else{setTaskActionsOpen(false);setDetailCustom(true);setTaskPickerOpen(true);}},true)}
      </>:<>
        <Text style={styles.caption}>選今天要完成的一小步</Text>
        {activeCategory?.tasks.map(task=><Pressable key={task} accessibilityRole="button" accessibilityLabel={`細項：${task}`} accessibilityState={{selected:state.title===task}} disabled={saving} onPress={()=>void chooseTask(task,activeCategory.id)} style={[styles.detailChoice,state.title===task&&styles.selectedCard]}><Text style={styles.body}>{task}</Text></Pressable>)}
        {button('細項：其他',()=>{setTaskActionsOpen(false);setDetailCustom(true);setTaskPickerOpen(true);},true)}
        {button('返回任務選項',()=>setTaskDetailsOpen(false),true)}
      </>}
      {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
      {button('取消，保留原任務',()=>setTaskActionsOpen(false),true)}
    </View></ScrollView></View></Modal>
    <Modal visible={taskPickerOpen && state.phase === 'ready'} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setTaskPickerOpen(false)}><View style={styles.overlay}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
      <TaskPicker key={detailCustom ? 'detail' : 'category'} initialCustom={detailCustom} customCategory={detailCustom ? activeCategory?.id : undefined} currentTitle={state.title} saving={saving} onSelect={chooseTask} onClose={() => setTaskPickerOpen(false)} />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </ScrollView></View></Modal>
    <Modal visible={worldExchangeOpen && !pending} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => setWorldExchangeOpen(false)}><SafeAreaView style={styles.root}><WorldBackdrop scene="home" world={world} completed={journey.counts[world]} /><ScrollView testID="adaptive-secondary-scroll" contentContainerStyle={styles.page}>
      <Text style={styles.heading}>世界卡換點數</Text><Text style={styles.section}>✦ 可用能量球 {state.orbs}</Text>{button(settingsOpen?'回到家長小屋':room==='companions'?'回到夥伴小屋':'回到任務', () => setWorldExchangeOpen(false), true)}
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
        <Text style={styles.caption}>台北時間每天最多一次；可以累積兩天再換，不過期。確認後加入同一個能量球餘額，也能依家長設定的開放時間兌換守護獸。</Text>
      </View>
      <View style={styles.card}><Text style={styles.section}>世界卡點數規則</Text>{['Bonus Energy 能量卡：＋1', 'Surprise Gift 驚喜禮物：＋2', 'Future Signal 未來訊號：＋1', 'Double Mission 雙倍卡：本批點數 ×2', '其餘世界卡：故事收藏，沒有點數'].map(line => <Text key={line} style={styles.body}>{line}</Text>)}<Text style={styles.caption}>以上為本版固定兌換規則。雙倍只加倍這批點數卡，不加倍手上餘額或任務點數；每批最多一張，不連乘。兌換後卡圖仍保留，但同一張不能再次領點。</Text></View>
      <View style={styles.card}><Text style={styles.section}>最近兌換紀錄</Text>{state.worldRedemptions?.length ? [...state.worldRedemptions].reverse().slice(0, 10).map(receipt => <View key={receipt.id} style={styles.record}><Text style={styles.section}>{receipt.day} · ＋{receipt.points} 點</Text><Text style={styles.caption}>{receipt.drawIds.length} 張卡 · {receipt.basePoints} × {receipt.multiplier}</Text>{receipt.lines.map(line => <Text key={line.drawId} style={styles.caption}>{worldEvents.find(card => card.id === line.cardId)?.title ?? '世界卡'} · ＋{line.points}</Text>)}</View>) : <Text style={styles.body}>還沒有兌換紀錄，卡片可以先慢慢累積。</Text>}</View>
    </ScrollView></SafeAreaView></Modal>
    <Modal visible={collectionOpen && !pending && !challenge && !battlePreviewId && !challengeConfirmId} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => { if (guardianDetailId) setGuardianDetailId(null); else setCollectionOpen(false); }}><SafeAreaView style={styles.root}><WorldBackdrop scene="home" world={world} completed={journey.counts[world]} /><ScrollView testID="adaptive-secondary-scroll" contentContainerStyle={styles.page}>
      <Text style={styles.heading}>我的守護獸收藏</Text><Text style={styles.section}>✦ 可用能量球 {state.orbs}</Text>
      {button(settingsOpen?'回到家長小屋':room==='companions'?'回到夥伴小屋':'回到任務', () => { setCollectionOpen(false); setGuardianDetailId(null); }, true)}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {detail ? <View style={styles.card}><Image source={detail.image} accessibilityLabel={`${detail.name} ${detail.label} 大圖`} style={styles.rewardArt} resizeMode="contain" /><Text style={styles.section}>{detail.name} · {detail.label}</Text><Text style={styles.body}>{detail.vibe}</Text>
        {ownedIds.has(detail.id) ? <><Text style={styles.body}>✓ 已收藏 · 選出陪伴不扣點、不消耗卡片。</Text>{button(state.companionCardId === detail.id ? '正在陪伴你' : '今天陪我', () => void change(s => !(s.guardianCards ?? []).some(item => item.cardId === detail.id) ? s : ({ ...s, companionCardId: detail.id })), false, state.companionCardId === detail.id)}</> : <><Text style={styles.section}>夥伴挑戰 · {detail.cost} 點</Text><Text style={styles.body}>{!homePhase ? '先完成目前的任務，再來挑戰。' : !exchangeOpen ? '星期日開放挑戰，今天可以免費預覽動畫。' : detail.index > 0 && !ownedIds.has(`${detail.beastId}:${detail.index - 1}`) ? '先與上一階成為夥伴，再挑戰這一階。' : state.orbs < detail.cost ? `還差 ${detail.cost - state.orbs} 點，慢慢累積就好。` : '這是一場必勝的試煉。確認後扣點，結成夥伴後永久收藏。'}</Text>{button(`挑戰守護獸 · ${detail.cost} 點`, () => setChallengeConfirmId(detail.id), false, challengeBlocked(detail))}</>}
        {button('預覽挑戰動畫（不扣點）', () => setBattlePreviewId(detail.id), true)}
        {button('回到卡冊', () => setGuardianDetailId(null), true)}
      </View> : <>
        <Text style={styles.body}>已收藏 {ownedIds.size + (starterId ? 1 : 0)} 位夥伴 · 點一下，今天就陪你！</Text>
        <ScrollView horizontal contentContainerStyle={styles.deck} testID="owned-companion-deck">
          {starterId && starter ? <CompanionReaction name={`${starter.english} · ${starter.name}`} character={starterId} mood="ready" reduced={reduceMotion} selected={!companion} disabled={saving} onActivate={() => { if(companion) void change(s => ({...s,companionCardId:undefined})); }}>
            <View testID="starter-collection-card" style={[styles.taskCard,!companion&&styles.selectedCard]}><StarterCompanionArt id={starterId} width={136}/><Text style={styles.cardName}>{starter.english}</Text><Text style={styles.section}>{starter.name}</Text><Text style={styles.caption}>我的第一位夥伴</Text><Text style={styles.caption}>{!companion?'✓ 今天陪你':'今天陪我'}</Text></View>
          </CompanionReaction> : null}
          {guardianCards.filter(card => ownedIds.has(card.id)).map(card => <CompanionReaction key={card.id} name={`${card.name} ${card.label}`} character={card.beastId} mood="ready" reduced={reduceMotion} selected={companion?.id===card.id} disabled={saving} onActivate={() => { if(companion?.id!==card.id) void change(s => !(s.guardianCards??[]).some(item=>item.cardId===card.id)?s:({...s,companionCardId:card.id})); }}><View style={[styles.taskCard,companion?.id===card.id&&styles.selectedCard]}><Image source={card.image} style={styles.cardArt} resizeMode="contain"/><Text style={styles.cardName}>{card.name}</Text><Text style={styles.section}>{card.label}</Text><Text style={styles.caption}>{companion?.id===card.id?'✓ 今天陪你':'今天陪我'}</Text></View></CompanionReaction>)}
        </ScrollView>
        <Text style={styles.section}>{state.guardianSundayOnly===false?'隨時挑戰':'星期日挑戰'} · 尚未收藏</Text><Text style={styles.caption}>{exchangeOpen ? '今天開放挑戰！先看出戰角色，再確認扣點。' : '台北時間星期日開放；現在可以先免費預覽。'} 每階卡片獨立收藏，依序挑戰。</Text>
        <ScrollView horizontal contentContainerStyle={styles.deck}>{guardianCards.filter(card => !ownedIds.has(card.id)).map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`查看待兌換 ${card.name} ${card.label}`} onPress={() => setGuardianDetailId(card.id)} style={styles.taskCard}><Image source={card.image} style={styles.cardArt} resizeMode="contain" /><Text style={styles.cardName}>{card.name}</Text><Text style={styles.section}>{card.label} · {card.cost} 點</Text><Text style={styles.caption}>尚未收藏</Text></Pressable>)}</ScrollView>
      </>}
    </ScrollView></SafeAreaView></Modal>
    <Modal visible={!!confirmGuardian && !challenge} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => setChallengeConfirmId(null)}><View style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll}>{confirmGuardian ? <View style={styles.card}>
      <Text style={styles.heading}>準備迎接新夥伴</Text><Text style={styles.body}>出戰：{displayCard.name} · {durationLabel(state.minutes)}</Text><Text style={styles.body}>挑戰：{confirmGuardian.name} · {confirmGuardian.label}</Text>
      <Text style={styles.section}>使用 {confirmGuardian.cost} 點 · 餘額 {state.orbs} → {Math.max(0, state.orbs - confirmGuardian.cost)}</Text><Text style={styles.body}>這場一定能成功，不會戰敗。只扣一次點數，勝利後締結夥伴，卡片永久收藏。</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {button(`確認出戰 · 扣 ${confirmGuardian.cost} 點`, () => void startGuardianChallenge(confirmGuardian.id), false, challengeBlocked(confirmGuardian))}
      {button('先不挑戰，不扣點', () => setChallengeConfirmId(null), true)}
    </View> : null}</ScrollView></View></Modal>
    <Modal visible={!!battleGuardian} animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => { if (!challenge || challenge.status === 'won') void closeBattle(); }}><SafeAreaView style={styles.root}><WorldBackdrop scene="focus" />{battleGuardian ? <GuardianBattle guardianId={battleGuardian.id} key={challenge?.id ?? `preview:${battleGuardian.id}`} hero={{name: battleHero.name, image: battleHero.imageSource}} guardian={{name: `${battleGuardian.name} · ${battleGuardian.label}`, image: battleGuardian.image}} cost={challenge?.cost ?? 0} reduced={reduceMotion} won={challenge?.status === 'won'} preview={!challenge} saving={saving} error={error} onWin={() => { if (challenge) void change(s => winGuardianChallenge(s, challenge.id, Date.now())); }} onClose={() => void closeBattle()} onCompanion={() => void closeBattle(true)} /> : null}</SafeAreaView></Modal>
    <Modal visible={!!pending} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => {}}><View style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll}><View testID="world-draw-panel" style={[styles.card,styles.drawPanel]}>
      <Text style={[styles.heading,styles.drawHeading]}>{drawnCard ? '你的世界卡！' : '可以抽世界卡了！'}</Text><Text style={styles.drawReason}>{pending?.reason}</Text>
      <WorldDrawArt key={pending?.id ?? 'no-draw'} source={drawnCard?.imageSource} title={drawnCard?.title} reduced={reduceMotion} height={Math.min(210,Math.max(135,viewportHeight*0.30))} saving={saving} onCollect={()=>change(s=>({...s,draws:(s.draws??[]).slice(1)}))}>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {drawnCard ? <><Text style={styles.section}>{drawnCard.title}</Text><Text style={styles.body}>{drawnCard.desc}</Text><Text style={styles.caption}>{worldRewardLabel(drawnCard.id)}。先收下，再到「世界卡換點數」結算；抽卡本身不會立刻加點。</Text></> : <><Text style={styles.drawReason}>你的努力，帶來新的世界。</Text>{button('抽一張世界卡', () => void change(s => {
        const first = s.draws?.[0];
        if (!first || first.cardId) return s;
        const cardId = worldEvents[Math.floor(Math.random() * worldEvents.length)].id;
        const revealed = { ...first, cardId };
        return { ...s, draws: [revealed, ...(s.draws ?? []).slice(1)], collection: [...(s.collection ?? []), revealed] };
      }))}</>}
      </WorldDrawArt>
    </View></ScrollView></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  drawPanel:{gap:10,padding:16},
  drawHeading:{fontSize:22,lineHeight:30,padding:4,backgroundColor:'transparent'},
  drawReason:{fontSize:16,lineHeight:24,color:'#deedf1',textAlign:'center'},
  taskTitleEntry:{minHeight:64,paddingVertical:9,paddingHorizontal:14,alignItems:'center',justifyContent:'center',gap:2,borderWidth:2,borderColor:'#d5b976',borderRadius:18,backgroundColor:'rgba(9,43,66,.9)'},
  taskTitleText:{fontSize:24,lineHeight:32,fontWeight:'800',color:'#fff0cf',textAlign:'center'},
  taskTitleHint:{fontSize:12,lineHeight:18,color:'#c2d9dd',textAlign:'center'},
  focusMissionName:{fontSize:32,lineHeight:42,fontWeight:'800'},
  focusCompanionPanel:{padding:10,gap:12,alignItems:'flex-start'},
  focusLocked:{backgroundColor:'#46565f',borderColor:'#829399'},
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
  companionArt: { width: 180, height: 250 }, companionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 22, borderWidth: 1, borderColor: '#cbb377', backgroundColor: 'rgba(7,40,56,0.88)' }, companionThumb: { width: 136, height: 192 },
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
