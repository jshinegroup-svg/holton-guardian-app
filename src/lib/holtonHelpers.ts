import type {
  AssistLevel,
  ExperimentRun,
  InterruptionKind,
  MissionHistoryEntry,
  MissionOutcome,
  RealSessionEvent,
  RealSessionReviewFilter,
  RealSessionStatus,
  RealTestSession,
  RealWorkflowStage,
  RulePreset,
  ScenarioKind,
  SessionEnvironment,
  SupportReminderMode,
  TestingScenarioSnapshot,
} from "../types/holton";

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function clamp(value: number, max = 100) {
  return Math.max(0, Math.min(max, value));
}

export function clampRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function coreGuardianStageFromLevel(level: number) {
  if (level >= 61) return "覺醒體";
  if (level >= 31) return "守護體";
  if (level >= 11) return "成長體";
  return "幼體";
}

export function nextCoreGuardianStageTarget(level: number) {
  if (level < 11) return 11;
  if (level < 31) return 31;
  if (level < 61) return 61;
  return 100;
}

export function coreGuardianWeeklyTargetForLevel(level: number) {
  if (level >= 61) return 6;
  if (level >= 31) return 5;
  if (level >= 11) return 4;
  return 3;
}

export function presetLabel(preset: RulePreset) {
  return preset === "conservative"
    ? "保守版"
    : preset === "balanced"
      ? "平衡版"
      : preset === "relaxed"
        ? "寬鬆版"
        : "高挑戰版";
}

export function outcomeLabel(outcome: MissionOutcome) {
  return outcome === "smooth" ? "順利完成" : outcome === "rescued" ? "補救後完成" : "中途中止";
}

export function scenarioKindLabel(kind: ScenarioKind) {
  return kind === "normal"
    ? "正常一輪"
    : kind === "extra-time"
      ? "延長情境"
      : kind === "break"
        ? "短休情境"
        : kind === "restart"
          ? "重接情境"
      : "事件情境";
}

export function supportReminderModeLabel(mode: SupportReminderMode) {
  return mode === "screen-sound"
    ? "聲音 + 畫面"
    : mode === "screen-only"
      ? "只有畫面"
      : "靜音";
}

export function riskLevelLabel(score: number) {
  if (score >= 75) return "高風險";
  if (score >= 45) return "中風險";
  return "低風險";
}

export function environmentLabel(environment: SessionEnvironment) {
  return environment === "real" ? "真實操作" : "模擬測試";
}

export function isoNow() {
  return new Date().toISOString();
}

export function dayKeyFromIso(iso: string) {
  return iso.slice(0, 10);
}

export function todayDayKey() {
  return dayKeyFromIso(isoNow());
}

