import { useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { restartExperiment, toggleExperiment } from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";

export default function HomeScreen() {
  const router = useRouter();
  const { current, isLoading, fetchCurrent } = useExperimentStore();

  useFocusEffect(
    useCallback(() => {
      fetchCurrent();
    }, [fetchCurrent]),
  );

  const handleRestart = async () => {
    const res = await restartExperiment();

    if (res.ok) {
      router.replace("/(tabs)"); // refresh home
    } else {
      console.log(res.error);
    }
  };

  // TODO: Use backend time instead of device time.
  const hoursLeft = 24 - new Date().getHours();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 🧊 EMPTY STATE
  if (!current) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
          No active experiment
        </Text>

        <Text style={{ color: "gray", marginBottom: 20 }}>
          Start your first habit experiment 🚀
        </Text>

        <Pressable
          onPress={() => router.push("/start")}
          style={{
            backgroundColor: "#6C5CE7",
            padding: 14,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white" }}>Start Experiment</Text>
        </Pressable>
      </View>
    );
  }

  // 🔥 ACTIVE STATE
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#aaa" }}>Current Streak</Text>

        <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
          🔥 {current.streak} days
        </Text>

        {current.missed_days && (
          <Text style={{ color: "red", marginTop: 6 }}>
            ⚠️ You’re about to break your streak!
          </Text>
        )}
      </View>

      <Text style={{ color: "#aaa", marginTop: 6 }}>
        ⏳ {hoursLeft} hours left to check in today
      </Text>

      {current.missed_days && (
        <Pressable
          onPress={handleRestart}
          style={{
            marginTop: 12,
            backgroundColor: "#ff4757",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Restart Experiment 🔁
          </Text>
        </Pressable>
      )}

      {/* Header */}
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Your Experiment</Text>

      {/* Card */}
      <Pressable onPress={() => router.push(`/result/${current.id}`)}>
        <View
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 16,
            backgroundColor: "#6C5CE7",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            {current.title}
          </Text>

          <Text style={{ color: "white", marginTop: 5 }}>
            Day {current.day} / {current.duration}
          </Text>

          {/* Progress Bar */}
          <View
            style={{
              height: 8,
              backgroundColor: "#ffffff40",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: `${current.progress}%`,
                height: 8,
                backgroundColor: "white",
                borderRadius: 10,
              }}
            />
          </View>

          {/* Meta */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <Text style={{ color: "white" }}>🔥 Streak: {current.streak}</Text>
            <Text style={{ color: "white" }}>
              🎯 Difficulty: {current.difficulty}
            </Text>
          </View>

          {/* Missed Warning */}
          {current.missed_days > 0 && (
            <Text style={{ color: "#FFD166", marginTop: 10 }}>
              ⚠️ Missed {current.missed_days} days
            </Text>
          )}
        </View>
      </Pressable>

      {/* CTA */}
      <Pressable
        onPress={() => router.push("/checkin")}
        style={{
          marginTop: 30,
          backgroundColor: "#00B894",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Check in for today
        </Text>
      </Pressable>

      {/* Secondary actions */}
      <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
        <Pressable
          onPress={async () => {
            const res = await toggleExperiment();
            if (res.ok) {
              await fetchCurrent();
            }
          }}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#ddd",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text>Pause</Text>
        </Pressable>

        <Pressable
          onPress={handleRestart}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#ff7675",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Restart</Text>
        </Pressable>
      </View>
    </View>
  );
}
