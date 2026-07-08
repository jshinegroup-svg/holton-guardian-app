import type { ImageSourcePropType } from "react-native";

import type {
  CoreGuardianArchetype,
  CoreGuardianQuizQuestionId,
  CoreGuardianStateVariant,
  EnergyCard,
  EventCard,
  GuardianBeast,
  HeroCard,
  HeroRule,
  SupportAssistScenario,
  SupportAssistVariant,
  SupportGuide,
  TimeChallenge,
  ToolCard,
} from "../types/holton";

export const heroCardImages = {
  focusKnight: require("../../assets/cards/heroes/focus-knight.png"),
  calmCommander: require("../../assets/cards/heroes/calm-commander.png"),
  missionFinisher: require("../../assets/cards/heroes/mission-finisher.png"),
  restartChampion: require("../../assets/cards/heroes/restart-champion.png"),
  mindsteelRanger: require("../../assets/cards/heroes/mindsteel-ranger.png"),
  heroUpgradeElite: require("../../assets/cards/heroes/hero-upgrade-elite.png"),
  holtonReward: require("../../assets/cards/heroes/holton-reward.jpg"),
  holtonAscend: require("../../assets/cards/heroes/holton-ascend.jpg"),
};

export const badgeImages = {
  mindLock: require("../../assets/cards/badges/mind-lock-badge.png"),
  braveStart: require("../../assets/cards/badges/brave-start-badge.png"),
  calmCore: require("../../assets/cards/badges/calm-core-badge.png"),
  restartSpirit: require("../../assets/cards/badges/restart-spirit-badge.png"),
  finishLine: require("../../assets/cards/badges/finish-line-badge.png"),
};

export const worldEventImages = {
  bonusEnergy: require("../../assets/cards/events/bonus-energy.png"),
  guardianTrace: require("../../assets/cards/events/guardian-trace.png"),
  surpriseGift: require("../../assets/cards/events/surprise-gift.png"),
  oracleVisionPath: require("../../assets/cards/events/oracle-vision-path.png"),
  futureSignal: require("../../assets/cards/events/future-signal.png"),
  doubleMissionFuture: require("../../assets/cards/events/double-mission-future.png"),
  restEvent: require("../../assets/cards/events/rest-event.png"),
  stableWorld: require("../../assets/cards/events/stable-world.png"),
  newPathOpened: require("../../assets/cards/events/new-path-opened.png"),
  worldEvent: require("../../assets/cards/events/world-event.png"),
};

export const activeSkillImages = {
  breatherMode1: require("../../assets/cards/active/breather-mode-1.png"),
  pauseMode1: require("../../assets/cards/active/pause-mode-1.png"),
  waitMode2: require("../../assets/cards/active/wait-mode-2.png"),
  listenMode2: require("../../assets/cards/active/listen-mode-2.png"),
  thinkMode3: require("../../assets/cards/active/think-mode-3.png"),
  restartMode3: require("../../assets/cards/active/restart-mode-3.png"),
};

export const transitionImages = {
  readyCheck1: require("../../assets/cards/transition/ready-check-1.png"),
  imReady1: require("../../assets/cards/transition/im-ready-1.png"),
  needMoreTime2: require("../../assets/cards/transition/need-more-time-2.png"),
  breakTime2: require("../../assets/cards/transition/break-time-2.png"),
  calmToAction1: require("../../assets/cards/transition/calm-to-action-1.png"),
};

export const sopImages = {
  taskStarter1: require("../../assets/cards/sop/task-starter-1.png"),
  choiceMode1: require("../../assets/cards/sop/choice-mode-1.png"),
  taskBoost1: require("../../assets/cards/sop/task-boost-1.png"),
  finishMode1: require("../../assets/cards/sop/finish-mode-1.png"),
  packUpMode1: require("../../assets/cards/sop/pack-up-mode-1.png"),
  checkInMode2: require("../../assets/cards/sop/check-in-mode-2.png"),
  adjustMode2: require("../../assets/cards/sop/adjust-mode-2.png"),
  thinkMode3: require("../../assets/cards/sop/think-mode-3.png"),
  restartMode3: require("../../assets/cards/sop/restart-mode-3.png"),
};

export const supportToolImages = {
  emotionCooler: require("../../assets/cards/support/emotion-cooler.png"),
  energyBoost: require("../../assets/cards/support/energy-boost.png"),
  focusAdvantage: require("../../assets/cards/support/focus-advantage.png"),
  progressLock: require("../../assets/cards/support/progress-lock.png"),
  timeFreeze: require("../../assets/cards/support/time-freeze.png"),
};

export const timeChallengeImages = {
  miniWarrior: require("../../assets/cards/challenges/mini-warrior.png"),
  miniFighter: require("../../assets/cards/challenges/mini-fighter.png"),
  turboKnight: require("../../assets/cards/challenges/turbo-knight.png"),
  powerRanger: require("../../assets/cards/challenges/power-ranger.png"),
  superHeroMode: require("../../assets/cards/challenges/super-hero-mode.png"),
  masterMode: require("../../assets/cards/challenges/master-mode.png"),
  missionQuest: require("../../assets/cards/challenges/mission-quest.jpg"),
};

export const guardianBeastImages = {
  tidefin: require("../../assets/cards/guardians/tidefin.png"),
  stoneback: require("../../assets/cards/guardians/stoneback.png"),
  emberwing: require("../../assets/cards/guardians/emberwing.png"),
  "steel-eagle": require("../../assets/cards/guardians/steel-eagle.png"),
  bramblefang: require("../../assets/cards/guardians/bramblefang.png"),
};

export const coreGuardianStageImages = {
  tidefin: {
    stage1: require("../../assets/cards/core-guardians/tidefin/tidefin-stage1.png"),
    stage2: require("../../assets/cards/core-guardians/tidefin/tidefin-stage2.png"),
    stage3: require("../../assets/cards/core-guardians/tidefin/tidefin-stage3.png"),
    stage4: require("../../assets/cards/core-guardians/tidefin/tidefin-stage4.png"),
  },
  stoneback: {
    stage1: require("../../assets/cards/core-guardians/stoneback/stoneback-stage1.png"),
    stage2: require("../../assets/cards/core-guardians/stoneback/stoneback-stage2.png"),
    stage3: require("../../assets/cards/core-guardians/stoneback/stoneback-stage3.png"),
    stage4: require("../../assets/cards/core-guardians/stoneback/stoneback-stage4.png"),
  },
  emberwing: {
    stage1: require("../../assets/cards/core-guardians/emberwing/emberwing-stage1.png"),
    stage2: require("../../assets/cards/core-guardians/emberwing/emberwing-stage2.png"),
    stage3: require("../../assets/cards/core-guardians/emberwing/emberwing-stage3.png"),
    stage4: require("../../assets/cards/core-guardians/emberwing/emberwing-stage4.png"),
  },
  "steel-eagle": {
    stage1: require("../../assets/cards/core-guardians/steel-eagle/steel-eagle-stage1.png"),
    stage2: require("../../assets/cards/core-guardians/steel-eagle/steel-eagle-stage2.png"),
    stage3: require("../../assets/cards/core-guardians/steel-eagle/steel-eagle-stage3.png"),
    stage4: require("../../assets/cards/core-guardians/steel-eagle/steel-eagle-stage4.png"),
  },
  bramblefang: {
    stage1: require("../../assets/cards/core-guardians/bramblefang/bramblefang-stage1.png"),
    stage2: require("../../assets/cards/core-guardians/bramblefang/bramblefang-stage2.png"),
    stage3: require("../../assets/cards/core-guardians/bramblefang/bramblefang-stage3.png"),
    stage4: require("../../assets/cards/core-guardians/bramblefang/bramblefang-stage4.png"),
  },
} as const;

