import type { ImageSourcePropType } from "react-native";

export type TimeChallenge = {
  id: string;
  name: string;
  minutes: number;
  orbs: number;
  tier: string;
  cue: string;
  whenToUse?: string;
  parentHint?: string;
  imageSource?: ImageSourcePropType;
  untimed?: boolean;
};

export type HeroCard = {
  id: string;
  name: string;
  rarity: string;
  kind: "support" | "ascend";
  role: string;
  power: string;
  imageSource?: ImageSourcePropType;
};

export type WeeklyHeroState = {
  heroId: string;
  daysLeft: number;
  usesLeft: number;
  summonedAtDay: number;
  retired?: boolean;
};

export type HeroRule = {
  skillName: string;
  detail: string;
  baseUses: number;
  supportMinutes?: number;
  triggerType?: "focus" | "calm" | "finish" | "restart" | "structure" | "completion-bonus" | "upgrade-window";
};

export type ToolCardInventoryState = {
  owned: number;
  craftedTotal: number;
  spentForSummon: number;
  craftCostOrbs: number;
  summonCostTools: number;
};

export type HeroCollectionRecord = {
  heroId: string;
  unlocked: boolean;
  summonCount: number;
  lastSummonedAtDay?: number;
  lastExpiredAtDay?: number;
};

export type GuardianProgressState = {
  beastId: string;
  orbs: number;
};

export type GuardianCatalogStatus = "unknown" | "defeated" | "captured";

export type GuardianCatalogRecord = {
  beastId: string;
  status: GuardianCatalogStatus;
  defeatedCount: number;
  capturedAtDay?: number;
  sourceEventTitle?: string;
  sourceEventFamily?: EventCard["family"];
  sourceEventReward?: string;
  title: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  showcase: boolean;
  companion: boolean;
};

export type CoreGuardianStatus = "empty" | "provisional" | "bonded";
export type UiMode = "child" | "parent";
export type CoreGuardianPersonality = "brave" | "gentle" | "steady" | "spark";
export type CoreGuardianElement = "water" | "fire" | "forest" | "starlight";
export type CoreGuardianColor = "blue" | "red" | "green" | "gold";
export type CoreGuardianArchetype = "stable" | "explore" | "soothe" | "action" | "focus" | "reconnect";
export type CoreGuardianStateVariant = "companion" | "standard" | "forward";
export type CoreGuardianQuizQuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7";

export type BadgeState = {
  id: string;
  title: string;
  collected: boolean;
  role: string;
  imageSource?: ImageSourcePropType;
};

export type GuardianBeast = {
  id: string;
  name: string;
  vibe: string;
  challengeCost: number;
  stages: { label: string; cost: number }[];
  complete?: boolean;
  imageSource?: ImageSourcePropType;
};

export type EventCard = {
  id: string;
  title: string;
  type: "energy" | "trace" | "path" | "ritual" | "recovery";
  family: "bonus" | "trace" | "surprise" | "future" | "recovery" | "meta";
  desc: string;
  reward: string;
  imageSource?: ImageSourcePropType;
  effect?: {
    bonusOrbs?: number;
    guardianTraces?: number;
    guardianChallengeTokens?: number;
    extraMission?: number;
    emotionPower?: number;
    focusPower?: number;
  };
};

export type ToolCard = {
  id: string;
  title: string;
  family: "support" | "active" | "transition" | "sop";
  level?: string;
  childLine: string;
  parentHint: string;
  imageSource?: ImageSourcePropType;
  sourceDriveId?: string;
};

export type PendingTimedAction = {
  kind: "tool" | "pause-mission";
  toolId?: ToolCard["id"];
  label: string;
  options: number[];
};

export type EnergyCard = {
  label: string;
  amount: number;
  kind: "daily" | "boost";
};

export type MissionPhase = "ready" | "challenge" | "sop" | "settle";

export type MissionLedgerSnapshot = {
  orbs: number;
  bonusOrbs: number;
  guardianTraces: number;
  guardianChallengeTokens: number;
  worldEventsDrawnToday: number;
  totalMissionClears: number;
  selectedGuardianOrbs: number;
  weeklyHeroUsesLeft: number;
  collectedBadgeCount: number;
  heroUpgradeLevel: number;
  extraTimeRequestsToday: number;
  breakCountToday: number;
  restartCountToday: number;
};

export type MissionOutcome = "smooth" | "rescued" | "stopped";

