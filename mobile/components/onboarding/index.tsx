import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import Onboarding1 from "./Onboarding1";
import Onboarding2 from "./Onboarding2";
import Onboarding3 from "./Onboarding3";
import Onboarding4 from "./Onboarding4";
import Onboarding5 from "./Onboarding5";

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);

  return (
    <PagerView ref={pagerRef} style={styles.pagerView} initialPage={0}>
      <View key="1" style={styles.page}>
        <Onboarding1 pagerRef={pagerRef} />
      </View>
      <View key="2" style={styles.page}>
        <Onboarding2 pagerRef={pagerRef} />
      </View>
      <View key="3" style={styles.page}>
        <Onboarding3 pagerRef={pagerRef} />
      </View>
      <View key="4" style={styles.page}>
        <Onboarding4 pagerRef={pagerRef} />
      </View>
      <View key="5" style={styles.page}>
        <Onboarding5 pagerRef={pagerRef} /> {/* Authentication */}
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