export const childCueIconImages: Record<string, ImageSourcePropType> = {
  ME: require("../../assets/ui/child-cues/me.png"),
  NEW: require("../../assets/ui/child-cues/new.png"),
  GO: require("../../assets/ui/child-cues/go.png"),
  SOS: require("../../assets/ui/child-cues/sos.png"),
  NOW: require("../../assets/ui/child-cues/now.png"),
  IN: require("../../assets/ui/child-cues/in.png"),
  NEXT: require("../../assets/ui/child-cues/next.png"),
  CALM: require("../../assets/ui/child-cues/calm.png"),
  FEED: require("../../assets/ui/child-cues/feed.png"),
  CARE: require("../../assets/ui/child-cues/care.png"),
  HI: require("../../assets/ui/child-cues/welcome.png"),
  GROW: require("../../assets/ui/child-cues/grow.png"),
  MAP: require("../../assets/ui/child-cues/map.png"),
  SHOW: require("../../assets/ui/child-cues/show.png"),
  BOOK: require("../../assets/ui/child-cues/book.png"),
  FIND: require("../../assets/ui/child-cues/find.png"),
  KEEP: require("../../assets/ui/child-cues/keep.png"),
  CAPT: require("../../assets/ui/child-cues/capt.png"),
  CODEX: require("../../assets/ui/child-cues/codex.png"),
};

export const childSceneImages = {
  currentAction: require("../../assets/ui/child-scenes/guardian-current-action-v1.jpg"),
  calmSupport: require("../../assets/ui/child-scenes/guardian-calm-support-v1.jpg"),
  guidedHelp: require("../../assets/ui/child-scenes/guardian-guided-help-v1.jpg"),
  featuredMain: require("../../assets/ui/child-scenes/guardian-featured-main-v1.jpg"),
  codexTodayPage: require("../../assets/ui/child-scenes/guardian-codex-today-page-v1.jpg"),
  stepComplete: require("../../assets/ui/child-scenes/guardian-step-complete-v1.jpg"),
  pauseHand: require("../../assets/ui/child-scenes/guardian-pause-hand-v1.jpg"),
  selfRegulate: require("../../assets/ui/child-scenes/guardian-self-regulate-v1.jpg"),
  guidedHelpFinal: require("../../assets/ui/child-scenes/guardian-guided-help-v2-final.jpg"),
} as const;

export const childCueReadableLabels: Partial<Record<string, string>> = {};

export const collectImageModules = (value: unknown): number[] => {
  if (typeof value === "number") return [value];
  if (Array.isArray(value)) return value.flatMap(collectImageModules);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectImageModules);
  return [];
};

export const preloadImageModules = Array.from(new Set([
  timeChallengeImages,
  guardianBeastImages,
  supportToolImages,
  childSceneImages,
].flatMap(collectImageModules)));

export const timeChallenges: TimeChallenge[] = [
  { id: "mini-warrior", name: "Mini Warrior", minutes: 3, orbs: 1, tier: "Warm-up Form", cue: "先進場,讓身體跟心一起上線。", whenToUse: "剛開始、還不穩、先求進場", parentHint: "先成功坐下和開始,比撐很久更重要。", imageSource: timeChallengeImages.miniWarrior },
  { id: "mini-fighter", name: "Mini Fighter", minutes: 5, orbs: 1, tier: "Starter Form", cue: "短任務先成功,建立成就感。", whenToUse: "有點想做,但還不適合太久", parentHint: "先拿到一次小成功,再決定要不要加長。", imageSource: timeChallengeImages.miniFighter },
  { id: "turbo-knight", name: "Turbo Knight", minutes: 10, orbs: 2, tier: "Focus Form", cue: "穩定專注的第一道門。", whenToUse: "今天狀態正常,可以正式跑一輪", parentHint: "這是日常主力卡,最適合當標準挑戰。", imageSource: timeChallengeImages.turboKnight },
  { id: "power-ranger", name: "Power Ranger", minutes: 15, orbs: 3, tier: "Power Form", cue: "進階挑戰,要開始有撐住的感覺。", whenToUse: "穩定日、已有成功暖身後", parentHint: "先確認孩子已經進場穩定,再升到這張。", imageSource: timeChallengeImages.powerRanger },
  { id: "super-hero", name: "Super Hero Mode", minutes: 20, orbs: 4, tier: "Hero Form", cue: "高階任務,完成後很有主角感。", whenToUse: "今天狀態很好,想做完整任務", parentHint: "不是天天用,適合想放大成就感的日子。", imageSource: timeChallengeImages.superHeroMode },
  { id: "master-mode", name: "Master Mode", minutes: 25, orbs: 5, tier: "Master Form", cue: "頂級挑戰,留給很穩的日子。", whenToUse: "非常穩、很有把握的挑戰日", parentHint: "這張是高階卡,不要在不穩的日子硬上。", imageSource: timeChallengeImages.masterMode },
  { id: "mission-quest", name: "Mission Quest", minutes: 0, orbs: 5, tier: "Quest Form", cue: "任務型挑戰,不限時,以完成任務為主。", whenToUse: "任務本身比時間更重要時", parentHint: "像收玩具、寫完一頁、整理一件事,重點是完成,不是倒數。", imageSource: timeChallengeImages.missionQuest, untimed: true },
];

export const heroCards: HeroCard[] = [
  { id: "focus-knight", name: "Focus Knight", rarity: "Legendary", kind: "support", role: "專注支援", power: "幫孩子在任務中重新拉回焦點。", imageSource: heroCardImages.focusKnight },
  { id: "calm-commander", name: "Calm Commander", rarity: "Epic", kind: "support", role: "情緒穩定", power: "在情緒升高時,提醒先安定再行動。", imageSource: heroCardImages.calmCommander },
  { id: "mission-finisher", name: "Mission Finisher", rarity: "Legendary", kind: "support", role: "完成推進", power: "任務接近尾聲時,幫孩子撐過最後一段。", imageSource: heroCardImages.missionFinisher },
  { id: "restart-champion", name: "Restart Champion", rarity: "Hero", kind: "support", role: "重啟支援", power: "中斷後不等於失敗,幫孩子重新進場。", imageSource: heroCardImages.restartChampion },
  { id: "mindsteel-ranger", name: "Mindsteel Ranger", rarity: "Hero", kind: "support", role: "結構守護", power: "在干擾變多時先穩住任務結構,再帶孩子回主線。", imageSource: heroCardImages.mindsteelRanger },
  { id: "hero-upgrade-elite", name: "Hero Upgrade - Elite", rarity: "Elite", kind: "ascend", role: "主角升階", power: "Holton 本人的升級情節卡,靠累積任務達標升階。", imageSource: heroCardImages.heroUpgradeElite },
  { id: "holton-reward", name: "Holton Reward Hero Card", rarity: "Elite", kind: "ascend", role: "主角獎勵", power: "Holton 的主角升級里程碑。", imageSource: heroCardImages.holtonReward },
  { id: "holton-ascend", name: "Holton Hero Ascend", rarity: "Legendary", kind: "ascend", role: "主角升階", power: "代表 Holton 已經跨到更高層級。", imageSource: heroCardImages.holtonAscend },
];