export type MissionHistoryEntry = {
  id: string;
  challengeName: string;
  outcome: MissionOutcome;
  blockedStep: string | null;
  rescueTool: string | null;
  orbDelta: number;
  bonusDelta: number;
  branchSummary: string;
  advice: string;
  preset: RulePreset;
  environment: SessionEnvironment;
};

export type RulePreset = "conservative" | "balanced" | "relaxed" | "challenge";

export type SupportAssistScenario = "start" | "emotion" | "stuck" | "restart" | "encourage" | "pause";
export type SupportAssistVariant =
  | "start_low_energy"
  | "start_not_ready"
  | "start_avoidance"
  | "emotion_overloaded"
  | "emotion_opposed"
  | "emotion_hurt"
  | "stuck_lost_focus"
  | "stuck_no_next_step"
  | "stuck_perfection_freeze";
export type ParentAssistResultTag = "smooth" | "rescued" | "stopped";

export type ParentAssistLog = {
  day: number;
  scenario: SupportAssistScenario;
  variant?: SupportAssistVariant | null;
  missionPhase: MissionPhase;
  tag: string;
  resultTag?: ParentAssistResultTag | null;
};

export type ParentAssistArchive = {
  id: string;
  archivedAtDay: number;
  label: string;
  logs: ParentAssistLog[];
};

export type SupportReminderMode = "screen-sound" | "screen-only" | "silent";

export type SupportGuide = {
  purpose: string;
  situations: string[];
  parentLine: string;
  minutes: string;
  returnHint: string;
};

export type CardGuideModalState = {
  title: string;
  purpose: string;
  situations: string[];
  parentLine: string;
  minutes: string;
  returnHint: string;
  imageSource?: ImageSourcePropType;
  avoidLine?: string;
  actionLabel?: string;
  actionKind?: "select-challenge" | "use-transition" | "use-active-skill" | "focus-sop" | "select-hero" | "select-guardian" | "open-parent-assist" | "draw-world-event" | "check-upgrade" | "expand-daily" | "expand-weekly";
  actionTargetId?: string;
};

export type RuleConfigLogEntry = {
  id: string;
  preset: RulePreset;
  dailyMissionCap: number;
  worldEventCap: number;
  exceptionCap: number;
  stage2UnlockDays: number;
};

export type ScenarioKind = "normal" | "extra-time" | "break" | "restart" | "event";

export type RuleConfigSnapshot = {
  preset: RulePreset;
  baselinePreset: RulePreset;
  dailyMissionCap: number;
  worldEventCap: number;
  exceptionCap: number;
  stage2UnlockDays: number;
};

export type TestingScenarioSnapshot = {
  id: string;
  name: string;
  kind: ScenarioKind;
  note: string;
  challengeId: string;
  selectedHeroId: string;
  selectedBeastId: string;
  taskPower: number;
  emotionPower: number;
  focusPower: number;
  orbs: number;
  bonusOrbs: number;
  guardianTraces: number;
  guardianChallengeTokens: number;
  missionsDoneToday: number;
  worldEventsDrawnToday: number;
  extraTimeRequestsToday: number;
  breakCountToday: number;
  restartCountToday: number;
  totalMissionClears: number;
  daysInSystem: number;
  stage2Unlocked: boolean;
  nextWorldEventId: string | null;
  ruleConfig: RuleConfigSnapshot;
};

export type ExperimentRun = {
  id: string;
  scenarioName: string;
  note: string;
  preset: RulePreset;
  baselinePreset: RulePreset;
  outcome: MissionOutcome;
  challengeName: string;
  blockedStep: string | null;
  rescueTool: string | null;
  extraTimeUsed: number;
  breakUsed: number;
  restartUsed: number;
  orbDelta: number;
  bonusDelta: number;
  comparedToBaseline: string;
  actionLabel: string;
  fingerprint: string;
  scenarioKind: ScenarioKind;
  forcedEventTitle: string | null;
  reproducibilityScore: number;
  environment: SessionEnvironment;
};

export type ScenarioBaselineRecord = {
  id: string;
  label: string;
  scenarioId: string;
  fingerprint: string;
  preset: RulePreset;
  scenarioKind: ScenarioKind;
  note: string;
  source: "template" | "saved" | "run";
};

export type SessionEnvironment = "simulated" | "real";

export type AssistLevel = "verbal" | "co-regulation" | "environment" | "physical";

export type InterruptionKind = "transition-resistance" | "sensory" | "bathroom" | "food" | "sibling" | "device" | "other";

export type RealSessionStatus = "live" | "completed" | "stopped";

export type RealWorkflowStage = "prep" | "entry" | "main" | "recovery" | "packup";

