import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getExperimentResult } from "@/api/experiments";
import { LineChart } from "react-native-chart-kit";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const C = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  primaryBg: "#eef2ff",
  bg: "#f8f9ff",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  border: "#e2e8f0",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  success: "#10b981",
  successBg: "#d1fae5",
  warn: "#f59e0b",
  warnBg: "#fef3c7",
  danger: "#ef4444",
  dangerBg: "#fee2e2",
};

const getScoreColor = (s: number) =>
  s <= 3 ? C.danger : s <= 6 ? C.warn : C.success;

const getScoreEmoji = (s: number) => (s <= 3 ? "😔" : s <= 6 ? "🙂" : "🎉");

const metricMeta: Record<string, { emoji: string; reverse?: boolean }> = {
  Sleep: { emoji: "😴" },
  Focus: { emoji: "🎯" },
  Mood: { emoji: "😊" },
  "Screen Time": { emoji: "📱", reverse: true },
  Exercise: { emoji: "💪" },
};

// ── Small components ──────────────────────────────────────────────────────────

function Chip({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[chip.wrap, { backgroundColor: bg }]}>
      <Text style={[chip.value, { color }]}>{value}</Text>
      <Text style={chip.label}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  value: { fontSize: 22, fontWeight: "800" },
  label: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
});

