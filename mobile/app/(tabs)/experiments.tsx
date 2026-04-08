import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllExperiments } from "@/api/experiments";
import { Feather } from "@expo/vector-icons";

export default function ExperimentsScreen() {
  const router = useRouter();

  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getAllExperiments();
      if (res.ok) setExperiments(res.data);
    };

    fetch();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Experiments</Text>

        <Pressable
          onPress={() => router.push("/start")}
          style={{
            backgroundColor: "#6C5CE7",
            padding: 10,
            borderRadius: 100,
          }}
        >
          <Feather name="plus" size={24} color="white" />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={experiments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/result/${item.id}`)}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#eee",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>Duration: {item.duration} days</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, color: "gray" }}>
            No experiments yet
          </Text>
        }
      />
    </SafeAreaView>
  );
}
