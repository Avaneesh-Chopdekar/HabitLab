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

import { useAuthStore } from "@/store/auth";
import { useExperimentStore } from "@/store/experiment";
import { useOnboardingStore } from "@/store/onboarding";

import {
  updateBaseline,
  getAllExperiments,
  getBaseline,
} from "@/api/experiments";

import SourceToggle from "@/components/SourceToggle";
import { useHealthStore } from "@/store/health";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { clear } = useExperimentStore();

  const [baseline, setBaseline] = useState<any>(null);
  const [loadingBaseline, setLoadingBaseline] = useState(true);

  const { sleepSource, exerciseSource, setSleepSource, setExerciseSource } =
    useHealthStore();

  useEffect(() => {
    const loadBaseline = async () => {
      try {
        const res = await getBaseline();

        if (res.ok) {
          setBaseline(res.data);
        } else {
          Alert.alert("Error", res.error);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load baseline");
      } finally {
        setLoadingBaseline(false);
      }
    };

    loadBaseline();
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
  });

  // ✅ FETCH STATS
  useEffect(() => {
    const loadStats = async () => {
      const res = await getAllExperiments();
      if (res.ok) {
        const total = res.data.length;
        const completed = res.data.filter(
          (e: any) => e.status === "completed",
        ).length;

        setStats({ total, completed });
      }
    };

    loadStats();
  }, []);

  async function handleLogout() {
    await logout();
    await GoogleSignin.signOut();
    clear();
    useOnboardingStore.getState().reset();
    router.replace("/");
  }

  const SliderRow = (label: string, key: string, max = 10) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13 }}>
        {label} ({Math.round(baseline[key])})
      </Text>

      <Slider
        value={Math.round(baseline[key])}
        onValueChange={(v) =>
          setBaseline((prev: any) => ({
            ...prev,
            [key]: v,
          }))
        }
        minimumValue={0}
        maximumValue={max}
        step={1}
      />
    </View>
  );

  if (loadingBaseline || !baseline) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* 👤 PROFILE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>

        {/* 📊 STATS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>

          <Text style={styles.value}>Experiments: {stats.total}</Text>

          <Text style={styles.value}>Completed: {stats.completed} ✅</Text>
        </View>

        {/* ⚙️ BASELINE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Your Baseline</Text>

          {SliderRow("Sleep", "sleep_score")}
          {SliderRow("Focus", "focus_score")}
          {SliderRow("Mood", "mood_score")}
          {SliderRow("Screen Time", "phone_hours", 12)}
          {SliderRow("Exercise", "exercise_score")}
          {SliderRow("Confidence", "confidence_score")}

          <Pressable
            style={styles.button}
            onPress={async () => {
              const res = await updateBaseline(baseline);
              if (res.ok) {
                Alert.alert("Saved", "Baseline updated ✅");
                const fresh = await getBaseline();
                if (fresh.ok) setBaseline(fresh.data);
              } else {
                Alert.alert("Error", res.error);
              }
            }}
          >
            <Text style={styles.buttonText}>Save Baseline</Text>
          </Pressable>
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "#888",
            marginTop: -10,
            marginBottom: 10,
          }}
        >
          Use Health Connect data automatically or enter manually
        </Text>

        <SourceToggle
          label="Sleep Data Source"
          value={sleepSource}
          onChange={setSleepSource}
        />

        <SourceToggle
          label="Exercise Data Source"
          value={exerciseSource}
          onChange={setExerciseSource}
        />

        {/* 🧠 AI COACH */}
        <Pressable style={styles.card} onPress={() => router.push("/ai-coach")}>
          <Text style={styles.sectionTitle}>🧠 AI Coach</Text>
          <Text style={styles.meta}>Get personalized habit suggestions →</Text>
        </Pressable>

        {/* 🚪 LOGOUT */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F8FB",
  },

  scrollView: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
  },

  meta: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#6C5CE7",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  logoutBtn: {
    marginTop: "auto",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
