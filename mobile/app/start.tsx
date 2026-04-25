import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
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

const C = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  bg: "#f8f9ff",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  textMuted: "#94a3b8",
};

export default function StartScreen() {
  const router = useRouter();
  const { fetchCurrent } = useExperimentStore();

  const [customTitle, setCustomTitle] = useState("");
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);

  const [subExperiments, setSubExperiments] = useState<string[]>([]);
  const [subInput, setSubInput] = useState("");

  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    getTemplates().then((res) => {
      if (res.ok) setTemplates(res.data);
    });
  }, []);

  const addSub = () => {
    if (!subInput.trim()) return;
    setSubExperiments((p) => [...p, subInput.trim()]);
    setSubInput("");
  };

  const removeSub = (i: number) => {
    setSubExperiments((p) => p.filter((_, idx) => idx !== i));
  };

  const handleStart = async () => {
    if (!customTitle.trim()) return alert("Give it a name first");

    try {
      setLoading(true);

      const res = await startExperiment({
        title: customTitle,
        duration_days: duration,
        sub_experiments: subExperiments,
      });

      await fetchCurrent();

      if (res.ok) router.replace("/(tabs)");
      else alert(res.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>🚀 New Experiment</Text>
        <Text style={s.subtitle}>Build better habits. Track what matters.</Text>

        {/* NAME */}
        <View style={s.card}>
          <Text style={s.label}>Experiment Name</Text>
          <TextInput
            placeholder="e.g. 5 km Morning Run"
            placeholderTextColor={"#bbb"}
            value={customTitle}
            onChangeText={setCustomTitle}
            style={s.input}
          />
        </View>

        {/* DURATION */}
        <View style={s.card}>
          <Text style={s.label}>Duration</Text>
          <View style={s.rowWrap}>
            {[7, 14, 21, 30, 60, 90, 180].map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDuration(d);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  s.pill,
                  duration === d && { backgroundColor: C.primary },
                ]}
              >
                <Text
                  style={{
                    color: duration === d ? "#fff" : C.text,
                    fontWeight: "600",
                  }}
                >
                  {d} days
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* SUBS */}
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Text style={s.label}>Habits</Text>
            <Pressable
              onPress={async () => {
                if (!customTitle) return;
                const res = await suggestSubExperiments(customTitle);
                if (res.ok) setSubExperiments(res.data);
              }}
            >
              <Text style={s.magic}>✨ Suggest</Text>
            </Pressable>
          </View>

          <View style={s.row}>
            <TextInput
              placeholder="Add habit"
              placeholderTextColor={"#bbb"}
              value={subInput}
              onChangeText={setSubInput}
              style={[s.input, { flex: 1 }]}
            />
            <Pressable onPress={addSub} style={s.addBtn}>
              <Feather name="plus" size={16} color="#fff" />
            </Pressable>
          </View>

          <View style={{ marginTop: 10 }}>
            {subExperiments.map((sE, i) => (
              <View key={i} style={s.tag}>
                <Text style={s.tagText}>{sE}</Text>
                <Pressable onPress={() => removeSub(i)}>
                  <Feather name="x" size={14} color={C.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={s.footer}>
        <Pressable onPress={handleStart} disabled={loading} style={s.cta}>
          <Text style={s.ctaText}>
            {loading ? "Starting..." : "Start Experiment"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 100 },

  title: { fontSize: 26, fontWeight: "800", color: C.text },
  subtitle: {
    color: C.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  label: { fontWeight: "700", marginBottom: 10, color: C.text },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },

  row: { flexDirection: "row", gap: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },

  addBtn: {
    backgroundColor: C.primary,
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
  },

  tag: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },

  tagText: { color: C.text, fontWeight: "600" },

  magic: { color: C.primary, fontWeight: "700", paddingBottom: 10 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: C.border,
  },

  cta: {
    backgroundColor: C.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
