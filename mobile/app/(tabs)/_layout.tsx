import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <CustomTabBar />
    </>
  );
}
