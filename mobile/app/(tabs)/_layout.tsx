import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomTabBar from "@/components/CustomTabBar";
import { useAuthStore } from "@/store/auth";
import { Redirect } from "expo-router";

export default function TabLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }
  return (
    <>
      <StatusBar style="dark" />
      <CustomTabBar />
    </>
  );
}
