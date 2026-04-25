import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useAuthStore } from "@/store/auth";
import { useExperimentStore } from "@/store/experiment";
import { useOnboardingStore } from "@/store/onboarding";
import { useHealthStore } from "@/store/health";

import {
  updateBaseline,
  getAllExperiments,
  getBaseline,
} from "@/api/experiments";

import SourceToggle from "@/components/SourceToggle";
import { router } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const C = {
  primary: "#6366f1",
  bg: "#f8f9ff",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  success: "#10b981",
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { clear } = useExperimentStore();

  const { sleepSource, exerciseSource, setSleepSource, setExerciseSource } =
    useHealthStore();

  const [baseline, setBaseline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    (async () => {
      const res = await getBaseline();
      if (res.ok) setBaseline(res.data);

      const exp = await getAllExperiments();
      if (exp.ok) {
        const total = exp.data.length;
        const completed = exp.data.filter(
          (e: any) => e.status === "completed",
        ).length;
        setStats({ total, completed });
      }

      setLoading(false);
    })();
  }, []);

  async function handleLogout() {
    await logout();
    await GoogleSignin.signOut();
    clear();
    useOnboardingStore.getState().reset();
    router.replace("/");
  }

  const SliderRow = (label: string, key: string, max = 10) => (
    <View style={{ marginBottom: 18 }}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{Math.round(baseline[key])}</Text>
      </View>

      <Slider
        value={baseline[key]}
        onValueChange={(v) =>
          setBaseline((prev: any) => ({ ...prev, [key]: v }))
        }
        minimumValue={0}
        maximumValue={max}
        thumbTintColor={C.primary}
        maximumTrackTintColor={C.muted}
        step={1}
        minimumTrackTintColor={C.primary}
      />
    </View>
  );

  if (loading || !baseline) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 👤 PROFILE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Feather name="user" size={22} color={C.primary} />
            </View>
            <View>
              <Text style={styles.name}>{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* 📊 STATS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Your Progress</Text>

          <View style={styles.statsRow}>
            <Stat label="Experiments" value={stats.total} />
            <Stat label="Completed" value={stats.completed} />
          </View>
        </View>

        {/* ⚙️ BASELINE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Baseline</Text>
          <Text style={styles.meta}>
            Your starting point for measuring improvement
          </Text>

          {SliderRow("Sleep", "sleep_score")}
          {SliderRow("Focus", "focus_score")}
          {SliderRow("Mood", "mood_score")}
          {SliderRow("Screen Time", "phone_hours", 12)}
          {SliderRow("Exercise", "exercise_score")}
          {SliderRow("Confidence", "confidence_score")}

          <Pressable
            style={styles.saveBtn}
            onPress={async () => {
              const res = await updateBaseline(baseline);
              if (res.ok) {
                Alert.alert("Saved", "Baseline updated ✅");
              } else {
                Alert.alert("Error", res.error);
              }
            }}
          >
            <Text style={styles.saveText}>Save Changes</Text>
          </Pressable>
        </View>

        {/* 🔗 DATA SOURCE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔗 Data Sources</Text>
          <Text style={styles.meta}>
            Choose between manual input or Health Connect
          </Text>

          <SourceToggle
            label="Sleep"
            value={sleepSource}
            onChange={setSleepSource}
          />
          <SourceToggle
            label="Exercise"
            value={exerciseSource}
            onChange={setExerciseSource}
          />
        </View>

        {/* 🧠 AI */}
        <Pressable style={styles.card} onPress={() => router.push("/ai-coach")}>
          <Text style={styles.sectionTitle}>🧠 AI Coach</Text>
          <Text style={styles.meta}>
            Get smart suggestions to improve your habits →
          </Text>
        </Pressable>

        {/* 🚪 LOGOUT */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: C.text,
  },

  meta: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 12,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },

  name: { fontSize: 16, fontWeight: "700", color: C.text },
  email: { fontSize: 13, color: C.muted },

  statsRow: { flexDirection: "row", gap: 10 },

  statBox: {
    flex: 1,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  statValue: { fontSize: 20, fontWeight: "800", color: C.primary },
  statLabel: { fontSize: 12, color: C.muted },

  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  sliderLabel: { color: C.text, fontWeight: "600" },
  sliderValue: { color: C.primary, fontWeight: "700" },

  saveBtn: {
    marginTop: 10,
    backgroundColor: C.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "700" },

  logoutBtn: {
    marginTop: 10,
    marginBottom: 100,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
  },

  logoutText: { color: "#fff", fontWeight: "700" },
});