export const guardianBeasts: GuardianBeast[] = [
  {
    id: "tidefin",
    name: "Tidefin Shark",
    vibe: "衝刺/行動型",
    challengeCost: 10,
    complete: true,
    imageSource: guardianBeastImages.tidefin,
    stages: [
      { label: "Mini", cost: 10 },
      { label: "Mid", cost: 20 },
      { label: "Final", cost: 40 },
      { label: "Legendary", cost: 60 },
    ],
  },
  {
    id: "stoneback",
    name: "Stoneback Tortoise",
    vibe: "穩定/防禦型",
    challengeCost: 10,
    complete: true,
    imageSource: guardianBeastImages.stoneback,
    stages: [
      { label: "Mini", cost: 10 },
      { label: "Mid", cost: 20 },
      { label: "Final", cost: 40 },
      { label: "Legendary", cost: 60 },
    ],
  },
  {
    id: "emberwing",
    name: "Emberwing",
    vibe: "熱啟/爆發型",
    challengeCost: 20,
    complete: true,
    imageSource: guardianBeastImages.emberwing,
    stages: [
      { label: "Mini", cost: 10 },
      { label: "Mid", cost: 20 },
      { label: "Final", cost: 40 },
      { label: "Legendary", cost: 60 },
    ],
  },
  {
    id: "steel-eagle",
    name: "Steel Eagle",
    vibe: "專注/高空視野型",
    challengeCost: 20,
    complete: true,
    imageSource: guardianBeastImages["steel-eagle"],
    stages: [
      { label: "Mini", cost: 10 },
      { label: "Mid", cost: 20 },
      { label: "Final", cost: 40 },
      { label: "Legendary", cost: 60 },
    ],
  },
  {
    id: "bramblefang",
    name: "Bramblefang",
    vibe: "野性/突破型",
    challengeCost: 30,
    imageSource: guardianBeastImages.bramblefang,
    stages: [
      { label: "Mini", cost: 10 },
      { label: "Mid", cost: 20 },
      { label: "Final", cost: 40 },
      { label: "Legendary", cost: 60 },
    ],
  },
];

export const worldEvents: EventCard[] = [
  { id: "bonus-energy", title: "Bonus Energy", type: "energy", family: "bonus", desc: "世界額外推你一把。", reward: "+1 Bonus Pool", effect: { bonusOrbs: 1 }, imageSource: worldEventImages.bonusEnergy },
  { id: "guardian-trace", title: "Guardian Trace", type: "trace", family: "trace", desc: "世界留下了一道守護痕跡。", reward: "+1 Guardian Trace / 挑戰線索", effect: { guardianTraces: 1, guardianChallengeTokens: 1 }, imageSource: worldEventImages.guardianTrace },
  { id: "surprise-gift", title: "Surprise Gift", type: "ritual", family: "surprise", desc: "穩定努力後得到一個驚喜。", reward: "小驚喜 / 儀式感事件", imageSource: worldEventImages.surpriseGift },
  { id: "oracle-vision-path", title: "Oracle Vision Path", type: "ritual", family: "future", desc: "世界給出一條路徑提示。", reward: "下一步提示", effect: { focusPower: 4 }, imageSource: worldEventImages.oracleVisionPath },
  { id: "future-signal", title: "Future Signal", type: "path", family: "future", desc: "看見下一步可能性。", reward: "未來路徑感", effect: { focusPower: 3 }, imageSource: worldEventImages.futureSignal },
  { id: "double-mission", title: "Double Mission Future", type: "path", family: "future", desc: "世界幫你多開一個挑戰入口。", reward: "+1 額外任務權", effect: { extraMission: 1 }, imageSource: worldEventImages.doubleMissionFuture },
  { id: "rest-event", title: "Rest Event", type: "recovery", family: "recovery", desc: "合法短休,再回到流程。", reward: "休息 2 分鐘", effect: { emotionPower: 6 }, imageSource: worldEventImages.restEvent },
  { id: "stable-world", title: "Stable World", type: "recovery", family: "recovery", desc: "世界暫時穩定下來,今天不用那麼硬撐。", reward: "穩定值提升", effect: { emotionPower: 8 }, imageSource: worldEventImages.stableWorld },
  { id: "new-path", title: "New Path Opened", type: "path", family: "future", desc: "你可以改選下一條任務路。", reward: "新路線", imageSource: worldEventImages.newPathOpened },
  { id: "world-event", title: "World Event", type: "ritual", family: "meta", desc: "有件重要的事要發生。", reward: "高階事件入口", imageSource: worldEventImages.worldEvent },
];

export const activeSkills: ToolCard[] = [
  { id: "breather-1", title: "Breather Mode-I", family: "active", level: "I", childLine: "我先呼吸一下再回來。", parentHint: "短時間 reset,不算 break。", imageSource: activeSkillImages.breatherMode1, sourceDriveId: "1ARaw2ZvxibNXtzdC1crF_nliOOVbNNpH" },
  { id: "pause-1", title: "Pause Mode-I", family: "active", level: "I", childLine: "我先暫停一下。", parentHint: "2 分鐘短暫休息。", imageSource: activeSkillImages.pauseMode1, sourceDriveId: "15V646pzjxwqKGQB8NiS6UY7DJFIh6Nnt" },
  { id: "listen-2", title: "Listen Mode-II", family: "active", level: "II", childLine: "我先聽到輪到我。", parentHint: "降低插話與搶答。", imageSource: activeSkillImages.listenMode2, sourceDriveId: "1mlsPnK5iuhdRiAsPr3JPosHNwbH7QdCW" },
];

export const transitionCards: ToolCard[] = [
  { id: "ready-check", title: "Ready Check-I", family: "transition", level: "I", childLine: "我們先確認,現在要不要開始這一輪。", parentHint: "先把孩子接到進場點,再決定要不要推進。", imageSource: transitionImages.readyCheck1, sourceDriveId: "1RYvc_5mOIZJBNZwSXJhj81MXNuDE3Awa" },
  { id: "im-ready", title: "I'm Ready-I", family: "transition", level: "I", childLine: "我準備好開始這一輪了。", parentHint: "孩子主動說要進場,主線就從這裡接上。", imageSource: transitionImages.imReady1, sourceDriveId: "1cBOsQ82dNfoUuN_TxbZgFy6DkNiWasb1" },
  { id: "need-more-time", title: "Need More Time-II", family: "transition", level: "II", childLine: "我還需要一點時間再開始。", parentHint: "先延長緩衝,等一下再回到這一輪。", imageSource: transitionImages.needMoreTime2, sourceDriveId: "1s0nYma_0albvWZhNJplaZ5dzi5u848Sd" },
  { id: "break-time", title: "Break Time-II", family: "transition", level: "II", childLine: "我先休息一下,等一下再回來。", parentHint: "合法短停,不讓孩子覺得自己掉出主線。", imageSource: transitionImages.breakTime2, sourceDriveId: "140jdx5NF3ODsatDP3Y8Bjnp96YhdT9gC" },
  { id: "calm-action", title: "Calm To Action-I", family: "transition", level: "I", childLine: "我先穩住,再開始做這一步。", parentHint: "幫孩子從穩定狀態切回行動狀態。", imageSource: transitionImages.calmToAction1, sourceDriveId: "1ztxQxAGgr1KOaNjSlXUAgCTrz0eOSK6g" },
];