export function formatDurationMinutes(startedAtIso: string, endedAtIso?: string | null) {
  const start = Date.parse(startedAtIso);
  const end = endedAtIso ? Date.parse(endedAtIso) : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "未滿 1 分鐘";

  const totalMinutes = Math.max(1, Math.round((end - start) / 60000));
  if (totalMinutes < 60) return `${totalMinutes} 分鐘`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} 小時` : `${hours} 小時 ${minutes} 分鐘`;
}

export function realSessionReviewFilterLabel(filter: RealSessionReviewFilter) {
  return filter === "today"
    ? "只看今天"
    : filter === "live"
      ? "進行中"
      : filter === "completed"
        ? "已完成"
        : filter === "stopped"
          ? "已中止"
          : "全部真實紀錄";
}

export function sessionStatusLabel(status: RealSessionStatus) {
  return status === "live" ? "進行中" : status === "completed" ? "已完成" : "已中止";
}

export function formatShareBlock(title: string, lines: string[]) {
  return [`【${title}】`, ...lines].join("\n");
}

export function formatBulletLine(label: string, value: string) {
  return `• ${label}:${value}`;
}

export function formatNumberedLine(index: number, label: string, value: string) {
  return `${index}. ${label}:${value}`;
}

export function pickTopLabel(values: string[], fallback: string) {
  if (values.length === 0) return fallback;
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

export function assistLevelLabel(level: AssistLevel) {
  return level === "verbal"
    ? "口語提示"
    : level === "co-regulation"
      ? "共同調節"
      : level === "environment"
        ? "環境調整"
        : "肢體協助";
}

export function interruptionKindLabel(kind: InterruptionKind) {
  return kind === "transition-resistance"
    ? "轉換抗拒"
    : kind === "sensory"
      ? "感官干擾"
      : kind === "bathroom"
        ? "如廁"
        : kind === "food"
          ? "吃喝需求"
          : kind === "sibling"
            ? "手足干擾"
            : kind === "device"
              ? "裝置分心"
              : "其他";
}

export function compactText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export const realWorkflowStages: RealWorkflowStage[] = ["prep", "entry", "main", "recovery", "packup"];

export function workflowStageLabel(stage: RealWorkflowStage) {
  return stage === "prep"
    ? "準備"
    : stage === "entry"
      ? "進場"
      : stage === "main"
        ? "主流程"
        : stage === "recovery"
          ? "補救"
          : "收尾";
}

export function currentWorkflowStage(session: RealTestSession): RealWorkflowStage {
  const marker = session.events.find((event) => event.title === "Workflow stage");
  const stage = marker?.detail.split("|")[0] as RealWorkflowStage | undefined;
  if (stage && realWorkflowStages.includes(stage)) return stage;
  if (session.status === "stopped") return "recovery";
  if (session.status === "completed") return "packup";
  return "prep";
}

export function sessionHandoffCoverage(session: RealTestSession) {
  const checks = [
    { label: "操作員", pass: compactText(session.operatorName) !== "" && session.operatorName !== "未填寫" },
    { label: "現場描述", pass: compactText(session.childContext) !== "" && session.childContext !== "未填寫" },
    { label: "目標", pass: compactText(session.missionGoal) !== "" },
    { label: "交班下一步", pass: compactText(session.nextAction) !== "" },
    { label: "timeline", pass: session.events.length >= 2 },
    { label: "結束結果", pass: session.status === "live" ? false : session.outcome !== null },
  ];
  const passed = checks.filter((item) => item.pass).length;
  const missing = checks.filter((item) => !item.pass).map((item) => item.label);
  return {
    passed,
    total: checks.length,
    score: Math.round((passed / checks.length) * 100),
    missing,
    label: missing.length === 0 ? "可直接交班" : `待補 ${missing.slice(0, 2).join(" / ")}`,
  };
}

export function operatorActionPriority(session: RealTestSession) {
  const coverage = sessionHandoffCoverage(session);
  if (session.status === "live" && coverage.score < 80) return "先補交班";
  if (session.status === "live") return "立即交班";
  if (session.status === "stopped") return "優先補救";
  if (session.outcome === "rescued") return "驗證補救";
  return "維持基準";
}

export function summarizeSessionFocus(session: RealTestSession) {
  if (session.status === "live") return `live session 尚未收尾,先完成 ${compactText(session.nextAction) || "下一步"}`;
  if (session.status === "stopped") return `中止後先回看 ${compactText(session.nextAction) || "交班提醒"}`;
  if (session.outcome === "rescued") return `本輪靠補救完成,明天先重播 ${session.challengeName}`;
  return `本輪可作為 ${presetLabel(session.preset)} baseline 候選`;
}

export function summarizeEventTaxonomy(event: RealSessionEvent) {
  const detail = compactText(`${event.title} ${event.detail} ${event.impact ?? ""}`).toLowerCase();
  const phase = /開始|進場|拖延|轉換|回位/.test(detail)
    ? "進場"
    : /收尾|結束|完成|整理|離場/.test(detail)
      ? "收尾"
      : /感官|噪音|裝置|手機|平板/.test(detail)
        ? "環境"
        : "主流程";

  if (event.kind === "assist") {
    const recovery = /環境|座位|移開|調整/.test(detail)
      ? "環境補救"
      : /一起|共同|陪/.test(detail)
        ? "共同調節"
        : /肢體/.test(detail)
          ? "肢體協助"
          : "口語補救";
    return { bucket: "recovery", label: recovery, phase } as const;
  }

  if (event.kind === "interruption") {
    const failure = /裝置|手機|平板/.test(detail)
      ? "裝置拉走"
      : /感官|噪音|聲音/.test(detail)
        ? "感官干擾"
        : /吃|喝|如廁/.test(detail)
          ? "生理需求"
          : /手足/.test(detail)
            ? "同伴干擾"
            : /拖延|離開|轉換/.test(detail)
              ? "轉換卡住"
              : "其他中斷";
    return { bucket: "failure", label: failure, phase } as const;
  }

  if (event.kind === "outcome") {
    return {
      bucket: event.title.includes("中止") ? "failure" : event.title.includes("補救") ? "recovery" : "neutral",
      label: event.title.includes("中止") ? "結果:中止" : event.title.includes("補救") ? "結果:補救完成" : "結果:順利完成",
      phase: "收尾",
    } as const;
  }

  const neutral = /有效|穩|自己回位|自行/.test(detail) ? "正向觀察" : "現場備註";
  return { bucket: "neutral", label: neutral, phase } as const;
}

export function dedupeMissionHistory(entries: MissionHistoryEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.id}::${entry.challengeName}::${entry.outcome}::${entry.branchSummary}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function dedupeExperimentRuns(entries: ExperimentRun[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.id}::${entry.scenarioName}::${entry.challengeName}::${entry.outcome}::${entry.fingerprint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildSessionTaxonomy(session: RealTestSession) {
  const items = session.events.map((event) => ({ event, summary: summarizeEventTaxonomy(event) }));
  const failures = items.filter((item) => item.summary.bucket === "failure");
  const recoveries = items.filter((item) => item.summary.bucket === "recovery");
  const neutrals = items.filter((item) => item.summary.bucket === "neutral");
  const topFailure = pickTopLabel(failures.map((item) => `${item.summary.phase}|${item.summary.label}`), "尚未記錄失敗型事件");
  const topRecovery = pickTopLabel(recoveries.map((item) => `${item.summary.phase}|${item.summary.label}`), "尚未記錄補救型事件");
  const topNeutral = pickTopLabel(neutrals.map((item) => `${item.summary.phase}|${item.summary.label}`), "尚未記錄正向觀察");
  const ratio = failures.length === 0 ? `${recoveries.length}:0` : `${recoveries.length}:${failures.length}`;
  const lines = items.slice(0, 6).map(({ event, summary }) => `${event.createdAtLabel}|${summary.phase}|${summary.label}|${event.detail}`);
  return {
    failures: failures.length,
    recoveries: recoveries.length,
    neutrals: neutrals.length,
    topFailure,
    topRecovery,
    topNeutral,
    ratio,
    lines,
  };
}

export function scenarioFingerprint(snapshot: Pick<TestingScenarioSnapshot, "kind" | "challengeId" | "selectedHeroId" | "selectedBeastId" | "taskPower" | "emotionPower" | "focusPower" | "missionsDoneToday" | "worldEventsDrawnToday" | "extraTimeRequestsToday" | "breakCountToday" | "restartCountToday" | "nextWorldEventId" | "ruleConfig">) {
  const eventKey = snapshot.nextWorldEventId ?? "cycle";
  const rule = snapshot.ruleConfig;
  return [
    scenarioKindLabel(snapshot.kind),
    snapshot.challengeId,
    snapshot.selectedHeroId,
    snapshot.selectedBeastId,
    `${snapshot.taskPower}-${snapshot.emotionPower}-${snapshot.focusPower}`,
    `${snapshot.missionsDoneToday}-${snapshot.worldEventsDrawnToday}-${snapshot.extraTimeRequestsToday}-${snapshot.breakCountToday}-${snapshot.restartCountToday}`,
    `${rule.preset}-${rule.dailyMissionCap}-${rule.worldEventCap}-${rule.exceptionCap}-${rule.stage2UnlockDays}-${rule.baselinePreset}`,
    eventKey,
  ].join(" • ");
}

export function reproducibilityScore(snapshot: Pick<TestingScenarioSnapshot, "kind" | "nextWorldEventId" | "extraTimeRequestsToday" | "breakCountToday" | "restartCountToday" | "ruleConfig">) {
  let score = 55;
  if (snapshot.nextWorldEventId) score += 15;
  if (snapshot.kind !== "normal") score += 10;
  if (snapshot.extraTimeRequestsToday === 0 && snapshot.breakCountToday === 0 && snapshot.restartCountToday === 0) score += 10;
  if (snapshot.ruleConfig.baselinePreset === snapshot.ruleConfig.preset) score += 10;
  return clampRange(score, 0, 100);
}
