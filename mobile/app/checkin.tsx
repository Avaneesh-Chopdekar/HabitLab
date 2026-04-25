import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { dailyCheckin } from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHealthStore } from "@/store/health";
import { getCachedHealthData, setCachedHealthData } from "@/utils/healthCache";

// 🔥 HEALTH IMPORTS
import {
  getStepsToday,
  getActiveMinutesToday,
  getAvgHeartRateToday,
  getSleepToday,
} from "@/utils/health";

import {
  calculateAdaptiveExerciseScore,
  calculateEffortScore,
} from "@/utils/exerciseScore";

export default function CheckinScreen() {
  const router = useRouter();
  const { current, fetchCurrent } = useExperimentStore();
  const { sleepSource, exerciseSource } = useHealthStore();

  const useHealthSleep = sleepSource === "health";
  const useHealthExercise = exerciseSource === "health";

  const [form, setForm] = useState({
    sleep_score: 5,
    focus_score: 5,
    mood_score: 5,
    phone_hours: 3,
    exercise_score: 5,
    confidence: 5,
  });

  const [healthData, setHealthData] = useState({
    sleep_score: null as number | null,
    exercise_score: null as number | null,
    steps: 0,
    activeMinutes: 0,
    heartRate: 0,
  });

  const [subScores, setSubScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);

  // ✅ LOAD BASELINE
  useEffect(() => {
    if (current?.baseline) {
      setForm({
        sleep_score: current.baseline.sleep_score,
        focus_score: current.baseline.focus_score,
        mood_score: current.baseline.mood_score,
        phone_hours: current.baseline.phone_hours,
        exercise_score: current.baseline.exercise_score,
        confidence: current.baseline.confidence_score,
      });
    }
  }, [current]);

  useEffect(() => {
    if (current?.sub_experiments) {
      const initial: Record<number, number> = {};
      current.sub_experiments.forEach((s) => {
        initial[s.id] = 5;
      });
      setSubScores(initial);
    }
  }, [current?.sub_experiments]);

  // 🔥 HEALTH FETCH

  const loadHealthData = async () => {
    try {
      setHealthLoading(true);

      const cached = getCachedHealthData();
      if (cached) {
        setHealthData((prev) => ({
          ...prev,
          sleep_score: cached.sleep_score ?? null,
          exercise_score: cached.exercise_score ?? null,
          // don't touch steps/activeMinutes/heartRate from cache
        }));
        setHealthLoading(false);
        return;
      }

      let sleepHours = 0;
      let steps = 0;
      let activeMinutes = 0;
      let heartRate = 0;

      if (useHealthSleep) {
        sleepHours = await getSleepToday();
        if (sleepHours > 0) {
          const sleepScore = Math.min(10, Math.round((sleepHours / 8) * 10));
          setHealthData((prev) => ({ ...prev, sleep_score: sleepScore }));
        }
      }

      let finalExerciseScore: number | null = null;

      if (useHealthExercise) {
        steps = await getStepsToday();
        activeMinutes = await getActiveMinutesToday();
        heartRate = await getAvgHeartRateToday();

        if (activeMinutes > 0 || steps > 0) {
          finalExerciseScore = calculateAdaptiveExerciseScore({
            steps,
            activeMinutes,
            avgHeartRate: heartRate,
            baseline: current?.baseline || {
              steps_avg: 3000,
              active_minutes_avg: 20,
            },
          });
        }

        setHealthData((prev) => ({
          ...prev,
          exercise_score: finalExerciseScore,
          steps,
          activeMinutes,
          heartRate,
        }));
      }

      setCachedHealthData({
        sleep_score:
          sleepHours > 0
            ? Math.min(10, Math.round((sleepHours / 8) * 10))
            : null,
        exercise_score: finalExerciseScore,
      });
    } catch (err) {
      console.log("Health error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  // ✅ SINGLE CLEAN EFFECT
  useEffect(() => {
    loadHealthData();
  }, [useHealthSleep, useHealthExercise, current?.baseline]);

  const update = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSub = (id: number, value: number) => {
    setSubScores((prev) => ({ ...prev, [id]: value }));
  };

  const getIndicator = (value: number, reverse = false) => {
    if (reverse) {
      if (value <= 3) return { emoji: "🔥", label: "Great" };
      if (value <= 7) return { emoji: "🙂", label: "Average" };
      return { emoji: "😞", label: "Bad" };
    } else {
      if (value <= 3) return { emoji: "😞", label: "Bad" };
      if (value <= 7) return { emoji: "🙂", label: "Average" };
      return { emoji: "🔥", label: "Great" };
    }
  };

  const SliderRow = (
    label: string,
    key: keyof typeof form,
    color: string,
    max = 10,
    reverse = false,
    disabled = false,
  ) => {
    const value =
      key === "sleep_score" && useHealthSleep
        ? (healthData.sleep_score ?? form[key])
        : key === "exercise_score" && useHealthExercise
          ? (healthData.exercise_score ?? form[key])
          : form[key];

    const indicator = getIndicator(value, reverse);

    return (
      <View style={{ marginBottom: 24, opacity: disabled ? 0.5 : 1 }}>
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>
          {label} ({value}) {indicator.emoji}
          {disabled && " (Health)"}
        </Text>

        <Slider
          value={value}
          onValueChange={(v) => update(key, v)}
          minimumValue={0}
          maximumValue={max}
          step={1}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#ddd"
          thumbTintColor={color}
          disabled={disabled}
        />

        <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {indicator.label}
        </Text>
      </View>
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const effortScore = useHealthExercise
        ? calculateEffortScore({
            steps: healthData.steps,
            activeMinutes: healthData.activeMinutes,
            avgHeartRate: healthData.heartRate,
          })
        : null;

      // ❌ remove: let sleepHours = await getSleepToday();
      // use healthData which was already fetched on mount

      const payload = {
        ...form,
        sleep_score:
          useHealthSleep && healthData.sleep_score != null
            ? healthData.sleep_score
            : form.sleep_score,
        exercise_score:
          useHealthExercise && healthData.exercise_score != null
            ? healthData.exercise_score
            : form.exercise_score,
        effort_score: effortScore,
        steps: useHealthExercise ? healthData.steps : null,
        active_minutes: useHealthExercise ? healthData.activeMinutes : null,
        avg_heart_rate: useHealthExercise ? healthData.heartRate : null,
        sleep_hours: useHealthSleep
          ? healthData.sleep_score != null
            ? (healthData.sleep_score / 10) * 8
            : null
          : null,
        sub_scores: Object.entries(subScores).map(([id, score]) => ({
          id: Number(id),
          score,
        })),
      };

      const res = await dailyCheckin(payload);

      if (res.ok) {
        Alert.alert("Success", "Check-in saved 🎉");
        await fetchCurrent();
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", res.error);
      }
    } catch (e) {
      console.log("Submit error:", e);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          Daily Check-in
        </Text>

        {healthLoading && (
          <Text style={{ marginBottom: 10, color: "#888" }}>
            Syncing health data...
          </Text>
        )}

        {/* CORE */}
        {sleepSource === "manual" &&
          SliderRow("Sleep Quality", "sleep_score", "#6C5CE7")}
        {SliderRow("Focus", "focus_score", "#00B894")}
        {SliderRow("Mood", "mood_score", "#FDCB6E")}
        {SliderRow("Screen Time", "phone_hours", "#E17055", 12, true)}
        {exerciseSource === "manual" &&
          SliderRow("Exercise", "exercise_score", "#0984E3")}
        {SliderRow("Confidence", "confidence", "#FFD700")}

        {useHealthSleep && (
          <Text style={{ marginBottom: 8, color: "#6C5CE7" }}>
            Sleep auto-detected from Health Connect
          </Text>
        )}

        {useHealthExercise && (
          <Text style={{ marginBottom: 8, color: "#0984E3" }}>
            Exercise auto-detected from Health Connect
          </Text>
        )}

        {/* SUB-EXPERIMENTS */}
        {current?.sub_experiments && current.sub_experiments.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
            >
              🧪 Sub-Experiments
            </Text>
            {current.sub_experiments.map((sub) => {
              const value = subScores[sub.id] ?? 5;
              const indicator = getIndicator(value);
              return (
                <View key={sub.id} style={{ marginBottom: 24 }}>
                  <Text style={{ marginBottom: 6, fontWeight: "600" }}>
                    {sub.name} ({value}) {indicator.emoji}
                  </Text>
                  <Slider
                    value={value}
                    onValueChange={(v) => updateSub(sub.id, v)}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    minimumTrackTintColor="#A29BFE"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#A29BFE"
                  />
                  <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {indicator.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* SUBMIT */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 20,
            backgroundColor: "#6C5CE7",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {loading ? "Saving..." : "Submit Check-in"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