export const sopCards: ToolCard[] = [
  { id: "task-starter", title: "Task Starter-I", family: "sop", level: "I", childLine: "我先開始。", parentHint: "勇敢跨出第一步。", imageSource: sopImages.taskStarter1, sourceDriveId: "1-XgBLdcaZxPwtE87rQVqgCBUBqg01_-b" },
  { id: "task-boost", title: "Task Boost-I", family: "sop", level: "I", childLine: "我再多撐一下。", parentHint: "中段最容易被忽略,要高亮。", imageSource: sopImages.taskBoost1, sourceDriveId: "1B7ChoSV73GiUx_eWpGK3f3SnHjY8gue6" },
  { id: "check-in", title: "Check-In Mode-II", family: "sop", level: "II", childLine: "我現在做到哪裡了?", parentHint: "幫孩子對焦目前狀態。", imageSource: sopImages.checkInMode2, sourceDriveId: "1gUiF--a_xyOd1g86IHrt5pcNg-S0UEmc" },
  { id: "adjust", title: "Adjust Mode-II", family: "sop", level: "II", childLine: "我可以微調一下。", parentHint: "中途修正,不是失敗。", imageSource: sopImages.adjustMode2, sourceDriveId: "1sfNtH3fQ8uzXPvZqi22ycTuFtfpZqOGv" },
  { id: "finish-mode", title: "Finish Mode-I", family: "sop", level: "I", childLine: "我把這一段收完。", parentHint: "幫孩子完成收尾。", imageSource: sopImages.finishMode1, sourceDriveId: "17qIKX-i39Q_07ak8Ipo7j_F2XVF7fzeD" },
  { id: "pack-up", title: "Pack-Up Mode-I", family: "sop", level: "I", childLine: "我收好這次任務。", parentHint: "結束後整理,讓流程真正結束。", imageSource: sopImages.packUpMode1, sourceDriveId: "10cNd1jQXAYZj7DtzF1I3m1qs8sXwFAk3" },
];

export const supportTools: ToolCard[] = [
  { id: "emotion-cooler", title: "Emotion Cooler", family: "support", level: "Starter", childLine: "我先讓自己冷靜一點。", parentHint: "前期由大人陪用,後期可變成孩子的自我穩定工具。", imageSource: supportToolImages.emotionCooler },
  { id: "energy-boost", title: "Energy Boost", family: "support", level: "Starter", childLine: "我幫自己補一點能量。", parentHint: "適合剛開始沒力、很難進場的時候。", imageSource: supportToolImages.energyBoost },
  { id: "focus-advantage", title: "Focus Advantage", family: "support", level: "Starter", childLine: "我先把注意力拉回來。", parentHint: "從家長提示過渡到孩子自己會用的專注工具。", imageSource: supportToolImages.focusAdvantage },
  { id: "progress-lock", title: "Progress Lock", family: "support", level: "Starter", childLine: "我先把已做到的地方鎖住。", parentHint: "避免孩子覺得一中斷就全部歸零。", imageSource: supportToolImages.progressLock },
  { id: "time-freeze", title: "Time Freeze", family: "support", level: "Starter", childLine: "我想先停一下,但不是放棄。", parentHint: "讓孩子知道暫停不等於失敗。", imageSource: supportToolImages.timeFreeze },
];

export const supportToolGuides: Record<string, SupportGuide> = {
  "emotion-cooler": {
    purpose: "先降情緒,再回主線。",
    situations: ["情緒升高", "開始煩躁", "快要失控但還能接回"],
    parentLine: "我們先冷靜一下,不急著現在解決。",
    minutes: "1-3 分鐘",
    returnHint: "時間到後先回 Ready Check 或 Calm To Action。",
  },
  "energy-boost": {
    purpose: "先補支持感,幫孩子比較願意進場。",
    situations: ["不想開始", "沒力", "需要一點被鼓勵"],
    parentLine: "先補一下能量,等等我們再開始。",
    minutes: "1-2 分鐘",
    returnHint: "補完後回 Ready Check 或直接進當前挑戰。",
  },
  "focus-advantage": {
    purpose: "把注意力拉回來,縮小到下一步。",
    situations: ["做到一半卡住", "分心", "不知道下一步要做什麼"],
    parentLine: "我們先只看下一步,不一次想全部。",
    minutes: "1-3 分鐘",
    returnHint: "時間到後回目前 SOP step。",
  },
  "progress-lock": {
    purpose: "先保留已做到的部分,不讓孩子覺得全部歸零。",
    situations: ["中斷後回不去", "怕重來", "做到一半想放棄"],
    parentLine: "你剛剛做到的先算數,我們不是從零開始。",
    minutes: "2-5 分鐘",
    returnHint: "時間到後走 Restart 或回 Check-In。",
  },
  "time-freeze": {
    purpose: "讓暫停合法化,但不等於放棄。",
    situations: ["需要先停一下", "快撐不住", "想離開但還想回來"],
    parentLine: "可以先停一下,等一下我們再決定怎麼接。",
    minutes: "2-5 分鐘",
    returnHint: "時間到後回 Ready Check、Restart 或直接收尾。",
  },
};

export const coreGuardianArchetypeImages = {
  stable: {
    companion: require("../../assets/core-guardian-archetypes/stable/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/stable/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/stable/forward.png"),
  },
  explore: {
    companion: require("../../assets/core-guardian-archetypes/explore/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/explore/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/explore/forward.png"),
  },
  soothe: {
    companion: require("../../assets/core-guardian-archetypes/soothe/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/soothe/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/soothe/forward.png"),
  },
  action: {
    companion: require("../../assets/core-guardian-archetypes/action/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/action/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/action/forward.png"),
  },
  focus: {
    companion: require("../../assets/core-guardian-archetypes/focus/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/focus/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/focus/forward.png"),
  },
  reconnect: {
    companion: require("../../assets/core-guardian-archetypes/reconnect/companion.png"),
    standard: require("../../assets/core-guardian-archetypes/reconnect/standard.png"),
    forward: require("../../assets/core-guardian-archetypes/reconnect/forward.png"),
  },
};

export const coreGuardianHappyExpressionImages = {
  stable: require("../../assets/core-guardian-expressions/processed/stable-happy.png"),
  explore: require("../../assets/core-guardian-expressions/processed/explore-happy.png"),
  soothe: require("../../assets/core-guardian-expressions/processed/soothe-happy.png"),
  action: require("../../assets/core-guardian-expressions/processed/action-happy.png"),
  focus: require("../../assets/core-guardian-expressions/processed/focus-happy.png"),
  reconnect: require("../../assets/core-guardian-expressions/processed/reconnect-happy.png"),
} as const;

export const transitionGuides: Record<string, SupportGuide> = {
  "ready-check": {
    purpose: "在開始前先一起確認,現在是真的準備好了,還是還需要多一點緩衝。",
    situations: ["剛要開始", "孩子猶豫中", "父母不確定要不要推進"],
    parentLine: "我們先確認一下,現在是準備好,還是還要一點時間?",
    minutes: "通常 1 分鐘內判斷完成",
    returnHint: "確認後接 Challenge,或先轉到 Need More Time / Break Time。",
  },
  "im-ready": {
    purpose: "讓孩子自己宣告進場,而不是被大人直接推進去。",
    situations: ["孩子準備好了", "要正式啟動任務", "想讓開始是孩子自己說出口"],
    parentLine: "好,既然你說準備好了,我們就正式開始。",
    minutes: "立即生效",
    returnHint: "直接切進 Challenge。",
  },
  "need-more-time": {
    purpose: "把延後合法化,避免孩子在還沒準備好時被硬推進。",
    situations: ["還沒進場", "情緒還沒穩", "需要再多一點緩衝"],
    parentLine: "可以,再給你一點時間,我們等一下再確認。",
    minutes: "通常 1-3 分鐘",
    returnHint: "時間到後回 Ready Check 再決定。",
  },
  "break-time": {
    purpose: "提供短暫合法休息,避免把疲累或抗拒直接升級成失敗。",
    situations: ["快撐不住", "需要短休", "當下推進只會更糟"],
    parentLine: "先休息一下,等一下我們再回來。",
    minutes: "通常 2 分鐘左右",
    returnHint: "休息後回 Ready Check 或目前 SOP。",
  },
  "calm-action": {
    purpose: "幫孩子從比較穩定的狀態,切進可以行動的狀態。",
    situations: ["已經比較穩了", "準備從情緒調整轉回任務", "需要一個明確切換點"],
    parentLine: "現在比較穩了,我們一起把狀態切回行動。",
    minutes: "通常 1 分鐘內完成切換",
    returnHint: "切換後回 Challenge。",
  },
};

