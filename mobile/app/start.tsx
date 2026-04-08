import { useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { startExperiment } from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const TEMPLATES = [
  { id: 1, title: "No phone 2 hours after waking up", difficulty: 2 },
  { id: 2, title: "No screens 1 hour before bed", difficulty: 2 },
  { id: 3, title: "Meditation before bed", difficulty: 1 },
  { id: 4, title: "4 hour deep work", difficulty: 3 },
];

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

  const handleStart = async () => {
    try {
      setLoading(true);

      const payload =
        selectedTemplate !== null
          ? { template_id: selectedTemplate }
          : { title: customTitle, duration_days: duration };

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

      {/* Suggested experiments dropdown */}
      <Pressable
        onPress={() => setShowTemplates(!showTemplates)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          marginBottom: showTemplates ? 12 : 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>
          Suggested experiments
        </Text>
        <Feather
          name={showTemplates ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.accent}
        />
      </Pressable>

      {/* Templates List - Conditional */}
      {showTemplates && (
        <FlatList
          data={TEMPLATES}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = selectedTemplate === item.id;

            return (
              <Pressable
                onPress={() => {
                  setSelectedTemplate(item.id);
                  setCustomTitle("");
                }}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 10,
                  backgroundColor: isSelected ? COLORS.accent : COLORS.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? COLORS.accent : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "white" : COLORS.text,
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isSelected
                      ? "rgba(255,255,255,0.8)"
                      : COLORS.textMuted,
                    marginTop: 4,
                  }}
                >
                  Difficulty: {item.difficulty}/3
                </Text>
              </Pressable>
            );
          }}
          style={{ marginBottom: 12 }}
        />
      )}

      {/* Custom */}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: COLORS.text,
          marginBottom: 10,
        }}
      >
        Or create your own
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
        Duration
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        {[7, 14, 21].map((d) => (
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
              {d} days
            </Text>
          </Pressable>
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
