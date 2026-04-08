import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAuthStore } from "@/store/auth";
import { useExperimentStore } from "@/store/experiment";
import { useOnboardingStore } from "@/store/onboarding";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { clear } = useExperimentStore();

  const router = useRouter();

  function handleLogout() {
    logout();
    clear();

    useOnboardingStore.getState().reset();

    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text>Email: {user?.email}</Text>
      <Text>Username: {user?.username}</Text>

      <Pressable onPress={handleLogout}>
        <Text style={styles.logout}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  logout: {
    marginTop: 20,
    color: "red",
    fontWeight: "600",
  },
});