export const activeSkillGuides: Record<string, SupportGuide> = {
  "breather-1": {
    purpose: "給孩子一個短而合法的 reset,不算 break,也不算失敗。",
    situations: ["快亂掉了", "需要先呼吸一下", "還不需要整輪停掉"],
    parentLine: "先呼吸一下,這不算中斷,我們等一下接回來。",
    minutes: "約 1 分鐘",
    returnHint: "回目前 Challenge 或 SOP。",
  },
  "pause-1": {
    purpose: "短暫停住,先不要把壓力繼續往上堆。",
    situations: ["需要暫停", "刺激太多", "不適合硬撐"],
    parentLine: "先停一下,這不是放棄。",
    minutes: "約 2 分鐘",
    returnHint: "暫停後回 SOP 或 Ready Check。",
  },
  "wait-2": {
    purpose: "練習等待,不急著馬上回應或搶進。",
    situations: ["輪流等待", "容易插話", "需要練習停一下"],
    parentLine: "先等一下,等輪到你再出手。",
    minutes: "依情境,通常短秒數到 1 分鐘",
    returnHint: "等待完成後回目前流程。",
  },
  "listen-2": {
    purpose: "先聽懂再反應,幫孩子把注意力轉回接收。",
    situations: ["一直急著表達", "沒聽完就動", "需要先收訊"],
    parentLine: "先聽清楚,等一下再輪到你。",
    minutes: "通常當下立即生效",
    returnHint: "回 Challenge 或目前 SOP。",
  },
  "think-3": {
    purpose: "在做之前先想一下,避免一股腦往前衝。",
    situations: ["不知道下一步", "需要先想", "怕亂做越做越亂"],
    parentLine: "先想一下下一步,不急著立刻做。",
    minutes: "約 1-2 分鐘",
    returnHint: "想清楚後回 SOP 下一步。",
  },
  "restart-3": {
    purpose: "讓重啟變合法,不把中斷等同失敗。",
    situations: ["任務中斷", "注意力整個掉線", "孩子覺得回不去了"],
    parentLine: "沒關係,我們不是重來,是重新接回來。",
    minutes: "約 1-2 分鐘",
    returnHint: "走 Restart 接點後再回主線。",
  },
};

export const sopGuides: Record<string, SupportGuide> = {
  "task-starter": {
    purpose: "讓孩子先踏出第一步,不被整個任務量嚇住。",
    situations: ["剛開始", "孩子卡在起步", "需要先進場"],
    parentLine: "先開始第一步就好,不用一次想完。",
    minutes: "通常 1 分鐘內啟動",
    returnHint: "開始後接到下一張 SOP。",
  },
  "choice-mode": {
    purpose: "給孩子一個選擇感,降低被控制感。",
    situations: ["不想被直接命令", "需要選擇權", "想讓孩子自己決定下一步"],
    parentLine: "你可以選這一步,或那一步。",
    minutes: "通常 1 分鐘內完成選擇",
    returnHint: "選完後接所選的下一步。",
  },
  "task-boost": {
    purpose: "在中段容易掉的時候,幫孩子多撐一下。",
    situations: ["做到一半", "快放掉", "差一點就能撐過去"],
    parentLine: "你已經到這裡了,我們再多撐一下。",
    minutes: "通常 1-3 分鐘",
    returnHint: "撐過後接 Finish 或下一個中段步驟。",
  },
  "finish-mode": {
    purpose: "把最後一小段收乾淨,完成感比中途停掉更重要。",
    situations: ["快結束", "只剩最後一步", "要收最後一段"],
    parentLine: "就把這一段收完,我們就算成功。",
    minutes: "通常 1-3 分鐘",
    returnHint: "完成後進 Settle / Pack-Up。",
  },
  "pack-up": {
    purpose: "把這輪任務真正結束,不讓流程卡在半空。",
    situations: ["任務剛完成", "要收尾", "要把系統關乾淨"],
    parentLine: "我們把這一輪收乾淨,事情就真的完成了。",
    minutes: "約 1-2 分鐘",
    returnHint: "收尾後回今天總覽,決定下一輪或結束。",
  },
  "check-in": {
    purpose: "讓孩子知道自己現在做到哪裡,而不是一團亂。",
    situations: ["中段卡住", "不知道進度", "需要重新定位"],
    parentLine: "我們先看一下,你現在做到哪裡。",
    minutes: "通常 1 分鐘內定位完成",
    returnHint: "定位完成後回當前 SOP。",
  },
  "adjust": {
    purpose: "允許微調,避免孩子因為一點不順就整輪崩掉。",
    situations: ["原做法卡住", "要微調步驟", "需要換個方式"],
    parentLine: "我們調一下,不是失敗。",
    minutes: "約 1-2 分鐘",
    returnHint: "微調後回目前步驟繼續。",
  },
  "think-sop": {
    purpose: "在行動前先過腦,減少亂衝亂做。",
    situations: ["下一步不清楚", "容易一急就亂", "要先整理思路"],
    parentLine: "先想一下下一步,不用急。",
    minutes: "約 1-2 分鐘",
    returnHint: "想清楚後再接下一張 SOP。",
  },
  "restart-sop": {
    purpose: "提供一個正式的重接點,讓孩子知道回得來。",
    situations: ["中斷後回不去", "節奏散掉", "已脫離主線"],
    parentLine: "我們從這裡重新接,不是全部重來。",
    minutes: "約 1-3 分鐘",
    returnHint: "重接完成後回主流程。",
  },
};

