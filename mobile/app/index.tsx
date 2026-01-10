import Onboarding from "@/components/onboarding";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Onboarding />
    </SafeAreaView>
  );
}