function LifeRow({
  icon,
  label,
  before,
  after,
}: {
  icon: string;
  label: string;
  before: number;
  after: number;
}) {
  const diff = after - before;
  const pos = diff >= 0;
  const fill = Math.min(Math.max(after / 10, 0), 1);
  const color = pos ? C.success : C.danger;
  return (
    <View style={life.row}>
      <Text style={life.icon}>{icon}</Text>
      <Text style={life.label}>{label}</Text>
      <View style={life.barWrap}>
        <View style={life.barBg}>
          <View
            style={[
              life.barFill,
              { width: `${fill * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
      <Text style={[life.diff, { color }]}>
        {pos ? "+" : ""}
        {diff.toFixed(1)}
      </Text>
    </View>
  );
}
const life = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  icon: { fontSize: 18, width: 26 },
  label: { fontSize: 14, color: C.textSecondary, fontWeight: "600", width: 72 },
  barWrap: { flex: 1 },
  barBg: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  diff: { fontSize: 13, fontWeight: "700", width: 38, textAlign: "right" },
});

function MetricCard({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const meta = metricMeta[label] ?? { emoji: "📊" };
  const diff = after - before;
  const improved = meta.reverse ? diff <= 0 : diff >= 0;
  const color = improved ? C.success : C.danger;
  const bg = improved ? C.successBg : C.dangerBg;
  const fill = Math.min(Math.max(after / 10, 0), 1);
  return (
    <View style={mc.card}>
      <View style={mc.header}>
        <Text style={mc.emoji}>{meta.emoji}</Text>
        <Text style={mc.label}>{label}</Text>
        <View style={[mc.badge, { backgroundColor: bg }]}>
          <Text style={[mc.badgeText, { color }]}>
            {improved ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={mc.row}>
        <Text style={mc.before}>{before.toFixed(1)}</Text>
        <View style={mc.barWrap}>
          <View style={mc.barBg}>
            <View
              style={[
                mc.barFill,
                { width: `${fill * 100}%`, backgroundColor: color },
              ]}
            />
          </View>
        </View>
        <Text style={[mc.after, { color }]}>{after.toFixed(1)}</Text>
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  emoji: { fontSize: 20 },
  label: { flex: 1, color: C.text, fontWeight: "700", fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  before: { color: C.textMuted, fontSize: 13, fontWeight: "600", width: 28 },
  barWrap: { flex: 1 },
  barBg: {
    height: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  after: { fontSize: 14, fontWeight: "800", width: 28, textAlign: "right" },
});

function SubCard({ sub }: { sub: { name: string; average: number } }) {
  const color = getScoreColor(sub.average);
  return (
    <View style={sc.card}>
      <Text style={sc.emoji}>{getScoreEmoji(sub.average)}</Text>
      <View style={{ flex: 1 }}>
        <View style={sc.top}>
          <Text style={sc.name}>{sub.name}</Text>
          <Text style={[sc.score, { color }]}>{sub.average.toFixed(1)}/10</Text>
        </View>
        <View style={sc.barBg}>
          <View
            style={[
              sc.barFill,
              { width: `${(sub.average / 10) * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emoji: { fontSize: 26 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: { color: C.text, fontWeight: "700", fontSize: 15 },
  score: { fontSize: 14, fontWeight: "700" },
  barBg: {
    height: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const shareRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getExperimentResult(Number(id))
      .then((res) => {
        if (res?.ok && res.data) setData(res.data);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && data) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, data]);

  const handleShare = async () => {
    try {
      if (!shareRef.current) return;
      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={s.loadingText}>Loading your results…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 52 }}>🔍</Text>
        <Text style={s.emptyTitle}>No result found</Text>
        <Pressable onPress={() => router.back()} style={s.emptyBtn}>
          <Text style={{ color: C.primary, fontWeight: "700", fontSize: 15 }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const {
    baseline,
    final,
    score_before,
    score_after,
    daily_scores,
    sub_experiments,
    sub_summary,
    summary,
    title,
  } = data;
  const totalDays = daily_scores?.length ?? 0;
  const avgScore = daily_scores?.length
    ? (
        daily_scores.reduce((s: number, d: any) => s + d.score, 0) /
        daily_scores.length
      ).toFixed(1)
    : "—";

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.text} />
        </Pressable>
        <Text style={s.topTitle}>Your Results 🎉</Text>
        <Pressable onPress={handleShare} style={s.shareBtn}>
          <Feather name="share-2" size={16} color={C.primary} />
          <Text style={s.shareBtnText}>Share</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Hero / share card */}
          <ViewShot ref={shareRef} style={s.heroCard}>
            <View style={s.heroStrip} />
            <Text style={s.heroEyebrow}>EXPERIMENT COMPLETE</Text>
            <Text style={s.heroTitle}>{title}</Text>

            <View style={s.chips}>
              <Chip
                label="Days"
                value={`${totalDays}`}
                color={C.primary}
                bg={C.primaryBg}
              />
              <View style={{ width: 10 }} />
              <Chip
                label="Avg Score"
                value={avgScore}
                color={C.success}
                bg={C.successBg}
              />
            </View>

            <View style={s.lifeBox}>
              <Text style={s.lifeBoxLabel}>HOW YOU CHANGED</Text>
              <LifeRow
                icon="🧠"
                label="Mind"
                before={score_before?.mind ?? 0}
                after={score_after?.mind ?? 0}
              />
              <LifeRow
                icon="💪"
                label="Body"
                before={score_before?.body ?? 0}
                after={score_after?.body ?? 0}
              />
              <LifeRow
                icon="⚡"
                label="Discipline"
                before={score_before?.discipline ?? 0}
                after={score_after?.discipline ?? 0}
              />
            </View>

            {/* Key metric changes */}
            {(() => {
              const wins = [
                ["Sleep", baseline?.sleep_score, final?.sleep_score],
                ["Focus", baseline?.focus_score, final?.focus_score],
                ["Mood", baseline?.mood_score, final?.mood_score],
                ["Exercise", baseline?.exercise_score, final?.exercise_score],
              ].filter(([_, b, a]: any) => a - b > 0);
              if (!wins.length) return null;
              return (
                <View style={s.heroChanges}>
                  <Text style={s.heroChangesLabel}>KEY CHANGES</Text>
                  {wins.slice(0, 3).map(([label, b, a]: any, i: number) => (
                    <View key={i} style={s.heroChangeRow}>
                      <Text style={s.heroChangeIcon}>▲</Text>
                      <Text style={s.heroChangeText}>{label}</Text>
                      <Text style={s.heroChangeDiff}>
                        +{(a - b).toFixed(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* Habit wins */}
            {sub_experiments?.length > 0 &&
              (() => {
                const top = [...sub_experiments]
                  .sort((a: any, b: any) => b.average - a.average)
                  .slice(0, 2);
                return (
                  <View
                    style={[
                      s.heroChanges,
                      {
                        borderTopWidth: 1,
                        borderTopColor: C.border,
                        marginTop: 0,
                        paddingTop: 12,
                      },
                    ]}
                  >
                    <Text style={s.heroChangesLabel}>🔥 HABIT WINS</Text>
                    {top.map((sub: any, i: number) => (
                      <View key={i} style={s.heroChangeRow}>
                        <Text style={s.heroChangeIcon}>▲</Text>
                        <Text style={s.heroChangeText}>{sub.name}</Text>
                        <Text style={s.heroChangeDiff}>
                          {sub.average.toFixed(1)}/10
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })()}

            <Text style={s.heroBranding}>Made with HabitLab ✨</Text>
          </ViewShot>

          {/* Metrics */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📊 What changed</Text>
            <MetricCard
              label="Sleep"
              before={baseline.sleep_score}
              after={final.sleep_score}
            />
            <MetricCard
              label="Focus"
              before={baseline.focus_score}
              after={final.focus_score}
            />
            <MetricCard
              label="Mood"
              before={baseline.mood_score}
              after={final.mood_score}
            />
            <MetricCard
              label="Screen Time"
              before={baseline.phone_hours}
              after={final.phone_hours}
            />
            <MetricCard
              label="Exercise"
              before={baseline.exercise_score}
              after={final.exercise_score}
            />
          </View>

          {/* Chart */}
          {daily_scores?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>📈 Day by day</Text>
              <View style={s.chartCard}>
                <LineChart
                  data={{
                    labels: daily_scores.map((d: any) => `Day ${d.day}`),
                    datasets: [
                      {
                        data: daily_scores.map((d: any) => d.score),
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={SCREEN_WIDTH - 48}
                  height={210}
                  chartConfig={{
                    backgroundColor: "#1e1b4b",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(165, 180, 252, ${opacity})`,
                    labelColor: () => "#a5b4fc",
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#818cf8",
                      fill: "#312e81",
                    },
                    propsForBackgroundLines: {
                      stroke: "#3730a3",
                      strokeDasharray: "4",
                    },
                    fillShadowGradient: "#6366f1",
                    fillShadowGradientOpacity: 0.25,
                  }}
                  bezier
                  withInnerLines
                  withOuterLines={false}
                  style={{ borderRadius: 16 }}
                />
                <View style={s.chartLegend}>
                  <View style={s.chartLegendDot} />
                  <Text style={s.chartLegendText}>
                    Daily habit score over time
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sub-experiments */}
          {sub_experiments?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>🧪 Habits tracked</Text>
              {sub_experiments
                .sort((a: any, b: any) => b.average - a.average)
                .map((sub: any, i: number) => (
                  <SubCard key={i} sub={sub} />
                ))}

              {sub_summary && sub_experiments.length > 1 && (
                <View style={s.insightBox}>
                  <View style={s.insightRow}>
                    <Text style={s.insightIcon}>🏆</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.insightMeta}>Best habit</Text>
                      <Text style={s.insightName}>
                        {sub_summary.best?.name}
                      </Text>
                    </View>
                    <Text style={[s.insightScore, { color: C.success }]}>
                      {sub_summary.best?.average?.toFixed(1)}/10
                    </Text>
                  </View>
                  <View style={s.insightDivider} />
                  <View style={s.insightRow}>
                    <Text style={s.insightIcon}>💡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.insightMeta}>Needs more love</Text>
                      <Text style={s.insightName}>
                        {sub_summary.worst?.name}
                      </Text>
                    </View>
                    <Text style={[s.insightScore, { color: C.warn }]}>
                      {sub_summary.worst?.average?.toFixed(1)}/10
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* AI summary */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🧠 What the data says</Text>
            <View style={s.summaryCard}>
              {summary
                .split("\n")
                .filter((l: string) => l.trim())
                .map((line: string, i: number) => (
                  <View key={i} style={s.summaryRow}>
                    <View style={s.summaryDot} />
                    <Text style={s.summaryText}>{line.replace("• ", "")}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* CTAs */}
          <View style={s.ctaArea}>
            <Pressable onPress={handleShare} style={s.shareFullBtn}>
              <Feather name="share-2" size={18} color={C.primary} />
              <Text style={s.shareFullBtnText}>Share My Results</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/start")}
              style={s.nextBtn}
            >
              <Text style={s.nextBtnText}>Start Next Experiment 🚀</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { color: C.textSecondary, fontSize: 15, marginTop: 14 },
  emptyTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.primary,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { flex: 1, color: C.text, fontSize: 17, fontWeight: "700" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryBg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  shareBtnText: { color: C.primary, fontWeight: "700", fontSize: 13 },

  scrollContent: { paddingBottom: 60 },

  heroCard: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroStrip: { height: 6, backgroundColor: C.primary },
  heroEyebrow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    color: C.primaryLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroTitle: {
    paddingHorizontal: 20,
    paddingTop: 4,
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 30,
  },
  chips: { flexDirection: "row", paddingHorizontal: 20, marginTop: 16 },
  lifeBox: {
    margin: 20,
    marginTop: 16,
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 16,
  },
  lifeBoxLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroBranding: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  heroChanges: {
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  heroChangesLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroChangeIcon: { color: C.success, fontSize: 12, fontWeight: "700" },
  heroChangeText: { flex: 1, color: C.text, fontSize: 14, fontWeight: "600" },
  heroChangeDiff: { color: C.success, fontSize: 14, fontWeight: "700" },

  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#818cf8",
  },
  chartLegendText: { color: C.textSecondary, fontSize: 12, fontWeight: "500" },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  chartCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: "#312e81",
    overflow: "hidden",
    paddingBottom: 12,
  },

  insightBox: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
  },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  insightIcon: { fontSize: 24 },
  insightMeta: { color: C.textMuted, fontSize: 11, fontWeight: "600" },
  insightName: { color: C.text, fontWeight: "700", fontSize: 15, marginTop: 1 },
  insightScore: { fontSize: 16, fontWeight: "800" },
  insightDivider: { height: 1, backgroundColor: C.border, marginVertical: 14 },

  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  summaryText: {
    flex: 1,
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },

  ctaArea: { paddingHorizontal: 16, marginTop: 28, gap: 12 },
  shareFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: C.primaryBg,
  },
  shareFullBtnText: { color: C.primary, fontWeight: "700", fontSize: 16 },
  nextBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
