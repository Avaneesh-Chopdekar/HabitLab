import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/auth";
import * as SplashScreen from "expo-splash-screen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { initialize, getSdkStatus } from "react-native-health-connect";
import { useExperimentStore } from "@/store/experiment";

// TODO: Implement notifications for reminders and alerts

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const hydrateExperiment = useExperimentStore((s) => s.hydrateFromCache);
  const fetchCurrent = useExperimentStore((s) => s.fetchCurrent);

  const initHealth = async () => {
    try {
      const status = await getSdkStatus();
      // 1 = unavailable, 2 = update required, 3 = available
      if (status !== 3) {
        console.log("Health Connect not ready, status:", status);
        return;
      }

      const isInitialized = await initialize();
      if (!isInitialized) {
        console.log("Health Connect failed to initialize");
        return;
      }

      console.log("Health Connect ready");
    } catch (e) {
      console.log("Health init error:", e);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      // Configure GoogleSignin once when app is hydrated
      try {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        const androidClientId =
          process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

        if (!webClientId || !androidClientId) {
          console.warn(
            "Google Sign-in credentials not configured. Check your .env.local file.",
            {
              webClientId: !!webClientId,
              androidClientId: !!androidClientId,
            },
          );
        }

        GoogleSignin.configure({
          webClientId: webClientId || "",
          offlineAccess: true,
          scopes: ["profile", "email"],
        });
      } catch (error) {
        console.error("Failed to configure GoogleSignin:", error);
      }

      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  useEffect(() => {
    hydrate(); // auth
    hydrateExperiment(); // 🔥 instant UI
  }, []);

  useEffect(() => {
    if (isHydrated) {
      fetchCurrent();
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      initHealth().catch((e) => console.log("Init health failed:", e));
    }
  }, [isHydrated]);

  if (!isHydrated) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
