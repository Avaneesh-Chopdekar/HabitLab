import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAllExperiments,
  restartExperiment,
  toggleExperiment,
} from "@/api/experiments";
import { Feather } from "@expo/vector-icons";

const C = {
  primary: "#6366f1",
  bg: "#f8f9ff",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  textSecondary: "#64748b",
  success: "#10b981",
  warn: "#f59e0b",
};

export default function ExperimentsScreen() {
  const router = useRouter();

  const [experiments, setExperiments] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const res = await getAllExperiments();
        if (res.ok) {
          setExperiments(res.data);
        }
      };

      fetch();
    }, []),
  );
  // 🔍 Filter locally
  const filtered = useMemo(() => {
    if (!query.trim()) return experiments;

    return experiments.filter((e) =>
      e.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, experiments]);

  const getStatusColor = (status: string) => {
    if (status === "completed") return C.success;
    if (status === "active") return C.primary;
    return C.warn;
  };

  const handleResume = async () => {
    const res = await toggleExperiment();
    if (res.ok) {
      router.replace("/(tabs)");
    }
  };

  const handleRestart = async () => {
    const res = await restartExperiment();
    if (res.ok) {
      router.replace("/(tabs)");
    }
  };

  const renderItem = ({ item }: any) => {
    const isPaused = item.status === "paused";
    const isCompleted = item.status === "completed";
    const isActive = item.status === "active";

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          {/* ✅ COMPLETED */}
          {isCompleted && (
            <Pressable onPress={() => router.push(`/result/${item.id}`)}>
              <Text style={styles.viewText}>View Results →</Text>
            </Pressable>
          )}

          {/* 🔥 ACTIVE */}
          {isActive && (
            <Pressable onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.viewText}>Continue →</Text>
            </Pressable>
          )}

          {/* 🟡 PAUSED */}
          {isPaused && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={handleResume} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Resume</Text>
              </Pressable>

              <Pressable onPress={handleRestart} style={styles.smallBtnDanger}>
                <Text style={styles.smallBtnText}>Restart</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Experiments</Text>
          <Text style={styles.subheading}>Track your growth over time</Text>
        </View>

        <Pressable onPress={() => router.push("/start")} style={styles.addBtn}>
          <Feather name="plus" size={20} color="white" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={C.textSecondary} />
        <TextInput
          placeholder="Search experiments..."
          placeholderTextColor={C.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 42 }}>🧪</Text>
            <Text style={styles.emptyTitle}>No experiments found</Text>
            <Text style={styles.emptySub}>
              Start one to begin tracking your habits
            </Text>

            <Pressable
              onPress={() => router.push("/start")}
              style={styles.emptyBtn}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Start Experiment
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
  },

  subheading: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },

  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  input: {
    flex: 1,
    color: C.text,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    flex: 1,
    marginRight: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  meta: {
    marginTop: 6,
    color: C.textSecondary,
    fontSize: 13,
  },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  viewText: {
    color: C.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    color: C.text,
  },

  emptySub: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  emptyBtn: {
    marginTop: 16,
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  smallBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  smallBtnDanger: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  smallBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
});