export const supportAssistScenarios: {
  id: SupportAssistScenario;
  title: string;
  cue: string;
  suggestedToolId: ToolCard["id"];
  observeLine: string;
  sayLine: string;
  parentLine: string;
  avoidLine: string;
  nextStep: string;
  sayLines: string[];
  avoidLines: string[];
  quickActions: string[];
  recordTags: string[];
  summaryTemplate: string;
  nextTimeTemplate: string;
  reviewAvoidTemplate: string;
  variants?: {
    id: SupportAssistVariant;
    title: string;
    cue: string;
    observeLine: string;
    sayLines: string[];
    avoidLines: string[];
    quickActions: string[];
    recordTags: string[];
    nextStep: string;
    summaryTemplate: string;
    nextTimeTemplate: string;
    reviewAvoidTemplate: string;
  }[];
}[] = [
  { id: "start", title: "不想開始", cue: "孩子還沒進場,父母也不知道要推還是等。", suggestedToolId: "energy-boost", observeLine: "先看是沒力、怕開始,還是根本還沒 ready。", sayLine: "先不用急,先看現在能不能進場。", parentLine: "先幫孩子進場,先不要追整段。", avoidLine: "不要一開口就催快點或直接追進度。", nextStep: "先用 Ready Check,再決定要不要進 Mini / Starter 任務。", sayLines: ["先不用急,先看現在能不能開始。", "先做一點點就好。", "如果還沒 ready,我們先把開始變小。"], avoidLines: ["你不要再拖了。", "快點開始,不然又來不及。", "這有什麼好不開始的。"], quickActions: ["先做 Ready Check", "先選短任務", "先補能量再決定"], recordTags: ["卡在開始前", "還沒 ready", "補能量後有回來"], summaryTemplate: "這次不是不做,而是還沒進場。", nextTimeTemplate: "下次先讓孩子進場,再決定要不要拉長任務。", reviewAvoidTemplate: "不要一開始就把還沒開始當成不配合。", variants: [
    { id: "start_low_energy", title: "沒力開始", cue: "孩子不是抗拒,是整個人還沒上線。", observeLine: "先看是不是還沒醒、沒力、沒進場。", sayLines: ["你現在還沒上線,我們先看怎麼開始。", "先不用撐整輪,先確認現在能不能進場。"], avoidLines: ["你怎麼又懶懶的。", "快點,這有什麼好拖。"], quickActions: ["先做 Ready Check", "先選最短任務"], recordTags: ["開始前沒力", "Ready Check 後有回來"], nextStep: "先回 Ready Check,再決定要不要補能量或進最短任務。", summaryTemplate: "這次卡點比較像沒力,不是故意不做。", nextTimeTemplate: "下次先確認能不能進場,再決定要不要補能量。", reviewAvoidTemplate: "不要把沒力直接解讀成拖延。" },
    { id: "start_not_ready", title: "還沒 ready", cue: "孩子不是不要,而是還沒準備好被推進任務。", observeLine: "先看是不是還在觀望、還沒準備進場。", sayLines: ["先不用開始整輪,先看有沒有準備好。", "先決定要不要進場,不用現在做很多。"], avoidLines: ["你到底要不要做。", "不要再想了,現在就開始。"], quickActions: ["先做 Ready Check", "先給進場選擇"], recordTags: ["還沒 ready", "Ready Check 後比較穩"], nextStep: "先回 Ready Check,再決定挑戰長度。", summaryTemplate: "這次不是抗拒,而是還沒 ready。", nextTimeTemplate: "下次先讓孩子確認準備度,再推主線。", reviewAvoidTemplate: "不要跳過 ready 狀態直接進任務。" },
    { id: "start_avoidance", title: "想逃開開始", cue: "孩子一碰到開始就想閃、轉開、拖走。", observeLine: "先看是不是一想到開始就想躲開。", sayLines: ["先不用做完,先看能不能靠近這一步。", "先不用推進度,先確認現在能不能進場。"], avoidLines: ["你又在逃。", "你就是不想做。"], quickActions: ["先做 Ready Check", "先縮成碰一下"], recordTags: ["開始前逃避", "Ready Check 後較能接回"], nextStep: "先回 Ready Check,再把開始縮成最小動作。", summaryTemplate: "這次卡點比較像逃避開始,不是完全不做。", nextTimeTemplate: "下次先確認能不能進場,再把開始縮小。", reviewAvoidTemplate: "不要把逃避開頭直接定義成不配合。" }
  ] },
  { id: "emotion", title: "情緒上來了", cue: "孩子開始急、煩、抗拒,現場需要先降溫。", suggestedToolId: "emotion-cooler", observeLine: "先看是情緒先上來,還是事情真的太滿。", sayLine: "我先陪你穩一下,現在先不用做完。", parentLine: "先接情緒,再談下一步。", avoidLine: "不要一邊高張,一邊講道理或催完成。", nextStep: "等穩一點後回到 Calm To Action 或 Check-In。", sayLines: ["我知道你現在很煩,我先陪你穩一下。", "現在先不用撐著做完。", "等一下再決定下一步,先讓身體慢下來。"], avoidLines: ["你不要再鬧了。", "先做完再說。", "這有什麼好生氣的。"], quickActions: ["先降情緒", "先停一下", "穩了再回 Check-In"], recordTags: ["情緒先上來", "先穩住有效", "穩後可回主線"], summaryTemplate: "這次卡點先在情緒,不在能力。", nextTimeTemplate: "下次先降速、先接住,再決定怎麼回主線。", reviewAvoidTemplate: "不要在情緒高的當下硬推流程。", variants: [
    { id: "emotion_overloaded", title: "太滿了", cue: "孩子像是一次承受太多,整個爆出來。", observeLine: "先看是不是要求太多、太快、太密。", sayLines: ["現在太滿了,我們先減一點。", "先讓自己鬆下來,不用現在全扛。"], avoidLines: ["這樣也要崩喔。", "你想太多了。"], quickActions: ["先降要求", "先減刺激"], recordTags: ["情緒過載", "降要求有效"], nextStep: "先降要求,再回最短接點。", summaryTemplate: "這次是過載,不是故意對抗。", nextTimeTemplate: "下次先把要求減量,再看要不要進主線。", reviewAvoidTemplate: "不要在過載時再加新要求。" },
    { id: "emotion_opposed", title: "對抗起來", cue: "孩子開始頂嘴、反推、對著做。", observeLine: "先看是不是被逼感太強,變成直接反抗。", sayLines: ["我先不跟你對拉,我們先退一點。", "我不是現在要壓你,我們先想怎麼接回來。"], avoidLines: ["你再這樣我就生氣了。", "你就是故意的。"], quickActions: ["先退半步", "先停對抗"], recordTags: ["情緒對抗", "退一步有效"], nextStep: "先停止對拉,再回 Check-In。", summaryTemplate: "這次比較像被逼感太強,轉成對抗。", nextTimeTemplate: "下次先減少對拉,再找回合作感。", reviewAvoidTemplate: "不要在對抗升高時繼續加壓。" },
    { id: "emotion_hurt", title: "委屈受傷", cue: "孩子不是炸,而是委屈、縮起來、快哭了。", observeLine: "先看是不是覺得自己做不好、被誤解、被否定。", sayLines: ["我知道你現在心裡不舒服。", "我們先顧你現在的感覺。"], avoidLines: ["這有什麼好哭的。", "你不要那麼玻璃心。"], quickActions: ["先接委屈", "先讓感受被看見"], recordTags: ["情緒委屈", "被接住後比較穩"], nextStep: "先讓感受被接住,再決定要不要回主線。", summaryTemplate: "這次先卡在委屈感,不是流程本身。", nextTimeTemplate: "下次先接住受傷感,再談任務。", reviewAvoidTemplate: "不要在委屈升高時急著講道理。" }
  ] },
  { id: "stuck", title: "做到一半卡住", cue: "不是不做,而是不知道怎麼接下去。", suggestedToolId: "focus-advantage", observeLine: "先看是失焦了,還是突然看不到下一步。", sayLine: "先不用想整段,先把眼前這一步接起來。", parentLine: "先縮成下一步,再拉回這張 SOP。", avoidLine: "不要把整份功課或整段流程一次講完。", nextStep: "回到目前 SOP step,只接下一步。", sayLines: ["我們先只看下一步。", "你不是不會,只是先卡在這一步。", "先把這一步接起來,後面等一下再說。"], avoidLines: ["這有什麼好卡的。", "我剛剛不是講過整段了嗎。", "你自己想一下就知道了。"], quickActions: ["縮成下一步", "回目前 SOP", "先拉回注意力"], recordTags: ["中段卡住", "縮步有效", "需要重接"], summaryTemplate: "這次不是不做,而是中段看不到下一步。", nextTimeTemplate: "下次先把整段縮成眼前一步,再接回 SOP。", reviewAvoidTemplate: "不要一次把整段流程全講完。", variants: [
    { id: "stuck_lost_focus", title: "失焦飄走", cue: "孩子做到一半,注意力整個飄掉。", observeLine: "先看是不是主線還在,但注意力掉線了。", sayLines: ["我們先把注意力收回來。", "先不用往後想,先把眼前這一步抓回來。"], avoidLines: ["你怎麼又分心了。", "專心一點很難嗎。"], quickActions: ["先拉回注意力", "先清掉干擾"], recordTags: ["中段失焦", "拉回注意力有效"], nextStep: "先用 Focus Advantage,再回目前 SOP。", summaryTemplate: "這次卡在失焦,不是看不懂。", nextTimeTemplate: "下次先拉回注意力,再接眼前一步。", reviewAvoidTemplate: "不要把失焦直接當成不認真。" },
    { id: "stuck_no_next_step", title: "看不到下一步", cue: "孩子停住,是因為不知道下一步該做什麼。", observeLine: "先看是不是卡在不知道接下來要做哪個。", sayLines: ["我先幫你把下一步指出來。", "先不用想整段,我們只看接下來這一步。"], avoidLines: ["你自己看就知道了。", "我不是早就講過了。"], quickActions: ["先指出下一步", "先縮成一步"], recordTags: ["看不到下一步", "指出一步有效"], nextStep: "直接回目前 SOP 的下一步。", summaryTemplate: "這次卡在看不到下一步,不是整段不會。", nextTimeTemplate: "下次先把下一步指出來,再讓孩子接。", reviewAvoidTemplate: "不要一次把整段都交給孩子自己拆。" },
    { id: "stuck_perfection_freeze", title: "怕做錯卡住", cue: "孩子不是不知道,而是怕做錯所以不敢往下。", observeLine: "先看是不是因為怕錯、怕被糾正而停住。", sayLines: ["你可以先試一點點,不用一次就對。", "我們先動起來,再慢慢修。"], avoidLines: ["你怎麼連這個都不敢。", "不要那麼龜毛。"], quickActions: ["先允許不完美", "先動一小步"], recordTags: ["怕做錯卡住", "允許出錯後有回來"], nextStep: "先允許試一點點,再接 SOP。", summaryTemplate: "這次卡在怕做錯,不是完全不會。", nextTimeTemplate: "下次先降低『一定要對』的壓力,再推下一步。", reviewAvoidTemplate: "不要在凍住時再強調做錯的後果。" }
  ] },
  { id: "restart", title: "中斷後回不去", cue: "已經離開主線,需要幫孩子重接。", suggestedToolId: "progress-lock", observeLine: "先看是忘了做到哪裡,還是怕重新開始。", sayLine: "你剛剛做到的先算數,我們不是從零開始。", parentLine: "先保留已做部分,讓孩子知道不是全部重來。", avoidLine: "不要用『都停這麼久了重來吧』把前面努力清掉。", nextStep: "接 Restart / Check-In / Pack-Up 其中一個最短可接點。", sayLines: ["你剛剛做到的先算數。", "我們從這裡接回來,不是全部重來。"], avoidLines: ["都斷掉了,重來吧。"], quickActions: ["先保留已做部分", "選最短接回點"], recordTags: ["中斷後回不去", "重接有效"], summaryTemplate: "這次主線斷掉後,需要一個正式重接點。", nextTimeTemplate: "下次先讓孩子知道前面不算白費,再接回主線。", reviewAvoidTemplate: "不要把中斷直接處理成全部歸零。" },
  { id: "encourage", title: "需要鼓勵一下", cue: "孩子其實能做,但現在需要一點被支持的感覺。", suggestedToolId: "energy-boost", observeLine: "先看孩子是不是想做,但現在缺一點支持感。", sayLine: "你已經有在撐了,我先幫你補一點力。", parentLine: "先補支持感,再讓孩子自己做決定。", avoidLine: "不要把鼓勵講成施壓,例如『你明明就可以快點』。", nextStep: "補完能量後回到 Ready 或直接進當前挑戰。", sayLines: ["你已經有在撐了。", "我先幫你補一點力,再看下一步。"], avoidLines: ["你明明就可以,快點。"], quickActions: ["先補支持感", "再回挑戰"], recordTags: ["需要鼓勵", "補支持感有效"], summaryTemplate: "這次需要的不是催,而是先補支持感。", nextTimeTemplate: "下次先肯定,再推下一步。", reviewAvoidTemplate: "不要把鼓勵講成施壓。" },
  { id: "pause", title: "想先停一下", cue: "孩子想停,但不是要整個放棄。", suggestedToolId: "time-freeze", observeLine: "先看是短暫過載,還是真的要退出。", sayLine: "可以先停一下,停一下不等於今天失敗。", parentLine: "先把暫停合法化,這樣比較回得來。", avoidLine: "不要把暫停直接解讀成偷懶或放棄。", nextStep: "短停後重新做 Ready Check,決定回主線還是先收尾。", sayLines: ["可以先停一下。", "停一下不等於今天失敗。"], avoidLines: ["現在不能停。"], quickActions: ["先短停", "再做 Ready Check"], recordTags: ["需要短停", "短停後可回來"], summaryTemplate: "這次需要的是短停,不是直接退出。", nextTimeTemplate: "下次先把暫停合法化,再決定怎麼回來。", reviewAvoidTemplate: "不要把暫停直接當成放棄。" },
];

