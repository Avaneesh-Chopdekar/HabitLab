import React, { useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import IBaseline from "../../types/IBaseline";
import Onboarding1 from "./Onboarding1";
import Onboarding2 from "./Onboarding2";
import Onboarding3 from "./Onboarding3";
import Onboarding4 from "./Onboarding4";
import Onboarding5 from "./Onboarding5";
import Onboarding6 from "./Onboarding6";

interface OnboardingProps {}

export default function Onboarding(props: OnboardingProps) {
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<IBaseline>({
    sleepQualityScore: 0,
    focusScore: 0,
    moodScore: 0,
    phoneHours: 0,
    exerciseScore: 0,
  });
  const [experiment, setExperiment] = useState<string>("");

  const pagerRef = useRef<PagerView>(null);

  return (
    <PagerView ref={pagerRef} style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <Onboarding1
          selectedHabits={selectedHabits}
          setSelectedHabits={setSelectedHabits}
          pagerRef={pagerRef}
        />
      </View>
      <View key="2" style={styles.page}>
        <Onboarding2
          selectedProblems={selectedProblems}
          setSelectedProblems={setSelectedProblems}
          pagerRef={pagerRef}
        />
      </View>
      <View key="3" style={styles.page}>
        <Onboarding3
          baseline={baseline}
          setBaseline={setBaseline}
          pagerRef={pagerRef}
        />
      </View>
      <View key="4" style={styles.page}>
        <Onboarding4
          experiment={experiment}
          setExperiment={setExperiment}
          pagerRef={pagerRef}
        />
      </View>
      <View key="5" style={styles.page}>
        <Onboarding5 pagerRef={pagerRef} /> {/* Create Account */}
      </View>
      <View key="6" style={styles.page}>
        <Onboarding6 pagerRef={pagerRef} /> {/* OTP Verification */}
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
    marginVertical: 32,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
