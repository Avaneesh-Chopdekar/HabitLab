import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  getTemplates,
  startExperiment,
  suggestSubExperiments,
} from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const COLORS = {
  accent: "#7C6AF7",
  accentGlow: "#7C6AF715",
  text: "#1A1A1A",
  textMuted: "#8A8A9E",
  border: "#E5E5ED",
  surface: "#F8F8FB",
};

export default function StartScreen() {
  const router = useRouter();
  const { fetchCurrent } = useExperimentStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);

  const [subExperiments, setSubExperiments] = useState<string[]>([]);
  const [subInput, setSubInput] = useState("");

  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getTemplates();
      if (res.ok) setTemplates(res.data);
    })();
  }, []);

  const addSubExperiment = () => {
    if (!subInput.trim()) return;

    setSubExperiments((prev) => [...prev, subInput.trim()]);
    setSubInput("");
  };

  const removeSubExperiment = (index: number) => {
    setSubExperiments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStart = async () => {
    if (!selectedTemplate && !customTitle.trim()) {
      alert("Enter title or select template");
      return;
    }
    try {
      setLoading(true);

      const payload =
        selectedTemplate !== null
          ? { template_id: selectedTemplate }
          : {
              title: customTitle,
              duration_days: duration,
              sub_experiments: subExperiments.length ? subExperiments : [],
            };

      const res = await startExperiment(payload);
      await fetchCurrent();

      if (res.ok) {
        router.replace("/(tabs)");
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 24,
          color: COLORS.text,
        }}
      >
        Start a new experiment
      </Text>

      <TextInput
        placeholder="Enter experiment name"
        placeholderTextColor={COLORS.textMuted}
        value={customTitle}
        onChangeText={(text) => {
          setCustomTitle(text);
          setSelectedTemplate(null);
        }}
        style={{
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
          color: COLORS.text,
          fontSize: 14,
          backgroundColor: COLORS.surface,
        }}
      />

      {/* Duration */}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: COLORS.text,
          marginBottom: 10,
        }}
      >
        Duration in days
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        {[7, 14, 21, 60, 90, 180].map((d) => (
          <Pressable
            key={d}
            onPress={() => {
              setDuration(d);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              backgroundColor: duration === d ? COLORS.accent : COLORS.surface,
              borderWidth: 1,
              borderColor: duration === d ? COLORS.accent : COLORS.border,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: duration === d ? "white" : COLORS.text,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={async () => {
          if (!customTitle) return;

          const res = await suggestSubExperiments(customTitle);

          if (res.ok) {
            setSubExperiments(res.data);
          }
        }}
        style={{
          backgroundColor: "#000",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "white" }}>✨ Suggest Sub-Experiments</Text>
      </Pressable>

      {/* SUB EXPERIMENTS */}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: COLORS.text,
          marginBottom: 10,
        }}
      >
        Sub Experiments (optional)
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <TextInput
          placeholder="e.g. DSA, Gym, Reading"
          placeholderTextColor={COLORS.textMuted}
          value={subInput}
          onChangeText={setSubInput}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: 12,
            borderRadius: 10,
            color: COLORS.text,
            backgroundColor: COLORS.surface,
          }}
        />

        <Pressable
          onPress={addSubExperiment}
          style={{
            paddingHorizontal: 14,
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: COLORS.accent,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Add</Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 16 }}>
        {subExperiments.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              borderRadius: 8,
              backgroundColor: COLORS.accentGlow,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: COLORS.text }}>{item}</Text>

            <Pressable onPress={() => removeSubExperiment(index)}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </Pressable>
          </View>
        ))}
      </View>

      {/* CTA */}
      <Pressable
        onPress={handleStart}
        disabled={loading}
        style={{
          marginTop: "auto",
          marginBottom: 20,
          backgroundColor: COLORS.accent,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          {loading ? "Starting..." : "Start Experiment"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
