import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import Onboarding from "@/components/onboarding";
import { useAuthStore } from "@/store/auth";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Onboarding />
    </SafeAreaView>
  );
}