export type RealSessionReviewFilter = "today" | "live" | "completed" | "stopped" | "all";

export type RealSessionEvent = {
  id: string;
  kind: "assist" | "interruption" | "note" | "outcome";
  title: string;
  detail: string;
  impact?: string;
  createdAtLabel: string;
};

export type RealTestSession = {
  id: string;
  environment: SessionEnvironment;
  status: RealSessionStatus;
  operatorName: string;
  operatorRole: string;
  childName: string;
  childContext: string;
  location: string;
  missionGoal: string;
  challengeId: string;
  challengeName: string;
  preset: RulePreset;
  startedAtLabel: string;
  startedAtIso: string;
  startedDayKey: string;
  endedAtLabel: string | null;
  endedAtIso: string | null;
  sessionNote: string;
  outcome: MissionOutcome | null;
  interruptionCount: number;
  assistCount: number;
  events: RealSessionEvent[];
  nextAction: string;
};

export type PersistedAppState = {
  uiMode?: UiMode;
  hasChosenInitialMode?: boolean;
  childName: string;
  selectedChallengeId: string;
  selectedHeroId: string;
  selectedBeastId: string;
  hasCoreGuardian: boolean;
  coreGuardianStatus: CoreGuardianStatus;
  coreGuardianId: string | null;
  coreGuardianName: string;
  coreGuardianLine: string;
  coreGuardianPersonalityChoice: CoreGuardianPersonality | null;
  coreGuardianElementChoice: CoreGuardianElement | null;
  coreGuardianColorChoice: CoreGuardianColor | null;
  coreGuardianArchetype?: CoreGuardianArchetype | null;
  coreGuardianStateVariant?: CoreGuardianStateVariant | null;
  coreGuardianLevel: number;
  coreGuardianWeeklyFeed: number;
  coreGuardianWeeklyFeedTarget: number;
  coreGuardianTotalFeed: number;
  coreGuardianWeekIndex: number;
  coreGuardianWeeklyCompletedCount: number;
  coreGuardianReselectsUsed: number;
  coreGuardianCreatedAtDay?: number;
  coreGuardianBondedAtLevel?: number;
  sessionEnvironment: SessionEnvironment;
  operatorName: string;
  operatorRole: string;
  childContext: string;
  sessionLocation: string;
  realMissionGoal: string;
  realSessionNoteDraft: string;
  assistLevelDraft: AssistLevel;
  assistNoteDraft: string;
  interruptionKindDraft: InterruptionKind;
  interruptionNoteDraft: string;
  nextActionDraft: string;
  realSessions: RealTestSession[];
  activeRealSessionId: string | null;
  parentAssistLogs?: ParentAssistLog[];
  parentAssistArchives?: ParentAssistArchive[];
  parentReviewWindowDays?: 7 | 14 | 30;
  savedScenarios: TestingScenarioSnapshot[];
  baselineLibrary: ScenarioBaselineRecord[];
  selectedBaselineId: string | null;
  activeScenarioId: string | null;
  scenarioNameDraft: string;
  scenarioNoteDraft: string;
  scenarioOperatorNote: string;
  missionHistory: MissionHistoryEntry[];
  experimentRuns: ExperimentRun[];
  missionPhase: MissionPhase;
  running: boolean;
  taskPower: number;
  emotionPower: number;
  focusPower: number;
  orbs: number;
  bonusOrbs: number;
  guardianTraces: number;
  guardianChallengeTokens: number;
  guardianEncounterOpenedAtDay: number | null;
  guardianEncounterExpiresAtDay: number | null;
  guardianEncounterSourceTitle: string | null;
  guardianEncounterSourceFamily: EventCard["family"] | null;
  missionsDoneToday: number;
  worldEventsDrawnToday: number;
  extraTimeRequestsToday: number;
  breakCountToday: number;
  restartCountToday: number;
  daysInSystem: number;
  totalMissionClears: number;
  stage2Unlocked: boolean;
  collectedBadges: Record<string, BadgeState>;
  heroCollection: Record<string, HeroCollectionRecord>;
  toolCardInventory: ToolCardInventoryState;
  weeklyHero: WeeklyHeroState;
  heroUpgradeLevel: number;
  guardianProgress: Record<string, GuardianProgressState>;
  guardianCatalog: Record<string, GuardianCatalogRecord>;
  activePreset: RulePreset;
  baselinePreset: RulePreset;
  dailyMissionCap: number;
  worldEventCap: number;
  exceptionCap: number;
  stage2UnlockDays: number;
  nextWorldEventId: string | null;
};