export const supportDurationPresets: Partial<Record<ToolCard["id"], number[]>> = {
  "emotion-cooler": [1, 2, 3],
  "energy-boost": [0.5, 1],
  "focus-advantage": [0.5, 1],
  "progress-lock": [2, 3, 5],
  "time-freeze": [0.5, 1],
  "pause-1": [1, 2],
  "breather-1": [0.5, 1],
  "listen-2": [0.5, 1],
};

export const coreGuardianArchetypes: Array<{
  id: CoreGuardianArchetype;
  label: string;
  shortLine: string;
  reasonLine: string;
  beastId: string;
}> = [
  { id: "stable", label: "安定守護型", shortLine: "先陪孩子安心站穩,再慢慢開始。", reasonLine: "孩子目前比較需要安全感、穩定感與比較低壓的起步方式。", beastId: "stoneback" },
  { id: "explore", label: "探索引導型", shortLine: "先讓孩子願意靠近,再把流程慢慢打開。", reasonLine: "孩子比較不喜歡被直接要求,用好奇與引路感更容易走進流程。", beastId: "steel-eagle" },
  { id: "soothe", label: "情緒承接型", shortLine: "先接住情緒,再陪孩子回到流程裡。", reasonLine: "孩子一卡住時情緒比較容易先上來,先被理解比先被推更重要。", beastId: "tidefin" },
  { id: "action", label: "行動推進型", shortLine: "先把第一步變小,再幫孩子跨出去。", reasonLine: "孩子不是不懂,而是容易停在起步前,需要有人幫他把第一步推開。", beastId: "emberwing" },
  { id: "focus", label: "專注聚焦型", shortLine: "先把注意力收回來,只看眼前這一步。", reasonLine: "孩子比較容易分心或飄掉,更需要的是回到眼前這一步。", beastId: "steel-eagle" },
  { id: "reconnect", label: "修復回接型", shortLine: "先把斷掉的地方接回來,不讓前面白費。", reasonLine: "孩子一旦中斷後比較容易回不來,需要先把主線接回。", beastId: "bramblefang" },
];

