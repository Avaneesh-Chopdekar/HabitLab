import React from "react";
import { View, Text, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import { useOnboardingStore } from "@/store/onboarding";

interface Onboarding3Props {
  pagerRef: React.RefObject<any>;
}

export default function Onboarding3({ pagerRef }: Onboarding3Props) {
  const { baseline, setBaseline } = useOnboardingStore();

  // 🎯 indicator logic (same as checkin)
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
    key: keyof typeof baseline,
    color: string,
    max = 10,
    reverse = false,
  ) => {
    const value = baseline[key] ?? 0;
    const indicator = getIndicator(value, reverse);

    return (
      <View style={{ marginBottom: 24, marginHorizontal: 24 }}>
        <Text style={{ marginBottom: 6, fontWeight: "600" }}>
          {label} ({value}) {indicator.emoji}
        </Text>

        <Slider
          value={value}
          onValueChange={(v) => setBaseline({ [key]: v })}
          minimumValue={0}
          maximumValue={max}
          step={1}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#ddd"
          thumbTintColor={color}
        />

        <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {indicator.label}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
        Your current lifestyle
      </Text>

      <View style={{ width: "100%" }}>
        {SliderRow("Sleep Quality", "sleepQualityScore", "#6C5CE7")}
        {SliderRow("Focus", "focusScore", "#00B894")}
        {SliderRow("Mood", "moodScore", "#FDCB6E")}
        {SliderRow("Screen Time (hrs)", "phoneHours", "#E17055", 12, true)}
        {SliderRow("Exercise", "exerciseScore", "#0984E3")}
        {SliderRow("Confidence", "confidenceScore", "#FFD700")}
      </View>

      {/* NAV BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <Pressable
          onPress={() => pagerRef.current?.setPage(1)}
          style={{
            backgroundColor: "rebeccapurple",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            width: 120,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Back</Text>
        </Pressable>

        <Pressable
          onPress={() => pagerRef.current?.setPage(3)}
          style={{
            backgroundColor: "rebeccapurple",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            width: 120,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Next</Text>
        </Pressable>
      </View>
    </>
  );
}
