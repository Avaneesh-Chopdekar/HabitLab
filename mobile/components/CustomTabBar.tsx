import { Tabs } from "expo-router";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// ─── Design tokens ───────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  border: "#E5E5EA",
  accent: "#7C6AF7", // violet accent
  accentGlow: "#7C6AF720",
  fab: "#7C6AF7",
  fabShadow: "#00000010",
  text: "#000000",
  textMuted: "#8E8E93",
};

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabName = "index" | "experiments" | "profile";

const TAB_CONFIG: {
  name: TabName;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { name: "index", label: "Home", icon: "home" },
  { name: "experiments", label: "Experiments", icon: "folder" }, // FAB
  { name: "profile", label: "Profile", icon: "user" },
];

// ─── Single tab button ────────────────────────────────────────────────────────
function TabButton({
  tab,
  isFocused,
  onPress,
}: {
  tab: (typeof TAB_CONFIG)[number];
  isFocused: boolean;
  onPress: () => void;
}) {
  // Scale animation
  const scale = useRef(new Animated.Value(1)).current;
  // Vertical nudge for icon when active
  const iconY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 14,
      }),
      Animated.spring(iconY, {
        toValue: isFocused ? -2 : 0,
        useNativeDriver: true,
        tension: 200,
        friction: 14,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 200,
      friction: 14,
    }).start();
  };

  // ── Regular tab ─────────────────────────────────────────────────────────────
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabIconWrap,
          isFocused && styles.tabIconWrapActive,
          { transform: [{ scale }, { translateY: iconY }] },
        ]}
      >
        <Feather
          name={tab.icon}
          size={20}
          color={isFocused ? COLORS.accent : COLORS.textMuted}
        />
      </Animated.View>

      {/* Active indicator dot */}
      <Animated.View
        style={[
          styles.activeDot,
          {
            opacity: isFocused ? 1 : 0,
          },
        ]}
      />

      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barOuter, { paddingBottom: insets.bottom || 12 }]}>
      {/* Frosted card */}
      <View style={styles.barCard}>
        {TAB_CONFIG.map((tab) => {
          const routeIndex = state.routes.findIndex(
            (r: any) => r.name === tab.name,
          );
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TabButton
              key={tab.name}
              tab={tab}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout export ────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="experiments" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  barOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 0,
    backgroundColor: "transparent",
  },
  barCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 10,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },

  // ── Regular tab ─────────
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
    gap: 4,
    minHeight: 52,
  },
  tabIconWrap: {
    width: 40,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.accentGlow,
  },
  activeDot: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
