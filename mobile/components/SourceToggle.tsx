import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { requestHealthPermissions } from "@/services/health";

type Props = {
  label: string;
  value: "manual" | "health";
  onChange: (v: "manual" | "health") => void;
};

export default function SourceToggle({ label, value, onChange }: Props) {
  const handleHealthPress = async () => {
    const granted = await requestHealthPermissions();

    if (granted) {
      onChange("health");
    } else {
      Alert.alert(
        "Permission required",
        "Health access is needed to use this feature",
      );
      onChange("manual"); // fallback
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>{label}</Text>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#eee",
          borderRadius: 12,
          padding: 4,
        }}
      >
        {/* Manual */}
        <Pressable
          onPress={() => onChange("manual")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: value === "manual" ? "#6C5CE7" : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: value === "manual" ? "#fff" : "#555",
              fontWeight: "600",
            }}
          >
            Manual
          </Text>
        </Pressable>

        {/* Health */}
        <Pressable
          onPress={handleHealthPress}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: value === "health" ? "#00B894" : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: value === "health" ? "#fff" : "#555",
              fontWeight: "600",
            }}
          >
            Health
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