export const coreGuardianStateVariantMeta: Record<CoreGuardianStateVariant, { label: string; line: string }> = {
  companion: { label: "陪伴版", line: "先用比較溫和、接住型的狀態開始。" },
  standard: { label: "標準版", line: "先用日常陪跑的狀態開始。" },
  forward: { label: "前進版", line: "在狀態比較穩時,再往前推一步。" },
};

export const coreGuardianQuizQuestions: Array<{
  id: CoreGuardianQuizQuestionId;
  prompt: string;
  options: Array<{ id: string; text: string; scores: Partial<Record<CoreGuardianArchetype, number>> }>;
}> = [
  { id: "q1", prompt: "你最近最常看到孩子卡在哪裡?", options: [
    { id: "A", text: "看起來有點緊,不太敢開始", scores: { stable: 2, soothe: 1 } },
    { id: "B", text: "不太喜歡被叫去做,要自己有感覺才願意靠近", scores: { explore: 2, action: 1 } },
    { id: "C", text: "其實知道要做什麼,但就是拖著不動", scores: { action: 2, stable: 1 } },
    { id: "D", text: "一開始還可以,但很快就分心跑掉", scores: { focus: 2, reconnect: 1 } },
  ] },
  { id: "q2", prompt: "當你提醒孩子「差不多該開始了」,他比較常是什麼反應?", options: [
    { id: "A", text: "更退、更僵,感覺更不想開始", scores: { stable: 2, soothe: 1 } },
    { id: "B", text: "情緒先上來,變煩、變急、變抗拒", scores: { soothe: 2, stable: 1 } },
    { id: "C", text: "嘴上說好,但還是不動", scores: { action: 2, explore: 1 } },
    { id: "D", text: "一下被打斷之後,就整個斷掉很難回來", scores: { reconnect: 2, soothe: 1 } },
  ] },
  { id: "q3", prompt: "孩子進到流程之後,最常卡住的是哪一種?", options: [
    { id: "A", text: "做到一半情緒就起來了", scores: { soothe: 2, reconnect: 1 } },
    { id: "B", text: "常常東看西看,注意力抓不住", scores: { focus: 2, explore: 1 } },
    { id: "C", text: "一停下來就很難再接回去", scores: { reconnect: 2, focus: 1 } },
    { id: "D", text: "其實都懂,但需要有人再推一下才會繼續", scores: { action: 2, focus: 1 } },
  ] },
  { id: "q4", prompt: "如果現在只能選一種陪伴方式,你覺得孩子最需要哪一種?", options: [
    { id: "A", text: "先被接住,先不要急", scores: { soothe: 2, stable: 1 } },
    { id: "B", text: "先安心、有安全感,再慢慢開始", scores: { stable: 2, soothe: 1 } },
    { id: "C", text: "先讓他覺得有趣,願意往前看", scores: { explore: 2, action: 1 } },
    { id: "D", text: "先幫他把眼前這一步看清楚", scores: { focus: 2, reconnect: 1 } },
  ] },
  { id: "q5", prompt: "孩子一旦中斷,最常發生什麼?", options: [
    { id: "A", text: "覺得前面白做了,乾脆不回去了", scores: { reconnect: 2, soothe: 1 } },
    { id: "B", text: "中斷後情緒會變差,要先安撫", scores: { soothe: 2, reconnect: 1 } },
    { id: "C", text: "中斷後只是散掉,需要重新對焦", scores: { focus: 2, reconnect: 1 } },
    { id: "D", text: "中斷後如果有人推一下,還有機會繼續", scores: { action: 2, stable: 1 } },
  ] },
  { id: "q6", prompt: "你自己現在最常覺得哪一種情況最難帶?", options: [
    { id: "A", text: "不知道怎麼讓孩子安心進場", scores: { stable: 2, soothe: 1 } },
    { id: "B", text: "不知道怎麼讓孩子願意自己靠近任務", scores: { explore: 2, action: 1 } },
    { id: "C", text: "不知道怎麼接住情緒後再往下走", scores: { soothe: 2, reconnect: 1 } },
    { id: "D", text: "不知道怎麼在斷掉之後幫他接回去", scores: { reconnect: 2, focus: 1 } },
  ] },
  { id: "q7", prompt: "如果今天只能先改善一件事,你最想先改善哪一個?", options: [
    { id: "A", text: "讓孩子比較敢開始", scores: { stable: 3, action: 1 } },
    { id: "B", text: "讓孩子不要一開始就那麼抗拒", scores: { soothe: 3, explore: 1 } },
    { id: "C", text: "讓孩子做到一半不要那麼容易散掉", scores: { focus: 3, reconnect: 1 } },
    { id: "D", text: "讓孩子停掉之後還回得去", scores: { reconnect: 3, soothe: 1 } },
  ] },
];

export const energyCards: EnergyCard[] = [
  { label: "+1", amount: 1, kind: "daily" },
  { label: "+2", amount: 2, kind: "daily" },
  { label: "+3", amount: 3, kind: "daily" },
  { label: "+4", amount: 4, kind: "daily" },
  { label: "+5", amount: 5, kind: "daily" },
  { label: "+10", amount: 10, kind: "boost" },
  { label: "+30", amount: 30, kind: "boost" },
  { label: "+50", amount: 50, kind: "boost" },
  { label: "+100", amount: 100, kind: "boost" },
];

export const rainbowCore = {
  title: "Ultra Energy|Rainbow Core",
  desc: "完成一個重大請求,不需要消耗能量,只能用在有意義或特別的事上。",
};


export const heroRuleBook: Record<string, HeroRule> = {
  "focus-knight": {
    skillName: "Focus Retry",
    detail: "可合法重新聚焦 1 分鐘,不算失敗,之後回到原任務或重啟同一張時間卡。",
    baseUses: 3,
  },
  "calm-commander": {
    skillName: "Calm Shield",
    detail: "可啟動 1 分鐘情緒緩衝,不算失敗,之後回原任務或降階挑戰。",
    baseUses: 3,
  },
  "mission-finisher": {
    skillName: "Finish Push",
    detail: "收尾階段啟動 1 分鐘完成模式,若順利收完,本輪多拿 1 顆獎勵 Orb。",
    baseUses: 3,
  },
  "restart-champion": {
    skillName: "Restart Boost",
    detail: "中斷後可保留部分進度重新接回,或重開同一張時間卡而不算失敗。",
    baseUses: 3,
  },
  "mindsteel-ranger": {
    skillName: "Mindsteel Guard",
    detail: "在干擾變多或規則變動時,先穩住任務結構,再帶孩子回到主線。",
    baseUses: 3,
    supportMinutes: 1,
    triggerType: "structure",
  },
  "holton-reward": {
    skillName: "Reward Echo",
    detail: "任務成功完成後,可額外獲得 +1 顆能量球,放大這輪完成感。",
    baseUses: 2,
    triggerType: "completion-bonus",
  },
  "holton-ascend": {
    skillName: "Ascend Window",
    detail: "本輪可獲得 +2 分鐘高階支援時間,或一次合法升階挑戰機會。",
    baseUses: 2,
    supportMinutes: 2,
    triggerType: "upgrade-window",
  },
};
