import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { dailyCheckin } from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";

export default function CheckinScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    sleep_score: 5,
    focus_score: 5,
    mood_score: 5,
    phone_hours: 3,
    exercise_score: 5,
    confidence: 5,
  });

  const [loading, setLoading] = useState(false);

  const { fetchCurrent } = useExperimentStore.getState();

  const update = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await dailyCheckin(form);

      if (res.ok) {
        Alert.alert("Success", "Check-in saved 🎉");
        await fetchCurrent();
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", res.error);
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const SliderRow = (
    label: string,
    key: keyof typeof form,
    color: string,
    max = 10,
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ marginBottom: 5 }}>
        {label} ({form[key]})
      </Text>

      <Slider
        value={form[key]}
        onValueChange={(v) => update(key, v)}
        minimumValue={0}
        maximumValue={max}
        step={1}
        minimumTrackTintColor={color}
        maximumTrackTintColor={color}
        thumbTintColor={color}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Title */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Daily Check-in
      </Text>

      {/* Sliders */}
      {SliderRow("Sleep Quality", "sleep_score", "#6C5CE7")}
      {SliderRow("Focus", "focus_score", "#00B894")}
      {SliderRow("Mood", "mood_score", "#FDCB6E")}
      {SliderRow("Screen Time (hrs)", "phone_hours", "#E17055", 12)}
      {SliderRow("Exercise", "exercise_score", "#0984E3")}

      {/* Confidence ⭐ */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ marginBottom: 5 }}>
          Confidence (How well you followed habit) ⭐ ({form.confidence})
        </Text>

        <Slider
          value={form.confidence}
          onValueChange={(v) => update("confidence", v)}
          minimumValue={0}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#FFD700"
          maximumTrackTintColor="#FFD700"
          thumbTintColor="#FFD700"
        />
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          marginTop: "auto",
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
    </View>
  );
}
