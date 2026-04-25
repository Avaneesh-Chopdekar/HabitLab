import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getExperimentResult } from "@/api/experiments";
import { LineChart } from "react-native-chart-kit";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const shareRef = useRef<any>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = async () => {
    try {
      const res = await getExperimentResult(Number(id));

      if (res?.ok && res.data) {
        setData(res.data);
      } else {
        console.log("Result fetch failed:", res?.error);
        setData(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No result found</Text>

        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "blue", marginTop: 10 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const baseline = data.baseline;
  const final = data.final;

  const improvement =
    data.score_before === 0
      ? 0
      : ((data.score_after - data.score_before) / data.score_before) * 100;

  const getEmoji = (label: string) => {
    switch (label) {
      case "Sleep":
        return "😴";
      case "Focus":
        return "🎯";
      case "Mood":
        return "😊";
      case "Screen Time":
        return "📱";
      case "Exercise":
        return "💪";
      default:
        return "";
    }
  };

  const metricRow = (label: string, before: number, after: number) => {
    const diff = after - before;
    const positive = diff >= 0;

    return (
      <View
        key={label}
        style={{
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>
          {getEmoji(label)} {label}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#666" }}>Before: {before.toFixed(2)}</Text>
          <Text style={{ color: "#666" }}>After: {after.toFixed(2)}</Text>
        </View>

        <Text
          style={{
            marginTop: 4,
            color: positive ? "#00b894" : "#d63031",
            fontWeight: "bold",
          }}
        >
          {positive ? "▲ Improved" : "▼ Declined"} ({diff.toFixed(1)})
        </Text>
      </View>
    );
  };

  // 📸 SHARE IMAGE
  const handleShare = async () => {
    try {
      if (!shareRef.current) return;
      const uri = await captureRef(shareRef, {
        format: "png",
        quality: 1,
      });

      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const lifeRow = (label: string, before: number, after: number) => {
    const diff = after - before;
    const positive = diff >= 0;

    return (
      <View
        key={label}
        style={{
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "600", color: "#fff" }}>{label}</Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Text style={{ color: "#ccc" }}>
            {before} → {after}
          </Text>

          <Text
            style={{
              color: positive ? "#00b894" : "#d63031",
              fontWeight: "bold",
            }}
          >
            {positive ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* 🔙 Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#6C5CE7",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>

          {/* HEADER */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            🎉 Experiment Complete
          </Text>
        </View>

        {/* SHARE CARD */}
        <ViewShot
          ref={shareRef}
          style={{
            marginTop: 20,
            padding: 24,
            borderRadius: 24,
            backgroundColor: "#0f172a",
            borderWidth: 1,
            borderColor: "#ffffff10",
          }}
        >
          {/* Title */}
          <Text style={{ color: "#aaa", fontSize: 12 }}>HABIT EXPERIMENT</Text>

          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 4,
            }}
          >
            {data.title}
          </Text>

          {/* LIFE SCORE */}
          <View
            style={{
              marginTop: 20,
              padding: 20,
              borderRadius: 16,
              backgroundColor: "#334155",
            }}
          >
            <Text
              style={{ fontWeight: "bold", marginBottom: 10, color: "#fff" }}
            >
              🧬 Life Score
            </Text>

            {lifeRow("🧠 Mind", data.score_before.mind, data.score_after.mind)}
            {lifeRow("💪 Body", data.score_before.body, data.score_after.body)}
            {lifeRow(
              "⚡ Discipline",
              data.score_before.discipline,
              data.score_after.discipline,
            )}
          </View>

          {/* Highlights */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: "#aaa", fontSize: 12 }}>KEY CHANGES</Text>

            {[
              ["Focus", baseline.focus_score, final.focus_score],
              ["Mood", baseline.mood_score, final.mood_score],
              ["Exercise", baseline.exercise_score, final.exercise_score],
            ]
              .filter(([_, b, a]) => a > b)
              .slice(0, 2)
              .map(([label, b, a], i) => (
                <Text key={i} style={{ color: "#00b894", marginTop: 4 }}>
                  ▲ {label} +{(a - b).toFixed(1)}
                </Text>
              ))}
          </View>

          {/* 🔥 SUB EXPERIMENT WINS */}
          {data.sub_experiments?.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: "#aaa", fontSize: 12 }}>🔥 HABIT WINS</Text>

              {data.sub_experiments
                .sort((a: any, b: any) => b.average - a.average)
                .slice(0, 2)
                .map((sub: any, i: number) => (
                  <Text key={i} style={{ color: "#00b894", marginTop: 4 }}>
                    ▲ {sub.name} {sub.average.toFixed(1)}
                  </Text>
                ))}
            </View>
          )}

          {/* Footer */}
          <Text
            style={{
              color: "#ccc",
              marginTop: 20,
              fontSize: 12,
            }}
          >
            Built with HabitLab
          </Text>

          <Text
            style={{
              color: "#888",
              fontSize: 11,
              marginTop: 4,
            }}
          >
            Track your habits. Run experiments. Improve your life.
          </Text>
        </ViewShot>

        {/* 📊 METRICS */}
        <View
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 16,
            backgroundColor: "#F1F2F6",
          }}
        >
          {metricRow("Sleep", baseline.sleep_score, final.sleep_score)}
          {metricRow("Focus", baseline.focus_score, final.focus_score)}
          {metricRow("Mood", baseline.mood_score, final.mood_score)}
          {metricRow("Screen Time", baseline.phone_hours, final.phone_hours)}
          {metricRow("Exercise", baseline.exercise_score, final.exercise_score)}
        </View>

        {data.sub_experiments?.length > 0 && (
          <View
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "#F8F9FC",
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              🧪 Sub Experiments
            </Text>

            {data.sub_experiments.map((sub: any, index: number) => {
              const score = sub.average;

              const getColor = () => {
                if (score <= 3) return "#d63031"; // bad
                if (score <= 7) return "#fdcb6e"; // avg
                return "#00b894"; // great
              };

              const getEmoji = () => {
                if (score <= 3) return "😞";
                if (score <= 7) return "🙂";
                return "🔥";
              };

              return (
                <View
                  key={index}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    {getEmoji()} {sub.name}
                  </Text>

                  <Text style={{ color: "#666", marginTop: 4 }}>
                    Score: {score}/10
                  </Text>

                  {/* Progress bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#eee",
                      borderRadius: 4,
                      marginTop: 6,
                    }}
                  >
                    <View
                      style={{
                        width: `${score * 10}%`,
                        height: 6,
                        borderRadius: 4,
                        backgroundColor: getColor(),
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {data.sub_experiments?.length > 0 && data.sub_summary && (
          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#EEF7FF",
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
              🔍 Sub Experiment Insights
            </Text>

            <Text style={{ marginBottom: 4 }}>
              🔥 Best: {data.sub_summary.best?.name} (
              {data.sub_summary.best?.average})
            </Text>

            {data.sub_experiments?.length > 1 && (
              <Text>
                ⚠️ Needs Work: {data.sub_summary.worst?.name} (
                {data.sub_summary.worst?.average})
              </Text>
            )}
          </View>
        )}

        {/* 📈 CHART */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Progress Over Time
          </Text>

          <LineChart
            data={{
              labels: data.daily_scores.map((d: any) => `Day ${d.day}`),
              datasets: [{ data: data.daily_scores.map((d: any) => d.score) }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#6C5CE7",
              backgroundGradientFrom: "#6C5CE7",
              backgroundGradientTo: "#6C5CE7",
              decimalPlaces: 1,
              color: () => "white",
              labelColor: () => "white",
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* 🧠 AI SUMMARY */}
        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#EAF4FF",
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            🧠 AI Insights
          </Text>
          {data.summary.split(". ").map((point: string, i: number) => (
            <Text key={i} style={{ marginBottom: 4, paddingLeft: 20 }}>
              {point}
            </Text>
          ))}
        </View>

        {/* 🚀 SHARE BUTTONS */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <Pressable
            onPress={handleShare}
            style={{
              backgroundColor: "#6C5CE7",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Share Result 🚀</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => router.replace("/start")}
          style={{
            marginTop: 30,
            backgroundColor: "#000",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Start Next Experiment
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
