import { Asset } from "expo-asset";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";


import { Pill, ProgressBar, SectionTitle } from "./src/components/holton/Primitives";
import {
  activeSkillGuides,
  activeSkills,
  badgeImages,
  childCueIconImages,
  childCueReadableLabels,
  childSceneImages,
  coreGuardianArchetypeImages,
  coreGuardianArchetypes,
  coreGuardianHappyExpressionImages,
  coreGuardianQuizQuestions,
  coreGuardianStageImages,
  coreGuardianStateVariantMeta,
  energyCards,
  guardianBeasts,
  heroCards,
  heroRuleBook,
  preloadImageModules,
  rainbowCore,
  sopCards,
  sopGuides,
  supportAssistScenarios,
  supportDurationPresets,
  supportToolGuides,
  supportTools,
  timeChallenges,
  transitionCards,
  transitionGuides,
  worldEvents,
} from "./src/data/holtonCatalog";
import {
  STORAGE_KEY,
  clearPersistedAppState,
  loadPersistedAppState,
  savePersistedAppState,
} from "./src/lib/persistence";
import {
  formatTime,
  clamp,
  clampRange,
  coreGuardianStageFromLevel,
  nextCoreGuardianStageTarget,
  coreGuardianWeeklyTargetForLevel,
  presetLabel,
  outcomeLabel,
  scenarioKindLabel,
  supportReminderModeLabel,
  riskLevelLabel,
  environmentLabel,
  isoNow,
  dayKeyFromIso,
  todayDayKey,
  formatDurationMinutes,
  realSessionReviewFilterLabel,
  sessionStatusLabel,
  formatShareBlock,
  formatBulletLine,
  formatNumberedLine,
  pickTopLabel,
  assistLevelLabel,
  interruptionKindLabel,
  realWorkflowStages,
  workflowStageLabel,
  currentWorkflowStage,
  sessionHandoffCoverage,
  operatorActionPriority,
  summarizeSessionFocus,
  summarizeEventTaxonomy,
  dedupeMissionHistory,
  dedupeExperimentRuns,
  buildSessionTaxonomy,
  scenarioFingerprint,
  reproducibilityScore,
} from "./src/lib/holtonHelpers";
import type {
  TimeChallenge,
  HeroCard,
  WeeklyHeroState,
  ToolCardInventoryState,
  HeroCollectionRecord,
  GuardianProgressState,
  GuardianCatalogRecord,
  CoreGuardianStatus,
  UiMode,
  CoreGuardianPersonality,
  CoreGuardianElement,
  CoreGuardianColor,
  CoreGuardianArchetype,
  CoreGuardianStateVariant,
  CoreGuardianQuizQuestionId,
  BadgeState,
  GuardianBeast,
  EventCard,
  ToolCard,
  PendingTimedAction,
  EnergyCard,
  MissionPhase,
  MissionLedgerSnapshot,
  MissionOutcome,
  MissionHistoryEntry,
  RulePreset,
  SupportAssistScenario,
  SupportAssistVariant,
  ParentAssistResultTag,
  ParentAssistLog,
  ParentAssistArchive,
  SupportReminderMode,
  CardGuideModalState,
  RuleConfigLogEntry,
  ScenarioKind,
  RuleConfigSnapshot,
  TestingScenarioSnapshot,
  ExperimentRun,
  ScenarioBaselineRecord,
  SessionEnvironment,
  AssistLevel,
  InterruptionKind,
  RealWorkflowStage,
  RealSessionReviewFilter,
  RealSessionEvent,
  RealTestSession,
  PersistedAppState,
} from "./src/types/holton";
export default function App() {
  const [childName, setChildName] = useState("Holton");
  const [imageAssetsReady, setImageAssetsReady] = useState(false);
  const [uiMode, setUiMode] = useState<UiMode>("child");
  const [hasChosenInitialMode, setHasChosenInitialMode] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState("mini-fighter");
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("今天只做三件事：選一張 → 按開始 → 做完按完成。卡住就按求救。");
  const [challengeSelectionConfirmed, setChallengeSelectionConfirmed] = useState(false);
  const [showHomeDetails, setShowHomeDetails] = useState(false);
  const [showParentReviewPage, setShowParentReviewPage] = useState(false);
  const mainScrollRef = useRef<ScrollView | null>(null);
  const [readyCheckSectionY, setReadyCheckSectionY] = useState(0);
  const [parentReviewWindowDays, setParentReviewWindowDays] = useState<7 | 14 | 30>(7);
  const [showParentArchives, setShowParentArchives] = useState(false);
  const [orbs, setOrbs] = useState(12);
  const [bonusOrbs, setBonusOrbs] = useState(1);
  const [guardianTraces, setGuardianTraces] = useState(2);
  const [missionsDoneToday, setMissionsDoneToday] = useState(1);
  const [stage2Unlocked, setStage2Unlocked] = useState(false);
  const [daysInSystem, setDaysInSystem] = useState(7);
  const [taskPower, setTaskPower] = useState(30);
  const [emotionPower, setEmotionPower] = useState(42);
  const [focusPower, setFocusPower] = useState(35);
  const [missionPhase, setMissionPhase] = useState<MissionPhase>("ready");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMissionSopIndex, setSelectedMissionSopIndex] = useState<number | null>(null);
  const [justReturnedFromWrapUp, setJustReturnedFromWrapUp] = useState(false);
  const [postWrapUpContinuationSteps, setPostWrapUpContinuationSteps] = useState(0);
  const [eventVisible, setEventVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventCard | null>(null);
  const [lastSettledEvent, setLastSettledEvent] = useState<EventCard | null>(null);
  const [guardianEncounterOpenedAtDay, setGuardianEncounterOpenedAtDay] = useState<number | null>(null);
  const [guardianEncounterExpiresAtDay, setGuardianEncounterExpiresAtDay] = useState<number | null>(null);
  const [guardianEncounterSourceTitle, setGuardianEncounterSourceTitle] = useState<string | null>(null);
  const [guardianEncounterSourceFamily, setGuardianEncounterSourceFamily] = useState<EventCard["family"] | null>(null);
  const [stage2PromptVisible, setStage2PromptVisible] = useState(false);
  const [usedActiveSkills, setUsedActiveSkills] = useState<Record<string, boolean>>({});
  const [selectedHeroId, setSelectedHeroId] = useState("focus-knight");
  const [selectedBeastId, setSelectedBeastId] = useState("tidefin");
  const [hasCoreGuardian, setHasCoreGuardian] = useState(false);
  const [coreGuardianStatus, setCoreGuardianStatus] = useState<CoreGuardianStatus>("empty");
  const [coreGuardianId, setCoreGuardianId] = useState<string | null>(null);
  const [coreGuardianName, setCoreGuardianName] = useState("");
  const [coreGuardianLine, setCoreGuardianLine] = useState("這裡會出現陪你一起長大的夥伴。");
  const [coreGuardianPersonalityChoice, setCoreGuardianPersonalityChoice] = useState<CoreGuardianPersonality | null>(null);
  const [coreGuardianElementChoice, setCoreGuardianElementChoice] = useState<CoreGuardianElement | null>(null);
  const [coreGuardianColorChoice, setCoreGuardianColorChoice] = useState<CoreGuardianColor | null>(null);
  const [coreGuardianArchetype, setCoreGuardianArchetype] = useState<CoreGuardianArchetype | null>(null);
  const [coreGuardianStateVariant, setCoreGuardianStateVariant] = useState<CoreGuardianStateVariant | null>(null);
  const [coreGuardianLevel, setCoreGuardianLevel] = useState(1);
  const [coreGuardianWeeklyFeed, setCoreGuardianWeeklyFeed] = useState(0);
  const [coreGuardianWeeklyFeedTarget, setCoreGuardianWeeklyFeedTarget] = useState(3);
  const [coreGuardianTotalFeed, setCoreGuardianTotalFeed] = useState(0);
  const [coreGuardianWeekIndex, setCoreGuardianWeekIndex] = useState(1);
  const [coreGuardianWeeklyCompletedCount, setCoreGuardianWeeklyCompletedCount] = useState(0);
  const [coreGuardianReselectsUsed, setCoreGuardianReselectsUsed] = useState(0);
  const [coreGuardianCreatedAtDay, setCoreGuardianCreatedAtDay] = useState<number | undefined>(undefined);
  const [coreGuardianBondedAtLevel, setCoreGuardianBondedAtLevel] = useState<number | undefined>(undefined);
  const [coreGuardianCreationVisible, setCoreGuardianCreationVisible] = useState(false);
  const [coreGuardianCreationStep, setCoreGuardianCreationStep] = useState(0);
  const [coreGuardianJustCreated, setCoreGuardianJustCreated] = useState(false);
  const [coreGuardianReselectMode, setCoreGuardianReselectMode] = useState(false);
  const [coreGuardianQuizAnswers, setCoreGuardianQuizAnswers] = useState<Partial<Record<CoreGuardianQuizQuestionId, string>>>({});
  const [coreGuardianArchetypeScores, setCoreGuardianArchetypeScores] = useState<Partial<Record<CoreGuardianArchetype, number>>>({});
  const [coreGuardianRecommendedArchetype, setCoreGuardianRecommendedArchetype] = useState<CoreGuardianArchetype | null>(null);
  const [coreGuardianSecondaryArchetype, setCoreGuardianSecondaryArchetype] = useState<CoreGuardianArchetype | null>(null);
  const [coreGuardianRecommendedState, setCoreGuardianRecommendedState] = useState<CoreGuardianStateVariant | null>(null);
  const [coreGuardianExpressionState, setCoreGuardianExpressionState] = useState<"default" | "feed-success">("default");
  const [draftCoreGuardianPersonality, setDraftCoreGuardianPersonality] = useState<CoreGuardianPersonality | null>(null);
  const [draftCoreGuardianElement, setDraftCoreGuardianElement] = useState<CoreGuardianElement | null>(null);
  const [draftCoreGuardianColor, setDraftCoreGuardianColor] = useState<CoreGuardianColor | null>(null);
  const [draftCoreGuardianName, setDraftCoreGuardianName] = useState("");
  const [worldEventsDrawnToday, setWorldEventsDrawnToday] = useState(1);
  const [extraMissionSlots, setExtraMissionSlots] = useState(0);
  const [showWeeklyDetails, setShowWeeklyDetails] = useState(false);
  const [showParentGuardianPanel, setShowParentGuardianPanel] = useState(false);
  const [showTodayDetails, setShowTodayDetails] = useState(false);
  const [showDataPlatform, setShowDataPlatform] = useState(false);
  const [showSupportTools, setShowSupportTools] = useState(false);
  const [showParentAssist, setShowParentAssist] = useState(false);
  const [pendingChallengeSwitchId, setPendingChallengeSwitchId] = useState<TimeChallenge["id"] | null>(null);
  const [selectedSupportScenario, setSelectedSupportScenario] = useState<SupportAssistScenario | null>(null);
  const [selectedSupportVariant, setSelectedSupportVariant] = useState<SupportAssistVariant | null>(null);
  const [parentAssistLogs, setParentAssistLogs] = useState<ParentAssistLog[]>([]);
  const [parentAssistArchives, setParentAssistArchives] = useState<ParentAssistArchive[]>([]);
  const [parentAssistResultTag, setParentAssistResultTag] = useState<ParentAssistResultTag | null>(null);
  const [supportDurationVisible, setSupportDurationVisible] = useState(false);
  const [pendingTimedAction, setPendingTimedAction] = useState<PendingTimedAction | null>(null);
  const [selectedSupportMinutes, setSelectedSupportMinutes] = useState(2);
  const [supportCountdown, setSupportCountdown] = useState(0);
  const [activeSupportToolId, setActiveSupportToolId] = useState<ToolCard["id"] | null>(null);
  const [supportReminderMode, setSupportReminderMode] = useState<SupportReminderMode>("screen-only");
  const [supportNeedsReturn, setSupportNeedsReturn] = useState(false);
  const [supportResumePhase, setSupportResumePhase] = useState<MissionPhase | null>(null);
  const [supportResumeRunning, setSupportResumeRunning] = useState(false);
  const coreGuardianExpressionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coreGuardianExpressionContextRef = useRef<string | null>(null);
  const [supportReturnPromptVisible, setSupportReturnPromptVisible] = useState(false);
  const [supportGuideToolId, setSupportGuideToolId] = useState<ToolCard["id"] | null>(null);
  const [cardGuideModal, setCardGuideModal] = useState<CardGuideModalState | null>(null);
  const [phaseEnteredAtMs, setPhaseEnteredAtMs] = useState(Date.now());
  const [phaseClockTick, setPhaseClockTick] = useState(0);
  const [extraTimeRequestsToday, setExtraTimeRequestsToday] = useState(0);
  const [breakCountToday, setBreakCountToday] = useState(0);
  const [restartCountToday, setRestartCountToday] = useState(0);
  const [sessionEnvironment, setSessionEnvironment] = useState<SessionEnvironment>("simulated");
  const [operatorName, setOperatorName] = useState("媽媽");
  const [operatorRole, setOperatorRole] = useState("主要陪跑");
  const [childContext, setChildContext] = useState("放學後轉換期,先求穩定進場。");
  const [sessionLocation, setSessionLocation] = useState("客廳桌面");
  const [realMissionGoal, setRealMissionGoal] = useState("先完成一輪短任務,再練習收尾。");
  const [realSessionNoteDraft, setRealSessionNoteDraft] = useState("先記錄真實現場,不要急著追求漂亮數據。");
  const [assistLevelDraft, setAssistLevelDraft] = useState<AssistLevel>("verbal");
  const [assistNoteDraft, setAssistNoteDraft] = useState("用一句短提示把孩子帶回主線。");
  const [interruptionKindDraft, setInterruptionKindDraft] = useState<InterruptionKind>("transition-resistance");
  const [interruptionNoteDraft, setInterruptionNoteDraft] = useState("開始前拖延、想離開位置。");
  const [nextActionDraft, setNextActionDraft] = useState("下一輪先維持同樣挑戰,但提前做 ready check。");
  const [realSessions, setRealSessions] = useState<RealTestSession[]>([]);
  const [activeRealSessionId, setActiveRealSessionId] = useState<string | null>(null);
  const [customRealEventDraft, setCustomRealEventDraft] = useState("孩子自己回到椅子,值得記一筆。");
  const [realSessionReviewFilter, setRealSessionReviewFilter] = useState<RealSessionReviewFilter>("today");
  const [lastRunEnvironment, setLastRunEnvironment] = useState<SessionEnvironment>("simulated");
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string | null>(null);
  const [testingMode, setTestingMode] = useState(false);
  const [showTestingDashboard, setShowTestingDashboard] = useState(true);
  const [dailyMissionCap, setDailyMissionCap] = useState(5);
  const [worldEventCap, setWorldEventCap] = useState(5);
  const [exceptionCap, setExceptionCap] = useState(3);
  const [stage2UnlockDays, setStage2UnlockDays] = useState(7);
  const [activePreset, setActivePreset] = useState<RulePreset>("balanced");
  const [baselinePreset, setBaselinePreset] = useState<RulePreset>("balanced");
  const [ruleConfigHistory, setRuleConfigHistory] = useState<RuleConfigLogEntry[]>([]);
  const [scenarioNameDraft, setScenarioNameDraft] = useState("穩定基準測試");
  const [scenarioNoteDraft, setScenarioNoteDraft] = useState("用來記錄本輪規則、角色與事件設定,方便反覆重跑比較。");
  const [savedScenarios, setSavedScenarios] = useState<TestingScenarioSnapshot[]>([]);
  const [baselineLibrary, setBaselineLibrary] = useState<ScenarioBaselineRecord[]>([]);
  const [selectedBaselineId, setSelectedBaselineId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [scenarioOperatorNote, setScenarioOperatorNote] = useState("先固定規則,再只改一個變數,不要一次動太多東西。");
  const [runReviewFilter, setRunReviewFilter] = useState<"all" | "risky" | "smooth">("all");
  const [lastScenarioKind, setLastScenarioKind] = useState<ScenarioKind>("normal");
  const [nextWorldEventId, setNextWorldEventId] = useState<string | null>(null);
  const [missionRunNonce, setMissionRunNonce] = useState(0);
  const [lastMissionOutcome, setLastMissionOutcome] = useState<MissionOutcome>("smooth");
  const [lastBlockedStep, setLastBlockedStep] = useState<string | null>(null);
  const [mostUsedTool, setMostUsedTool] = useState<string | null>(null);
  const [missionHistory, setMissionHistory] = useState<MissionHistoryEntry[]>([]);
  const [experimentRuns, setExperimentRuns] = useState<ExperimentRun[]>([]);
  const [toolCardInventory, setToolCardInventory] = useState<ToolCardInventoryState>({
    owned: 2,
    craftedTotal: 2,
    spentForSummon: 0,
    craftCostOrbs: 6,
    summonCostTools: 5,
  });
  const [heroCollection, setHeroCollection] = useState<Record<string, HeroCollectionRecord>>({
    "focus-knight": { heroId: "focus-knight", unlocked: true, summonCount: 1, lastSummonedAtDay: 1 },
    "calm-commander": { heroId: "calm-commander", unlocked: false, summonCount: 0 },
    "mission-finisher": { heroId: "mission-finisher", unlocked: false, summonCount: 0 },
    "restart-champion": { heroId: "restart-champion", unlocked: false, summonCount: 0 },
    "mindsteel-ranger": { heroId: "mindsteel-ranger", unlocked: false, summonCount: 0 },
    "hero-upgrade-elite": { heroId: "hero-upgrade-elite", unlocked: false, summonCount: 0 },
    "holton-reward": { heroId: "holton-reward", unlocked: false, summonCount: 0 },
    "holton-ascend": { heroId: "holton-ascend", unlocked: false, summonCount: 0 },
  });
  const [weeklyHero, setWeeklyHero] = useState<WeeklyHeroState>({
    heroId: "focus-knight",
    daysLeft: 7,
    usesLeft: 3,
    summonedAtDay: 1,
    retired: false,
  });
  const [guardianChallengeTokens, setGuardianChallengeTokens] = useState(1);
  const [guardianChallengeActive, setGuardianChallengeActive] = useState(false);
  const [guardianChallengeAttempts, setGuardianChallengeAttempts] = useState(0);
  const [heroUpgradeLevel, setHeroUpgradeLevel] = useState(0);
  const [totalMissionClears, setTotalMissionClears] = useState(9);
  const [lastMissionOrbGain, setLastMissionOrbGain] = useState(0);
  const [missionStartSnapshot, setMissionStartSnapshot] = useState<MissionLedgerSnapshot | null>(null);
  const [settleChecklist, setSettleChecklist] = useState({
    orbChecked: false,
    eventChecked: false,
    packupReady: false,
  });
  const [collectedBadges, setCollectedBadges] = useState<Record<string, BadgeState>>({
    "mind-lock-badge": { id: "mind-lock-badge", title: "Mind Lock Badge", collected: true, role: "專注召喚材料+里程碑徽章", imageSource: badgeImages.mindLock },
    "brave-start-badge": { id: "brave-start-badge", title: "Brave Start Badge", collected: true, role: "啟動勇氣材料+起手成就", imageSource: badgeImages.braveStart },
    "calm-core-badge": { id: "calm-core-badge", title: "Calm Core Badge", collected: false, role: "冷靜核心材料+情緒穩定里程碑", imageSource: badgeImages.calmCore },
    "restart-spirit-badge": { id: "restart-spirit-badge", title: "Restart Spirit Badge", collected: true, role: "重啟精神材料+復原成就", imageSource: badgeImages.restartSpirit },
    "finish-line-badge": { id: "finish-line-badge", title: "Finish Line Badge", collected: false, role: "收尾材料+完成徽章", imageSource: badgeImages.finishLine },
  });
  const [guardianProgress, setGuardianProgress] = useState<Record<string, GuardianProgressState>>({
    tidefin: { beastId: "tidefin", orbs: 12 },
    stoneback: { beastId: "stoneback", orbs: 8 },
    emberwing: { beastId: "emberwing", orbs: 4 },
    "steel-eagle": { beastId: "steel-eagle", orbs: 2 },
    bramblefang: { beastId: "bramblefang", orbs: 0 },
  });
  const [guardianCatalog, setGuardianCatalog] = useState<Record<string, GuardianCatalogRecord>>({
    tidefin: { beastId: "tidefin", status: "captured", defeatedCount: 2, capturedAtDay: 6, title: "海潮突破者", rarity: "Rare", showcase: true, companion: true },
    stoneback: { beastId: "stoneback", status: "defeated", defeatedCount: 1, title: "穩定防線", rarity: "Common", showcase: false, companion: false },
    emberwing: { beastId: "emberwing", status: "captured", defeatedCount: 1, capturedAtDay: 5, title: "火翼先鋒", rarity: "Epic", showcase: false, companion: false },
    "steel-eagle": { beastId: "steel-eagle", status: "defeated", defeatedCount: 1, title: "高空守望者", rarity: "Rare", showcase: false, companion: false },
    bramblefang: { beastId: "bramblefang", status: "unknown", defeatedCount: 0, title: "荊棘突圍者", rarity: "Legendary", showcase: false, companion: false },
  });

  const selectedChallenge = useMemo(
    () => timeChallenges.find((card) => card.id === selectedChallengeId) ?? timeChallenges[1],
    [selectedChallengeId]
  );
  const starterChallenges = useMemo(
    () => timeChallenges,
    []
  );
  const readyChallengeIndex = Math.max(0, starterChallenges.findIndex((card) => card.id === selectedChallengeId));
  const selectAdjacentReadyChallenge = (direction: -1 | 1) => {
    if (missionPhase !== "ready") {
      setMessage("現在不是選挑戰的時候。先完成、暫停,或取消這一輪。");
      return;
    }
    const nextIndex = (readyChallengeIndex + direction + starterChallenges.length) % starterChallenges.length;
    const nextChallenge = starterChallenges[nextIndex];
    setSelectedChallengeId(nextChallenge.id);
    setChallengeSelectionConfirmed(false);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setLastSettledEvent(null);
    setLastMissionOrbGain(0);
    setLastMissionOutcome("smooth");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastBlockedStep(null);
    setMostUsedTool(null);
    setMissionStartSnapshot(null);
    setMessage(`已切到 ${nextChallenge.name}。先確認這次挑戰,再帶孩子去說 I'm Ready。`);
  };
  const cancelCurrentMissionRound = (nextChallengeId?: TimeChallenge["id"]) => {
    setRunning(false);
    setMissionPhase("ready");
    setCurrentStep(0);
    setShowParentHomeModules(false);
    setShowHomeDetails(false);
    setUsedActiveSkills({});
    setLastSettledEvent(null);
    setLastMissionOrbGain(0);
    setLastMissionOutcome("smooth");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastBlockedStep(null);
    setMostUsedTool(null);
    setMissionStartSnapshot(null);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    if (nextChallengeId) {
      const nextChallenge = timeChallenges.find((card) => card.id === nextChallengeId) ?? null;
      setSelectedChallengeId(nextChallengeId);
      setMessage(nextChallenge ? `已取消這輪,並切到 ${nextChallenge.name}。現在可以重新開始。` : "已取消這輪,現在可以重新選挑戰。");
    } else {
      setRemaining(selectedChallenge.minutes * 60);
      setMessage("已取消這輪。你可以留在目前這張,或重新選別的挑戰卡。" );
    }
    setPendingChallengeSwitchId(null);
  };

  const finishMissionRoundAndPrepareNext = () => {
    setRunning(false);
    setMissionPhase("ready");
    setCurrentStep(0);
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setUsedActiveSkills({});
    setLastSettledEvent(null);
    setLastMissionOrbGain(0);
    setLastMissionOutcome("smooth");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastBlockedStep(null);
    setMostUsedTool(null);
    setMissionStartSnapshot(null);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCurrentEvent(null);
    setEventVisible(false);
    setPendingChallengeSwitchId(null);
    setRemaining(selectedChallenge.minutes * 60);
    setMessage(uiMode === "parent" ? "這輪已完結。現在可以直接開新任務,不用再停在收尾區。" : "這輪已完結。現在可以開新任務了。");
  };
  const selectTimeChallengeCard = (challenge: TimeChallenge) => {
    const active = challenge.id === selectedChallengeId;
    if (running && missionPhase === "challenge") {
      if (!active) {
        setPendingChallengeSwitchId(challenge.id);
        setMessage(`這一輪正在進行中。若要改成 ${challenge.name},請先取消這輪。`);
      } else {
        setMessage(`${challenge.name} 正在進行中。先完成、暫停,或取消這一輪。`);
      }
      return;
    }
    setSelectedChallengeId(challenge.id);
    setChallengeSelectionConfirmed(false);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setLastSettledEvent(null);
    setLastMissionOrbGain(0);
    setLastMissionOutcome("smooth");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastBlockedStep(null);
    setMostUsedTool(null);
    setMissionStartSnapshot(null);
    setMessage(active ? `${challenge.name} 已經是目前這張。` : `已切到 ${challenge.name},現在先確認這次挑戰,再帶孩子去說 I'm Ready。`);
  };

  const openParentGuardianPanel = (messageText = "已直接打開本命獸面板。先看牠，再決定要不要往下帶。") => {
    setCoreGuardianCreationVisible(false);
    setCoreGuardianReselectMode(false);
    setShowParentGuardianPanel(true);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setMessage(messageText);
  };

  const confirmSelectedChallengeAndFocusReadyCheck = () => {
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setChallengeSelectionConfirmed(true);
    if (isParentMode && hasCoreGuardian) {
      setShowParentGuardianPanel(true);
    }
    setMessage(`已確認這次用 ${selectedChallenge.name}。接下來先問孩子 Are you ready? 等孩子說 I'm ready 之後，再按下面的 I'm Ready。`);

    requestAnimationFrame(() => {
      if (mainScrollRef.current && readyCheckSectionY > 0) {
        mainScrollRef.current.scrollTo({ y: Math.max(0, readyCheckSectionY - 24), animated: true });
      }
    });
  };
  const homeTableCards = useMemo(
    () => [
      {
        id: "ready-check",
        label: "先準備",
        title: transitionCards.find((item) => item.id === "ready-check")?.title ?? "Ready Check-I",
        hint: "先確認能不能開始",
        imageSource: transitionCards.find((item) => item.id === "ready-check")?.imageSource,
        onPress: () => transitionNow(transitionCards.find((item) => item.id === "ready-check") ?? transitionCards[0]),
      },
      {
        id: "turbo-knight",
        label: "主力卡",
        title: timeChallenges.find((item) => item.id === "turbo-knight")?.name ?? "Turbo Knight",
        hint: "日常最穩的 10 分鐘起手",
        imageSource: timeChallenges.find((item) => item.id === "turbo-knight")?.imageSource,
        onPress: () => setSelectedChallengeId("turbo-knight"),
      },
      {
        id: "task-starter",
        label: "主流程",
        title: sopCards.find((item) => item.id === "task-starter")?.title ?? "Task Starter-I",
        hint: "正式進任務的第一步",
        imageSource: sopCards.find((item) => item.id === "task-starter")?.imageSource,
        onPress: () => setCurrentStep(0),
      },
      {
        id: "emotion-cooler",
        label: "求救卡",
        title: supportTools.find((item) => item.id === "emotion-cooler")?.title ?? "Emotion Cooler",
        hint: "卡住時先降速,不要硬推",
        imageSource: supportTools.find((item) => item.id === "emotion-cooler")?.imageSource,
        onPress: () => setShowParentAssist(true),
      },
    ],
    [setCurrentStep]
  );
  const selectedHero = useMemo(
    () => heroCards.find((item) => item.id === selectedHeroId) ?? heroCards[0],
    [selectedHeroId]
  );
  const selectedGuardian = useMemo(
    () => guardianBeasts.find((item) => item.id === selectedBeastId) ?? guardianBeasts[0],
    [selectedBeastId]
  );
  const activeWeeklyHero = useMemo(
    () => heroCards.find((item) => item.id === weeklyHero.heroId) ?? heroCards[0],
    [weeklyHero.heroId]
  );
  const activeWeeklyHeroRule = heroRuleBook[weeklyHero.heroId] ?? {
    skillName: "Hero Skill",
    detail: "本週英雄已啟動。",
    baseUses: 3,
  };
  const activeWeeklyHeroRecord = heroCollection[weeklyHero.heroId] ?? null;
  const heroRarityTheme = (rarity: HeroCard["rarity"]) => {
    if (rarity === "Legendary") return { line: "#f59e0b", soft: "#fff7ed", deep: "#7c2d12", glow: "rgba(245,158,11,0.18)" };
    if (rarity === "Epic") return { line: "#8b5cf6", soft: "#f5f3ff", deep: "#4c1d95", glow: "rgba(139,92,246,0.18)" };
    if (rarity === "Elite") return { line: "#db2777", soft: "#fdf2f8", deep: "#831843", glow: "rgba(219,39,119,0.18)" };
    return { line: "#2563eb", soft: "#eff6ff", deep: "#1e3a8a", glow: "rgba(37,99,235,0.18)" };
  };
  const selectedHeroRecord = heroCollection[selectedHeroId] ?? { heroId: selectedHeroId, unlocked: false, summonCount: 0 };
  const selectedHeroRule = heroRuleBook[selectedHero.id] ?? null;
  const selectedHeroTheme = heroRarityTheme(selectedHero.rarity);
  const selectedHeroNumber = `HC-${String(heroCards.findIndex((item) => item.id === selectedHero.id) + 1).padStart(2, "0")}`;
  const weeklyHeroExpired = weeklyHero.daysLeft <= 0 || Boolean(weeklyHero.retired);
  const orbCraftProgress = Math.min(1, toolCardInventory.craftCostOrbs ? orbs / toolCardInventory.craftCostOrbs : 0);
  const summonProgress = Math.min(1, toolCardInventory.summonCostTools ? toolCardInventory.owned / toolCardInventory.summonCostTools : 0);
  const heroServiceProgress = Math.min(1, activeWeeklyHeroRule.baseUses ? weeklyHero.usesLeft / activeWeeklyHeroRule.baseUses : 0);
  const orbsNeededForToolCard = Math.max(0, toolCardInventory.craftCostOrbs - orbs);
  const toolCardsNeededForSummon = Math.max(0, toolCardInventory.summonCostTools - toolCardInventory.owned);
  const heroNextAction = weeklyHeroExpired
    ? `先累積 ${toolCardInventory.summonCostTools} 張道具卡,再重新召喚下一位英雄。`
    : weeklyHero.usesLeft <= 0
      ? "本週技能已用完,先完成任務累積資源,等待下一次召喚或下週輪替。"
      : `目前還能使用 ${weeklyHero.usesLeft} 次技能,可在卡住或收尾時再出手。`;
  const guardianRarityColor = (rarity: GuardianCatalogRecord["rarity"]) => {
    if (rarity === "Legendary") return "#f59e0b";
    if (rarity === "Epic") return "#8b5cf6";
    if (rarity === "Rare") return "#2563eb";
    return "#64748b";
  };
  const guardianRarityTheme = (rarity: GuardianCatalogRecord["rarity"]) => {
    if (rarity === "Legendary") return { line: "#f59e0b", soft: "#fff7ed", deep: "#7c2d12", glow: "rgba(245,158,11,0.18)" };
    if (rarity === "Epic") return { line: "#8b5cf6", soft: "#f5f3ff", deep: "#4c1d95", glow: "rgba(139,92,246,0.18)" };
    if (rarity === "Rare") return { line: "#2563eb", soft: "#eff6ff", deep: "#1e3a8a", glow: "rgba(37,99,235,0.18)" };
    return { line: "#64748b", soft: "#f8fafc", deep: "#334155", glow: "rgba(100,116,139,0.14)" };
  };
  const selectedGuardianProgress = guardianProgress[selectedBeastId] ?? { beastId: selectedBeastId, orbs: 0 };
  const selectedGuardianRecord = guardianCatalog[selectedBeastId] ?? { beastId: selectedBeastId, status: "unknown", defeatedCount: 0, title: "未命名守護獸", rarity: "Common", showcase: false, companion: false };
  const selectedGuardianStatusLabel = selectedGuardianRecord.status === "captured" ? "已收服" : selectedGuardianRecord.status === "defeated" ? "已擊敗" : "未遇見";
  const guardianCodexRecords = guardianBeasts.map((beast) => ({
    beast,
    record: guardianCatalog[beast.id] ?? { beastId: beast.id, status: "unknown" as const, defeatedCount: 0, title: beast.name, rarity: "Common", showcase: false, companion: false },
  }));
  const newlyCapturedGuardians = guardianCodexRecords.filter(({ record }) => record.status === "captured" && record.capturedAtDay === daysInSystem);
  const capturedGuardians = guardianCodexRecords.filter(({ record }) => record.status === "captured");
  const encounteredGuardians = guardianCodexRecords.filter(({ record }) => record.status === "defeated");
  const unknownGuardians = guardianCodexRecords.filter(({ record }) => record.status === "unknown");
  const guardianCodexFocus = newlyCapturedGuardians.length > 0
    ? {
        title: "今天翻到的新頁",
        text: `今天有 ${newlyCapturedGuardians.length} 隻守護獸正式翻進圖鑑。先看這些新頁,再決定要不要把其中一隻拉上來展示。`,
        names: newlyCapturedGuardians.map(({ beast }) => beast.name),
        focusBeastId: newlyCapturedGuardians[0]?.beast.id ?? null,
        actionLabel: "把新頁拉上展示",
      }
    : capturedGuardians.length > 0
      ? {
          title: "先從已收服頁開始看",
          text: `你目前已有 ${capturedGuardians.length} 隻守護獸正式留在圖鑑裡。先看已收服區,再慢慢回頭翻已遭遇與未遇見頁。`,
          names: capturedGuardians.slice(0, 3).map(({ beast }) => beast.name),
          focusBeastId: capturedGuardians[0]?.beast.id ?? null,
          actionLabel: "把這頁拉上展示",
        }
      : encounteredGuardians.length > 0
        ? {
            title: "先看已遭遇但還沒收服的頁",
            text: `你目前已有 ${encounteredGuardians.length} 隻守護獸留下遭遇紀錄。先從這些頁開始,比直接看未遇見更有方向。`,
            names: encounteredGuardians.slice(0, 3).map(({ beast }) => beast.name),
            focusBeastId: encounteredGuardians[0]?.beast.id ?? null,
            actionLabel: "先看這一頁",
          }
        : {
            title: "這本圖鑑還在等第一頁打開",
            text: "你現在還沒有已遭遇或已收服的守護獸。先去世界入口抽線索,等第一頁被翻開後,這裡就會開始長出真正的圖鑑感。",
            names: [],
            focusBeastId: null,
            actionLabel: "先去抽線索",
          };
  const familyToneLine = (family?: EventCard["family"]) => (
    family === "trace"
      ? "這隻守護獸是沿著清楚留下的痕跡,被一步一步帶出來的。"
      : family === "surprise"
        ? "這隻守護獸比較像從一個突然打開的意外入口跳出來。"
        : family === "future"
          ? "這隻守護獸像先從未來線露面,再慢慢被拉到眼前。"
          : family === "recovery"
            ? "這隻守護獸是在回穩之後,重新被世界帶回眼前。"
            : family === "meta"
              ? "這隻守護獸像在世界回頭整理時,被重新翻出來的一頁。"
              : family === "bonus"
                ? "這隻守護獸像跟著一個額外推進機會,被順勢帶了出來。"
                : "這隻守護獸已經和世界線接上,但來源語氣目前保持中性。"
  );
  const selectedGuardianTheme = guardianRarityTheme(selectedGuardianRecord.rarity);
  const selectedGuardianNumber = `GB-${String(guardianBeasts.findIndex((item) => item.id === selectedGuardian.id) + 1).padStart(2, "0")}`;
  const selectedGuardianChallengeCost = selectedGuardian.challengeCost;
  const guardianAttackPowerAvailable = orbs + bonusOrbs;
  const guardianEncounterWindowActive = guardianEncounterExpiresAtDay !== null && daysInSystem <= guardianEncounterExpiresAtDay;
  const guardianEncounterDaysLeft = guardianEncounterExpiresAtDay !== null ? Math.max(0, guardianEncounterExpiresAtDay - daysInSystem + 1) : 0;
  const selectedGuardianIsNewToday = selectedGuardianRecord.status === "captured" && selectedGuardianRecord.capturedAtDay === daysInSystem;
  const phaseConfig: Record<MissionPhase, { kicker: string; title: string; nextAction: string; cue: string }> = {
    ready: {
      kicker: "STEP 1",
      title: "準備確認 / 先確認狀態",
      nextAction: "先用 Transition 卡確認是否 ready,再決定要不要進場。",
      cue: "先確認,不要直接把孩子推進任務。",
    },
    challenge: {
      kicker: "STEP 2",
      title: "任務挑戰 / 進入出戰型態",
      nextAction: "選好時間挑戰,然後正式開始這一輪任務。",
      cue: "這一段的目標不是完美,而是穩定進場。",
    },
    sop: {
      kicker: "STEP 3",
      title: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "任務流程 / 接回主線" : "任務流程 / 延續主線") : "任務流程 / 按步驟往前走",
      nextAction: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "先把主線接回這一步,再恢復正常 SOP 節奏。" : "先順著剛接住的這一步往下走,不要立刻展開其他層。") : "照 SOP 流程卡推進,中途再插 Active Skill。",
      cue: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "這一段先接回來,不要一次跳太遠。" : "這一段先延續主線,不要剛接住就散回別的入口。") : "中間卡最容易被跳過,所以要讓流程可見。",
    },
    settle: {
      kicker: "STEP 4",
      title: "任務結算 / 結算與收尾",
      nextAction: "結算能量球、查看世界事件,再把孩子接回下一步 SOP。",
      cue: "任務結束要有收尾,再把主線穩穩接回去。",
    },
  };
  const activePhase = phaseConfig[missionPhase];
  const parentLayerLens = missionPhase === "ready"
      ? {
          mode: "先判斷今天能不能直接開始",
          theory: "RESET × T-FLOW",
          focus: "先看孩子能否直接進場;不行就先用支援卡帶入,不要一開始就拼長度。",
          avoid: "不要把『還沒開始』誤判成『不想做』。",
        }
      : missionPhase === "challenge"
        ? {
            mode: "少講一句,只推這一輪",
            theory: "T-FLOW × L-FLOW",
            focus: "這一段重點是讓孩子穩穩出戰,家長只要守住節奏,不要同時丟太多要求。",
            avoid: "不要一邊挑戰一邊加新規則。",
          }
        : missionPhase === "sop"
          ? {
              mode: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "先把主線接回來" : "先順著已接住的主線往下帶") : "只看下一步,不一次講完整段",
              theory: "T-FLOW × L-FLOW × REWORD",
              focus: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "這一層先負責把孩子接回眼前這一步,等接住後再恢復正常 SOP 節奏。" : "上一個接回點已接住,這一層先順著當前 SOP step 往下帶,不要立刻重新打開完整分支。") : "中段最容易卡住,先縮到下一步,用短句接回目前 SOP step。",
              avoid: (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? (justReturnedFromWrapUp ? "不要一接回來就一次把後面整段都講完。" : "不要剛接住主線就立刻把孩子或家長拉回多入口、多判斷層。") : "不要把整段功課一次講完。",
            }
          : {
              mode: "先收尾,再接回下一步",
              theory: "REWARD × RESTART",
              focus: "先讓孩子感受到這輪有完成,再把主線接回下一步,不要直接散回各層。",
              avoid: "不要跳過結算直接開下一輪,也不要收尾完就散掉。",
            };
  const recommendedTransitionIds: Record<MissionPhase, string[]> = {
    ready: ["ready-check", "im-ready", "need-more-time"],
    challenge: ["calm-action", "im-ready"],
    sop: ["break-time", "need-more-time"],
    settle: [],
  };
  const recommendedSopIds: Record<MissionPhase, string[]> = {
    ready: ["task-starter"],
    challenge: ["task-starter", "task-boost"],
    sop: ["check-in", "adjust"],
    settle: ["finish-mode", "pack-up"],
  };
  const collectedBadgeCount = Object.values(collectedBadges).filter((item) => item.collected).length;
  const heroCollectionCount = Object.values(heroCollection).filter((item) => item.unlocked).length;
  const capturedGuardianCount = Object.values(guardianCatalog).filter((item) => item.status === "captured").length;
  const defeatedGuardianCount = Object.values(guardianCatalog).filter((item) => item.status !== "unknown").length;
  const rareGuardianCount = Object.values(guardianCatalog).filter((item) => item.status === "captured" && item.rarity !== "Common").length;
  const showcaseGuardian = guardianBeasts.find((item) => guardianCatalog[item.id]?.showcase) ?? guardianBeasts[0];
  const showcaseGuardianRecord = guardianCatalog[showcaseGuardian.id] ?? { beastId: showcaseGuardian.id, status: "unknown", defeatedCount: 0, title: "未命名守護獸", rarity: "Common", showcase: false, companion: false };
  const showcaseGuardianIsNewToday = showcaseGuardianRecord.status === "captured" && showcaseGuardianRecord.capturedAtDay === daysInSystem;
  const weeklyCompanionGuardian = guardianBeasts.find((item) => guardianCatalog[item.id]?.companion) ?? showcaseGuardian;
  const weeklyCompanionRecord = guardianCatalog[weeklyCompanionGuardian.id] ?? showcaseGuardianRecord;
  const coreGuardianBase = guardianBeasts.find((item) => item.id === coreGuardianId) ?? null;
  const coreGuardianCatalogRecord = coreGuardianBase ? (guardianCatalog[coreGuardianBase.id] ?? { beastId: coreGuardianBase.id, status: "captured", defeatedCount: 0, title: coreGuardianLine || coreGuardianBase.name, rarity: "Rare", showcase: false, companion: false }) : null;
  const coreGuardianStage = coreGuardianStageFromLevel(coreGuardianLevel);
  const coreGuardianStageKey = coreGuardianStage === "幼體" ? "stage1" : coreGuardianStage === "成長體" ? "stage2" : coreGuardianStage === "守護體" ? "stage3" : "stage4";
  const coreGuardianNextStageLevel = nextCoreGuardianStageTarget(coreGuardianLevel);
  const coreGuardianFeedRemaining = Math.max(0, coreGuardianWeeklyFeedTarget - coreGuardianWeeklyFeed);
  const coreGuardianFeedProgress = coreGuardianWeeklyFeedTarget > 0 ? Math.min(1, coreGuardianWeeklyFeed / coreGuardianWeeklyFeedTarget) : 0;
  const coreGuardianStageStartLevel = coreGuardianStage === "幼體" ? 1 : coreGuardianStage === "成長體" ? 11 : coreGuardianStage === "守護體" ? 31 : 61;
  const coreGuardianStageProgress = Math.min(1, (coreGuardianLevel - coreGuardianStageStartLevel) / Math.max(1, coreGuardianNextStageLevel - coreGuardianStageStartLevel));
  const currentGuardianWeekIndex = Math.max(1, Math.floor(Math.max(0, daysInSystem - 1) / 7) + 1);
  const coreGuardianStageImage = coreGuardianId ? coreGuardianStageImages[coreGuardianId as keyof typeof coreGuardianStageImages]?.[coreGuardianStageKey] : null;
  const coreGuardianArchetypeMeta = coreGuardianArchetype ? coreGuardianArchetypes.find((item) => item.id === coreGuardianArchetype) ?? null : null;
  const coreGuardianArchetypeImage = coreGuardianArchetype && coreGuardianStateVariant ? coreGuardianArchetypeImages[coreGuardianArchetype]?.[coreGuardianStateVariant] : null;
  const coreGuardianPreviewImage = coreGuardianArchetypeImage ?? coreGuardianStageImage ?? coreGuardianBase?.imageSource ?? showcaseGuardian.imageSource ?? selectedGuardian.imageSource ?? null;
  const coreGuardianHappyExpressionImage = coreGuardianArchetype ? coreGuardianHappyExpressionImages[coreGuardianArchetype] ?? null : null;
  const activeCoreGuardianPreviewImage = coreGuardianExpressionState === "feed-success"
    ? coreGuardianHappyExpressionImage ?? coreGuardianPreviewImage
    : coreGuardianPreviewImage;
  const activeCoreGuardianPreviewResizeMode = coreGuardianExpressionState === "feed-success" && coreGuardianHappyExpressionImage ? "contain" : "cover";
  const coreGuardianStateMeta = coreGuardianStateVariant ? coreGuardianStateVariantMeta[coreGuardianStateVariant] : null;
  const coreGuardianHeroIntro = coreGuardianArchetypeMeta
    ? `${coreGuardianArchetypeMeta.label}|${coreGuardianArchetypeMeta.shortLine}`
    : coreGuardianLine;
  const worldFeaturedImage = showcaseGuardian.imageSource ?? selectedGuardian.imageSource ?? childSceneImages.featuredMain;
  const worldCodexImage = showcaseGuardian.imageSource ?? selectedGuardian.imageSource ?? childSceneImages.codexTodayPage;

  const coreGuardianUseHint = coreGuardianStatus === "bonded"
    ? `牠現在已經不只是陪伴版入口,而是你的正式長期本命獸。先照顧牠,再慢慢把今天的主線跑穩。`
    : coreGuardianStateMeta
      ? `${coreGuardianStateMeta.label}:${coreGuardianStateMeta.line}`
      : "先讓牠陪你把今天的第一步走穩。";
  const coreGuardianCreatedAtDayEffective = coreGuardianCreatedAtDay ?? daysInSystem;
  const coreGuardianReselectDaysLeft = Math.max(0, 7 - Math.max(0, daysInSystem - coreGuardianCreatedAtDayEffective));
  const coreGuardianBondLabel = coreGuardianStatus === "bonded" ? `正式陪伴${coreGuardianBondedAtLevel ? `|Lv.${coreGuardianBondedAtLevel}` : ""}` : `先一起相處|${coreGuardianReselectDaysLeft} 天內可重選 ${Math.max(0, 1 - coreGuardianReselectsUsed)} 次`;
  const canReselectCoreGuardian = coreGuardianStatus === "provisional" && coreGuardianLevel < 10 && coreGuardianReselectsUsed < 1 && coreGuardianReselectDaysLeft > 0;
  const coreGuardianExpressionContextKey = [uiMode, missionPhase, showHomeDetails ? "home-open" : "home-closed", showWeeklyDetails ? "weekly-open" : "weekly-closed", showParentGuardianPanel ? "guardian-panel" : "guardian-hidden", showParentAssist ? "assist-open" : "assist-closed", showSupportTools ? "tools-open" : "tools-closed", coreGuardianCreationVisible ? "creation-open" : "creation-closed"].join("|");
  const childEntryTitle = "先選時間挑戰,再開始今天第一步";
  const childEntryGuideLine = "先做這一步就好。";
  const childStuckText = missionPhase === "ready" ? "進不去時先照這三步走。" : "卡住時先照這三步走。";
  const childStuckEntryOptions = [
    { id: "start" as SupportAssistScenario, label: "不想開始", shortLine: "先幫我進場。", mood: "慢慢來", cue: "IN", accent: "cool" as const },
    { id: "stuck" as SupportAssistScenario, label: "做到一半卡住", shortLine: "只給我下一步。", mood: "只看下一步", cue: "NEXT", accent: "focus" as const },
    { id: "emotion" as SupportAssistScenario, label: "情緒上來了", shortLine: "先陪我穩住。", mood: "先穩住", cue: "CALM", accent: "warm" as const },
  ];
  const parentSupportQuickLens: Record<SupportAssistScenario, { shortLine: string; actionLine: string }> = {
    start: { shortLine: "先幫我進場。", actionLine: "先進場" },
    emotion: { shortLine: "先陪我穩住。", actionLine: "先穩住" },
    stuck: { shortLine: "只給我下一步。", actionLine: "只接下一步" },
    restart: { shortLine: "先幫我接回。", actionLine: "先接回主線" },
    encourage: { shortLine: "先給我一點力。", actionLine: "先補一點力" },
    pause: { shortLine: "先讓我停一下。", actionLine: "先停一下" },
  };
  const childSupportFlowCards = [
    { id: "pause", title: "停一下", shortLine: "先停", cue: "SOS", accent: "warm" as const, image: childSceneImages.pauseHand, scenario: "pause" as SupportAssistScenario },
    { id: "regulate", title: "穩一下", shortLine: "先穩", cue: "CALM", accent: "warm" as const, image: childSceneImages.selfRegulate, scenario: "emotion" as SupportAssistScenario },
    { id: "help", title: "找幫助", shortLine: "跟我來", cue: "SOS", accent: "support" as const, image: childSceneImages.guidedHelpFinal, scenario: null as SupportAssistScenario | null },
  ];
  const renderChildCue = (cue: string, tone: "primary" | "support" | "task" | "cool" | "focus" | "warm") => {
    const asset = childCueIconImages[cue];
    const readableLabel = childCueReadableLabels[cue];
    return (
      <View style={styles.childCueWrap}>
        <View
          style={[
            styles.childCueBubble,
            tone === "primary"
              ? styles.childCueBubblePrimary
              : tone === "support"
                ? styles.childCueBubbleSupport
                : tone === "task"
                  ? styles.childCueBubbleTask
                  : tone === "cool"
                    ? styles.childCueBubbleCool
                    : tone === "focus"
                      ? styles.childCueBubbleFocus
                      : styles.childCueBubbleWarm,
          ]}
        >
          {asset ? <Image source={asset} style={styles.childCueBubbleImage} resizeMode="contain" /> : <Text style={styles.childCueBubbleText}>{cue}</Text>}
        </View>
        {readableLabel ? <Text style={styles.childCueLabel}>{readableLabel}</Text> : null}
      </View>
    );
  };
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPhoneLayout = windowWidth < 480;
  const mainContentWidth = Math.min(Math.max(windowWidth - (isPhoneLayout ? 32 : 108), 280), 720);
  const draftCoreGuardianPreview = coreGuardianRecommendedArchetype && coreGuardianRecommendedState
    ? buildCoreGuardianArchetypeDraft(coreGuardianRecommendedArchetype, coreGuardianRecommendedState)
    : null;
  const draftCoreGuardianStage1Image = draftCoreGuardianPreview ? coreGuardianArchetypeImages[coreGuardianRecommendedArchetype as keyof typeof coreGuardianArchetypeImages]?.[coreGuardianRecommendedState as CoreGuardianStateVariant] ?? coreGuardianStageImages[draftCoreGuardianPreview.beast.id as keyof typeof coreGuardianStageImages]?.stage1 : null;
  const recommendedCoreGuardianMeta = coreGuardianRecommendedArchetype ? coreGuardianArchetypes.find((item) => item.id === coreGuardianRecommendedArchetype) ?? null : null;
  const getCreationPreviewLayout = useCallback((imageSource?: ImageSourcePropType | null) => {
    let aspectRatio = 0.72;

    try {
      const resolved = imageSource && typeof Image.resolveAssetSource === "function"
        ? Image.resolveAssetSource(imageSource)
        : null;
      const directSource = imageSource && !Array.isArray(imageSource) && typeof imageSource === "object"
        ? imageSource as { width?: number; height?: number }
        : null;
      const resolvedWidth = resolved?.width ?? directSource?.width;
      const resolvedHeight = resolved?.height ?? directSource?.height;

      if (resolvedWidth && resolvedHeight) {
        aspectRatio = resolvedWidth / resolvedHeight;
      }
    } catch {
      aspectRatio = 0.72;
    }

    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      aspectRatio = 0.72;
    }

    const availableWidth = Math.max(220, windowWidth - 120);
    const maxHeight = Math.max(300, Math.min(520, windowHeight * 0.5));
    const minHeight = 240;
    const targetHeight = Math.max(minHeight, Math.min(maxHeight, availableWidth / aspectRatio));

    return {
      height: targetHeight,
      maxHeight,
    };
  }, [windowHeight, windowWidth]);
  const secondaryCoreGuardianMeta = coreGuardianSecondaryArchetype ? coreGuardianArchetypes.find((item) => item.id === coreGuardianSecondaryArchetype) ?? null : null;
  const guardianWorldStage = capturedGuardianCount > 0 ? "已收服" : guardianEncounterWindowActive ? "限時可挑戰" : guardianTraces > 0 ? "已留痕" : "待開門";
  const guardianWorldStageHint = capturedGuardianCount > 0 ? "你已經把世界裡的一部分真正收進圖鑑。" : guardianEncounterWindowActive ? `世界目前開著一個限時挑戰窗口,還剩 ${guardianEncounterDaysLeft} 天。你要在窗口關閉前決定要不要進場。` : guardianTraces > 0 ? "世界已經留下痕跡,再往前一步就能靠近挑戰資格。" : "先把今天主線跑穩,世界會慢慢開始回應你。";
  const guardianWorldNextAction = guardianEncounterWindowActive
    ? {
        title: "把資格轉成挑戰",
        text: `你現在有 ${guardianChallengeTokens} 個挑戰資格,而且限時窗口還剩 ${guardianEncounterDaysLeft} 天。下一步就是決定要不要用掉這次機會。`,
        button: "現在去挑戰",
        action: "challenge",
      }
    : guardianTraces > 0
      ? {
          title: "把痕跡推成資格",
          text: `你現在已留下 ${guardianTraces} 個痕跡,下一步是再往前推,讓世界線索轉成正式挑戰資格。`,
          button: "再抽世界線索",
          action: "trace",
        }
      : {
          title: "先打開世界的第一道門",
          text: "你現在還沒有新的痕跡。先把今天主線跑穩,最後再回來抽一張世界事件,讓世界開始回應你。",
          button: "抽世界事件",
          action: "event",
        };
  const guardianWorldEntryTitle = guardianEncounterWindowActive
    ? "你剛剛已經把世界門打開了。"
    : guardianTraces > 0 || capturedGuardianCount > 0
      ? "你剛剛真的有東西被世界留下來。"
      : "做完這一輪後,世界會替你留下痕跡。";
  const guardianWorldEntryLead = guardianEncounterWindowActive
    ? "先去看這次開出來的門,看看能不能把資格變成真正挑戰。"
    : capturedGuardianCount > 0
      ? `你已經收進 ${capturedGuardianCount} 隻守護獸,先去看這次最新被留下來的那一頁。`
      : guardianTraces > 0
        ? `你已經留下 ${guardianTraces} 個痕跡,先去看世界這次回了你什麼。`
        : "先把主線走穩,之後再回來看這一輪替你留下了什麼。";
  const summonTokenReady = toolCardInventory.owned >= toolCardInventory.summonCostTools;
  const nextHeroUpgradeAt = heroUpgradeLevel === 0 ? 10 : heroUpgradeLevel === 1 ? 20 : heroUpgradeLevel === 2 ? 35 : 50;
  const selectedGuardianStageIndex = selectedGuardian.stages.reduce((acc, stage, index) => {
    if (selectedGuardianProgress.orbs >= stage.cost) return index;
    return acc;
  }, -1);
  const nextGuardianStage = selectedGuardian.stages[selectedGuardianStageIndex + 1] ?? null;
  const effectiveCurrentStep = missionPhase === "settle"
    ? Math.max(0, sopCards.findIndex((card) => card.id === (settleChecklist.packupReady ? "pack-up" : "finish-mode")))
    : currentStep;
  const activeSopCard = sopCards[effectiveCurrentStep] ?? sopCards[0];
  const nextSopCard = sopCards[Math.min(effectiveCurrentStep + 1, sopCards.length - 1)] ?? activeSopCard;
  const missionSopFlowCards = sopCards;
  const selectedMissionStep = Math.max(0, Math.min(missionSopFlowCards.length - 1, selectedMissionSopIndex ?? effectiveCurrentStep));
  const selectedMissionSopCard = missionSopFlowCards[selectedMissionStep] ?? activeSopCard;
  const selectedMissionNextSopCard = missionSopFlowCards[Math.min(selectedMissionStep + 1, missionSopFlowCards.length - 1)] ?? selectedMissionSopCard;
  const visibleRecommendedSopIds = (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0) ? [activeSopCard.id] : recommendedSopIds[missionPhase];
  const getSopGoalLine = (card: ToolCard) => card.id === "task-starter"
    ? "先跨出第一步,不一次想完整段。"
    : card.id === "task-boost"
      ? "先把這段再多撐一下,不急著跳走。"
      : card.id === "check-in"
        ? "先確認目前做到哪裡,再決定下一步。"
        : card.id === "adjust"
          ? "先把卡住的地方調回來,不把它當失敗。"
          : card.id === "finish-mode"
            ? "先把這一段完整收完,不留半截。"
            : "先把這輪好好收住,再順著回主線。";
  const activeSopGoalLine = getSopGoalLine(activeSopCard);
  const selectedMissionSopGoalLine = getSopGoalLine(selectedMissionSopCard);
  const activeSopNextLine = missionPhase === "settle"
    ? (settleChecklist.packupReady ? `這輪收好後,會回到 ${lastBlockedStep && nextSopCard.title === lastBlockedStep ? "原本卡住的那一步" : nextSopCard.title}。` : "先把這輪收完整,再順著接回主線。")
    : (justReturnedFromWrapUp || postWrapUpContinuationSteps > 0)
      ? (justReturnedFromWrapUp ? `把這一步接住後,下一步會往 ${nextSopCard.title}。` : `這一步順走後,會接到 ${nextSopCard.title}。`)
      : effectiveCurrentStep >= sopCards.length - 1
        ? "這一步做完後,就把這輪正式收好。"
        : `這一步做完後,下一步會到 ${nextSopCard.title}。`;
  const selectedMissionSopNextLine = missionPhase === "settle"
    ? (settleChecklist.packupReady ? `這輪收好後,會回到 ${lastBlockedStep && selectedMissionNextSopCard.title === lastBlockedStep ? "原本卡住的那一步" : selectedMissionNextSopCard.title}。` : "先把這輪收完整,再順著接回主線。")
    : selectedMissionStep >= missionSopFlowCards.length - 1
      ? "這一步做完後,就把這輪正式收好。"
      : `這一步做完後,下一步會到 ${selectedMissionNextSopCard.title}。`;
  const defaultSupportScenario: SupportAssistScenario = missionPhase === "ready"
    ? "start"
    : missionPhase === "challenge"
      ? "pause"
      : "stuck";
  const missionCompanionPresenceLine = coreGuardianStatus === "bonded"
    ? `${coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 現在正陪你跑這一輪,不是站在旁邊看。`
    : `${coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 正在旁邊陪你把這一步走完,等你一起回到主線。`;
  const missionCompanionSupportLine = coreGuardianStatus === "bonded"
    ? "如果現在有點亂,先穩一下,再讓牠陪你把這一輪走完。你不是離開流程,只是先讓牠陪你接住。"
    : "如果現在有點亂,先停一下,再跟牠一起回來。這不是重開,只是先把你接住。";
  const settleCompanionLine = coreGuardianStatus === "bonded"
    ? `${coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 也會陪你把這輪收好,等一下再一起回主線。`
    : `${coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 先陪你把這輪收住,等一下再一起回到下一步。`;
  const currentRuleConfig = useMemo<RuleConfigSnapshot>(
    () => ({
      preset: activePreset,
      baselinePreset,
      dailyMissionCap,
      worldEventCap,
      exceptionCap,
      stage2UnlockDays,
    }),
    [activePreset, baselinePreset, dailyMissionCap, worldEventCap, exceptionCap, stage2UnlockDays]
  );
  const presetDrift = useMemo(() => {
    const matchesBalanced = dailyMissionCap === 5 && worldEventCap === 5 && exceptionCap === 3 && stage2UnlockDays === 7;
    const matchesConservative = dailyMissionCap === 4 && worldEventCap === 3 && exceptionCap === 2 && stage2UnlockDays === 8;
    const matchesRelaxed = dailyMissionCap === 6 && worldEventCap === 6 && exceptionCap === 4 && stage2UnlockDays === 6;
    const matchesChallenge = dailyMissionCap === 5 && worldEventCap === 4 && exceptionCap === 2 && stage2UnlockDays === 5;
    const matchesActivePreset =
      (activePreset === "balanced" && matchesBalanced) ||
      (activePreset === "conservative" && matchesConservative) ||
      (activePreset === "relaxed" && matchesRelaxed) ||
      (activePreset === "challenge" && matchesChallenge);

    return {
      dirty: !matchesActivePreset,
      label: matchesBalanced
        ? "平衡版"
        : matchesConservative
          ? "保守版"
          : matchesRelaxed
            ? "寬鬆版"
            : matchesChallenge
              ? "高挑戰版"
              : "自訂版",
    };
  }, [activePreset, dailyMissionCap, worldEventCap, exceptionCap, stage2UnlockDays]);
  const settleReadyCount = Object.values(settleChecklist).filter(Boolean).length;
  const settleSummary = useMemo(
    () =>
      missionStartSnapshot
        ? {
            orbDelta: orbs - missionStartSnapshot.orbs,
            bonusDelta: bonusOrbs - missionStartSnapshot.bonusOrbs,
            traceDelta: guardianTraces - missionStartSnapshot.guardianTraces,
            challengeTokenDelta: guardianChallengeTokens - missionStartSnapshot.guardianChallengeTokens,
            worldEventDelta: worldEventsDrawnToday - missionStartSnapshot.worldEventsDrawnToday,
            missionClearDelta: totalMissionClears - missionStartSnapshot.totalMissionClears,
            guardianOrbDelta: selectedGuardianProgress.orbs - missionStartSnapshot.selectedGuardianOrbs,
            weeklyHeroUsesDelta: missionStartSnapshot.weeklyHeroUsesLeft - weeklyHero.usesLeft,
            badgeDelta: collectedBadgeCount - missionStartSnapshot.collectedBadgeCount,
            heroUpgradeDelta: heroUpgradeLevel - missionStartSnapshot.heroUpgradeLevel,
            extraTimeDelta: extraTimeRequestsToday - missionStartSnapshot.extraTimeRequestsToday,
            breakDelta: breakCountToday - missionStartSnapshot.breakCountToday,
            restartDelta: restartCountToday - missionStartSnapshot.restartCountToday,
          }
        : null,
    [
      missionStartSnapshot,
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      worldEventsDrawnToday,
      totalMissionClears,
      selectedGuardianProgress.orbs,
      weeklyHero.usesLeft,
      collectedBadgeCount,
      heroUpgradeLevel,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
    ]
  );
  const missionObservation = settleSummary
    ? {
        outcome: settleSummary.extraTimeDelta > 0 || settleSummary.breakDelta > 0 || settleSummary.restartDelta > 0 ? "rescued" : "smooth",
        mostUsedBranch:
          settleSummary.extraTimeDelta >= settleSummary.breakDelta && settleSummary.extraTimeDelta >= settleSummary.restartDelta
            ? settleSummary.extraTimeDelta > 0
              ? "需要更多時間"
              : null
            : settleSummary.breakDelta >= settleSummary.restartDelta
              ? settleSummary.breakDelta > 0
                ? "短暫休息"
                : null
              : settleSummary.restartDelta > 0
                ? "重新接回"
                : null,
      }
    : null;
  const missionReportLines = settleSummary
    ? [
        `本輪結果:${lastMissionOutcome === "smooth" ? "順利完成" : lastMissionOutcome === "rescued" ? "補救後完成" : "中途中止"}`,
        `卡點位置:${lastBlockedStep ?? "本輪沒有明顯卡點"}`,
        `補救工具:${mostUsedTool ?? "本輪未使用補救工具"}`,
        `能量球變化:+${settleSummary.orbDelta}|Bonus ${settleSummary.bonusDelta >= 0 ? `+${settleSummary.bonusDelta}` : settleSummary.bonusDelta}`,
        `流程分支:延長 ${settleSummary.extraTimeDelta} 次|短休 ${settleSummary.breakDelta} 次|重接 ${settleSummary.restartDelta} 次`,
        `長期推進:守護獸 ${settleSummary.guardianOrbDelta >= 0 ? `+${settleSummary.guardianOrbDelta}` : settleSummary.guardianOrbDelta}|徽章 ${settleSummary.badgeDelta >= 0 ? `+${settleSummary.badgeDelta}` : settleSummary.badgeDelta}|升階 ${settleSummary.heroUpgradeDelta >= 0 ? `+${settleSummary.heroUpgradeDelta}` : settleSummary.heroUpgradeDelta}`,
        `下輪建議:${missionObservation?.mostUsedBranch ? `優先注意「${missionObservation.mostUsedBranch}」是否再次出現。` : "可先維持標準流程,再觀察是否需要補救分支。"}`,
      ]
    : [];
  const historyStats = useMemo(() => {
    if (missionHistory.length === 0) {
      return {
        smoothCount: 0,
        rescuedCount: 0,
        stoppedCount: 0,
        topBlockedStep: null as string | null,
        topRescueTool: null as string | null,
      };
    }

    const blockedMap = new Map<string, number>();
    const toolMap = new Map<string, number>();
    let smoothCount = 0;
    let rescuedCount = 0;
    let stoppedCount = 0;

    for (const entry of missionHistory) {
      if (entry.outcome === "smooth") smoothCount += 1;
      else if (entry.outcome === "rescued") rescuedCount += 1;
      else stoppedCount += 1;

      if (entry.blockedStep) blockedMap.set(entry.blockedStep, (blockedMap.get(entry.blockedStep) ?? 0) + 1);
      if (entry.rescueTool) toolMap.set(entry.rescueTool, (toolMap.get(entry.rescueTool) ?? 0) + 1);
    }

    const topBlockedStep = [...blockedMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topRescueTool = [...toolMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return { smoothCount, rescuedCount, stoppedCount, topBlockedStep, topRescueTool };
  }, [missionHistory]);
  const presetPerformance = useMemo(() => {
    const result: Record<RulePreset, { total: number; smooth: number; rescued: number; stopped: number }> = {
      conservative: { total: 0, smooth: 0, rescued: 0, stopped: 0 },
      balanced: { total: 0, smooth: 0, rescued: 0, stopped: 0 },
      relaxed: { total: 0, smooth: 0, rescued: 0, stopped: 0 },
      challenge: { total: 0, smooth: 0, rescued: 0, stopped: 0 },
    };

    for (const entry of missionHistory) {
      const bucket = result[entry.preset];
      bucket.total += 1;
      if (entry.outcome === "smooth") bucket.smooth += 1;
      else if (entry.outcome === "rescued") bucket.rescued += 1;
      else bucket.stopped += 1;
    }

    return result;
  }, [missionHistory]);
  const presetRecommendation = useMemo(() => {
    const candidates = (["conservative", "balanced", "relaxed", "challenge"] as RulePreset[])
      .map((preset) => {
        const item = presetPerformance[preset];
        const total = item.total;
        const smoothRate = total > 0 ? item.smooth / total : 0;
        const rescuedRate = total > 0 ? item.rescued / total : 0;
        const stoppedRate = total > 0 ? item.stopped / total : 0;
        return {
          preset,
          total,
          smoothRate,
          rescuedRate,
          stoppedRate,
          score: smoothRate * 100 - rescuedRate * 25 - stoppedRate * 60,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) {
      return {
        label: "尚無建議",
        reason: "目前各 preset 的樣本還不夠,先累積幾輪再比較哪套規則最穩。",
      };
    }

    const best = candidates[0];
    const presetLabel =
      best.preset === "conservative"
        ? "保守版"
        : best.preset === "balanced"
          ? "平衡版"
          : best.preset === "relaxed"
            ? "寬鬆版"
            : "高挑戰版";

    return {
      label: presetLabel,
      reason: `${presetLabel} 目前在 ${best.total} 輪測試中表現最佳,順利完成率 ${Math.round(best.smoothRate * 100)}%,補救完成率 ${Math.round(best.rescuedRate * 100)}%,中途中止率 ${Math.round(best.stoppedRate * 100)}%。`,
    };
  }, [presetPerformance]);

  const testingConclusion = useMemo(() => {
    if (missionHistory.length < 2) {
      return {
        level: "觀察中",
        summary: "目前測試輪數還不夠,先累積更多樣本再判斷規則鬆緊。",
      };
    }

    const rescueRate = missionHistory.length === 0 ? 0 : historyStats.rescuedCount / missionHistory.length;
    const stopRate = missionHistory.length === 0 ? 0 : historyStats.stoppedCount / missionHistory.length;

    if (stopRate >= 0.3) {
      return {
        level: "偏硬",
        summary: `中途中止比例偏高,代表目前規則對 Holton 可能太硬。建議先降低壓力,優先調整任務上限或補救上限。`,
      };
    }

    if (rescueRate >= 0.5) {
      return {
        level: "補救依賴偏高",
        summary: `超過一半的完成要靠補救分支,代表主流程還不夠順。優先檢查 ${historyStats.topBlockedStep ?? "主要卡點"} 與 ${historyStats.topRescueTool ?? "主要補救工具"}。`,
      };
    }

    if (activePreset === "relaxed" && historyStats.smoothCount >= Math.max(2, missionHistory.length - 1)) {
      return {
        level: "可逐步收緊",
        summary: "目前在寬鬆版下完成率不錯,可以逐步往平衡版回調,測試孩子是否仍能穩定完成。",
      };
    }

    if (activePreset === "challenge" && historyStats.smoothCount >= historyStats.rescuedCount) {
      return {
        level: "挑戰可承受",
        summary: "高挑戰版下仍能維持一定完成率,代表 Holton 對當前規則有一定承受力,可再細修卡點而非整體放鬆。",
      };
    }

    return {
      level: "相對平衡",
      summary: "目前規則沒有明顯過硬或過鬆,建議持續累積更多輪數,再依卡點與補救依賴度微調。",
    };
  }, [missionHistory, historyStats, activePreset]);

  const applyRulePreset = (preset: RulePreset) => {
    if (preset === "conservative") {
      applyRuleConfigSnapshot({ preset, baselinePreset, dailyMissionCap: 4, worldEventCap: 3, exceptionCap: 2, stage2UnlockDays: 8 });
      setMessage("已切到保守版規則:節奏較穩,事件與補救都比較保守。");
      return;
    }

    if (preset === "relaxed") {
      applyRuleConfigSnapshot({ preset, baselinePreset, dailyMissionCap: 6, worldEventCap: 6, exceptionCap: 4, stage2UnlockDays: 6 });
      setMessage("已切到寬鬆版規則:容錯較高,適合先建立成功經驗。");
      return;
    }

    if (preset === "challenge") {
      applyRuleConfigSnapshot({ preset, baselinePreset, dailyMissionCap: 5, worldEventCap: 4, exceptionCap: 2, stage2UnlockDays: 5 });
      setMessage("已切到高挑戰版規則:補救較少,較適合測試承受力與節奏穩定性。");
      return;
    }

    applyRuleConfigSnapshot({ preset, baselinePreset, dailyMissionCap: 5, worldEventCap: 5, exceptionCap: 3, stage2UnlockDays: 7 });
    setMessage("已切到平衡版規則:目前作為標準測試基準。");
  };

  const lockCurrentPresetAsBaseline = () => {
    setBaselinePreset(activePreset);
    setMessage(`已將${presetLabel(activePreset)}鎖定為目前測試基準版。`);
  };

  const adjustRuleValue = (field: "dailyMissionCap" | "worldEventCap" | "exceptionCap" | "stage2UnlockDays", delta: number) => {
    if (field === "dailyMissionCap") {
      setDailyMissionCap((prev) => clampRange(prev + delta, 3, 8));
      return;
    }
    if (field === "worldEventCap") {
      setWorldEventCap((prev) => clampRange(prev + delta, 1, 8));
      return;
    }
    if (field === "exceptionCap") {
      setExceptionCap((prev) => clampRange(prev + delta, 1, 6));
      return;
    }
    setStage2UnlockDays((prev) => clampRange(prev + delta, 3, 14));
  };

  const testingRecommendation = useMemo(() => {
    if (testingConclusion.level === "偏硬") {
      return {
        label: "改用寬鬆版",
        preset: "relaxed" as RulePreset,
        hint: "先降低壓力,確認主流程是否能更順地跑完。",
      };
    }

    if (testingConclusion.level === "補救依賴偏高") {
      return {
        label: "切回平衡版",
        preset: "balanced" as RulePreset,
        hint: "先回到標準基準,再觀察是不是主流程本身需要調整。",
      };
    }

    if (testingConclusion.level === "可逐步收緊") {
      return {
        label: "改用平衡版",
        preset: "balanced" as RulePreset,
        hint: "在寬鬆版順利後,下一步應該測試孩子能否承接更標準的節奏。",
      };
    }

    if (testingConclusion.level === "挑戰可承受") {
      return {
        label: "保留高挑戰版",
        preset: "challenge" as RulePreset,
        hint: "目前不必急著放鬆規則,先把卡點微調清楚。",
      };
    }

    return {
      label: "保留平衡版",
      preset: "balanced" as RulePreset,
      hint: "目前沒有明顯失衡,先維持基準規則,繼續累積樣本。",
    };
  }, [testingConclusion.level]);

  useEffect(() => {
    setDailyMissionCap((prev) => clampRange(prev, 3, 8));
    setWorldEventCap((prev) => clampRange(prev, 1, 8));
    setExceptionCap((prev) => clampRange(prev, 1, 6));
    setStage2UnlockDays((prev) => clampRange(prev, 3, 14));
  }, []);

  const scenarioReview = useMemo(() => {
    const totalExceptions = extraTimeRequestsToday + breakCountToday + restartCountToday;
    const pressure = exceptionCap === 0 ? 0 : totalExceptions / Math.max(exceptionCap, 1);

    if (lastMissionOutcome === "stopped") {
      return {
        level: "先救流程",
        summary: "本輪已中止,先不要急著追求更高挑戰,先把卡點和補救入口釐清。",
        action: `下一輪先改用 ${presetLabel(activePreset === "challenge" ? "balanced" : "relaxed")},並把 ${lastBlockedStep ?? "主要卡點"} 做成第一個觀察點。`,
      };
    }

    if (pressure >= 1) {
      return {
        level: "補救快見頂",
        summary: "本輪補救次數已貼近上限,代表規則或情境需要再鬆一點。",
        action: "先減少任務壓力或提高補救容忍度,再測一次同情境確認是否穩定。",
      };
    }

    if (lastMissionOutcome === "rescued") {
      return {
        level: "可重跑驗證",
        summary: "本輪是補救後完成,適合直接重播同情境,看補救是否仍落在同一卡點。",
        action: `保留 ${scenarioKindLabel(lastScenarioKind)},優先比較 ${mostUsedTool ?? "補救工具"} 是否再次出現。`,
      };
    }

    return {
      level: "可以加壓",
      summary: "本輪相對平順,可拿來做基準樣本或逐步加壓。",
      action: `先鎖定 ${presetLabel(activePreset)} 當對照,再切到 ${presetLabel(activePreset === "balanced" ? "challenge" : "balanced")} 做下一輪比較。`,
    };
  }, [activePreset, exceptionCap, extraTimeRequestsToday, breakCountToday, restartCountToday, lastMissionOutcome, lastBlockedStep, lastScenarioKind, mostUsedTool]);

  const scenarioHealth = useMemo(() => {
    const warnings: string[] = [];
    if (missionsDoneToday > dailyMissionCap + extraMissionSlots) {
      warnings.push("今日完成數已高於可用任務上限,建議先重置或調整樣本。");
    }
    if (worldEventsDrawnToday > worldEventCap) {
      warnings.push("世界事件記錄已高於上限,這輪比較可能失真。");
    }
    if (extraTimeRequestsToday > exceptionCap || breakCountToday > exceptionCap || restartCountToday > exceptionCap) {
      warnings.push("例外分支計數超過上限,先回到合法範圍再比較。");
    }
    if (selectedChallenge.minutes >= 20 && focusPower < 35) {
      warnings.push("長時間挑戰搭配較低專注力,容易把規則問題和體力問題混在一起。");
    }

    return warnings;
  }, [missionsDoneToday, dailyMissionCap, extraMissionSlots, worldEventsDrawnToday, worldEventCap, extraTimeRequestsToday, breakCountToday, restartCountToday, exceptionCap, selectedChallenge.minutes, focusPower]);

  const compareInsights = useMemo(
    () =>
      (["conservative", "balanced", "relaxed", "challenge"] as RulePreset[]).map((preset) => {
        const item = presetPerformance[preset];
        const smoothRate = item.total ? Math.round((item.smooth / item.total) * 100) : 0;
        const stoppedRate = item.total ? Math.round((item.stopped / item.total) * 100) : 0;
        const confidence = item.total >= 3 ? "樣本較穩" : item.total >= 1 ? "先看趨勢" : "尚未取樣";
        return {
          preset,
          smoothRate,
          stoppedRate,
          confidence,
        };
      }),
    [presetPerformance]
  );

  const reviewChecklist = useMemo(() => {
    const items = [
      `先確認本輪是否保留 ${scenarioNameDraft.trim() || scenarioKindLabel(lastScenarioKind)} 作為下次重跑基準。`,
      `回頭檢查卡點「${lastBlockedStep ?? "無明顯卡點"}」是不是其實來自規則過硬而非孩子狀態。`,
      `比較 ${presetLabel(activePreset)} 與 ${presetLabel(baselinePreset)} 的差異,避免只看單輪情緒。`,
    ];

    if (mostUsedTool) {
      items.push(`補救工具以「${mostUsedTool}」為主,下一輪先觀察它是否再次出現。`);
    }

    if (scenarioHealth.length) {
      items.push(`先修正測試參數:${scenarioHealth[0]}`);
    }

    return items;
  }, [scenarioNameDraft, lastScenarioKind, lastBlockedStep, activePreset, baselinePreset, mostUsedTool, scenarioHealth]);

  const recentTrend = useMemo(() => {
    const recent = experimentRuns.slice(0, 3);
    if (recent.length < 2) return "樣本不足,先累積最近 2~3 輪。";
    const stoppedRuns = recent.filter((item) => item.outcome === "stopped").length;
    const rescuedRuns = recent.filter((item) => item.outcome === "rescued").length;
    if (stoppedRuns >= 1) return "最近 3 輪已出現中止,代表這組規則可能正在退化。";
    if (rescuedRuns >= 2) return "最近完成偏依賴補救,建議優先修主流程而不是繼續加壓。";
    return "最近趨勢相對穩定,可用這組情境繼續做對照。";
  }, [experimentRuns]);

  const baselineComparison = useMemo(() => {
    const activeMetrics = presetPerformance[activePreset];
    const baselineMetrics = presetPerformance[baselinePreset];
    const smoothGap = activeMetrics.smooth - baselineMetrics.smooth;
    const rescueGap = activeMetrics.rescued - baselineMetrics.rescued;
    const stopGap = activeMetrics.stopped - baselineMetrics.stopped;
    return {
      smoothGap,
      rescueGap,
      stopGap,
      summary:
        activePreset === baselinePreset
          ? "目前就是基準版本身,這輪的價值在於累積穩定樣本。"
          : `${presetLabel(activePreset)} 相比 ${presetLabel(baselinePreset)}:順利 ${smoothGap >= 0 ? "+" : ""}${smoothGap}|補救 ${rescueGap >= 0 ? "+" : ""}${rescueGap}|中止 ${stopGap >= 0 ? "+" : ""}${stopGap}`,
    };
  }, [presetPerformance, activePreset, baselinePreset]);
  const failureAnalysis = useMemo(() => {
    const riskyRuns = experimentRuns.filter((run) => run.outcome !== "smooth");
    if (riskyRuns.length === 0) {
      return {
        headline: "目前沒有高風險樣本",
        detail: "先持續用同一組基準重跑,把順利樣本累積到至少 3 輪。",
        items: [] as string[],
      };
    }

    const topBlocked = riskyRuns.reduce<Record<string, number>>((acc, run) => {
      const key = run.blockedStep ?? "未標記卡點";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topTool = riskyRuns.reduce<Record<string, number>>((acc, run) => {
      const key = run.rescueTool ?? "未使用補救工具";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const blockedWinner = Object.entries(topBlocked).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "未標記卡點";
    const toolWinner = Object.entries(topTool).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "未使用補救工具";
    return {
      headline: `高風險樣本 ${riskyRuns.length} 輪,主要卡在 ${blockedWinner}`,
      detail: `最常見補救是 ${toolWinner},代表這裡值得先做 failure-case SOP。`,
      items: riskyRuns.slice(0, 3).map((run) => `${run.scenarioName}|${outcomeLabel(run.outcome)}|${run.blockedStep ?? "未標記卡點"}`),
    };
  }, [experimentRuns]);
  const comparisonBoard = useMemo(
    () =>
      experimentRuns.slice(0, 4).map((run) => ({
        id: run.id,
        title: `${run.scenarioName}|${presetLabel(run.preset)}`,
        subtitle: `${scenarioKindLabel(run.scenarioKind)}|重現度 ${run.reproducibilityScore}`,
        detail: `${run.comparedToBaseline}|${run.actionLabel}`,
      })),
    [experimentRuns]
  );

  const scenarioTemplates = useMemo<TestingScenarioSnapshot[]>(() => [
    {
      id: "template-baseline",
      name: "基準平衡樣本",
      kind: "normal",
      note: "平衡 preset、標準挑戰、無指定事件。",
      challengeId: "mini-fighter",
      selectedHeroId: "focus-knight",
      selectedBeastId: "tidefin",
      taskPower: 30,
      emotionPower: 42,
      focusPower: 35,
      orbs: 12,
      bonusOrbs: 1,
      guardianTraces: 2,
      guardianChallengeTokens: 1,
      missionsDoneToday: 1,
      worldEventsDrawnToday: 1,
      extraTimeRequestsToday: 0,
      breakCountToday: 0,
      restartCountToday: 0,
      totalMissionClears: 9,
      daysInSystem: 7,
      stage2Unlocked: false,
      nextWorldEventId: null,
      ruleConfig: {
        preset: "balanced",
        baselinePreset: "balanced",
        dailyMissionCap: 5,
        worldEventCap: 5,
        exceptionCap: 3,
        stage2UnlockDays: 7,
      },
    },
    {
      id: "template-rescue",
      name: "補救依賴檢查",
      kind: "extra-time",
      note: "先放大延長需求,檢查例外分支是否合理。",
      challengeId: "turbo-knight",
      selectedHeroId: "restart-champion",
      selectedBeastId: "stoneback",
      taskPower: 28,
      emotionPower: 46,
      focusPower: 32,
      orbs: 14,
      bonusOrbs: 1,
      guardianTraces: 3,
      guardianChallengeTokens: 2,
      missionsDoneToday: 2,
      worldEventsDrawnToday: 1,
      extraTimeRequestsToday: 1,
      breakCountToday: 0,
      restartCountToday: 0,
      totalMissionClears: 11,
      daysInSystem: 8,
      stage2Unlocked: true,
      nextWorldEventId: "guardian-trace",
      ruleConfig: {
        preset: "relaxed",
        baselinePreset: "balanced",
        dailyMissionCap: 6,
        worldEventCap: 6,
        exceptionCap: 4,
        stage2UnlockDays: 6,
      },
    },
    {
      id: "template-pressure",
      name: "高壓承受測試",
      kind: "restart",
      note: "高挑戰版 + 重接流程,專門看是否會爆掉。",
      challengeId: "power-ranger",
      selectedHeroId: "mindsteel-ranger",
      selectedBeastId: "steel-eagle",
      taskPower: 38,
      emotionPower: 35,
      focusPower: 31,
      orbs: 18,
      bonusOrbs: 0,
      guardianTraces: 4,
      guardianChallengeTokens: 1,
      missionsDoneToday: 3,
      worldEventsDrawnToday: 2,
      extraTimeRequestsToday: 0,
      breakCountToday: 1,
      restartCountToday: 1,
      totalMissionClears: 15,
      daysInSystem: 9,
      stage2Unlocked: true,
      nextWorldEventId: "rest-event",
      ruleConfig: {
        preset: "challenge",
        baselinePreset: "balanced",
        dailyMissionCap: 5,
        worldEventCap: 4,
        exceptionCap: 2,
        stage2UnlockDays: 5,
      },
    },
  ], []);

  useEffect(() => {
    setBaselineLibrary((prev) => {
      if (prev.length > 0) return prev;
      return scenarioTemplates.slice(0, 2).map((template) => ({
        id: `baseline-${template.id}`,
        label: template.name,
        scenarioId: template.id,
        fingerprint: scenarioFingerprint(template),
        preset: template.ruleConfig.preset,
        scenarioKind: template.kind,
        note: template.note,
        source: "template" as const,
      }));
    });
  }, [scenarioTemplates]);

  useEffect(() => {
    if (!selectedBaselineId && baselineLibrary.length > 0) {
      setSelectedBaselineId(baselineLibrary[0].id);
    }
  }, [baselineLibrary, selectedBaselineId]);

  useEffect(() => {
    let mounted = true;

    const preloadAssets = async () => {
      const fallbackTimer = setTimeout(() => {
        if (mounted) setImageAssetsReady(true);
      }, 1500);

      try {
        await Asset.loadAsync(preloadImageModules);
      } catch (error) {
        console.warn("Holton image preload failed", error);
      } finally {
        clearTimeout(fallbackTimer);
        if (mounted) setImageAssetsReady(true);
      }
    };

    preloadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const snapshot = await loadPersistedAppState();
        if (!snapshot) {
          setStorageHydrated(true);
          return;
        }
        if (snapshot.uiMode) setUiMode(snapshot.uiMode);
        if (typeof snapshot.hasChosenInitialMode === "boolean") setHasChosenInitialMode(snapshot.hasChosenInitialMode);
        if (snapshot.childName) setChildName(snapshot.childName);
        if (snapshot.selectedChallengeId) setSelectedChallengeId(snapshot.selectedChallengeId);
        if (snapshot.selectedHeroId) setSelectedHeroId(snapshot.selectedHeroId);
        if (snapshot.selectedBeastId) setSelectedBeastId(snapshot.selectedBeastId);
        if (typeof snapshot.hasCoreGuardian === "boolean") setHasCoreGuardian(snapshot.hasCoreGuardian);
        if (snapshot.coreGuardianStatus) setCoreGuardianStatus(snapshot.coreGuardianStatus);
        if (snapshot.coreGuardianId !== undefined) setCoreGuardianId(snapshot.coreGuardianId ?? null);
        if (snapshot.coreGuardianName) setCoreGuardianName(snapshot.coreGuardianName);
        if (snapshot.coreGuardianLine) setCoreGuardianLine(snapshot.coreGuardianLine);
        if (snapshot.coreGuardianPersonalityChoice) setCoreGuardianPersonalityChoice(snapshot.coreGuardianPersonalityChoice);
        if (snapshot.coreGuardianElementChoice) setCoreGuardianElementChoice(snapshot.coreGuardianElementChoice);
        if (snapshot.coreGuardianColorChoice) setCoreGuardianColorChoice(snapshot.coreGuardianColorChoice);
        if (snapshot.coreGuardianArchetype !== undefined) setCoreGuardianArchetype(snapshot.coreGuardianArchetype ?? null);
        if (snapshot.coreGuardianStateVariant !== undefined) setCoreGuardianStateVariant(snapshot.coreGuardianStateVariant ?? null);
        if (typeof snapshot.coreGuardianLevel === "number") setCoreGuardianLevel(snapshot.coreGuardianLevel);
        if (typeof snapshot.coreGuardianWeeklyFeed === "number") setCoreGuardianWeeklyFeed(snapshot.coreGuardianWeeklyFeed);
        if (typeof snapshot.coreGuardianWeeklyFeedTarget === "number") setCoreGuardianWeeklyFeedTarget(snapshot.coreGuardianWeeklyFeedTarget);
        if (typeof snapshot.coreGuardianTotalFeed === "number") setCoreGuardianTotalFeed(snapshot.coreGuardianTotalFeed);
        if (typeof snapshot.coreGuardianWeekIndex === "number") setCoreGuardianWeekIndex(snapshot.coreGuardianWeekIndex);
        if (typeof snapshot.coreGuardianWeeklyCompletedCount === "number") setCoreGuardianWeeklyCompletedCount(snapshot.coreGuardianWeeklyCompletedCount);
        if (typeof snapshot.coreGuardianReselectsUsed === "number") setCoreGuardianReselectsUsed(snapshot.coreGuardianReselectsUsed);
        if (typeof snapshot.coreGuardianCreatedAtDay === "number") setCoreGuardianCreatedAtDay(snapshot.coreGuardianCreatedAtDay);
        if (typeof snapshot.coreGuardianBondedAtLevel === "number") setCoreGuardianBondedAtLevel(snapshot.coreGuardianBondedAtLevel);
        if (snapshot.sessionEnvironment) setSessionEnvironment(snapshot.sessionEnvironment);
        if (snapshot.operatorName) setOperatorName(snapshot.operatorName);
        if (snapshot.operatorRole) setOperatorRole(snapshot.operatorRole);
        if (snapshot.childContext) setChildContext(snapshot.childContext);
        if (snapshot.sessionLocation) setSessionLocation(snapshot.sessionLocation);
        if (snapshot.realMissionGoal) setRealMissionGoal(snapshot.realMissionGoal);
        if (snapshot.realSessionNoteDraft) setRealSessionNoteDraft(snapshot.realSessionNoteDraft);
        if (snapshot.assistLevelDraft) setAssistLevelDraft(snapshot.assistLevelDraft);
        if (snapshot.assistNoteDraft) setAssistNoteDraft(snapshot.assistNoteDraft);
        if (snapshot.interruptionKindDraft) setInterruptionKindDraft(snapshot.interruptionKindDraft);
        if (snapshot.interruptionNoteDraft) setInterruptionNoteDraft(snapshot.interruptionNoteDraft);
        if (snapshot.nextActionDraft) setNextActionDraft(snapshot.nextActionDraft);
        if (snapshot.realSessions) setRealSessions(snapshot.realSessions);
        if (snapshot.activeRealSessionId !== undefined) setActiveRealSessionId(snapshot.activeRealSessionId ?? null);
        if (snapshot.parentAssistLogs) setParentAssistLogs(snapshot.parentAssistLogs);
        if (snapshot.parentAssistArchives) setParentAssistArchives(snapshot.parentAssistArchives);
        if (snapshot.parentReviewWindowDays) setParentReviewWindowDays(snapshot.parentReviewWindowDays);
        if (snapshot.savedScenarios) setSavedScenarios(snapshot.savedScenarios);
        if (snapshot.baselineLibrary?.length) setBaselineLibrary(snapshot.baselineLibrary);
        if (snapshot.selectedBaselineId !== undefined) setSelectedBaselineId(snapshot.selectedBaselineId ?? null);
        if (snapshot.activeScenarioId !== undefined) setActiveScenarioId(snapshot.activeScenarioId ?? null);
        if (snapshot.scenarioNameDraft) setScenarioNameDraft(snapshot.scenarioNameDraft);
        if (snapshot.scenarioNoteDraft) setScenarioNoteDraft(snapshot.scenarioNoteDraft);
        if (snapshot.scenarioOperatorNote) setScenarioOperatorNote(snapshot.scenarioOperatorNote);
        if (snapshot.missionHistory) setMissionHistory(dedupeMissionHistory(snapshot.missionHistory));
        if (snapshot.experimentRuns) setExperimentRuns(dedupeExperimentRuns(snapshot.experimentRuns));
        if (snapshot.missionPhase) setMissionPhase(snapshot.missionPhase);
        if (typeof snapshot.running === "boolean") setRunning(snapshot.running);
        if (typeof snapshot.taskPower === "number") setTaskPower(snapshot.taskPower);
        if (typeof snapshot.emotionPower === "number") setEmotionPower(snapshot.emotionPower);
        if (typeof snapshot.focusPower === "number") setFocusPower(snapshot.focusPower);
        if (typeof snapshot.orbs === "number") setOrbs(snapshot.orbs);
        if (typeof snapshot.bonusOrbs === "number") setBonusOrbs(snapshot.bonusOrbs);
        if (typeof snapshot.guardianTraces === "number") setGuardianTraces(snapshot.guardianTraces);
        if (typeof snapshot.guardianChallengeTokens === "number") setGuardianChallengeTokens(snapshot.guardianChallengeTokens);
        if (typeof snapshot.guardianEncounterOpenedAtDay === "number") setGuardianEncounterOpenedAtDay(snapshot.guardianEncounterOpenedAtDay);
        if (snapshot.guardianEncounterOpenedAtDay === null) setGuardianEncounterOpenedAtDay(null);
        if (typeof snapshot.guardianEncounterExpiresAtDay === "number") setGuardianEncounterExpiresAtDay(snapshot.guardianEncounterExpiresAtDay);
        if (snapshot.guardianEncounterExpiresAtDay === null) setGuardianEncounterExpiresAtDay(null);
        if (snapshot.guardianEncounterSourceTitle !== undefined) setGuardianEncounterSourceTitle(snapshot.guardianEncounterSourceTitle ?? null);
        if (snapshot.guardianEncounterSourceFamily !== undefined) setGuardianEncounterSourceFamily(snapshot.guardianEncounterSourceFamily ?? null);
        if (typeof snapshot.missionsDoneToday === "number") setMissionsDoneToday(snapshot.missionsDoneToday);
        if (typeof snapshot.worldEventsDrawnToday === "number") setWorldEventsDrawnToday(snapshot.worldEventsDrawnToday);
        if (typeof snapshot.extraTimeRequestsToday === "number") setExtraTimeRequestsToday(snapshot.extraTimeRequestsToday);
        if (typeof snapshot.breakCountToday === "number") setBreakCountToday(snapshot.breakCountToday);
        if (typeof snapshot.restartCountToday === "number") setRestartCountToday(snapshot.restartCountToday);
        if (typeof snapshot.daysInSystem === "number") setDaysInSystem(snapshot.daysInSystem);
        if (typeof snapshot.totalMissionClears === "number") setTotalMissionClears(snapshot.totalMissionClears);
        if (typeof snapshot.stage2Unlocked === "boolean") setStage2Unlocked(snapshot.stage2Unlocked);
        if (snapshot.collectedBadges) setCollectedBadges(snapshot.collectedBadges);
        if (snapshot.heroCollection) setHeroCollection(snapshot.heroCollection);
        if (snapshot.toolCardInventory) setToolCardInventory(snapshot.toolCardInventory);
        if (snapshot.weeklyHero) setWeeklyHero(snapshot.weeklyHero);
        if (typeof snapshot.heroUpgradeLevel === "number") setHeroUpgradeLevel(snapshot.heroUpgradeLevel);
        if (snapshot.guardianProgress) setGuardianProgress(snapshot.guardianProgress);
        if (snapshot.guardianCatalog) setGuardianCatalog(snapshot.guardianCatalog);
        if (snapshot.activePreset) setActivePreset(snapshot.activePreset);
        if (snapshot.baselinePreset) setBaselinePreset(snapshot.baselinePreset);
        if (typeof snapshot.dailyMissionCap === "number") setDailyMissionCap(snapshot.dailyMissionCap);
        if (typeof snapshot.worldEventCap === "number") setWorldEventCap(snapshot.worldEventCap);
        if (typeof snapshot.exceptionCap === "number") setExceptionCap(snapshot.exceptionCap);
        if (typeof snapshot.stage2UnlockDays === "number") setStage2UnlockDays(snapshot.stage2UnlockDays);
        if (snapshot.nextWorldEventId !== undefined) setNextWorldEventId(snapshot.nextWorldEventId ?? null);
      } catch {
        setMessage("讀取本機 session 記錄失敗,先用目前記憶體中的狀態。");
      } finally {
        setStorageHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    const payload: PersistedAppState = {
      uiMode,
      hasChosenInitialMode,
      childName,
      selectedChallengeId,
      selectedHeroId,
      selectedBeastId,
      hasCoreGuardian,
      coreGuardianStatus,
      coreGuardianId,
      coreGuardianName,
      coreGuardianLine,
      coreGuardianPersonalityChoice,
      coreGuardianElementChoice,
      coreGuardianColorChoice,
      coreGuardianArchetype,
      coreGuardianStateVariant,
      coreGuardianLevel,
      coreGuardianWeeklyFeed,
      coreGuardianWeeklyFeedTarget,
      coreGuardianTotalFeed,
      coreGuardianWeekIndex,
      coreGuardianWeeklyCompletedCount,
      coreGuardianReselectsUsed,
      coreGuardianCreatedAtDay,
      coreGuardianBondedAtLevel,
      sessionEnvironment,
      operatorName,
      operatorRole,
      childContext,
      sessionLocation,
      realMissionGoal,
      realSessionNoteDraft,
      assistLevelDraft,
      assistNoteDraft,
      interruptionKindDraft,
      interruptionNoteDraft,
      nextActionDraft,
      realSessions,
      activeRealSessionId,
      parentAssistLogs,
      parentAssistArchives,
      parentReviewWindowDays,
      savedScenarios,
      baselineLibrary,
      selectedBaselineId,
      activeScenarioId,
      scenarioNameDraft,
      scenarioNoteDraft,
      scenarioOperatorNote,
      missionHistory,
      experimentRuns,
      missionPhase,
      running,
      taskPower,
      emotionPower,
      focusPower,
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      guardianEncounterOpenedAtDay,
      guardianEncounterExpiresAtDay,
      guardianEncounterSourceTitle,
      guardianEncounterSourceFamily,
      missionsDoneToday,
      worldEventsDrawnToday,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
      daysInSystem,
      totalMissionClears,
      stage2Unlocked,
      collectedBadges,
      heroCollection,
      toolCardInventory,
      weeklyHero,
      heroUpgradeLevel,
      guardianProgress,
      guardianCatalog,
      activePreset,
      baselinePreset,
      dailyMissionCap,
      worldEventCap,
      exceptionCap,
      stage2UnlockDays,
      nextWorldEventId,
    };

    savePersistedAppState(payload)
      .then(() => setLastSavedLabel(sessionTimestampLabel()))
      .catch(() => setMessage("本機自動儲存失敗,建議先手動匯出交班摘要。"));
  }, [
    storageHydrated,
    uiMode,
    hasChosenInitialMode,
    childName,
    selectedChallengeId,
    selectedHeroId,
    selectedBeastId,
    hasCoreGuardian,
    coreGuardianStatus,
    coreGuardianId,
    coreGuardianName,
    coreGuardianLine,
    coreGuardianPersonalityChoice,
    coreGuardianElementChoice,
    coreGuardianColorChoice,
    coreGuardianArchetype,
    coreGuardianStateVariant,
    coreGuardianLevel,
    coreGuardianWeeklyFeed,
    coreGuardianWeeklyFeedTarget,
    coreGuardianTotalFeed,
    coreGuardianWeekIndex,
    coreGuardianWeeklyCompletedCount,
    coreGuardianReselectsUsed,
    coreGuardianCreatedAtDay,
    coreGuardianBondedAtLevel,
    sessionEnvironment,
    operatorName,
    operatorRole,
    childContext,
    sessionLocation,
    realMissionGoal,
    realSessionNoteDraft,
    assistLevelDraft,
    assistNoteDraft,
    interruptionKindDraft,
    interruptionNoteDraft,
    nextActionDraft,
    realSessions,
    activeRealSessionId,
    parentAssistLogs,
    parentAssistArchives,
    parentReviewWindowDays,
    savedScenarios,
    baselineLibrary,
    selectedBaselineId,
    activeScenarioId,
    scenarioNameDraft,
    scenarioNoteDraft,
    scenarioOperatorNote,
    missionHistory,
    experimentRuns,
    missionPhase,
    running,
    taskPower,
    emotionPower,
    focusPower,
    orbs,
    bonusOrbs,
    guardianTraces,
    guardianChallengeTokens,
    guardianEncounterOpenedAtDay,
    guardianEncounterExpiresAtDay,
    guardianEncounterSourceTitle,
    guardianEncounterSourceFamily,
    missionsDoneToday,
    worldEventsDrawnToday,
    extraTimeRequestsToday,
    breakCountToday,
    restartCountToday,
    daysInSystem,
    totalMissionClears,
    stage2Unlocked,
    collectedBadges,
    heroCollection,
    toolCardInventory,
    weeklyHero,
    heroUpgradeLevel,
    guardianProgress,
    guardianCatalog,
    activePreset,
    baselinePreset,
    dailyMissionCap,
    worldEventCap,
    exceptionCap,
    stage2UnlockDays,
    nextWorldEventId,
  ]);

  const buildScenarioSnapshot = useCallback(
    (kind: ScenarioKind, id = `scenario-${Date.now()}`): TestingScenarioSnapshot => ({
      id,
      name: scenarioNameDraft.trim() || scenarioKindLabel(kind),
      kind,
      note: scenarioNoteDraft.trim() || "未填寫說明",
      challengeId: selectedChallengeId,
      selectedHeroId,
      selectedBeastId,
      taskPower,
      emotionPower,
      focusPower,
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      missionsDoneToday,
      worldEventsDrawnToday,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
      totalMissionClears,
      daysInSystem,
      stage2Unlocked,
      nextWorldEventId,
      ruleConfig: currentRuleConfig,
    }),
    [
      scenarioNameDraft,
      scenarioNoteDraft,
      selectedChallengeId,
      selectedHeroId,
      selectedBeastId,
      taskPower,
      emotionPower,
      focusPower,
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      missionsDoneToday,
      worldEventsDrawnToday,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
      totalMissionClears,
      daysInSystem,
      stage2Unlocked,
      nextWorldEventId,
      currentRuleConfig,
    ]
  );

  const currentScenarioSnapshot = useMemo(
    () => buildScenarioSnapshot(lastScenarioKind, activeScenarioId ?? "scenario-live"),
    [buildScenarioSnapshot, lastScenarioKind, activeScenarioId]
  );
  const currentScenarioFingerprint = useMemo(() => scenarioFingerprint(currentScenarioSnapshot), [currentScenarioSnapshot]);
  const currentScenarioReproducibility = useMemo(() => reproducibilityScore(currentScenarioSnapshot), [currentScenarioSnapshot]);
  const selectedBaseline = useMemo(() => baselineLibrary.find((item) => item.id === selectedBaselineId) ?? baselineLibrary[0] ?? null, [baselineLibrary, selectedBaselineId]);
  const selectedBaselineSnapshot = useMemo(() => {
    if (!selectedBaseline) return null;
    return savedScenarios.find((item) => item.id === selectedBaseline.scenarioId) ?? scenarioTemplates.find((item) => item.id === selectedBaseline.scenarioId) ?? null;
  }, [selectedBaseline, savedScenarios, scenarioTemplates]);
  const baselineDiffLines = useMemo(() => {
    if (!selectedBaselineSnapshot) return ["先建立或選一個 baseline,這裡才會顯示 drift。"];
    const lines: string[] = [];
    if (selectedBaselineSnapshot.challengeId !== currentScenarioSnapshot.challengeId) lines.push(`挑戰卡:${selectedBaselineSnapshot.challengeId} → ${currentScenarioSnapshot.challengeId}`);
    if (selectedBaselineSnapshot.selectedHeroId !== currentScenarioSnapshot.selectedHeroId) lines.push(`英雄:${selectedBaselineSnapshot.selectedHeroId} → ${currentScenarioSnapshot.selectedHeroId}`);
    if (selectedBaselineSnapshot.selectedBeastId !== currentScenarioSnapshot.selectedBeastId) lines.push(`守護獸:${selectedBaselineSnapshot.selectedBeastId} → ${currentScenarioSnapshot.selectedBeastId}`);
    if (selectedBaselineSnapshot.nextWorldEventId !== currentScenarioSnapshot.nextWorldEventId) lines.push(`事件鎖定:${selectedBaselineSnapshot.nextWorldEventId ?? "cycle"} → ${currentScenarioSnapshot.nextWorldEventId ?? "cycle"}`);
    if (selectedBaselineSnapshot.ruleConfig.preset !== currentScenarioSnapshot.ruleConfig.preset) lines.push(`preset:${presetLabel(selectedBaselineSnapshot.ruleConfig.preset)} → ${presetLabel(currentScenarioSnapshot.ruleConfig.preset)}`);
    if (
      selectedBaselineSnapshot.ruleConfig.dailyMissionCap !== currentScenarioSnapshot.ruleConfig.dailyMissionCap ||
      selectedBaselineSnapshot.ruleConfig.worldEventCap !== currentScenarioSnapshot.ruleConfig.worldEventCap ||
      selectedBaselineSnapshot.ruleConfig.exceptionCap !== currentScenarioSnapshot.ruleConfig.exceptionCap ||
      selectedBaselineSnapshot.ruleConfig.stage2UnlockDays !== currentScenarioSnapshot.ruleConfig.stage2UnlockDays
    ) {
      lines.push(
        `規則:任務 ${selectedBaselineSnapshot.ruleConfig.dailyMissionCap}/${currentScenarioSnapshot.ruleConfig.dailyMissionCap}|事件 ${selectedBaselineSnapshot.ruleConfig.worldEventCap}/${currentScenarioSnapshot.ruleConfig.worldEventCap}|補救 ${selectedBaselineSnapshot.ruleConfig.exceptionCap}/${currentScenarioSnapshot.ruleConfig.exceptionCap}|Stage2 ${selectedBaselineSnapshot.ruleConfig.stage2UnlockDays}/${currentScenarioSnapshot.ruleConfig.stage2UnlockDays}`
      );
    }
    return lines.length ? lines : ["目前 live scenario 與選中的 baseline 完全一致,可直接做 A/B 重播。"];
  }, [selectedBaselineSnapshot, currentScenarioSnapshot]);
  const filteredExperimentRuns = useMemo(() => {
    if (runReviewFilter === "smooth") return experimentRuns.filter((run) => run.outcome === "smooth");
    if (runReviewFilter === "risky") return experimentRuns.filter((run) => run.outcome !== "smooth");
    return experimentRuns;
  }, [experimentRuns, runReviewFilter]);
  const failurePlaybook = useMemo(() => {
    if (historyStats.stoppedCount === 0 && historyStats.rescuedCount === 0) {
      return ["先維持基準情境,累積 3 輪順利完成後再開始加壓。"];
    }
    const items = [] as string[];
    if (historyStats.topBlockedStep) items.push(`把「${historyStats.topBlockedStep}」寫成單獨觀察點,下一輪只改這一段。`);
    if (historyStats.topRescueTool) items.push(`補救工具以「${historyStats.topRescueTool}」為主,應確認它是在救流程還是在掩蓋規則過硬。`);
    if (historyStats.stoppedCount > historyStats.smoothCount) items.push("中止樣本多於順利樣本,先回到平衡或寬鬆 preset,再重新建立 baseline。");
    return items;
  }, [historyStats]);
  const operatorReadiness = useMemo(() => {
    const checks = [
      { label: "已有 baseline", pass: baselineLibrary.length > 0 },
      { label: "重現度 >= 70", pass: currentScenarioReproducibility >= 70 },
      { label: "參數無警示", pass: scenarioHealth.length === 0 },
      { label: "至少 3 輪樣本", pass: experimentRuns.length >= 3 },
    ];
    const passed = checks.filter((item) => item.pass).length;
    return {
      passed,
      total: checks.length,
      level: passed === checks.length ? "可進入產品驗收" : passed >= 2 ? "可內測但先補洞" : "先別放大測試",
      checks,
    };
  }, [baselineLibrary.length, currentScenarioReproducibility, scenarioHealth, experimentRuns.length]);
  const activeRealSession = useMemo(
    () => realSessions.find((session) => session.id === activeRealSessionId) ?? null,
    [realSessions, activeRealSessionId]
  );
  const filteredRealSessions = useMemo(() => {
    if (realSessionReviewFilter === "today") {
      const today = todayDayKey();
      return realSessions.filter((session) => (session.startedDayKey ?? dayKeyFromIso(session.startedAtIso ?? isoNow())) === today);
    }
    if (realSessionReviewFilter === "all") return realSessions;
    return realSessions.filter((session) => session.status === realSessionReviewFilter);
  }, [realSessions, realSessionReviewFilter]);
  const realSessionsToday = useMemo(
    () => realSessions.filter((session) => session.environment === "real" && (session.startedDayKey ?? dayKeyFromIso(session.startedAtIso ?? isoNow())) === todayDayKey()),
    [realSessions]
  );
  const liveRealSessions = useMemo(() => realSessions.filter((session) => session.status === "live"), [realSessions]);
  const simulatedRunCount = useMemo(() => experimentRuns.filter((run) => run.environment === "simulated").length, [experimentRuns]);
  const realRunCount = useMemo(() => experimentRuns.filter((run) => run.environment === "real").length, [experimentRuns]);
  const realDailyReview = useMemo(() => {
    const total = realSessionsToday.length;
    const completed = realSessionsToday.filter((session) => session.status === "completed").length;
    const stopped = realSessionsToday.filter((session) => session.status === "stopped").length;
    const live = realSessionsToday.filter((session) => session.status === "live").length;
    const assistCount = realSessionsToday.reduce((sum, session) => sum + session.assistCount, 0);
    const interruptionCount = realSessionsToday.reduce((sum, session) => sum + session.interruptionCount, 0);
    const latestNextAction = realSessionsToday[0]?.nextAction ?? "先完成今天第一輪真實測試。";
    const assistLabels = realSessionsToday.flatMap((session) => session.events.filter((event) => event.kind === "assist").map((event) => event.title));
    const interruptionLabels = realSessionsToday.flatMap((session) => session.events.filter((event) => event.kind === "interruption").map((event) => event.title));
    const challengeLabels = realSessionsToday.map((session) => session.challengeName);
    const operatorLabels = realSessionsToday.map((session) => `${session.operatorName}|${session.operatorRole}`);
    const stoppedSamples = realSessionsToday
      .filter((session) => session.status === "stopped")
      .slice(0, 2)
      .map((session) => `${session.challengeName}|${session.nextAction}`);
    const taxonomySummaries = realSessionsToday.map((session) => buildSessionTaxonomy(session));
    const coverageSummaries = realSessionsToday.map((session) => sessionHandoffCoverage(session));
    const avgCoverage = coverageSummaries.length ? Math.round(coverageSummaries.reduce((sum, item) => sum + item.score, 0) / coverageSummaries.length) : 0;
    const failureLabels = taxonomySummaries.map((item) => item.topFailure).filter((item) => item !== "尚未記錄失敗型事件");
    const recoveryLabels = taxonomySummaries.map((item) => item.topRecovery).filter((item) => item !== "尚未記錄補救型事件");
    const totalFailures = taxonomySummaries.reduce((sum, item) => sum + item.failures, 0);
    const totalRecoveries = taxonomySummaries.reduce((sum, item) => sum + item.recoveries, 0);
    const totalPositiveNotes = taxonomySummaries.reduce((sum, item) => sum + item.neutrals, 0);

    const readiness =
      total === 0
        ? "尚未開始真實測試"
        : live > 0
          ? avgCoverage < 80
            ? "仍有 live session,先補交班欄位再收日報"
            : "仍有 live session,先補完交班再收日報"
          : stopped > completed
            ? "先處理中止案例"
            : interruptionCount > assistCount
              ? "先補 interruption SOP"
              : "可做日回顧";

    const operatorCallout =
      total === 0
        ? "先開第一輪真實 session,把操作員 / 孩子狀態 / 地點寫完整。"
        : live > 0
          ? avgCoverage < 80
            ? "至少補齊目標 / next action / timeline,避免 live session 斷在半空中。"
            : "至少留下一條 next action,避免 live session 斷在半空中。"
          : stopped > 0
            ? `先回看 ${stoppedSamples[0] ?? "最近中止案例"},不要只看完成樣本。`
            : totalFailures > totalRecoveries
              ? "失敗樣本仍多於補救樣本,先補一輪 recovery SOP。"
            : interruptionCount > assistCount
              ? "明天優先驗證 interruption 入口是否要前移。"
              : "可把今天最穩的一輪升級成明天的 baseline。";

    const operatorSummaryLine =
      total === 0
        ? "尚未建立 operator digest"
        : `${pickTopLabel(failureLabels, "尚未記錄失敗型事件")} → ${pickTopLabel(recoveryLabels, "尚未記錄補救型事件")}|正向觀察 ${totalPositiveNotes}`;

    return {
      total,
      completed,
      stopped,
      live,
      assistCount,
      interruptionCount,
      readiness,
      latestNextAction,
      avgCoverage,
      topAssist: pickTopLabel(assistLabels, "尚未記 assist 類型"),
      topInterruption: pickTopLabel(interruptionLabels, "尚未記 interruption 類型"),
      topChallenge: pickTopLabel(challengeLabels, "尚未建立真實樣本"),
      topOperator: pickTopLabel(operatorLabels, "尚未指定操作員"),
      stoppedSamples,
      operatorCallout,
      totalFailures,
      totalRecoveries,
      totalPositiveNotes,
      topFailure: pickTopLabel(failureLabels, "尚未記錄失敗型事件"),
      topRecovery: pickTopLabel(recoveryLabels, "尚未記錄補救型事件"),
      operatorSummaryLine,
    };
  }, [realSessionsToday]);
  const dailyReport = useMemo(() => {
    const totalRuns = missionHistory.length;
    const successRuns = historyStats.smoothCount + historyStats.rescuedCount;
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
    const rescueRate = totalRuns > 0 ? Math.round((historyStats.rescuedCount / totalRuns) * 100) : 0;
    const stopRate = totalRuns > 0 ? Math.round((historyStats.stoppedCount / totalRuns) * 100) : 0;
    const exceptionLoad = extraTimeRequestsToday + breakCountToday + restartCountToday;

    return {
      totalRuns,
      successRate,
      rescueRate,
      stopRate,
      exceptionLoad,
      baselineLabel: presetLabel(baselinePreset),
      activeLabel: presetLabel(activePreset),
      todayFocus:
        scenarioHealth.length > 0
          ? "先修參數合法性,再看流程好不好走。"
          : lastMissionOutcome === "stopped"
            ? "先救回主流程,不要急著加壓。"
            : lastMissionOutcome === "rescued"
              ? "盯住補救分支是否重複出現在同一卡點。"
              : "維持可重播樣本,逐步做單變數比較。",
    };
  }, [missionHistory.length, historyStats, extraTimeRequestsToday, breakCountToday, restartCountToday, baselinePreset, activePreset, scenarioHealth, lastMissionOutcome]);
  const realSessionReviewBoard = useMemo(() => {
    const source = filteredRealSessions;
    if (source.length === 0) {
      return {
        headline: `${realSessionReviewFilterLabel(realSessionReviewFilter)}:尚無資料`,
        detail: "先建立真實 session 或切換篩選條件。",
        rows: [] as string[],
      };
    }

    const totalAssist = source.reduce((sum, session) => sum + session.assistCount, 0);
    const totalInterruption = source.reduce((sum, session) => sum + session.interruptionCount, 0);
    const avgAssist = (totalAssist / source.length).toFixed(1);
    const avgInterruption = (totalInterruption / source.length).toFixed(1);
    const durationLines = source.map((session) => formatDurationMinutes(session.startedAtIso, session.endedAtIso));
    const topDuration = pickTopLabel(durationLines, "未滿 1 分鐘");
    const taxonomy = source.map((session) => ({ session, summary: buildSessionTaxonomy(session) }));
    const reviewHeadline = pickTopLabel(taxonomy.map((item) => item.summary.topFailure), "尚未記錄失敗型事件");
    const recoveryHeadline = pickTopLabel(taxonomy.map((item) => item.summary.topRecovery), "尚未記錄補救型事件");

    return {
      headline: `${realSessionReviewFilterLabel(realSessionReviewFilter)}|${source.length} 輪`,
      detail: `平均 assist ${avgAssist}|平均 interruption ${avgInterruption}|常見時長 ${topDuration}|失敗主題 ${reviewHeadline}|補救主題 ${recoveryHeadline}`,
      rows: taxonomy.slice(0, 5).map(({ session, summary }) => `${session.challengeName}|${sessionStatusLabel(session.status)}|${workflowStageLabel(currentWorkflowStage(session))}|交班 ${sessionHandoffCoverage(session).score}/100|失敗 ${summary.topFailure}|補救 ${summary.topRecovery}|${session.nextAction}`),
    };
  }, [filteredRealSessions, realSessionReviewFilter]);
  const operatorRiskBoard = useMemo(() => {
    let score = 0;
    const bullets: string[] = [];

    if (scenarioHealth.length > 0) {
      score += 30;
      bullets.push(`參數警示:${scenarioHealth[0]}`);
    }
    if (testingConclusion.level === "偏硬") {
      score += 30;
      bullets.push("規則偏硬,中止風險偏高。");
    }
    if (testingConclusion.level === "補救依賴偏高") {
      score += 22;
      bullets.push("完成過度依賴補救分支,主流程可能不夠順。");
    }
    if (lastMissionOutcome === "stopped") {
      score += 24;
      bullets.push(`最新一輪已中止,卡點在 ${lastBlockedStep ?? "未標記步驟"}。`);
    } else if (lastMissionOutcome === "rescued") {
      score += 14;
      bullets.push(`最新一輪靠補救完成,主補救工具是 ${mostUsedTool ?? "未標記"}。`);
    }
    if (operatorReadiness.passed < operatorReadiness.total) {
      score += (operatorReadiness.total - operatorReadiness.passed) * 6;
      bullets.push(`Operator readiness 尚缺 ${operatorReadiness.total - operatorReadiness.passed} 項。`);
    }
    if (historyStats.topBlockedStep) {
      bullets.push(`重複卡點:${historyStats.topBlockedStep}`);
    }

    if (bullets.length === 0) {
      bullets.push("目前沒有明顯風險,適合延續基準重播。");
    }

    return {
      score: clampRange(score, 0, 100),
      level: riskLevelLabel(score),
      bullets,
    };
  }, [scenarioHealth, testingConclusion.level, lastMissionOutcome, lastBlockedStep, mostUsedTool, operatorReadiness, historyStats.topBlockedStep]);
  const recommendedNextTest = useMemo(() => {
    const nextPreset = testingRecommendation.preset;
    const nextMode: ScenarioKind =
      lastMissionOutcome === "stopped"
        ? "normal"
        : lastMissionOutcome === "rescued"
          ? lastScenarioKind
          : activePreset === baselinePreset
            ? "restart"
            : "normal";

    return {
      title:
        lastMissionOutcome === "stopped"
          ? "先重建可完成樣本"
          : lastMissionOutcome === "rescued"
            ? "重播同情境驗證補救"
            : "做單變數下一輪比較",
      detail:
        lastMissionOutcome === "stopped"
          ? `切到 ${presetLabel(nextPreset)},回到正常一輪,先確認主流程能完整跑完。`
          : lastMissionOutcome === "rescued"
            ? `保留 ${scenarioKindLabel(nextMode)},優先盯住 ${mostUsedTool ?? "主要補救工具"} 是否再次出現。`
            : `維持 ${presetLabel(activePreset)} 或切到 ${presetLabel(nextPreset)},只改一個變數做下一輪對照。`,
      operatorCallout: scenarioReview.action,
      baselineSnapshot: selectedBaselineSnapshot
        ? `${selectedBaselineSnapshot.name}|${presetLabel(selectedBaselineSnapshot.ruleConfig.preset)}|${scenarioKindLabel(selectedBaselineSnapshot.kind)}`
        : "尚未選 baseline,先升級一組穩定情境。",
      actionPreset: nextPreset,
      actionKind: nextMode,
    };
  }, [lastMissionOutcome, testingRecommendation.preset, mostUsedTool, lastScenarioKind, activePreset, baselinePreset, scenarioReview.action, selectedBaselineSnapshot]);
  const handoffReportSections = useMemo(() => {
    const headline = `${dailyReport.activeLabel}|${dailyReport.totalRuns} 輪樣本|成功率 ${dailyReport.successRate}%`;
    const focusLine = `今日 focus:${dailyReport.todayFocus}`;
    const baselineLine = `Baseline:${dailyReport.baselineLabel}|目前 live:${dailyReport.activeLabel}|Fingerprint 重現度 ${currentScenarioReproducibility}/100`;
    const riskLine = `風險:${operatorRiskBoard.level} (${operatorRiskBoard.score}/100)`;
    const nextLine = `下一輪:${recommendedNextTest.title}|${recommendedNextTest.detail}`;
    const realLine = `真實測試:${realDailyReview.readiness}|session ${realDailyReview.total}|live ${realDailyReview.live}|assist ${realDailyReview.assistCount}|interruption ${realDailyReview.interruptionCount}|交班完整度 ${realDailyReview.avgCoverage}/100`;
    const taxonomyLine = `失敗/補救:${realDailyReview.totalFailures}/${realDailyReview.totalRecoveries}|主卡點 ${realDailyReview.topFailure}|主補救 ${realDailyReview.topRecovery}`;
    const splitLine = `來源分層:SIM ${simulatedRunCount} runs|REAL ${realRunCount} tagged runs|TODAY real sessions ${realDailyReview.total}`;
    const operatorLine = `交班提醒:${realDailyReview.operatorCallout}`;

    return {
      headline,
      focusLine,
      baselineLine,
      riskLine,
      nextLine,
      realLine,
      taxonomyLine,
      splitLine,
      operatorLine,
      conciseLines: [headline, focusLine, baselineLine, riskLine, realLine, taxonomyLine, splitLine, operatorLine, nextLine],
    };
  }, [dailyReport, currentScenarioReproducibility, operatorRiskBoard, recommendedNextTest, realDailyReview, simulatedRunCount, realRunCount]);
  const dailyDigestSections = useMemo(() => {
    const datedHeadline = `${todayDayKey()}|Holton 測試交班日報`;
    const readinessLine = `${realDailyReview.readiness}|風險 ${operatorRiskBoard.level} ${operatorRiskBoard.score}/100`;
    const floorLine = `真實 ${realDailyReview.total} 輪(live ${realDailyReview.live} / 完成 ${realDailyReview.completed} / 中止 ${realDailyReview.stopped})|assist ${realDailyReview.assistCount}|interruption ${realDailyReview.interruptionCount}|交班 ${realDailyReview.avgCoverage}/100`;
    const simLine = `模擬 ${simulatedRunCount} 輪|real-tagged ${realRunCount} 輪|成功率 ${dailyReport.successRate}%|補救率 ${dailyReport.rescueRate}%|中止率 ${dailyReport.stopRate}%`;
    const taxonomyLine = `失敗 ${realDailyReview.totalFailures}|補救 ${realDailyReview.totalRecoveries}|主卡點 ${realDailyReview.topFailure}|主補救 ${realDailyReview.topRecovery}`;
    const nextLine = `${recommendedNextTest.title}|${realDailyReview.latestNextAction}`;

    return {
      datedHeadline,
      readinessLine,
      floorLine,
      simLine,
      nextLine,
      cardLines: [readinessLine, floorLine, simLine, taxonomyLine, nextLine],
      exportLines: [
        formatBulletLine("總結", readinessLine),
        formatBulletLine("真實現場", floorLine),
        formatBulletLine("模擬/回放", simLine),
        formatBulletLine("失敗/補救分類", taxonomyLine),
        formatBulletLine("下一步", nextLine),
      ],
    };
  }, [realDailyReview, operatorRiskBoard, simulatedRunCount, realRunCount, dailyReport, recommendedNextTest]);
  const operatorSessionSummary = useMemo(() => {
    if (realSessionsToday.length === 0) {
      return {
        lead: "尚未建立操作員交班摘要",
        rows: ["先開第一輪真實 session,交班層就會自動整理操作員摘要。"],
        exportLines: [formatBulletLine("操作員摘要", "尚未建立真實 session")],
      };
    }

    const grouped = realSessionsToday.reduce<Record<string, { name: string; role: string; sessions: number; live: number; completed: number; stopped: number; assists: number; interruptions: number; failures: number; recoveries: number; locations: string[]; nextAction: string }>>((acc, session) => {
      const key = `${session.operatorName}|${session.operatorRole}`;
      if (!acc[key]) {
        acc[key] = {
          name: session.operatorName,
          role: session.operatorRole,
          sessions: 0,
          live: 0,
          completed: 0,
          stopped: 0,
          assists: 0,
          interruptions: 0,
          failures: 0,
          recoveries: 0,
          locations: [],
          nextAction: session.nextAction,
        };
      }
      const item = acc[key];
      const taxonomy = buildSessionTaxonomy(session);
      item.sessions += 1;
      item.live += session.status === "live" ? 1 : 0;
      item.completed += session.status === "completed" ? 1 : 0;
      item.stopped += session.status === "stopped" ? 1 : 0;
      item.assists += session.assistCount;
      item.interruptions += session.interruptionCount;
      item.failures += taxonomy.failures;
      item.recoveries += taxonomy.recoveries;
      if (!item.locations.includes(session.location)) item.locations.push(session.location);
      if (session.status === "live" || !item.nextAction) item.nextAction = session.nextAction;
      return acc;
    }, {});

    const rows = Object.values(grouped)
      .sort((a, b) => b.sessions - a.sessions || b.interruptions - a.interruptions)
      .map((item) => `${item.name}|${item.role}|${item.sessions} 輪|live ${item.live}|完成 ${item.completed}|中止 ${item.stopped}|assist ${item.assists}|interrupt ${item.interruptions}|失敗 ${item.failures}|補救 ${item.recoveries}|現場 ${item.locations.join(" / ")}|交班 ${item.nextAction}`);

    return {
      lead: `主要操作員:${realDailyReview.topOperator}|${realDailyReview.operatorSummaryLine}`,
      rows,
      exportLines: rows.map((row) => formatBulletLine("操作員", row)),
    };
  }, [realSessionsToday, realDailyReview.topOperator, realDailyReview.operatorSummaryLine]);
  const nextActionSections = useMemo(() => {
    const queued = realSessionsToday
      .filter((session) => session.status === "live" || session.status === "stopped")
      .slice(0, 4)
      .map((session) => `${session.challengeName}|${sessionStatusLabel(session.status)}|${workflowStageLabel(currentWorkflowStage(session))}|交班 ${sessionHandoffCoverage(session).score}/100|${session.nextAction}`);

    const rows = queued.length
      ? queued
      : [
          `${recommendedNextTest.title}|${recommendedNextTest.detail}`,
          `操作員提醒|${recommendedNextTest.operatorCallout}`,
        ];

    return {
      lead: queued.length ? "優先處理 live / stopped session 的交班動作" : "目前沒有 live / stopped session,改採系統建議下一輪。",
      rows,
      exportLines: rows.map((row, index) => formatNumberedLine(index + 1, "待辦", row)),
    };
  }, [realSessionsToday, recommendedNextTest]);
  const comparisonAverages = useMemo(() => {
    if (filteredExperimentRuns.length === 0) {
      return {
        avgOrbs: 0,
        avgExceptions: 0,
        avgBonus: 0,
      };
    }
    const totals = filteredExperimentRuns.reduce(
      (acc, run) => {
        acc.orbs += run.orbDelta;
        acc.bonus += run.bonusDelta;
        acc.exceptions += run.extraTimeUsed + run.breakUsed + run.restartUsed;
        return acc;
      },
      { orbs: 0, bonus: 0, exceptions: 0 }
    );
    return {
      avgOrbs: (totals.orbs / filteredExperimentRuns.length).toFixed(1),
      avgExceptions: (totals.exceptions / filteredExperimentRuns.length).toFixed(1),
      avgBonus: (totals.bonus / filteredExperimentRuns.length).toFixed(1),
    };
  }, [filteredExperimentRuns]);
  const baselineDriftSummary = useMemo(() => {
    const matched = baselineLibrary.find((item) => item.fingerprint === currentScenarioFingerprint);
    if (matched) {
      return {
        label: "已對齊基準",
        detail: `目前情境已對齊「${matched.label}」這個 baseline,可直接做重播比較。`,
      };
    }

    const closest = baselineLibrary.find((item) => item.preset === activePreset) ?? null;
    if (closest) {
      return {
        label: "已偏離基準",
        detail: `目前與「${closest.label}」同 preset,但 scenario fingerprint 不同,代表已經出現 drift。`,
      };
    }

    return {
      label: "尚未建立基準",
      detail: "先把一組穩定情境升級成 baseline,之後才有真正可重播的對照組。",
    };
  }, [baselineLibrary, currentScenarioFingerprint, activePreset]);

  const applyRuleConfigSnapshot = (snapshot: RuleConfigSnapshot) => {
    setActivePreset(snapshot.preset);
    setBaselinePreset(snapshot.baselinePreset);
    setDailyMissionCap(clampRange(snapshot.dailyMissionCap, 3, 8));
    setWorldEventCap(clampRange(snapshot.worldEventCap, 1, 8));
    setExceptionCap(clampRange(snapshot.exceptionCap, 1, 6));
    setStage2UnlockDays(clampRange(snapshot.stage2UnlockDays, 3, 14));
  };

  function sessionTimestampLabel() {
    return new Date().toLocaleString("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const createRealSessionEvent = useCallback(
    (kind: RealSessionEvent["kind"], title: string, detail: string, impact?: string): RealSessionEvent => ({
      id: `${kind}-${Date.now()}`,
      kind,
      title,
      detail,
      impact,
      createdAtLabel: sessionTimestampLabel(),
    }),
    []
  );

  const upsertActiveRealSession = useCallback(
    (updater: (session: RealTestSession) => RealTestSession) => {
      setRealSessions((prev) => prev.map((session) => (session.id === activeRealSessionId ? updater(session) : session)));
    },
    [activeRealSessionId]
  );

  const syncActiveRealSessionDrafts = () => {
    if (!activeRealSessionId) return false;
    upsertActiveRealSession((session) => ({
      ...session,
      operatorName: operatorName.trim() || session.operatorName,
      operatorRole: operatorRole.trim() || session.operatorRole,
      childContext: childContext.trim() || session.childContext,
      location: sessionLocation.trim() || session.location,
      missionGoal: realMissionGoal.trim() || session.missionGoal,
      challengeId: selectedChallenge.id,
      challengeName: selectedChallenge.name,
      preset: activePreset,
      sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
      nextAction: nextActionDraft.trim() || session.nextAction,
    }));
    return true;
  };

  const ensureRealSession = () => {
    if (sessionEnvironment !== "real") return activeRealSessionId;
    if (activeRealSessionId) {
      syncActiveRealSessionDrafts();
      return activeRealSessionId;
    }

    const startedAtIso = isoNow();
    const sessionId = `real-${Date.now()}`;
    const newSession: RealTestSession = {
      id: sessionId,
      environment: "real",
      status: "live",
      operatorName: operatorName.trim() || "未填寫",
      operatorRole: operatorRole.trim() || "未填寫",
      childName,
      childContext: childContext.trim() || "未填寫",
      location: sessionLocation.trim() || "未填寫",
      missionGoal: realMissionGoal.trim() || selectedChallenge.name,
      challengeId: selectedChallenge.id,
      challengeName: selectedChallenge.name,
      preset: activePreset,
      startedAtLabel: sessionTimestampLabel(),
      startedAtIso,
      startedDayKey: dayKeyFromIso(startedAtIso),
      endedAtLabel: null,
      endedAtIso: null,
      sessionNote: realSessionNoteDraft.trim() || "未填寫",
      outcome: null,
      interruptionCount: 0,
      assistCount: 0,
      events: [
        createRealSessionEvent("note", "Session opened", `操作員 ${operatorName || "未填寫"}|${sessionLocation || "未填寫"}|目標:${realMissionGoal || selectedChallenge.name}`),
      ],
      nextAction: nextActionDraft.trim() || "完成本輪後補下一步。",
    };

    setRealSessions((prev) => [newSession, ...prev]);
    setActiveRealSessionId(sessionId);
    setMessage(`已開啟真實測試 session:${newSession.childName}|${newSession.challengeName}|${newSession.operatorName}`);
    return sessionId;
  };

  const buildRealSessionSummary = (session: RealTestSession) => {
    const headline = `${session.childName}|${session.challengeName}|${sessionStatusLabel(session.status)}`;
    const taxonomy = buildSessionTaxonomy(session);
    const coverage = sessionHandoffCoverage(session);
    const stage = workflowStageLabel(currentWorkflowStage(session));
    const metaLines = [
      formatBulletLine("Session", headline),
      formatBulletLine("操作員", `${session.operatorName}|${session.operatorRole}`),
      formatBulletLine("現場", `${session.location}|${session.childContext}`),
      formatBulletLine("時間", `${session.startedAtLabel}${session.endedAtLabel ? ` → ${session.endedAtLabel}` : "|仍在進行中"}`),
      formatBulletLine("目標", session.missionGoal),
      formatBulletLine("Workflow stage", stage),
      formatBulletLine("Preset / 支援量", `${presetLabel(session.preset)}|Assist ${session.assistCount}|Interruption ${session.interruptionCount}`),
      formatBulletLine("Outcome", session.outcome ? outcomeLabel(session.outcome) : "尚未結束"),
      formatBulletLine("Handoff coverage", `${coverage.score}/100|${coverage.label}`),
      formatBulletLine("Operator priority", operatorActionPriority(session)),
      formatBulletLine("Session focus", summarizeSessionFocus(session)),
      formatBulletLine("Session note", session.sessionNote),
      formatBulletLine("Next action", session.nextAction),
    ];

    const eventLines = session.events.length
      ? session.events.slice(0, 8).map((event, index) => {
          const detail = event.title === "Workflow stage" ? workflowStageLabel((event.detail.split("|")[0] as RealWorkflowStage) || "prep") : event.detail;
          return formatNumberedLine(index + 1, `${event.createdAtLabel}|${event.title}`, `${detail}${event.impact ? `|${event.impact}` : ""}`);
        })
      : [formatBulletLine("Timeline", "尚未記錄 timeline event")];

    const taxonomyLines = [
      formatBulletLine("Failure count", String(taxonomy.failures)),
      formatBulletLine("Recovery count", String(taxonomy.recoveries)),
      formatBulletLine("Positive notes", String(taxonomy.neutrals)),
      formatBulletLine("Top failure", taxonomy.topFailure),
      formatBulletLine("Top recovery", taxonomy.topRecovery),
      formatBulletLine("Failure→Recovery ratio", taxonomy.ratio),
      ...taxonomy.lines.slice(0, 4).map((line, index) => formatNumberedLine(index + 1, "Map", line)),
    ];

    return [
      formatShareBlock("SESSION SNAPSHOT", metaLines),
      formatShareBlock("FAILURE / RECOVERY MAP", taxonomyLines),
      formatShareBlock("TIMELINE", eventLines),
    ].join("\n\n");
  };

  const buildDailyHandoffBody = () => {
    const simulatedHistory = missionHistory.filter((entry) => entry.environment === "simulated");
    const realHistory = missionHistory.filter((entry) => entry.environment === "real");
    const realHighlightLines = realSessionsToday.length
      ? [
          formatBulletLine("Top operator", realDailyReview.topOperator),
          formatBulletLine("Top challenge", realDailyReview.topChallenge),
          formatBulletLine("Most-used assist", realDailyReview.topAssist),
          formatBulletLine("Most common interruption", realDailyReview.topInterruption),
          formatBulletLine("Failure taxonomy", realDailyReview.topFailure),
          formatBulletLine("Recovery taxonomy", realDailyReview.topRecovery),
          formatBulletLine("Operator digest", realDailyReview.operatorSummaryLine),
        ]
      : [formatBulletLine("真實樣本", "今天尚未累積真實 session 樣本")];

    const realSessionLines = realSessionsToday.length
      ? realSessionsToday.slice(0, 3).flatMap((session, index) => {
          const summaryLines = buildRealSessionSummary(session).split("\n");
          return [`#${index + 1}`, ...summaryLines, ""];
        })
      : ["尚未產生真實 session timeline。"];

    const simulatedLines = simulatedHistory.length
      ? simulatedHistory.slice(0, 4).map((entry, index) => formatNumberedLine(index + 1, `${entry.challengeName}|${outcomeLabel(entry.outcome)}|${presetLabel(entry.preset)}`, entry.blockedStep ?? entry.advice))
      : [formatBulletLine("模擬記錄", "今日尚未累積 simulated runs")];

    const realRunLines = realHistory.length
      ? realHistory.slice(0, 4).map((entry, index) => formatNumberedLine(index + 1, `${entry.challengeName}|${outcomeLabel(entry.outcome)}|${presetLabel(entry.preset)}`, "assist / interruption 需對照真實 timeline"))
      : [formatBulletLine("真實 mission 記錄", "今日尚未累積 real-tagged mission runs")];

    return [
      formatShareBlock("DAILY DIGEST", [dailyDigestSections.datedHeadline, ...dailyDigestSections.exportLines]),
      formatShareBlock("REAL FLOOR SUMMARY", [
        formatBulletLine("Readiness", realDailyReview.readiness),
        formatBulletLine("Sessions", `${realDailyReview.total}|Live ${realDailyReview.live}|Completed ${realDailyReview.completed}|Stopped ${realDailyReview.stopped}`),
        formatBulletLine("Assist / interruption", `${realDailyReview.assistCount} / ${realDailyReview.interruptionCount}`),
        formatBulletLine("Latest next action", realDailyReview.latestNextAction),
        formatBulletLine("Operator callout", realDailyReview.operatorCallout),
        ...realHighlightLines,
        ...(realDailyReview.stoppedSamples.length ? realDailyReview.stoppedSamples.map((item) => formatBulletLine("Stopped sample", item)) : []),
      ]),
      formatShareBlock("OPERATOR SUMMARY", [operatorSessionSummary.lead, ...operatorSessionSummary.exportLines]),
      formatShareBlock("NEXT ACTION QUEUE", [nextActionSections.lead, ...nextActionSections.exportLines]),
      formatShareBlock("SIMULATION LAB", [
        formatBulletLine("Simulated history", String(simulatedHistory.length)),
        formatBulletLine("Real-tagged mission history", String(realHistory.length)),
        ...simulatedLines,
        ...realRunLines,
      ]),
      formatShareBlock("TOP REAL SESSIONS", realSessionLines),
    ].join("\n\n");
  };

  const shareText = async (title: string, messageBody: string) => {
    await Share.share({ title, message: messageBody });
  };

  const exportStorageBackup = async () => {
    const payload: PersistedAppState = {
      childName,
      selectedChallengeId,
      selectedHeroId,
      selectedBeastId,
      hasCoreGuardian,
      coreGuardianStatus,
      coreGuardianId,
      coreGuardianName,
      coreGuardianLine,
      coreGuardianPersonalityChoice,
      coreGuardianElementChoice,
      coreGuardianColorChoice,
      coreGuardianArchetype,
      coreGuardianStateVariant,
      coreGuardianLevel,
      coreGuardianWeeklyFeed,
      coreGuardianWeeklyFeedTarget,
      coreGuardianTotalFeed,
      coreGuardianWeekIndex,
      coreGuardianWeeklyCompletedCount,
      coreGuardianReselectsUsed,
      coreGuardianBondedAtLevel,
      sessionEnvironment,
      operatorName,
      operatorRole,
      childContext,
      sessionLocation,
      realMissionGoal,
      realSessionNoteDraft,
      assistLevelDraft,
      assistNoteDraft,
      interruptionKindDraft,
      interruptionNoteDraft,
      nextActionDraft,
      realSessions,
      activeRealSessionId,
      savedScenarios,
      baselineLibrary,
      selectedBaselineId,
      activeScenarioId,
      scenarioNameDraft,
      scenarioNoteDraft,
      scenarioOperatorNote,
      missionHistory,
      experimentRuns,
      missionPhase,
      running,
      taskPower,
      emotionPower,
      focusPower,
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      guardianEncounterOpenedAtDay,
      guardianEncounterExpiresAtDay,
      guardianEncounterSourceTitle,
      guardianEncounterSourceFamily,
      missionsDoneToday,
      worldEventsDrawnToday,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
      daysInSystem,
      totalMissionClears,
      stage2Unlocked,
      collectedBadges,
      heroCollection,
      toolCardInventory,
      weeklyHero,
      heroUpgradeLevel,
      guardianProgress,
      guardianCatalog,
      activePreset,
      baselinePreset,
      dailyMissionCap,
      worldEventCap,
      exceptionCap,
      stage2UnlockDays,
      nextWorldEventId,
    };

    await shareText(
      "Holton local backup",
      JSON.stringify(
        {
          storageKey: STORAGE_KEY,
          exportedAt: isoNow(),
          snapshot: payload,
        },
        null,
        2
      )
    );
  };

  const clearLocalSnapshots = async () => {
    await clearPersistedAppState();
    setRealSessions([]);
    setActiveRealSessionId(null);
    setSavedScenarios([]);
    setMissionHistory([]);
    setExperimentRuns([]);
    setActiveScenarioId(null);
    setSelectedBaselineId(null);
    setLastSavedLabel(null);
    setMessage("已清除本機快照與暫存樣本。這不會影響程式碼,但會把 app 內的 session / scenario 記錄清空。");
  };

  const saveRealSessionNote = () => {
    const sessionId = ensureRealSession();
    if (!sessionId) return;
    upsertActiveRealSession((session) => ({
      ...session,
      sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
      nextAction: nextActionDraft.trim() || session.nextAction,
      events: [
        createRealSessionEvent("note", "Session note updated", realSessionNoteDraft.trim() || "未填寫補充 note"),
        ...session.events,
      ],
    }));
    setMessage("已把本輪 session note / next action 寫進 live session。");
  };

  const logCustomRealEvent = () => {
    const sessionId = ensureRealSession();
    if (!sessionId) return;
    const detail = customRealEventDraft.trim();
    if (!detail) {
      setMessage("先寫一條值得交班的現場觀察,再加入 timeline。");
      return;
    }
    upsertActiveRealSession((session) => ({
      ...session,
      events: [createRealSessionEvent("note", "Operator note", detail), ...session.events],
    }));
    setCustomRealEventDraft("");
    setMessage("已加入一條 operator note,方便交班時回放現場。");
  };

  const logWorkflowStage = (stage: RealWorkflowStage) => {
    const sessionId = ensureRealSession();
    if (!sessionId) {
      setMessage("目前是模擬模式,切到真實操作後再標記 workflow stage。");
      return;
    }
    upsertActiveRealSession((session) => ({
      ...session,
      sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
      nextAction: nextActionDraft.trim() || session.nextAction,
      events: [createRealSessionEvent("note", "Workflow stage", `${stage}|${workflowStageLabel(stage)}`), ...session.events],
    }));
    setMessage(`已標記 workflow stage:${workflowStageLabel(stage)}`);
  };

  const exportRealSession = async () => {
    if (!activeRealSession) {
      setMessage("目前沒有 live session,可先開啟或從今日 timeline 挑一輪看。");
      return;
    }
    await shareText(`Holton real session|${activeRealSession.childName}`, buildRealSessionSummary(activeRealSession));
  };

  const exportDailyHandoff = async () => {
    await shareText("Holton daily handoff", buildDailyHandoffBody());
  };

  const exportParentReview = async () => {
    setMessage("正在匯出家長回顧...");
    await shareText(`Holton parent review|${childName}`, buildParentReviewReportBody());
    setMessage("已匯出家長回顧。可直接分享或保存。");
  };

  const resumeLatestLiveSession = () => {
    const liveSession = liveRealSessions[0];
    if (!liveSession) {
      setMessage("目前沒有 live session 可續記。若要記錄現場,先開一輪新的真實 session。");
      return;
    }
    loadRealSessionIntoDraft(liveSession);
    setActiveRealSessionId(liveSession.id);
    setMessage(`已續接 live session:${liveSession.childName}|${liveSession.challengeName}|${liveSession.operatorName}`);
  };

  const loadRealSessionIntoDraft = (session: RealTestSession) => {
    setSessionEnvironment("real");
    setActiveRealSessionId(session.status === "live" ? session.id : null);
    setOperatorName(session.operatorName);
    setOperatorRole(session.operatorRole);
    setChildContext(session.childContext);
    setSessionLocation(session.location);
    setRealMissionGoal(session.missionGoal);
    setRealSessionNoteDraft(session.sessionNote);
    setNextActionDraft(session.nextAction);
    setSelectedChallengeId(session.challengeId);
    setActivePreset(session.preset);
    setMessage(`已載入 ${session.childName}|${session.challengeName} 的現場記錄${session.status === "live" ? ",可直接續記。" : ",可直接回看或匯出。"}`);
  };

  const startRealSession = () => {
    setSessionEnvironment("real");
    if (activeRealSessionId) {
      syncActiveRealSessionDrafts();
      setMessage("已更新目前 live session 的操作員、目標與交班內容。");
      return;
    }
    ensureRealSession();
  };

  const logAssistEvent = () => {
    const sessionId = ensureRealSession();
    if (!sessionId) {
      setMessage("目前是模擬模式,切到真實操作後再記錄 assist。");
      return;
    }

    upsertActiveRealSession((session) => ({
      ...session,
      assistCount: session.assistCount + 1,
      sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
      nextAction: nextActionDraft.trim() || session.nextAction,
      events: [
        createRealSessionEvent(
          "assist",
          assistLevelLabel(assistLevelDraft),
          assistNoteDraft.trim() || "未填寫 assist note",
          `第 ${session.assistCount + 1} 次 assist`
        ),
        ...session.events,
      ],
    }));
    setMessage(`已記錄 assist:${assistLevelLabel(assistLevelDraft)}|${assistNoteDraft}`);
  };

  const logInterruptionEvent = () => {
    const sessionId = ensureRealSession();
    if (!sessionId) {
      setMessage("目前是模擬模式,切到真實操作後再記錄 interruption。");
      return;
    }

    upsertActiveRealSession((session) => ({
      ...session,
      interruptionCount: session.interruptionCount + 1,
      sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
      nextAction: nextActionDraft.trim() || session.nextAction,
      events: [
        createRealSessionEvent(
          "interruption",
          interruptionKindLabel(interruptionKindDraft),
          interruptionNoteDraft.trim() || "未填寫 interruption note",
          `第 ${session.interruptionCount + 1} 次 interruption`
        ),
        ...session.events,
      ],
    }));
    setMessage(`已記錄 interruption:${interruptionKindLabel(interruptionKindDraft)}|${interruptionNoteDraft}`);
  };

  const closeActiveRealSession = useCallback(
    (outcome: MissionOutcome) => {
      if (!activeRealSessionId) return;
      const endedAtIso = isoNow();
      upsertActiveRealSession((session) => ({
        ...session,
        status: outcome === "stopped" ? "stopped" : "completed",
        outcome,
        endedAtLabel: sessionTimestampLabel(),
        endedAtIso,
        sessionNote: realSessionNoteDraft.trim() || session.sessionNote,
        nextAction: nextActionDraft.trim() || session.nextAction,
        events: [
          createRealSessionEvent(
            "outcome",
            outcomeLabel(outcome),
            `挑戰 ${selectedChallenge.name}|preset ${presetLabel(activePreset)}`,
            `assist ${session.assistCount}|interruption ${session.interruptionCount}`
          ),
          ...session.events,
        ],
      }));
      setActiveRealSessionId(null);
    },
    [activeRealSessionId, realSessionNoteDraft, nextActionDraft, selectedChallenge.name, activePreset, createRealSessionEvent, upsertActiveRealSession]
  );

  const promoteScenarioToBaseline = (snapshot: TestingScenarioSnapshot, source: "template" | "saved" | "run") => {
    const fingerprint = scenarioFingerprint(snapshot);
    const nextRecord: ScenarioBaselineRecord = {
      id: `baseline-${snapshot.id}`,
      label: snapshot.name,
      scenarioId: snapshot.id,
      fingerprint,
      preset: snapshot.ruleConfig.preset,
      scenarioKind: snapshot.kind,
      note: snapshot.note,
      source,
    };

    setBaselineLibrary((prev) => {
      const filtered = prev.filter((item) => item.id !== nextRecord.id && item.fingerprint !== fingerprint);
      return [nextRecord, ...filtered].slice(0, 8);
    });
    setSelectedBaselineId(nextRecord.id);
    setBaselinePreset(snapshot.ruleConfig.preset);
    setMessage(`已把「${snapshot.name}」升級成對照基準,之後可拿來重播與比較 drift。`);
  };

  const applyScenarioSnapshot = (snapshot: TestingScenarioSnapshot) => {
    setScenarioNameDraft(snapshot.name);
    setScenarioNoteDraft(snapshot.note);
    setSelectedChallengeId(snapshot.challengeId);
    setSelectedHeroId(snapshot.selectedHeroId);
    setSelectedBeastId(snapshot.selectedBeastId);
    setTaskPower(clamp(snapshot.taskPower));
    setEmotionPower(clamp(snapshot.emotionPower));
    setFocusPower(clamp(snapshot.focusPower));
    setOrbs(snapshot.orbs);
    setBonusOrbs(clampRange(snapshot.bonusOrbs, 0, 2));
    setGuardianTraces(snapshot.guardianTraces);
    setGuardianChallengeTokens(snapshot.guardianChallengeTokens);
    setMissionsDoneToday(snapshot.missionsDoneToday);
    setWorldEventsDrawnToday(snapshot.worldEventsDrawnToday);
    setExtraTimeRequestsToday(snapshot.extraTimeRequestsToday);
    setBreakCountToday(snapshot.breakCountToday);
    setRestartCountToday(snapshot.restartCountToday);
    setTotalMissionClears(snapshot.totalMissionClears);
    setDaysInSystem(snapshot.daysInSystem);
    setStage2Unlocked(snapshot.stage2Unlocked);
    setNextWorldEventId(snapshot.nextWorldEventId);
    applyRuleConfigSnapshot(snapshot.ruleConfig);
    setActiveScenarioId(snapshot.id);
    setLastScenarioKind(snapshot.kind);
    setMessage(`已載入情境「${snapshot.name}」:${snapshot.note}`);
    resetTestScenario(true);
  };

  const saveCurrentScenario = (kind: ScenarioKind) => {
    const snapshot = buildScenarioSnapshot(kind, activeScenarioId ?? `scenario-${Date.now()}`);

    setSavedScenarios((prev) => {
      const filtered = prev.filter((item) => item.id !== snapshot.id);
      return [snapshot, ...filtered].slice(0, 6);
    });
    setActiveScenarioId(snapshot.id);
    setMessage(`已保存情境「${snapshot.name}」,之後可直接重播同一組規則與起始值。`);
  };

  useEffect(() => {
    const entry: RuleConfigLogEntry = {
      id: `${activePreset}-${dailyMissionCap}-${worldEventCap}-${exceptionCap}-${stage2UnlockDays}`,
      preset: activePreset,
      dailyMissionCap,
      worldEventCap,
      exceptionCap,
      stage2UnlockDays,
    };

    setRuleConfigHistory((prev) => {
      if (prev[0]?.id === entry.id) return prev;
      return [entry, ...prev].slice(0, 6);
    });
  }, [activePreset, dailyMissionCap, worldEventCap, exceptionCap, stage2UnlockDays]);

  useEffect(() => {
    if (missionPhase !== "settle" || !settleSummary) return;

    const entry: MissionHistoryEntry = {
      id: `${missionRunNonce}-${totalMissionClears}-${missionsDoneToday}-${selectedChallenge.id}`,
      challengeName: selectedChallenge.name,
      outcome: lastMissionOutcome,
      blockedStep: lastBlockedStep,
      rescueTool: mostUsedTool,
      orbDelta: settleSummary.orbDelta,
      bonusDelta: settleSummary.bonusDelta,
      branchSummary: `延長 ${settleSummary.extraTimeDelta}|短休 ${settleSummary.breakDelta}|重接 ${settleSummary.restartDelta}`,
      advice: missionObservation?.mostUsedBranch ? `優先注意 ${missionObservation.mostUsedBranch}` : "維持標準流程即可",
      preset: activePreset,
      environment: lastRunEnvironment,
    };

    setMissionHistory((prev) => {
      const merged = dedupeMissionHistory([entry, ...prev.filter((item) => item.id !== entry.id)]);
      return merged.slice(0, 8);
    });

    const comparisonSummary =
      activePreset === baselinePreset
        ? "基準版本輪只累積樣本。"
        : `相對 ${presetLabel(baselinePreset)},本輪先觀察 ${lastMissionOutcome === "smooth" ? "順利完成是否更多" : lastMissionOutcome === "rescued" ? "補救是否下降" : "中止是否減少"}。`;

    const actionLabel =
      lastMissionOutcome === "smooth"
        ? "保留這組情境並提高一階壓力"
        : lastMissionOutcome === "rescued"
          ? `重跑同情境,盯住 ${mostUsedTool ?? "主要補救工具"}`
          : `先鬆動規則並處理 ${lastBlockedStep ?? "主要卡點"}`;

    const liveSnapshot = buildScenarioSnapshot(lastScenarioKind, activeScenarioId ?? `scenario-live-${entry.id}`);
    const runEntry: ExperimentRun = {
      id: `${entry.id}-${activePreset}-${lastScenarioKind}-${Date.now()}`,
      scenarioName: scenarioNameDraft.trim() || scenarioKindLabel(lastScenarioKind),
      note: scenarioNoteDraft.trim() || "未填寫說明",
      preset: activePreset,
      baselinePreset,
      outcome: lastMissionOutcome,
      challengeName: selectedChallenge.name,
      blockedStep: lastBlockedStep,
      rescueTool: mostUsedTool,
      extraTimeUsed: settleSummary.extraTimeDelta,
      breakUsed: settleSummary.breakDelta,
      restartUsed: settleSummary.restartDelta,
      orbDelta: settleSummary.orbDelta,
      bonusDelta: settleSummary.bonusDelta,
      comparedToBaseline: comparisonSummary,
      actionLabel,
      fingerprint: scenarioFingerprint(liveSnapshot),
      scenarioKind: lastScenarioKind,
      forcedEventTitle: nextWorldEventId ? worldEvents.find((item) => item.id === nextWorldEventId)?.title ?? nextWorldEventId : null,
      reproducibilityScore: reproducibilityScore(liveSnapshot),
      environment: lastRunEnvironment,
    };

    setExperimentRuns((prev) => {
      const merged = dedupeExperimentRuns([runEntry, ...prev]);
      return merged.slice(0, 10);
    });
  }, [
    missionPhase,
    settleSummary,
    lastMissionOutcome,
    lastBlockedStep,
    mostUsedTool,
    selectedChallenge.id,
    selectedChallenge.name,
    totalMissionClears,
    missionsDoneToday,
    missionRunNonce,
    lastRunEnvironment,
    missionObservation?.mostUsedBranch,
    activePreset,
    baselinePreset,
    buildScenarioSnapshot,
    lastScenarioKind,
    activeScenarioId,
    scenarioNameDraft,
    scenarioNoteDraft,
    nextWorldEventId,
  ]);

  const totalSeconds = selectedChallenge.minutes * 60;
  const progress = selectedChallenge.untimed || totalSeconds <= 0 ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;
  const missionsRemaining = Math.max(0, dailyMissionCap + extraMissionSlots - missionsDoneToday);

  useEffect(() => {
    setRemaining(selectedChallenge.minutes * 60);
    setRunning(false);
  }, [selectedChallengeId, selectedChallenge.minutes]);

  const drawWorldEvent = useCallback(() => {
    if (worldEventsDrawnToday >= worldEventCap) {
      setMessage(`今天的世界事件已達上限 ${worldEventCap} 次,避免事件系統蓋過主流程。`);
      return;
    }

    const forcedEvent = nextWorldEventId ? worldEvents.find((item) => item.id === nextWorldEventId) ?? null : null;
    const event = forcedEvent ?? worldEvents[(worldEventsDrawnToday + missionsDoneToday + totalMissionClears) % worldEvents.length];
    setCurrentEvent(event);
    setLastSettledEvent(event);
    setWorldEventsDrawnToday((prev) => Math.min(prev + 1, worldEventCap));
    setNextWorldEventId(null);

    const bonusOrbsDelta = event.effect?.bonusOrbs ?? 0;
    const guardianTracesDelta = event.effect?.guardianTraces ?? 0;
    const guardianChallengeTokensDelta = event.effect?.guardianChallengeTokens ?? 0;
    const extraMissionDelta = event.effect?.extraMission ?? 0;
    const emotionPowerDelta = event.effect?.emotionPower ?? 0;
    const focusPowerDelta = event.effect?.focusPower ?? 0;

    if (bonusOrbsDelta > 0) {
      setBonusOrbs((prev) => Math.min(prev + bonusOrbsDelta, 2));
    }
    if (guardianTracesDelta > 0) {
      setGuardianTraces((prev) => prev + guardianTracesDelta);
    }
    if (guardianChallengeTokensDelta > 0) {
      setGuardianChallengeTokens((prev) => prev + guardianChallengeTokensDelta);
      setGuardianEncounterOpenedAtDay(daysInSystem);
      setGuardianEncounterExpiresAtDay(daysInSystem + 1);
      setGuardianEncounterSourceTitle(event.title);
      setGuardianEncounterSourceFamily(event.family);
    }
    if (extraMissionDelta > 0) {
      setExtraMissionSlots((prev) => Math.min(prev + extraMissionDelta, 2));
    }
    if (emotionPowerDelta > 0) {
      setEmotionPower((prev) => clamp(prev + emotionPowerDelta));
    }
    if (focusPowerDelta > 0) {
      setFocusPower((prev) => clamp(prev + focusPowerDelta));
    }

    if (guardianChallengeTokensDelta > 0) {
      setMessage(`世界事件打開了一條守護獸線索:你拿到限時 2 天的挑戰窗口。先看你有沒有足夠的 Orbs + Bonus Pool,夠就進場,不夠這次就只能放掉。`);
    } else if (guardianTracesDelta > 0) {
      setMessage(`世界事件留下了新的守護獸痕跡。先把這道痕跡記住,再慢慢把它推向真正的挑戰入口。`);
    } else if (bonusOrbsDelta > 0 || extraMissionDelta > 0) {
      setMessage(`世界事件先給了你一個前進的小助力。先把今天主線跑穩,最後再回世界看它打開了什麼。`);
    }

    setEventVisible(true);
  }, [missionsDoneToday, nextWorldEventId, totalMissionClears, worldEventCap, worldEventsDrawnToday]);

  const resolveMissionSuccess = useCallback(() => {
    const resolvedOutcome: MissionOutcome = extraTimeRequestsToday > 0 || breakCountToday > 0 || restartCountToday > 0 ? "rescued" : "smooth";
    const nextOrbTotal = orbs + selectedChallenge.orbs;
    setRunning(false);
    setOrbs((prev) => prev + selectedChallenge.orbs);
    setLastMissionOrbGain(selectedChallenge.orbs);
    setLastMissionOutcome(resolvedOutcome);
    setMissionsDoneToday((prev) => Math.min(prev + 1, dailyMissionCap + extraMissionSlots));
    setTotalMissionClears((prev) => prev + 1);
    setTaskPower((prev) => clamp(prev + 8));
    setFocusPower((prev) => clamp(prev + (selectedChallenge.minutes >= 10 ? 8 : 4)));
    setEmotionPower((prev) => clamp(prev + 3));
    setMissionPhase("settle");
    setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "finish-mode")));
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setMessage(`${childName} 完成了 ${selectedChallenge.name},拿到 ${selectedChallenge.orbs} 顆 Orbs。現在進入結算與收尾階段。`);
    setRemaining(selectedChallenge.minutes * 60);
    setUsedActiveSkills({});
    if (sessionEnvironment === "real") {
      closeActiveRealSession(resolvedOutcome);
    }
    if (nextOrbTotal % 3 === 0) drawWorldEvent();
  }, [breakCountToday, childName, closeActiveRealSession, dailyMissionCap, drawWorldEvent, extraMissionSlots, extraTimeRequestsToday, orbs, restartCountToday, selectedChallenge.minutes, selectedChallenge.name, selectedChallenge.orbs, sessionEnvironment]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      resolveMissionSuccess();
      return;
    }
    const timer = setTimeout(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [
    running,
    remaining,
    resolveMissionSuccess,
  ]);

  useEffect(() => {
    if (uiMode !== "parent" || !showHomeDetails || !showDataPlatform || stage2Unlocked) {
      setStage2PromptVisible(false);
      return;
    }
    if (daysInSystem >= stage2UnlockDays) {
      setStage2PromptVisible(true);
    }
  }, [daysInSystem, stage2Unlocked, stage2UnlockDays, uiMode, showHomeDetails, showDataPlatform]);

  useEffect(() => {
    if (guardianEncounterExpiresAtDay === null) return;
    if (daysInSystem <= guardianEncounterExpiresAtDay) return;
    setGuardianEncounterOpenedAtDay(null);
    setGuardianEncounterExpiresAtDay(null);
    setGuardianEncounterSourceTitle(null);
    setGuardianEncounterSourceFamily(null);
    setMessage(`上一個守護獸挑戰窗口已關閉。這次你沒有在 2 天內追上它,世界只留下你曾經看見過這條線索。`);
  }, [daysInSystem, guardianEncounterExpiresAtDay]);

  useEffect(() => {
    if (!hasCoreGuardian) return;
    if (currentGuardianWeekIndex <= coreGuardianWeekIndex) return;
    setCoreGuardianWeekIndex(currentGuardianWeekIndex);
    setCoreGuardianWeeklyFeed(0);
    setCoreGuardianWeeklyFeedTarget(coreGuardianWeeklyTargetForLevel(coreGuardianLevel));
    setMessage(`${coreGuardianName || "你的本命獸"} 進入第 ${currentGuardianWeekIndex} 週養成。這週目標是 ${coreGuardianWeeklyTargetForLevel(coreGuardianLevel)} 顆能量球。`);
  }, [currentGuardianWeekIndex, coreGuardianLevel, coreGuardianName, coreGuardianWeekIndex, hasCoreGuardian]);

  useEffect(() => {
    return () => clearCoreGuardianExpressionTimer();
  }, []);

  useEffect(() => {
    if (coreGuardianExpressionState !== "feed-success") return;
    if (!coreGuardianExpressionContextRef.current) return;
    if (coreGuardianExpressionContextRef.current === coreGuardianExpressionContextKey) return;
    resetCoreGuardianExpression();
  }, [coreGuardianExpressionContextKey, coreGuardianExpressionState]);

  useEffect(() => {
    setPhaseEnteredAtMs(Date.now());
  }, [missionPhase]);

  useEffect(() => {
    if (missionPhase !== "sop" && justReturnedFromWrapUp) {
      setJustReturnedFromWrapUp(false);
    }
  }, [justReturnedFromWrapUp, missionPhase]);

  useEffect(() => {
    if (!justReturnedFromWrapUp) return;
    if (showWeeklyDetails || showTodayDetails || showDataPlatform || showSupportTools || showParentAssist || showParentReviewPage || showParentArchives) {
      setJustReturnedFromWrapUp(false);
    }
  }, [justReturnedFromWrapUp, showWeeklyDetails, showTodayDetails, showDataPlatform, showSupportTools, showParentAssist, showParentReviewPage, showParentArchives]);

  useEffect(() => {
    if (missionPhase !== "sop" && postWrapUpContinuationSteps > 0) {
      setPostWrapUpContinuationSteps(0);
    }
  }, [postWrapUpContinuationSteps, missionPhase]);

  useEffect(() => {
    if (postWrapUpContinuationSteps <= 0) return;
    if (showWeeklyDetails || showTodayDetails || showDataPlatform || showSupportTools || showParentAssist || showParentReviewPage || showParentArchives) {
      setPostWrapUpContinuationSteps(0);
    }
  }, [postWrapUpContinuationSteps, showWeeklyDetails, showTodayDetails, showDataPlatform, showSupportTools, showParentAssist, showParentReviewPage, showParentArchives]);

  useEffect(() => {
    const timer = setTimeout(() => setPhaseClockTick((prev) => prev + 1), 1000);
    return () => clearTimeout(timer);
  }, [phaseClockTick]);

  useEffect(() => {
    if (supportCountdown <= 0) return;
    const timer = setTimeout(() => setSupportCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [supportCountdown]);

  useEffect(() => {
    if (!activeSupportToolId || supportCountdown > 0 || supportNeedsReturn) return;

    const activeTool = [...supportTools, ...activeSkills].find((tool) => tool.id === activeSupportToolId);
    if (!activeTool) return;

    setSupportNeedsReturn(true);
    setMessage(`${activeTool.title} 的支援時間已到,現在要決定怎麼接回主流程。`);

    setSupportReturnPromptVisible(false);
  }, [activeSupportToolId, supportCountdown, supportNeedsReturn, supportReminderMode]);

  useEffect(() => {
    const elapsedDays = Math.max(0, daysInSystem - weeklyHero.summonedAtDay);
    const nextDaysLeft = Math.max(0, 7 - elapsedDays);
    const shouldExpireNow = nextDaysLeft <= 0 && !weeklyHero.retired;
    if (nextDaysLeft !== weeklyHero.daysLeft || shouldExpireNow) {
      setWeeklyHero((prev) => ({ ...prev, daysLeft: nextDaysLeft, usesLeft: shouldExpireNow ? 0 : prev.usesLeft, retired: shouldExpireNow ? true : prev.retired }));
    }
    if (shouldExpireNow) {
      setHeroCollection((prev) => ({
        ...prev,
        [weeklyHero.heroId]: {
          heroId: weeklyHero.heroId,
          unlocked: prev[weeklyHero.heroId]?.unlocked ?? true,
          summonCount: prev[weeklyHero.heroId]?.summonCount ?? 1,
          lastSummonedAtDay: prev[weeklyHero.heroId]?.lastSummonedAtDay,
          lastExpiredAtDay: daysInSystem,
        },
      }));
      setMessage(`${activeWeeklyHero.name} 的服役期已結束,英雄已回收。若要再上場,請重新累積道具卡後召喚。`);
    }
  }, [activeWeeklyHero.name, daysInSystem, weeklyHero.daysLeft, weeklyHero.heroId, weeklyHero.retired, weeklyHero.summonedAtDay]);

  const craftToolCard = () => {
    if (orbs < toolCardInventory.craftCostOrbs) {
      setMessage(`能量球不足。需要 ${toolCardInventory.craftCostOrbs} 顆,目前只有 ${orbs} 顆,還差 ${Math.max(0, toolCardInventory.craftCostOrbs - orbs)} 顆。先完成下一輪任務再換。`);
      return;
    }
    setOrbs((prev) => Math.max(0, prev - toolCardInventory.craftCostOrbs));
    setToolCardInventory((prev) => ({
      ...prev,
      owned: prev.owned + 1,
      craftedTotal: prev.craftedTotal + 1,
    }));
    setMessage(`已用 ${toolCardInventory.craftCostOrbs} 顆能量球換到 1 張道具卡。目前道具卡 ${toolCardInventory.owned + 1}/${toolCardInventory.summonCostTools}。`);
  };

  const summonWeeklyHero = () => {
    const selectedRule = heroRuleBook[selectedHero.id];
    if (!selectedRule) {
      setMessage(`${selectedHero.name} 目前先作為收藏卡,還沒有進入每週英雄輪值。`);
      return;
    }
    if (toolCardInventory.owned < toolCardInventory.summonCostTools) {
      setMessage(`道具卡不足。需要 ${toolCardInventory.summonCostTools} 張,目前只有 ${toolCardInventory.owned} 張,還差 ${Math.max(0, toolCardInventory.summonCostTools - toolCardInventory.owned)} 張。先把能量球換成更多道具卡。`);
      return;
    }

    setToolCardInventory((prev) => ({
      ...prev,
      owned: Math.max(0, prev.owned - prev.summonCostTools),
      spentForSummon: prev.spentForSummon + prev.summonCostTools,
    }));
    setWeeklyHero({
      heroId: selectedHero.id,
      daysLeft: 7,
      usesLeft: selectedRule.baseUses,
      summonedAtDay: daysInSystem,
      retired: false,
    });
    setHeroCollection((prev) => ({
      ...prev,
      [selectedHero.id]: {
        heroId: selectedHero.id,
        unlocked: true,
        summonCount: (prev[selectedHero.id]?.summonCount ?? 0) + 1,
        lastSummonedAtDay: daysInSystem,
        lastExpiredAtDay: prev[selectedHero.id]?.lastExpiredAtDay,
      },
    }));
    setGuardianChallengeTokens((prev) => prev + 1);
    setMessage(`${selectedHero.name} 召喚成功。本週技能 ${selectedRule.skillName} 已啟動,並獲得 +1 守護獸挑戰資格。剩餘道具卡 ${Math.max(0, toolCardInventory.owned - toolCardInventory.summonCostTools)} 張。`);
  };

  const unlockHeroUpgrade = () => {
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    if (totalMissionClears < nextHeroUpgradeAt) {
      setMessage(`還沒達到主角升階門檻。累積任務 ${totalMissionClears},下一階需要 ${nextHeroUpgradeAt}。`);
      return;
    }
    setHeroUpgradeLevel((prev) => prev + 1);
    setMessage(`Holton 主角升階成功,主角升階 +1。這不是單張英雄升級,而是 Holton 本人的成長里程碑。`);
  };

  const markGuardianShowcase = (beastId: string) => {
    const targetRecord = guardianCatalog[beastId];
    setGuardianCatalog((prev) => {
      const next: Record<string, GuardianCatalogRecord> = {};
      for (const [id, record] of Object.entries(prev)) {
        next[id] = { ...record, showcase: id === beastId };
      }
      return next;
    });
    setMessage(`${guardianBeasts.find((item) => item.id === beastId)?.name ?? "守護獸"}${targetRecord?.status === "captured" && targetRecord.capturedAtDay === daysInSystem ? " 今天剛翻進圖鑑,現在也已被拿上桌展示。" : " 已設成圖鑑展示主角。"}`);
  };

  const setWeeklyCompanionGuardian = (beastId: string) => {
    setGuardianCatalog((prev) => {
      const next: Record<string, GuardianCatalogRecord> = {};
      for (const [id, record] of Object.entries(prev)) {
        next[id] = { ...record, companion: id === beastId };
      }
      return next;
    });
    setMessage(`${guardianBeasts.find((item) => item.id === beastId)?.name ?? "守護獸"} 已設成這週陪伴守護獸。`);
  };

  const resetCoreGuardianDraft = () => {
    setCoreGuardianCreationStep(0);
    setDraftCoreGuardianPersonality(null);
    setDraftCoreGuardianElement(null);
    setDraftCoreGuardianColor(null);
    setDraftCoreGuardianName("");
    setCoreGuardianQuizAnswers({});
    setCoreGuardianArchetypeScores({});
    setCoreGuardianRecommendedArchetype(null);
    setCoreGuardianSecondaryArchetype(null);
    setCoreGuardianRecommendedState(null);
  };

  const openCoreGuardianCreation = () => {
    resetCoreGuardianDraft();
    setCoreGuardianReselectMode(false);
    setCoreGuardianCreationVisible(true);
    setMessage("已打開本命獸建立流程,先選最像的一張卡開始。");
  };

  const closeCoreGuardianCreation = () => {
    setCoreGuardianCreationVisible(false);
    setCoreGuardianReselectMode(false);
    resetCoreGuardianDraft();
  };

  const resetCoreGuardianForTesting = () => {
    const previousCoreGuardianId = coreGuardianId;
    setCoreGuardianCreationVisible(false);
    setHasCoreGuardian(false);
    setCoreGuardianStatus("empty");
    setCoreGuardianId(null);
    setCoreGuardianName("");
    setCoreGuardianLine("這裡會出現陪你一起長大的夥伴。");
    setCoreGuardianPersonalityChoice(null);
    setCoreGuardianElementChoice(null);
    setCoreGuardianColorChoice(null);
    setCoreGuardianArchetype(null);
    setCoreGuardianStateVariant(null);
    setCoreGuardianLevel(1);
    setCoreGuardianWeeklyFeed(0);
    setCoreGuardianWeeklyFeedTarget(3);
    setCoreGuardianTotalFeed(0);
    setCoreGuardianWeekIndex(currentGuardianWeekIndex);
    setCoreGuardianWeeklyCompletedCount(0);
    setCoreGuardianReselectsUsed(0);
    setCoreGuardianCreatedAtDay(undefined);
    setCoreGuardianBondedAtLevel(undefined);
    setCoreGuardianJustCreated(false);
    setSelectedBeastId("tidefin");
    setSelectedSupportScenario(null);
    setShowParentAssist(false);
    setShowWeeklyDetails(false);
    setShowHomeDetails(false);
    setCoreGuardianReselectMode(false);
    resetCoreGuardianDraft();
    setGuardianCatalog((prev) => {
      const next: Record<string, GuardianCatalogRecord> = {};
      for (const [id, record] of Object.entries(prev)) {
        next[id] = {
          ...record,
          companion: false,
          showcase: previousCoreGuardianId ? (id === previousCoreGuardianId ? false : record.showcase) : record.showcase,
        };
      }
      return next;
    });
    setMessage("已重設本命獸,現在直接重新開始建立流程(測試用)。");
    setTimeout(() => {
      setCoreGuardianCreationStep(0);
      setCoreGuardianCreationVisible(true);
    }, 0);
  };

  const calculateCoreGuardianQuizResult = (answers: Partial<Record<CoreGuardianQuizQuestionId, string>>) => {
    const scores: Record<CoreGuardianArchetype, number> = {
      stable: 0,
      explore: 0,
      soothe: 0,
      action: 0,
      focus: 0,
      reconnect: 0,
    };

    coreGuardianQuizQuestions.forEach((question) => {
      const selected = answers[question.id];
      const option = question.options.find((item) => item.id === selected);
      if (!option) return;
      Object.entries(option.scores).forEach(([key, value]) => {
        scores[key as CoreGuardianArchetype] += value ?? 0;
      });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = sorted[0]?.[0] as CoreGuardianArchetype | undefined;
    const second = sorted[1]?.[0] as CoreGuardianArchetype | undefined;
    const supportSignals = [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5, answers.q6].filter((value) => ["A", "B"].includes(value ?? "")).length;
    const recommendedState: CoreGuardianStateVariant = supportSignals >= 4 ? "companion" : "standard";

    return {
      scores,
      recommendedArchetype: top ?? null,
      secondaryArchetype: second ?? null,
      recommendedState,
    };
  };

  function buildCoreGuardianArchetypeDraft(archetype: CoreGuardianArchetype, stateVariant: CoreGuardianStateVariant) {
    const archetypeMeta = coreGuardianArchetypes.find((item) => item.id === archetype) ?? coreGuardianArchetypes[0];
    const beast = guardianBeasts.find((item) => item.id === archetypeMeta.beastId) ?? guardianBeasts[0];
    const generatedName = archetypeMeta.label;
    const line = `${archetypeMeta.label}|${coreGuardianStateVariantMeta[stateVariant].line}`;
    return { beast, generatedName, line, archetypeMeta };
  }

  const selectCoreGuardianQuizOption = (questionId: CoreGuardianQuizQuestionId, optionId: string) => {
    const nextAnswers = { ...coreGuardianQuizAnswers, [questionId]: optionId };
    setCoreGuardianQuizAnswers(nextAnswers);

    if (questionId === "q7") {
      const result = calculateCoreGuardianQuizResult(nextAnswers);
      setCoreGuardianArchetypeScores(result.scores);
      setCoreGuardianRecommendedArchetype(result.recommendedArchetype);
      setCoreGuardianSecondaryArchetype(result.secondaryArchetype);
      setCoreGuardianRecommendedState(result.recommendedState);
      setCoreGuardianCreationStep(8);
      return;
    }

    setCoreGuardianCreationStep((prev) => prev + 1);
  };

  const switchToSecondaryCoreGuardianRecommendation = () => {
    if (!coreGuardianSecondaryArchetype) return;
    const currentPrimary = coreGuardianRecommendedArchetype;
    setCoreGuardianRecommendedArchetype(coreGuardianSecondaryArchetype);
    setCoreGuardianSecondaryArchetype(currentPrimary ?? null);
  };

  const completeCoreGuardianCreation = () => {
    if (!coreGuardianRecommendedArchetype || !coreGuardianRecommendedState) return;
    const draft = buildCoreGuardianArchetypeDraft(coreGuardianRecommendedArchetype, coreGuardianRecommendedState);
    setHasCoreGuardian(true);
    setCoreGuardianStatus("provisional");
    setCoreGuardianId(draft.beast.id);
    setCoreGuardianName(draftCoreGuardianName.trim() || draft.generatedName);
    setCoreGuardianLine(draft.line);
    setCoreGuardianPersonalityChoice(null);
    setCoreGuardianElementChoice(null);
    setCoreGuardianColorChoice(null);
    setCoreGuardianArchetype(coreGuardianRecommendedArchetype);
    setCoreGuardianStateVariant(coreGuardianRecommendedState);
    setCoreGuardianLevel(1);
    setCoreGuardianWeeklyFeed(0);
    setCoreGuardianWeeklyFeedTarget(coreGuardianWeeklyTargetForLevel(1));
    setCoreGuardianTotalFeed(0);
    setCoreGuardianWeekIndex(currentGuardianWeekIndex);
    setCoreGuardianWeeklyCompletedCount(0);
    setCoreGuardianCreatedAtDay(daysInSystem);
    setCoreGuardianBondedAtLevel(undefined);
    setSelectedBeastId(draft.beast.id);
    setGuardianCatalog((prev) => {
      const next: Record<string, GuardianCatalogRecord> = {};
      for (const [id, record] of Object.entries(prev)) {
        next[id] = { ...record, showcase: id === draft.beast.id, companion: id === draft.beast.id };
      }
      if (!next[draft.beast.id]) {
        next[draft.beast.id] = {
          beastId: draft.beast.id,
          status: "captured",
          defeatedCount: 0,
          capturedAtDay: daysInSystem,
          title: draft.line,
          rarity: "Rare",
          showcase: true,
          companion: true,
        };
      } else {
        next[draft.beast.id] = {
          ...next[draft.beast.id],
          status: "captured",
          capturedAtDay: next[draft.beast.id].capturedAtDay ?? daysInSystem,
          title: draft.line,
          showcase: true,
          companion: true,
        };
      }
      return next;
    });
    setMessage(`${draftCoreGuardianName.trim() || draft.generatedName} 已經來了。先回首頁看看牠,再餵第 1 顆能量球,讓這段陪伴正式開始。`);
    setCoreGuardianJustCreated(true);
    setCoreGuardianCreationStep(10);
  };

  const reselectCoreGuardian = () => {
    if (coreGuardianStatus !== "provisional") {
      setMessage("這隻本命獸已正式陪伴,現在不能直接重選。");
      return;
    }
    if (coreGuardianReselectsUsed >= 1 || coreGuardianLevel >= 10 || coreGuardianReselectDaysLeft <= 0) {
      setMessage("保留期已結束,現在不能再重選本命獸。");
      return;
    }
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setCoreGuardianReselectsUsed((prev) => prev + 1);
    setMessage("好,我們重新幫孩子找一位更適合現在的本命獸。原本那位先回守護之森休息,不是被丟掉,只是這次先不當主角。");
    resetCoreGuardianDraft();
    setCoreGuardianReselectMode(true);
    setCoreGuardianCreationVisible(true);
  };

  const clearCoreGuardianExpressionTimer = () => {
    if (coreGuardianExpressionTimerRef.current) {
      clearTimeout(coreGuardianExpressionTimerRef.current);
      coreGuardianExpressionTimerRef.current = null;
    }
  };

  const resetCoreGuardianExpression = () => {
    clearCoreGuardianExpressionTimer();
    coreGuardianExpressionContextRef.current = null;
    setCoreGuardianExpressionState("default");
  };

  const triggerCoreGuardianFeedSuccessExpression = () => {
    clearCoreGuardianExpressionTimer();
    coreGuardianExpressionContextRef.current = coreGuardianExpressionContextKey;
    setCoreGuardianExpressionState("feed-success");
    coreGuardianExpressionTimerRef.current = setTimeout(() => {
      coreGuardianExpressionContextRef.current = null;
      coreGuardianExpressionTimerRef.current = null;
      setCoreGuardianExpressionState("default");
    }, 3000);
  };

  const feedCoreGuardian = () => {
    setShowHomeDetails(true);
    if (!hasCoreGuardian || !coreGuardianId) {
      setMessage("先建立本命獸,再開始餵養。");
      return;
    }
    if (orbs <= 0) {
      setMessage("今天沒有可投入的能量球了,先完成任務再回來餵牠。");
      return;
    }
    if (coreGuardianWeeklyFeed >= coreGuardianWeeklyFeedTarget) {
      setMessage(`${coreGuardianName || "你的本命獸"} 這週已經吃飽了,先帶牠去完成任務,下一週再繼續。`);
      return;
    }
    setOrbs((prev) => Math.max(0, prev - 1));
    const previousStage = coreGuardianStageFromLevel(coreGuardianLevel);
    const nextTotal = coreGuardianTotalFeed + 1;
    const nextWeekly = Math.min(coreGuardianWeeklyFeedTarget, coreGuardianWeeklyFeed + 1);
    const nextLevel = Math.min(100, 1 + Math.floor(nextTotal / 3));
    const nextStage = coreGuardianStageFromLevel(nextLevel);
    const nextTarget = coreGuardianWeeklyTargetForLevel(nextLevel);
    setCoreGuardianTotalFeed(nextTotal);
    setCoreGuardianWeeklyFeed(nextWeekly);
    setCoreGuardianLevel(nextLevel);
    setCoreGuardianWeeklyFeedTarget(nextTarget);
    triggerCoreGuardianFeedSuccessExpression();
    if (coreGuardianStatus === "provisional" && nextLevel >= 10) {
      setCoreGuardianStatus("bonded");
      setCoreGuardianBondedAtLevel(nextLevel);
      setMessage(`${coreGuardianName || "你的本命獸"} 已正式成為長期陪伴夥伴。${previousStage !== nextStage ? `牠也進到 ${nextStage},首頁主卡會一起長大成新的樣子。` : ""}`);
      return;
    }
    if (previousStage !== nextStage) {
      setMessage(`${coreGuardianName || "你的本命獸"} 長大了,現在進到 ${nextStage}。你回首頁看,牠已經換成新的階段樣子了。`);
      return;
    }
    if (nextWeekly >= coreGuardianWeeklyFeedTarget) {
      setCoreGuardianWeeklyCompletedCount((prev) => prev + 1);
      setBonusOrbs((prev) => prev + 1);
      setMessage(`${coreGuardianName || "你的本命獸"} 這週已經吃飽了,看起來更有精神,並替你存下 +1 加成池。`);
      return;
    }
    setMessage(`${coreGuardianName || "你的本命獸"} 吃下 1 顆能量球。再 ${Math.max(0, coreGuardianWeeklyFeedTarget - nextWeekly)} 顆就能完成本週餵養。`);
  };

  const useWeeklyHeroSkill = () => {
    if (weeklyHeroExpired) {
      setMessage(`${activeWeeklyHero.name} 已退役,請重新召喚本週英雄。`);
      return;
    }
    if (weeklyHero.usesLeft <= 0) {
      setMessage(`${activeWeeklyHero.name} 本週技能次數已用完。`);
      return;
    }

    const nextUsesLeft = Math.max(0, weeklyHero.usesLeft - 1);
    setWeeklyHero((prev) => ({ ...prev, usesLeft: nextUsesLeft }));

    if (weeklyHero.heroId === "focus-knight") {
      setRunning(false);
      setFocusPower((prev) => clamp(prev + 8));
    } else if (weeklyHero.heroId === "calm-commander") {
      setRunning(false);
      setEmotionPower((prev) => clamp(prev + 10));
    } else if (weeklyHero.heroId === "mission-finisher") {
      setOrbs((prev) => prev + 1);
      setTaskPower((prev) => clamp(prev + 6));
    } else if (weeklyHero.heroId === "restart-champion") {
      setRunning(false);
      setFocusPower((prev) => clamp(prev + 5));
      setTaskPower((prev) => clamp(prev + 4));
    } else if (weeklyHero.heroId === "mindsteel-ranger") {
      setRunning(false);
      setTaskPower((prev) => clamp(prev + 7));
      setEmotionPower((prev) => clamp(prev + 5));
    } else if (weeklyHero.heroId === "holton-reward") {
      setOrbs((prev) => prev + 1);
    } else if (weeklyHero.heroId === "holton-ascend") {
      setRunning(false);
      setTaskPower((prev) => clamp(prev + 8));
      setFocusPower((prev) => clamp(prev + 4));
    }

    const effectFeedback = weeklyHero.heroId === "holton-reward"
      ? "本輪額外獲得 +1 能量球。"
      : weeklyHero.heroId === "holton-ascend"
        ? "本輪已打開升階窗口,可往更高階挑戰推進。"
        : weeklyHero.heroId === "mission-finisher"
          ? "收尾推進已加強,這輪更適合把最後一段收乾淨。"
          : weeklyHero.heroId === "focus-knight"
            ? "專注已拉回,現在適合回原任務。"
            : weeklyHero.heroId === "calm-commander"
              ? "情緒緩衝已啟動,先穩住再接回主線。"
              : weeklyHero.heroId === "restart-champion"
                ? "重接加成已開,現在適合重新接回這輪。"
                : weeklyHero.heroId === "mindsteel-ranger"
                  ? "任務結構已穩住,先照目前步驟往前。"
                  : "英雄效果已生效。";

    setMessage(`${activeWeeklyHeroRule.skillName} 已啟動:${effectFeedback} 剩餘 ${nextUsesLeft} 次。`);
  };

  const spendGuardianAttackPower = (amount: number) => {
    const spendBonus = Math.min(bonusOrbs, amount);
    const remaining = Math.max(0, amount - spendBonus);
    setBonusOrbs((prev) => Math.max(0, prev - spendBonus));
    setOrbs((prev) => Math.max(0, prev - remaining));
  };

  const startGuardianChallenge = () => {
    if (!stage2Unlocked) {
      setMessage("Guardian Beast Stage 2 還沒開放,先穩定跑主流程。\n滿 7 天後再開完整挑戰。");
      return;
    }
    if (!guardianEncounterWindowActive) {
      setMessage("目前沒有可用的守護獸限時挑戰窗口。先從世界卡開出新的線索與權利,再來決定要不要進場。");
      return;
    }
    if (guardianChallengeTokens <= 0) {
      setMessage("目前沒有守護獸挑戰資格,先透過英雄召喚或世界事件再累積。");
      return;
    }

    const attackPower = guardianAttackPowerAvailable;
    const challengeCost = selectedGuardianChallengeCost;
    setGuardianChallengeTokens((prev) => Math.max(0, prev - 1));
    setGuardianChallengeAttempts((prev) => prev + 1);

    if (attackPower <= 0) {
      setGuardianChallengeActive(false);
      setMessage(`${selectedGuardian.name} 需要 ${challengeCost} 點攻擊值,但你目前沒有可用的 Orbs / Bonus Pool。這次無法打穿,視為挑戰失敗。`);
      resolveGuardianChallenge(false, 0, challengeCost);
      return;
    }

    setGuardianChallengeActive(true);
    resolveGuardianChallenge(attackPower >= challengeCost, Math.min(attackPower, challengeCost), challengeCost, attackPower);
  };

  const resolveGuardianChallenge = (success: boolean, spentPower = 0, challengeCost = selectedGuardianChallengeCost, attemptedPower = guardianAttackPowerAvailable) => {
    setGuardianChallengeActive(false);
    spendGuardianAttackPower(spentPower);
    setGuardianEncounterOpenedAtDay(null);
    setGuardianEncounterExpiresAtDay(null);
    setGuardianEncounterSourceTitle(null);
    setGuardianEncounterSourceFamily(null);

    if (success) {
      const rewardOrbs = 3;
      setOrbs((prev) => prev + rewardOrbs);
      setTaskPower((prev) => clamp(prev + 8));
      setFocusPower((prev) => clamp(prev + 6));
      setGuardianProgress((prev) => {
        const current = prev[selectedBeastId] ?? { beastId: selectedBeastId, orbs: 0 };
        return {
          ...prev,
          [selectedBeastId]: {
            ...current,
            orbs: current.orbs + rewardOrbs,
          },
        };
      });
      setGuardianCatalog((prev) => ({
        ...prev,
        [selectedBeastId]: {
          ...(prev[selectedBeastId] ?? { beastId: selectedBeastId, title: selectedGuardian.name, rarity: "Common", showcase: false, companion: false }),
          beastId: selectedBeastId,
          status: "captured",
          defeatedCount: (prev[selectedBeastId]?.defeatedCount ?? 0) + 1,
          capturedAtDay: prev[selectedBeastId]?.capturedAtDay ?? daysInSystem,
          sourceEventTitle: currentEvent?.title ?? prev[selectedBeastId]?.sourceEventTitle,
          sourceEventFamily: currentEvent?.family ?? prev[selectedBeastId]?.sourceEventFamily,
          sourceEventReward: currentEvent?.reward ?? prev[selectedBeastId]?.sourceEventReward,
          title: prev[selectedBeastId]?.title ?? selectedGuardian.name,
          rarity: prev[selectedBeastId]?.rarity ?? "Common",
          showcase: prev[selectedBeastId]?.showcase ?? false,
          companion: prev[selectedBeastId]?.companion ?? false,
        },
      }));
      const currentOrbTotal = (guardianProgress[selectedBeastId]?.orbs ?? 0) + rewardOrbs;
      const unlockedStage = selectedGuardian.stages.filter((stage) => currentOrbTotal >= stage.cost).slice(-1)[0]?.label ?? "Mini";
      setMessage(`${selectedGuardian.name} 挑戰成功!需求 ${challengeCost} 點,你這次投入 ${spentPower} 點(Orbs + Bonus Pool)並成功打穿,獲得 +3 Orbs,目前到達 ${unlockedStage} 階段。`);
      return;
    }

    setEmotionPower((prev) => clamp(prev + 4));
    setGuardianCatalog((prev) => ({
      ...prev,
      [selectedBeastId]: {
        ...(prev[selectedBeastId] ?? { beastId: selectedBeastId, title: selectedGuardian.name, rarity: "Common", showcase: false, companion: false }),
        beastId: selectedBeastId,
        status: prev[selectedBeastId]?.status === "captured" ? "captured" : "defeated",
        defeatedCount: (prev[selectedBeastId]?.defeatedCount ?? 0) + 1,
        capturedAtDay: prev[selectedBeastId]?.capturedAtDay,
        sourceEventTitle: currentEvent?.title ?? prev[selectedBeastId]?.sourceEventTitle,
        sourceEventFamily: currentEvent?.family ?? prev[selectedBeastId]?.sourceEventFamily,
        sourceEventReward: currentEvent?.reward ?? prev[selectedBeastId]?.sourceEventReward,
        title: prev[selectedBeastId]?.title ?? selectedGuardian.name,
        rarity: prev[selectedBeastId]?.rarity ?? "Common",
        showcase: prev[selectedBeastId]?.showcase ?? false,
        companion: prev[selectedBeastId]?.companion ?? false,
      },
    }));
    setMessage(`${selectedGuardian.name} 這次挑戰失敗。需求 ${challengeCost} 點,但你這次只有 ${attemptedPower} 點可用攻擊值${spentPower > 0 ? `,已消耗 ${spentPower} 點` : ""}。世界已經記住你來過,先留下擊敗紀錄,下次再把這條線推下去。`);
  };

  const acknowledgeWorldEvent = () => {
    setEventVisible(false);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setShowWeeklyDetails(true);

    if (missionPhase === "settle" && currentEvent) {
      setMessage(`已收下世界事件:${currentEvent.title}。接著請完成這輪收尾。`);
      return;
    }
    setMessage("已收下這次世界回應。");
  };

  const startMission = () => {
    if (missionPhase !== "ready") {
      setMessage("現在不是重新開始這一輪的時候。先完成目前階段,或先回到開始前。");
      return;
    }
    if (running) {
      setMessage("任務已在進行中,不需要重複開始。");
      return;
    }
    if (missionsRemaining <= 0) {
      setMessage("今天的任務額度已用完,先重置情境或調整上限再測。");
      return;
    }
    if (sessionEnvironment === "real") {
      ensureRealSession();
    }
    setLastRunEnvironment(sessionEnvironment);
    setMissionRunNonce((prev) => prev + 1);
    setLastSettledEvent(null);
    setLastMissionOrbGain(0);
    setLastMissionOutcome("smooth");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastBlockedStep(null);
    setMostUsedTool(null);
    setMissionStartSnapshot({
      orbs,
      bonusOrbs,
      guardianTraces,
      guardianChallengeTokens,
      worldEventsDrawnToday,
      totalMissionClears,
      selectedGuardianOrbs: selectedGuardianProgress.orbs,
      weeklyHeroUsesLeft: weeklyHero.usesLeft,
      collectedBadgeCount,
      heroUpgradeLevel,
      extraTimeRequestsToday,
      breakCountToday,
      restartCountToday,
    });
    setRunning(true);
    setMissionPhase("challenge");
    setJustReturnedFromWrapUp(false);
    setCurrentStep(0);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowDataPlatform(false);
    setShowSupportTools(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setChallengeSelectionConfirmed(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setMessage(selectedChallenge.untimed ? `準備確認完成。${selectedChallenge.name} 啟動,這一輪不限時,以完成任務為主。` : `準備確認完成。${selectedChallenge.name} 出戰,${selectedChallenge.cue}`);
  };

  const completeUntimedMission = () => {
    if (!selectedChallenge.untimed) return;
    if (missionPhase !== "challenge") {
      setMessage("現在不是完成這一輪的時候。先回到任務進行中再結束。");
      return;
    }
    if (!running) {
      setMessage("不限時任務還沒開始,先按開始任務。");
      return;
    }
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    resolveMissionSuccess();
  };

  const markScenarioStopped = () => {
    if (!missionStartSnapshot) {
      setMissionRunNonce((prev) => prev + 1);
      setMissionStartSnapshot({
        orbs,
        bonusOrbs,
        guardianTraces,
        guardianChallengeTokens,
        worldEventsDrawnToday,
        totalMissionClears,
        selectedGuardianOrbs: selectedGuardianProgress.orbs,
        weeklyHeroUsesLeft: weeklyHero.usesLeft,
        collectedBadgeCount,
        heroUpgradeLevel,
        extraTimeRequestsToday,
        breakCountToday,
        restartCountToday,
      });
    }
    setRunning(false);
    setMissionPhase("settle");
    setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "finish-mode")));
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setLastMissionOutcome("stopped");
    setLastBlockedStep(activeSopCard.title);
    setMostUsedTool("手動標記中止");
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    if (sessionEnvironment === "real") {
      closeActiveRealSession("stopped");
    }
    setMessage(`已將 ${scenarioNameDraft.trim() || selectedChallenge.name} 記錄為中途中止,方便和完成樣本一起比較。`);
  };

  const handleNeedMoreTime = () => {
    if (!canTriggerException("extra-time")) {
      setMessage(`今天的延長次數已達上限 ${exceptionCap} 次,先不要再用延長覆蓋主流程。`);
      return;
    }
    setRunning(false);
    setMissionPhase("ready");
    setCurrentStep(0);
    setShowParentHomeModules(false);
    setShowHomeDetails(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setRemaining((prev) => prev + 60);
    setExtraTimeRequestsToday((prev) => prev + 1);
    setLastBlockedStep(activeSopCard.title);
    setMostUsedTool("需要更多時間");
    setMessage("需要更多時間:本輪額外補 1 分鐘,先穩住節奏再進場。");
  };

  const handleShortBreak = () => {
    if (!canTriggerException("break")) {
      setMessage(`今天的短休次數已達上限 ${exceptionCap} 次,先回到流程再往下走。`);
      return;
    }
    setRunning(false);
    setMissionPhase("sop");
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setBreakCountToday((prev) => prev + 1);
    setEmotionPower((prev) => clamp(prev + 6));
    setLastBlockedStep(activeSopCard.title);
    setMostUsedTool("短暫休息");
    setMessage("短暫休息:先停一下,這不是失敗,等穩住後再接回流程。");
  };

  const handleRestartFlow = () => {
    if (!canTriggerException("restart")) {
      setMessage(`今天的重新接回次數已達上限 ${exceptionCap} 次,先穩住這輪再處理。`);
      return;
    }
    setRunning(false);
    setMissionPhase("sop");
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    setRestartCountToday((prev) => prev + 1);
    setFocusPower((prev) => clamp(prev + 5));
    setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "check-in")));
    setLastBlockedStep(activeSopCard.title);
    setMostUsedTool("重新接回");
    setMessage("重新接回:保留這輪進度,先回 Check-In 看現在做到哪裡,再決定下一步。");
  };

  const pauseMission = () => {
    if (missionPhase !== "challenge" || !running) {
      setMessage("現在不是暫停這一輪的時候。先回到任務進行中再使用暫停。");
      return;
    }
    setSelectedSupportMinutes(1);
    setPendingTimedAction({ kind: "pause-mission", label: "任務暫停", options: [1, 2] });
    setSupportDurationVisible(true);
    setMessage("先選要暫停 1 分鐘還是 2 分鐘。");
  };

  const syncPhaseFromStep = (stepId: string) => {
    setRunning(false);
    if (stepId === "finish-mode" || stepId === "pack-up") {
      setMissionPhase("settle");
      return;
    }
    setMissionPhase("sop");
  };

  const applyMissionSopSelection = () => {
    const nextStep = Math.max(0, Math.min(missionSopFlowCards.length - 1, selectedMissionStep));
    const nextCard = missionSopFlowCards[nextStep] ?? activeSopCard;
    setCurrentStep(nextStep);
    setSelectedMissionSopIndex(null);
    setMessage(`已切到 ${nextCard.title}。現在先照這一步往下接。`);
  };

  const previewMissionSopStep = (direction: -1 | 1) => {
    const nextStep = Math.max(0, Math.min(missionSopFlowCards.length - 1, selectedMissionStep + direction));
    setSelectedMissionSopIndex(nextStep);
  };

  const moveToNextStep = () => {
    const nextIndex = Math.min(effectiveCurrentStep + 1, sopCards.length - 1);
    const nextCard = sopCards[nextIndex];
    const wasReturningFromWrapUp = justReturnedFromWrapUp;
    const wasContinuingAfterWrapUp = postWrapUpContinuationSteps > 0;
    const wasReturningToBlockedStep = wasReturningFromWrapUp && !!lastBlockedStep && activeSopCard.title === lastBlockedStep;
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(wasReturningFromWrapUp ? 1 : wasContinuingAfterWrapUp ? 0 : 0);
    setCurrentStep(nextIndex);
    syncPhaseFromStep(nextCard.id);
    setMessage(wasReturningToBlockedStep ? `卡點已接回。現在往 ${nextCard.title} 繼續。${nextCard.childLine}` : wasReturningFromWrapUp ? `主線已接回。現在往 ${nextCard.title} 繼續。${nextCard.childLine}` : wasContinuingAfterWrapUp ? `主線已恢復正常節奏。現在往 ${nextCard.title} 繼續。${nextCard.childLine}` : `SOP 前進到 ${nextCard.title}。${nextCard.childLine}`);
  };

  const moveToPrevStep = () => {
    const prevIndex = Math.max(effectiveCurrentStep - 1, 0);
    const prevCard = sopCards[prevIndex];
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setCurrentStep(prevIndex);
    syncPhaseFromStep(prevCard.id);
    setMessage(`回到 ${prevCard.title}。${prevCard.childLine}`);
  };

  const confirmCurrentStep = () => {
    const step = sopCards[effectiveCurrentStep] ?? sopCards[0];
    setShowParentHomeModules(true);
    setShowHomeDetails(true);

    if (step.id === "pack-up" && !settleChecklist.packupReady) {
      setMessage("還不能直接進入收尾整理,請先完成收尾 checklist。");
      return;
    }

    if (step.id === "pack-up") {
      const blockedStepMatch = lastBlockedStep ? sopCards.find((card) => card.title === lastBlockedStep && card.id !== "finish-mode" && card.id !== "pack-up") : null;
      const nextSopId = blockedStepMatch?.id ?? (lastMissionOutcome === "rescued" || !!lastBlockedStep || !!mostUsedTool ? "adjust" : "check-in");
      const nextSopIndex = Math.max(0, sopCards.findIndex((card) => card.id === nextSopId));
      const nextSopCard = sopCards[nextSopIndex] ?? sopCards[0];
      const returnToParentFlow = uiMode === "parent";
      setRunning(false);
      setMissionPhase("sop");
      setJustReturnedFromWrapUp(true);
      setPostWrapUpContinuationSteps(0);
      setCurrentStep(nextSopIndex);
      setShowParentHomeModules(returnToParentFlow);
      setShowHomeDetails(returnToParentFlow);
      setShowWeeklyDetails(false);
      setShowTodayDetails(false);
      setShowDataPlatform(false);
      setShowSupportTools(false);
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
      setLastMissionOrbGain(0);
      setLastSettledEvent(null);
      setCurrentEvent(null);
      setEventVisible(false);
      setMissionStartSnapshot(null);
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(2);
      setActiveSupportToolId(null);
      setSupportCountdown(0);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setMessage(returnToParentFlow ? (blockedStepMatch ? `這輪已經收好了。現在直接回 ${nextSopCard.title},家長先把孩子帶回剛剛卡住的那一步。` : nextSopId === "adjust" ? `這輪已經收好了。剛剛那個卡點,現在接回 ${nextSopCard.title},家長先看怎麼慢慢調回來。` : `這輪已經收好了。現在接回 ${nextSopCard.title},家長先看怎麼順著往下帶。`) : (blockedStepMatch ? `這輪已經收好了。現在直接回 ${nextSopCard.title},先把剛剛卡住的那一步接回來。` : nextSopId === "adjust" ? `這輪已經收好了。先回 ${nextSopCard.title},把剛剛卡住的地方慢慢調回來。` : `這輪已經收好了。現在接回 ${nextSopCard.title},順著做下一步。`));
      return;
    }

    if (step.id === "finish-mode") {
      setMissionPhase("settle");
      setMessage("這一段已經收住了。接下來把整輪再好好收好,就能順著回主線。");
      moveToNextStep();
      return;
    }

    moveToNextStep();
  };

  const confirmSettleItem = (key: "orbChecked" | "eventChecked" | "packupReady") => {
    setSettleChecklist((prev) => ({ ...prev, [key]: true }));

    if (key === "orbChecked") {
      setMessage(`已確認本輪拿到 ${lastMissionOrbGain} 顆能量球,接著確認世界事件。`);
      return;
    }
    if (key === "eventChecked") {
      setMessage("已確認世界事件結果。接著把這輪慢慢收好就可以了。");
      return;
    }
    setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "pack-up")));
    setMessage("這輪已經準備好收尾了。現在把它好好收住,等一下就回主線。");
  };

  const performPrimaryAction = () => {
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    if (missionPhase === "ready") {
      const readyCard = transitionCards.find((card) => card.id === "im-ready") ?? transitionCards[0];
      transitionNow(readyCard);
      return;
    }

    if (missionPhase === "challenge") {
      if (running) {
        setMessage("這一輪正在進行中。先完成、暫停,或使用穩一下。");
      } else {
        setMessage("目前仍在任務階段。若要重新開始,請先回 Ready Check。");
      }
      return;
    }

    confirmCurrentStep();
  };

  const canUseTransitionCard = (cardId: string) => {
    if (missionPhase === "settle") return false;
    if (missionPhase === "challenge" && cardId === "need-more-time") return false;
    return true;
  };

  const readyPhaseSkills = new Set(["listen-2"]);

  const canUseActiveSkill = (cardId: string) => {
    if (missionPhase === "settle") return false;
    if (missionPhase === "ready") return readyPhaseSkills.has(cardId);
    if (!running && (cardId === "pause-1" || cardId === "breather-1")) return false;
    return true;
  };

  const activeSkillAvailabilityLabel = (cardId: string) => {
    if (usedActiveSkills[cardId]) return "本輪已使用";
    if (missionPhase === "settle") return "收尾階段不可用";
    if (missionPhase === "ready") {
      if (readyPhaseSkills.has(cardId)) return "準備階段可先用";
      return "需進任務後可用";
    }
    if (!running && (cardId === "pause-1" || cardId === "breather-1")) return "任務進行中才可用";
    return "可使用";
  };

  const canTriggerException = (kind: "extra-time" | "break" | "restart") => {
    if (missionPhase === "settle") return false;
    if (kind === "extra-time") return extraTimeRequestsToday < exceptionCap;
    if (kind === "break") return breakCountToday < exceptionCap;
    return restartCountToday < exceptionCap;
  };

  const canConfirmCurrentStep = !(missionPhase === "settle" && !settleChecklist.packupReady && activeSopCard.id === "pack-up");

  const resetTestScenario = (preserveMessage = false) => {
    setRunning(false);
    setMissionPhase("ready");
    setCurrentStep(0);
    setRemaining(selectedChallenge.minutes * 60);
    setUsedActiveSkills({});
    setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
    setLastMissionOrbGain(0);
    setLastSettledEvent(null);
    setCurrentEvent(null);
    setEventVisible(false);
    setMissionStartSnapshot(null);
    setShowParentHomeModules(false);
    setShowHomeDetails(false);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setShowWeeklyDetails(false);
    setShowTodayDetails(false);
    setShowSupportTools(false);
    setShowDataPlatform(false);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setShowParentAssist(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    setSelectedSupportScenario(null);
    setSelectedSupportVariant(null);
    setParentAssistResultTag(null);
    if (!preserveMessage) {
      setMessage("測試情境已重置,可重新開始下一輪。");
    }
  };

  const runScenario = (scenario: ScenarioKind) => {
    setLastScenarioKind(scenario);
    resetTestScenario();

    if (scenario === "normal") {
      setMessage("測試模式:正常完成一輪。先從準備確認開始。");
      return;
    }
    if (scenario === "extra-time") {
      handleNeedMoreTime();
      return;
    }
    if (scenario === "break") {
      handleShortBreak();
      return;
    }
    if (scenario === "restart") {
      handleRestartFlow();
      return;
    }
    drawWorldEvent();
    setMessage("測試模式:已直接觸發一輪世界事件。");
  };

  const supportLayerMode =
    daysInSystem <= 7
      ? "大人陪跑模式:先由大人帶著孩子認識這些支援卡。"
      : daysInSystem <= 21
        ? "共同使用模式:孩子開始知道哪張卡能幫自己。"
        : "孩子自助模式:支援卡變成孩子自己會拿來穩定、打氣、重接的工具。";

  const selectedSupportScenarioConfig = selectedSupportScenario
    ? supportAssistScenarios.find((item) => item.id === selectedSupportScenario) ?? null
    : null;
  const selectedSupportVariantConfig = selectedSupportScenarioConfig?.variants?.find((item) => item.id === selectedSupportVariant) ?? null;
  const supportConfigTitle = selectedSupportVariantConfig?.title ?? selectedSupportScenarioConfig?.title ?? null;
  const supportConfigObserveLine = selectedSupportVariantConfig?.observeLine ?? selectedSupportScenarioConfig?.observeLine ?? "";
  const supportConfigSayLines = selectedSupportVariantConfig?.sayLines ?? selectedSupportScenarioConfig?.sayLines ?? [];
  const supportConfigAvoidLines = selectedSupportVariantConfig?.avoidLines ?? selectedSupportScenarioConfig?.avoidLines ?? [];
  const supportConfigQuickActions = selectedSupportVariantConfig?.quickActions ?? selectedSupportScenarioConfig?.quickActions ?? [];
  const supportConfigRecordTags = selectedSupportVariantConfig?.recordTags ?? selectedSupportScenarioConfig?.recordTags ?? [];
  const supportConfigNextStep = selectedSupportVariantConfig?.nextStep ?? selectedSupportScenarioConfig?.nextStep ?? "";
  const supportFirstSayLine = supportConfigSayLines[0] ?? selectedSupportScenarioConfig?.parentLine ?? "先把孩子接住,再決定下一步。";
  const supportFirstAction = supportConfigQuickActions[0] ?? "先做最小動作,再接回主線。";
  const supportShouldRouteToReadyCheck = missionPhase === "ready" && (
    selectedSupportScenarioConfig?.id === "start" ||
    selectedSupportVariantConfig?.id === "start_low_energy" ||
    selectedSupportVariantConfig?.id === "start_not_ready" ||
    selectedSupportVariantConfig?.id === "start_avoidance"
  );
  const supportShouldRouteToCurrentSop = missionPhase !== "ready" && (
    selectedSupportScenarioConfig?.id === "stuck" ||
    selectedSupportVariantConfig?.id === "stuck_lost_focus" ||
    selectedSupportVariantConfig?.id === "stuck_no_next_step" ||
    selectedSupportVariantConfig?.id === "stuck_perfection_freeze"
  );
  const supportShouldRouteToRestart = missionPhase !== "ready" && selectedSupportScenarioConfig?.id === "restart";
  const supportPrimaryTool = supportShouldRouteToReadyCheck || supportShouldRouteToCurrentSop || supportShouldRouteToRestart
    ? null
    : (selectedSupportScenarioConfig ? supportTools.find((tool) => tool.id === selectedSupportScenarioConfig.suggestedToolId) ?? null : null);
  const supportPrimaryActionLabel = supportShouldRouteToReadyCheck
    ? "先回 Ready Check"
    : supportShouldRouteToCurrentSop
      ? "先回目前 SOP"
      : supportShouldRouteToRestart
        ? "先接回主線"
        : `叫出 ${supportPrimaryTool?.title ?? "建議卡"}`;
  const supportPrimaryActionHint = supportShouldRouteToReadyCheck
    ? "先確認現在能不能開始，再決定要不要進這一輪。"
    : supportShouldRouteToCurrentSop
      ? "先把這一步縮成下一步，再回目前任務位置。"
      : supportShouldRouteToRestart
        ? "先保留已做到的地方，再接回最短可接點，不要直接整個重來。"
        : "先把支援卡叫出來，處理完再回主線，不用另外找入口。";
  const supportConfigSummaryTemplate = selectedSupportVariantConfig?.summaryTemplate ?? selectedSupportScenarioConfig?.summaryTemplate ?? "";
  const supportConfigNextTimeTemplate = selectedSupportVariantConfig?.nextTimeTemplate ?? selectedSupportScenarioConfig?.nextTimeTemplate ?? "";
  const supportConfigReviewAvoidTemplate = selectedSupportVariantConfig?.reviewAvoidTemplate ?? selectedSupportScenarioConfig?.reviewAvoidTemplate ?? "";
  const currentScenarioLogs = selectedSupportScenario
    ? parentAssistLogs.filter((entry) => entry.scenario === selectedSupportScenario && (!selectedSupportVariant || entry.variant === selectedSupportVariant))
    : [];
  const latestScenarioLog = currentScenarioLogs.length ? currentScenarioLogs[currentScenarioLogs.length - 1] : null;
  const currentScenarioLogCount = currentScenarioLogs.length;
  const currentScenarioTopTag = currentScenarioLogs.length
    ? Object.entries(currentScenarioLogs.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.tag] = (acc[entry.tag] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const currentScenarioTopResult = currentScenarioLogs.length
    ? Object.entries(currentScenarioLogs.reduce<Record<string, number>>((acc, entry) => {
        const key = entry.resultTag ?? "unmarked";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const overallTopScenario = parentAssistLogs.length
    ? Object.entries(parentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.scenario] = (acc[entry.scenario] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const overallTopVariant = parentAssistLogs.length
    ? Object.entries(parentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        const key = entry.variant ?? "no-variant";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const overallTopTag = parentAssistLogs.length
    ? Object.entries(parentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.tag] = (acc[entry.tag] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const overallTopResult = parentAssistLogs.length
    ? Object.entries(parentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        const key = entry.resultTag ?? "unmarked";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const overallTopScenarioTitle = overallTopScenario
    ? supportAssistScenarios.find((item) => item.id === overallTopScenario)?.title ?? overallTopScenario
    : null;
  const overallTopVariantTitle = overallTopVariant && overallTopVariant !== "no-variant"
    ? supportAssistScenarios.flatMap((item) => item.variants ?? []).find((item) => item.id === overallTopVariant)?.title ?? overallTopVariant
    : null;
  const overallTopResultLabel = overallTopResult === "smooth"
    ? "順利接住"
    : overallTopResult === "rescued"
      ? "補救接回"
      : overallTopResult === "stopped"
        ? "先停在這裡"
        : null;
  const recentParentAssistLogs = parentAssistLogs.slice(-3).reverse();
  const recentParentAssistHistory = parentAssistLogs.slice(-8).reverse().map((entry) => ({
    ...entry,
    scenarioTitle: supportAssistScenarios.find((item) => item.id === entry.scenario)?.title ?? entry.scenario,
    variantTitle: entry.variant
      ? supportAssistScenarios.flatMap((item) => item.variants ?? []).find((item) => item.id === entry.variant)?.title ?? entry.variant
      : null,
    resultLabel: entry.resultTag === "smooth"
      ? "順利接住"
      : entry.resultTag === "rescued"
        ? "補救接回"
        : entry.resultTag === "stopped"
          ? "先停在這裡"
          : null,
  }));
  const weeklyParentAssistLogs = parentAssistLogs.filter((entry) => entry.day >= Math.max(1, daysInSystem - (parentReviewWindowDays - 1)));
  const weeklyTopScenario = weeklyParentAssistLogs.length
    ? Object.entries(weeklyParentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.scenario] = (acc[entry.scenario] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const weeklyTopVariant = weeklyParentAssistLogs.length
    ? Object.entries(weeklyParentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        const key = entry.variant ?? "no-variant";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const weeklyTopResult = weeklyParentAssistLogs.length
    ? Object.entries(weeklyParentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        const key = entry.resultTag ?? "unmarked";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const weeklyTopTag = weeklyParentAssistLogs.length
    ? Object.entries(weeklyParentAssistLogs.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.tag] = (acc[entry.tag] ?? 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null;
  const weeklyTopScenarioTitle = weeklyTopScenario
    ? supportAssistScenarios.find((item) => item.id === weeklyTopScenario)?.title ?? weeklyTopScenario
    : null;
  const weeklyTopVariantTitle = weeklyTopVariant && weeklyTopVariant !== "no-variant"
    ? supportAssistScenarios.flatMap((item) => item.variants ?? []).find((item) => item.id === weeklyTopVariant)?.title ?? weeklyTopVariant
    : null;
  const weeklyTopResultLabel = weeklyTopResult === "smooth"
    ? "順利接住"
    : weeklyTopResult === "rescued"
      ? "補救接回"
      : weeklyTopResult === "stopped"
        ? "先停在這裡"
        : null;
  const parentAssistWeeklySummary = weeklyParentAssistLogs.length
    ? {
        summaryLine: weeklyTopVariantTitle
          ? `「${weeklyTopScenarioTitle}」裡的「${weeklyTopVariantTitle}」這種卡法。`
          : weeklyTopScenarioTitle
            ? `「${weeklyTopScenarioTitle}」這個情境。`
            : "這週已開始累積家長輔助記錄。",
        nextWeekLine:
          weeklyTopVariant === "start_low_energy"
            ? "先補能量、先暖身,不要一開始就拉正式任務。"
            : weeklyTopVariant === "start_not_ready"
              ? "先做 Ready Check,先確認準備度。"
              : weeklyTopVariant === "start_avoidance"
                ? "先把開始縮成最小動作,先靠近再推進。"
                : weeklyTopVariant === "emotion_overloaded"
                  ? "先降要求和刺激,避免一開始就太滿。"
                  : weeklyTopVariant === "emotion_opposed"
                    ? "先減少對拉,先保合作感。"
                    : weeklyTopVariant === "emotion_hurt"
                      ? "先接住委屈感,再談任務。"
                      : weeklyTopVariant === "stuck_lost_focus"
                        ? "先拉回注意力,再接眼前一步。"
                        : weeklyTopVariant === "stuck_no_next_step"
                          ? "先把下一步講清楚,不要整段一起丟。"
                          : weeklyTopVariant === "stuck_perfection_freeze"
                            ? "先降低做錯壓力,再推下一步。"
                            : weeklyTopTag === "補能量後有回來"
                              ? "先補能量,再決定今天要不要進任務。"
                              : weeklyTopTag === "先穩住有效"
                                ? "先穩情緒,再回主線。"
                                : weeklyTopTag === "縮步有效"
                                  ? "先縮成下一步,再往前推。"
                                  : "先繼續累積記錄,讓模式更清楚。",
        resultLine: weeklyTopResultLabel
          ? `${weeklyTopResultLabel}。`
          : "結果還不夠集中,先繼續觀察。",
        riskLine: weeklyTopTag
          ? `「${weeklyTopTag}」這種線索。`
          : "卡點線索還不夠集中。",
        startStrategyLine:
          weeklyTopVariant === "start_low_energy"
            ? "先補能量、先暖身,再決定要不要正式開始。"
            : weeklyTopVariant === "start_not_ready"
              ? "先確認 ready,不急著直接進任務。"
              : weeklyTopVariant === "start_avoidance"
                ? "先讓孩子靠近開始,不要先要求完整做。"
                : weeklyTopVariant === "emotion_overloaded"
                  ? "先降載、先減刺激,再回主線。"
                  : weeklyTopVariant === "emotion_opposed"
                    ? "先停對拉,先保住合作感。"
                    : weeklyTopVariant === "emotion_hurt"
                      ? "先接住委屈感,再談任務。"
                      : weeklyTopVariant === "stuck_lost_focus"
                        ? "先把注意力拉回來,再接眼前一步。"
                        : weeklyTopVariant === "stuck_no_next_step"
                          ? "先把下一步講清楚,再往前推。"
                          : weeklyTopVariant === "stuck_perfection_freeze"
                            ? "先降低做錯壓力,再讓孩子動起來。"
                            : "先看狀態,再決定推進速度。",
        effectiveLine:
          weeklyTopTag === "補能量後有回來"
            ? "先補能量,再帶回任務。"
            : weeklyTopTag === "先穩住有效"
              ? "先穩住情緒,再回主線。"
              : weeklyTopTag === "縮步有效"
                ? "先縮成下一步,再接 SOP。"
                : weeklyTopTag === "指出一步有效"
                  ? "先把下一步指出來。"
                  : weeklyTopTag === "允許出錯後有回來"
                    ? "先允許不完美,再讓孩子往前。"
                    : "目前還在累積中。",
        riskTalkLine:
          weeklyTopVariant === "start_avoidance"
            ? "太快把拖延講成不配合。"
            : weeklyTopVariant === "emotion_opposed"
              ? "在對抗升高時繼續加壓。"
              : weeklyTopVariant === "emotion_hurt"
                ? "委屈時急著講道理。"
                : weeklyTopVariant === "stuck_no_next_step"
                  ? "一次把整段都講完。"
                  : weeklyTopVariant === "stuck_perfection_freeze"
                    ? "把做錯的壓力講得太重。"
                    : weeklyTopTag
                      ? `遇到「${weeklyTopTag}」這類情況時,太快往前推。`
                      : "目前還在累積中。",
      }
    : null;
  const parentAssistOverallSummary = parentAssistLogs.length
    ? {
        summaryLine: overallTopVariantTitle
          ? `「${overallTopScenarioTitle}」裡的「${overallTopVariantTitle}」。`
          : overallTopScenarioTitle
            ? `「${overallTopScenarioTitle}」這個情境。`
          : "已開始累積家長輔助記錄。",
        nextTimeLine:
          overallTopVariant === "start_low_energy"
            ? "先補能量、先讓孩子上線,再決定要不要直接進任務。"
            : overallTopVariant === "start_not_ready"
              ? "先做 Ready Check,先確認準備度,再決定任務長度。"
              : overallTopVariant === "start_avoidance"
                ? "先把開始縮成最小動作,先靠近,不要先要求完成。"
                : overallTopVariant === "emotion_overloaded"
                  ? "先減少要求和刺激,先降載,再回主線。"
                  : overallTopVariant === "emotion_opposed"
                    ? "先停止對拉,先退半步,再找回合作感。"
                    : overallTopVariant === "emotion_hurt"
                      ? "先接住委屈感,再談任務,效果通常會比較好。"
                      : overallTopVariant === "stuck_lost_focus"
                        ? "先把注意力拉回來,再接目前這一步。"
                        : overallTopVariant === "stuck_no_next_step"
                          ? "先把下一步指出來,不要把整段都交給孩子自己拆。"
                          : overallTopVariant === "stuck_perfection_freeze"
                            ? "先降低『一定要做對』的壓力,再推下一步。"
                            : overallTopTag === "補能量後有回來"
            ? "先從補能量或短任務起手,通常比直接催開始更有效。"
            : overallTopTag === "先穩住有效"
              ? "先穩住情緒,再決定回 Ready Check 還是回 SOP。"
              : overallTopTag === "縮步有效"
                ? "先把要求縮成眼前一步,再接回目前 SOP。"
                : "再多累積幾次後,這裡會更像真的陪跑回顧。",
        resultLine: overallTopResultLabel
          ? `${overallTopResultLabel}。`
          : "結果還不夠集中,先繼續累積。",
        patternLine: overallTopVariantTitle
          ? `「${overallTopVariantTitle}」這一型。`
          : overallTopTag
            ? `「${overallTopTag}」這種線索。`
            : "累積還不夠,先繼續讓模式浮出來。",
      }
    : null;
  const parentAssistReviewSummary = selectedSupportScenarioConfig
    ? {
        summaryLine:
          parentAssistResultTag === "smooth"
            ? `${supportConfigSummaryTemplate} 這次現場有順利接住。`
            : parentAssistResultTag === "rescued"
              ? `${supportConfigSummaryTemplate} 這次有靠支援卡接回來。`
              : parentAssistResultTag === "stopped"
                ? `${supportConfigSummaryTemplate} 這次先停在這裡比較合理。`
                : supportConfigSummaryTemplate,
        nextTimeLine:
          currentScenarioTopTag === "補能量後有回來"
            ? "下次一開始就先補能量,再決定要不要直接進任務。"
            : currentScenarioTopTag === "先穩住有效"
              ? "下次先穩情緒,再決定回主線的接點。"
              : currentScenarioTopTag === "縮步有效"
                ? "下次先把要求縮成眼前一步,再接回 SOP。"
                : supportConfigNextTimeTemplate,
        avoidLine: supportConfigReviewAvoidTemplate,
      }
    : null;
  const buildParentReviewReportBody = () => {
    const recentLines = parentAssistOverallSummary
      ? [
          formatBulletLine("最近重點", parentAssistOverallSummary.summaryLine),
          formatBulletLine("最近下次", parentAssistOverallSummary.nextTimeLine),
          formatBulletLine("最近結果", parentAssistOverallSummary.resultLine),
          formatBulletLine("最近模式", parentAssistOverallSummary.patternLine),
        ]
      : [formatBulletLine("最近重點", "尚未累積陪跑記錄")];

    const weeklyLines = parentAssistWeeklySummary
      ? [
          formatBulletLine("本週摘要", parentAssistWeeklySummary.summaryLine),
          formatBulletLine("本週起手", parentAssistWeeklySummary.startStrategyLine),
          formatBulletLine("本週有效", parentAssistWeeklySummary.effectiveLine),
          formatBulletLine("本週雷點", parentAssistWeeklySummary.riskTalkLine),
          formatBulletLine("下週建議", parentAssistWeeklySummary.nextWeekLine),
        ]
      : [formatBulletLine("本週摘要", "本週記錄還不夠,先繼續累積")];

    const historyLines = recentParentAssistHistory.length
      ? recentParentAssistHistory.slice(0, 6).map((entry, index) => formatNumberedLine(index + 1, `${entry.scenarioTitle}${entry.variantTitle ? `-${entry.variantTitle}` : ""}`, `${entry.tag}${entry.resultLabel ? `|${entry.resultLabel}` : ""}`))
      : [formatBulletLine("歷史", "目前尚無可輸出的陪跑記錄")];

    return [
      formatShareBlock("PARENT REVIEW SNAPSHOT", [formatBulletLine("Child", childName), formatBulletLine("Total logs", String(parentAssistLogs.length))]),
      formatShareBlock("RECENT REVIEW", recentLines),
      formatShareBlock("WEEKLY REVIEW", weeklyLines),
      formatShareBlock("RECENT HISTORY", historyLines),
    ].join("\n\n");
  };
  const selectedSupportSceneImage = selectedSupportScenario === "pause"
    ? childSceneImages.pauseHand
    : selectedSupportScenario === "emotion"
      ? childSceneImages.selfRegulate
      : selectedSupportScenario
        ? childSceneImages.guidedHelpFinal
        : null;

  const pendingTimedTool = pendingTimedAction?.toolId
    ? [...supportTools, ...activeSkills].find((tool) => tool.id === pendingTimedAction.toolId) ?? null
    : null;
  const activeSupportTool = activeSupportToolId
    ? [...supportTools, ...activeSkills].find((tool) => tool.id === activeSupportToolId) ?? null
    : null;
  const supportGuideTool = supportGuideToolId
    ? supportTools.find((tool) => tool.id === supportGuideToolId) ?? null
    : null;
  const supportGuide = supportGuideToolId ? supportToolGuides[supportGuideToolId] ?? null : null;
  const phaseDwellSeconds = Math.max(0, Math.floor((Date.now() - phaseEnteredAtMs) / 1000));

  const primaryActionLabel =
    missionPhase === "ready"
      ? "進入挑戰"
      : missionPhase === "challenge"
        ? running
          ? "任務進行中"
          : "任務階段中"
        : missionPhase === "sop"
          ? "完成這步"
          : "完成收尾";

  const applySupportTool = (card: ToolCard, supportMinutes?: number) => {
    setMostUsedTool(card.title);
    setActiveSupportToolId(card.id);
    setSupportCountdown((supportMinutes ?? 0) * 60);
    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);

    if (card.id === "emotion-cooler") {
      setEmotionPower((prev) => clamp(prev + 8));
      setMessage(`Emotion Cooler 啟動:先讓情緒降下來,再回主線。這次先給 ${formatSupportDurationLabel(supportMinutes ?? 0)} 冷靜時間。`);
      return;
    }
    if (card.id === "energy-boost") {
      setBonusOrbs((prev) => Math.min(2, prev + 1));
      setMessage(`Energy Boost 啟動:先補一點能量,讓孩子比較願意進場。這次先給 ${formatSupportDurationLabel(supportMinutes ?? 0)} 支持時間。`);
      return;
    }
    if (card.id === "focus-advantage") {
      setFocusPower((prev) => clamp(prev + 6));
      setMessage(`Focus Advantage 啟動:先把注意力拉回來,不要急著催進度。先給 ${formatSupportDurationLabel(supportMinutes ?? 0)} 整理注意力。`);
      return;
    }
    if (card.id === "progress-lock") {
      setRunning(false);
      setMissionPhase((prev) => (prev === "settle" ? "settle" : "sop"));
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(2);
      setActiveSupportToolId(null);
      setSupportCountdown(0);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setSupportResumePhase(null);
      setSupportResumeRunning(false);
      setCardGuideModal(null);
      setSupportGuideToolId(null);
      setPendingChallengeSwitchId(null);
      setMessage(`Progress Lock 啟動:先把已做到的地方鎖住,中斷也不算白費。先保留 ${formatSupportDurationLabel(supportMinutes ?? 0)} 的緩衝。`);
      return;
    }
    if (card.id === "time-freeze") {
      setRunning(false);
      setMissionPhase("ready");
      setCurrentStep(0);
      setShowParentHomeModules(false);
      setShowHomeDetails(false);
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(2);
      setActiveSupportToolId(null);
      setSupportCountdown(0);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setSupportResumePhase(null);
      setSupportResumeRunning(false);
      setCardGuideModal(null);
      setSupportGuideToolId(null);
      setPendingChallengeSwitchId(null);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setMessage(`Time Freeze 啟動:先暫停一下,等穩了再重新進場。這次先停 ${formatSupportDurationLabel(supportMinutes ?? 0)}。`);
      return;
    }

    setMessage(`${card.title} 已啟動。`);
  };

  const appendParentAssistLog = (scenario: SupportAssistScenario, tag: string, resultTag?: ParentAssistResultTag | null) => {
    setParentAssistLogs((prev) => [...prev, { day: daysInSystem, scenario, variant: selectedSupportVariant, missionPhase, tag, resultTag: resultTag ?? null }]);
  };

  const archiveOlderParentAssistLogs = () => {
    const cutoffDay = Math.max(1, daysInSystem - (parentReviewWindowDays - 1));
    const olderLogs = parentAssistLogs.filter((entry) => entry.day < cutoffDay);
    if (!olderLogs.length) {
      setMessage(`目前沒有超過最近 ${parentReviewWindowDays} 天的陪跑記錄可收納。`);
      return;
    }
    const archive: ParentAssistArchive = {
      id: `parent-assist-archive-${Date.now()}`,
      archivedAtDay: daysInSystem,
      label: `Day ${daysInSystem} 收納|保留最近 ${parentReviewWindowDays} 天`,
      logs: olderLogs,
    };
    setParentAssistArchives((prev) => [archive, ...prev]);
    setParentAssistLogs((prev) => prev.filter((entry) => entry.day >= cutoffDay));
    setMessage(`已收納 ${olderLogs.length} 筆較舊陪跑記錄,保留最近 ${parentReviewWindowDays} 天。`);
  };

  const activateSupportTool = (card: ToolCard) => {
    setJustReturnedFromWrapUp(false);
    const durationOptions = supportDurationPresets[card.id];
    if (durationOptions && durationOptions.length > 0) {
      setPendingTimedAction({ kind: "tool", toolId: card.id, label: card.title, options: durationOptions });
      setSelectedSupportMinutes(durationOptions[0]);
      setSupportDurationVisible(true);
      setMessage(`先選 ${card.title} 要用多久。`);
      return;
    }
    applySupportTool(card);
  };

  const confirmSupportToolDuration = () => {
    if (!pendingTimedAction) {
      setSupportDurationVisible(false);
      setMessage("目前沒有可確認的計時支援。");
      return;
    }
    if ((pendingTimedAction.kind === "pause-mission" || pendingTimedAction.toolId === "pause-1" || pendingTimedAction.toolId === "breather-1" || pendingTimedAction.toolId === "listen-2") && (missionPhase !== "challenge" || !running)) {
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(0.5);
      setMessage("現在不是啟動這個計時支援的時候。請先回到任務進行中。");
      return;
    }
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    if (pendingTimedAction.kind === "pause-mission") {
      setSupportResumePhase(missionPhase);
      setSupportResumeRunning(running);
      setRunning(false);
      setMissionPhase("sop");
      setCurrentStep(Math.max(currentStep, 0));
      setActiveSupportToolId("pause-1");
      setSupportCountdown(selectedSupportMinutes * 60);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setMessage(`任務暫停啟動:先停 ${formatSupportDurationLabel(selectedSupportMinutes)},再回來。`);
    } else if (pendingTimedTool) {
      if (pendingTimedTool.family === "active") {
        setSupportResumePhase(missionPhase);
        setSupportResumeRunning(running);
        setUsedActiveSkills((prev) => ({ ...prev, [pendingTimedTool.id]: true }));
        setMostUsedTool(pendingTimedTool.title);
        setActiveSupportToolId(pendingTimedTool.id);
        setSupportCountdown(selectedSupportMinutes * 60);
        setSupportNeedsReturn(false);
        setSupportReturnPromptVisible(false);
        setRunning(false);
        setMissionPhase("sop");
        if (pendingTimedTool.id === "pause-1") {
          setBreakCountToday((prev) => prev + 1);
          setMessage(`Pause Mode 啟動:先停 ${formatSupportDurationLabel(selectedSupportMinutes)},再回來。`);
        } else if (pendingTimedTool.id === "breather-1") {
          setEmotionPower((prev) => clamp(prev + 6));
          setMessage(`穩一下啟動:先呼吸 ${formatSupportDurationLabel(selectedSupportMinutes)},再回來。`);
        } else if (pendingTimedTool.id === "listen-2") {
          setFocusPower((prev) => clamp(prev + 4));
          setMessage(`Listen Mode 啟動:先聽 ${formatSupportDurationLabel(selectedSupportMinutes)},再回來輪到自己說。`);
        }
      } else {
        setShowSupportTools(true);
        applySupportTool(pendingTimedTool, selectedSupportMinutes);
      }
    }
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(0.5);
  };

  const completeSupportReturn = (target: "ready" | "sop" | "restart" | "settle") => {
    if (!activeSupportToolId && !supportReturnPromptVisible && !timedSupportFullscreenVisible) {
      setMessage("目前沒有需要結束並接回的計時支援。");
      return;
    }
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    if (target === "ready") {
      setRunning(false);
      setMissionPhase("ready");
      setCurrentStep(0);
      setShowParentHomeModules(false);
      setShowHomeDetails(false);
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSelectedSupportMinutes(2);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setMessage("支援時間結束,先回 Ready Check。這不是重來,而是先重新確認怎麼進場。");
    } else if (target === "sop") {
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      if (supportResumePhase === "challenge" && supportResumeRunning) {
        setRunning(true);
        setMissionPhase("challenge");
        setMessage("支援時間結束,已直接回到原本那輪任務。剛剛只是短暫支援,現在繼續跑。" );
      } else {
        setRunning(false);
        setMissionPhase(supportResumePhase ?? "sop");
        setMessage("支援時間結束,回到目前主線。剛剛沒有掉線,現在先從這裡繼續。" );
      }
    } else if (target === "restart") {
      setRunning(false);
      setMissionPhase("sop");
      setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "check-in")));
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setMessage("支援時間結束,先回 Check-In 接回流程。不是重開整輪,而是從可接住的地方回來。" );
    } else {
      setRunning(false);
      setMissionPhase("settle");
      setCurrentStep(Math.max(0, sopCards.findIndex((card) => card.id === "pack-up")));
      setSettleChecklist({ orbChecked: false, eventChecked: false, packupReady: false });
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setMessage("支援時間結束,這一輪先收尾。不是斷掉,而是先做一個乾淨的結束點。" );
    }

    setSupportNeedsReturn(false);
    setSupportReturnPromptVisible(false);
    setSupportDurationVisible(false);
    setPendingTimedAction(null);
    setSelectedSupportMinutes(2);
    setCardGuideModal(null);
    setSupportGuideToolId(null);
    setPendingChallengeSwitchId(null);
    setActiveSupportToolId(null);
    setSupportCountdown(0);
    setSupportResumePhase(null);
    setSupportResumeRunning(false);
  };

  const openTimeChallengeGuide = (card: TimeChallenge) => {
    setMessage(`已打開 ${card.name} 的使用說明。`);
    setCardGuideModal({
      title: card.name,
      purpose: `先看什麼:這張時間挑戰卡代表 ${card.tier},重點不是分鐘數,而是今天要用哪種進場形態。`,
      situations: [card.whenToUse ?? "今天要正式進場", "孩子需要明確開始點", "想依任務難度選不同挑戰強度"],
      parentLine: `先說什麼:${card.parentHint ?? "我們先用這張出戰型態,完成這一輪就好。"}`,
      minutes: card.untimed ? "帶法重點:不限時,以完成任務為主。" : `帶法重點:先守住這 ${card.minutes} 分鐘,成功率比分鐘數更重要。`,
      returnHint: card.untimed ? "接回流程:完成任務後手動按『完成這輪』,再進入收尾 / 結算。" : "接回流程:時間到後進入收尾 / 結算,再決定下一輪。",
      avoidLine: card.untimed ? "先不要這樣說:不要一邊說不限時,一邊又持續催快;這張的重點是完成任務,不是被時間追。" : "先不要這樣說:不要一開始就選太長;先選撐得住的,成功率比分鐘數更重要。",
      actionLabel: "選這張挑戰卡",
      actionKind: "select-challenge",
      actionTargetId: card.id,
    });
  };

  const openTransitionGuide = (card: ToolCard) => {
    const guide = transitionGuides[card.id];
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setMessage(`已打開 ${card.title} 的使用說明。`);
    setCardGuideModal({
      title: card.title,
      purpose: `先看什麼:${guide?.purpose ?? "幫孩子做狀態切換,從還沒準備好到能進主線。"}`,
      situations: guide?.situations ?? ["開始前不確定能不能進場", "需要多一點緩衝", "要從冷靜切到行動"],
      parentLine: `先說什麼:${guide?.parentLine ?? card.parentHint}`,
      minutes: `帶法重點:${guide?.minutes ?? "通常 1-3 分鐘內完成判斷或過渡"}`,
      returnHint: `接回流程:${guide?.returnHint ?? "依卡片性質回 Ready Check、Challenge 或暫時短休後再決定。"}`,
      avoidLine: card.id === "need-more-time" ? "先不要這樣說:不要一延再延到整輪散掉;時間到後要回 Ready Check 再決定。" : card.id === "break-time" ? "先不要這樣說:不要把短休變成直接消失;休息後還是要回來接流程。" : "先不要這樣說:不要一邊切換狀態一邊塞很多指令,先完成切換再說下一步。",
      actionLabel: "使用這張卡",
      actionKind: "use-transition",
      actionTargetId: card.id,
    });
  };

  const formatSupportDurationLabel = (minutes: number) => minutes === 0.5 ? "30 秒" : `${minutes} 分鐘`;

  const openActiveSkillGuide = (card: ToolCard) => {
    const guide = activeSkillGuides[card.id];
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setMessage(`已打開 ${card.title} 的使用說明。`);
    setCardGuideModal({
      title: card.title,
      purpose: `先看什麼:${guide?.purpose ?? "這張是任務中的主動技能,不是常駐效果,而是需要時才施放。"}`,
      situations: guide?.situations ?? ["正在任務中", "孩子卡住但還沒完全脫軌", "需要一個小補救而不是整輪中止"],
      parentLine: `先說什麼:${guide?.parentLine ?? card.parentHint}`,
      minutes: `帶法重點:${guide?.minutes ?? "多數為短介入;先用 30 秒或 1 分鐘把孩子接回來。"}`,
      returnHint: `接回流程:${guide?.returnHint ?? "技能用完後回當前挑戰或 SOP,不要把主線整個切掉。"}`,
      imageSource: card.imageSource,
      avoidLine: "先不要這樣說:不要把技能當成逃離流程的理由;技能是幫你接回,不是幫你退出。",
      actionLabel: "使用這張卡",
      actionKind: "use-active-skill",
      actionTargetId: card.id,
    });
  };

  const openSopGuide = (card: ToolCard) => {
    const guide = sopGuides[card.id];
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setMessage(`已打開 ${card.title} 的使用說明。`);
    setCardGuideModal({
      title: card.title,
      purpose: `先看什麼:${guide?.purpose ?? "這張是主流程步驟卡,幫孩子知道現在只要做哪一步。"}`,
      situations: guide?.situations ?? ["需要拆小步驟", "做到一半不知道下一步", "要把任務收回到結構裡"],
      parentLine: `先說什麼:${guide?.parentLine ?? card.parentHint}`,
      minutes: `帶法重點:${guide?.minutes ?? "通常 1-3 分鐘看一個步驟,不用一次想完整輪"}`,
      returnHint: `接回流程:${guide?.returnHint ?? "完成這步後,再接下一張 SOP 或進入收尾。"}`,
      avoidLine: "先不要這樣說:不要一次把整輪任務全講完;SOP 的重點是孩子現在只要先做到這一步。",
      actionLabel: "回到這一步",
      actionKind: "focus-sop",
      actionTargetId: card.id,
    });
  };

  const openHeroGuide = (hero: HeroCard) => {
    const heroRule = heroRuleBook[hero.id];
    const isCurrentWeeklyHero = weeklyHero.heroId === hero.id;
    setMessage(`已打開 ${hero.name} 的使用說明。`);
    setCardGuideModal({
      title: hero.name,
      purpose: hero.kind === "ascend" ? "這張是主角成長 / 升階卡。" : "這張是支援英雄卡,會在特定情境幫孩子撐過這一輪。",
      situations: hero.kind === "ascend" ? ["累積任務達標", "要看長期成長線", "要確認升階里程碑"] : [isCurrentWeeklyHero ? "這張已是本週英雄" : "本週要選一位英雄陪跑", "某種困難反覆出現", "需要固定一週的支持角色"],
      parentLine: hero.kind === "ascend" ? "這不是單張卡升級,是 Holton 本人的成長。" : `${hero.power}${heroRule ? `|技能:${heroRule.skillName}` : ""}`,
      minutes: heroRule ? `本週有效 7 天 / 可用 ${heroRule.baseUses} 次 / 目前剩 ${isCurrentWeeklyHero ? weeklyHero.usesLeft : heroRule.baseUses} 次` : "依角色規則而定",
      returnHint: hero.kind === "ascend" ? `目前累積 ${totalMissionClears} 次任務,下一階需要 ${nextHeroUpgradeAt}。看完後回日常任務繼續累積。` : isCurrentWeeklyHero ? "如果現在正卡住,可直接在本輪施放這位本週英雄技能,再回 Challenge 或 SOP。" : "選成每週英雄後,回到日常任務線,讓這位英雄陪你撐一週。",
      avoidLine: hero.kind === "ascend" ? "不要把升階當作立刻拿到新功能;它是長期里程碑。" : "不要每次都換英雄;一週先固定一位,比較看得出哪張卡真的有幫助。",
      actionLabel: hero.kind === "ascend" ? "回到升階線" : isCurrentWeeklyHero ? "看本週英雄" : "選這張英雄",
      actionKind: "select-hero",
      actionTargetId: hero.id,
    });
  };

  const openGuardianGuide = (beast: GuardianBeast) => {
    const beastOrbs = guardianProgress[beast.id]?.orbs ?? 0;
    const nextStage = beast.stages.find((stage) => beastOrbs < stage.cost);
    setMessage(`已打開 ${beast.name} 的使用說明。`);
    setCardGuideModal({
      title: beast.name,
      purpose: "守護獸是長期養成與挑戰系統,不是一次性消耗卡。",
      situations: ["想看長期累積進度", "準備消耗資格進場挑戰", "要確認下一階段還差多少"],
      parentLine: `${beast.vibe}|目前 ${beastOrbs} Orbs / 挑戰資格 ${guardianChallengeTokens}。先看累積,再決定要不要進場挑戰。`,
      minutes: "不是即時倒數卡;重點是階段累積、資格與挑戰時機",
      returnHint: nextStage ? `下一階 ${nextStage.label} 還差 ${Math.max(0, nextStage.cost - beastOrbs)} Orbs。確認挑戰與結果後,回到日常任務繼續累積。` : "這隻守護獸已到最高階,之後重點是維持與承接成就感。",
      avoidLine: "不要看到有資格就立刻挑戰;先看孩子今天的狀態和這隻守護獸目前進度。",
      actionLabel: "選這隻守護獸",
      actionKind: "select-guardian",
      actionTargetId: beast.id,
    });
  };

  const openWorldEventGuide = (event: EventCard) => {
    const familyHint = event.family === "bonus"
      ? "這類事件重點是資源加成。"
      : event.family === "trace"
        ? "這類事件重點是把世界事件轉成守護獸線索或挑戰資格。"
        : event.family === "future"
          ? "這類事件重點是幫你打開下一條路,而不是只給獎勵。"
          : event.family === "recovery"
            ? "這類事件偏向回穩與恢復。"
            : event.family === "surprise"
              ? "這類事件偏向驚喜與儀式感。"
              : "這類事件通常代表高階轉折或重要提示。";
    setMessage(`已打開 ${event.title} 的使用說明。`);
    setCardGuideModal({
      title: event.title,
      purpose: `世界事件是 App 原生事件卡,用來加入變化、驚喜與條件式分流。${familyHint}`,
      situations: ["世界事件被抽到", "家長想理解這張事件會造成什麼效果", "要決定怎麼承接事件結果"],
      parentLine: `${event.reward}${event.effect ? "|這張會直接改變系統狀態" : "|這張偏向情境承接"}`,
      minutes: event.family === "recovery" ? "通常 1-3 分鐘緩衝" : "多數立即判定;必要時再加短暫承接時間",
      returnHint: event.family === "trace" ? "看事件結果接到 Guardian Trace / 挑戰資格,再回主線。" : event.family === "future" ? "看事件結果決定要不要換下一條路,再回主線。" : "看事件結果接到 Bonus、收尾或下一個流程點。",
      avoidLine: "不要把世界事件當成額外混亂;它是幫這一輪增加變化,不是把主線打散。",
      actionLabel: "抽一張世界事件",
      actionKind: "draw-world-event",
    });
  };

  const openBadgeGuide = (badge: BadgeState) => {
    setMessage(`已打開 ${badge.title} 的使用說明。`);
    setCardGuideModal({
      title: badge.title,
      purpose: "徽章同時是收集材料與里程碑,不只是好看而已。",
      situations: [badge.collected ? "這張已經收集到" : "這張還沒收集到", "要看召喚還差哪些材料", "要讓孩子看到已經累積到哪裡"],
      parentLine: `${badge.role}${badge.collected ? "|這張已經入袋,可作為成就承接。" : "|這張還在努力中。"}`,
      minutes: "不是倒數卡,重點是累積、達標、承接成就感",
      returnHint: `${summonTokenReady ? "目前 5 個核心徽章已收齊,可轉成召喚憑證。" : `目前已收集 ${collectedBadgeCount}/5,還要繼續累積。`}看完後回到任務線或召喚 / 升階線繼續累積。`,
      avoidLine: "不要把徽章只當貼紙;它們是材料、成就,也是後面召喚與升階的橋。",
    });
  };

  const openEnergyCardGuide = (energy: EnergyCard) => {
    setMessage(`已打開 ${energy.label} 的使用說明。`);
    setCardGuideModal({
      title: `${energy.label} ${energy.kind === "daily" ? "日常能量球" : "加成能量球"}`,
      purpose: energy.kind === "daily" ? "這是日常任務最常拿到的小額能量球。" : "這是比較少見的加成球,用來放大完成感或特殊獎勵。",
      situations: energy.kind === "daily" ? ["完成一輪任務", "日常穩定推進", "要讓孩子感受到小步成功"] : ["重大完成", "特殊獎勵", "需要放大成就感的時刻"],
      parentLine: energy.kind === "daily" ? "這是你這一輪穩穩拿到的能量。" : "這顆不是每天都有,是因為這次真的很值得。",
      minutes: "通常在任務完成或收尾時立即發放",
      returnHint: "發球後回收尾 / 記帳,再決定要不要下一輪。",
      avoidLine: energy.kind === "daily" ? "不要把日常球給得忽大忽小;穩定感比驚喜更重要。" : "不要把加成球天天給,否則高價值感會被稀釋。",
    });
  };

  const openFlowGuide = () => {
    setMessage("已打開任務主流程說明。");
    setCardGuideModal({
      title: "任務主流程",
      purpose: "先確定現在在哪個階段,才知道該出哪種卡、該怎麼接。",
      situations: ["剛準備開始", "任務中切換階段", "支援卡用完後要接回主線"],
      parentLine: "先不要一次講很多,先確認現在是在準備、出戰、流程中,還是收尾。",
      minutes: "不是倒數卡;重點是判斷當前階段",
      returnHint: "確認階段後,再去 Ready / Challenge / SOP / Settle 對應區塊。",
      avoidLine: "不要在還沒判斷階段時就亂出卡,先知道現在在哪裡,後面才不會越幫越亂。",
      actionLabel: "看家長輔助",
      actionKind: "open-parent-assist",
      actionTargetId: missionPhase === "ready" ? "start" : missionPhase === "sop" ? "stuck" : "pause",
    });
  };

  const openDailyStatusGuide = () => {
    setMessage("已打開今日狀態卡說明。");
    setCardGuideModal({
      title: "今日狀態卡",
      purpose: "讓家長先看今天還有多少任務輪、Bonus、事件與挑戰資格。",
      situations: ["想知道今天還能不能再跑一輪", "想看 Bonus 還剩多少", "想看事件與挑戰資格是否夠用"],
      parentLine: "先看今天還剩多少資源,再決定接下來是推進、支援,還是先收尾。",
      minutes: "不是倒數卡;是今天整體節奏的儀表板",
      returnHint: "看完後回主流程,決定要開始任務、用支援卡,或直接結束今天。",
      avoidLine: "不要只看單一數字就硬推下一輪,要一起看任務次數、Bonus、事件和挑戰資格。",
      actionLabel: "展開今日細節",
      actionKind: "expand-daily",
    });
  };

  const openWeeklyOverviewGuide = () => {
    setMessage("已打開本週總覽說明。");
    setCardGuideModal({
      title: "本週總覽",
      purpose: "快速看本週的長期重點,不要把所有長期模組一次擠進當下流程。",
      situations: ["想看本週英雄與守護獸狀況", "想知道升階和徽章進度", "決定要不要展開長期模組"],
      parentLine: "先看重點,再決定要不要展開細節,不要讓長期資訊壓住當前任務。",
      minutes: "通常 30 秒到 1 分鐘內看重點即可",
      returnHint: "看完後回到今天任務,或再展開某個長期模組深入查看。",
      avoidLine: "不要一開始就把所有長期模組全部打開,會讓家長和孩子都被資訊壓住。",
      actionLabel: "展開長期模組",
      actionKind: "expand-weekly",
    });
  };

  const openUpgradeGuide = () => {
    setMessage("已打開升階 / 徽章 / 召喚說明。");
    setCardGuideModal({
      title: "升階 / 徽章 / 召喚",
      purpose: "把 Holton 的長期成長、徽章收集、召喚憑證放在同一條成長線裡。",
      situations: ["想確認能不能升階", "想知道徽章有什麼用", "想看召喚憑證條件是否達成"],
      parentLine: "這裡不是當下任務工具,而是把每一輪努力慢慢變成可看見的成長。",
      minutes: "不是倒數卡;通常作為任務後回顧或里程碑檢查",
      returnHint: "看完後回日常任務繼續累積,或在達標時承接升階 / 召喚。",
      avoidLine: "不要在孩子情緒還很滿的當下硬談升階;這一塊比較適合任務後回顧。",
      actionLabel: "檢查是否可升階",
      actionKind: "check-upgrade",
    });
  };

  const openOrbGuide = () => {
    setMessage("已打開能量球 / Orb 模組說明。");
    setCardGuideModal({
      title: "能量球 / Orb 模組",
      purpose: "讓家長知道日常小額獎勵、加成球與高階特權球各自怎麼承接。",
      situations: ["想知道這輪該給幾顆球", "想區分日常球和加成球", "想確認 Rainbow Core 何時可用"],
      parentLine: "先讓孩子感受到得到球,再由 App 做正式記帳。",
      minutes: "通常在任務完成或支援後立即處理",
      returnHint: "發球 / 記帳後回收尾,或準備下一輪任務。",
      avoidLine: "不要先記帳卻沒給到孩子感受;這一塊要同時有實體獲得感和帳本清楚度。",
    });
  };

  const runCardGuideAction = () => {
    if (!cardGuideModal?.actionKind) {
      setCardGuideModal(null);
      return;
    }

    const targetId = cardGuideModal.actionTargetId;
    if (cardGuideModal.actionKind === "select-challenge" && targetId) {
      const targetChallenge = timeChallenges.find((card) => card.id === targetId);
      setJustReturnedFromWrapUp(false);
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setCardGuideModal(null);
      if (targetChallenge) selectTimeChallengeCard(targetChallenge);
      return;
    }

    if (cardGuideModal.actionKind === "use-transition" && targetId) {
      const card = transitionCards.find((item) => item.id === targetId);
      setJustReturnedFromWrapUp(false);
      setCardGuideModal(null);
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      if (card) transitionNow(card);
      return;
    }

    if (cardGuideModal.actionKind === "use-active-skill" && targetId) {
      const card = activeSkills.find((item) => item.id === targetId);
      setJustReturnedFromWrapUp(false);
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setCardGuideModal(null);
      if (card) activateSkill(card);
      return;
    }

    if (cardGuideModal.actionKind === "focus-sop" && targetId) {
      const index = sopCards.findIndex((item) => item.id === targetId);
      if (index >= 0) {
        setJustReturnedFromWrapUp(false);
        setCurrentStep(index);
        syncPhaseFromStep(targetId);
      }
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setCardGuideModal(null);
      setMessage("已切到這一步,現在先只看這張 SOP 卡。");
      return;
    }

    if (cardGuideModal.actionKind === "select-hero" && targetId) {
      setSelectedHeroId(targetId);
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setCardGuideModal(null);
      setMessage("已切到這張英雄卡。可以決定要不要把它作為本週英雄。");
      return;
    }

    if (cardGuideModal.actionKind === "select-guardian" && targetId) {
      setSelectedBeastId(targetId);
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setCardGuideModal(null);
      setMessage("已切到這隻守護獸,現在可以看資格、進度與要不要挑戰。");
      return;
    }

    if (cardGuideModal.actionKind === "open-parent-assist") {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowParentAssist(true);
      setSelectedSupportScenario((cardGuideModal.actionTargetId as SupportAssistScenario) ?? "start");
      setCardGuideModal(null);
      setMessage("已打開家長輔助模式,先選現場情境,再決定支援卡。");
      return;
    }

    if (cardGuideModal.actionKind === "draw-world-event") {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setCardGuideModal(null);
      drawWorldEvent();
      return;
    }

    if (cardGuideModal.actionKind === "check-upgrade") {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setCardGuideModal(null);
      unlockHeroUpgrade();
      return;
    }

    if (cardGuideModal.actionKind === "expand-daily") {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowTodayDetails(true);
      setCardGuideModal(null);
      setMessage("已展開今日細節。先看今天剩餘資源,再決定下一步。");
      return;
    }

    if (cardGuideModal.actionKind === "expand-weekly") {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setSelectedBeastId(showcaseGuardian.id);
      setCardGuideModal(null);
      setMessage("已打開守護獸世界。首頁先照顧本命獸,其他守護獸、收藏與線索都在這裡。");
      return;
    }

    setCardGuideModal(null);
  };

  const activateSkill = (card: ToolCard) => {
    setJustReturnedFromWrapUp(false);
    if (usedActiveSkills[card.id]) {
      setMessage(`${card.title} 這一輪已經使用過了。`);
      return;
    }
    if (!canUseActiveSkill(card.id)) {
      setMessage(`${card.title} 目前這個階段不能使用。`);
      return;
    }

    if (card.id === "pause-1" || card.id === "breather-1" || card.id === "listen-2") {
      const timedActionLabel = card.id === "pause-1" ? "暫停" : card.id === "breather-1" ? "穩一下" : "Listen Mode";
      if (missionPhase !== "challenge" || !running) {
        setMessage(`${timedActionLabel} 只能在這一輪進行中使用。`);
        return;
      }
      const durationOptions = supportDurationPresets[card.id] ?? [0.5, 1];
      setPendingTimedAction({ kind: "tool", toolId: card.id, label: timedActionLabel, options: durationOptions });
      setSelectedSupportMinutes(durationOptions[0]);
      setSupportDurationVisible(true);
      setMessage(`先選 ${timedActionLabel} 要用多久。`);
      return;
    }

    setUsedActiveSkills((prev) => ({ ...prev, [card.id]: true }));
    setMostUsedTool(card.title);
    if (card.id === "restart-3") {
      setRunning(false);
      setMissionPhase("sop");
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(2);
      setActiveSupportToolId(null);
      setSupportCountdown(0);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setSupportResumePhase(null);
      setSupportResumeRunning(false);
      setCardGuideModal(null);
      setSupportGuideToolId(null);
      setPendingChallengeSwitchId(null);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setRestartCountToday((prev) => prev + 1);
      setFocusPower((prev) => clamp(prev + 5));
      setMessage("Restart Mode 啟動:重啟不是失敗,是重新聚焦。");
      return;
    }
    if (card.id === "listen-2") {
      setEmotionPower((prev) => clamp(prev + 4));
      setMessage("Listen Mode 啟動:先聽懂,再輪到自己說。");
      return;
    }

    setMessage(`${card.title} 已使用:${card.childLine}`);
  };

  const transitionNow = (card: ToolCard) => {
    setJustReturnedFromWrapUp(false);
    setShowParentHomeModules(true);
    setShowHomeDetails(true);
    if (!canUseTransitionCard(card.id)) {
      setMessage(`${card.title} 目前這個階段不能使用。`);
      return;
    }
    if (card.id === "ready-check") {
      setRunning(false);
      setMissionPhase("ready");
      setJustReturnedFromWrapUp(false);
      setCurrentStep(0);
      setShowParentHomeModules(isParentMode);
      setShowHomeDetails(isParentMode);
      setShowParentAssist(false);
      setShowParentReviewPage(false);
      setShowParentArchives(false);
      setSupportDurationVisible(false);
      setPendingTimedAction(null);
      setSelectedSupportMinutes(2);
      setActiveSupportToolId(null);
      setSupportCountdown(0);
      setSupportNeedsReturn(false);
      setSupportReturnPromptVisible(false);
      setSupportResumePhase(null);
      setSupportResumeRunning(false);
      setCardGuideModal(null);
      setSupportGuideToolId(null);
      setPendingChallengeSwitchId(null);
      setSelectedSupportScenario(null);
      setSelectedSupportVariant(null);
      setParentAssistResultTag(null);
      setMessage(isParentMode
        ? (hasCoreGuardian
            ? `Ready Check 已打開。先看 ${coreGuardianName || coreGuardianBase?.name || "本命獸"} 怎麼陪孩子進場,再決定現在要不要開始。`
            : "Ready Check 已打開。先確認現在能不能進場;如果還沒建立本命獸,之後補上會更容易接。")
        : "準備確認:先一起決定,現在要進場,還是再多 1 分鐘。");
      return;
    }
    if (card.id === "im-ready") {
      if (missionPhase !== "ready") {
        setMessage("現在已經不是準備進場階段。先繼續目前這一輪,或回 Ready Check。");
        return;
      }
      startMission();
      return;
    }
    if (card.id === "need-more-time") {
      handleNeedMoreTime();
      return;
    }
    if (card.id === "break-time") {
      handleShortBreak();
      return;
    }
    if (card.id === "calm-action") {
      if (missionPhase !== "ready") {
        setMessage("現在已經不是從穩定切進場的時候。先繼續目前這一輪,或回 Ready Check。");
        return;
      }
      startMission();
      return;
    }
  };

  const shareSelectedGuardianCard = async () => {
    try {
      setShowParentHomeModules(true);
      setShowHomeDetails(true);
      setShowWeeklyDetails(true);
      setMessage(`正在整理 ${selectedGuardian.name} 的分享卡片...`);
      const sourceFamilyTone = selectedGuardianRecord.sourceEventFamily === "trace"
        ? "這次是沿著一條清楚留下的痕跡,把牠一步一步帶出來。"
        : selectedGuardianRecord.sourceEventFamily === "surprise"
          ? "這次比較像世界突然打開了一個意外入口,讓牠跳了出來。"
          : selectedGuardianRecord.sourceEventFamily === "future"
            ? "這次像先看見了一條未來線,然後把牠慢慢拉到眼前。"
            : selectedGuardianRecord.sourceEventFamily === "recovery"
              ? "這次不是硬闖出來,而是在回穩之後把牠重新帶回眼前。"
              : selectedGuardianRecord.sourceEventFamily === "meta"
                ? "這次像是世界自己回頭整理了一次,才把這條線重新翻開。"
                : selectedGuardianRecord.sourceEventFamily === "bonus"
                  ? "這次像世界額外送來一個推進機會,讓這條線走得更順。"
                  : "這次世界線有往前推,但來源語氣還保持中性。";
      const shareIntro = selectedGuardianIsNewToday
        ? selectedGuardianRecord.showcase
          ? `今天剛把 ${selectedGuardian.name} 收進圖鑑,也正式拿上桌展示。`
          : `今天剛把 ${selectedGuardian.name} 收進圖鑑,這是今天翻到的新頁。`
        : selectedGuardianRecord.showcase
          ? `${selectedGuardian.name} 目前正在世界展示位上。`
          : `${selectedGuardian.name} 已正式留在守護獸圖鑑裡。`;
      const shareProgress = selectedGuardianRecord.status === "captured"
        ? selectedGuardianRecord.capturedAtDay === daysInSystem
          ? "這次世界線已成功推進成收服結果。"
          : "這條世界線之前已成功推進成正式收服。"
        : selectedGuardianRecord.status === "defeated"
          ? "這條世界線已留下遭遇紀錄,還差最後收服。"
          : "這條世界線還在等第一次真正翻開。";
      const shareSource = selectedGuardianRecord.sourceEventTitle
        ? `來源事件:${selectedGuardianRecord.sourceEventTitle}${selectedGuardianRecord.sourceEventFamily ? `|${selectedGuardianRecord.sourceEventFamily}` : ""}${selectedGuardianRecord.sourceEventReward ? `|${selectedGuardianRecord.sourceEventReward}` : ""}`
        : "來源事件:這條世界線的第一個事件名還沒被記下來。";
      await Share.share({
        message: `${selectedGuardianNumber}|${selectedGuardian.name}\n${shareIntro}\n${shareProgress}\n${shareSource}\n${sourceFamilyTone}\n${selectedGuardianRecord.title}|${selectedGuardianRecord.rarity}\n狀態:${selectedGuardianStatusLabel}\n累積 Orbs:${selectedGuardianProgress.orbs}\n擊敗次數:${selectedGuardianRecord.defeatedCount}\n${selectedGuardianStageIndex >= 0 ? `目前階段:${selectedGuardian.stages[selectedGuardianStageIndex].label}` : "目前階段:尚未解鎖"}`,
      });
      setMessage(`${selectedGuardian.name} 的展示卡已可分享,現在會一起帶出這次世界線的進展、來源事件與 family 語氣。`);
    } catch {
      setMessage("這張守護獸卡目前無法分享。",);
    }
  };

  const switchUiMode = (nextMode: UiMode) => {
    setJustReturnedFromWrapUp(false);
    setPostWrapUpContinuationSteps(0);
    setUiMode(nextMode);
    setHasChosenInitialMode(true);
    setShowHomeDetails(false);
    setShowParentReviewPage(false);
    setShowParentArchives(false);
    if (nextMode === "child") {
      setShowDataPlatform(false);
    }
    setMessage(nextMode === "child" ? "已切到小朋友入口,先看主角,再做一步。" : "已切到家長入口,先看今天怎麼帶。");
  };

  const isChildMode = uiMode === "child";
  const isParentMode = uiMode === "parent";
  const missionInProgress = running && missionPhase === "challenge";
  const postWrapUpFocusActive = justReturnedFromWrapUp || postWrapUpContinuationSteps > 0;
  const homeSectionTitle = postWrapUpFocusActive
    ? (justReturnedFromWrapUp
        ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? (isChildMode ? "回到卡點" : "接回卡點") : isChildMode ? "回到主線" : "接回主線")
        : isChildMode ? "順著主線繼續" : "順著主線往下帶")
    : isChildMode ? "先選時間挑戰,再做今天第一步" : "家長首頁";
  const homeSectionSubtitle = postWrapUpFocusActive
    ? (justReturnedFromWrapUp
        ? (lastBlockedStep && activeSopCard.title === lastBlockedStep
            ? (isChildMode ? `上一輪卡在 ${activeSopCard.title},現在先回到這一步。` : `上一輪卡在 ${activeSopCard.title},現在先帶孩子回到這一步。`)
            : isChildMode
              ? (activeSopCard.id === "adjust" ? "上一輪有卡點,現在先把主線調回來。" : "上一輪已收好,現在先接下一步。")
              : (activeSopCard.id === "adjust" ? "上一輪剛有卡點或補救,現在先帶孩子把主線調回來。" : "上一輪已收好,現在先帶孩子接回下一步。"))
        : (isChildMode ? `這一步接住後,先順著 ${activeSopCard.title} 往下走。` : `主線已接住,家長先順著 ${activeSopCard.title} 往下帶,不要立刻再展太多層。`))
    : isChildMode
      ? "先選時間挑戰,再做今天第一步; 卡住就求救, 世界 / 圖鑑之後再看。"
      : missionPhase === "settle"
        ? "先把這輪收好,再把主線接回下一步。"
        : "先看今天怎麼帶,再決定要不要介入。";
  const timedSupportFullscreenVisible = !!activeSupportTool && (supportCountdown > 0 || supportNeedsReturn);
  const [showParentHomeModules, setShowParentHomeModules] = useState(false);

  if (!imageAssetsReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingShell}>
          <Text style={styles.loadingTitle}>Holton 正在準備進場</Text>
          <Text style={styles.loadingText}>先等一下,馬上帶你進入今天這一輪。</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {timedSupportFullscreenVisible ? (
        <View style={styles.timedSupportFullscreenShell}>
          <View style={styles.timedSupportFullscreenCard}>
            <Text style={styles.timedSupportFullscreenKicker}>{supportCountdown > 0 ? "全屏暫停中" : "暫停時間已到"}</Text>
            <Text style={styles.timedSupportFullscreenTitle}>{activeSupportTool?.title ?? "Pause Mode"}</Text>
            {activeSupportTool?.imageSource ? <Image source={activeSupportTool.imageSource} style={styles.timedSupportFullscreenImage} resizeMode="contain" /> : null}
            {supportCountdown > 0 ? (
              <>
                <Text style={styles.timedSupportFullscreenTime}>剩餘 {formatTime(supportCountdown)}</Text>
                <Text style={styles.timedSupportFullscreenText}>現在整個主線先暫停,先不要看其他卡,也不要往下做。等時間到,再決定怎麼接回主流程。</Text>
              </>
            ) : (
              <>
                <Text style={styles.timedSupportFullscreenDone}>時間到了</Text>
                <Text style={styles.timedSupportFullscreenText}>先停在這裡,不自動亂跳。現在由你決定要怎麼回主線。</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => completeSupportReturn("sop")}>
                    <Text style={styles.primaryButtonText}>{supportResumePhase === "challenge" && supportResumeRunning ? "回任務並繼續" : "回主線"}</Text>
                  </Pressable>
                </View>
                <View style={styles.exceptionButtonGrid}>
                  <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("ready")}>
                    <Text style={styles.exceptionButtonTitle}>回 Ready Check</Text>
                    <Text style={styles.exceptionButtonText}>重新確認現在要不要進場。</Text>
                  </Pressable>
                  <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("restart")}>
                    <Text style={styles.exceptionButtonTitle}>走 Restart</Text>
                    <Text style={styles.exceptionButtonText}>先重接,再回主線。</Text>
                  </Pressable>
                  <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("settle")}>
                    <Text style={styles.exceptionButtonTitle}>直接收尾</Text>
                    <Text style={styles.exceptionButtonText}>這一輪先乾淨結束。</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
      <ScrollView ref={mainScrollRef} style={styles.mainScroll} contentContainerStyle={[styles.container, { width: mainContentWidth }]}> 
        <Text style={styles.title}>Holton Hero Trial v0.94</Text>
        <Text style={styles.subtitle}>手機試玩版：孩子端與家長端都改成大卡片操作。孩子玩任務，家長用三鍵接住卡點。</Text>
        <View style={styles.trialBanner}>
          <Text style={styles.trialBannerKicker}>TRIAL FLOW</Text>
          <Text style={styles.trialBannerTitle}>{isChildMode ? "小朋友只要找最大顆按鈕" : "家長先看接法，不用先開系統面板"}</Text>
          <View style={styles.trialStepRow}>
            <Text style={styles.trialStepChip}>換卡</Text>
            <Text style={styles.trialStepChip}>開始</Text>
            <Text style={styles.trialStepChip}>完成</Text>
            <Text style={styles.trialStepChip}>求救</Text>
          </View>
        </View>
        <View style={styles.orbScoreHeroCard}>
          <View style={styles.orbScoreMain}>
            <Text style={styles.orbScoreKicker}>MY ORBS</Text>
            <Text style={styles.orbScoreValue}>{orbs}</Text>
            <Text style={styles.orbScoreLabel}>目前能量球</Text>
          </View>
          <View style={styles.orbScoreDivider} />
          <View style={styles.orbScoreSide}>
            <Text style={styles.orbScoreGain}>這張任務 +{selectedChallenge.orbs}</Text>
            <Text style={styles.orbScoreAfter}>完成後會變成 {orbs + selectedChallenge.orbs}</Text>
            <Text style={styles.orbScoreHint}>做完按「我做完了 ✅」就加分</Text>
          </View>
        </View>
        <View style={styles.actionFeedbackCard}>
          <Text style={styles.actionFeedbackKicker}>即時回應</Text>
          <Text style={styles.actionFeedbackText}>{message}</Text>
        </View>
        {activeSupportTool && supportCountdown > 0 ? (
          <View style={styles.activeTimerHeroCard}>
            <Text style={styles.activeTimerHeroKicker}>支援計時進行中</Text>
            <Text style={styles.activeTimerHeroTitle}>{activeSupportTool.title}</Text>
            <Text style={styles.activeTimerHeroTime}>剩餘 {formatTime(supportCountdown)}</Text>
            <Text style={styles.activeTimerHeroText}>時間到後,再回到 Ready Check / SOP / Restart 的最短接點。</Text>
          </View>
        ) : null}
        {activeSupportTool && supportNeedsReturn ? (
          <View style={styles.activeTimerReturnCard}>
            <Text style={styles.activeTimerHeroKicker}>支援時間已到</Text>
            <Text style={styles.activeTimerHeroTitle}>{activeSupportTool.title}</Text>
            <Text style={styles.activeTimerHeroText}>現在請選擇要怎麼接回主流程。</Text>
          </View>
        ) : null}

        {!hasChosenInitialMode ? (
          <View style={styles.card}>
            <SectionTitle title="先選今天的入口" subtitle="之後會記住這次選擇,也可以再切換。" />
            <View style={styles.modeSwitchRow}>
              <Pressable style={[styles.modeSwitchChip, styles.modeSwitchChipActive]} onPress={() => switchUiMode("child")}>
                <Text style={[styles.modeSwitchText, styles.modeSwitchTextActive]}>小朋友入口</Text>
              </Pressable>
              <Pressable style={styles.modeSwitchChip} onPress={() => switchUiMode("parent")}>
                <Text style={styles.modeSwitchText}>家長入口</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>

        {!postWrapUpFocusActive ? <View style={styles.card}>
          <View style={styles.buttonRow}>
            {isChildMode ? (
              <Pressable style={styles.secondaryButton} onPress={() => switchUiMode("parent")}>
                <Text style={styles.secondaryButtonText}>家長入口</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.secondaryButton} onPress={() => switchUiMode("child")}>
                <Text style={styles.secondaryButtonText}>回小朋友</Text>
              </Pressable>
            )}
          </View>
        </View> : null}

        <View style={styles.card}>
          <SectionTitle title={homeSectionTitle} subtitle={homeSectionSubtitle} />
          {isParentMode ? <>
            {!missionInProgress ? <View style={[styles.infoBox, styles.parentLayerBox]}>
              <Text style={styles.infoTitle}>{postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "先把孩子帶回卡住這一步" : activeSopCard.id === "adjust" ? "先把主線調回來" : "先把主線接回這一步") : "先順著主線往下帶") : missionPhase === "settle" ? "先把這輪收好" : "先判斷：還沒開始，還是已經卡住"}</Text>
              {postWrapUpFocusActive ? <>
                <Text style={styles.infoText}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? `上一輪卡在 ${activeSopCard.title},現在先把孩子帶回這一步。` : activeSopCard.id === "adjust" ? `上一輪剛有卡點或補救,現在先把孩子帶回 ${activeSopCard.title}。` : `上一輪已經收尾完成,現在先看怎麼把孩子帶回 ${activeSopCard.title}。`) : `上一個接回點已經接住,現在先順著 ${activeSopCard.title} 往下帶。`}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => openSopGuide(activeSopCard)}><Text style={styles.primaryButtonText}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "先看怎麼回這一步" : "先看怎麼帶回來") : "先看怎麼順著帶"}</Text></Pressable>
                </View>
              </> : <>
                {!showParentAssist ? <Text style={styles.parentLayerMode}>家長第一眼只先做這個判斷。</Text> : null}
                <Text style={styles.infoText}>{showParentAssist ? "現在先專心把這一步接住,下面直接選情境就好。" : "還沒開始就走 Ready Check；已經卡住就先拿建議。"}</Text>
                {!showParentAssist ? <Text style={styles.infoText}>{hasCoreGuardian ? `${coreGuardianName || coreGuardianBase?.name || "本命獸"} 會陪這一步進場，不用先講完整道理。` : "先確認能不能進場，不用一開始講很多。"}</Text> : null}
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => {
                    const next = !showParentAssist;
                    setShowParentAssist(next);
                    if (next) {
                      setSelectedSupportScenario((prev) => prev ?? defaultSupportScenario);
                      setSelectedSupportVariant(null);
                    }
                    setShowParentReviewPage(false);
                    setShowParentHomeModules(true);
                    setShowHomeDetails(true);
                    setShowParentArchives(false);
                    setMessage(next ? "已打開家長建議層,先選最像的情境,再把孩子接回主線。" : "已先收起家長建議層。");
                  }}><Text style={styles.primaryButtonText}>{showParentAssist ? "先收起家長建議" : "已經卡住 → 先拿建議"}</Text></Pressable>
                  {!showParentAssist ? <Pressable style={styles.secondaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); transitionNow(transitionCards.find((item) => item.id === "ready-check") ?? transitionCards[0]); setMessage("已回到 Ready Check。先確認狀態,再決定怎麼帶。"); }}><Text style={styles.secondaryButtonText}>還沒開始 → Ready Check</Text></Pressable> : null}
                </View>
              </>}
            </View> : <View style={[styles.infoBox, styles.parentLayerBox]}>
              {selectedChallenge.imageSource ? <Image source={selectedChallenge.imageSource} style={styles.currentStepPanelImage} resizeMode="contain" /> : null}
              <Text style={styles.infoTitle}>現在先把這一輪跑完</Text>
              <Text style={styles.infoText}>{selectedChallenge.name}</Text>
              <Text style={styles.infoText}>現在先專心把這一輪跑完。</Text>
              <Text style={styles.infoText}>如果中途要接手,就直接用主卡上的暫停、穩一下或取消這輪。</Text>
            </View>}

            {showParentReviewPage ? <View style={styles.card}>
              <SectionTitle title="家長回顧頁" subtitle="這裡先看最近、這週、下週怎麼接。" />
              {parentAssistLogs.length > 0 ? <>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => { setShowParentReviewPage(true); exportParentReview(); }}><Text style={styles.secondaryButtonText}>匯出家長回顧</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => { setShowParentReviewPage(true); archiveOlderParentAssistLogs(); }}><Text style={styles.secondaryButtonText}>收納舊記錄</Text></Pressable>
                </View>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => { const next = !showParentArchives; setShowParentArchives(next); setMessage(next ? "已打開收起來的舊記錄。" : "已先收起舊記錄。"); }}><Text style={styles.secondaryButtonText}>{showParentArchives ? "先收起舊記錄" : "看舊記錄"}</Text></Pressable>
                </View>
                <View style={styles.quickStepRow}>
                  {[7, 14, 30].map((days) => (
                    <Pressable key={days} style={styles.quickStepChip} onPress={() => { setParentReviewWindowDays(days as 7 | 14 | 30); setMessage(`已切到最近 ${days} 天回顧視窗。`); }}>
                      <Text style={styles.quickStepChipText}>看最近 {days} 天</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.minorHint}>現在看的是最近 {parentReviewWindowDays} 天|已收納 {parentAssistArchives.length} 組舊記錄</Text>
                {showParentArchives ? <View style={[styles.infoBox, { backgroundColor: "#f8fafc" }]}>
                  <Text style={styles.infoTitle}>收起來的舊記錄</Text>
                  {parentAssistArchives.length ? parentAssistArchives.map((archive) => (
                    <View key={archive.id} style={[styles.reportSplitBox, { marginTop: 8 }]}>
                      <Text style={styles.reportSplitTitle}>{archive.label}</Text>
                      <Text style={styles.infoText}>第 {archive.archivedAtDay} 天收起來|共 {archive.logs.length} 筆</Text>
                      <Text style={styles.minorHint}>{archive.logs.slice(0, 3).map((entry) => `${supportAssistScenarios.find((item) => item.id === entry.scenario)?.title ?? entry.scenario}${entry.variant ? `-${supportAssistScenarios.flatMap((item) => item.variants ?? []).find((item) => item.id === entry.variant)?.title ?? entry.variant}` : ""}|${entry.tag}`).join(" | ")}{archive.logs.length > 3 ? " ..." : ""}</Text>
                    </View>
                  )) : <Text style={styles.infoText}>目前還沒有收起來的舊記錄。</Text>}
                </View> : null}
              </> : <View style={[styles.infoBox, { backgroundColor: "#f8fafc" }]}>
                <Text style={styles.infoTitle}>先用幾次,這裡就會長出來</Text>
                <Text style={styles.infoText}>先用幾次家長輔助,把接回記錄留下來,這裡就會開始變得有用。</Text>
              </View>}
              {(parentAssistOverallSummary || parentAssistWeeklySummary) ? <View style={[styles.infoBox, { backgroundColor: "#ede9fe" }]}>
                <Text style={styles.infoTitle}>先看這輪重點</Text>
                <Text style={styles.infoText}>最近看起來最常是:{parentAssistOverallSummary?.summaryLine ?? "先累積幾次家長輔助記錄,這裡會開始長出最近模式。"}</Text>
                <Text style={styles.infoText}>{parentReviewWindowDays === 7 ? "這週看起來最常是" : `最近 ${parentReviewWindowDays} 天看起來最常是`}:{parentAssistWeeklySummary?.summaryLine ?? "這段記錄還不夠,先讓模式浮出來。"}</Text>
                <Text style={styles.infoText}>下週先這樣接:{parentAssistWeeklySummary?.nextWeekLine ?? parentAssistOverallSummary?.nextTimeLine ?? "先延續目前陪跑方式,再多累積幾次。"}</Text>
              </View> : null}

              <View style={styles.parentLayerDivider}>
                <Text style={styles.parentLayerDividerKicker}>最近</Text>
                <Text style={styles.parentLayerDividerText}>先看剛發生了什麼、最近最常出現什麼模式。</Text>
              </View>
              {parentAssistOverallSummary ? <View style={[styles.infoBox, { backgroundColor: "#f3f4f6" }]}>
                <Text style={styles.infoTitle}>最近這幾次怎麼接</Text>
                <Text style={styles.infoText}>最近看起來最常是:{parentAssistOverallSummary.summaryLine}</Text>
                <Text style={styles.infoText}>下次先這樣接:{parentAssistOverallSummary.nextTimeLine}</Text>
                <Text style={styles.infoText}>最近最後多半會接到:{parentAssistOverallSummary.resultLine}</Text>
                <Text style={styles.infoText}>最近看起來最常卡在:{parentAssistOverallSummary.patternLine}</Text>
              </View> : <View style={[styles.infoBox, { backgroundColor: "#f8fafc" }]}><Text style={styles.infoText}>目前還沒有陪跑記錄。先用家長輔助累積幾次,這裡就會開始長出模式。</Text></View>}

              <View style={styles.parentLayerDivider}>
                <Text style={styles.parentLayerDividerKicker}>{parentReviewWindowDays === 7 ? "這週" : `最近 ${parentReviewWindowDays} 天`}</Text>
                <Text style={styles.parentLayerDividerText}>把最近這段時間最常卡的點、最有效接法、最常踩雷整理成一眼可用的策略。</Text>
              </View>
              {parentAssistWeeklySummary ? <View style={[styles.infoBox, { backgroundColor: "#ecfeff" }]}>
                <Text style={styles.infoTitle}>{parentReviewWindowDays === 7 ? "這週怎麼接比較順" : `最近 ${parentReviewWindowDays} 天怎麼接比較順`}</Text>
                <Text style={styles.infoText}>這週看起來最常卡在:{parentAssistWeeklySummary.summaryLine}</Text>
                <Text style={styles.infoText}>下次一開始先這樣接:{parentAssistWeeklySummary.startStrategyLine}</Text>
                <Text style={styles.infoText}>這週比較接得住的是:{parentAssistWeeklySummary.effectiveLine}</Text>
                <Text style={styles.infoText}>下次先別這樣講:{parentAssistWeeklySummary.riskTalkLine}</Text>
                <Text style={styles.infoText}>下週先這樣接:{parentAssistWeeklySummary.nextWeekLine}</Text>
              </View> : null}

              <View style={styles.parentLayerDivider}>
                <Text style={styles.parentLayerDividerKicker}>下週</Text>
                <Text style={styles.parentLayerDividerText}>把下次要怎麼起手、先避免什麼,收成可直接拿來用的家長帶法。</Text>
              </View>
              {parentAssistWeeklySummary ? <View style={[styles.infoBox, { backgroundColor: "#fff7ed" }]}>
                <Text style={styles.infoTitle}>下週先怎麼接</Text>
                <Text style={styles.infoText}>下週先這樣接:{parentAssistWeeklySummary.nextWeekLine}</Text>
                <Text style={styles.infoText}>下週先用這種接法:{parentAssistWeeklySummary.effectiveLine}</Text>
                <Text style={styles.infoText}>下週先別這樣講:{parentAssistWeeklySummary.riskTalkLine}</Text>
              </View> : null}

              {recentParentAssistHistory.length ? <View style={[styles.infoBox, { backgroundColor: "#ffffff" }]}>
                <Text style={styles.infoTitle}>最近幾次是怎麼接的</Text>
                {recentParentAssistHistory.map((entry, index) => (
                  <Text key={`parent-review-${entry.day}-${entry.scenario}-${entry.tag}-${index}`} style={styles.infoText}>• 第 {entry.day} 次|{entry.scenarioTitle}{entry.variantTitle ? `-${entry.variantTitle}` : ""}|{entry.tag}{entry.resultLabel ? `|${entry.resultLabel}` : ""}</Text>
                ))}
              </View> : null}
            </View> : null}

            {showParentHomeModules && !missionInProgress && !postWrapUpFocusActive && !showParentAssist ? <View style={[styles.infoBox, styles.parentLayerBox]}>
              <Text style={styles.infoTitle}>本命獸現在先怎麼處理</Text>
              <Text style={styles.infoText}>{hasCoreGuardian ? `${coreGuardianName || coreGuardianBase?.name || "本命獸"}|本週 ${coreGuardianWeeklyFeed}/${coreGuardianWeeklyFeedTarget}` : "還沒有本命獸,先補上首頁主角位。"}</Text>
              <Text style={styles.infoText}>{hasCoreGuardian ? (coreGuardianStatus === "provisional" ? `現在還在保留期,若方向不對還能調整|剩 ${coreGuardianReselectDaysLeft} 天` : `現在先維持照顧節奏即可|Lv.${coreGuardianLevel}`) : "先建立後,家長首頁的主線會更固定。"}</Text>
              <Text style={styles.infoText}>{hasCoreGuardian ? `家長這一層先不要把牠當成數值卡,而是把牠當成一句可用的帶法:『${coreGuardianName || coreGuardianBase?.name || "牠"} 會陪你把這一步走完。』` : "先把本命獸建立起來,之後你就能用『牠在等你』『牠陪你走這一步』這種語氣接孩子。"}</Text>
              <View style={styles.buttonRow}>
                {!hasCoreGuardian ? <Pressable style={styles.primaryButton} onPress={openCoreGuardianCreation}><Text style={styles.primaryButtonText}>先建立本命獸</Text></Pressable> : null}
                {hasCoreGuardian ? <Pressable style={styles.primaryButton} onPress={() => { setJustReturnedFromWrapUp(false); setPostWrapUpContinuationSteps(0); setCoreGuardianCreationVisible(false); setCoreGuardianReselectMode(false); setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setShowParentGuardianPanel(true); setMessage(coreGuardianWeeklyFeed === 0 ? "已打開本命獸區,先去看牠。" : "已打開本命獸區,先看本命獸。"); }}><Text style={styles.primaryButtonText}>{coreGuardianWeeklyFeed === 0 ? "先去看牠" : "先看本命獸"}</Text></Pressable> : null}
                {hasCoreGuardian && canReselectCoreGuardian ? <Pressable style={styles.secondaryButton} onPress={reselectCoreGuardian}><Text style={styles.secondaryButtonText}>重選</Text></Pressable> : null}
              </View>
              {hasCoreGuardian ? <View style={[styles.infoBox, { backgroundColor: "#eef2ff", marginTop: 12 }]}>
                <Text style={styles.infoTitle}>家長可直接用的接法</Text>
                <Text style={styles.infoText}>• {coreGuardianName || coreGuardianBase?.name || "牠"} 在等你,我們先陪牠做這一步。</Text>
                <Text style={styles.infoText}>• 先不用想整段,我們先跟 {coreGuardianName || coreGuardianBase?.name || "牠"} 一起把眼前這一步走完。</Text>
                <Text style={styles.infoText}>• 如果現在有點卡,就先讓 {coreGuardianName || coreGuardianBase?.name || "牠"} 陪你穩一下,再回來。</Text>
              </View> : null}
            </View> : null}

            {hasCoreGuardian && showParentGuardianPanel && showParentHomeModules && !missionInProgress && !postWrapUpFocusActive && !showParentAssist ? <View style={[styles.infoBox, styles.parentLayerBox, styles.parentGuardianPanelCard]}>
              <Text style={styles.parentGuardianPanelKicker}>PARENT GUARDIAN PANEL</Text>
              <Text style={styles.infoTitle}>本命獸現在在這裡</Text>
              {activeCoreGuardianPreviewImage ? <View style={styles.parentGuardianPanelImageWrap}><Image source={activeCoreGuardianPreviewImage} style={styles.parentGuardianPanelImage} resizeMode={activeCoreGuardianPreviewResizeMode} /></View> : null}
              <Text style={styles.parentGuardianPanelTitle}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"}</Text>
              <View style={styles.parentGuardianPanelMetaRow}>
                <View style={styles.parentGuardianPanelMetaChip}><Text style={styles.parentGuardianPanelMetaChipText}>{coreGuardianStage}</Text></View>
                <View style={styles.parentGuardianPanelMetaChip}><Text style={styles.parentGuardianPanelMetaChipText}>本週 {coreGuardianWeeklyFeed}/{coreGuardianWeeklyFeedTarget}</Text></View>
              </View>
              <Text style={styles.parentGuardianPanelBody}>{coreGuardianStatus === "bonded" ? "牠現在是正式陪伴狀態。家長先把牠當成這一步的陪跑角色。" : "牠現在已經在這裡了。家長先用牠陪孩子把眼前這一步走完。"}</Text>
              <Text style={styles.parentGuardianPanelBody}>先不要跳去別層，先看牠，再決定要不要餵、要不要接下一步。</Text>
              <View style={styles.parentGuardianPanelActions}>
                <Pressable style={styles.secondaryButton} onPress={feedCoreGuardian}><Text style={styles.secondaryButtonText}>{coreGuardianWeeklyFeed === 0 ? "先餵第 1 顆" : "再餵 1 顆"}</Text></Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => { setShowParentGuardianPanel(false); setMessage("已先收起本命獸區。"); }}><Text style={styles.secondaryButtonText}>先收起</Text></Pressable>
              </View>
            </View> : null}

            {showParentHomeModules && !missionInProgress && !postWrapUpFocusActive && !showParentAssist ? <View style={[styles.infoBox, styles.parentLayerBox]}>
              <Text style={styles.infoTitle}>世界現在先怎麼處理</Text>
              <Text style={styles.infoText}>{guardianEncounterWindowActive ? `現在可挑戰|剩 ${guardianEncounterDaysLeft} 天` : guardianWorldNextAction.title}</Text>
              <Text style={styles.infoText}>{guardianEncounterWindowActive ? `現在先判斷能不能打|可用 ${guardianAttackPowerAvailable}|需求 ${selectedGuardianChallengeCost}` : `現在先看要不要再推資格|痕跡 ${guardianTraces}|資格 ${guardianChallengeTokens}`}</Text>
              <View style={styles.buttonRow}>
                <Pressable style={styles.primaryButton} onPress={guardianWorldNextAction.action === "challenge" ? startGuardianChallenge : drawWorldEvent}><Text style={styles.primaryButtonText}>{guardianWorldNextAction.button}</Text></Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => { setJustReturnedFromWrapUp(false); setPostWrapUpContinuationSteps(0); setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`已打開守護獸世界,先看 ${showcaseGuardian.name}。`); }}><Text style={styles.secondaryButtonText}>看世界</Text></Pressable>
              </View>
            </View> : null}
          </> : null}

          {isChildMode && missionPhase === "ready" ? <View style={[styles.childEntryCard, styles.childQuestCard]}>
            <Text style={styles.childEntryKicker}>TODAY QUEST</Text>
            <Text style={styles.childEntryTitle}>{challengeSelectionConfirmed ? "就是這一張！" : "今天想挑戰哪一張？"}</Text>
            <Text style={styles.childEntryText}>{selectedChallenge.name}</Text>
            {selectedChallenge.imageSource ? <View style={styles.childQuestImageFrame}><Image source={selectedChallenge.imageSource} style={styles.childEntryHeroImage} resizeMode="contain" /></View> : null}
            <View style={styles.childQuestRewardPanel}>
              <Text style={styles.childQuestRewardKicker}>完成獎勵</Text>
              <Text style={styles.childQuestRewardValue}>+{selectedChallenge.orbs} Orbs</Text>
              <Text style={styles.childQuestRewardText}>現在 {orbs} 顆 → 完成後 {orbs + selectedChallenge.orbs} 顆</Text>
            </View>
            <View style={styles.childQuestMetaRow}>
              <View style={styles.childQuestMetaChip}><Text style={styles.childQuestMetaChipText}>{selectedChallenge.untimed ? "不限時" : `${selectedChallenge.minutes} 分鐘`}</Text></View>
              <View style={styles.childQuestMetaChip}><Text style={styles.childQuestMetaChipText}>第 {readyChallengeIndex + 1}/{starterChallenges.length} 張</Text></View>
            </View>
            <View style={styles.childQuestPath}>
              <View style={[styles.childQuestStep, styles.childQuestStepDone]}><Text style={styles.childQuestStepNo}>1</Text><Text style={styles.childQuestStepText}>選卡</Text></View>
              <View style={[styles.childQuestStep, challengeSelectionConfirmed && styles.childQuestStepDone]}><Text style={styles.childQuestStepNo}>2</Text><Text style={styles.childQuestStepText}>開始</Text></View>
              <View style={styles.childQuestStep}><Text style={styles.childQuestStepNo}>3</Text><Text style={styles.childQuestStepText}>完成</Text></View>
            </View>
            <Text style={styles.sopJourneyText}>{challengeSelectionConfirmed ? "準備好了就按最大顆按鈕。" : "換到喜歡的卡，再按下面最大顆按鈕。"}</Text>
            <View style={styles.childCardControlRow}>
              <Pressable style={styles.childSmallActionButton} onPress={() => selectAdjacentReadyChallenge(-1)}><Text style={styles.childSmallActionText}>← 換卡</Text></Pressable>
              <Pressable style={styles.childSmallActionButton} onPress={() => selectAdjacentReadyChallenge(1)}><Text style={styles.childSmallActionText}>換卡 →</Text></Pressable>
            </View>
            <Pressable style={styles.childBigStartButton} onPress={challengeSelectionConfirmed ? () => transitionNow(transitionCards.find((item) => item.id === "im-ready") ?? transitionCards[0]) : confirmSelectedChallengeAndFocusReadyCheck}>
              <Text style={styles.childBigStartKicker}>{challengeSelectionConfirmed ? "READY" : "CHOOSE"}</Text>
              <Text style={styles.childBigStartText}>{challengeSelectionConfirmed ? "開始任務 🚀" : "就選這張"}</Text>
            </Pressable>
            {challengeSelectionConfirmed ? <Pressable style={styles.childTinyResetButton} onPress={() => { setChallengeSelectionConfirmed(false); setMessage("可以重新選今天的卡。換到喜歡的再按最大顆按鈕。"); }}><Text style={styles.childTinyResetText}>不對，換一張</Text></Pressable> : null}
          </View> : null}

          {isParentMode && missionPhase === "ready" && showParentHomeModules && !showParentAssist ? <View style={styles.parentMissionHeroCard}>
            <Text style={styles.parentHeroKicker}>PARENT QUICK START</Text>
            <Text style={styles.parentHeroTitle}>今天先陪他完成這張</Text>
            <Text style={styles.parentHeroMission}>{selectedChallenge.name}</Text>
            {selectedChallenge.imageSource ? <View style={styles.parentHeroImageFrame}><Image source={selectedChallenge.imageSource} style={styles.parentHeroImage} resizeMode="contain" /></View> : null}
            <View style={styles.parentHeroRewardRow}>
              <View style={styles.parentHeroRewardChip}><Text style={styles.parentHeroRewardLabel}>時間</Text><Text style={styles.parentHeroRewardValue}>{selectedChallenge.untimed ? "不限時" : `${selectedChallenge.minutes} 分`}</Text></View>
              <View style={styles.parentHeroRewardChip}><Text style={styles.parentHeroRewardLabel}>獎勵</Text><Text style={styles.parentHeroRewardValue}>+{selectedChallenge.orbs}</Text></View>
              <View style={styles.parentHeroRewardChip}><Text style={styles.parentHeroRewardLabel}>完成後</Text><Text style={styles.parentHeroRewardValue}>{orbs + selectedChallenge.orbs}</Text></View>
            </View>
            <Text style={styles.parentHeroGuide}>{challengeSelectionConfirmed ? "接下來只要問：Are you ready? 孩子說 ready 後，按開始。" : "先幫孩子挑一張看起來做得到的卡，不用先看下面細節。"}</Text>
            <View style={styles.parentHeroControlRow}>
              <Pressable style={styles.parentSmallButton} onPress={() => selectAdjacentReadyChallenge(-1)}><Text style={styles.parentSmallButtonText}>← 換卡</Text></Pressable>
              <Pressable style={styles.parentSmallButton} onPress={() => selectAdjacentReadyChallenge(1)}><Text style={styles.parentSmallButtonText}>換卡 →</Text></Pressable>
            </View>
            <Pressable style={styles.parentBigStartButton} onPress={confirmSelectedChallengeAndFocusReadyCheck}>
              <Text style={styles.parentBigStartKicker}>{challengeSelectionConfirmed ? "READY CHECK" : "CHOOSE CARD"}</Text>
              <Text style={styles.parentBigStartText}>{challengeSelectionConfirmed ? "開始帶這一輪" : "選這張，準備開始"}</Text>
            </Pressable>
          </View> : null}

          {isParentMode && showParentHomeModules && !showParentAssist ? <View style={styles.parentQuickActionCard}>
            <Text style={styles.parentQuickActionKicker}>家長常用 3 鍵</Text>
            <View style={styles.parentQuickActionGrid}>
              <Pressable style={styles.parentQuickActionButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("start"); setSelectedSupportVariant(null); setMessage("先看『不想開始』怎麼接，拿一句話把孩子帶回進場點。"); }}><Text style={styles.parentQuickActionTitle}>不想開始</Text><Text style={styles.parentQuickActionText}>拿一句起手</Text></Pressable>
              <Pressable style={styles.parentQuickActionButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("emotion"); setSelectedSupportVariant(null); setMessage("先看『情緒上來』怎麼接，先降速再回主線。"); }}><Text style={styles.parentQuickActionTitle}>情緒上來</Text><Text style={styles.parentQuickActionText}>先降速</Text></Pressable>
              <Pressable style={styles.parentQuickActionButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("stuck"); setSelectedSupportVariant("stuck_no_next_step"); setMessage("先看『卡住』怎麼接，只縮到下一步。"); }}><Text style={styles.parentQuickActionTitle}>卡住了</Text><Text style={styles.parentQuickActionText}>接下一步</Text></Pressable>
            </View>
          </View> : null}

          {isParentMode && showParentHomeModules && !showParentAssist ? <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>下面才是細節</Text>
            <Text style={styles.parentLayerDividerText}>先用上面的大卡片陪玩；需要判斷或測試時，再打開下面。</Text>
          </View> : null}

          {isParentMode && showParentHomeModules && !showParentAssist ? (
            <Pressable style={styles.homeDetailsToggle} onPress={() => { const next = !showHomeDetails; setShowHomeDetails(next); setMessage(next ? "已打開家長細節 / 狀態 / 測試。" : "已先收起家長細節。先用上面大卡片就好。"); }}>
              <Text style={styles.homeDetailsToggleText}>{showHomeDetails ? "收起家長細節" : "打開家長細節 / 狀態 / 測試"}</Text>
            </Pressable>
          ) : null}

          {isParentMode && showParentHomeModules && showHomeDetails && !showParentAssist ? (
            <>
              <View style={[styles.infoBox, styles.parentLayerBox]}>
                <Text style={styles.infoTitle}>現在先處理哪一種卡點</Text>
                <Text style={styles.infoText}>先選最像的情境。App 先幫你縮成一句話、一個動作,再把孩子接回主線。</Text>
                <View style={styles.quickStepRow}>
                  <Pressable style={styles.quickStepChip} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("start"); setMessage("先從『不想開始』情境看起,先把孩子接到進場點。"); }}><Text style={styles.quickStepChipText}>不想開始</Text></Pressable>
                  <Pressable style={styles.quickStepChip} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("emotion"); setMessage("先從『情緒上來了』情境看起,先降速再接回流程。"); }}><Text style={styles.quickStepChipText}>情緒上來</Text></Pressable>
                  <Pressable style={styles.quickStepChip} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("stuck"); setMessage("先從『做到一半卡住』情境看起,先縮到下一步。"); }}><Text style={styles.quickStepChipText}>做到一半卡住</Text></Pressable>
                </View>
                <View style={styles.sopJourneyBox}>
                  <Text style={styles.sopJourneyLabel}>打開後先得到什麼</Text>
                  <Text style={styles.sopJourneyText}>先看什麼、先說什麼、先做什麼,最後再接回主線。</Text>
                </View>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => { const next = !showParentAssist; setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(next); if (next) { setSelectedSupportScenario((prev) => prev ?? defaultSupportScenario); setSelectedSupportVariant(null); } setMessage(next ? "已打開家長支援層,先選最像的卡點,再接回主線。" : "已先收起家長支援層。" ); }}><Text style={styles.primaryButtonText}>{showParentAssist ? "先收起家長支援層" : "打開家長支援層"}</Text></Pressable>
                </View>
              </View>

              <View style={styles.parentLayerDivider}>
                <Text style={styles.parentLayerDividerKicker}>再看狀態</Text>
                <Text style={styles.parentLayerDividerText}>上面先處理卡點與接回。下面再看孩子名稱、今天數字與測試細節。</Text>
              </View>

              <Text style={styles.label}>孩子名稱</Text>
              <TextInput value={childName} onChangeText={setChildName} style={styles.input} />

              <View style={styles.homeSnapshotRow}>
                <View style={styles.homeSnapshotCard}>
                  <Text style={styles.homeSnapshotLabel}>目前階段</Text>
                  <Text style={styles.homeSnapshotValue}>{activePhase.kicker}</Text>
                </View>
                <View style={styles.homeSnapshotCard}>
                  <Text style={styles.homeSnapshotLabel}>剩餘任務</Text>
                  <Text style={styles.homeSnapshotValue}>{missionsRemaining}</Text>
                </View>
                <View style={styles.homeSnapshotCard}>
                  <Text style={styles.homeSnapshotLabel}>今日能量球</Text>
                  <Text style={styles.homeSnapshotValue}>{orbs}</Text>
                </View>
                <View style={styles.homeSnapshotCard}>
                  <Text style={styles.homeSnapshotLabel}>守護獸線索</Text>
                  <Text style={styles.homeSnapshotValueSmall}>{guardianTraces} / {guardianChallengeTokens}</Text>
                </View>
              </View>

              <Pressable style={styles.testingToggle} onPress={() => { const next = !showDataPlatform; setShowDataPlatform(next); setMessage(next ? "已展開系統 / 測試。" : "已先收起系統 / 測試。"); }}>
                <Text style={styles.testingToggleText}>{showDataPlatform ? "收起系統 / 測試" : "展開系統 / 測試"}</Text>
              </Pressable>
            </>
          ) : null}
        </View>

        {showDataPlatform ? <>

        <View style={styles.card}>
          <SectionTitle title="真實操作模式 / session capture" subtitle="開始把 app 從模擬測試推到真實陪跑現場:先分清楚 simulated 與 real,再讓操作員能直接記錄。" />
          <View style={styles.modeSwitchRow}>
            <Pressable style={[styles.modeSwitchChip, sessionEnvironment === "simulated" && styles.modeSwitchChipActive]} onPress={() => { setSessionEnvironment("simulated"); if (activeRealSessionId) setMessage("已切回模擬模式,但 live session 仍保留,可隨時續接。") }}>
              <Text style={[styles.modeSwitchText, sessionEnvironment === "simulated" && styles.modeSwitchTextActive]}>模擬測試</Text>
            </Pressable>
            <Pressable style={[styles.modeSwitchChip, sessionEnvironment === "real" && styles.modeSwitchChipActive]} onPress={() => { setSessionEnvironment("real"); if (liveRealSessions.length > 0) setMessage(`已切回真實操作。尚有 ${liveRealSessions.length} 輪 live session 可續接。`) }}>
              <Text style={[styles.modeSwitchText, sessionEnvironment === "real" && styles.modeSwitchTextActive]}>真實操作</Text>
            </Pressable>
          </View>

          <View style={styles.realOpsHero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.realOpsHeroKicker}>{environmentLabel(sessionEnvironment)}</Text>
              <Text style={styles.realOpsHeroTitle}>{activeRealSession ? `${activeRealSession.childName}|${activeRealSession.challengeName}` : "尚未開啟真實 session"}</Text>
              <Text style={styles.realOpsHeroText}>{activeRealSession ? `操作員 ${activeRealSession.operatorName}|${activeRealSession.location}|${activeRealSession.missionGoal}` : "先填操作員、現場情境、任務目標,再開啟一個 live session。"}</Text>
              <Text style={styles.realOpsMeta}>{lastSavedLabel ? `本機已自動保存:${lastSavedLabel}` : "尚未建立本機快照"}</Text>
            </View>
            <View style={styles.realOpsHeroBadge}>
              <Text style={styles.realOpsHeroBadgeLabel}>今日 real</Text>
              <Text style={styles.realOpsHeroBadgeValue}>{realDailyReview.total}</Text>
            </View>
          </View>

          <Text style={styles.label}>操作員</Text>
          <TextInput value={operatorName} onChangeText={setOperatorName} style={styles.input} placeholder="例如:媽媽 / 老師 / 治療師" />
          <Text style={styles.label}>角色</Text>
          <TextInput value={operatorRole} onChangeText={setOperatorRole} style={styles.input} placeholder="例如:主要陪跑 / 現場觀察" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickChipRow}>
              {[
                ["媽媽", "主要陪跑"],
                ["爸爸", "支援觀察"],
                ["老師", "課堂支持"],
                ["治療師", "介入觀察"],
              ].map(([name, role]) => (
                <Pressable key={`${name}-${role}`} style={styles.quickChip} onPress={() => { setOperatorName(name); setOperatorRole(role); }}>
                  <Text style={styles.quickChipText}>{name}|{role}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.label}>孩子當下狀態</Text>
          <TextInput value={childContext} onChangeText={setChildContext} style={[styles.input, styles.multilineInput]} multiline placeholder="例如:剛放學、情緒偏高、想先拖延" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickChipRow}>
              {[
                "剛放學後轉換期,先求穩定進場。",
                "情緒偏高,需要先降速。",
                "願意坐下,但容易拖延收尾。",
                "注意力浮動,容易看向裝置。",
              ].map((item) => (
                <Pressable key={item} style={styles.quickChip} onPress={() => setChildContext(item)}><Text style={styles.quickChipText}>{item}</Text></Pressable>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.label}>地點 / 佈置</Text>
          <TextInput value={sessionLocation} onChangeText={setSessionLocation} style={styles.input} placeholder="例如:餐桌、安靜角落、治療室" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickChipRow}>
              {["客廳桌面", "餐桌", "安靜角落", "治療室"].map((item) => (
                <Pressable key={item} style={styles.quickChip} onPress={() => setSessionLocation(item)}><Text style={styles.quickChipText}>{item}</Text></Pressable>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.label}>本輪真實目標</Text>
          <TextInput value={realMissionGoal} onChangeText={setRealMissionGoal} style={[styles.input, styles.multilineInput]} multiline placeholder="本輪最想驗證的目標" />
          <Text style={styles.label}>session 備註</Text>
          <TextInput value={realSessionNoteDraft} onChangeText={setRealSessionNoteDraft} style={[styles.input, styles.multilineInput]} multiline placeholder="寫現場描述,不要只寫漂亮結論" />
          <Text style={styles.label}>下一步 / 交班提醒</Text>
          <TextInput value={nextActionDraft} onChangeText={setNextActionDraft} style={[styles.input, styles.multilineInput]} multiline placeholder="留給下一位操作員或明天的自己" />

          {activeRealSession ? (
            <View style={styles.handoffSectionCard}>
              <Text style={styles.handoffSectionTitle}>Live workflow tracker</Text>
              <Text style={styles.handoffSectionLead}>{workflowStageLabel(currentWorkflowStage(activeRealSession))}|交班完整度 {sessionHandoffCoverage(activeRealSession).score}/100</Text>
              <Text style={styles.handoffBody}>{sessionHandoffCoverage(activeRealSession).label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.eventChipRow}>
                  {realWorkflowStages.map((stage) => (
                    <Pressable key={stage} style={[styles.tuningChip, currentWorkflowStage(activeRealSession) === stage && styles.eventChipActive]} onPress={() => logWorkflowStage(stage)}>
                      <Text style={styles.tuningChipText}>{workflowStageLabel(stage)}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Text style={styles.handoffBody}>缺口:{sessionHandoffCoverage(activeRealSession).missing.length ? sessionHandoffCoverage(activeRealSession).missing.join(" / ") : "已齊全,可直接交班或匯出。"}</Text>
            </View>
          ) : null}

          <View style={styles.testingButtonGrid}>
            <Pressable style={styles.testingButton} onPress={startRealSession}>
              <Text style={styles.testingButtonTitle}>{activeRealSession ? "更新目前 live session" : "開啟真實 session"}</Text>
              <Text style={styles.testingButtonText}>把操作員、孩子狀態、地點、目標先鎖進今天這輪現場記錄。</Text>
            </Pressable>
            <Pressable style={styles.testingButton} onPress={saveRealSessionNote}>
              <Text style={styles.testingButtonTitle}>存 session note / next action</Text>
              <Text style={styles.testingButtonText}>不用等結束,先把交班文字同步進 live session。</Text>
            </Pressable>
            <Pressable style={styles.testingButton} onPress={exportRealSession}>
              <Text style={styles.testingButtonTitle}>匯出目前 session</Text>
              <Text style={styles.testingButtonText}>直接分享給下一位操作員或留到群組/備忘錄。</Text>
            </Pressable>
            <Pressable style={styles.testingButton} onPress={resumeLatestLiveSession}>
              <Text style={styles.testingButtonTitle}>續接最近 live session</Text>
              <Text style={styles.testingButtonText}>如果操作中斷或切走畫面,可快速回到最近一輪真實現場。</Text>
            </Pressable>
            <Pressable style={styles.testingButton} onPress={exportStorageBackup}>
              <Text style={styles.testingButtonTitle}>匯出本機備份 JSON</Text>
              <Text style={styles.testingButtonText}>把 session / scenario / review 快照一起分享出去,方便換機或留存。</Text>
            </Pressable>
          </View>

          {activeRealSession ? (
            <View style={styles.testingButtonGrid}>
              <Pressable style={styles.secondaryButton} onPress={() => closeActiveRealSession("smooth")}><Text style={styles.secondaryButtonText}>手動結束為順利完成</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => closeActiveRealSession("rescued")}><Text style={styles.secondaryButtonText}>手動結束為補救完成</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => closeActiveRealSession("stopped")}><Text style={styles.secondaryButtonText}>手動結束為中止</Text></Pressable>
            </View>
          ) : null}

          <View style={styles.realOpsPanel}>
            <Text style={styles.testingDashboardSubTitle}>Assist / interruption log</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.eventChipRow}>
                {(["verbal", "co-regulation", "environment", "physical"] as AssistLevel[]).map((level) => (
                  <Pressable key={level} style={[styles.tuningChip, assistLevelDraft === level && styles.eventChipActive]} onPress={() => setAssistLevelDraft(level)}><Text style={styles.tuningChipText}>{assistLevelLabel(level)}</Text></Pressable>
                ))}
              </View>
            </ScrollView>
            <TextInput value={assistNoteDraft} onChangeText={setAssistNoteDraft} style={[styles.input, styles.multilineInput]} multiline placeholder="這次 assist 做了什麼" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickChipRow}>
                {[
                  "一句短提示把孩子帶回主線。",
                  "把任務拆成下一個最小步驟。",
                  "先一起做第一步,再退回觀察。",
                ].map((item) => (
                  <Pressable key={item} style={styles.quickChip} onPress={() => setAssistNoteDraft(item)}><Text style={styles.quickChipText}>{item}</Text></Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable style={styles.secondaryButton} onPress={logAssistEvent}><Text style={styles.secondaryButtonText}>記錄 assist</Text></Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.eventChipRow}>
                {(["transition-resistance", "sensory", "bathroom", "food", "sibling", "device", "other"] as InterruptionKind[]).map((kind) => (
                  <Pressable key={kind} style={[styles.tuningChip, interruptionKindDraft === kind && styles.eventChipActive]} onPress={() => setInterruptionKindDraft(kind)}><Text style={styles.tuningChipText}>{interruptionKindLabel(kind)}</Text></Pressable>
                ))}
              </View>
            </ScrollView>
            <TextInput value={interruptionNoteDraft} onChangeText={setInterruptionNoteDraft} style={[styles.input, styles.multilineInput]} multiline placeholder="中斷怎麼發生、影響在哪" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickChipRow}>
                {[
                  "開始前拖延、想離開位置。",
                  "外界聲音一大就中斷。",
                  "看到裝置後主線被拉走。",
                ].map((item) => (
                  <Pressable key={item} style={styles.quickChip} onPress={() => setInterruptionNoteDraft(item)}><Text style={styles.quickChipText}>{item}</Text></Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable style={styles.secondaryButton} onPress={logInterruptionEvent}><Text style={styles.secondaryButtonText}>記錄 interruption</Text></Pressable>
            <Text style={styles.label}>補一條 operator note</Text>
            <TextInput value={customRealEventDraft} onChangeText={setCustomRealEventDraft} style={[styles.input, styles.multilineInput]} multiline placeholder="例如:孩子自己回位、某句提醒特別有效、環境一改就穩了" />
            <Pressable style={styles.secondaryButton} onPress={logCustomRealEvent}><Text style={styles.secondaryButtonText}>加入 timeline note</Text></Pressable>
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Daily real-test review</Text>
            <Text style={styles.handoffSectionLead}>{dailyDigestSections.datedHeadline}</Text>
            {dailyDigestSections.cardLines.map((line) => (
              <Text key={line} style={styles.handoffBullet}>• {line}</Text>
            ))}
            <Text style={styles.handoffBody}>操作員提醒:{realDailyReview.operatorCallout}</Text>
            <Text style={styles.handoffBody}>平均交班完整度:{realDailyReview.avgCoverage}/100</Text>
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Failure / recovery taxonomy</Text>
            <Text style={styles.handoffSectionLead}>{realDailyReview.operatorSummaryLine}</Text>
            <Text style={styles.handoffBullet}>• 失敗事件:{realDailyReview.totalFailures}</Text>
            <Text style={styles.handoffBullet}>• 補救事件:{realDailyReview.totalRecoveries}</Text>
            <Text style={styles.handoffBullet}>• 正向觀察:{realDailyReview.totalPositiveNotes}</Text>
            <Text style={styles.handoffBullet}>• 主卡點:{realDailyReview.topFailure}</Text>
            <Text style={styles.handoffBullet}>• 主補救:{realDailyReview.topRecovery}</Text>
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Real session review board</Text>
            <Text style={styles.handoffSectionLead}>{realSessionReviewBoard.headline}</Text>
            <Text style={styles.handoffBody}>{realSessionReviewBoard.detail}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.eventChipRow}>
                {(["today", "live", "completed", "stopped", "all"] as RealSessionReviewFilter[]).map((filter) => (
                  <Pressable key={filter} style={[styles.tuningChip, realSessionReviewFilter === filter && styles.eventChipActive]} onPress={() => setRealSessionReviewFilter(filter)}>
                    <Text style={styles.tuningChipText}>{realSessionReviewFilterLabel(filter)}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {realSessionReviewBoard.rows.length ? realSessionReviewBoard.rows.map((row) => (
              <Text key={row} style={styles.handoffBullet}>• {row}</Text>
            )) : <Text style={styles.handoffBullet}>• 尚無符合條件的真實 session。</Text>}
            <View style={styles.handoffActionRow}>
              <Pressable style={styles.secondaryButton} onPress={exportDailyHandoff}><Text style={styles.secondaryButtonText}>匯出完整 daily handoff</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={clearLocalSnapshots}><Text style={styles.secondaryButtonText}>清除本機快照</Text></Pressable>
            </View>
          </View>

          {filteredRealSessions.length ? (
            <View style={styles.historyBox}>
              <Text style={styles.historyTitle}>{realSessionReviewFilterLabel(realSessionReviewFilter)} / 真實 session timeline</Text>
              {filteredRealSessions.slice(0, 6).map((session) => (
                <View key={session.id} style={styles.historyCard}>
                  <Text style={styles.historyCardTitle}>{session.childName}|{session.challengeName}|{sessionStatusLabel(session.status)}</Text>
                  <Text style={styles.historyCardLine}>操作員:{session.operatorName}|{session.operatorRole}|{session.location}</Text>
                  <Text style={styles.historyCardLine}>時長:{formatDurationMinutes(session.startedAtIso, session.endedAtIso)}</Text>
                  <Text style={styles.historyCardLine}>狀態:{session.childContext}</Text>
                  <Text style={styles.historyCardLine}>目標:{session.missionGoal}</Text>
                  <Text style={styles.historyCardLine}>Assist {session.assistCount}|Interruption {session.interruptionCount}|{session.startedAtLabel}{session.endedAtLabel ? ` → ${session.endedAtLabel}` : ""}</Text>
                  <Text style={styles.historyCardLine}>優先級:{operatorActionPriority(session)}|階段:{workflowStageLabel(currentWorkflowStage(session))}|重點:{summarizeSessionFocus(session)}</Text>
                  <Text style={styles.historyCardLine}>主卡點:{buildSessionTaxonomy(session).topFailure}</Text>
                  <Text style={styles.historyCardLine}>主補救:{buildSessionTaxonomy(session).topRecovery}</Text>
                  <Text style={styles.historyCardLine}>交班:{session.nextAction}</Text>
                  <Text style={styles.historyCardLine}>交班完整度:{sessionHandoffCoverage(session).score}/100|{sessionHandoffCoverage(session).label}</Text>
                  {session.events.slice(0, 3).map((event) => (
                    <Text key={event.id} style={styles.historyCardLine}>• {event.createdAtLabel}|{event.title === "Workflow stage" ? "流程階段" : summarizeEventTaxonomy(event).phase}|{event.title === "Workflow stage" ? workflowStageLabel((event.detail.split("|")[0] as RealWorkflowStage) || "prep") : summarizeEventTaxonomy(event).label}|{event.detail}</Text>
                  ))}
                  <View style={styles.historyActionRow}>
                    <Pressable style={styles.secondaryButton} onPress={() => loadRealSessionIntoDraft(session)}><Text style={styles.secondaryButtonText}>{session.status === "live" ? "回到 live session" : "載入這輪記錄"}</Text></Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {testingMode ? (
          <View style={styles.card}>
            <SectionTitle title="測試模式入口" subtitle="快速重置、快速模擬,不用每次都手動一路點完整流程。" />
            <Pressable style={styles.testingDashboardToggle} onPress={() => setShowTestingDashboard((prev) => !prev)}>
              <Text style={styles.testingDashboardToggleText}>{showTestingDashboard ? "收起測試面板" : "展開測試面板"}</Text>
            </Pressable>
            <View style={styles.testingScenarioComposer}>
              <Text style={styles.testingDashboardSubTitle}>情境保存 / 重播</Text>
              <TextInput value={scenarioNameDraft} onChangeText={setScenarioNameDraft} style={styles.input} placeholder="情境名稱" />
              <TextInput value={scenarioNoteDraft} onChangeText={setScenarioNoteDraft} style={[styles.input, styles.multilineInput]} placeholder="這輪要驗證什麼" multiline />
              <TextInput value={scenarioOperatorNote} onChangeText={setScenarioOperatorNote} style={[styles.input, styles.multilineInput]} placeholder="操作員備註 / 本輪控管原則" multiline />
              <View style={styles.reproBox}>
                <Text style={styles.reproTitle}>可重播摘要</Text>
                <Text style={styles.reproLine}>Fingerprint:{currentScenarioFingerprint}</Text>
                <Text style={styles.reproLine}>重現度:{currentScenarioReproducibility}/100|{baselineDriftSummary.label}</Text>
                <Text style={styles.reproLine}>{baselineDriftSummary.detail}</Text>
                <Text style={styles.reproLine}>操作員備註:{scenarioOperatorNote}</Text>
              </View>
              <Text style={styles.testingDashboardSubText}>下一張世界事件:{nextWorldEventId ? worldEvents.find((item) => item.id === nextWorldEventId)?.title ?? nextWorldEventId : "不指定,依固定順序抽取"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.eventChipRow}>
                  <Pressable style={[styles.tuningChip, !nextWorldEventId && styles.eventChipActive]} onPress={() => setNextWorldEventId(null)}><Text style={styles.tuningChipText}>清除指定事件</Text></Pressable>
                  {worldEvents.map((event) => (
                    <Pressable key={event.id} style={[styles.tuningChip, nextWorldEventId === event.id && styles.eventChipActive]} onPress={() => setNextWorldEventId(event.id)}><Text style={styles.tuningChipText}>{event.title}</Text></Pressable>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.testingButtonGrid}>
                <Pressable style={styles.testingButton} onPress={() => saveCurrentScenario(lastScenarioKind)}>
                  <Text style={styles.testingButtonTitle}>保存目前情境</Text>
                  <Text style={styles.testingButtonText}>把現在的規則、角色、事件與能力值存起來。</Text>
                </Pressable>
                <Pressable style={styles.testingButton} onPress={() => activeScenarioId ? applyScenarioSnapshot(savedScenarios.find((item) => item.id === activeScenarioId) ?? scenarioTemplates[0]) : applyScenarioSnapshot(scenarioTemplates[0])}>
                  <Text style={styles.testingButtonTitle}>重播目前情境</Text>
                  <Text style={styles.testingButtonText}>直接回到這組起始值,不用手動重配。</Text>
                </Pressable>
                <Pressable style={styles.testingButton} onPress={() => promoteScenarioToBaseline(currentScenarioSnapshot, activeScenarioId ? "saved" : "run")}>
                  <Text style={styles.testingButtonTitle}>升級成基準</Text>
                  <Text style={styles.testingButtonText}>把這組 fingerprint 鎖成之後的對照樣本。</Text>
                </Pressable>
              </View>
              {baselineLibrary.length ? (
                <>
                  <Text style={styles.testingDashboardSubText}>基準庫</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {baselineLibrary.map((baseline) => (
                      <Pressable key={baseline.id} style={[styles.savedScenarioCard, selectedBaselineId === baseline.id && styles.savedScenarioCardActive]} onPress={() => setSelectedBaselineId(baseline.id)}>
                        <Text style={styles.savedScenarioTitle}>{baseline.label}</Text>
                        <Text style={styles.savedScenarioMeta}>{presetLabel(baseline.preset)}|{scenarioKindLabel(baseline.scenarioKind)}</Text>
                        <Text style={styles.savedScenarioText}>{baseline.note}</Text>
                        <Text style={styles.savedScenarioMeta}>{baseline.source === "template" ? "模板基準" : baseline.source === "saved" ? "保存情境" : "實驗樣本"}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
              <Text style={styles.testingDashboardSubText}>內建模板</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {scenarioTemplates.map((template) => (
                  <Pressable key={template.id} style={styles.savedScenarioCard} onPress={() => applyScenarioSnapshot(template)}>
                    <Text style={styles.savedScenarioTitle}>{template.name}</Text>
                    <Text style={styles.savedScenarioMeta}>{scenarioKindLabel(template.kind)}|{presetLabel(template.ruleConfig.preset)}</Text>
                    <Text style={styles.savedScenarioText}>{template.note}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {savedScenarios.length ? (
                <>
                  <Text style={styles.testingDashboardSubText}>已保存情境</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {savedScenarios.map((scenario) => (
                      <Pressable key={scenario.id} style={[styles.savedScenarioCard, activeScenarioId === scenario.id && styles.savedScenarioCardActive]} onPress={() => applyScenarioSnapshot(scenario)}>
                        <Text style={styles.savedScenarioTitle}>{scenario.name}</Text>
                        <Text style={styles.savedScenarioMeta}>{scenarioKindLabel(scenario.kind)}|{presetLabel(scenario.ruleConfig.preset)}</Text>
                        <Text style={styles.savedScenarioText}>{scenario.note}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>
            <View style={styles.testingButtonGrid}>
              <Pressable style={styles.testingButton} onPress={() => resetTestScenario()}>
                <Text style={styles.testingButtonTitle}>快速重置</Text>
                <Text style={styles.testingButtonText}>回到 ready,清掉本輪暫存。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={() => runScenario("normal")}>
                <Text style={styles.testingButtonTitle}>正常一輪</Text>
                <Text style={styles.testingButtonText}>從標準流程重新測一次。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={() => runScenario("extra-time")}>
                <Text style={styles.testingButtonTitle}>延長情境</Text>
                <Text style={styles.testingButtonText}>直接模擬需要更多時間。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={() => runScenario("break")}>
                <Text style={styles.testingButtonTitle}>短休情境</Text>
                <Text style={styles.testingButtonText}>直接模擬中途短暫休息。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={() => runScenario("restart")}>
                <Text style={styles.testingButtonTitle}>重接情境</Text>
                <Text style={styles.testingButtonText}>直接模擬中斷後重新接回。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={() => runScenario("event")}>
                <Text style={styles.testingButtonTitle}>事件情境</Text>
                <Text style={styles.testingButtonText}>直接觸發世界事件流程。</Text>
              </Pressable>
              <Pressable style={styles.testingButton} onPress={markScenarioStopped}>
                <Text style={styles.testingButtonTitle}>記錄中止樣本</Text>
                <Text style={styles.testingButtonText}>把當前情境記成失敗案例,方便比較過硬規則。</Text>
              </Pressable>
            </View>

            {showTestingDashboard ? (
              <View style={styles.testingDashboardBox}>
                <Text style={styles.testingDashboardTitle}>測試面板</Text>
                <View style={styles.testingDashboardGrid}>
                  <View style={styles.testingDashboardCard}>
                    <Text style={styles.testingDashboardLabel}>當前流程</Text>
                    <Text style={styles.testingDashboardValue}>{activePhase.title}</Text>
                  </View>
                  <View style={styles.testingDashboardCard}>
                    <Text style={styles.testingDashboardLabel}>本輪型態</Text>
                    <Text style={styles.testingDashboardValue}>{lastMissionOutcome === "smooth" ? "順利完成" : lastMissionOutcome === "rescued" ? "補救後完成" : "中途中止"}</Text>
                  </View>
                  <View style={styles.testingDashboardCard}>
                    <Text style={styles.testingDashboardLabel}>最新卡點</Text>
                    <Text style={styles.testingDashboardValue}>{lastBlockedStep ?? "暫無"}</Text>
                  </View>
                  <View style={styles.testingDashboardCard}>
                    <Text style={styles.testingDashboardLabel}>最新補救工具</Text>
                    <Text style={styles.testingDashboardValue}>{mostUsedTool ?? "暫無"}</Text>
                  </View>
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>最近統計</Text>
                  <Text style={styles.testingDashboardSubText}>順利完成:{historyStats.smoothCount}|補救完成:{historyStats.rescuedCount}|中途中止:{historyStats.stoppedCount}</Text>
                  <Text style={styles.testingDashboardSubText}>最常卡住:{historyStats.topBlockedStep ?? "暫無"}</Text>
                  <Text style={styles.testingDashboardSubText}>最常用補救:{historyStats.topRescueTool ?? "暫無"}</Text>
                  {scenarioHealth.length ? (
                    <View style={styles.recommendationBox}>
                      <Text style={styles.recommendationLabel}>參數警示</Text>
                      {scenarioHealth.map((warning) => (
                        <Text key={warning} style={styles.recommendationText}>• {warning}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>系統判讀建議</Text>
                  <Text style={styles.testingConclusionLevel}>判讀:{testingConclusion.level}</Text>
                  <Text style={styles.testingDashboardSubText}>{testingConclusion.summary}</Text>
                  <Text style={styles.testingDashboardSubText}>情境 review:{scenarioReview.level}|{scenarioReview.summary}</Text>
                  <View style={styles.recommendationBox}>
                    <Text style={styles.recommendationLabel}>建議動作</Text>
                    <Text style={styles.recommendationText}>{testingRecommendation.hint}</Text>
                    <Pressable style={styles.recommendationButton} onPress={() => applyRulePreset(testingRecommendation.preset)}>
                      <Text style={styles.recommendationButtonText}>{testingRecommendation.label}</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>Operator readiness</Text>
                  <Text style={styles.testingConclusionLevel}>{operatorReadiness.level}</Text>
                  <Text style={styles.testingDashboardSubText}>通過 {operatorReadiness.passed}/{operatorReadiness.total} 項檢查</Text>
                  {operatorReadiness.checks.map((item) => (
                    <Text key={item.label} style={styles.recommendationText}>• {item.pass ? "✅" : "⏳"} {item.label}</Text>
                  ))}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>規則調校</Text>
                  <Text style={styles.testingDashboardSubText}>目前基準版:{presetLabel(baselinePreset)}|目前套用:{presetDrift.label}{presetDrift.dirty ? "(已偏離 active preset)" : ""}</Text>
                  <View style={styles.presetGrid}>
                    <Pressable style={[styles.presetChip, activePreset === "conservative" && styles.presetChipActive]} onPress={() => applyRulePreset("conservative")}><Text style={[styles.presetChipText, activePreset === "conservative" && styles.presetChipTextActive]}>保守版{baselinePreset === "conservative" ? "★" : ""}</Text></Pressable>
                    <Pressable style={[styles.presetChip, activePreset === "balanced" && styles.presetChipActive]} onPress={() => applyRulePreset("balanced")}><Text style={[styles.presetChipText, activePreset === "balanced" && styles.presetChipTextActive]}>平衡版{baselinePreset === "balanced" ? "★" : ""}</Text></Pressable>
                    <Pressable style={[styles.presetChip, activePreset === "relaxed" && styles.presetChipActive]} onPress={() => applyRulePreset("relaxed")}><Text style={[styles.presetChipText, activePreset === "relaxed" && styles.presetChipTextActive]}>寬鬆版{baselinePreset === "relaxed" ? "★" : ""}</Text></Pressable>
                    <Pressable style={[styles.presetChip, activePreset === "challenge" && styles.presetChipActive]} onPress={() => applyRulePreset("challenge")}><Text style={[styles.presetChipText, activePreset === "challenge" && styles.presetChipTextActive]}>高挑戰版{baselinePreset === "challenge" ? "★" : ""}</Text></Pressable>
                  </View>
                  <Pressable style={styles.baselineButton} onPress={lockCurrentPresetAsBaseline}>
                    <Text style={styles.baselineButtonText}>鎖定目前 preset 為基準版</Text>
                  </Pressable>
                  <View style={styles.tuningGrid}>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("dailyMissionCap", -1)}><Text style={styles.tuningChipText}>任務上限 -</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("dailyMissionCap", 1)}><Text style={styles.tuningChipText}>任務上限 +</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("worldEventCap", -1)}><Text style={styles.tuningChipText}>事件上限 -</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("worldEventCap", 1)}><Text style={styles.tuningChipText}>事件上限 +</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("exceptionCap", -1)}><Text style={styles.tuningChipText}>補救上限 -</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("exceptionCap", 1)}><Text style={styles.tuningChipText}>補救上限 +</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("stage2UnlockDays", -1)}><Text style={styles.tuningChipText}>解鎖天數 -</Text></Pressable>
                    <Pressable style={styles.tuningChip} onPress={() => adjustRuleValue("stage2UnlockDays", 1)}><Text style={styles.tuningChipText}>解鎖天數 +</Text></Pressable>
                  </View>
                  <Text style={styles.testingDashboardSubText}>任務上限:{currentRuleConfig.dailyMissionCap}|事件上限:{currentRuleConfig.worldEventCap}|補救上限:{currentRuleConfig.exceptionCap}|Stage 2:{currentRuleConfig.stage2UnlockDays} 天</Text>
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>最近規則調整</Text>
                  {ruleConfigHistory.map((entry) => (
                    <View key={entry.id} style={styles.ruleLogCard}>
                      <Text style={styles.ruleLogTitle}>{entry.preset === "conservative" ? "保守版" : entry.preset === "balanced" ? "平衡版" : entry.preset === "relaxed" ? "寬鬆版" : "高挑戰版"}</Text>
                      <Text style={styles.ruleLogLine}>任務 {entry.dailyMissionCap}|事件 {entry.worldEventCap}|補救 {entry.exceptionCap}|Stage 2 {entry.stage2UnlockDays} 天</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>基準版對照</Text>
                  <Text style={styles.testingDashboardSubText}>{baselineComparison.summary}</Text>
                  <Text style={styles.testingDashboardSubText}>下一步:{scenarioReview.action}</Text>
                  <Text style={styles.testingDashboardSubText}>近期趨勢:{recentTrend}</Text>
                  {compareInsights.map((insight) => (
                    <View key={insight.preset} style={styles.ruleLogCard}>
                      <Text style={styles.ruleLogTitle}>{presetLabel(insight.preset)}|{insight.confidence}</Text>
                      <Text style={styles.ruleLogLine}>順利完成率 {insight.smoothRate}%|中止率 {insight.stoppedRate}%</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>Failure 分析</Text>
                  <Text style={styles.testingConclusionLevel}>{failureAnalysis.headline}</Text>
                  <Text style={styles.testingDashboardSubText}>{failureAnalysis.detail}</Text>
                  {failureAnalysis.items.map((item) => (
                    <Text key={item} style={styles.recommendationText}>• {item}</Text>
                  ))}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>最近比較板</Text>
                  {comparisonBoard.length === 0 ? (
                    <Text style={styles.testingDashboardSubText}>完成幾輪後,這裡會把最近可比較的樣本整理成對照板。</Text>
                  ) : (
                    comparisonBoard.map((item) => (
                      <View key={item.id} style={styles.ruleLogCard}>
                        <Text style={styles.ruleLogTitle}>{item.title}</Text>
                        <Text style={styles.ruleLogLine}>{item.subtitle}</Text>
                        <Text style={styles.ruleLogLine}>{item.detail}</Text>
                      </View>
                    ))
                  )}
                </View>
                <View style={styles.testingDashboardSubBox}>
                  <Text style={styles.testingDashboardSubTitle}>Baseline drift</Text>
                  <Text style={styles.testingDashboardSubText}>目前對照:{selectedBaseline?.label ?? "尚未選擇 baseline"}</Text>
                  {baselineDiffLines.map((line) => (
                    <Text key={line} style={styles.recommendationText}>• {line}</Text>
                  ))}
                  {selectedBaselineSnapshot ? (
                    <Pressable style={styles.recommendationButton} onPress={() => applyScenarioSnapshot(selectedBaselineSnapshot)}>
                      <Text style={styles.recommendationButtonText}>重播選中的 baseline</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <SectionTitle title="Daily handoff / test report" subtitle="把今天測到哪、風險在哪、下一個操作員該接什麼,直接整理成可交班層。" />
          <View style={styles.handoffHeroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.handoffHeroKicker}>今日摘要</Text>
              <Text style={styles.handoffHeroTitle}>{handoffReportSections.headline}</Text>
              <Text style={styles.handoffHeroText}>{handoffReportSections.focusLine}</Text>
            </View>
            <View style={styles.handoffRiskBadge}>
              <Text style={styles.handoffRiskLabel}>{operatorRiskBoard.level}</Text>
              <Text style={styles.handoffRiskValue}>{operatorRiskBoard.score}</Text>
            </View>
          </View>

          <View style={styles.handoffGrid}>
            <View style={styles.handoffMiniCard}>
              <Text style={styles.handoffMiniLabel}>Today focus</Text>
              <Text style={styles.handoffMiniValue}>{dailyReport.todayFocus}</Text>
            </View>
            <View style={styles.handoffMiniCard}>
              <Text style={styles.handoffMiniLabel}>Baseline snapshot</Text>
              <Text style={styles.handoffMiniValue}>{recommendedNextTest.baselineSnapshot}</Text>
            </View>
            <View style={styles.handoffMiniCard}>
              <Text style={styles.handoffMiniLabel}>Preset / runs</Text>
              <Text style={styles.handoffMiniValue}>{dailyReport.activeLabel}|{dailyReport.totalRuns} 輪</Text>
              <Text style={styles.handoffMiniMeta}>sim {simulatedRunCount}|real {realRunCount}</Text>
            </View>
            <View style={styles.handoffMiniCard}>
              <Text style={styles.handoffMiniLabel}>Exception load</Text>
              <Text style={styles.handoffMiniValue}>{dailyReport.exceptionLoad} / {exceptionCap * 3} 追蹤點</Text>
            </View>
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Risk summary</Text>
            <Text style={styles.handoffSectionLead}>{handoffReportSections.riskLine}</Text>
            {operatorRiskBoard.bullets.map((item) => (
              <Text key={item} style={styles.handoffBullet}>• {item}</Text>
            ))}
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Recommended next test</Text>
            <Text style={styles.handoffSectionLead}>{recommendedNextTest.title}</Text>
            <Text style={styles.handoffBody}>{recommendedNextTest.detail}</Text>
            <Text style={styles.handoffBody}>操作員提醒:{recommendedNextTest.operatorCallout}</Text>
            <Text style={styles.handoffBody}>Baseline:{recommendedNextTest.baselineSnapshot}</Text>
            <View style={styles.handoffActionRow}>
              <Pressable style={styles.recommendationButton} onPress={() => applyRulePreset(recommendedNextTest.actionPreset)}>
                <Text style={styles.recommendationButtonText}>切到 {presetLabel(recommendedNextTest.actionPreset)}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => runScenario(recommendedNextTest.actionKind)}>
                <Text style={styles.secondaryButtonText}>直接跑 {scenarioKindLabel(recommendedNextTest.actionKind)}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Operator summary</Text>
            <Text style={styles.handoffSectionLead}>{operatorSessionSummary.lead}</Text>
            {operatorSessionSummary.rows.map((line) => (
              <Text key={line} style={styles.handoffBullet}>• {line}</Text>
            ))}
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Next action queue</Text>
            <Text style={styles.handoffSectionLead}>{nextActionSections.lead}</Text>
            {nextActionSections.rows.map((line, index) => (
              <Text key={line} style={styles.handoffBullet}>{index + 1}. {line}</Text>
            ))}
          </View>

          <View style={styles.handoffSectionCard}>
            <Text style={styles.handoffSectionTitle}>Handoff-ready report</Text>
            <Text style={styles.handoffSectionLead}>{dailyDigestSections.datedHeadline}</Text>
            {handoffReportSections.conciseLines.map((line) => (
              <Text key={line} style={styles.handoffBullet}>• {line}</Text>
            ))}
            <View style={styles.reportSplitBox}>
              <Text style={styles.reportSplitTitle}>REAL FLOOR</Text>
              <Text style={styles.handoffBody}>{dailyDigestSections.floorLine}</Text>
            </View>
            <View style={styles.reportSplitBox}>
              <Text style={styles.reportSplitTitle}>SIMULATION LAB</Text>
              <Text style={styles.handoffBody}>{dailyDigestSections.simLine}</Text>
            </View>
            <View style={styles.reportSplitBox}>
              <Text style={styles.reportSplitTitle}>NEXT SHIFT</Text>
              <Text style={styles.handoffBody}>{dailyDigestSections.nextLine}</Text>
            </View>
            <View style={styles.handoffActionRow}>
              <Pressable style={styles.secondaryButton} onPress={exportDailyHandoff}><Text style={styles.secondaryButtonText}>匯出 daily handoff</Text></Pressable>
            </View>
          </View>
        </View>

        </> : null}

        {isParentMode && showParentHomeModules && !showParentAssist ? <>
        {!missionInProgress && missionPhase !== "settle" ? <View style={styles.zoneHeader}>
          <Text style={styles.zoneKicker}>現在</Text>
          <Text style={styles.zoneTitle}>這一輪要做什麼</Text>
          <Text style={styles.zoneText}>先進場,再出戰,再依流程走,不把孩子丟進資訊堆裡。</Text>
        </View> : null}

        {!missionInProgress && missionPhase !== "settle" ? <View style={styles.card}>
          <SectionTitle title="任務主流程" subtitle="第一步先讓系統知道:現在是在準備、出戰、流程中,還是收尾。" />
          <View style={styles.flowPhaseCard}>
            <Text style={styles.flowPhaseKicker}>{activePhase.kicker}</Text>
            <Text style={styles.flowPhaseTitle}>{activePhase.title}</Text>
            <Text style={styles.flowPhaseText}>{activePhase.cue}</Text>
            <View style={styles.flowPhaseNextBox}>
              <Text style={styles.flowPhaseNextLabel}>現在建議</Text>
              <Text style={styles.flowPhaseNextText}>{activePhase.nextAction}</Text>
            </View>
            <View style={[styles.buttonRow, { marginTop: 12 }]}>
              <Pressable style={styles.secondaryButton} onPress={openFlowGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
            </View>
          </View>
        </View> : null}

        {missionPhase !== "challenge" && missionPhase !== "settle" && !(isParentMode && showParentHomeModules && !showParentAssist && missionPhase === "ready") ? <View style={[styles.card, missionPhase === "ready" && styles.cardPhaseActive]}>
          <SectionTitle title="準備確認卡 / 狀態切換卡" subtitle="開始前先一起確認狀態。" />
          <Text style={styles.phaseHint}>本階段推薦:{recommendedTransitionIds[missionPhase].length ? recommendedTransitionIds[missionPhase].join(" / ") : "已可往下個階段移動"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {transitionCards.map((item) => (
              <View key={item.id} style={[styles.quickCard, recommendedTransitionIds[missionPhase].includes(item.id) && styles.quickCardRecommended, !canUseTransitionCard(item.id) && styles.cardDisabled]}>
                {item.imageSource ? <Image source={item.imageSource} style={styles.quickCardImage} resizeMode="contain" /> : null}
                <Text style={styles.quickCardTitle}>{item.title}</Text>
                <Text style={styles.quickCardText}>{item.childLine}</Text>
                <Text style={styles.quickCardHint}>{item.parentHint}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => transitionNow(item)}><Text style={styles.secondaryButtonText}>使用這張卡</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openTransitionGuide(item)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View> : null}
        </> : null}

        {missionPhase === "ready" && ((isChildMode && !challengeSelectionConfirmed) || (isParentMode && showParentHomeModules && !showParentAssist)) ? <View style={[styles.card, styles.cardPhaseActive]} onLayout={(event) => setReadyCheckSectionY(event.nativeEvent.layout.y)}>
          <SectionTitle title={isChildMode ? "還沒選好時,先穩一下" : "Are you ready? / I'm Ready"} subtitle={isChildMode ? "如果還沒準備好,可以先多一點時間或短休。" : "先由家長發問,等孩子說出 I'm ready,再按下面的 I'm Ready。"} />
          <Text style={styles.phaseHint}>{challengeSelectionConfirmed ? "時間挑戰已確認。現在請先問孩子 Are you ready? 等孩子說 I'm ready 之後，再按 I'm Ready。" : isChildMode ? "選好任務卡後,上面會直接進入開始任務。這裡只留給還沒準備好時使用。" : "現在這裡要先做 Ready Check,再決定是不是按 I'm Ready。"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {transitionCards.filter((item) => recommendedTransitionIds[missionPhase].includes(item.id)).map((item) => (
              <View key={item.id} style={[styles.quickCard, styles.quickCardRecommended, !canUseTransitionCard(item.id) && styles.cardDisabled]}>
                {item.imageSource ? <Image source={item.imageSource} style={styles.quickCardImage} resizeMode="contain" /> : null}
                <Text style={styles.quickCardTitle}>{item.id === "im-ready" ? "I'm Ready" : item.title}</Text>
                <Text style={styles.quickCardText}>{item.childLine}</Text>
                <Text style={styles.quickCardHint}>{item.id === "im-ready" && isParentMode ? "先問孩子 Are you ready? 等孩子回答 I'm ready,再按這張。" : item.parentHint}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={item.id === "im-ready" ? styles.primaryButton : styles.secondaryButton} onPress={() => transitionNow(item)}><Text style={item.id === "im-ready" ? styles.primaryButtonText : styles.secondaryButtonText}>{item.id === "im-ready" ? (isParentMode ? "孩子說完後按這張" : "我準備好了") : "用這張"}</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openTransitionGuide(item)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View> : null}

        {(isChildMode ? missionPhase === "challenge" : (missionInProgress || ((showParentHomeModules && (missionPhase === "ready" || missionPhase === "challenge")) && !showParentAssist))) ? <View style={[styles.card, missionPhase === "challenge" && styles.cardPhaseActive]}>
          <SectionTitle title={missionInProgress ? "目前這一輪" : isChildMode ? "現在這輪" : "時間挑戰卡總覽|Holton 出戰型態"} subtitle={missionInProgress ? "開始後就先把這一輪跑完,不用再回頭重選。" : isChildMode ? "開始後就看這一張,不用再切很多設定。" : `上面先單張選,下面再看完整 ${timeChallenges.length} 張時間挑戰卡。`} />
          {!(isChildMode && missionInProgress) ? <Text style={styles.phaseHint}>{missionPhase === "challenge" ? `${selectedChallenge.name} 這一輪已經開始了。` : isChildMode ? "開始後,這裡就是你現在這一輪。" : `這裡是完整時間挑戰展示區，讓家長知道目前總共有 ${timeChallenges.length} 張可用。`}</Text> : null}
          {isParentMode && hasCoreGuardian && missionPhase === "ready" ? <View style={styles.readyGuardianCard}>
            {activeCoreGuardianPreviewImage ? <View style={styles.readyGuardianImageFrame}><Image source={activeCoreGuardianPreviewImage} style={styles.readyGuardianImage} resizeMode={activeCoreGuardianPreviewResizeMode} /></View> : null}
            <View style={styles.readyGuardianContent}>
              <Text style={styles.readyGuardianKicker}>READY CHECK × 本命獸</Text>
              <Text style={styles.readyGuardianTitle}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 先出來陪進場</Text>
              <View style={styles.readyGuardianMetaRow}>
                <View style={styles.readyGuardianMetaChip}><Text style={styles.readyGuardianMetaText}>{coreGuardianStage}</Text></View>
                <View style={styles.readyGuardianMetaChip}><Text style={styles.readyGuardianMetaText}>本週 {coreGuardianWeeklyFeed}/{coreGuardianWeeklyFeedTarget}</Text></View>
              </View>
              <Text style={styles.readyGuardianText}>{missionCompanionPresenceLine}</Text>
              <Text style={styles.readyGuardianText}>現在先不要急著推進度,先讓孩子看到:牠會陪這一步一起開始。</Text>
              <Text style={styles.readyGuardianTapHint}>這裡直接進本命獸，不要先被其他 summary 卡住。</Text>
              <View style={styles.buttonRow}>
                <Pressable style={styles.secondaryButton} onPress={() => openParentGuardianPanel("已直接打開本命獸面板。先看牠，再決定要不要往下帶。")}><Text style={styles.secondaryButtonText}>直接看本命獸</Text></Pressable>
                <Pressable style={styles.primaryButton} onPress={() => { openParentGuardianPanel(coreGuardianWeeklyFeed === 0 ? "已打開本命獸面板。現在先餵第 1 顆，讓陪跑感真的出來。" : "已打開本命獸面板。現在先餵 1 顆，再看牠怎麼陪這一步。"); feedCoreGuardian(); }}><Text style={styles.primaryButtonText}>{coreGuardianWeeklyFeed === 0 ? "先餵第 1 顆" : "先餵 1 顆"}</Text></Pressable>
              </View>
            </View>
          </View> : null}
          {isParentMode && hasCoreGuardian && missionPhase === "challenge" ? <View style={[styles.infoBox, { backgroundColor: "#eef2ff", marginBottom: 12 }]}>
            <Text style={styles.infoTitle}>本命獸現在也在這一輪裡</Text>
            <Text style={styles.infoText}>{missionCompanionPresenceLine}</Text>
            <Text style={styles.infoText}>家長現在先不要把牠當獎勵,而是當一句可直接拿來接孩子的話。</Text>
          </View> : null}
          {isParentMode && !missionInProgress ? timeChallenges.map((card) => {
            const active = card.id === selectedChallengeId;
            return (
              <View key={card.id} style={[styles.challengeCard, active && styles.challengeCardActive]}>
                <Pressable style={styles.challengeCardTapArea} onPress={() => selectTimeChallengeCard(card)}>
                  {card.imageSource ? <Image source={card.imageSource} style={styles.challengeCardImage} resizeMode="contain" /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{card.name}</Text>
                    <Text style={styles.challengeSub}>{card.untimed ? `不限時任務|+${card.orbs} Orbs` : `${card.minutes} 分鐘|+${card.orbs} Orbs`}</Text>
                    <Text style={styles.challengeCue}>{card.cue}</Text>
                    <Text style={styles.challengeUseHint}>{card.whenToUse}</Text>
                  </View>
                  <Pill label={active ? "已選擇" : "可選"} active={active} />
                  {!active ? <Text style={styles.challengeTapHint}>點卡切換</Text> : null}
                </Pressable>
                <View style={styles.buttonRow}>
                  <Pressable style={active ? styles.primaryButton : styles.secondaryButton} onPress={() => selectTimeChallengeCard(card)}>
                    <Text style={active ? styles.primaryButtonText : styles.secondaryButtonText}>{active ? "目前這張" : "選這張"}</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openTimeChallengeGuide(card)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                </View>
              </View>
            );
          }) : null}

          <View style={styles.timerPanel}>
            {selectedChallenge.imageSource ? <Image source={selectedChallenge.imageSource} style={styles.selectedChallengeImage} resizeMode="contain" /> : null}
            <Text style={styles.timerMission}>{selectedChallenge.name}</Text>
            <Text style={styles.timerNote}>{missionInProgress ? `先把這一輪跑完;如果要換卡,先取消或先暫停。` : selectedChallenge.cue}</Text>
            <View style={styles.missionOrbPillRow}>
              <Text style={styles.missionOrbPill}>現在 {orbs} Orbs</Text>
              <Text style={styles.missionOrbPill}>完成 +{selectedChallenge.orbs}</Text>
              <Text style={styles.missionOrbPillStrong}>目標 {orbs + selectedChallenge.orbs}</Text>
            </View>
            <Text style={styles.infoText}>{selectedChallenge.untimed ? `不限時任務|+${selectedChallenge.orbs} Orbs` : `${selectedChallenge.minutes} 分鐘|+${selectedChallenge.orbs} Orbs`}</Text>
            <Text style={styles.timerValue}>{selectedChallenge.untimed ? "不限時" : formatTime(remaining)}</Text>
            {!selectedChallenge.untimed ? <ProgressBar value={progress} color="#7c3aed" /> : null}
            {missionInProgress ? (
              <>
                <View style={[styles.buttonRow, styles.missionActionRowTop]}>
                  <Pressable style={styles.primaryButton} onPress={pauseMission}><Text style={styles.primaryButtonText}>暫停</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => {
                    const breatherCard = activeSkills.find((skill) => skill.id === "breather-1");
                    if (breatherCard) activateSkill(breatherCard);
                  }}><Text style={styles.secondaryButtonText}>穩一下</Text></Pressable>
                </View>
                <View style={[styles.buttonRow, styles.missionActionRowTop]}>
                  {selectedChallenge.untimed ? <Pressable style={styles.primaryButton} onPress={completeUntimedMission}><Text style={styles.primaryButtonText}>完成這輪</Text></Pressable> : null}
                  <Pressable style={styles.secondaryButton} onPress={() => cancelCurrentMissionRound()}><Text style={styles.secondaryButtonText}>取消這輪</Text></Pressable>
                </View>
              </>
            ) : null}
            {hasCoreGuardian ? <View style={styles.missionCompanionBar}>
              {activeCoreGuardianPreviewImage ? <View style={styles.missionCompanionAvatarFrame}><Image source={activeCoreGuardianPreviewImage} style={styles.missionCompanionAvatar} resizeMode={activeCoreGuardianPreviewResizeMode} /></View> : null}
              <View style={styles.missionCompanionContent}>
                <Text style={styles.missionCompanionKicker}>MISSION COMPANION</Text>
                <Text style={styles.missionCompanionName}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"}</Text>
                <View style={styles.missionCompanionMetaRow}>
                  <View style={styles.missionCompanionMetaChip}><Text style={styles.missionCompanionMetaText}>{coreGuardianStage}</Text></View>
                  <View style={styles.missionCompanionMetaChip}><Text style={styles.missionCompanionMetaText}>本週 {coreGuardianWeeklyFeed}/{coreGuardianWeeklyFeedTarget}</Text></View>
                </View>
                <Text style={styles.missionCompanionText}>{missionCompanionPresenceLine}</Text>
              </View>
            </View> : null}
            {missionInProgress && isChildMode ? <View style={styles.childEntryTaskCard}>
              <Text style={styles.childEntryTaskNo}>第 {effectiveCurrentStep + 1} 步 / 共 {missionSopFlowCards.length} 步</Text>
              {renderChildCue("NOW", "task")}
              <Image source={childSceneImages.currentAction} style={styles.childEntryTaskHeroImage} resizeMode="cover" />
              <Text style={styles.childEntryTaskTitle}>現在做這個</Text>
              <Text style={styles.childEntryTaskText}>{activeSopCard.childLine}</Text>
              <View style={styles.sopJourneyBox}>
                <Text style={styles.sopJourneyLabel}>小任務</Text>
                <Text style={styles.sopJourneyText}>{activeSopGoalLine}</Text>
              </View>
              <View style={styles.childTaskActionDock}>
                <Pressable style={[styles.childDoneButton, !canConfirmCurrentStep && styles.buttonDisabled]} onPress={confirmCurrentStep}>
                  <Text style={styles.childDoneKicker}>DONE</Text>
                  <Text style={styles.childDoneText}>我做完了 ✅</Text>
                  <Text style={styles.childDoneSubText}>拿 +{selectedChallenge.orbs} Orbs</Text>
                </Pressable>
                <Pressable style={styles.childHelpButton} onPress={() => { setShowParentAssist(true); setSelectedSupportScenario("stuck"); setSelectedSupportVariant("stuck_no_next_step"); setMessage(`卡住沒關係。先停一下，請爸爸媽媽幫忙看「${activeSopCard.title}」這一步。`); }}>
                  <Text style={styles.childHelpKicker}>HELP</Text>
                  <Text style={styles.childHelpText}>我需要幫忙</Text>
                </Pressable>
              </View>
            </View> : null}
            {missionInProgress && isParentMode ? <View style={styles.missionSopCard}>
              <Text style={styles.missionSopKicker}>PARENT MODE</Text>
              <Text style={styles.missionSopFlowLead}>整條流程都在這裡；先選一張，再把它接成現在這一步。</Text>
              <View style={styles.missionSopSummaryRow}>
                {missionSopFlowCards[effectiveCurrentStep - 1] ? <View style={styles.missionSopSummaryChip}><Text style={styles.missionSopSummaryChipText}>上一步</Text><Text style={styles.missionSopSummaryChipValue}>{missionSopFlowCards[effectiveCurrentStep - 1].title}</Text></View> : <View style={styles.missionSopSummaryChip}><Text style={styles.missionSopSummaryChipText}>起點</Text><Text style={styles.missionSopSummaryChipValue}>剛進到這一輪</Text></View>}
                <View style={[styles.missionSopSummaryChip, styles.missionSopSummaryChipCurrent]}><Text style={[styles.missionSopSummaryChipText, styles.missionSopSummaryChipTextCurrent]}>目前</Text><Text style={[styles.missionSopSummaryChipValue, styles.missionSopSummaryChipValueCurrent]}>{missionSopFlowCards[effectiveCurrentStep]?.title ?? `STEP ${effectiveCurrentStep + 1}`}</Text></View>
                {missionSopFlowCards[effectiveCurrentStep + 1] ? <View style={styles.missionSopSummaryChip}><Text style={styles.missionSopSummaryChipText}>下一步</Text><Text style={styles.missionSopSummaryChipValue}>{missionSopFlowCards[effectiveCurrentStep + 1].title}</Text></View> : <View style={styles.missionSopSummaryChip}><Text style={styles.missionSopSummaryChipText}>收尾</Text><Text style={styles.missionSopSummaryChipValue}>這一步後就收尾</Text></View>}
              </View>
              <View style={styles.missionSopProgressTrack}>
                {effectiveCurrentStep > 0 ? <View style={[styles.missionSopProgressFillDone, { flex: effectiveCurrentStep }]} /> : null}
                <View style={styles.missionSopProgressFillCurrent} />
                {missionSopFlowCards.length - effectiveCurrentStep - 1 > 0 ? <View style={[styles.missionSopProgressFillRemaining, { flex: missionSopFlowCards.length - effectiveCurrentStep - 1 }]} /> : null}
              </View>
              <Text style={styles.missionSopProgressCaption}>{`第 ${effectiveCurrentStep + 1} / ${missionSopFlowCards.length} 步`}{missionSopFlowCards.length - effectiveCurrentStep - 1 > 0 ? `・後面還有 ${missionSopFlowCards.length - effectiveCurrentStep - 1} 步` : "・這一步後收尾"}</Text>
              <View style={[styles.missionSopShowcaseCard, isPhoneLayout && styles.missionSopShowcaseCardPhone]}>
                <View style={[styles.missionSopShowcaseMediaColumn, isPhoneLayout && styles.missionSopShowcaseMediaColumnPhone]}>
                  <View style={styles.missionSopShowcaseMediaFrame}>
                    {selectedMissionSopCard.imageSource ? <Image source={selectedMissionSopCard.imageSource} style={styles.missionSopShowcaseImage} resizeMode="contain" /> : null}
                  </View>
                  <View style={styles.missionSopShowcaseTagRow}>
                    <View style={[styles.missionSopShowcaseTag, selectedMissionStep === effectiveCurrentStep && styles.missionSopShowcaseTagActive]}><Text style={[styles.missionSopShowcaseTagText, selectedMissionStep === effectiveCurrentStep && styles.missionSopShowcaseTagTextActive]}>{selectedMissionStep === effectiveCurrentStep ? "目前主線" : "已選這張"}</Text></View>
                    <View style={styles.missionSopShowcaseTag}><Text style={styles.missionSopShowcaseTagText}>{`STEP ${selectedMissionStep + 1}`}</Text></View>
                  </View>
                  <View style={styles.missionSopStepperStack}>
                    <View style={styles.missionSopStepperCenter}><Text style={styles.missionSopStepperCenterText}>{selectedMissionStep === effectiveCurrentStep ? "現在就在這一步" : `目前預覽第 ${selectedMissionStep + 1} 步`}</Text></View>
                    <View style={styles.missionSopStepperRow}>
                      <Pressable style={[styles.missionSopStepperButton, selectedMissionStep <= 0 && styles.missionSopStepperButtonDisabled]} disabled={selectedMissionStep <= 0} onPress={() => previewMissionSopStep(-1)}><Text style={[styles.missionSopStepperButtonText, selectedMissionStep <= 0 && styles.missionSopStepperButtonTextDisabled]}>上一步</Text></Pressable>
                      <Pressable style={[styles.missionSopStepperButton, selectedMissionStep >= missionSopFlowCards.length - 1 && styles.missionSopStepperButtonDisabled]} disabled={selectedMissionStep >= missionSopFlowCards.length - 1} onPress={() => previewMissionSopStep(1)}><Text style={[styles.missionSopStepperButtonText, selectedMissionStep >= missionSopFlowCards.length - 1 && styles.missionSopStepperButtonTextDisabled]}>下一步</Text></Pressable>
                    </View>
                  </View>
                </View>
                <View style={styles.missionSopShowcaseContentColumn}>
                  <View style={styles.missionSopFlowHeader}>
                    <Text style={[styles.missionSopFlowStep, selectedMissionStep === effectiveCurrentStep && styles.missionSopFlowStepCurrent]}>{selectedMissionStep === effectiveCurrentStep ? "現在操作" : "選到這張"}</Text>
                    <Text style={[styles.missionSopFlowIndex, selectedMissionStep === effectiveCurrentStep && styles.missionSopFlowIndexCurrent]}>{selectedMissionStep === effectiveCurrentStep ? `第 ${effectiveCurrentStep + 1} / ${missionSopFlowCards.length} 步` : `選到第 ${selectedMissionStep + 1} 步`}</Text>
                  </View>
                  <Text style={styles.missionSopShowcaseTitle}>{selectedMissionSopCard.title}</Text>
                  <Text style={styles.missionSopShowcaseBody}>{selectedMissionStep === effectiveCurrentStep ? `現在做：${selectedMissionSopCard.childLine}` : `如果改接這一步：${selectedMissionSopCard.childLine}`}</Text>
                  <View style={styles.missionSopShowcaseInfoCard}>
                    <Text style={styles.missionSopShowcaseInfoLabel}>這一步目標</Text>
                    <Text style={styles.missionSopShowcaseInfoText}>{selectedMissionSopGoalLine}</Text>
                  </View>
                  <View style={styles.missionSopShowcaseInfoCard}>
                    <Text style={styles.missionSopShowcaseInfoLabel}>{selectedMissionStep === effectiveCurrentStep ? "做完後" : "如果改接後"}</Text>
                    <Text style={styles.missionSopShowcaseInfoText}>{selectedMissionSopNextLine}</Text>
                  </View>
                  <View style={styles.missionSopActionRow}>
                    <Pressable style={isChildMode ? styles.missionSopActionPrimary : styles.missionSopActionSecondary} onPress={selectedMissionStep !== effectiveCurrentStep && isChildMode ? applyMissionSopSelection : () => openSopGuide(selectedMissionSopCard)}><Text style={isChildMode ? styles.missionSopActionPrimaryText : styles.missionSopActionSecondaryText}>{isChildMode ? (selectedMissionStep !== effectiveCurrentStep ? "改成現在這步" : "先照這步做") : "看這步帶法"}</Text></Pressable>
                    {isParentMode ? <Pressable style={styles.missionSopActionPrimary} onPress={selectedMissionStep !== effectiveCurrentStep ? applyMissionSopSelection : () => { setShowParentAssist(true); setSelectedSupportScenario("stuck"); setSelectedSupportVariant("stuck_no_next_step"); setMessage(`先照 ${selectedMissionSopCard.title} 把孩子帶回這一步；如果只是卡住，就先只接下一步。`); }}><Text style={styles.missionSopActionPrimaryText}>用這步接回</Text></Pressable> : <Pressable style={styles.missionSopActionSecondary} onPress={selectedMissionStep !== effectiveCurrentStep ? applyMissionSopSelection : () => { setShowParentAssist(true); setSelectedSupportScenario("stuck"); setSelectedSupportVariant("stuck_no_next_step"); setMessage(`如果卡住，就先回到 ${selectedMissionSopCard.title} 這一步，再決定要不要叫幫助卡。`); }}><Text style={styles.missionSopActionSecondaryText}>{selectedMissionStep !== effectiveCurrentStep ? "用這步接回" : "卡住再求救"}</Text></Pressable>}
                  </View>
                </View>
              </View>
              <View style={styles.missionSopFlowList}>
                {missionSopFlowCards.map((card, index) => {
                  const isCurrentCard = index === effectiveCurrentStep;
                  const isPastCard = index < effectiveCurrentStep;
                  const isPrevCard = index === effectiveCurrentStep - 1;
                  const isNextCard = index === effectiveCurrentStep + 1;
                  const isSelectedCard = index === selectedMissionStep;
                  return (
                    <Pressable key={`mission-sop-${card.id}`} onPress={() => setSelectedMissionSopIndex(index)} style={[styles.missionSopFlowCard, isPhoneLayout && styles.missionSopFlowCardPhone, isCurrentCard && styles.missionSopFlowCardCurrent, isPastCard && styles.missionSopFlowCardPast, isPrevCard && styles.missionSopFlowCardPrev, isNextCard && styles.missionSopFlowCardNext, isSelectedCard && styles.missionSopFlowCardSelected]}>
                      {isCurrentCard ? <View style={styles.missionSopFlowCurrentRail} /> : null}
                      {card.imageSource ? <View style={[styles.missionSopFlowThumbWrap, isPhoneLayout && styles.missionSopFlowThumbWrapPhone]}><Image source={card.imageSource} style={styles.missionSopFlowThumb} resizeMode="contain" /></View> : null}
                      <View style={styles.missionSopFlowMiniContent}>
                        <View style={styles.missionSopFlowHeader}>
                          <Text style={[styles.missionSopFlowStep, isCurrentCard && styles.missionSopFlowStepCurrent, isPrevCard && styles.missionSopFlowStepPrev, isNextCard && styles.missionSopFlowStepNext]}>{isCurrentCard ? "目前" : isPrevCard ? "上一步" : isPastCard ? "已完成" : isNextCard ? "下一步" : "後續"}</Text>
                          <Text style={[styles.missionSopFlowIndex, isCurrentCard && styles.missionSopFlowIndexCurrent]}>STEP {index + 1}</Text>
                        </View>
                        <Text style={styles.missionSopFlowTitle}>{card.title}</Text>
                        <Text style={styles.missionSopFlowText}>{isCurrentCard ? `現在做：${card.childLine}` : isPastCard ? `已完成：${card.childLine}` : isNextCard ? `接著做：${card.childLine}` : `之後做：${card.childLine}`}</Text>
                        {isSelectedCard && selectedMissionStep !== effectiveCurrentStep ? <Text style={styles.missionSopFlowInlineMeta}>已選中，按上面的按鈕就會套用這一步。</Text> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View> : null}
            {!missionInProgress ? (
              <>
                <View style={styles.buttonRow}>
                  {missionPhase === "ready" ? (
                    <Pressable style={styles.primaryButton} onPress={startMission}><Text style={styles.primaryButtonText}>開始任務</Text></Pressable>
                  ) : (
                    <Pressable style={styles.secondaryButton} onPress={() => transitionNow(transitionCards.find((item) => item.id === "ready-check") ?? transitionCards[0])}><Text style={styles.secondaryButtonText}>回 Ready Check</Text></Pressable>
                  )}
                </View>
                <Text style={styles.minorHint}>{missionPhase === "ready" ? "先決定要不要進場;中途再用暫停、穩一下或取消這輪處理。" : "目前仍在任務階段;若要重新開始,先回 Ready Check。"}</Text>
              </>
            ) : null}
          </View>
        </View> : null}

        {missionInProgress && isParentMode ? <View style={styles.card}>
          <SectionTitle title="孩子一喊就能直接用" subtitle="孩子一喊卡,家長這裡也要立刻看得到主動技能卡與支援卡。" />
          {hasCoreGuardian ? <View style={styles.missionCompanionSupportCard}>
            <Text style={styles.missionCompanionSupportKicker}>MISSION COMPANION</Text>
            <Text style={styles.missionCompanionSupportTitle}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"} {isChildMode ? "也在這裡" : "也能一起陪跑"}</Text>
            <Text style={styles.missionCompanionSupportText}>{missionCompanionSupportLine}</Text>
          </View> : null}
          <Text style={styles.minorHint}>先看現在孩子是在求穩一下、短停一下,還是需要你直接開一張幫助卡。</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeSkills.map((skill) => (
              <View
                key={skill.id}
                style={[styles.skillCard, (usedActiveSkills[skill.id] || !canUseActiveSkill(skill.id)) && styles.skillCardUsed]}
              >
                {skill.imageSource ? <Image source={skill.imageSource} style={styles.skillCardImage} resizeMode="contain" /> : null}
                <Text style={styles.skillLevel}>{skill.level ?? "-"}</Text>
                <Text style={styles.skillTitle}>{skill.id === "pause-1" ? "暫停" : skill.id === "breather-1" ? "穩一下" : skill.title}</Text>
                <Text style={styles.skillText}>{skill.parentHint}</Text>
                <Text style={styles.skillFoot}>{activeSkillAvailabilityLabel(skill.id)}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => activateSkill(skill)}><Text style={styles.secondaryButtonText}>直接幫他用</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openActiveSkillGuide(skill)}><Text style={styles.secondaryButtonText}>看帶法</Text></Pressable>
                </View>
              </View>
            ))}
            {supportTools.map((tool) => (
              <View key={tool.id} style={styles.quickCard}>
                {tool.imageSource ? <Image source={tool.imageSource} style={styles.quickCardImage} resizeMode="contain" /> : null}
                <Text style={styles.quickCardTitle}>{tool.title}</Text>
                <Text style={styles.quickCardText}>{tool.parentHint}</Text>
                <Text style={styles.quickCardHint}>孩子一喊卡時,家長可直接先用這張接住。</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => activateSupportTool(tool)}>
                    <Text style={styles.secondaryButtonText}>直接幫他用</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => { setJustReturnedFromWrapUp(false); setPostWrapUpContinuationSteps(0); setSupportGuideToolId(tool.id); setMessage(`已打開 ${tool.title} 的使用說明。`); }}>
                    <Text style={styles.secondaryButtonText}>看帶法</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View> : null}

        {missionPhase === "settle" ? (
          <View style={[styles.infoBox, { backgroundColor: "#ecfccb", marginBottom: 12 }]}>
            <Image source={childSceneImages.stepComplete} style={styles.supportSceneImage} resizeMode="cover" />
            <Text style={[styles.infoTitle, { color: "#166534" }]}>這一輪先收住了</Text>
            <Text style={styles.infoText}>先看完成回饋,把這輪好好收好,再順著接回下一步。</Text>
            {hasCoreGuardian ? <View style={styles.missionCompanionSupportCard}>
              <Text style={styles.missionCompanionSupportKicker}>MISSION COMPANION</Text>
              <Text style={styles.missionCompanionSupportTitle}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 也陪你收尾</Text>
              <Text style={styles.missionCompanionSupportText}>{settleCompanionLine}</Text>
            </View> : null}
            <View style={styles.buttonRow}>
              {!settleChecklist.packupReady ? <Pressable style={styles.primaryButton} onPress={() => confirmSettleItem("packupReady")}><Text style={styles.primaryButtonText}>進入收尾整理</Text></Pressable> : <Pressable style={styles.primaryButton} onPress={confirmCurrentStep}><Text style={styles.primaryButtonText}>把這輪收好,回主線</Text></Pressable>}
              {settleChecklist.packupReady ? <Pressable style={styles.secondaryButton} onPress={finishMissionRoundAndPrepareNext}><Text style={styles.secondaryButtonText}>這輪完結,開新任務</Text></Pressable> : null}
            </View>
          </View>
        ) : null}

        {(!isParentMode || (showParentHomeModules && !showParentAssist)) && !(isChildMode && missionInProgress) && !(isParentMode && missionInProgress) ? <View style={[styles.card, (missionPhase === "sop" || missionPhase === "settle") && styles.cardPhaseActive]}>
          {missionPhase === "sop" && postWrapUpFocusActive ? <View style={[styles.infoBox, { backgroundColor: "#ecfeff", marginBottom: 12 }]}>
            <Text style={[styles.infoTitle, { color: "#0f766e" }]}>{justReturnedFromWrapUp ? (isChildMode ? (activeSopCard.id === "adjust" ? "已接回微調主線" : "已接回確認主線") : (activeSopCard.id === "adjust" ? "收尾後已接回微調主線" : "收尾後已接回確認主線")) : (isChildMode ? "已接住下一步主線" : "收尾後主線已延續到下一步")}</Text>
            <Text style={styles.infoText}>{justReturnedFromWrapUp ? (isChildMode ? `上一輪已收好,現在先接 ${activeSopCard.title}。` : `這一輪已經收尾完成,現在先帶孩子接回 ${activeSopCard.title}。`) : (isChildMode ? `上一個接回點已完成,現在先順著 ${activeSopCard.title} 往下走。` : `上一個接回點已經接住,現在先順著 ${activeSopCard.title} 往下帶。`)}</Text>
            <Text style={styles.infoText}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? (isChildMode ? `先回到剛剛卡住的 ${activeSopCard.title}。` : `這一輪剛剛卡在 ${activeSopCard.title},先帶孩子回這一步。`) : activeSopCard.id === "adjust" ? (isChildMode ? "先把剛剛卡住的地方微調回來。" : "這一輪剛有卡點或補救,先用 Adjust 把主線接穩。") : (isChildMode ? "先確認現在做到哪裡,再往下走。" : "這一輪算順利完成,先用 Check-In 對焦目前位置。")) : (isChildMode ? "先順著這一步做,不要立刻跳去別的卡。" : "這一層先順著主線往下帶,不要立刻切回完整判斷層。")}</Text>
          </View> : null}
          <SectionTitle title={postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? (isChildMode ? "先回到這一步" : "接回卡點流程卡") : isChildMode ? (activeSopCard.id === "adjust" ? "先調回這一步" : "先確認這一步") : (activeSopCard.id === "adjust" ? "接回微調流程卡" : "接回確認流程卡")) : isChildMode ? "順著這一步往下走" : "主線延續流程卡") : isChildMode ? "現在這一步" : "SOP 流程卡"} subtitle={postWrapUpFocusActive ? (justReturnedFromWrapUp ? (isChildMode ? "先把這一步接回來,再繼續往下。" : "這一層現在先把孩子接回眼前這一步。") : (isChildMode ? "先順著這一步往下做,先不要跳去別的地方。" : "這一層先順著主線往下帶,不要立刻展開其他層。")) : isChildMode ? (missionPhase === "settle" ? "先把這輪好好收住,再順著接回下一步。" : "先做這一步,卡住就求救。") : (missionPhase === "settle" ? "這一層現在先把本輪好好收住,再把主線接回去。" : "中間卡最容易被忽略,所以要直接放進主流程。")} />
          {isChildMode ? <>
            <View style={styles.childEntryCard}>
              <Text style={styles.childEntryTitle}>{missionPhase === "settle" ? "現在先把這輪好好收好" : postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "現在先回到卡住這一步" : activeSopCard.id === "adjust" ? "現在先把主線調回來" : "現在先把主線接回來") : "現在先順著主線往下走") : "現在先只做這一步"}</Text>
              <Text style={styles.childEntryText}>{activeSopCard.title}</Text>
              <Text style={styles.infoText}>{activeSopCard.childLine}</Text>
              <View style={styles.sopJourneyBox}>
                <Text style={styles.sopJourneyLabel}>這一步的任務</Text>
                <Text style={styles.sopJourneyText}>{activeSopGoalLine}</Text>
                <Text style={styles.sopJourneyLabel}>做完後會去哪</Text>
                <Text style={styles.sopJourneyText}>{activeSopNextLine}</Text>
              </View>
              <View style={styles.childEntryTaskCard}>
                <Text style={styles.childEntryTaskNo}>{postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "回到卡點" : "接回主線") : "順著主線") : `STEP ${effectiveCurrentStep + 1}`}</Text>
                {renderChildCue("NOW", "task")}
                <Image source={childSceneImages.currentAction} style={styles.childEntryTaskHeroImage} resizeMode="cover" />
                <Text style={styles.childEntryTaskTitle}>{activeSopCard.title}</Text>
                <Text style={styles.childEntryTaskText}>{postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? `先回到剛剛卡住的這一步。${activeSopCard.childLine}` : activeSopCard.id === "adjust" ? `先把剛剛卡住的地方調回來。${activeSopCard.childLine}` : `先把主線接回這一步。${activeSopCard.childLine}`) : `先順著這一步往下做。${activeSopCard.childLine}`) : activeSopCard.childLine}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={[styles.primaryButton, !canConfirmCurrentStep && styles.buttonDisabled]} onPress={confirmCurrentStep}><Text style={styles.primaryButtonText}>{missionPhase === "settle" ? (settleChecklist.packupReady ? "把這輪收好,回主線" : "先把這輪收完整") : postWrapUpFocusActive ? (justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "先回到這一步" : activeSopCard.id === "adjust" ? "先調回來" : "先確認這一步") : "順著做這一步") : "完成這步"}</Text></Pressable>
                  {missionPhase === "settle" && settleChecklist.packupReady ? <Pressable style={styles.secondaryButton} onPress={finishMissionRoundAndPrepareNext}><Text style={styles.secondaryButtonText}>這輪完結,開新任務</Text></Pressable> : null}
                </View>
              </View>
              {!postWrapUpFocusActive ? <View style={styles.buttonRow}>
                <Pressable style={styles.secondaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(true); setSelectedSupportScenario("stuck"); setMessage("先不要一次想完整段,卡住時先回到『我卡住了』入口。"); }}><Text style={styles.secondaryButtonText}>我卡住了</Text></Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => openSopGuide(activeSopCard)}><Text style={styles.secondaryButtonText}>這步怎麼做</Text></Pressable>
              </View> : null}
              {!postWrapUpFocusActive ? <View style={styles.childEntryInnerCard}>
                <Text style={styles.childEntryInnerTitle}>卡住就求救</Text>
                <Text style={styles.infoText}>卡住不是掉出主線,只是先停一下、穩一下,然後回到眼前這一步。</Text>
                <View style={styles.childSupportFlowGrid}>
                  {childSupportFlowCards.map((card) => (
                    <Pressable
                      key={`sop-${card.id}`}
                      style={[
                        styles.childSupportFlowCard,
                        card.accent === "support" ? styles.childSupportFlowCardSupport : styles.childSupportFlowCardWarm,
                      ]}
                      onPress={() => {
                        setShowParentAssist(true);
                        const nextScenario = card.scenario ?? "stuck";
                        setSelectedSupportScenario(nextScenario);
                        setMessage(card.id === "pause" ? "先停一下,不等於失敗。停完還是回這一輪。" : card.id === "regulate" ? "先把自己穩住,等一下還是回這一步。" : "好,跟著守護獸去找幫助,再回這一步。");
                      }}
                    >
                      {renderChildCue(card.cue, card.accent === "support" ? "support" : "warm")}
                      <Image source={card.image} style={styles.childSupportFlowImage} resizeMode="cover" />
                      <Text style={styles.childSupportFlowTitle}>{card.title}</Text>
                    </Pressable>
                  ))}
                </View>
              </View> : null}
            </View>
          </> : null}

          {isParentMode ? <>
          <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>{postWrapUpFocusActive ? (justReturnedFromWrapUp ? "先接回來" : "先順著主線") : "家長再看"}</Text>
            <Text style={styles.parentLayerDividerText}>{postWrapUpFocusActive ? (justReturnedFromWrapUp ? "這一層現在先只做一件事:把孩子帶回眼前這一步。" : "這一層現在先只做一件事:順著已接住的主線往下帶。") : "下面這一層是步驟推薦、parent hint、流程牆與怎麼帶回主線,不一定要先給孩子看。"}</Text>
          </View>
          {postWrapUpFocusActive ? <View style={styles.currentStepPanel}>
            <Text style={styles.currentStepKicker}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "卡點帶回帶法" : "接回主線帶法") : "主線延續帶法"}</Text>
            {activeSopCard.imageSource ? <Image source={activeSopCard.imageSource} style={styles.currentStepPanelImage} resizeMode="contain" /> : null}
            <Text style={styles.currentStepTitle}>{activeSopCard.title}</Text>
            <Text style={styles.currentStepText}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? `先把孩子帶回剛剛卡住的這一步。${activeSopCard.childLine}` : `先把孩子帶回這一步。${activeSopCard.childLine}`) : `先順著這一步往下帶。${activeSopCard.childLine}`}</Text>
            <Text style={styles.currentStepHint}>{justReturnedFromWrapUp ? "這裡先負責把主線接回來,不用一次把後面整段都講完。" : "這裡先順著剛接住的主線往下帶,不用立刻切回完整判斷層。"}</Text>
            <View style={styles.sopJourneyBox}>
              <Text style={styles.sopJourneyLabel}>這一步家長要完成什麼</Text>
              <Text style={styles.sopJourneyText}>{activeSopGoalLine}</Text>
              <Text style={styles.sopJourneyLabel}>這一步接住後往哪裡</Text>
              <Text style={styles.sopJourneyText}>{activeSopNextLine}</Text>
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => openSopGuide(activeSopCard)}><Text style={styles.primaryButtonText}>{justReturnedFromWrapUp ? (lastBlockedStep && activeSopCard.title === lastBlockedStep ? "先看怎麼回這一步" : activeSopCard.id === "adjust" ? "先看怎麼調回來" : "先看怎麼帶回來") : "先看怎麼順著帶"}</Text></Pressable>
            </View>
          </View> : <>
            <Text style={styles.phaseHint}>整條 SOP 直接看完，先照亮著的那一步走。</Text>
            <View style={styles.sopJourneyBox}>
              <Text style={styles.sopJourneyLabel}>現在這層先做什麼</Text>
              <Text style={styles.sopJourneyText}>{missionPhase === "ready" ? "先把孩子接到 Ready Check,再決定要不要正式進場。" : activeSopGoalLine}</Text>
              <Text style={styles.sopJourneyLabel}>家長現在怎麼看</Text>
              <Text style={styles.sopJourneyText}>灰的是前面，亮的是現在，往下就是後面要接的步驟。</Text>
            </View>
          </>}
          <View style={styles.stepRail}>
            {sopCards.map((step, index) => {
              const isCurrentStep = effectiveCurrentStep === index;
              const isPastStep = index < effectiveCurrentStep;
              const isNearCurrentStep = Math.abs(index - effectiveCurrentStep) <= 1;
              if (postWrapUpFocusActive && !isNearCurrentStep) return null;
              return (
              <View key={step.id} style={[styles.stepCard, isCurrentStep && styles.stepCardActive, isPastStep && styles.stepCardPast, visibleRecommendedSopIds.includes(step.id) && styles.stepCardRecommended]}>
                {step.imageSource ? <Image source={step.imageSource} style={styles.stepCardImage} resizeMode="contain" /> : null}
                <Text style={styles.stepIndex}>{postWrapUpFocusActive ? (isCurrentStep ? `現在先接這一步 | Step ${index + 1} | Lv.${step.level ?? "-"}` : isPastStep ? `剛剛接回這一步前 | Step ${index + 1} | Lv.${step.level ?? "-"}` : `等一下接這一步 | Step ${index + 1} | Lv.${step.level ?? "-"}`) : (isCurrentStep ? `現在這一步 | Step ${index + 1} | Lv.${step.level ?? "-"}` : isPastStep ? `前面這一步 | Step ${index + 1} | Lv.${step.level ?? "-"}` : `後面會接這一步 | Step ${index + 1} | Lv.${step.level ?? "-"}`)}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{postWrapUpFocusActive ? (isCurrentStep ? `現在先接回：${step.childLine}` : isPastStep ? "前一步先不用重講" : `等一下再順到：${step.title}`) : (isCurrentStep ? `現在先做：${step.childLine}` : isPastStep ? "這一步先算做過" : `等一下會接到：${step.title}`)}</Text>
                <Text style={styles.listHint}>{isCurrentStep ? `家長現在先照 ${step.title} 帶這一步。` : step.parentHint}</Text>
              </View>
            );})}
          </View>
          <Text style={styles.minorHint}>主流程卡已先排成一條，後面再補更細的自動導引。</Text>
          </> : null}
        </View> : null}

        {isChildMode && !missionInProgress && missionPhase !== "settle" && !postWrapUpFocusActive ? <View style={styles.card}>
          <SectionTitle title="陪你一起走的本命獸" subtitle="先把今天這一步走穩,再照顧牠;世界 / 圖鑑之後再看。" />
          {!hasCoreGuardian ? (
            <View style={styles.childEntryInnerCard}>
              <View style={styles.childCuePairRow}>
                {renderChildCue("HI", "primary")}
                {renderChildCue("GROW", "task")}
              </View>
              <Text style={styles.childEntryInnerTitle}>先把本命獸迎接回來</Text>
              <Text style={styles.infoText}>牠不是另外一套任務,而是會陪你把今天這一步走穩的主角。先把牠迎接回來,再慢慢一起開始。</Text>
              <View style={styles.buttonRow}>
                <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={openCoreGuardianCreation}><Text style={styles.secondaryButtonText}>開始建立本命獸</Text></Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.childEntryInnerCard}>
              <Text style={styles.childCompanionKicker}>MY GUARDIAN</Text>
              {activeCoreGuardianPreviewImage ? <View style={styles.childCompanionHeroImageFrame}><Image source={activeCoreGuardianPreviewImage} style={styles.childCompanionHeroImage} resizeMode={activeCoreGuardianPreviewResizeMode} /></View> : null}
              <View style={styles.childCuePairRow}>
                {renderChildCue("CARE", "primary")}
                {renderChildCue("FEED", "task")}
              </View>
              <Text style={styles.childCompanionName}>{coreGuardianName || coreGuardianBase?.name || "你的本命獸"}</Text>
              <Text style={styles.childCompanionRoleLine}>{coreGuardianStatus === "bonded" ? "牠會陪你把今天這一步走穩。" : "牠已經來陪你走今天這一步。"}</Text>
              <Text style={styles.infoText}>{coreGuardianStatus === "bonded" ? `本週已餵 ${coreGuardianWeeklyFeed}/${coreGuardianWeeklyFeedTarget}。先照顧牠,再回來做今天這一步。` : "先看見牠,再慢慢開始今天這一步。"}</Text>
              <View style={styles.childCompanionMetaRow}>
                <View style={styles.childCompanionMetaChip}><Text style={styles.childCompanionMetaText}>{coreGuardianStage}</Text></View>
                <View style={styles.childCompanionMetaChip}><Text style={styles.childCompanionMetaText}>{coreGuardianStatus === "bonded" ? "正式陪伴" : "先一起相處"}</Text></View>
              </View>
              {coreGuardianJustCreated ? <Text style={[styles.minorHint, { color: "#0f766e" }]}>牠剛剛已經來了,現在不用再切很多層。</Text> : null}
              <View style={styles.buttonRow}>
                <Pressable style={styles.secondaryButton} onPress={() => { setMessage(`${coreGuardianName || coreGuardianBase?.name || "你的本命獸"} 在這裡。先看牠,再回到今天這一步。`); }}><Text style={styles.secondaryButtonText}>先看牠</Text></Pressable>
                <Pressable style={[styles.primaryButton, { flex: 1 }]} onPress={() => { feedCoreGuardian(); if (coreGuardianJustCreated) setCoreGuardianJustCreated(false); }}><Text style={styles.primaryButtonText}>{coreGuardianWeeklyFeed === 0 ? "先餵第 1 顆" : "再餵 1 顆"}</Text></Pressable>
              </View>
            </View>
          )}
        </View> : null}

        {isChildMode && !missionInProgress && missionPhase !== "settle" && !postWrapUpFocusActive ? <View style={styles.card}>
          <SectionTitle title="世界 / 圖鑑" subtitle="這裡不是另一套任務,而是把你這一輪留下來的東西,變成真的看得見。" />
          <View style={[styles.infoBox, { backgroundColor: "#eff6ff", marginBottom: 12 }]}>
            <Text style={styles.infoTitle}>這裡現在最值得看什麼</Text>
            <Text style={styles.infoText}>{guardianEncounterWindowActive ? "你這次有留下門。先看這扇門打開到哪裡。" : capturedGuardianCount > 0 ? `${showcaseGuardian.name} 會先站在最前面,讓你先看見這次真的有東西留下來。` : guardianTraces > 0 ? `世界已經留下 ${guardianTraces} 個痕跡。先看它回了你什麼。` : "這一輪不會做完就消失。世界會慢慢替你留下看得見的東西。"}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={() => { setJustReturnedFromWrapUp(false); setPostWrapUpContinuationSteps(0); const next = !showWeeklyDetails; setShowWeeklyDetails(next); if (next) { setSelectedBeastId(showcaseGuardian.id); setMessage(`已打開世界 / 圖鑑,先看 ${showcaseGuardian.name} 這次替你留下了什麼。`); } else { setMessage("已先收起世界 / 圖鑑。"); } }}><Text style={styles.secondaryButtonText}>{showWeeklyDetails ? "先收起世界 / 圖鑑" : "去看這次留下了什麼"}</Text></Pressable>
          </View>
        </View> : null}

        {isParentMode && showParentHomeModules && showHomeDetails && !missionInProgress && missionPhase !== "settle" && !showParentAssist ? <View style={styles.card}>
          <SectionTitle title="例外情境處理" subtitle="這塊是測試版重點:卡住時怎麼接回,不要整輪直接斷掉。" />
          <View style={styles.exceptionButtonGrid}>
            <Pressable style={[styles.exceptionButton, !canTriggerException("extra-time") && styles.cardDisabled]} onPress={handleNeedMoreTime}>
              <Text style={styles.exceptionButtonTitle}>需要更多時間</Text>
              <Text style={styles.exceptionButtonText}>補 1 分鐘,回到準備確認。</Text>
            </Pressable>
            <Pressable style={[styles.exceptionButton, !canTriggerException("break") && styles.cardDisabled]} onPress={handleShortBreak}>
              <Text style={styles.exceptionButtonTitle}>短暫休息</Text>
              <Text style={styles.exceptionButtonText}>短休,不算失敗。</Text>
            </Pressable>
            <Pressable style={[styles.exceptionButton, !canTriggerException("restart") && styles.cardDisabled]} onPress={handleRestartFlow}>
              <Text style={styles.exceptionButtonTitle}>重新接回</Text>
              <Text style={styles.exceptionButtonText}>保留進度,從重接卡繼續。</Text>
            </Pressable>
          </View>
          <Text style={styles.minorHint}>今日分支紀錄:延長 {extraTimeRequestsToday} 次|短休 {breakCountToday} 次|重接 {restartCountToday} 次</Text>
        </View> : null}

        {isParentMode && showParentHomeModules && showHomeDetails && !missionInProgress && missionPhase !== "settle" && !showParentAssist ? <View style={styles.card}>
          <SectionTitle title="Active Skills|每輪各可用一次" subtitle="孩子知道規則後,能主動施放技能。" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeSkills.map((skill) => (
              <View
                key={skill.id}
                style={[styles.skillCard, (usedActiveSkills[skill.id] || !canUseActiveSkill(skill.id)) && styles.skillCardUsed]}
              >
                {skill.imageSource ? <Image source={skill.imageSource} style={styles.skillCardImage} resizeMode="contain" /> : null}
                <Text style={styles.skillLevel}>{skill.level ?? "-"}</Text>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillText}>{skill.childLine}</Text>
                <Text style={styles.skillHint}>{skill.parentHint}</Text>
                <Text style={styles.skillFoot}>{activeSkillAvailabilityLabel(skill.id)}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => activateSkill(skill)}><Text style={styles.secondaryButtonText}>使用這張卡</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openActiveSkillGuide(skill)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View> : null}

        {isParentMode && showParentHomeModules && showHomeDetails && !missionInProgress && missionPhase !== "settle" ? <View style={styles.card}>
          <SectionTitle title={showParentAssist ? "家長建議接回層" : "家長建議卡"} subtitle={showParentAssist ? "先選情境，拿一句話，再叫出建議卡。" : "孩子卡住時，先來這裡拿最短接法。"} />
          {!showParentAssist ? <View style={[styles.infoBox, { backgroundColor: "#f8fafc" }]}>
            <Text style={styles.infoTitle}>先不用自己想整段</Text>
            <Text style={styles.infoText}>不知道怎麼帶時，先拿一句話，再決定下一步。</Text>
            <Text style={styles.minorHint}>提醒模式維持:{supportReminderModeLabel(supportReminderMode)}</Text>
          </View> : null}
          {!showParentAssist ? <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={() => { const next = !showSupportTools; setShowSupportTools(next); setShowParentHomeModules(true); setShowHomeDetails(true); setShowParentAssist(false); setMessage(next ? "已打開直接叫卡。" : "已先收起直接叫卡。"); }}>
              <Text style={styles.secondaryButtonText}>{showSupportTools ? "收起直接叫卡" : "直接叫卡"}</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => { const next = !showParentAssist; setShowParentAssist(next); setShowParentHomeModules(true); setShowHomeDetails(true); setShowSupportTools(false); if (next) { setSelectedSupportScenario((prev) => prev ?? defaultSupportScenario); setSelectedSupportVariant(null); } setMessage(next ? "已打開家長建議。" : "已先收起家長建議。"); }}>
              <Text style={styles.primaryButtonText}>{showParentAssist ? "收起家長建議" : "我不知道怎麼幫 → 拿建議"}</Text>
            </Pressable>
          </View> : null}
          {showSupportTools ? (
            <>
              <Text style={styles.minorHint}>當孩子在現實中主動說想用某張卡時,由父母從這裡手動叫出。</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {supportTools.map((tool) => (
                  <View key={tool.id} style={styles.quickCard}>
                    {tool.imageSource ? <Image source={tool.imageSource} style={styles.quickCardImage} resizeMode="contain" /> : null}
                    <Text style={styles.quickCardTitle}>{tool.title}</Text>
                    <Text style={styles.quickCardText}>{tool.childLine}</Text>
                    <Text style={styles.quickCardHint}>{tool.parentHint}</Text>
                    <View style={styles.buttonRow}>
                      <Pressable style={styles.secondaryButton} onPress={() => activateSupportTool(tool)}>
                        <Text style={styles.secondaryButtonText}>使用這張卡</Text>
                      </Pressable>
                      <Pressable style={styles.secondaryButton} onPress={() => { setJustReturnedFromWrapUp(false); setSupportGuideToolId(tool.id); setMessage(`已打開 ${tool.title} 的使用說明。`); }}>
                        <Text style={styles.secondaryButtonText}>怎麼用</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}
          {showParentAssist ? (
            <>
              <Text style={styles.minorHint}>先選最像的情境，再拿一句話和一張卡。</Text>
              {selectedSupportScenarioConfig ? <View style={styles.parentAssistSummaryCard}>
                <Text style={styles.parentAssistKicker}>PARENT ASSIST</Text>
                <Text style={styles.infoTitle}>現在先這樣接回</Text>
                <Text style={styles.infoText}>情境:{supportConfigTitle}</Text>
                <Text style={styles.infoText}>先說:{supportFirstSayLine}</Text>
                <Text style={styles.infoText}>先做:{supportFirstAction}</Text>
                <Text style={styles.infoText}>接回:{supportConfigNextStep || activeSopNextLine}</Text>
              </View> : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {supportAssistScenarios.filter((scenario) => ["start", "emotion", "stuck"].includes(scenario.id)).map((scenario) => (
                  <Pressable
                    key={scenario.id}
                    style={[styles.quickCard, styles.parentAssistScenarioCard, selectedSupportScenario === scenario.id && styles.quickCardRecommended]}
                    onPress={() => { setSelectedSupportScenario(scenario.id); setSelectedSupportVariant(null); setParentAssistResultTag(null); setMessage(`已切到「${scenario.title}」情境,先看建議卡與接回主線方式。`); }}
                  >
                    <Text style={styles.quickCardTitle}>{scenario.title}</Text>
                    <Text style={styles.quickCardText}>{parentSupportQuickLens[scenario.id].shortLine}</Text>
                    <Text style={styles.quickCardHint}>{scenario.id === "start" && missionPhase === "ready" ? `${parentSupportQuickLens[scenario.id].actionLine}|Ready Check` : scenario.id === "stuck" && missionPhase !== "ready" ? `${parentSupportQuickLens[scenario.id].actionLine}|目前 SOP` : scenario.id === "restart" && missionPhase !== "ready" ? `${parentSupportQuickLens[scenario.id].actionLine}|主線接回` : `${parentSupportQuickLens[scenario.id].actionLine}|${supportTools.find((tool) => tool.id === scenario.suggestedToolId)?.title ?? scenario.suggestedToolId}`}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {selectedSupportScenarioConfig ? (
                <View style={styles.parentAssistDetailCard}> 
                  {missionPhase === "challenge" && selectedSupportScenario === "stuck" ? <View style={[styles.infoBox, { backgroundColor: "#ffffff", marginBottom: 10 }]}> 
                    <Text style={styles.infoTitle}>現在先對回這張主卡</Text>
                    <Text style={styles.infoText}>{activeSopCard.title}</Text>
                    <Text style={styles.infoText}>先把孩子帶回眼前這一步，再決定要不要往下出支援卡。</Text>
                  </View> : null}
                  <Text style={styles.infoTitle}>先拿最短接法</Text>
                  {selectedSupportScenarioConfig.variants?.length ? <>
                    <Text style={styles.infoText}>如果這次卡法不一樣，先改選最像的版本。</Text>
                    <View style={styles.quickStepRow}>
                      {selectedSupportScenarioConfig.variants.map((variant) => (
                        <Pressable key={variant.id} style={[styles.quickStepChip, selectedSupportVariant === variant.id && styles.quickStepChipActive]} onPress={() => { setSelectedSupportVariant(variant.id); setParentAssistResultTag(null); setMessage(`已切到「${variant.title}」版本。`); }}>
                          <Text style={[styles.quickStepChipText, selectedSupportVariant === variant.id && styles.quickStepChipTextActive]}>{variant.title}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </> : null}
                  <View style={styles.parentAssistInnerCard}> 
                    <Text style={styles.infoText}>{supportShouldRouteToReadyCheck ? `最短接法:先回 Ready Check,再決定要不要進這一輪。` : supportShouldRouteToCurrentSop ? `最短接法:先回目前 SOP,只接下一步。` : supportShouldRouteToRestart ? `最短接法:先保留已做到的地方,再接回主線。` : `最短接法:先用 ${supportPrimaryTool?.title ?? selectedSupportScenarioConfig.suggestedToolId},再回 ${supportConfigNextStep}`}</Text>
                    <Text style={styles.infoText}>先不要講太多，先把這一步接住。</Text>
                  </View>
                  <View style={[styles.parentAssistInnerCard, styles.parentAssistActionCard]}> 
                    <Text style={styles.infoTitle}>{supportShouldRouteToReadyCheck ? "先回到進場判斷" : supportShouldRouteToCurrentSop ? "先回目前這一步" : supportShouldRouteToRestart ? "先接回主線" : "先叫出這張卡"}</Text>
                    <Text style={styles.infoText}>{supportPrimaryActionHint}</Text>
                    <Pressable
                      style={[styles.primaryButton, { marginTop: 12 }]}
                      onPress={() => {
                        if (supportShouldRouteToReadyCheck) {
                          transitionNow(transitionCards.find((item) => item.id === "ready-check") ?? transitionCards[0]);
                          setMessage("這次先回 Ready Check。先確認能不能開始，再決定要不要出卡。");
                          return;
                        }
                        if (supportShouldRouteToCurrentSop) {
                          setShowParentAssist(false);
                          setShowParentHomeModules(true);
                          setShowHomeDetails(true);
                          setMessage("這次先回目前 SOP。先只接下一步，不用另外換系統。");
                          return;
                        }
                        if (supportShouldRouteToRestart) {
                          handleRestartFlow();
                          setMessage("這次先保留已做進度，再接回主線，不用全部重來。");
                          return;
                        }
                        if (supportPrimaryTool) activateSupportTool(supportPrimaryTool);
                      }}
                    >
                      <Text style={styles.primaryButtonText}>{supportPrimaryActionLabel}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
          {activeSupportTool && supportCountdown > 0 ? (
            <View style={[styles.infoBox, { backgroundColor: "#fff7ed" }]}>
              <Text style={styles.infoTitle}>現在先跑這張支援卡</Text>
              <Text style={styles.infoText}>{activeSupportTool.title} 正在進行中,等一下處理完再接回主線。</Text>
              <Text style={styles.infoText}>提醒方式:{supportReminderModeLabel(supportReminderMode)}</Text>
            </View>
          ) : null}
          {activeSupportTool && supportNeedsReturn ? (
            <View style={styles.supportReturnCard}>
              <Text style={styles.supportReturnKicker}>SUPPORT RETURN</Text>
              <Text style={styles.infoTitle}>支援完成後,現在怎麼接回</Text>
              <Text style={styles.infoText}>{activeSupportTool.title} 已完成。現在只要決定主線怎麼接,不用再另外找入口。</Text>
              <View style={styles.supportReturnSummaryRow}>
                <View style={styles.supportReturnChip}><Text style={styles.supportReturnChipText}>{activeSupportTool.title}</Text></View>
                <View style={styles.supportReturnChip}><Text style={styles.supportReturnChipText}>先選一條接回路</Text></View>
              </View>
              <View style={styles.exceptionButtonGrid}>
                <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("ready")}>
                  <Text style={styles.exceptionButtonTitle}>回 Ready Check</Text>
                  <Text style={styles.exceptionButtonText}>先重新確認要不要進場。</Text>
                </Pressable>
                <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("sop")}>
                  <Text style={styles.exceptionButtonTitle}>回目前 SOP</Text>
                  <Text style={styles.exceptionButtonText}>只接下一步。</Text>
                </Pressable>
                <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("restart")}>
                  <Text style={styles.exceptionButtonTitle}>走 Restart</Text>
                  <Text style={styles.exceptionButtonText}>用重接方式回主線。</Text>
                </Pressable>
                <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("settle")}>
                  <Text style={styles.exceptionButtonTitle}>直接收尾</Text>
                  <Text style={styles.exceptionButtonText}>這一輪先乾淨結束。</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View> : null}

        {isParentMode && showParentHomeModules && showHomeDetails && !missionInProgress && missionPhase !== "settle" && !showParentAssist ? <>
        <View style={styles.zoneHeader}>
          <Text style={styles.zoneKicker}>今天</Text>
          <Text style={styles.zoneTitle}>今天的狀態卡</Text>
          <Text style={styles.zoneText}>這裡只放今天要看的數字,不把長期收藏和當前流程混在一起。</Text>
        </View>

        <View style={styles.card}>
          <SectionTitle title="今日狀態卡" subtitle="Base、Bonus、任務輪數、挑戰資格,都在這裡。" />
          <View style={styles.guideButtonRow}>
            <Pressable style={styles.secondaryButton} onPress={openDailyStatusGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
          </View>
          <View style={styles.todaySummaryRow}>
            <View style={styles.todaySummaryCard}>
              <Text style={styles.todaySummaryKicker}>TODAY</Text>
              <Text style={styles.todaySummaryLabel}>今日任務</Text>
              <Text style={styles.todaySummaryValue}>{missionsDoneToday}/{dailyMissionCap + extraMissionSlots}</Text>
            </View>
            <View style={styles.todaySummaryCard}>
              <Text style={styles.todaySummaryKicker}>TODAY</Text>
              <Text style={styles.todaySummaryLabel}>剩餘次數</Text>
              <Text style={styles.todaySummaryValue}>{missionsRemaining}</Text>
            </View>
            <View style={styles.todaySummaryCard}>
              <Text style={styles.todaySummaryKicker}>TODAY</Text>
              <Text style={styles.todaySummaryLabel}>Bonus</Text>
              <Text style={styles.todaySummaryValue}>{bonusOrbs}/2</Text>
            </View>
            <View style={styles.todaySummaryCard}>
              <Text style={styles.todaySummaryKicker}>TODAY</Text>
              <Text style={styles.todaySummaryLabel}>事件</Text>
              <Text style={styles.todaySummaryValue}>{worldEventsDrawnToday}/{worldEventCap}</Text>
            </View>
          </View>

          <Pressable style={styles.todayToggle} onPress={() => { const next = !showTodayDetails; setShowTodayDetails(next); if (next) setShowParentHomeModules(true); setMessage(next ? "已展開今日細節。" : "已先收起今日細節。"); }}>
            <Text style={styles.todayToggleText}>{showTodayDetails ? "收起今日細節" : "展開今日細節"}</Text>
          </Pressable>

          {showTodayDetails ? (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>Base Orbs</Text><Text style={styles.statBoxValue}>{orbs}</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>Bonus Pool</Text><Text style={styles.statBoxValue}>{bonusOrbs}/2</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>今日任務</Text><Text style={styles.statBoxSmall}>{missionsDoneToday} / {dailyMissionCap} 已完成</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>剩餘次數</Text><Text style={styles.statBoxValue}>{missionsRemaining}</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>Guardian Trace</Text><Text style={styles.statBoxValue}>{guardianTraces}</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>守護獸資格</Text><Text style={styles.statBoxValue}>{guardianChallengeTokens}</Text></View>
              <View style={styles.statBox}><Text style={styles.statBoxLabel}>世界事件</Text><Text style={styles.statBoxSmall}>{worldEventsDrawnToday} / {worldEventCap} 已觸發</Text></View>
            </View>
          ) : null}

          <View style={[styles.infoBox, { backgroundColor: "#f8fafc", marginBottom: 0 }]}>
            <Text style={styles.infoTitle}>今日節奏</Text>
            <Text style={styles.infoText}>今天最多 {dailyMissionCap} 次任務輪,目前已完成 {missionsDoneToday} 次,剩餘 {missionsRemaining} 次。Bonus Pool 與守護獸資格都可能被世界事件動態影響。</Text>
          </View>

          {false ? (
            <View style={styles.settleBox}>
              <Text style={styles.settleTitle}>本輪收尾建議</Text>
              <Text style={styles.settleText}>先確認本輪拿到的能量球、是否觸發世界事件,再用收尾完成卡 / 收尾整理把這輪任務真正收乾淨。</Text>
              <View style={styles.observeBox}>
                <Text style={styles.observeTitle}>本輪觀察重點</Text>
                <Text style={styles.observeText}>完成型態:{lastMissionOutcome === "smooth" ? "順利完成" : lastMissionOutcome === "rescued" ? "補救後完成" : "中途中止"}</Text>
                <Text style={styles.observeText}>卡住步驟:{lastBlockedStep ?? "本輪沒有明顯卡點"}</Text>
                <Text style={styles.observeText}>最常用補救工具:{mostUsedTool ?? "本輪未使用補救工具"}</Text>
                <Text style={styles.observeText}>分支判斷:{missionObservation?.mostUsedBranch ?? "本輪主要走標準流程"}</Text>
              </View>
              <View style={styles.reportBox}>
                <Text style={styles.reportTitle}>測試記錄摘要</Text>
                {missionReportLines.map((line) => (
                  <Text key={line} style={styles.reportLine}>• {line}</Text>
                ))}
              </View>
              <View style={styles.historyBox}>
                <Text style={styles.historyTitle}>最近測試紀錄</Text>
                {missionHistory.length === 0 ? (
                  <Text style={styles.historyEmpty}>目前還沒有累積歷史資料。</Text>
                ) : (
                  missionHistory.map((entry, index) => (
                    <View key={`${entry.id}-${index}`} style={styles.historyCard}>
                      <Text style={styles.historyCardTitle}>{entry.challengeName}|{entry.outcome === "smooth" ? "順利完成" : entry.outcome === "rescued" ? "補救後完成" : "中途中止"}</Text>
                      <Text style={styles.historyCardLine}>規則:{entry.preset === "conservative" ? "保守版" : entry.preset === "balanced" ? "平衡版" : entry.preset === "relaxed" ? "寬鬆版" : "高挑戰版"}</Text>
                      <Text style={styles.historyCardLine}>卡點:{entry.blockedStep ?? "無明顯卡點"}</Text>
                      <Text style={styles.historyCardLine}>補救:{entry.rescueTool ?? "未使用補救工具"}</Text>
                      <Text style={styles.historyCardLine}>結果:Orbs +{entry.orbDelta}|Bonus {entry.bonusDelta >= 0 ? `+${entry.bonusDelta}` : entry.bonusDelta}</Text>
                      <Text style={styles.historyCardLine}>分支:{entry.branchSummary}</Text>
                      <Text style={styles.historyCardLine}>建議:{entry.advice}</Text>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.compareTitle}>規則 vs 結果對照</Text>
                {(["conservative", "balanced", "relaxed", "challenge"] as RulePreset[]).map((preset) => {
                  const item = presetPerformance[preset];
                  return (
                    <View key={preset} style={styles.compareCard}>
                      <Text style={styles.compareCardTitle}>{preset === "conservative" ? "保守版" : preset === "balanced" ? "平衡版" : preset === "relaxed" ? "寬鬆版" : "高挑戰版"}</Text>
                      <Text style={styles.compareCardLine}>測試輪數:{item.total}</Text>
                      <Text style={styles.compareCardLine}>順利完成:{item.smooth}|補救完成:{item.rescued}|中止:{item.stopped}</Text>
                    </View>
                  );
                })}
                <View style={styles.compareRecommendationBox}>
                  <Text style={styles.compareRecommendationLabel}>目前建議基準版</Text>
                  <Text style={styles.compareRecommendationValue}>{presetRecommendation.label}</Text>
                  <Text style={styles.compareRecommendationText}>{presetRecommendation.reason}</Text>
                  <Text style={styles.compareRecommendationText}>{baselineComparison.summary}</Text>
                </View>
              </View>
              <View style={styles.historyBox}>
                <Text style={styles.historyTitle}>實驗回顧</Text>
                <View style={styles.presetGrid}>
                  <Pressable style={[styles.tuningChip, runReviewFilter === "all" && styles.eventChipActive]} onPress={() => setRunReviewFilter("all")}><Text style={styles.tuningChipText}>全部</Text></Pressable>
                  <Pressable style={[styles.tuningChip, runReviewFilter === "risky" && styles.eventChipActive]} onPress={() => setRunReviewFilter("risky")}><Text style={styles.tuningChipText}>只看風險樣本</Text></Pressable>
                  <Pressable style={[styles.tuningChip, runReviewFilter === "smooth" && styles.eventChipActive]} onPress={() => setRunReviewFilter("smooth")}><Text style={styles.tuningChipText}>只看順利樣本</Text></Pressable>
                </View>
                <Text style={styles.historyCardLine}>平均 Orbs:{comparisonAverages.avgOrbs}|平均 Bonus:{comparisonAverages.avgBonus}|平均例外分支:{comparisonAverages.avgExceptions}</Text>
                {filteredExperimentRuns.length === 0 ? (
                  <Text style={styles.historyEmpty}>{experimentRuns.length === 0 ? "完成一輪後,這裡會自動生成可比較的實驗摘要。" : "目前這個篩選條件沒有樣本。"}</Text>
                ) : (
                  filteredExperimentRuns.map((run, index) => (
                    <View key={`${run.id}-${index}`} style={styles.historyCard}>
                      <Text style={styles.historyCardTitle}>{run.scenarioName}|{presetLabel(run.preset)}|{outcomeLabel(run.outcome)}</Text>
                      <Text style={styles.historyCardLine}>挑戰:{run.challengeName}|卡點:{run.blockedStep ?? "無"}</Text>
                      <Text style={styles.historyCardLine}>補救:{run.rescueTool ?? "未使用"}|延長 {run.extraTimeUsed}|短休 {run.breakUsed}|重接 {run.restartUsed}</Text>
                      <Text style={styles.historyCardLine}>產出:Orbs +{run.orbDelta}|Bonus {run.bonusDelta >= 0 ? `+${run.bonusDelta}` : run.bonusDelta}</Text>
                      <Text style={styles.historyCardLine}>重現度:{run.reproducibilityScore}|事件鎖定:{run.forcedEventTitle ?? "未指定"}</Text>
                      <Text style={styles.historyCardLine}>Fingerprint:{run.fingerprint}</Text>
                      <Text style={styles.historyCardLine}>對照:{run.comparedToBaseline}</Text>
                      <Text style={styles.historyCardLine}>動作:{run.actionLabel}</Text>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.statsInsightBox}>
                <Text style={styles.statsInsightTitle}>近期統計重點</Text>
                <View style={styles.statsInsightGrid}>
                  <View style={styles.statsInsightCard}>
                    <Text style={styles.statsInsightLabel}>順利完成</Text>
                    <Text style={styles.statsInsightValue}>{historyStats.smoothCount}</Text>
                  </View>
                  <View style={styles.statsInsightCard}>
                    <Text style={styles.statsInsightLabel}>補救完成</Text>
                    <Text style={styles.statsInsightValue}>{historyStats.rescuedCount}</Text>
                  </View>
                  <View style={styles.statsInsightCard}>
                    <Text style={styles.statsInsightLabel}>中途中止</Text>
                    <Text style={styles.statsInsightValue}>{historyStats.stoppedCount}</Text>
                  </View>
                  <View style={styles.statsInsightCard}>
                    <Text style={styles.statsInsightLabel}>最常卡住</Text>
                    <Text style={styles.statsInsightValueSmall}>{historyStats.topBlockedStep ?? "暫無"}</Text>
                  </View>
                </View>
                <Text style={styles.statsInsightNote}>最常用補救工具:{historyStats.topRescueTool ?? "暫無"}</Text>
              </View>
              {settleSummary ? (
                <View style={styles.settleSummaryGrid}>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>本輪 Orbs</Text>
                    <Text style={styles.settleSummaryValue}>+{settleSummary?.orbDelta ?? 0}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>Bonus 變化</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.bonusDelta ?? 0) >= 0 ? `+${settleSummary?.bonusDelta ?? 0}` : settleSummary?.bonusDelta ?? 0}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>Trace 變化</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.traceDelta ?? 0) >= 0 ? `+${settleSummary?.traceDelta ?? 0}` : settleSummary?.traceDelta ?? 0}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>挑戰資格</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.challengeTokenDelta ?? 0) >= 0 ? `+${settleSummary?.challengeTokenDelta ?? 0}` : settleSummary?.challengeTokenDelta ?? 0}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>世界事件</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.worldEventDelta ?? 0) > 0 ? `+${settleSummary?.worldEventDelta ?? 0}` : "0"}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>任務累積</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.missionClearDelta ?? 0) >= 0 ? `+${settleSummary?.missionClearDelta ?? 0}` : settleSummary?.missionClearDelta ?? 0}</Text>
                  </View>
                  <View style={styles.settleSummaryCard}>
                    <Text style={styles.settleSummaryLabel}>延長次數</Text>
                    <Text style={styles.settleSummaryValue}>{(settleSummary?.extraTimeDelta ?? 0) >= 0 ? `+${settleSummary?.extraTimeDelta ?? 0}` : settleSummary?.extraTimeDelta ?? 0}</Text>
                  </View>
              <View style={styles.settleSummaryCard}>
                <Text style={styles.settleSummaryLabel}>短休 / 重接</Text>
                <Text style={styles.settleSummaryValue}>{`${settleSummary?.breakDelta ?? 0}/${settleSummary?.restartDelta ?? 0}`}</Text>
              </View>
            </View>
              ) : null}
              <View style={styles.reportBox}>
                <Text style={styles.reportTitle}>下一輪檢查清單</Text>
                {reviewChecklist.map((item) => (
                  <Text key={item} style={styles.reportLine}>• {item}</Text>
                ))}
              </View>
              <View style={styles.reportBox}>
                <Text style={styles.reportTitle}>Failure Playbook</Text>
                {failurePlaybook.map((item) => (
                  <Text key={item} style={styles.reportLine}>• {item}</Text>
                ))}
              </View>
              {(settleSummary?.guardianOrbDelta ?? 0) !== 0 ? (
                <Text style={styles.settleSubNote}>{selectedGuardian.name} 守護獸進度本輪變化:{(settleSummary?.guardianOrbDelta ?? 0) > 0 ? `+${settleSummary?.guardianOrbDelta ?? 0}` : settleSummary?.guardianOrbDelta ?? 0} Orbs</Text>
              ) : null}
              <View style={styles.longTermBox}>
                <Text style={styles.longTermTitle}>長期成長結果</Text>
                <View style={styles.longTermGrid}>
                  <View style={styles.longTermCard}>
                    <Text style={styles.longTermLabel}>本週英雄</Text>
                    <Text style={styles.longTermValue}>{activeWeeklyHero.name}</Text>
                    <Text style={styles.longTermNote}>本輪技能使用 {settleSummary?.weeklyHeroUsesDelta ?? 0} 次|剩餘 {weeklyHero.usesLeft} 次</Text>
                  </View>
                  <View style={styles.longTermCard}>
                    <Text style={styles.longTermLabel}>守護獸下一階</Text>
                    <Text style={styles.longTermValue}>{nextGuardianStage ? `${nextGuardianStage.label} 還差 ${Math.max(0, nextGuardianStage.cost - selectedGuardianProgress.orbs)}` : "已達最高階"}</Text>
                    <Text style={styles.longTermNote}>{selectedGuardian.name} 目前累積 {selectedGuardianProgress.orbs} Orbs</Text>
                  </View>
                  <View style={styles.longTermCard}>
                    <Text style={styles.longTermLabel}>Badge / Summon</Text>
                    <Text style={styles.longTermValue}>{collectedBadgeCount}/5 徽章</Text>
                    <Text style={styles.longTermNote}>本輪變化 {settleSummary?.badgeDelta ?? 0}|{summonTokenReady ? "已可召喚召喚憑證" : "尚未滿足召喚條件"}</Text>
                  </View>
                  <View style={styles.longTermCard}>
                    <Text style={styles.longTermLabel}>Holton 升階</Text>
                    <Text style={styles.longTermValue}>Lv.{heroUpgradeLevel}</Text>
                    <Text style={styles.longTermNote}>本輪升階變化 {settleSummary?.heroUpgradeDelta ?? 0}|下階門檻 {nextHeroUpgradeAt}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.settleEventBox}>
                <Text style={styles.settleEventLabel}>本輪事件結果</Text>
                <Text style={styles.settleEventTitle}>{lastSettledEvent?.title ?? "本輪未觸發世界事件"}</Text>
                <Text style={styles.settleEventText}>{lastSettledEvent ? `${lastSettledEvent?.desc ?? ""}|${lastSettledEvent?.reward ?? ""}` : "沒有額外事件,本輪直接進入 Finish / Pack-Up。"}</Text>
              </View>
              <View style={styles.settleChecklistWrap}>
                <Pressable style={[styles.settleChip, settleChecklist.orbChecked && styles.settleChipDone]} onPress={() => confirmSettleItem("orbChecked")}>
                  <Text style={[styles.settleChipText, settleChecklist.orbChecked && styles.settleChipTextDone]}>確認 Orbs +{lastMissionOrbGain || selectedChallenge.orbs}</Text>
                </Pressable>
                <Pressable style={[styles.settleChip, settleChecklist.eventChecked && styles.settleChipDone]} onPress={() => confirmSettleItem("eventChecked")}>
                  <Text style={[styles.settleChipText, settleChecklist.eventChecked && styles.settleChipTextDone]}>確認世界事件</Text>
                </Pressable>
                <Pressable style={[styles.settleChip, settleChecklist.packupReady && styles.settleChipDone]} onPress={() => confirmSettleItem("packupReady")}>
                  <Text style={[styles.settleChipText, settleChecklist.packupReady && styles.settleChipTextDone]}>進入收尾整理</Text>
                </Pressable>
              </View>
              <Text style={styles.settleProgress}>收尾完成度 {settleReadyCount}/3</Text>
              <View style={styles.buttonRow}>
                {!settleChecklist.packupReady ? <Pressable style={styles.primaryButton} onPress={() => confirmSettleItem("packupReady")}><Text style={styles.primaryButtonText}>進入收尾整理</Text></Pressable> : <Pressable style={styles.primaryButton} onPress={confirmCurrentStep}><Text style={styles.primaryButtonText}>收好這輪,回主線</Text></Pressable>}
                {settleChecklist.packupReady ? <Pressable style={styles.secondaryButton} onPress={finishMissionRoundAndPrepareNext}><Text style={styles.secondaryButtonText}>這輪完結,開新任務</Text></Pressable> : null}
              </View>
            </View>
          ) : null}

          <Text style={styles.statLabel}>任務力 {taskPower}%</Text>
          <ProgressBar value={taskPower} color="#2563eb" />
          <Text style={styles.statLabel}>情緒力 {emotionPower}%</Text>
          <ProgressBar value={emotionPower} color="#10b981" />
          <Text style={styles.statLabel}>專注力 {focusPower}%</Text>
          <ProgressBar value={focusPower} color="#f97316" />
        </View>

        <View style={styles.zoneHeader}>
          <Text style={styles.zoneKicker}>本週</Text>
          <Text style={styles.zoneTitle}>本週成長與收藏</Text>
          <Text style={styles.zoneText}>英雄是本週 Buff,守護獸是長期養成,事件與徽章則推進整個世界。</Text>
        </View>

        <View style={styles.card}>
          <SectionTitle title="本週總覽" subtitle="先看這週留下了什麼,再決定要不要展開整個世界層。" />
          <View style={styles.guideButtonRow}>
            <Pressable style={styles.secondaryButton} onPress={openWeeklyOverviewGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
          </View>
          <View style={styles.weeklySummaryGrid}>
            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryKicker}>THIS WEEK</Text>
              <Text style={styles.weeklySummaryLabel}>服役英雄</Text>
              <Text style={styles.weeklySummaryValue}>{activeWeeklyHero.name}</Text>
            </View>
            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryKicker}>THIS WEEK</Text>
              <Text style={styles.weeklySummaryLabel}>守護獸進度</Text>
              <Text style={styles.weeklySummaryValue}>{selectedGuardian.name}</Text>
            </View>
            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryKicker}>THIS WEEK</Text>
              <Text style={styles.weeklySummaryLabel}>英雄收藏</Text>
              <Text style={styles.weeklySummaryValue}>{heroCollectionCount}</Text>
            </View>
            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryKicker}>THIS WEEK</Text>
              <Text style={styles.weeklySummaryLabel}>Holton 升階</Text>
              <Text style={styles.weeklySummaryValue}>Lv.{heroUpgradeLevel}</Text>
            </View>
          </View>
          <Pressable style={styles.weeklyToggle} onPress={() => { const next = !showWeeklyDetails; setShowWeeklyDetails(next); if (next) { setShowParentHomeModules(true); setShowHomeDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`已打開守護獸世界,先看 ${showcaseGuardian.name}。`); } else { setMessage("已先收起守護獸世界。"); } }}>
            <Text style={styles.weeklyToggleText}>{showWeeklyDetails ? "先收起這週成果" : "看這週留下了什麼"}</Text>
          </Pressable>
          {phaseDwellSeconds >= 90 && missionPhase === "ready" ? (
            <View style={[styles.infoBox, { backgroundColor: "#fff7ed", marginTop: 12 }]}>
              <Text style={styles.infoTitle}>App 時間提示</Text>
              <Text style={styles.infoText}>目前停在準備階段已經 {Math.floor(phaseDwellSeconds / 60)} 分 {phaseDwellSeconds % 60} 秒。若現場不知道怎麼接,可以先開「我不知道怎麼幫」,讓 App 給一張建議支援卡。</Text>
              <Pressable
                style={[styles.secondaryButton, { marginTop: 10 }]}
                onPress={() => {
                  setShowParentHomeModules(true);
                  setShowHomeDetails(true);
                  setShowParentAssist(true);
                  setSelectedSupportScenario("start");
                  setMessage("已打開起步支援建議,先看不想開始時怎麼接。");
                }}
              >
                <Text style={styles.secondaryButtonText}>看起步支援建議</Text>
              </Pressable>
            </View>
          ) : null}
          {phaseDwellSeconds >= 120 && missionPhase === "sop" ? (
            <View style={[styles.infoBox, { backgroundColor: "#eff6ff", marginTop: 12 }]}>
              <Text style={styles.infoTitle}>App 時間提示</Text>
              <Text style={styles.infoText}>目前在流程階段停留較久。如果家長不知道怎麼接,可以先看 Focus / Restart 類建議,不用硬推完整輪。</Text>
              <Pressable
                style={[styles.secondaryButton, { marginTop: 10 }]}
                onPress={() => {
                  setShowParentHomeModules(true);
                  setShowHomeDetails(true);
                  setShowParentAssist(true);
                  setSelectedSupportScenario("stuck");
                  setMessage("已打開卡住時建議,先看怎麼把孩子接回主線。");
                }}
              >
                <Text style={styles.secondaryButtonText}>看卡住時建議</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        </> : null}

        {showWeeklyDetails && missionPhase !== "settle" && (!isParentMode || (showParentHomeModules && showHomeDetails)) ? <>

        <View style={[styles.card, { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0" }]}>
          <SectionTitle title="守護獸世界" subtitle={isChildMode ? undefined : "首頁先照顧本命獸;其他守護獸留在這一層,負責收藏、展示、收服與世界擴張。"} />
          {isParentMode ? <Text style={styles.infoText}>先看世界主角,再翻圖鑑;本命獸留在首頁,其他守護獸留在這裡。</Text> : null}
        </View>

        {isChildMode ? <View style={styles.card}>
          <SectionTitle title="這一輪先留下了什麼" subtitle="先看成果,再決定要不要往下翻。" />
          <View style={styles.worldFeaturedHeroCard}>
            <Text style={styles.worldFeaturedKicker}>LATEST HIGHLIGHT</Text>
            <Text style={styles.worldFeaturedTitle}>{guardianEncounterWindowActive ? "世界門已打開" : capturedGuardianCount > 0 ? `${showcaseGuardian.name} 站上展示主位` : guardianTraces > 0 ? "世界已經留下痕跡" : `${showcaseGuardian.name} 正在等你來看`}</Text>
            <View style={styles.worldFeaturedMetaRow}>
              <View style={styles.worldFeaturedMetaChip}><Text style={styles.worldFeaturedMetaText}>{guardianEncounterWindowActive ? `挑戰資格 ${guardianChallengeTokens}` : capturedGuardianCount > 0 ? "已留下成果" : guardianTraces > 0 ? `痕跡 ${guardianTraces}` : "準備展示"}</Text></View>
              <View style={styles.worldFeaturedMetaChip}><Text style={styles.worldFeaturedMetaText}>{showcaseGuardianRecord.rarity}</Text></View>
            </View>
            <Text style={styles.worldFeaturedText}>{guardianEncounterWindowActive ? `你現在有 ${guardianChallengeTokens} 個挑戰資格。先看這次打開的是什麼門。` : capturedGuardianCount > 0 ? `${showcaseGuardian.name} 先站上世界第一屏。先看牠,會比較像這一輪真的有留下成果。` : guardianTraces > 0 ? `你已經留下 ${guardianTraces} 個痕跡。先去看世界這次回了你什麼。` : "這裡會慢慢長出你做完之後留下的成果。先從最值得看的那一張開始。"}</Text>
            <View style={styles.worldFeaturedHeroImageFrame}><Image source={worldFeaturedImage} style={styles.worldFeaturedHeroImage} resizeMode="contain" /></View>
            <View style={styles.childCuePairRow}>
              {renderChildCue("SHOW", "primary")}
              {renderChildCue("BOOK", "task")}
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`先看展示主卡:${showcaseGuardian.name},看看這次真的留下了什麼。`); }}><Text style={styles.primaryButtonText}>先看這次留下了什麼</Text></Pressable>
            </View>
          </View>
        </View> : null}

        <View style={styles.card}>
          <SectionTitle title="再決定要往哪裡看" subtitle={isChildMode ? "先看成果,再看總覽,最後才決定要不要往下推。" : "先不要急著全部看完;先選現在最值得看的入口。"} />
          {isChildMode ? <>
          <View style={styles.childEntryCard}>
            <Text style={styles.childEntryTitle}>再從這裡決定先看哪個成果</Text>
            <Text style={styles.childEntryText}>{guardianWorldEntryTitle}</Text>
            <Text style={styles.infoText}>{guardianWorldEntryLead}</Text>
            <View style={styles.sopJourneyBox}>
              <Text style={styles.sopJourneyLabel}>現在先做什麼</Text>
              <Text style={styles.sopJourneyText}>先看這一輪留下了什麼,再決定要不要往世界裡再推一步。</Text>
              <Text style={styles.sopJourneyLabel}>進去後先看哪裡</Text>
              <Text style={styles.sopJourneyText}>{guardianEncounterWindowActive ? "先看這次挑戰窗口,再決定要不要用掉資格。" : capturedGuardianCount > 0 ? `先看最新展示主卡,再看你已收進去的 ${capturedGuardianCount} 隻守護獸。` : guardianTraces > 0 ? "先看世界回應,再決定要不要繼續推資格。" : "先看世界總覽,讓孩子知道這一輪不是做完就消失。"}</Text>
            </View>
            <View style={styles.childEntryVisualGrid}>
              <Pressable style={[styles.childEntryVisualCard, styles.childEntryVisualPrimary]} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`先看展示主卡:${showcaseGuardian.name}。`); }}>
                {renderChildCue("SHOW", "primary")}
                <Text style={styles.childEntryVisualTitle}>先看這次展示</Text>
              </Pressable>
              <Pressable style={[styles.childEntryVisualCard, styles.childEntryVisualPrimary]} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`先從 ${showcaseGuardian.name} 開始看世界總覽。`); }}>
                {renderChildCue("MAP", "task")}
                <Text style={styles.childEntryVisualTitle}>再看這次累積了多少</Text>
              </Pressable>
              <Pressable style={[styles.childEntryVisualCard, styles.childEntryVisualSupport]} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); if (guardianWorldNextAction.action === "challenge") { startGuardianChallenge(); } else { drawWorldEvent(); } }}>
                {renderChildCue(guardianWorldNextAction.action === "challenge" ? "GO" : "FIND", guardianWorldNextAction.action === "challenge" ? "primary" : "support")}
                <Text style={styles.childEntryVisualTitle}>{guardianWorldNextAction.action === "challenge" ? "最後再去挑戰" : "最後再推下一步"}</Text>
              </Pressable>
            </View>
          </View>
          </> : null}
          {isParentMode ? <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>家長再看</Text>
            <Text style={styles.parentLayerDividerText}>下面這一層看世界推進狀態與現在最適合走哪一步。</Text>
          </View> : null}
        {isParentMode ? <>
          <View style={styles.guardianWorldFlowRow}>
            <View style={[styles.guardianWorldFlowCard, guardianTraces > 0 && styles.guardianWorldFlowCardActive]}>
              <Text style={styles.guardianWorldFlowStep}>STEP 1</Text>
              <Text style={styles.guardianWorldFlowTitle}>留下痕跡</Text>
              <Text style={styles.guardianWorldFlowMeta}>{guardianTraces} trace</Text>
            </View>
            <View style={styles.guardianWorldFlowArrow}><Text style={styles.guardianWorldFlowArrowText}>→</Text></View>
            <View style={[styles.guardianWorldFlowCard, guardianChallengeTokens > 0 && styles.guardianWorldFlowCardActive]}>
              <Text style={styles.guardianWorldFlowStep}>STEP 2</Text>
              <Text style={styles.guardianWorldFlowTitle}>拿到資格</Text>
              <Text style={styles.guardianWorldFlowMeta}>{guardianChallengeTokens} token</Text>
            </View>
            <View style={styles.guardianWorldFlowArrow}><Text style={styles.guardianWorldFlowArrowText}>→</Text></View>
            <View style={[styles.guardianWorldFlowCard, capturedGuardianCount > 0 && styles.guardianWorldFlowCardActive]}>
              <Text style={styles.guardianWorldFlowStep}>STEP 3</Text>
              <Text style={styles.guardianWorldFlowTitle}>收進圖鑑</Text>
              <Text style={styles.guardianWorldFlowMeta}>{capturedGuardianCount} captured</Text>
            </View>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#eef2ff", marginBottom: 12 }]}>
            <Text style={styles.infoTitle}>家長先讓孩子看見什麼</Text>
            <Text style={styles.infoText}>{showcaseGuardianIsNewToday ? `${showcaseGuardian.name} 是這次剛留下來的新頁。先讓孩子看見:有東西真的留下來了。` : guardianEncounterWindowActive ? `先讓孩子看見這次世界有開出一扇門。` : capturedGuardianCount > 0 ? `先讓孩子看見 ${showcaseGuardian.name} 站在展示位上。` : guardianTraces > 0 ? `先讓孩子看見世界有回應。` : `先讓孩子知道:這一輪不會做完就消失。`}</Text>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#ede9fe", marginBottom: 12 }]}>
            <Text style={[styles.infoTitle, { color: "#6d28d9" }]}>世界下一步</Text>
            <Text style={styles.parentLayerMode}>{guardianWorldNextAction.title}</Text>
            <Text style={styles.infoText}>{guardianWorldNextAction.text}</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); if (guardianWorldNextAction.action === "challenge") { startGuardianChallenge(); } else { drawWorldEvent(); } }}><Text style={styles.primaryButtonText}>{guardianWorldNextAction.button}</Text></Pressable>
            </View>
          </View>
          </> : null}
        </View>

        <View style={styles.card}>
          <SectionTitle title="再翻圖鑑與收藏" subtitle={isChildMode ? "先看今天這一頁,再慢慢往整面圖鑑牆翻。" : "先看這條世界線目前開到哪裡:哪些已收服、哪些已遭遇、哪些還在等你翻開。"} />
          {isChildMode ? <>
          <View style={styles.childEntryCard}>
            <Text style={styles.childEntryTitle}>再看世界主角</Text>
            <Text style={styles.childEntryText}>今天這張:{showcaseGuardian.name}</Text>
            <Image source={worldFeaturedImage} style={styles.childEntryHeroImage} resizeMode="contain" />
            <View style={styles.childCuePairRow}>
              {renderChildCue("SHOW", "primary")}
              {renderChildCue("BOOK", "task")}
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(showcaseGuardian.id); setMessage(`先看展示主卡:${showcaseGuardian.name}。`); }}><Text style={styles.primaryButtonText}>先看展示主卡</Text></Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => {
                setShowParentHomeModules(true);
                setShowHomeDetails(true);
                setShowWeeklyDetails(true);
                if (guardianCodexFocus.focusBeastId) {
                  setSelectedBeastId(guardianCodexFocus.focusBeastId);
                  setMessage(`${guardianBeasts.find((item) => item.id === guardianCodexFocus.focusBeastId)?.name ?? "今天這頁"} 已打開。`);
                } else {
                  setMessage("圖鑑今天這一頁已打開。")
                }
              } }><Text style={styles.secondaryButtonText}>看圖鑑牆</Text></Pressable>
            </View>
          </View>
          </> : null}
          {isParentMode ? <>
          <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>家長先看成果</Text>
            <Text style={styles.parentLayerDividerText}>先看孩子這次留下了什麼、現在世界主角是誰,再往下看收藏統計與推進狀態。</Text>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#eef2ff", marginBottom: 12 }]}>
            <Text style={styles.infoTitle}>這次先看什麼</Text>
            <Text style={styles.infoText}>{showcaseGuardianIsNewToday ? `${showcaseGuardian.name} 是今天剛被留下來的展示主角,先讓孩子看見這次成果,再決定要不要往下翻圖鑑。` : guardianEncounterWindowActive ? `世界挑戰窗口已打開,先讓孩子看見「這次有留下門」,再決定要不要推下一步。` : capturedGuardianCount > 0 ? `先看 ${showcaseGuardian.name} 這張展示主卡,讓孩子先感覺自己有累積,再往下看統計。` : `先用展示主卡告訴孩子:這一輪不是做完就消失,世界會留下回應。`}</Text>
          </View>
          </> : null}
          <View style={[styles.guardianShowcaseCard, { borderColor: guardianRarityTheme(showcaseGuardianRecord.rarity).line, backgroundColor: guardianRarityTheme(showcaseGuardianRecord.rarity).deep }] }>
            {showcaseGuardian.imageSource ? <View style={styles.guardianShowcaseImageFrame}><Image source={showcaseGuardian.imageSource} style={styles.guardianShowcaseImage} resizeMode="contain" /></View> : null}
            <View style={styles.guardianShowcaseBody}>
              <Text style={styles.guardianShowcaseKicker}>世界展示守護獸</Text>
              <Text style={styles.guardianShowcaseTitle}>{showcaseGuardian.name}</Text>
              <View style={styles.guardianShowcaseChipRow}>
                <View style={styles.guardianShowcaseChip}><Text style={styles.guardianShowcaseChipText}>{showcaseGuardianRecord.rarity}</Text></View>
                <View style={styles.guardianShowcaseChip}><Text style={styles.guardianShowcaseChipText}>{showcaseGuardianRecord.status === "captured" ? "展示中" : "圖鑑中"}</Text></View>
              </View>
              <Text style={styles.guardianShowcaseText}>{showcaseGuardianRecord.title}</Text>
              <Text style={styles.guardianShowcaseMeta}>{showcaseGuardianRecord.status === "captured" ? `已收服 | Day ${showcaseGuardianRecord.capturedAtDay ?? daysInSystem}${showcaseGuardianRecord.capturedAtDay === daysInSystem ? "|今天新收服" : ""}` : showcaseGuardianRecord.status === "defeated" ? `已擊敗 ${showcaseGuardianRecord.defeatedCount} 次` : "尚未遇見"}</Text>
              {showcaseGuardianRecord.sourceEventFamily ? <Text style={[styles.guardianShowcaseMeta, { color: "#dbeafe" }]}>{familyToneLine(showcaseGuardianRecord.sourceEventFamily)}</Text> : null}
              {showcaseGuardianIsNewToday ? <Text style={[styles.guardianShowcaseMeta, { color: "#fef08a" }]}>今天剛翻進圖鑑,現在也正式被拿到桌上展示。</Text> : null}
            </View>
            <View style={[styles.guardianShowcaseBadge, { borderColor: guardianRarityTheme(showcaseGuardianRecord.rarity).line }]}><Text style={styles.guardianShowcaseBadgeText}>{showcaseGuardianRecord.status === "captured" ? "展示中" : "圖鑑"}</Text></View>
          </View>
          {showcaseGuardianIsNewToday ? (
            <View style={[styles.infoBox, { backgroundColor: "#fef3c7", marginTop: 12, marginBottom: 12 }]}>
              <View style={styles.childCuePairRow}>
                {renderChildCue("KEEP", "warm")}
                {renderChildCue("SHOW", "primary")}
              </View>
              <Text style={[styles.infoTitle, { color: "#92400e" }]}>今天剛拿上桌</Text>
              <Text style={styles.infoText}>{showcaseGuardian.name} 是你今天剛收進圖鑑、也剛拉上展示的守護獸。這代表牠不只是被看見,現在也真的被留下來了。</Text>
            </View>
          ) : null}
          <View style={[styles.guardianHeroCard, { borderColor: selectedGuardianTheme.line, shadowColor: selectedGuardianTheme.line }] }>
            {selectedGuardian.imageSource ? <Image source={selectedGuardian.imageSource} style={styles.guardianHeroImage} resizeMode="contain" /> : null}
            <View style={styles.guardianHeroBody}>
              <View style={styles.guardianHeroTopRow}>
                <View>
                  <Text style={styles.guardianHeroKicker}>世界主展示卡</Text>
                  <Text style={styles.guardianHeroTitle}>{selectedGuardian.name}</Text>
                  <Text style={styles.guardianHeroNumber}>{selectedGuardianNumber}</Text>
                </View>
                <View style={[styles.guardianHeroRarityChip, { borderColor: selectedGuardianTheme.line }]}>
                  <Text style={[styles.guardianHeroRarityText, { color: selectedGuardianTheme.line }]}>{selectedGuardianRecord.rarity}</Text>
                </View>
              </View>
              <Text style={styles.guardianHeroSubtitle}>{selectedGuardianRecord.title}|{selectedGuardian.vibe}</Text>
              <View style={styles.guardianHeroStatRow}>
                <View style={styles.guardianHeroStatBox}>
                  <Text style={styles.guardianHeroStatLabel}>狀態</Text>
                  <Text style={styles.guardianHeroStatValue}>{selectedGuardianStatusLabel}</Text>
                </View>
                <View style={styles.guardianHeroStatBox}>
                  <Text style={styles.guardianHeroStatLabel}>累積 Orbs</Text>
                  <Text style={styles.guardianHeroStatValue}>{selectedGuardianProgress.orbs}</Text>
                </View>
                <View style={styles.guardianHeroStatBox}>
                  <Text style={styles.guardianHeroStatLabel}>擊敗次數</Text>
                  <Text style={styles.guardianHeroStatValue}>{selectedGuardianRecord.defeatedCount}</Text>
                </View>
              </View>
              <View style={styles.guardianHeroMetaStack}>
                <View style={styles.guardianHeroMetaCard}>
                  <Text style={styles.guardianHeroMeta}>{selectedGuardianStageIndex >= 0 ? `目前階段:${selectedGuardian.stages[selectedGuardianStageIndex].label}` : "目前階段:尚未解鎖"}{nextGuardianStage ? `|下一階 ${nextGuardianStage.label} 需要 ${nextGuardianStage.cost} Orbs` : "|已達最高階段"}</Text>
                </View>
                <View style={styles.guardianHeroMetaCard}>
                  <Text style={styles.guardianHeroMeta}>{selectedGuardianRecord.status === "captured" ? `收服紀錄:Day ${selectedGuardianRecord.capturedAtDay ?? daysInSystem}${selectedGuardianRecord.capturedAtDay === daysInSystem ? "|今天剛加入你的守護獸圖鑑" : "|已正式加入你的守護獸圖鑑"}` : "這隻守護獸還可以繼續累積、挑戰與展示。"}</Text>
                </View>
                {selectedGuardianRecord.sourceEventTitle ? <View style={styles.guardianHeroMetaCard}><Text style={styles.guardianHeroMeta}>世界來源:{selectedGuardianRecord.sourceEventTitle}{selectedGuardianRecord.sourceEventFamily ? `|${selectedGuardianRecord.sourceEventFamily}` : ""}</Text></View> : null}
                {selectedGuardianRecord.sourceEventFamily ? <View style={[styles.guardianHeroMetaCard, styles.guardianHeroMetaCardTone]}><Text style={[styles.guardianHeroMeta, { color: "#bfdbfe" }]}>{familyToneLine(selectedGuardianRecord.sourceEventFamily)}</Text></View> : null}
                {selectedGuardianIsNewToday ? <View style={[styles.guardianHeroMetaCard, styles.guardianHeroMetaCardWarm]}><Text style={[styles.guardianHeroMeta, { color: "#fde68a" }]}>今天這一頁剛被翻開,如果你想讓這次收服留下更強的存在感,現在就把牠留在展示位。</Text></View> : null}
              </View>
              {selectedGuardianRecord.status === "captured" ? (
                <View style={[styles.infoBox, { backgroundColor: "#ecfccb", marginTop: 10, marginBottom: 0 }]}>
                  <View style={styles.childCuePairRow}>
                    {renderChildCue("CAPT", "support")}
                    {renderChildCue("CODEX", "task")}
                  </View>
                  <Text style={[styles.infoTitle, { color: "#166534" }]}>收服結果已留下</Text>
                  <Text style={styles.infoText}>{selectedGuardianRecord.capturedAtDay === daysInSystem ? "這隻守護獸是你今天正式收進圖鑑的新夥伴。現在可以把牠設成展示主卡,讓這次收服從看見,走到真正留下。" : "這隻守護獸已經正式在你的圖鑑裡留下位置。現在可以繼續展示、累積與養成。"}</Text>
                </View>
              ) : null}
              {selectedGuardianIsNewToday && selectedGuardianRecord.showcase ? (
                <View style={[styles.infoBox, { backgroundColor: "#fff7ed", marginTop: 10, marginBottom: 0 }]}>
                  <Text style={[styles.infoTitle, { color: "#c2410c" }]}>新收服展示中</Text>
                  <Text style={styles.infoText}>這隻守護獸今天不只是新收服,現在也正在世界展示位上。這會讓「看見」和「留下」連在一起,再慢慢走到整本圖鑑都打開。</Text>
                </View>
              ) : null}
              <View style={styles.buttonRow}>
                <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); markGuardianShowcase(selectedGuardian.id); }}><Text style={styles.primaryButtonText}>{selectedGuardianRecord.showcase ? (selectedGuardianIsNewToday ? "今天已在展示位" : "目前展示中") : (selectedGuardianIsNewToday ? "把新收服拉上展示" : "設成展示主卡")}</Text></Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => openGuardianGuide(selectedGuardian)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                <Pressable style={styles.secondaryButton} onPress={shareSelectedGuardianCard}><Text style={styles.secondaryButtonText}>分享卡片</Text></Pressable>
              </View>
            </View>
          </View>
          {isParentMode ? <>
          <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>家長再看統計</Text>
            <Text style={styles.parentLayerDividerText}>孩子先看成果;下面這些再幫你判斷收藏密度、稀有度與世界推進速度。</Text>
          </View>
          <View style={styles.guardianCatalogSummaryGrid}>
            <View style={styles.guardianCatalogStatCard}>
              <Text style={styles.guardianCatalogStatLabel}>已收服</Text>
              <Text style={styles.guardianCatalogStatValue}>{capturedGuardianCount}</Text>
            </View>
            <View style={styles.guardianCatalogStatCard}>
              <Text style={styles.guardianCatalogStatLabel}>已擊敗</Text>
              <Text style={styles.guardianCatalogStatValue}>{defeatedGuardianCount}</Text>
            </View>
            <View style={styles.guardianCatalogStatCard}>
              <Text style={styles.guardianCatalogStatLabel}>稀有收藏</Text>
              <Text style={styles.guardianCatalogStatValue}>{rareGuardianCount}</Text>
            </View>
          </View>
          </> : null}
          {isChildMode ? <>
          <View style={styles.childEntryCard}>
            <Text style={styles.childEntryTitle}>先翻今天這一頁</Text>
            <Text style={styles.childEntryText}>{guardianCodexFocus.title}</Text>
            <Image source={worldCodexImage} style={styles.childEntryHeroImage} resizeMode="contain" />
            <View style={styles.childCuePairRow}>
              {renderChildCue("BOOK", "task")}
              {renderChildCue("CODEX", "focus")}
            </View>
            <View style={styles.buttonRow}>
              {guardianCodexFocus.focusBeastId ? (
                <>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      setShowParentHomeModules(true);
                      setShowHomeDetails(true);
                      setShowWeeklyDetails(true);
                      setSelectedBeastId(guardianCodexFocus.focusBeastId);
                      if (capturedGuardians.some(({ beast }) => beast.id === guardianCodexFocus.focusBeastId)) {
                        markGuardianShowcase(guardianCodexFocus.focusBeastId);
                      } else {
                        setMessage(`${guardianBeasts.find((item) => item.id === guardianCodexFocus.focusBeastId)?.name ?? "這隻守護獸"} 這一頁先打開了。先看牠,再決定要不要繼續把世界線推進。`);
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>{guardianCodexFocus.actionLabel}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(guardianCodexFocus.focusBeastId); setMessage(`${guardianBeasts.find((item) => item.id === guardianCodexFocus.focusBeastId)?.name ?? "這一頁"} 已打開。`); }}
                  >
                    <Text style={styles.secondaryButtonText}>看這頁</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); drawWorldEvent(); }}>
                  <Text style={styles.primaryButtonText}>{guardianCodexFocus.actionLabel}</Text>
                </Pressable>
              )}
            </View>
          </View>
          </> : null}
          {isParentMode ? <>
          <View style={styles.parentLayerDivider}>
            <Text style={styles.parentLayerDividerKicker}>家長再看</Text>
            <Text style={styles.parentLayerDividerText}>下面再看整體收錄狀態、排序與完整圖鑑牆,不用先把整排資訊丟給孩子。</Text>
          </View>
          <View style={styles.guardianDexChipRow}>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>今日新收服 {newlyCapturedGuardians.length}</Text></View>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>已收服 {capturedGuardians.length}</Text></View>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>已遭遇 {encounteredGuardians.length}</Text></View>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>未遇見 {unknownGuardians.length}</Text></View>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#fefce8", marginBottom: 12 }]}>
            {guardianCodexFocus.names.length ? (
              <View style={styles.guardianDexChipRow}>
                {guardianCodexFocus.names.map((name) => (
                  <View key={name} style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>{name}</Text></View>
                ))}
              </View>
            ) : null}
            <View style={styles.buttonRow}>
              {guardianCodexFocus.focusBeastId ? (
                <>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      setShowParentHomeModules(true);
                      setShowHomeDetails(true);
                      setShowWeeklyDetails(true);
                      setSelectedBeastId(guardianCodexFocus.focusBeastId);
                      if (capturedGuardians.some(({ beast }) => beast.id === guardianCodexFocus.focusBeastId)) {
                        markGuardianShowcase(guardianCodexFocus.focusBeastId);
                      } else {
                        setMessage(`${guardianBeasts.find((item) => item.id === guardianCodexFocus.focusBeastId)?.name ?? "這隻守護獸"} 已先打開這一頁。先看看牠,再決定要不要繼續把世界線推進成正式收服。`);
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>{guardianCodexFocus.actionLabel}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(guardianCodexFocus.focusBeastId); setMessage(`${guardianBeasts.find((item) => item.id === guardianCodexFocus.focusBeastId)?.name ?? "這一隻"} 已打開。`); }}
                  >
                    <Text style={styles.secondaryButtonText}>先看這隻</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); drawWorldEvent(); }}>
                  <Text style={styles.primaryButtonText}>{guardianCodexFocus.actionLabel}</Text>
                </Pressable>
              )}
            </View>
          </View>
          </> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...guardianCodexRecords].sort((a, b) => {
              const weight = (record: typeof a.record) => record.status === "captured" && record.capturedAtDay === daysInSystem ? 0 : record.status === "captured" ? 1 : record.status === "defeated" ? 2 : 3;
              return weight(a.record) - weight(b.record);
            }).map(({ beast, record }) => {
              const active = beast.id === selectedBeastId;
              const rarityColor = guardianRarityColor(record.rarity);
              const rarityTheme = guardianRarityTheme(record.rarity);
              const beastNumber = `GB-${String(guardianBeasts.findIndex((item) => item.id === beast.id) + 1).padStart(2, "0")}`;
              const isTodayPage = record.status === "captured" && record.capturedAtDay === daysInSystem;
              const isNextPage = !isTodayPage && (record.status === "captured" || record.status === "defeated");
              const pageStageLabel = isTodayPage ? "今天這一頁" : isNextPage ? "下一頁" : "還沒翻到";
              const pageHint = isTodayPage ? "先看今天新翻開的頁。" : isNextPage ? "這頁已經有線索,可以接著看。" : "這頁先不用急,之後再翻到。";
              return (
                <View key={beast.id} style={[styles.guardianDexCard, { borderColor: rarityColor, backgroundColor: record.status === "unknown" ? "#f1f5f9" : rarityTheme.soft }, active && styles.guardianDexCardActive, record.status === "unknown" && styles.guardianDexCardLocked]}>
                  <View style={styles.guardianDexTopRow}>
                    <Text style={[styles.guardianDexRarity, { color: rarityColor }]}>{record.rarity}</Text>
                    {record.showcase ? <Text style={styles.guardianDexShowcaseFlag}>SHOWCASE</Text> : null}
                  </View>
                  <View style={styles.childCuePairRow}>
                    {isTodayPage ? renderChildCue("NEW", "primary") : isNextPage ? renderChildCue("NEXT", "task") : renderChildCue("BOOK", "cool")}
                    {record.status === "captured" ? renderChildCue("CODEX", "focus") : record.status === "defeated" ? renderChildCue("CAPT", "support") : renderChildCue("FIND", "support")}
                  </View>
                  <Text style={[styles.guardianDexStatus, { color: isTodayPage ? "#b45309" : isNextPage ? "#1d4ed8" : "#64748b" }]}>{pageStageLabel}</Text>
                  <Text style={styles.guardianDexMeta}>{pageHint}</Text>
                  <View style={[styles.guardianDexArtBox, record.status === "unknown" && styles.guardianDexArtBoxLocked]}>
                    {beast.imageSource ? <Image source={beast.imageSource} style={[styles.guardianDexArtImage, record.status === "unknown" && styles.guardianDexArtImageLocked]} resizeMode="contain" /> : <Text style={[styles.guardianDexArtGlyph, record.status === "unknown" && styles.guardianDexArtGlyphLocked]}>{record.status === "captured" ? "🐾" : record.status === "defeated" ? "⚔️" : "❔"}</Text>}
                    <Text style={[styles.guardianDexArtName, record.status === "unknown" && styles.guardianDexArtNameLocked]}>{record.status === "unknown" ? "Unknown Guardian" : beast.name}</Text>
                  </View>
                  <Text style={styles.guardianDexNumber}>{beastNumber}</Text>
                  <Text style={styles.guardianDexTitle}>{record.title}</Text>
                  <Text style={[styles.guardianDexStatus, { color: record.status === "captured" ? "#047857" : record.status === "defeated" ? "#1d4ed8" : "#64748b" }]}>{record.status === "captured" ? "已收服" : record.status === "defeated" ? "已遭遇" : "未遇見"}</Text>
                  <Text style={styles.guardianDexMeta}>擊敗 {record.defeatedCount} 次 | {record.status === "captured" ? `收服 Day ${record.capturedAtDay ?? "-"}${record.capturedAtDay === daysInSystem ? "|NEW" : ""}` : record.status === "defeated" ? "還沒正式收進圖鑑" : "這頁還沒被翻開"}</Text>
                  <View style={styles.guardianDexChipRow}>
                    <View style={[styles.guardianDexChip, { borderColor: rarityTheme.line, backgroundColor: rarityTheme.glow }]}><Text style={[styles.guardianDexChipText, { color: rarityTheme.deep }]}>{record.rarity}</Text></View>
                    <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>{record.status === "captured" ? "收藏完成" : record.status === "defeated" ? "先看這頁" : "以後再翻"}</Text></View>
                    {record.status === "captured" && record.capturedAtDay === daysInSystem ? <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>今日新收服</Text></View> : null}
                  </View>
                  <View style={styles.buttonRow}>
                    <Pressable style={styles.secondaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); setSelectedBeastId(beast.id); setMessage(active ? `${beast.name} 已經是目前這頁。` : `已打開 ${beast.name} 這一頁。`); }}><Text style={styles.secondaryButtonText}>{active ? "目前這頁" : "看這頁"}</Text></Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => record.status === "unknown" ? setMessage("這一頁還沒翻開,先不用拉上展示。先去找線索。") : (setShowParentHomeModules(true), setShowHomeDetails(true), setShowWeeklyDetails(true), markGuardianShowcase(beast.id))}><Text style={styles.secondaryButtonText}>{record.showcase ? "展示中" : record.status === "unknown" ? "先別展示" : "拉上展示"}</Text></Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {isParentMode ? <View style={styles.card}>
          <SectionTitle title="守護獸挑戰與進度" subtitle="看哪些守護獸已經能進場、還差多少 Orbs,以及目前的挑戰資格。" />
          <View style={[styles.infoBox, { backgroundColor: stage2Unlocked ? "#ecfeff" : "#fff7ed" }]}>
            <Text style={[styles.infoTitle, { color: stage2Unlocked ? "#0f766e" : "#c2410c" }]}>Guardian Beast Stage 2</Text>
            <Text style={styles.infoText}>系統使用天數:{daysInSystem} 天。{stage2Unlocked ? "Stage 2 已開放。" : "滿 7 天後自動提示開放。"}</Text>
          </View>
          {guardianBeasts.map((beast) => {
            const active = beast.id === selectedBeastId;
            const beastRecord = guardianCatalog[beast.id] ?? { beastId: beast.id, status: "unknown", defeatedCount: 0, title: beast.name, rarity: "Common", showcase: false, companion: false };
            const beastTheme = guardianRarityTheme(beastRecord.rarity);
            return (
              <View key={beast.id} style={[styles.guardianCard, { borderColor: beastTheme.line, backgroundColor: beastRecord.status === "unknown" ? "#f8fafc" : beastTheme.soft }, active && styles.guardianCardActive]}>
                {beast.imageSource ? <Image source={beast.imageSource} style={styles.guardianProgressImage} resizeMode="contain" /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.guardianTitle}>{beast.name}</Text>
                  <Text style={styles.guardianVibe}>{beast.vibe}</Text>
                  <View style={styles.guardianDexChipRow}>
                    <View style={[styles.guardianDexChip, { borderColor: beastTheme.line, backgroundColor: beastTheme.glow }]}><Text style={[styles.guardianDexChipText, { color: beastTheme.deep }]}>{beastRecord.rarity}</Text></View>
                    <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>{beastRecord.status === "captured" ? "已收服" : beastRecord.status === "defeated" ? "已擊敗" : "未遇見"}</Text></View>
                  </View>
                  <View style={styles.stageRow}>
                    {beast.stages.map((stage) => {
                      const beastOrbs = guardianProgress[beast.id]?.orbs ?? 0;
                      const unlocked = beastOrbs >= stage.cost;
                      return (
                        <View key={stage.label} style={[styles.stageChip, unlocked && styles.stageChipUnlocked]}><Text style={[styles.stageText, unlocked && styles.stageTextUnlocked]}>{stage.label} {stage.cost}</Text></View>
                      );
                    })}
                  </View>
                  <Text style={styles.guardianProgressText}>目前累積:{guardianProgress[beast.id]?.orbs ?? 0} Orbs</Text>
                </View>
                <Pill label={beast.complete ? "完整四階" : "收集中"} active={active} />
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => { setSelectedBeastId(beast.id); setMessage(active ? `${beast.name} 已經是目前這隻。` : `已切到 ${beast.name},現在可以看資格、進度與要不要挑戰。`); }}><Text style={styles.secondaryButtonText}>{active ? "目前這隻" : "選這隻"}</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => openGuardianGuide(beast)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
                </View>
              </View>
            );
          })}
          <View style={[styles.infoBox, { marginTop: 8, marginBottom: 0, backgroundColor: guardianChallengeActive ? "#ecfccb" : "#f8fafc" }]}>
            <Text style={styles.infoTitle}>守護獸挑戰入口</Text>
            <Text style={styles.infoText}>目前選擇:{selectedGuardian.name}|挑戰資格:{guardianChallengeTokens}|累積挑戰次數:{guardianChallengeAttempts}</Text>
            <Text style={styles.infoText}>限時窗口:{guardianEncounterWindowActive ? `進行中|剩 ${guardianEncounterDaysLeft} 天${guardianEncounterSourceTitle ? `|來源 ${guardianEncounterSourceTitle}` : ""}` : "目前沒有開啟中的窗口"}</Text>
            <Text style={styles.infoText}>挑戰需求:{selectedGuardianChallengeCost} 點|目前可用攻擊值:{guardianAttackPowerAvailable} 點(Orbs {orbs} + Bonus {bonusOrbs})</Text>
            <Text style={styles.infoText}>目前累積:{selectedGuardianProgress.orbs} Orbs|目前階段:{selectedGuardianStageIndex >= 0 ? selectedGuardian.stages[selectedGuardianStageIndex].label : "尚未解鎖"}{nextGuardianStage ? `|下一階段 ${nextGuardianStage.label} 需要 ${nextGuardianStage.cost}` : "|已達最高階段"}</Text>
            <Text style={styles.infoText}>{guardianChallengeActive ? "挑戰判定中:系統會依你現在的 Orbs + Bonus Pool 自動判斷有沒有打穿需求值。" : "下一步會消耗 1 次挑戰資格,並自動用 Orbs + Bonus Pool 判定成功或失敗。"}</Text>
            <Text style={styles.infoText}>{selectedGuardianRecord.status === "captured" ? "目前這隻已經正式收進圖鑑,接下來是繼續養成與展示。" : selectedGuardianRecord.status === "defeated" ? "這隻你已經挑戰過了,世界有記錄;下一次目標是把它正式收服。" : "這隻還在等待你第一次真正把世界線索推進成挑戰。"}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); startGuardianChallenge(); }}><Text style={styles.primaryButtonText}>消耗資格自動判定</Text></Pressable>
          </View>
          <Text style={styles.minorHint}>v1 規則:可用攻擊值 = Orbs + Bonus Pool。若可用值 ≥ 挑戰需求,就成功;否則失敗,並留下世界遭遇紀錄。</Text>
        </View> : null}

        <View style={styles.card}>
          <SectionTitle title="世界事件 / 守護獸線索" subtitle={isChildMode ? undefined : "世界事件不只是驚喜,現在也更明確作為守護獸痕跡、挑戰入口與世界感主線。"} />
          {isChildMode ? <>
          <View style={styles.childEntryCard}>
            <Text style={styles.childEntryTitle}>先抽世界線索</Text>
            <Text style={styles.childEntryText}>{guardianEncounterWindowActive ? "把線索變成挑戰。" : "抽出新線索。"}</Text>
            <View style={styles.childCuePairRow}>
              {renderChildCue("FIND", "support")}
              {renderChildCue(guardianEncounterWindowActive ? "GO" : "NOW", guardianEncounterWindowActive ? "primary" : "task")}
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => { setShowParentHomeModules(true); setShowHomeDetails(true); setShowWeeklyDetails(true); drawWorldEvent(); }}><Text style={styles.primaryButtonText}>抽一張世界線索</Text></Pressable>
            </View>
          </View>
          </> : null}
          {isParentMode ? <View style={styles.guardianDexChipRow}>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>痕跡 {guardianTraces}</Text></View>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>挑戰資格 {guardianChallengeTokens}</Text></View>
            <View style={styles.guardianDexChip}><Text style={styles.guardianDexChipText}>今日事件 {worldEventsDrawnToday}/{worldEventCap}</Text></View>
          </View> : null}
          {isParentMode ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {worldEvents.map((event) => (
              <View key={event.id} style={styles.eventPreviewCard}>
                <View style={styles.eventPreviewTopRow}>
                  <Text style={styles.eventPreviewType}>{event.family.toUpperCase()}</Text>
                  <Text style={styles.eventPreviewGlyph}>{event.family === "bonus" ? "⚡" : event.family === "trace" ? "🧭" : event.family === "surprise" ? "🎁" : event.family === "future" ? "🔮" : event.family === "recovery" ? "🛌" : "🌍"}</Text>
                </View>
                {event.imageSource ? <Image source={event.imageSource} style={styles.eventPreviewImage} resizeMode="contain" /> : null}
                <Text style={styles.eventPreviewTitle}>{event.title}</Text>
                <Text style={styles.eventPreviewText}>{event.desc}</Text>
                <Text style={styles.eventPreviewReward}>{event.reward}</Text>
                <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => openWorldEventGuide(event)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
              </View>
            ))}
          </ScrollView> : null}
        </View>

        {isParentMode ? <View style={styles.card}>
          <SectionTitle title="升階 / 徽章 / 召喚" subtitle="把主角升階、徽章材料、召喚憑證接成同一條線。" />
          <View style={{ marginBottom: 10 }}>
            <Pressable style={styles.secondaryButton} onPress={openUpgradeGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
          </View>
          <View style={[styles.infoBox, { backgroundColor: "#faf5ff" }]}>
            <Text style={[styles.infoTitle, { color: "#7c3aed" }]}>主角升階卡 - Elite</Text>
            <Text style={styles.infoText}>Holton 主角目前升階:Lv.{heroUpgradeLevel}|累積任務完成數:{totalMissionClears}|下一階門檻:{nextHeroUpgradeAt}</Text>
            <Text style={styles.infoText}>這張不是升某張英雄,而是 Holton 本人的成長情節卡。</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={unlockHeroUpgrade}><Text style={styles.primaryButtonText}>檢查是否可升階</Text></Pressable>

          <View style={styles.badgeCardGrid}>
            {Object.values(collectedBadges).map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, badge.collected && styles.badgeCardCollected]}>
                {badge.imageSource ? <Image source={badge.imageSource} style={styles.badgeImage} resizeMode="contain" /> : <Text style={styles.badgeCardEmoji}>{badge.collected ? "🏅" : "🔒"}</Text>}
                <Text style={[styles.badgeText, badge.collected && styles.badgeTextCollected]}>{badge.title}</Text>
                <Text style={styles.badgeRoleText}>{badge.role}</Text>
                <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => openBadgeGuide(badge)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
              </View>
            ))}
          </View>
          <Text style={styles.minorHint}>Badge = 材料 + 收藏成就。收集數:{collectedBadgeCount} / 5</Text>

          <View style={[styles.infoBox, { marginTop: 14 }]}>
            <Text style={styles.infoTitle}>召喚憑證規則</Text>
            <Text style={styles.infoText}>當 5 個核心徽章收齊後,取得 1 次召喚憑證。憑證是高階召喚入口,用掉就沒了。</Text>
            <Text style={styles.infoText}>目前狀態:{summonTokenReady ? "已達成召喚憑證條件" : "尚未收滿 5 個徽章"}</Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: "#eff6ff", marginBottom: 0 }]}>
            <Text style={[styles.infoTitle, { color: "#2563eb" }]}>World Link Path of Light</Text>
            <Text style={styles.infoText}>這張先定義為:召喚系統的一部分,同時也是世界事件與召喚 / 成長之間的橋。之後可接到特殊世界事件或高階召喚入口。</Text>
          </View>
        </View> : null}

        {isParentMode ? <View style={styles.card}>
          <SectionTitle title="能量球 / Orb 模組" subtitle="小額日常、大額獎勵,以及 Rainbow Core 特權卡。" />
          <View style={{ marginBottom: 10 }}>
            <Pressable style={styles.secondaryButton} onPress={openOrbGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
          </View>
          <View style={styles.energyWrap}>
            {energyCards.map((energy) => (
              <View key={energy.label} style={[styles.energyCard, energy.kind === "boost" && styles.energyCardBoost]}>
                <Text style={styles.energyValue}>{energy.label}</Text>
                <Text style={styles.energyKind}>{energy.kind === "daily" ? "日常" : "加成"}</Text>
                <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => openEnergyCardGuide(energy)}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
              </View>
            ))}
          </View>
          <View style={[styles.infoBox, { marginTop: 14, backgroundColor: "#faf5ff" }]}>
            <Text style={[styles.infoTitle, { color: "#7c3aed" }]}>{rainbowCore.title}</Text>
            <Text style={styles.infoText}>{rainbowCore.desc}</Text>
            <Pressable style={[styles.secondaryButton, { marginTop: 10 }]} onPress={openOrbGuide}><Text style={styles.secondaryButtonText}>怎麼用</Text></Pressable>
          </View>
        </View> : null}

        </> : null}

        </>
        )}
      </ScrollView>
      )}

      <Modal visible={coreGuardianCreationVisible} transparent animationType="fade" onRequestClose={closeCoreGuardianCreation}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView style={styles.modalScrollArea} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {coreGuardianCreationStep === 0 ? (
              <>
                <Text style={styles.modalTitle}>{coreGuardianReselectMode ? "重新確認孩子現在的本命獸方向" : "先幫孩子找到一位比較適合現在的本命獸"}</Text>
                <Text style={styles.modalText}>{coreGuardianReselectMode ? "這不是把原本的夥伴刪掉,而是重新確認:孩子現在更需要哪一種陪伴方式。原本那位會先回守護之森休息,這次換另一位更適合現在的夥伴站上首頁。" : "這不是在替孩子貼標籤,而是先根據你最近最常看到的情況,幫 Holton 推薦一位比較適合陪孩子開始與接續流程的本命獸。整個流程很短,之後也可以再調整。"}</Text>
                <View style={styles.childCuePairRow}>
                  {renderChildCue(coreGuardianReselectMode ? "ME" : "HI", "primary")}
                  {renderChildCue(coreGuardianReselectMode ? "GO" : "GROW", "task")}
                </View>
                {coreGuardianReselectMode ? (
                  <View style={[styles.infoBox, { backgroundColor: "#fff7ed", marginTop: 12 }]}>
                    <Text style={styles.infoTitle}>重新契約提醒</Text>
                    <Text style={styles.infoText}>這不是因為前一隻不好,而是因為孩子現在的狀態可能已經變了。重選的目的是重新對焦,不是推翻前面的陪伴。</Text>
                  </View>
                ) : null}
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => { setCoreGuardianCreationStep(1); setMessage(coreGuardianReselectMode ? "已開始重新確認本命獸方向。" : "已開始本命獸建立流程。"); }}><Text style={styles.primaryButtonText}>{coreGuardianReselectMode ? "開始重新確認" : "開始"}</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => { closeCoreGuardianCreation(); setMessage("已先關閉本命獸建立流程。"); }}><Text style={styles.secondaryButtonText}>先等等</Text></Pressable>
                </View>
              </>
            ) : null}

            {coreGuardianCreationStep >= 1 && coreGuardianCreationStep <= 7 ? (
              <>
                <Text style={styles.modalTitle}>{coreGuardianReselectMode ? "重新確認本命獸問卷" : "建立本命獸問卷"}|第 {coreGuardianCreationStep} 題 / {coreGuardianQuizQuestions.length} 題</Text>
                <Text style={styles.modalText}>先照你最近最常看到的情況選就可以,不用想最完美的答案。</Text>
                <View style={styles.childCuePairRow}>
                  {renderChildCue(coreGuardianReselectMode ? "ME" : "NEW", "primary")}
                  {renderChildCue("NOW", "task")}
                </View>
                <View style={styles.quickStepRow}>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{coreGuardianReselectMode ? "重新確認近況" : "確認近況"}</Text></View>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>第 {coreGuardianCreationStep} / {coreGuardianQuizQuestions.length} 題</Text></View>
                </View>
                <View style={styles.childEntryTaskCard}>
                  <Text style={styles.childEntryTaskNo}>現在看這一題</Text>
                  {renderChildCue("NOW", "task")}
                  <Text style={styles.childEntryTaskTitle}>哪種情況最像最近的孩子?</Text>
                  <Text style={styles.childEntryTaskText}>{coreGuardianQuizQuestions[coreGuardianCreationStep - 1]?.prompt}</Text>
                </View>
                <Text style={[styles.minorHint, { marginTop: 10 }]}>先選最像的一張卡,不用選最完美的答案。</Text>
                <View style={styles.choiceGrid}>
                  {coreGuardianQuizQuestions[coreGuardianCreationStep - 1]?.options.map((option) => (
                    <Pressable key={option.id} style={[styles.choiceCard, coreGuardianQuizAnswers[coreGuardianQuizQuestions[coreGuardianCreationStep - 1].id] === option.id && styles.choiceCardActive]} onPress={() => selectCoreGuardianQuizOption(coreGuardianQuizQuestions[coreGuardianCreationStep - 1].id, option.id)}>
                      <Text style={styles.choiceCardTitle}>情況 {option.id}</Text>
                      <Text style={styles.choiceCardHint}>{option.text}</Text>
                      <Text style={[styles.minorHint, { marginTop: 8 }]}>{coreGuardianQuizAnswers[coreGuardianQuizQuestions[coreGuardianCreationStep - 1].id] === option.id ? "已選這張卡" : "選這張卡"}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={() => { setCoreGuardianCreationStep((prev) => Math.max(0, prev - 1)); setMessage("已回到上一題。"); }}><Text style={styles.secondaryButtonText}>上一步</Text></Pressable>
                </View>
              </>
            ) : null}

            {coreGuardianCreationStep === 8 && recommendedCoreGuardianMeta && coreGuardianRecommendedState ? (
              <>
                <Text style={styles.coreGuardianCreationKicker}>RECOMMENDED GUARDIAN</Text>
                <Text style={styles.modalTitle}>我們先幫孩子找到一位比較適合現在的本命獸</Text>
                {draftCoreGuardianStage1Image ? <View style={[styles.creationPreviewImageWrap, getCreationPreviewLayout(draftCoreGuardianStage1Image)]}><Image source={draftCoreGuardianStage1Image} style={styles.creationPreviewImage} resizeMode="contain" /></View> : null}
                <Text style={styles.creationPreviewName}>{recommendedCoreGuardianMeta.label}</Text>
                <Text style={styles.creationPreviewLead}>{recommendedCoreGuardianMeta.shortLine}</Text>
                <View style={styles.quickStepRow}>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{coreGuardianStateVariantMeta[coreGuardianRecommendedState].label}</Text></View>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{coreGuardianReselectMode ? "重新契約候選" : "首頁主角候選"}</Text></View>
                </View>
                <Text style={styles.modalText}>先讓圖片跟陪伴方向對上眼，再決定要不要用這位本命獸開始。</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => { setCoreGuardianCreationStep(9); setMessage(coreGuardianReselectMode ? "已選這個方向重新開始。" : "已選這個本命獸方向。"); }}><Text style={styles.primaryButtonText}>{coreGuardianReselectMode ? "用這個方向重新開始" : "用這個本命獸開始"}</Text></Pressable>
                  {secondaryCoreGuardianMeta ? <Pressable style={styles.secondaryButton} onPress={() => { switchToSecondaryCoreGuardianRecommendation(); setMessage("已切到次推薦方向。" ); }}><Text style={styles.secondaryButtonText}>看看次推薦</Text></Pressable> : null}
                  <Pressable style={styles.secondaryButton} onPress={() => { setCoreGuardianCreationStep(1); setMessage("已回到重新回答。" ); }}><Text style={styles.secondaryButtonText}>重新回答</Text></Pressable>
                </View>
                <View style={styles.coreGuardianCreationInfoCard}>
                  <Text style={styles.coreGuardianCreationInfoTitle}>為什麼先推薦這一型?</Text>
                  <Text style={styles.coreGuardianCreationInfoText}>• {recommendedCoreGuardianMeta.reasonLine}</Text>
                  <Text style={styles.coreGuardianCreationInfoText}>• 先用 {coreGuardianStateVariantMeta[coreGuardianRecommendedState].label} 開始就好</Text>
                </View>
                {secondaryCoreGuardianMeta ? (
                  <View style={[styles.coreGuardianCreationInfoCard, styles.coreGuardianCreationInfoCardWarm]}>
                    <Text style={styles.coreGuardianCreationInfoTitle}>也很接近的方向</Text>
                    <Text style={styles.coreGuardianCreationInfoText}>{secondaryCoreGuardianMeta.label}|{secondaryCoreGuardianMeta.shortLine}</Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {coreGuardianCreationStep === 9 && draftCoreGuardianPreview && recommendedCoreGuardianMeta && coreGuardianRecommendedState ? (
              <>
                <Text style={styles.coreGuardianCreationKicker}>NAME + CONFIRM</Text>
                <Text style={styles.modalTitle}>{coreGuardianReselectMode ? "新的本命獸方向已經準備好了" : "你的本命獸已經準備好了"}</Text>
                {draftCoreGuardianStage1Image ? <View style={[styles.creationPreviewImageWrap, getCreationPreviewLayout(draftCoreGuardianStage1Image)]}><Image source={draftCoreGuardianStage1Image} style={styles.creationPreviewImage} resizeMode="contain" /></View> : draftCoreGuardianPreview.beast.imageSource ? <View style={[styles.creationPreviewImageWrap, getCreationPreviewLayout(draftCoreGuardianPreview.beast.imageSource)]}><Image source={draftCoreGuardianPreview.beast.imageSource} style={styles.creationPreviewImage} resizeMode="contain" /></View> : null}
                <Text style={styles.creationPreviewName}>{recommendedCoreGuardianMeta.label}</Text>
                <Text style={styles.creationPreviewLead}>{draftCoreGuardianPreview.line}</Text>
                <Text style={styles.modalText}>{coreGuardianReselectMode ? "這位會接手首頁主角位。名字可先用推薦，也可以現在改。" : "這位會先陪孩子從比較合適的方式開始。名字可先用推薦，也可以現在改。"}</Text>
                <View style={styles.quickStepRow}>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{recommendedCoreGuardianMeta.label}</Text></View>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{coreGuardianStateVariantMeta[coreGuardianRecommendedState].label}</Text></View>
                </View>
                <Text style={styles.label}>想幫牠換個名字嗎?</Text>
                <TextInput value={draftCoreGuardianName} onChangeText={setDraftCoreGuardianName} style={styles.input} placeholder={draftCoreGuardianPreview.generatedName} />
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={completeCoreGuardianCreation}><Text style={styles.primaryButtonText}>{coreGuardianReselectMode ? "就讓牠接手" : "就用牠開始"}</Text></Pressable>
                  <Pressable style={styles.secondaryButton} onPress={() => { setCoreGuardianCreationStep(8); setMessage("已回到上一頁。" ); }}><Text style={styles.secondaryButtonText}>回上一頁</Text></Pressable>
                </View>
                <View style={styles.coreGuardianCreationInfoCard}>
                  <Text style={styles.coreGuardianCreationInfoTitle}>接下來先這樣用</Text>
                  <Text style={styles.coreGuardianCreationInfoText}>• 先讓孩子看看牠</Text>
                  <Text style={styles.coreGuardianCreationInfoText}>• 先餵第 1 顆能量球</Text>
                </View>
              </>
            ) : null}

            {coreGuardianCreationStep === 10 && draftCoreGuardianPreview ? (
              <>
                <Text style={styles.coreGuardianCreationKicker}>GUARDIAN ARRIVED</Text>
                <Text style={styles.modalTitle}>{coreGuardianReselectMode ? "新的本命獸方向已經準備好了" : "你的本命獸已經來了"}</Text>
                {draftCoreGuardianStage1Image ? <View style={[styles.creationPreviewImageWrap, getCreationPreviewLayout(draftCoreGuardianStage1Image)]}><Image source={draftCoreGuardianStage1Image} style={styles.creationPreviewImage} resizeMode="contain" /></View> : draftCoreGuardianPreview.beast.imageSource ? <View style={[styles.creationPreviewImageWrap, getCreationPreviewLayout(draftCoreGuardianPreview.beast.imageSource)]}><Image source={draftCoreGuardianPreview.beast.imageSource} style={styles.creationPreviewImage} resizeMode="contain" /></View> : null}
                <Text style={styles.creationPreviewName}>{draftCoreGuardianName.trim() || draftCoreGuardianPreview.generatedName}</Text>
                <Text style={styles.modalText}>{coreGuardianReselectMode ? "新的本命獸方向已接上首頁。先看牠，再餵第 1 顆能量球，新的陪伴方向就會開始接手。" : "牠會陪孩子一起慢慢長大。現在先回首頁看牠，再餵第 1 顆能量球就好。"}</Text>
                <View style={styles.coreGuardianBirthBox}>
                  <Text style={styles.coreGuardianBirthKicker}>誕生完成</Text>
                  <Text style={styles.coreGuardianBirthText}>{coreGuardianReselectMode ? "回首頁就會看到牠已經站上主角位。" : "回首頁就會在本命獸位置看到牠。"}</Text>
                </View>
                <View style={styles.quickStepRow}>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>{coreGuardianReselectMode ? "已重新接上首頁" : "已建立完成"}</Text></View>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>先看牠</Text></View>
                  <View style={styles.quickStepChip}><Text style={styles.quickStepChipText}>再餵第 1 顆</Text></View>
                </View>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.primaryButton} onPress={() => { closeCoreGuardianCreation(); setMessage(coreGuardianReselectMode ? "已回首頁,新的本命獸會開始接手。" : "已回首頁,先去餵第 1 顆能量球。" ); }}><Text style={styles.primaryButtonText}>{coreGuardianReselectMode ? "回首頁讓牠接手" : "回首頁餵第 1 顆"}</Text></Pressable>
                </View>
              </>
            ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={eventVisible} transparent animationType="slide" onRequestClose={acknowledgeWorldEvent}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.eventModalKicker}>WORLD EVENT</Text>
            <Text style={styles.modalTitle}>世界事件已觸發</Text>
            {currentEvent ? (
              <>
                {currentEvent.imageSource ? <View style={styles.eventModalImageFrame}><Image source={currentEvent.imageSource} style={styles.eventModalImage} resizeMode="contain" /></View> : null}
                <Text style={styles.eventTitle}>{currentEvent.title}</Text>
                <Text style={styles.eventDesc}>{currentEvent.desc}</Text>
                <View style={styles.eventRewardChip}><Text style={styles.eventReward}>{currentEvent.reward}</Text></View>
                {missionPhase === "settle" ? <Text style={styles.eventSettleHint}>這張事件卡會被記錄在本輪收尾區,確認後請繼續完成收尾整理。</Text> : null}
              </>
            ) : null}
            <Pressable style={styles.primaryButton} onPress={acknowledgeWorldEvent}>
              <Text style={styles.primaryButtonText}>收下世界回應</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={supportDurationVisible} transparent animationType="fade" onRequestClose={() => { setSupportDurationVisible(false); setPendingTimedAction(null); setSelectedSupportMinutes(0.5); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>選擇支援時間</Text>
            <Text style={styles.modalText}>{pendingTimedAction ? `${pendingTimedAction.label} 這次要先給多久?` : "請選擇支援時間"}</Text>
            <View style={styles.modalChips}>
              {(pendingTimedAction ? pendingTimedAction.options : [0.5, 1]).map((minute) => (
                <Pressable
                  key={minute}
                  style={[styles.modalChip, selectedSupportMinutes === minute && styles.modalChipActive]}
                  onPress={() => { setSelectedSupportMinutes(minute); setMessage(`已切到 ${formatSupportDurationLabel(minute)} 支援時間。`); }}
                >
                  <Text style={[styles.modalChipText, selectedSupportMinutes === minute && styles.modalChipTextActive]}>{formatSupportDurationLabel(minute)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={() => { setSupportDurationVisible(false); setPendingTimedAction(null); setSelectedSupportMinutes(0.5); setMessage("已取消時間選擇。"); }}>
                <Text style={styles.secondaryButtonText}>取消</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={confirmSupportToolDuration}>
                <Text style={styles.primaryButtonText}>開始支援</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!supportGuideTool && !!supportGuide} transparent animationType="fade" onRequestClose={() => { setSupportGuideToolId(null); setMessage("已關閉支援卡說明。"); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{supportGuideTool?.title ?? "支援卡說明"}</Text>
            <Text style={styles.modalText}>先保留實體卡片感;需要時再進這裡看完整用法與情境。</Text>
            <Text style={styles.infoTitle}>這張卡是做什麼的</Text>
            <Text style={styles.modalText}>{supportGuide?.purpose ?? ""}</Text>
            <Text style={styles.infoTitle}>適合什麼情境</Text>
            {(supportGuide?.situations ?? []).map((item) => (
              <Text key={item} style={styles.handoffBullet}>• {item}</Text>
            ))}
            <Text style={[styles.infoTitle, { marginTop: 10 }]}>父母可以怎麼說</Text>
            <Text style={styles.modalText}>{supportGuide?.parentLine ?? ""}</Text>
            <Text style={styles.infoTitle}>通常用多久</Text>
            <Text style={styles.modalText}>{supportGuide?.minutes ?? ""}</Text>
            <Text style={styles.infoTitle}>用完怎麼接回去</Text>
            <Text style={styles.modalText}>{supportGuide?.returnHint ?? ""}</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={() => { setSupportGuideToolId(null); setMessage("已關閉支援卡說明。"); }}>
                <Text style={styles.secondaryButtonText}>關閉</Text>
              </Pressable>
              {supportGuideTool ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => {
                    setSupportGuideToolId(null);
                    setMessage(`已從說明直接使用 ${supportGuideTool.title}。`);
                    activateSupportTool(supportGuideTool);
                  }}
                >
                  <Text style={styles.primaryButtonText}>使用這張卡</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!cardGuideModal} transparent animationType="fade" onRequestClose={() => { setCardGuideModal(null); setMessage("已關閉卡片說明。"); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {cardGuideModal?.imageSource ? <Image source={cardGuideModal.imageSource} style={styles.modalGuideImage} resizeMode="contain" /> : null}
            <Text style={styles.modalTitle}>{cardGuideModal?.title ?? "卡片說明"}</Text>
            <Text style={styles.modalText}>先保留卡片本體感,需要時再進來看完整用法。</Text>
            <Text style={styles.infoTitle}>這張卡是做什麼的</Text>
            <Text style={styles.modalText}>{cardGuideModal?.purpose ?? ""}</Text>
            <Text style={styles.infoTitle}>適合什麼情境</Text>
            {(cardGuideModal?.situations ?? []).map((item) => (
              <Text key={item} style={styles.handoffBullet}>• {item}</Text>
            ))}
            <Text style={[styles.infoTitle, { marginTop: 10 }]}>父母可以怎麼說</Text>
            <Text style={styles.modalText}>{cardGuideModal?.parentLine ?? ""}</Text>
            <Text style={styles.infoTitle}>通常用多久 / 看多久</Text>
            <Text style={styles.modalText}>{cardGuideModal?.minutes ?? ""}</Text>
            <Text style={styles.infoTitle}>之後怎麼接回去</Text>
            <Text style={styles.modalText}>{cardGuideModal?.returnHint ?? ""}</Text>
            {cardGuideModal?.avoidLine ? (
              <>
                <Text style={styles.infoTitle}>先不要這樣做</Text>
                <Text style={styles.modalText}>{cardGuideModal.avoidLine}</Text>
              </>
            ) : null}
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={() => { setCardGuideModal(null); setMessage("已關閉卡片說明。"); }}>
                <Text style={styles.secondaryButtonText}>關閉</Text>
              </Pressable>
              {cardGuideModal?.actionLabel ? (
                <Pressable style={styles.primaryButton} onPress={runCardGuideAction}>
                  <Text style={styles.primaryButtonText}>{cardGuideModal.actionLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={supportReturnPromptVisible} transparent animationType="fade" onRequestClose={() => setSupportReturnPromptVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{supportReminderMode === "screen-sound" ? "🔔 支援時間已到" : "支援時間已到"}</Text>
            <Text style={styles.modalText}>{activeSupportTool ? `${activeSupportTool.title} 已完成,現在要怎麼接回主流程?` : "請選擇接回方式"}</Text>
            <View style={styles.exceptionButtonGrid}>
              <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("ready")}>
                <Text style={styles.exceptionButtonTitle}>回 Ready Check</Text>
                <Text style={styles.exceptionButtonText}>重新確認要不要進場。</Text>
              </Pressable>
              <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("sop")}>
                <Text style={styles.exceptionButtonTitle}>回目前 SOP</Text>
                <Text style={styles.exceptionButtonText}>只接回下一步。</Text>
              </Pressable>
              <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("restart")}>
                <Text style={styles.exceptionButtonTitle}>走 Restart</Text>
                <Text style={styles.exceptionButtonText}>先重接,再回主線。</Text>
              </Pressable>
              <Pressable style={styles.exceptionButton} onPress={() => completeSupportReturn("settle")}>
                <Text style={styles.exceptionButtonTitle}>直接收尾</Text>
                <Text style={styles.exceptionButtonText}>這一輪先結束。</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!pendingChallengeSwitchId} transparent animationType="fade" onRequestClose={() => setPendingChallengeSwitchId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>這一輪還在進行中</Text>
            <Text style={styles.modalText}>如果你要改別的時間挑戰,系統會先取消現在這一輪,再切到新挑戰卡。</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={() => setPendingChallengeSwitchId(null)}>
                <Text style={styles.secondaryButtonText}>先回去</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={() => cancelCurrentMissionRound(pendingChallengeSwitchId ?? undefined)}>
                <Text style={styles.primaryButtonText}>取消這輪再改</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={stage2PromptVisible} transparent animationType="fade" onRequestClose={() => setStage2PromptVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Guardian Beast Stage 2 可開放</Text>
            <Text style={styles.eventDesc}>Holton 已經進入系統約一週,依目前規則可開始開放 Guardian Beast Stage 2。</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={() => { setStage2Unlocked(true); setStage2PromptVisible(false); setMessage("Guardian Beast Stage 2 已開放,可以開始導入更完整的守護獸挑戰。"); }}>
                <Text style={styles.primaryButtonText}>現在開放</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => { setStage2PromptVisible(false); setMessage("已先收起 Stage 2 提示。"); }}>
                <Text style={styles.secondaryButtonText}>稍後再說</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  loadingShell: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, backgroundColor: "#f8fafc" },
  loadingTitle: { fontSize: 26, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  loadingText: { fontSize: 16, lineHeight: 24, color: "#64748b", textAlign: "center", marginTop: 12 },
  mainScroll: { flex: 1, width: "100%" },
  container: { padding: 18, paddingBottom: 44, gap: 14, alignSelf: "flex-start" },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "800", color: "#0f172a", flexShrink: 1 },
  subtitle: { fontSize: 14, lineHeight: 21, color: "#475569", marginBottom: 4, flexShrink: 1 },
  actionFeedbackCard: { backgroundColor: "#eff6ff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#bfdbfe", marginBottom: 4 },
  actionFeedbackKicker: { fontSize: 14, color: "#1d4ed8", fontWeight: "800", letterSpacing: 0.6, marginBottom: 6 },
  actionFeedbackText: { fontSize: 17, color: "#1e293b", lineHeight: 26, fontWeight: "700" },
  activeTimerHeroCard: { backgroundColor: "#fff7ed", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#fdba74", marginBottom: 6 },
  activeTimerReturnCard: { backgroundColor: "#eef2ff", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#c7d2fe", marginBottom: 6 },
  activeTimerHeroKicker: { fontSize: 14, color: "#9a3412", fontWeight: "800", letterSpacing: 0.6, marginBottom: 6 },
  activeTimerHeroTitle: { fontSize: 24, color: "#0f172a", fontWeight: "800", marginBottom: 6 },
  activeTimerHeroTime: { fontSize: 28, color: "#c2410c", fontWeight: "900", marginBottom: 6 },
  activeTimerHeroText: { fontSize: 16, color: "#334155", lineHeight: 24, fontWeight: "700" },
  timedSupportFullscreenShell: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f8fafc" },
  timedSupportFullscreenCard: { backgroundColor: "#fff7ed", borderRadius: 28, padding: 22, borderWidth: 1, borderColor: "#fdba74", gap: 12 },
  timedSupportFullscreenKicker: { fontSize: 15, color: "#9a3412", fontWeight: "800", letterSpacing: 0.8 },
  timedSupportFullscreenTitle: { fontSize: 28, color: "#0f172a", fontWeight: "900" },
  timedSupportFullscreenImage: { width: "100%", height: 260, backgroundColor: "#fff", borderRadius: 22 },
  timedSupportFullscreenTime: { fontSize: 42, color: "#c2410c", fontWeight: "900" },
  timedSupportFullscreenDone: { fontSize: 34, color: "#4338ca", fontWeight: "900" },
  timedSupportFullscreenText: { fontSize: 18, color: "#334155", lineHeight: 28, fontWeight: "700" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardDisabled: { opacity: 0.45 },
  cardPhaseActive: { borderWidth: 1.5, borderColor: "#7c3aed" },
  sectionTitleWrap: { marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a", lineHeight: 30 },
  sectionSubtitle: { fontSize: 16, color: "#64748b", marginTop: 6, lineHeight: 24, fontWeight: "500" },
  phaseHint: { fontSize: 15, color: "#7c3aed", marginTop: 10, marginBottom: 12, fontWeight: "800", lineHeight: 22, letterSpacing: 0.2 },
  label: { fontSize: 13, color: "#64748b", marginBottom: 6, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  multilineInput: { minHeight: 74, textAlignVertical: "top" },
  modeSwitchRow: { flexDirection: "row", gap: 10, marginBottom: 12, width: "100%" },
  modeSwitchChip: { flex: 1, borderRadius: 999, paddingVertical: 10, alignItems: "center", backgroundColor: "#e2e8f0" },
  modeSwitchChipActive: { backgroundColor: "#111827" },
  modeSwitchText: { fontSize: 12, color: "#334155", fontWeight: "800" },
  modeSwitchTextActive: { color: "#ffffff" },
  realOpsHero: { backgroundColor: "#0f172a", borderRadius: 18, padding: 16, flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 14 },
  realOpsHeroKicker: { fontSize: 11, color: "#86efac", fontWeight: "800", letterSpacing: 1 },
  realOpsHeroTitle: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6, lineHeight: 24 },
  realOpsHeroText: { fontSize: 12, color: "#cbd5e1", marginTop: 8, lineHeight: 18 },
  realOpsMeta: { fontSize: 11, color: "#94a3b8", marginTop: 8, lineHeight: 16 },
  quickChipRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 10 },
  quickChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#e2e8f0" },
  quickChipText: { fontSize: 11, color: "#334155", fontWeight: "700" },
  quickStepRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickStepChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "rgba(255,255,255,0.78)", borderWidth: 1, borderColor: "#dbeafe" },
  quickStepChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb", shadowColor: "#2563eb", shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  quickStepChipText: { fontSize: 11, color: "#334155", fontWeight: "800", letterSpacing: 0.3 },
  quickStepChipTextActive: { color: "#ffffff" },
  realOpsHeroBadge: { width: 84, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", alignItems: "center" },
  realOpsHeroBadgeLabel: { fontSize: 11, color: "#86efac", fontWeight: "800" },
  realOpsHeroBadgeValue: { fontSize: 24, color: "#ffffff", fontWeight: "800", marginTop: 4 },
  realOpsPanel: { backgroundColor: "#0f172a", borderRadius: 16, padding: 12, marginTop: 12 },
  reproBox: { backgroundColor: "#1e293b", borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#334155" },
  reproTitle: { fontSize: 12, color: "#c4b5fd", fontWeight: "800" },
  reproLine: { fontSize: 11, color: "#e2e8f0", lineHeight: 16, marginTop: 6 },
  eventChipRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 12 },
  handoffHeroCard: { backgroundColor: "#111827", borderRadius: 18, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  handoffHeroKicker: { fontSize: 11, color: "#93c5fd", fontWeight: "800", letterSpacing: 1 },
  handoffHeroTitle: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6, lineHeight: 24 },
  handoffHeroText: { fontSize: 13, color: "#cbd5e1", marginTop: 8, lineHeight: 18 },
  handoffRiskBadge: { width: 78, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", alignItems: "center" },
  handoffRiskLabel: { fontSize: 11, color: "#fda4af", fontWeight: "800" },
  handoffRiskValue: { fontSize: 24, color: "#ffffff", fontWeight: "800", marginTop: 4 },
  handoffGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  handoffMiniCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  handoffMiniLabel: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  handoffMiniValue: { fontSize: 13, color: "#0f172a", fontWeight: "800", marginTop: 6, lineHeight: 18 },
  handoffMiniMeta: { fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 15 },
  handoffSectionCard: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#e2e8f0", marginTop: 12 },
  handoffSectionTitle: { fontSize: 12, color: "#0f172a", fontWeight: "800" },
  handoffSectionLead: { fontSize: 13, color: "#1e293b", fontWeight: "800", marginTop: 8, lineHeight: 18 },
  handoffBody: { fontSize: 12, color: "#475569", marginTop: 8, lineHeight: 17 },
  handoffBullet: { fontSize: 12, color: "#334155", marginTop: 8, lineHeight: 17 },
  handoffActionRow: { gap: 10, marginTop: 12 },
  reportSplitBox: { backgroundColor: "#ffffff", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#dbeafe" },
  reportSplitTitle: { fontSize: 11, color: "#2563eb", fontWeight: "800", letterSpacing: 0.6 },
  heroPanel: {
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  heroEmoji: { fontSize: 38, marginBottom: 6 },
  heroName: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  heroSub: { marginTop: 4, fontSize: 13, color: "#64748b", textAlign: "center" },
  infoBox: { backgroundColor: "#eef2ff", borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  infoTitle: { fontSize: 18, fontWeight: "800", color: "#4338ca", marginBottom: 6 },
  infoText: { fontSize: 17, color: "#334155", lineHeight: 26 },
  parentLayerBox: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fdba74" },
  parentMissionHeroCard: { backgroundColor: "#fff7ed", borderRadius: 28, padding: 18, marginTop: 14, marginBottom: 16, marginHorizontal: 10, borderWidth: 2, borderColor: "#fb923c", shadowColor: "#f97316", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  parentHeroKicker: { fontSize: 12, color: "#c2410c", fontWeight: "900", letterSpacing: 1.1 },
  parentHeroTitle: { fontSize: 24, color: "#7c2d12", fontWeight: "900", lineHeight: 30, marginTop: 6 },
  parentHeroMission: { fontSize: 19, color: "#0f172a", fontWeight: "900", lineHeight: 26, marginTop: 8 },
  parentHeroImageFrame: { backgroundColor: "#ffffff", borderRadius: 24, padding: 8, marginTop: 14, borderWidth: 1, borderColor: "#fed7aa" },
  parentHeroImage: { width: "100%", height: 390, borderRadius: 20, backgroundColor: "#ffffff" },
  parentHeroRewardRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  parentHeroRewardChip: { flex: 1, backgroundColor: "#ffffff", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" },
  parentHeroRewardLabel: { fontSize: 11, color: "#c2410c", fontWeight: "900" },
  parentHeroRewardValue: { fontSize: 18, color: "#7c2d12", fontWeight: "900", marginTop: 3 },
  parentHeroGuide: { fontSize: 15, color: "#9a3412", fontWeight: "800", lineHeight: 22, marginTop: 12 },
  parentHeroControlRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  parentSmallButton: { flex: 1, backgroundColor: "#ffffff", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fdba74" },
  parentSmallButtonText: { fontSize: 16, color: "#9a3412", fontWeight: "900" },
  parentBigStartButton: { backgroundColor: "#111827", borderRadius: 28, paddingVertical: 20, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 14, shadowColor: "#111827", shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  parentBigStartKicker: { fontSize: 12, color: "#cbd5e1", fontWeight: "900", letterSpacing: 1.2 },
  parentBigStartText: { fontSize: 23, color: "#ffffff", fontWeight: "900", marginTop: 2 },
  parentQuickActionCard: { backgroundColor: "#f8fafc", borderRadius: 24, padding: 14, marginHorizontal: 10, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  parentQuickActionKicker: { fontSize: 13, color: "#475569", fontWeight: "900", letterSpacing: 0.5, marginBottom: 10 },
  parentQuickActionGrid: { gap: 10 },
  parentQuickActionButton: { backgroundColor: "#ffffff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#dbeafe" },
  parentQuickActionTitle: { fontSize: 17, color: "#0f172a", fontWeight: "900" },
  parentQuickActionText: { fontSize: 13, color: "#64748b", fontWeight: "800", marginTop: 4 },
  parentLayerMode: { fontSize: 18, color: "#9a3412", fontWeight: "800", marginBottom: 4 },
  parentLayerTheory: { fontSize: 12, color: "#c2410c", fontWeight: "800", marginBottom: 8, letterSpacing: 0.4 },
  nowStatusCard: { backgroundColor: "#eef2ff", borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  nowStatusKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.5 },
  nowStatusTitle: { fontSize: 18, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  nowStatusText: { fontSize: 13, color: "#334155", lineHeight: 18, marginTop: 6 },
  homeDetailsToggle: { marginTop: 4, marginBottom: 12, backgroundColor: "#f8fafc", borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  homeDetailsToggleText: { fontSize: 13, color: "#475569", fontWeight: "800" },
  worldEntryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  worldEntryCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#dbeafe" },
  worldEntryKicker: { fontSize: 11, color: "#2563eb", fontWeight: "800", letterSpacing: 0.6 },
  worldEntryTitle: { fontSize: 15, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  worldEntryText: { fontSize: 12, color: "#475569", lineHeight: 18, marginTop: 6 },
  guardianWorldFlowRow: { flexDirection: "row", alignItems: "stretch", gap: 8, marginBottom: 12 },
  guardianWorldFlowCard: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center" },
  guardianWorldFlowCardActive: { backgroundColor: "#ecfeff", borderColor: "#67e8f9" },
  guardianWorldFlowStep: { fontSize: 10, color: "#0891b2", fontWeight: "800", letterSpacing: 0.5 },
  guardianWorldFlowTitle: { fontSize: 13, color: "#0f172a", fontWeight: "800", marginTop: 4 },
  guardianWorldFlowMeta: { fontSize: 11, color: "#475569", marginTop: 6 },
  guardianWorldFlowArrow: { justifyContent: "center", alignItems: "center" },
  guardianWorldFlowArrowText: { fontSize: 18, color: "#94a3b8", fontWeight: "800" },
  quickActionCard: { backgroundColor: "#111827", borderRadius: 18, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  quickActionKicker: { fontSize: 11, color: "#c4b5fd", fontWeight: "800", letterSpacing: 1 },
  quickActionTitle: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6 },
  quickActionText: { fontSize: 13, color: "#cbd5e1", lineHeight: 18, marginTop: 6 },
  quickActionButton: { backgroundColor: "#8b5cf6", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  quickActionButtonText: { fontSize: 13, color: "#ffffff", fontWeight: "800" },
  startHelperRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  startHelperButton: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  startHelperTitle: { fontSize: 13, color: "#0f172a", fontWeight: "800" },
  startHelperText: { fontSize: 11, color: "#64748b", lineHeight: 16, marginTop: 4 },
  startFlowCard: { backgroundColor: "#f8fafc", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 },
  startFlowKicker: { fontSize: 13, color: "#0f172a", fontWeight: "800", marginBottom: 10 },
  startFlowIntro: { fontSize: 12, color: "#475569", lineHeight: 18, marginBottom: 10 },
  startFlowRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  startStepCard: { flex: 1, backgroundColor: "#ffffff", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  startEntryPrimary: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" },
  startEntrySupport: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  startStepNo: { fontSize: 18, color: "#7c3aed", fontWeight: "800" },
  startStepTitle: { fontSize: 13, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  startStepText: { fontSize: 11, color: "#64748b", lineHeight: 15, marginTop: 4 },
  cardTableCard: { backgroundColor: "#111827", borderRadius: 20, padding: 14, marginBottom: 12 },
  cardTableKicker: { fontSize: 11, color: "#c4b5fd", fontWeight: "800", letterSpacing: 0.6 },
  cardTableTitle: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6 },
  cardTableRail: { gap: 12, paddingVertical: 12 },
  cardTableItem: { width: 150, backgroundColor: "#1f2937", borderRadius: 16, padding: 10, borderWidth: 1, borderColor: "#374151" },
  cardTableLabel: { fontSize: 10, color: "#fbbf24", fontWeight: "800", letterSpacing: 0.5 },
  cardTableImage: { width: "100%", height: 118, borderRadius: 12, backgroundColor: "#ffffff", marginTop: 8 },
  cardTableItemTitle: { fontSize: 12, color: "#ffffff", fontWeight: "800", marginTop: 8, lineHeight: 16 },
  cardTableItemHint: { fontSize: 11, color: "#cbd5e1", lineHeight: 15, marginTop: 4 },
  homeStarterCard: { backgroundColor: "#fff7ed", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#fed7aa", marginBottom: 12 },
  homeTodayCard: { backgroundColor: "#f8fafc", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 },
  homeCompanionCard: { marginBottom: 12 },
  coreGuardianEmptyCard: { borderColor: "#cbd5e1", shadowColor: "#94a3b8" },
  homeStarterHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  homeStarterKicker: { fontSize: 11, color: "#c2410c", fontWeight: "800", letterSpacing: 0.5 },
  homeStarterTitle: { fontSize: 20, color: "#7c2d12", fontWeight: "800", marginTop: 4 },
  homeStarterText: { fontSize: 13, color: "#9a3412", lineHeight: 18, marginTop: 6 },
  homeStarterPreviewImage: { width: 88, height: 124, borderRadius: 12, backgroundColor: "#ffffff" },
  homeStarterRail: { gap: 14, paddingVertical: 14 },
  homeStarterOption: { width: 232, backgroundColor: "#ffffff", borderRadius: 18, padding: 12, borderWidth: 1, borderColor: "#fdba74" },
  homeStarterOptionActive: { borderColor: "#7c3aed", borderWidth: 2 },
  homeStarterOptionImage: { width: "100%", height: 220, borderRadius: 14, backgroundColor: "#f8fafc" },
  homeStarterOptionTitle: { fontSize: 16, color: "#0f172a", fontWeight: "800", marginTop: 10 },
  homeStarterOptionMeta: { fontSize: 13, color: "#ea580c", fontWeight: "700", marginTop: 6 },
  homeStarterOptionHint: { fontSize: 11, color: "#64748b", lineHeight: 15, marginTop: 4 },
  trialBanner: { backgroundColor: "#0f172a", borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#334155" },
  trialBannerKicker: { fontSize: 12, color: "#93c5fd", fontWeight: "900", letterSpacing: 1 },
  trialBannerTitle: { fontSize: 17, color: "#ffffff", fontWeight: "900", lineHeight: 24, marginTop: 6 },
  trialStepRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  trialStepChip: { backgroundColor: "#1e293b", color: "#dbeafe", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12, fontWeight: "900", overflow: "hidden" },
  orbScoreHeroCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff7ed", borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 2, borderColor: "#fb923c", shadowColor: "#f97316", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  orbScoreMain: { width: 104, alignItems: "center", justifyContent: "center" },
  orbScoreKicker: { fontSize: 11, color: "#c2410c", fontWeight: "900", letterSpacing: 1 },
  orbScoreValue: { fontSize: 44, color: "#9a3412", fontWeight: "900", lineHeight: 50, marginTop: 2 },
  orbScoreLabel: { fontSize: 12, color: "#9a3412", fontWeight: "800" },
  orbScoreDivider: { width: 1, alignSelf: "stretch", backgroundColor: "#fed7aa", marginHorizontal: 14 },
  orbScoreSide: { flex: 1 },
  orbScoreGain: { fontSize: 20, color: "#7c2d12", fontWeight: "900", lineHeight: 26 },
  orbScoreAfter: { fontSize: 15, color: "#9a3412", fontWeight: "800", marginTop: 4, lineHeight: 21 },
  orbScoreHint: { fontSize: 12, color: "#c2410c", fontWeight: "700", marginTop: 6, lineHeight: 17 },
  testingToggle: { marginTop: 12, backgroundColor: "#eef2ff", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  testingToggleText: { fontSize: 13, color: "#4338ca", fontWeight: "800" },
  testingDashboardToggle: { marginTop: 12, marginBottom: 10, backgroundColor: "#eff6ff", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  testingDashboardToggleText: { fontSize: 13, color: "#1d4ed8", fontWeight: "800" },
  testingScenarioComposer: { backgroundColor: "#0f172a", borderRadius: 16, padding: 12, marginBottom: 12 },
  testingButtonGrid: { gap: 10 },
  testingButton: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  testingButtonTitle: { fontSize: 15, color: "#0f172a", fontWeight: "800" },
  testingButtonText: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 6 },
  savedScenarioCard: { width: 240, backgroundColor: "#1e293b", borderRadius: 14, padding: 12, marginRight: 10, borderWidth: 1, borderColor: "#334155" },
  savedScenarioCardActive: { borderColor: "#8b5cf6", backgroundColor: "#312e81" },
  savedScenarioTitle: { fontSize: 13, color: "#f8fafc", fontWeight: "800" },
  savedScenarioMeta: { fontSize: 11, color: "#c4b5fd", fontWeight: "700", marginTop: 6 },
  savedScenarioText: { fontSize: 11, color: "#cbd5e1", lineHeight: 16, marginTop: 6 },
  testingDashboardBox: { backgroundColor: "#0f172a", borderRadius: 16, padding: 12, marginTop: 12 },
  testingDashboardTitle: { fontSize: 13, color: "#c4b5fd", fontWeight: "800" },
  testingDashboardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  testingDashboardCard: { width: "48%", backgroundColor: "#1e293b", borderRadius: 12, padding: 10 },
  testingDashboardLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "700" },
  testingDashboardValue: { fontSize: 13, color: "#f8fafc", fontWeight: "800", marginTop: 6, lineHeight: 18 },
  testingDashboardSubBox: { backgroundColor: "#1e293b", borderRadius: 12, padding: 10, marginTop: 10 },
  testingDashboardSubTitle: { fontSize: 12, color: "#e2e8f0", fontWeight: "800" },
  testingConclusionLevel: { fontSize: 12, color: "#c4b5fd", fontWeight: "800", marginTop: 8 },
  testingDashboardSubText: { fontSize: 12, color: "#cbd5e1", marginTop: 6, lineHeight: 17 },
  recommendationBox: { backgroundColor: "#334155", borderRadius: 10, padding: 10, marginTop: 10 },
  recommendationLabel: { fontSize: 11, color: "#cbd5e1", fontWeight: "800" },
  recommendationText: { fontSize: 12, color: "#e2e8f0", lineHeight: 17, marginTop: 6 },
  recommendationButton: { backgroundColor: "#8b5cf6", borderRadius: 12, paddingVertical: 10, alignItems: "center", marginTop: 10 },
  recommendationButtonText: { fontSize: 12, color: "#ffffff", fontWeight: "800" },
  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  presetChip: { backgroundColor: "#334155", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  presetChipActive: { backgroundColor: "#8b5cf6" },
  presetChipText: { fontSize: 11, color: "#f8fafc", fontWeight: "800" },
  presetChipTextActive: { color: "#ffffff" },
  baselineButton: { backgroundColor: "#0f172a", borderRadius: 12, paddingVertical: 10, alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: "#475569" },
  baselineButtonText: { fontSize: 12, color: "#f8fafc", fontWeight: "800" },
  tuningGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tuningChip: { backgroundColor: "#334155", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  eventChipActive: { backgroundColor: "#7c3aed" },
  tuningChipText: { fontSize: 11, color: "#f8fafc", fontWeight: "800" },
  ruleLogCard: { backgroundColor: "#334155", borderRadius: 10, padding: 10, marginTop: 8 },
  ruleLogTitle: { fontSize: 12, color: "#f8fafc", fontWeight: "800" },
  ruleLogLine: { fontSize: 11, color: "#cbd5e1", marginTop: 5, lineHeight: 16 },
  homeSnapshotRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  homeSnapshotCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  homeSnapshotLabel: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  homeSnapshotValue: { fontSize: 18, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  homeSnapshotValueSmall: { fontSize: 15, color: "#0f172a", fontWeight: "800", marginTop: 6, lineHeight: 20 },
  childLayerDivider: { backgroundColor: "#ecfeff", borderRadius: 14, padding: 12, marginTop: 6, marginBottom: 8, borderWidth: 1, borderColor: "#a5f3fc" },
  childLayerDividerKicker: { fontSize: 14, color: "#0f766e", fontWeight: "800", letterSpacing: 1 },
  childLayerDividerText: { fontSize: 16, color: "#155e75", lineHeight: 24, marginTop: 8 },
  parentLayerDivider: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 12, marginTop: 6, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  parentLayerDividerKicker: { fontSize: 14, color: "#475569", fontWeight: "800", letterSpacing: 1 },
  parentLayerDividerText: { fontSize: 16, color: "#64748b", lineHeight: 24, marginTop: 8 },
  flowPhaseCard: { backgroundColor: "#f8fafc", borderRadius: 24, padding: 22, borderWidth: 1, borderColor: "#e2e8f0" },
  flowPhaseKicker: { fontSize: 14, color: "#7c3aed", fontWeight: "800", letterSpacing: 1 },
  flowPhaseTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginTop: 6 },
  flowPhaseText: { fontSize: 16, color: "#475569", lineHeight: 24, marginTop: 10 },
  flowPhaseNextBox: { backgroundColor: "#eef2ff", borderRadius: 20, padding: 18, marginTop: 16 },
  flowPhaseNextLabel: { fontSize: 14, color: "#4338ca", fontWeight: "800" },
  flowPhaseNextText: { fontSize: 16, color: "#3730a3", lineHeight: 24, marginTop: 6 },
  currentStepPanel: { backgroundColor: "#eef2ff", borderRadius: 24, padding: 22, marginBottom: 16 },
  currentStepKicker: { fontSize: 14, color: "#4338ca", fontWeight: "800", letterSpacing: 1 },
  currentStepTitle: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginTop: 8 },
  currentStepText: { fontSize: 18, color: "#334155", lineHeight: 26, marginTop: 10 },
  currentStepHint: { fontSize: 16, color: "#64748b", lineHeight: 24, marginTop: 8 },
  sopJourneyBox: { backgroundColor: "#ffffff", borderRadius: 18, padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#dbeafe" },
  sopJourneyLabel: { fontSize: 13, color: "#2563eb", fontWeight: "800", marginTop: 4 },
  sopJourneyText: { fontSize: 15, color: "#334155", lineHeight: 22, marginTop: 4 },
  childEntryCard: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 28, paddingTop: 20, paddingRight: 18, paddingBottom: 20, paddingLeft: 18, marginTop: 14, marginBottom: 16, marginHorizontal: 10, shadowColor: "#93c5fd", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  childQuestCard: { backgroundColor: "#eef2ff", borderColor: "#a5b4fc", shadowColor: "#6366f1", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  childEntryKicker: { fontSize: 14, color: "#1d4ed8", fontWeight: "800", letterSpacing: 1 },
  childEntryTitle: { fontSize: 23, fontWeight: "800", color: "#0f172a", marginTop: 6, lineHeight: 30 },
  childEntryText: { fontSize: 18, fontWeight: "800", color: "#0f172a", lineHeight: 26, marginTop: 8 },
  childEntrySupportLine: { fontSize: 11, color: "#475569", lineHeight: 16, marginTop: 6 },
  childQuestImageFrame: { backgroundColor: "#ffffff", borderRadius: 24, padding: 8, marginTop: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  childQuestRewardPanel: { backgroundColor: "#fffbeb", borderRadius: 22, padding: 14, marginTop: 12, borderWidth: 2, borderColor: "#fbbf24", alignItems: "center" },
  childQuestRewardKicker: { fontSize: 12, color: "#92400e", fontWeight: "900", letterSpacing: 1 },
  childQuestRewardValue: { fontSize: 30, color: "#b45309", fontWeight: "900", marginTop: 4, lineHeight: 36 },
  childQuestRewardText: { fontSize: 14, color: "#92400e", fontWeight: "800", marginTop: 4, lineHeight: 20 },
  childQuestMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  childQuestMetaChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  childQuestMetaChipText: { fontSize: 13, color: "#3730a3", fontWeight: "900" },
  childQuestPath: { flexDirection: "row", gap: 8, marginTop: 14 },
  childQuestStep: { flex: 1, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center" },
  childQuestStepDone: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  childQuestStepNo: { fontSize: 13, color: "#334155", fontWeight: "900" },
  childQuestStepText: { fontSize: 13, color: "#334155", fontWeight: "800", marginTop: 2 },
  childCardControlRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  childSmallActionButton: { flex: 1, backgroundColor: "#ffffff", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#c7d2fe" },
  childSmallActionText: { fontSize: 16, color: "#3730a3", fontWeight: "900" },
  childBigStartButton: { backgroundColor: "#f97316", borderRadius: 28, paddingVertical: 20, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 14, shadowColor: "#f97316", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  childBigStartKicker: { fontSize: 12, color: "#ffedd5", fontWeight: "900", letterSpacing: 1.2 },
  childBigStartText: { fontSize: 25, color: "#ffffff", fontWeight: "900", marginTop: 2 },
  childTinyResetButton: { alignSelf: "center", marginTop: 12, paddingVertical: 8, paddingHorizontal: 12 },
  childTinyResetText: { fontSize: 14, color: "#4338ca", fontWeight: "800" },
  missionOrbPillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, marginBottom: 6 },
  missionOrbPill: { backgroundColor: "#fffbeb", color: "#92400e", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 11, fontSize: 12, fontWeight: "900", overflow: "hidden", borderWidth: 1, borderColor: "#fcd34d" },
  missionOrbPillStrong: { backgroundColor: "#f97316", color: "#ffffff", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 11, fontSize: 12, fontWeight: "900", overflow: "hidden" },
  childEntryVisualGrid: { gap: 18, marginTop: 20 },
  childTaskActionDock: { gap: 10, marginTop: 16 },
  childDoneButton: { backgroundColor: "#16a34a", borderRadius: 30, paddingVertical: 20, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", shadowColor: "#16a34a", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  childDoneKicker: { fontSize: 12, color: "#dcfce7", fontWeight: "900", letterSpacing: 1.2 },
  childDoneText: { fontSize: 25, color: "#ffffff", fontWeight: "900", marginTop: 2 },
  childDoneSubText: { fontSize: 13, color: "#dcfce7", fontWeight: "800", marginTop: 4 },
  childHelpButton: { backgroundColor: "#fff7ed", borderRadius: 24, paddingVertical: 16, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fdba74" },
  childHelpKicker: { fontSize: 11, color: "#c2410c", fontWeight: "900", letterSpacing: 1.1 },
  childHelpText: { fontSize: 19, color: "#9a3412", fontWeight: "900", marginTop: 2 },
  childEntryVisualCard: { borderRadius: 28, padding: 28, borderWidth: 1, overflow: "hidden" },
  childEntryVisualPrimary: { backgroundColor: "#ffffff", borderColor: "#bfdbfe" },
  childEntryVisualSupport: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  childEntryVisualNo: { fontSize: 15, color: "#475569", fontWeight: "800" },
  childEntryVisualTitle: { fontSize: 28, color: "#0f172a", fontWeight: "800", marginTop: 10 },
  childEntryVisualText: { fontSize: 18, color: "#475569", lineHeight: 26, marginTop: 10 },
  childEntryVisualImage: { width: "100%", height: 420, borderRadius: 18, marginTop: 10, backgroundColor: "#ffffff" },
  childCueWrap: { alignItems: "center", marginTop: 8 },
  childCueBubble: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  childCueBubblePrimary: { backgroundColor: "#dbeafe", borderColor: "#93c5fd" },
  childCueBubbleSupport: { backgroundColor: "#ffedd5", borderColor: "#fdba74" },
  childCueBubbleTask: { backgroundColor: "#ede9fe", borderColor: "#c4b5fd" },
  childCueBubbleCool: { backgroundColor: "#e0f2fe", borderColor: "#7dd3fc" },
  childCueBubbleFocus: { backgroundColor: "#eef2ff", borderColor: "#a5b4fc" },
  childCueBubbleWarm: { backgroundColor: "#ffedd5", borderColor: "#fdba74" },
  childCueBubbleImage: { width: 40, height: 40 },
  childCueBubbleText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.5, color: "#0f172a" },
  childCueLabel: { fontSize: 13, lineHeight: 16, fontWeight: "900", color: "#334155", marginTop: 4, letterSpacing: 0.4 },
  childEntryTaskCard: { backgroundColor: "#ffffff", borderRadius: 30, padding: 30, borderWidth: 2, borderColor: "#93c5fd", marginTop: 24, shadowColor: "#93c5fd", shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  childCuePairRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 8 },
  childEntryTaskNo: { fontSize: 15, color: "#475569", fontWeight: "800" },
  childEntryHeroImage: { width: "100%", height: 390, borderRadius: 20, marginTop: 10, backgroundColor: "#ffffff" },
  guardianShowcaseHeroImage: { width: "100%", height: 280, borderRadius: 22, marginBottom: 18, backgroundColor: "rgba(255,255,255,0.18)" },
  childEntryTaskHeroImage: { width: "100%", height: 520, borderRadius: 24, marginTop: 12, backgroundColor: "#ffffff" },
  childEntryTaskImage: { width: "100%", height: 120, marginTop: 10 },
  childEntryTaskTitle: { fontSize: 28, color: "#0f172a", fontWeight: "800", marginTop: 12, textAlign: "center" },
  childEntryTaskText: { fontSize: 18, color: "#334155", lineHeight: 26, marginTop: 10, textAlign: "center" },
  childEntryInnerCard: { backgroundColor: "#f8fafc", borderRadius: 18, padding: 16, marginTop: 12, marginBottom: 0, borderWidth: 1, borderColor: "#e2e8f0" },
  childEntryInnerTitle: { fontSize: 14, color: "#0f172a", fontWeight: "800", marginBottom: 6 },
  childCompanionKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, textAlign: "center" },
  childCompanionHeroImageFrame: { width: "100%", height: 224, borderRadius: 20, marginBottom: 12, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dbeafe", overflow: "hidden" },
  childCompanionHeroImage: { width: "100%", height: 264, backgroundColor: "#ffffff" },
  childCompanionName: { fontSize: 22, color: "#0f172a", fontWeight: "800", marginBottom: 8, textAlign: "center" },
  childCompanionRoleLine: { fontSize: 18, color: "#0f172a", fontWeight: "800", lineHeight: 26, marginBottom: 8, textAlign: "center" },
  childCompanionMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" },
  childCompanionMetaChip: { backgroundColor: "#eef2ff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#c7d2fe" },
  childCompanionMetaText: { fontSize: 13, color: "#4338ca", fontWeight: "800" },
  worldFeaturedHeroCard: { backgroundColor: "#eef2ff", borderRadius: 30, padding: 24, borderWidth: 1, borderColor: "#c7d2fe" },
  worldFeaturedKicker: { fontSize: 13, color: "#4338ca", fontWeight: "800", letterSpacing: 1 },
  worldFeaturedTitle: { fontSize: 30, color: "#0f172a", fontWeight: "800", marginTop: 8, lineHeight: 38 },
  worldFeaturedMetaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  worldFeaturedMetaChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  worldFeaturedMetaText: { fontSize: 12, color: "#4338ca", fontWeight: "800" },
  worldFeaturedText: { fontSize: 17, color: "#475569", lineHeight: 25, marginTop: 10 },
  worldFeaturedHeroImageFrame: { width: "100%", height: 360, borderRadius: 24, marginTop: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dbeafe", overflow: "hidden" },
  worldFeaturedHeroImage: { width: "100%", height: 360, backgroundColor: "#ffffff" },
  childEntryRail: { gap: 10, paddingVertical: 4 },
  childSupportFlowGrid: { gap: 14, marginTop: 14 },
  childSupportFlowCard: { backgroundColor: "#ffffff", borderRadius: 28, padding: 28, borderWidth: 1, borderColor: "#fed7aa" },
  childSupportFlowCardWarm: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  childSupportFlowCardSupport: { backgroundColor: "#eff6ff", borderColor: "#93c5fd" },
  childSupportFlowImage: { width: "100%", height: 420, borderRadius: 20, marginTop: 12, backgroundColor: "#ffffff" },
  childSupportFlowTitle: { fontSize: 28, color: "#0f172a", fontWeight: "800", marginTop: 12 },
  childSupportFlowText: { fontSize: 18, color: "#475569", lineHeight: 26, marginTop: 10 },
  childEntryOptionCard: { width: 240, backgroundColor: "#eff6ff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  childEntryOptionCardCool: { backgroundColor: "#eff6ff", borderColor: "#93c5fd" },
  childEntryOptionCardFocus: { backgroundColor: "#eef2ff", borderColor: "#a5b4fc" },
  childEntryOptionCardWarm: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  childEntryOptionCardActive: { backgroundColor: "#dbeafe", borderColor: "#60a5fa" },
  currentStepPanelImage: { width: "100%", height: 260, marginTop: 12, marginBottom: 14 },
  childEntryOptionImage: { width: "100%", height: 150, borderRadius: 14, marginTop: 10, marginBottom: 10, backgroundColor: "#e2e8f0" },
  childEntryOptionMood: { fontSize: 14, color: "#475569", fontWeight: "800" },
  childEntryOptionTitle: { fontSize: 18, color: "#0f172a", fontWeight: "800" },
  childEntryOptionText: { fontSize: 15, color: "#475569", lineHeight: 22, marginTop: 8 },
  supportSceneImage: { width: "100%", height: 340, borderRadius: 18, marginBottom: 12, backgroundColor: "#ffffff" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  zoneHeader: { paddingHorizontal: 10, paddingVertical: 12, marginTop: 2, marginBottom: 2, backgroundColor: "#f8fafc", borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  zoneKicker: { alignSelf: "flex-start", fontSize: 11, fontWeight: "800", color: "#7c3aed", letterSpacing: 1, backgroundColor: "#ede9fe", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: "hidden" },
  zoneTitle: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginTop: 10 },
  zoneText: { fontSize: 16, color: "#64748b", marginTop: 8, lineHeight: 24 },
  guideButtonRow: { marginBottom: 10 },
  todaySummaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  todaySummaryCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" },
  todaySummaryKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 6 },
  todaySummaryLabel: { fontSize: 14, color: "#64748b", fontWeight: "700" },
  todaySummaryValue: { fontSize: 20, color: "#0f172a", fontWeight: "900", marginTop: 6, lineHeight: 24 },
  todaySummaryValueSmall: { fontSize: 15, color: "#0f172a", fontWeight: "800", marginTop: 6, lineHeight: 20 },
  todayToggle: { marginBottom: 10, backgroundColor: "#eef2ff", borderRadius: 16, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#c7d2fe" },
  todayToggleText: { fontSize: 13, color: "#4338ca", fontWeight: "800", letterSpacing: 0.3 },
  statBox: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  statBoxLabel: { fontSize: 14, color: "#64748b", fontWeight: "700" },
  statBoxValue: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  statBoxSmall: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 8, lineHeight: 24 },
  settleBox: { backgroundColor: "#eef2ff", borderRadius: 14, padding: 12, marginTop: 12 },
  settleTitle: { fontSize: 15, color: "#4338ca", fontWeight: "800" },
  settleText: { fontSize: 16, color: "#334155", lineHeight: 24, marginTop: 6 },
  observeBox: { backgroundColor: "#ffffff", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#cbd5e1" },
  observeTitle: { fontSize: 12, color: "#2563eb", fontWeight: "800" },
  observeText: { fontSize: 12, color: "#475569", marginTop: 6, lineHeight: 17 },
  reportBox: { backgroundColor: "#0f172a", borderRadius: 12, padding: 12, marginTop: 10 },
  reportTitle: { fontSize: 12, color: "#c4b5fd", fontWeight: "800" },
  reportLine: { fontSize: 12, color: "#e2e8f0", marginTop: 7, lineHeight: 17 },
  historyBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#cbd5e1" },
  historyTitle: { fontSize: 12, color: "#0f172a", fontWeight: "800" },
  historyEmpty: { fontSize: 12, color: "#64748b", marginTop: 8 },
  historyCard: { backgroundColor: "#ffffff", borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  historyCardTitle: { fontSize: 12, color: "#0f172a", fontWeight: "800", lineHeight: 17 },
  historyCardLine: { fontSize: 11, color: "#475569", marginTop: 5, lineHeight: 16 },
  historyActionRow: { marginTop: 10 },
  compareBox: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#bfdbfe" },
  compareTitle: { fontSize: 12, color: "#1d4ed8", fontWeight: "800" },
  compareCard: { backgroundColor: "#ffffff", borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "#dbeafe" },
  compareCardTitle: { fontSize: 12, color: "#0f172a", fontWeight: "800" },
  compareCardLine: { fontSize: 11, color: "#475569", marginTop: 5, lineHeight: 16 },
  compareRecommendationBox: { backgroundColor: "#1e293b", borderRadius: 10, padding: 10, marginTop: 10 },
  compareRecommendationLabel: { fontSize: 11, color: "#cbd5e1", fontWeight: "800" },
  compareRecommendationValue: { fontSize: 16, color: "#ffffff", fontWeight: "800", marginTop: 6 },
  compareRecommendationText: { fontSize: 12, color: "#e2e8f0", marginTop: 6, lineHeight: 17 },
  statsInsightBox: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#bfdbfe" },
  statsInsightTitle: { fontSize: 12, color: "#1d4ed8", fontWeight: "800" },
  statsInsightGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  statsInsightCard: { width: "48%", backgroundColor: "#ffffff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#dbeafe" },
  statsInsightLabel: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  statsInsightValue: { fontSize: 18, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  statsInsightValueSmall: { fontSize: 13, color: "#0f172a", fontWeight: "800", marginTop: 6, lineHeight: 18 },
  statsInsightNote: { fontSize: 12, color: "#334155", marginTop: 10, fontWeight: "700" },
  settleSummaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  settleSummaryCard: { width: "48%", backgroundColor: "#ffffff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#cbd5e1" },
  settleSummaryLabel: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  settleSummaryValue: { fontSize: 20, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  settleSubNote: { fontSize: 12, color: "#475569", marginTop: 10, lineHeight: 17, fontWeight: "700" },
  longTermBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#dbeafe" },
  longTermTitle: { fontSize: 12, color: "#2563eb", fontWeight: "800" },
  longTermGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  longTermCard: { width: "48%", backgroundColor: "#ffffff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#cbd5e1" },
  longTermLabel: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  longTermValue: { fontSize: 15, color: "#0f172a", fontWeight: "800", marginTop: 6, lineHeight: 20 },
  longTermNote: { fontSize: 11, color: "#475569", marginTop: 6, lineHeight: 16 },
  settleEventBox: { backgroundColor: "#ffffff", borderRadius: 12, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#cbd5e1" },
  settleEventLabel: { fontSize: 11, color: "#6366f1", fontWeight: "800" },
  settleEventTitle: { fontSize: 14, color: "#0f172a", fontWeight: "800", marginTop: 4 },
  settleEventText: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 4 },
  settleChecklistWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  settleChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: "#cbd5e1" },
  settleChipDone: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  settleChipText: { fontSize: 12, color: "#334155", fontWeight: "700" },
  settleChipTextDone: { color: "#166534" },
  settleProgress: { fontSize: 12, color: "#64748b", marginTop: 10, fontWeight: "700" },
  statLabel: { fontSize: 13, color: "#475569", marginTop: 10, marginBottom: 4 },
  progressTrack: { height: 10, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e2e8f0", alignSelf: "flex-start", borderWidth: 1, borderColor: "#cbd5e1" },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { fontSize: 14, color: "#334155", fontWeight: "700", letterSpacing: 0.2 },
  pillTextActive: { color: "#fff" },
  quickCard: { width: 360, backgroundColor: "#f8fafc", borderRadius: 24, padding: 18, marginRight: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  quickCardRecommended: { borderWidth: 1.5, borderColor: "#7c3aed", backgroundColor: "#f5f3ff", shadowColor: "#7c3aed", shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  quickCardImage: { width: "100%", height: 340, marginBottom: 12 },
  quickCardTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  quickCardText: { fontSize: 16, color: "#475569", lineHeight: 24 },
  quickCardHint: { fontSize: 14, color: "#64748b", marginTop: 8, lineHeight: 20 },
  challengeCard: {
    flexDirection: "column",
    gap: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  challengeCardActive: { borderColor: "#111827", backgroundColor: "#f8fafc" },
  challengeCardTapArea: { width: "100%", gap: 12 },
  challengeCardImage: { width: "100%", height: 360, borderRadius: 22, backgroundColor: "#ffffff" },
  challengeTitle: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  challengeSub: { fontSize: 20, color: "#475569", marginTop: 6 },
  challengeCue: { fontSize: 18, color: "#64748b", marginTop: 10, lineHeight: 28 },
  challengeUseHint: { fontSize: 14, color: "#7c3aed", marginTop: 8, fontWeight: "700", lineHeight: 20 },
  challengeTapHint: { fontSize: 15, color: "#334155", fontWeight: "700" },
  timerPanel: { borderRadius: 24, backgroundColor: "#eef6ff", padding: 22, marginTop: 10, borderWidth: 1, borderColor: "#bfdbfe", shadowColor: "#60a5fa", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  missionCompanionBar: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, backgroundColor: "#ffffff", borderRadius: 18, padding: 12, borderWidth: 1, borderColor: "#dbeafe" },
  missionSopCard: { marginTop: 8, backgroundColor: "#ffffff", borderRadius: 20, padding: 10, borderWidth: 1, borderColor: "#dbeafe", gap: 6 },
  missionSopKicker: { fontSize: 10, color: "#6366f1", fontWeight: "800", letterSpacing: 0.8, marginBottom: 2 },
  missionSopTitle: { fontSize: 20, color: "#0f172a", fontWeight: "800" },
  missionSopText: { fontSize: 15, color: "#334155", lineHeight: 22 },
  missionSopFlowLead: { fontSize: 12, color: "#64748b", lineHeight: 16, marginTop: 4, marginBottom: 8, fontWeight: "700" },
  missionSopShowcaseCard: { flexDirection: "row", gap: 10, backgroundColor: "#f8fafc", borderRadius: 18, borderWidth: 1, borderColor: "#dbeafe", padding: 10, alignItems: "stretch", marginTop: 4, marginBottom: 6 },
  missionSopShowcaseCardPhone: { flexDirection: "column" },
  missionSopShowcaseMediaColumn: { width: "42%", minWidth: 118, gap: 8 },
  missionSopShowcaseMediaColumnPhone: { width: "100%", minWidth: 0 },
  missionSopShowcaseMediaFrame: { flex: 1, minHeight: 320, backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden", alignItems: "center", justifyContent: "center", padding: 6 },
  missionSopShowcaseImage: { width: "100%", height: "100%", borderRadius: 10, backgroundColor: "#ffffff" },
  missionSopShowcaseContentColumn: { flex: 1, gap: 6 },
  missionSopShowcaseTitle: { fontSize: 16, color: "#0f172a", fontWeight: "800", lineHeight: 21 },
  missionSopShowcaseBody: { fontSize: 13, color: "#334155", lineHeight: 18 },
  missionSopShowcaseInfoCard: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 10, paddingVertical: 8, gap: 2 },
  missionSopShowcaseInfoLabel: { fontSize: 10, color: "#6366f1", fontWeight: "800", letterSpacing: 0.25 },
  missionSopShowcaseInfoText: { fontSize: 12, color: "#334155", lineHeight: 16, fontWeight: "700" },
  missionSopShowcaseTagRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  missionSopShowcaseTag: { backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: "#cbd5e1" },
  missionSopShowcaseTagActive: { backgroundColor: "#eef2ff", borderColor: "#818cf8" },
  missionSopShowcaseTagText: { fontSize: 10, color: "#475569", fontWeight: "800" },
  missionSopShowcaseTagTextActive: { color: "#4338ca" },
  missionSopStepperStack: { gap: 6, marginTop: 2 },
  missionSopStepperRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 0 },
  missionSopStepperButton: { flex: 1, minWidth: 0, backgroundColor: "#eef2ff", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#c7d2fe" },
  missionSopStepperButtonDisabled: { opacity: 0.45 },
  missionSopStepperButtonText: { fontSize: 12, color: "#3730a3", fontWeight: "800" },
  missionSopStepperButtonTextDisabled: { color: "#94a3b8" },
  missionSopStepperCenter: { flex: 1, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", paddingVertical: 10, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  missionSopStepperCenterText: { fontSize: 11, color: "#475569", fontWeight: "700", textAlign: "center" },
  missionSopSummaryRow: { flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: 3, marginBottom: 0 },
  missionSopSummaryChip: { flexGrow: 1, minWidth: "31%", backgroundColor: "#f8fafc", borderRadius: 11, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: "#e5e7eb" },
  missionSopSummaryChipCurrent: { backgroundColor: "#f5f7ff", borderColor: "#a5b4fc" },
  missionSopSummaryChipText: { fontSize: 9, color: "#94a3b8", fontWeight: "800", letterSpacing: 0.35, textTransform: "uppercase" },
  missionSopSummaryChipTextCurrent: { color: "#6366f1" },
  missionSopSummaryChipValue: { fontSize: 10, color: "#334155", fontWeight: "800", lineHeight: 14, marginTop: 1 },
  missionSopSummaryChipValueCurrent: { color: "#4338ca" },
  missionSopProgressTrack: { flexDirection: "row", alignItems: "stretch", height: 3, borderRadius: 999, overflow: "hidden", backgroundColor: "#e5e7eb", marginTop: 2, marginBottom: 1 },
  missionSopProgressFillDone: { backgroundColor: "#d1d5db" },
  missionSopProgressFillCurrent: { flex: 1, backgroundColor: "#818cf8" },
  missionSopProgressFillRemaining: { backgroundColor: "#e5e7eb" },
  missionSopProgressCaption: { fontSize: 8, color: "#94a3b8", lineHeight: 12, marginBottom: 0, fontWeight: "700" },
  missionSopFocusBox: { backgroundColor: "#ecfeff", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#a5f3fc", marginTop: 4 },
  missionSopFocusLabel: { fontSize: 12, color: "#0f766e", fontWeight: "800", letterSpacing: 0.4 },
  missionSopFocusText: { fontSize: 14, color: "#134e4a", lineHeight: 20, marginTop: 6 },
  missionSopFlowList: { gap: 6, paddingVertical: 0 },
  missionSopFlowCard: { flexDirection: "row", gap: 10, alignItems: "stretch", backgroundColor: "#fafafa", borderRadius: 14, paddingTop: 8, paddingRight: 8, paddingBottom: 8, paddingLeft: 10, borderWidth: 1, borderColor: "#e7e5e4", minHeight: 118 },
  missionSopFlowCardPhone: { flexDirection: "column" },
  missionSopFlowCardCurrent: { backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderWidth: 1.2, paddingLeft: 11 },
  missionSopFlowCardPast: { backgroundColor: "#fafafa", borderColor: "#e7e5e4" },
  missionSopFlowCardPrev: { borderColor: "#e2e8f0", backgroundColor: "#fafafa" },
  missionSopFlowCardNext: { borderColor: "#e2e8f0", backgroundColor: "#fbfbfb" },
  missionSopFlowCardSelected: { borderColor: "#818cf8", borderWidth: 1.5 },
  missionSopFlowCurrentRail: { position: "absolute", left: 0, top: 10, bottom: 10, width: 2, borderTopRightRadius: 3, borderBottomRightRadius: 3, backgroundColor: "#818cf8" },
  missionSopFlowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: -1 },
  missionSopFlowStep: { fontSize: 9, color: "#94a3b8", fontWeight: "800", letterSpacing: 0.2 },
  missionSopFlowStepCurrent: { color: "#818cf8" },
  missionSopFlowStepPrev: { color: "#94a3b8" },
  missionSopFlowStepNext: { color: "#818cf8" },
  missionSopFlowIndex: { fontSize: 9, color: "#cbd5e1", fontWeight: "700", letterSpacing: 0.25 },
  missionSopFlowIndexCurrent: { color: "#c4b5fd" },
  missionSopFlowImageWrap: { width: "100%", height: 42, borderRadius: 8, backgroundColor: "#fcfcfc", marginTop: 1, marginBottom: 1, padding: 3, borderWidth: 1, borderColor: "#f1f5f9", overflow: "hidden", opacity: 0.86 },
  missionSopFlowImage: { width: "100%", height: "100%", borderRadius: 6, backgroundColor: "#fcfcfc" },
  missionSopFlowThumbWrap: { width: 140, borderRadius: 12, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden", alignItems: "center", justifyContent: "center", padding: 5 },
  missionSopFlowThumbWrapPhone: { width: "100%" },
  missionSopFlowThumb: { width: "100%", height: 190, borderRadius: 10, backgroundColor: "#ffffff" },
  missionSopFlowMiniContent: { flex: 1 },
  missionSopFlowTitle: { fontSize: 12, color: "#0f172a", fontWeight: "700", marginTop: 1, lineHeight: 15 },
  missionSopFlowText: { fontSize: 11, color: "#475569", lineHeight: 15, marginTop: 2 },
  missionSopFlowInlineMeta: { fontSize: 9, color: "#6366f1", lineHeight: 13, marginTop: 3, fontWeight: "700" },
  missionSopActionRow: { gap: 8, marginTop: 8 },
  missionSopActionPrimary: { backgroundColor: "#111827", borderRadius: 15, paddingVertical: 11, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", minHeight: 44 },
  missionSopActionPrimaryText: { fontSize: 12, color: "#ffffff", fontWeight: "800" },
  missionSopActionSecondary: { backgroundColor: "#f8fafc", borderRadius: 15, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#cbd5e1", minHeight: 42 },
  missionSopActionSecondaryText: { fontSize: 12, color: "#334155", fontWeight: "800" },
  parentGuardianPanelCard: { backgroundColor: "#eef2ff", alignItems: "stretch", borderRadius: 24, borderWidth: 1.5, borderColor: "#c7d2fe", paddingTop: 16, paddingBottom: 16 },
  parentGuardianPanelKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  parentGuardianPanelImageWrap: { width: "100%", height: 340, borderRadius: 20, backgroundColor: "#ffffff", overflow: "hidden", marginTop: 6, marginBottom: 14 },
  parentGuardianPanelImage: { width: "100%", height: 360 },
  parentGuardianPanelTitle: { fontSize: 22, color: "#0f172a", fontWeight: "800", marginBottom: 8, textAlign: "center" },
  parentGuardianPanelMetaRow: { flexDirection: "row", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 },
  parentGuardianPanelMetaChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#c7d2fe" },
  parentGuardianPanelMetaChipText: { fontSize: 12, color: "#4338ca", fontWeight: "800" },
  parentGuardianPanelBody: { fontSize: 14, color: "#334155", lineHeight: 21, marginBottom: 8, textAlign: "left" },
  parentGuardianPanelActions: { flexDirection: "column", gap: 10, marginTop: 12 },
  readyGuardianCard: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12, backgroundColor: "#eef2ff", borderRadius: 24, padding: 16, borderWidth: 1.5, borderColor: "#c7d2fe", shadowColor: "#6366f1", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  readyGuardianImageFrame: { width: 124, height: 116, borderRadius: 20, backgroundColor: "#ffffff", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#dbeafe" },
  readyGuardianImage: { width: 124, height: 152, backgroundColor: "#ffffff" },
  readyGuardianContent: { flex: 1 },
  readyGuardianKicker: { fontSize: 12, color: "#4338ca", fontWeight: "800", letterSpacing: 0.6 },
  readyGuardianTitle: { fontSize: 20, color: "#0f172a", fontWeight: "800", marginTop: 4 },
  readyGuardianMetaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  readyGuardianMetaChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#c7d2fe" },
  readyGuardianMetaText: { fontSize: 12, color: "#4338ca", fontWeight: "800" },
  readyGuardianText: { fontSize: 14, lineHeight: 21, color: "#334155", marginTop: 6 },
  readyGuardianTapHint: { fontSize: 12, color: "#4338ca", fontWeight: "800", marginTop: 10 },
  missionActionRowTop: { marginTop: 12 },
  missionCompanionAvatarFrame: { width: 84, height: 84, borderRadius: 18, backgroundColor: "#ffffff", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#dbeafe" },
  missionCompanionAvatar: { width: 84, height: 104, backgroundColor: "#f8fafc" },
  missionCompanionContent: { flex: 1 },
  missionCompanionKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  missionCompanionName: { fontSize: 18, color: "#0f172a", fontWeight: "800" },
  missionCompanionMetaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  missionCompanionMetaChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#c7d2fe" },
  missionCompanionMetaText: { fontSize: 12, color: "#4338ca", fontWeight: "800" },
  missionCompanionText: { fontSize: 14, color: "#475569", lineHeight: 20, marginTop: 6 },
  missionCompanionSupportCard: { backgroundColor: "#eef2ff", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#c7d2fe", marginBottom: 10 },
  missionCompanionSupportKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  missionCompanionSupportTitle: { fontSize: 16, color: "#3730a3", fontWeight: "800" },
  missionCompanionSupportText: { fontSize: 14, color: "#4338ca", lineHeight: 20, marginTop: 6 },
  parentAssistKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  parentAssistSummaryCard: { backgroundColor: "#f8fafc", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 },
  parentAssistScenarioCard: { borderColor: "#c7d2fe" },
  parentAssistDetailCard: { backgroundColor: "#f8fafc", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  parentAssistInnerCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 12, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  parentAssistActionCard: { marginBottom: 0, borderColor: "#c7d2fe", backgroundColor: "#eef2ff" },
  selectedChallengeImage: { width: "100%", height: 420, marginBottom: 14, borderRadius: 22, backgroundColor: "#ffffff" },
  timerMission: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  timerNote: { fontSize: 18, color: "#64748b", marginTop: 6, marginBottom: 16 },
  timerValue: { fontSize: 42, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 16, alignItems: "stretch" },
  primaryButton: { flex: 1, backgroundColor: "#111827", borderRadius: 22, paddingVertical: 18, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", shadowColor: "#111827", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  buttonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  secondaryButton: { flex: 1, backgroundColor: "#eef2ff", borderRadius: 22, paddingVertical: 17, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#c7d2fe" },
  secondaryButtonText: { color: "#3730a3", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  stepRail: { gap: 14 },
  stepCard: { backgroundColor: "#f8fafc", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  stepCardImage: { width: "100%", height: 360, marginBottom: 12 },
  stepCardActive: { borderWidth: 2, borderColor: "#6366f1", backgroundColor: "#eef2ff", shadowColor: "#6366f1", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  stepCardPast: { opacity: 0.5, backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" },
  stepCardRecommended: { borderWidth: 1.5, borderColor: "#c4b5fd" },
  stepIndex: { fontSize: 14, color: "#64748b", fontWeight: "800" },
  stepTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginTop: 6 },
  stepText: { fontSize: 16, color: "#475569", marginTop: 8, lineHeight: 24 },
  minorHint: { fontSize: 14, color: "#94a3b8", marginTop: 12, lineHeight: 22, fontWeight: "600" },
  supportReturnCard: { backgroundColor: "#eef2ff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#c7d2fe" },
  supportReturnKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  supportReturnSummaryRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10, marginBottom: 12 },
  supportReturnChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#c7d2fe" },
  supportReturnChipText: { fontSize: 12, color: "#4338ca", fontWeight: "800" },
  exceptionButtonGrid: { gap: 10 },
  exceptionButton: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#0f172a", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  exceptionButtonTitle: { fontSize: 15, color: "#0f172a", fontWeight: "800", letterSpacing: 0.2 },
  exceptionButtonText: { fontSize: 12, color: "#475569", lineHeight: 17, marginTop: 6 },
  skillCard: { width: 320, backgroundColor: "#f8fafc", borderRadius: 22, padding: 18, marginRight: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  skillCardImage: { width: "100%", height: 210, marginBottom: 10 },
  skillCardUsed: { opacity: 0.45 },
  skillLevel: { fontSize: 12, color: "#7c3aed", fontWeight: "800" },
  skillTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginTop: 6, letterSpacing: 0.2 },
  skillText: { fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 18 },
  skillHint: { fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 16 },
  skillFoot: { fontSize: 12, color: "#64748b", marginTop: 10, fontWeight: "700" },
  listCard: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 12, marginBottom: 10 },
  listCardRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  listCardImage: { width: 94, height: 94, borderRadius: 12 },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  listText: { fontSize: 13, color: "#334155", marginTop: 4 },
  listHint: { fontSize: 12, color: "#64748b", marginTop: 6 },
  weeklyHeroCard: { flexDirection: "row", gap: 16, backgroundColor: "#eff6ff", borderRadius: 24, padding: 22 },
  weeklyHeroKicker: { fontSize: 14, color: "#2563eb", fontWeight: "800", letterSpacing: 1 },
  weeklyHeroName: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginTop: 6 },
  weeklyHeroRole: { fontSize: 16, color: "#475569", marginTop: 6, lineHeight: 22 },
  weeklyHeroText: { fontSize: 16, color: "#334155", lineHeight: 24, marginTop: 12 },
  weeklyHeroMeta: { width: 108, backgroundColor: "#dbeafe", borderRadius: 20, padding: 16, alignItems: "center", justifyContent: "center" },
  weeklyHeroMetaLabel: { fontSize: 13, color: "#1d4ed8", fontWeight: "700" },
  weeklyHeroMetaValue: { fontSize: 22, color: "#0f172a", fontWeight: "800", marginTop: 4 },
  heroEconomyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12, marginBottom: 12 },
  heroEconomyCard: { width: "31%", backgroundColor: "#f8fafc", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#dbeafe" },
  heroEconomyLabel: { fontSize: 11, color: "#2563eb", fontWeight: "800" },
  heroEconomyValue: { fontSize: 22, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  heroEconomyHint: { fontSize: 11, color: "#64748b", lineHeight: 15, marginTop: 6 },
  heroEconomyProgressText: { fontSize: 10, color: "#64748b", fontWeight: "700", marginTop: 6 },
  weeklySummaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  weeklySummaryCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" },
  weeklySummaryKicker: { fontSize: 11, color: "#4338ca", fontWeight: "800", letterSpacing: 0.8, marginBottom: 6 },
  weeklySummaryLabel: { fontSize: 14, color: "#64748b", fontWeight: "700" },
  weeklySummaryValue: { fontSize: 16, color: "#0f172a", fontWeight: "900", marginTop: 6, lineHeight: 20 },
  weeklyToggle: { marginTop: 12, backgroundColor: "#eef2ff", borderRadius: 16, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#c7d2fe" },
  weeklyToggleText: { fontSize: 13, color: "#4338ca", fontWeight: "800", letterSpacing: 0.3 },
  codexCard: { width: 380, backgroundColor: "#f8fafc", borderRadius: 28, padding: 24, marginRight: 18, borderWidth: 1.5, borderColor: "#e2e8f0" },
  codexCardActive: { borderWidth: 1.5, borderColor: "#111827", backgroundColor: "#eff6ff" },
  codexHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  codexTag: { fontSize: 15, fontWeight: "800", color: "#7c3aed" },
  codexFamily: { fontSize: 13, fontWeight: "800", color: "#64748b", letterSpacing: 1 },
  codexArtBox: { backgroundColor: "#ffffff", borderRadius: 20, paddingVertical: 18, paddingHorizontal: 14, marginTop: 12, alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0" },
  codexArtImage: { width: 220, height: 264, marginBottom: 12 },
  codexArtEmoji: { fontSize: 24, marginBottom: 6 },
  codexArtName: { fontSize: 20, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  codexTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginTop: 8 },
  codexNumber: { fontSize: 13, color: "#64748b", fontWeight: "800", letterSpacing: 1, marginTop: 12 },
  codexRole: { fontSize: 16, color: "#475569", marginTop: 8, lineHeight: 24 },
  codexText: { fontSize: 16, color: "#64748b", lineHeight: 24, marginTop: 10 },
  codexFoot: { fontSize: 14, color: "#94a3b8", marginTop: 12 },
  heroShowcaseCard: { backgroundColor: "#0f172a", borderRadius: 28, padding: 24, marginBottom: 18, borderWidth: 2, gap: 18, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  heroShowcaseImage: { width: "100%", height: 300, borderRadius: 22, backgroundColor: "#111827" },
  heroShowcaseBody: { gap: 10 },
  heroShowcaseTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  heroShowcaseKicker: { fontSize: 14, color: "#fbbf24", fontWeight: "800", letterSpacing: 0.6 },
  heroShowcaseTitle: { fontSize: 26, color: "#ffffff", fontWeight: "900", marginTop: 6 },
  heroShowcaseNumber: { fontSize: 13, color: "#94a3b8", fontWeight: "800", letterSpacing: 1, marginTop: 8 },
  heroShowcaseSubtitle: { fontSize: 17, color: "#cbd5e1", lineHeight: 24 },
  heroShowcaseRarityChip: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(15,23,42,0.45)" },
  heroShowcaseRarityText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  heroShowcaseStatRow: { flexDirection: "row", gap: 10 },
  heroShowcaseStatBox: { flex: 1, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", padding: 16 },
  heroShowcaseStatLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "700" },
  heroShowcaseStatValue: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6 },
  heroShowcaseMeta: { fontSize: 16, color: "#cbd5e1", lineHeight: 24 },
  guardianCatalogSummaryGrid: { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 12 },
  guardianCatalogStatCard: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  guardianCatalogStatLabel: { fontSize: 13, color: "#64748b", fontWeight: "700" },
  guardianCatalogStatValue: { fontSize: 22, color: "#0f172a", fontWeight: "800", marginTop: 6 },
  teamSectionHeader: { marginTop: 6, marginBottom: 10 },
  teamSectionKicker: { fontSize: 14, color: "#7c3aed", fontWeight: "800", letterSpacing: 0.6 },
  teamSectionTitle: { fontSize: 16, color: "#0f172a", fontWeight: "800", marginTop: 4 },
  teamSectionText: { fontSize: 15, color: "#64748b", lineHeight: 22, marginTop: 6 },
  guardianShowcaseCard: { flexDirection: "row", gap: 18, backgroundColor: "#111827", borderRadius: 26, padding: 24, marginBottom: 16, alignItems: "center", borderWidth: 1.5 },
  guardianShowcaseImageFrame: { width: 170, height: 246, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  guardianShowcaseImage: { width: 170, height: 246, backgroundColor: "#0f172a" },
  guardianShowcaseBody: { flex: 1 },
  guardianShowcaseKicker: { fontSize: 14, color: "#fbbf24", fontWeight: "800", letterSpacing: 0.6 },
  guardianShowcaseTitle: { fontSize: 28, color: "#ffffff", fontWeight: "800", marginTop: 8 },
  guardianShowcaseChipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 },
  guardianShowcaseChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  guardianShowcaseChipText: { fontSize: 12, color: "#f8fafc", fontWeight: "800" },
  guardianShowcaseText: { fontSize: 18, color: "#cbd5e1", marginTop: 10, lineHeight: 26 },
  guardianShowcaseMeta: { fontSize: 16, color: "#94a3b8", marginTop: 10, lineHeight: 24 },
  guardianShowcaseBadge: { borderRadius: 999, backgroundColor: "#1f2937", paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "#374151" },
  guardianShowcaseBadgeText: { fontSize: 14, color: "#f8fafc", fontWeight: "800" },
  guardianHeroCard: { backgroundColor: "#0f172a", borderRadius: 40, padding: 40, marginBottom: 28, borderWidth: 2, gap: 28, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  guardianHeroImage: { width: "100%", height: 420, borderRadius: 26, backgroundColor: "#111827" },
  guardianHeroBody: { gap: 10 },
  guardianHeroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  guardianHeroKicker: { fontSize: 14, color: "#fbbf24", fontWeight: "800", letterSpacing: 0.6 },
  guardianHeroTitle: { fontSize: 34, color: "#ffffff", fontWeight: "900", marginTop: 8 },
  guardianHeroNumber: { fontSize: 13, color: "#94a3b8", fontWeight: "800", letterSpacing: 1, marginTop: 8 },
  guardianHeroSubtitle: { fontSize: 18, color: "#cbd5e1", lineHeight: 26 },
  guardianHeroRarityChip: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(15,23,42,0.45)" },
  guardianHeroRarityText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  guardianHeroStatRow: { flexDirection: "row", gap: 10 },
  guardianHeroStatBox: { flex: 1, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", padding: 16 },
  guardianHeroStatLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "700" },
  guardianHeroStatValue: { fontSize: 18, color: "#ffffff", fontWeight: "800", marginTop: 6 },
  guardianHeroMetaStack: { gap: 8 },
  guardianHeroMetaCard: { borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  guardianHeroMetaCardTone: { backgroundColor: "rgba(29,78,216,0.14)", borderColor: "rgba(147,197,253,0.22)" },
  guardianHeroMetaCardWarm: { backgroundColor: "rgba(180,83,9,0.16)", borderColor: "rgba(251,191,36,0.22)" },
  coreGuardianChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, marginBottom: 10 },
  coreGuardianChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  coreGuardianChipText: { fontSize: 11, color: "#e2e8f0", fontWeight: "800" },
  coreGuardianNextStepBox: { borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  coreGuardianNextStepKicker: { fontSize: 11, color: "#fcd34d", fontWeight: "800", letterSpacing: 0.4 },
  coreGuardianNextStepText: { fontSize: 12, color: "#e2e8f0", lineHeight: 18, marginTop: 6 },
  coreGuardianProgressBlock: { marginBottom: 10 },
  coreGuardianProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  coreGuardianProgressLabel: { fontSize: 11, color: "#cbd5e1", fontWeight: "800" },
  coreGuardianProgressValue: { fontSize: 11, color: "#f8fafc", fontWeight: "800" },
  coreGuardianProgressTrack: { height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  coreGuardianProgressFill: { height: "100%", borderRadius: 999, backgroundColor: "#22c55e" },
  coreGuardianStageFill: { height: "100%", borderRadius: 999, backgroundColor: "#a78bfa" },
  guardianHeroMeta: { fontSize: 13, color: "#cbd5e1", lineHeight: 19 },
  guardianDexCard: { width: 320, backgroundColor: "#f8fafc", borderRadius: 24, padding: 20, marginRight: 14, borderWidth: 1.5, borderColor: "#e2e8f0" },
  guardianDexCardActive: { borderWidth: 2, borderColor: "#111827", backgroundColor: "#eff6ff" },
  guardianDexCardLocked: { opacity: 0.82, backgroundColor: "#f1f5f9" },
  guardianDexTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  guardianDexRarity: { fontSize: 15, color: "#7c3aed", fontWeight: "800", letterSpacing: 0.6 },
  guardianDexShowcaseFlag: { fontSize: 13, color: "#f59e0b", fontWeight: "900", letterSpacing: 0.8 },
  guardianDexArtBox: { borderRadius: 20, backgroundColor: "#ffffff", paddingVertical: 22, paddingHorizontal: 16, alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  guardianDexArtBoxLocked: { backgroundColor: "#e2e8f0", borderColor: "#cbd5e1" },
  guardianDexArtImage: { width: 220, height: 294 },
  guardianDexArtGlyph: { fontSize: 34 },
  guardianDexArtGlyphLocked: { opacity: 0.65 },
  guardianDexArtImageLocked: { opacity: 0.28 },
  guardianDexArtName: { fontSize: 20, color: "#0f172a", fontWeight: "800", marginTop: 12, textAlign: "center" },
  guardianDexArtNameLocked: { color: "#475569" },
  guardianDexNumber: { fontSize: 13, color: "#64748b", fontWeight: "800", letterSpacing: 1, marginTop: 12 },
  guardianDexTitle: { fontSize: 18, color: "#334155", fontWeight: "800", marginTop: 8, lineHeight: 24 },
  guardianDexStatus: { fontSize: 16, color: "#2563eb", fontWeight: "800", marginTop: 8 },
  guardianDexMeta: { fontSize: 14, color: "#64748b", lineHeight: 22, marginTop: 8 },
  guardianDexChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  guardianDexChip: { borderRadius: 999, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 9 },
  guardianDexChipText: { fontSize: 15, color: "#475569", fontWeight: "800", letterSpacing: 0.3 },
  guardianCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 18, backgroundColor: "#f8fafc", marginBottom: 10, borderWidth: 1.5 },
  guardianProgressImage: { width: 82, height: 116, borderRadius: 12, backgroundColor: "#ffffff" },
  guardianCardActive: { borderWidth: 1.5, borderColor: "#111827" },
  guardianTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  guardianVibe: { fontSize: 13, color: "#475569", marginTop: 4 },
  stageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  stageChip: { backgroundColor: "#e2e8f0", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 },
  stageChipUnlocked: { backgroundColor: "#dcfce7" },
  stageText: { fontSize: 11, color: "#334155", fontWeight: "700" },
  stageTextUnlocked: { color: "#166534" },
  guardianProgressText: { fontSize: 12, color: "#64748b", marginTop: 10, fontWeight: "600" },
  eventPreviewCard: { width: 300, backgroundColor: "#f8fafc", borderRadius: 22, padding: 18, marginRight: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  eventPreviewTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventPreviewType: { fontSize: 11, fontWeight: "800", color: "#7c3aed" },
  eventPreviewGlyph: { fontSize: 18 },
  eventPreviewImage: { width: '100%', height: 120, marginTop: 8, marginBottom: 6 },
  eventPreviewTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginTop: 6 },
  eventPreviewText: { fontSize: 13, color: "#475569", lineHeight: 18, marginTop: 8 },
  eventPreviewReward: { fontSize: 12, color: "#4338ca", fontWeight: "700", marginTop: 10 },
  badgeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeCardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  badgeCard: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  badgeCardCollected: { backgroundColor: "#ecfccb", borderColor: "#bbf7d0" },
  badgeCardEmoji: { fontSize: 20, marginBottom: 8 },
  badgeImage: { width: '100%', height: 96, marginBottom: 8 },
  badgeChip: { backgroundColor: "#f8fafc", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  badgeChipCollected: { backgroundColor: "#dcfce7" },
  badgeText: { fontSize: 12, color: "#334155", fontWeight: "700" },
  badgeTextCollected: { color: "#166534" },
  badgeRoleText: { fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 16 },
  energyWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  energyCard: { width: "18%", minWidth: 62, backgroundColor: "#eff6ff", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  energyCardBoost: { backgroundColor: "#ede9fe" },
  energyValue: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  energyKind: { fontSize: 11, color: "#64748b", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.35)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxHeight: "88%", backgroundColor: "#fff", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#0f172a", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  modalScrollArea: { flexGrow: 0 },
  modalScrollContent: { paddingBottom: 4 },
  modalGuideImage: { width: "100%", height: 180, borderRadius: 16, backgroundColor: "#f8fafc", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 10, lineHeight: 26 },
  modalText: { fontSize: 14, color: "#475569", lineHeight: 21, marginBottom: 14 },
  choiceGrid: { gap: 10, marginBottom: 14 },
  choiceCard: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 18, padding: 16, backgroundColor: "#f8fafc" },
  choiceCardActive: { borderColor: "#7c3aed", backgroundColor: "#f5f3ff", borderWidth: 2, shadowColor: "#7c3aed", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  choiceCardTitle: { fontSize: 16, color: "#0f172a", fontWeight: "800", letterSpacing: 0.2 },
  choiceCardHint: { fontSize: 12, color: "#64748b", lineHeight: 18, marginTop: 6 },
  creationPreviewImageWrap: { width: "100%", borderRadius: 20, backgroundColor: "#f8fafc", overflow: "hidden", marginBottom: 14, borderWidth: 1, borderColor: "#dbeafe", padding: 8, alignItems: "center", justifyContent: "center", minHeight: 240 },
  creationPreviewImage: { width: "100%", height: "100%", backgroundColor: "#f8fafc" },
  creationPreviewName: { fontSize: 20, color: "#0f172a", fontWeight: "800", marginBottom: 8, textAlign: "center" },
  creationPreviewLead: { fontSize: 14, color: "#475569", lineHeight: 20, marginBottom: 12, textAlign: "center" },
  coreGuardianCreationKicker: { fontSize: 11, color: "#7c3aed", fontWeight: "800", letterSpacing: 1, marginBottom: 6, textAlign: "center" },
  coreGuardianCreationInfoCard: { backgroundColor: "#f8fafc", marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  coreGuardianCreationInfoCardWarm: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  coreGuardianCreationInfoCardCool: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  coreGuardianCreationInfoTitle: { fontSize: 16, color: "#0f172a", fontWeight: "800", marginBottom: 6 },
  coreGuardianCreationInfoText: { fontSize: 14, color: "#475569", lineHeight: 20, marginTop: 2 },
  coreGuardianBirthBox: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 14 },
  coreGuardianBirthKicker: { fontSize: 11, color: "#7c3aed", fontWeight: "800", letterSpacing: 0.5 },
  coreGuardianBirthText: { fontSize: 13, color: "#334155", lineHeight: 19, marginTop: 8 },
  modalChips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  modalChip: { backgroundColor: "#f8fafc", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  modalChipActive: { backgroundColor: "#ede9fe", borderColor: "#8b5cf6" },
  modalChipText: { fontSize: 13, color: "#334155", fontWeight: "700" },
  modalChipTextActive: { color: "#5b21b6" },
  eventModalKicker: { fontSize: 11, color: "#7c3aed", fontWeight: "800", letterSpacing: 1, marginBottom: 6, textAlign: "center" },
  eventModalImageFrame: { width: "100%", height: 236, borderRadius: 20, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#dbeafe", overflow: "hidden", marginBottom: 14 },
  eventModalImage: { width: "100%", height: 236, backgroundColor: "#f8fafc" },
  eventTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8, textAlign: "center" },
  eventDesc: { fontSize: 14, color: "#475569", lineHeight: 20, marginBottom: 12, textAlign: "center" },
  eventRewardChip: { alignSelf: "center", backgroundColor: "#eef2ff", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#c7d2fe", marginBottom: 16 },
  eventReward: { fontSize: 14, fontWeight: "800", color: "#4338ca" },
  eventSettleHint: { fontSize: 12, color: "#64748b", lineHeight: 18, marginBottom: 16 },
});
