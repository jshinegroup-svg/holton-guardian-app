import { StyleSheet, Text, View } from "react-native";

import { clamp } from "../../lib/holtonHelpers";

export function ProgressBar({ value, color = "#2563eb" }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamp(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 10, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  sectionTitleWrap: { marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a", lineHeight: 30 },
  sectionSubtitle: { fontSize: 16, color: "#64748b", marginTop: 6, lineHeight: 24, fontWeight: "500" },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e2e8f0", alignSelf: "flex-start", borderWidth: 1, borderColor: "#cbd5e1" },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { fontSize: 14, color: "#334155", fontWeight: "700", letterSpacing: 0.2 },
  pillTextActive: { color: "#fff" },
});
