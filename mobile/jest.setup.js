import { jest } from "@jest/globals";
// jest.setup.js — place in project root

// Stub the global that expo/winter/installGlobal.ts tries to access
// This must run before any expo imports
global.__ExpoImportMetaRegistry = {};

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

// Mock MMKV
jest.mock("@/lib/mmkv", () => ({
  storage: {
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock health store
jest.mock("@/store/health", () => ({
  useHealthStore: jest.fn(() => ({
    sleepSource: "manual",
    exerciseSource: "manual",
  })),
}));

// Mock health utils
jest.mock("@/utils/health", () => ({
  getStepsToday: jest.fn(() => Promise.resolve(5000)),
  getActiveMinutesToday: jest.fn(() => Promise.resolve(30)),
  getAvgHeartRateToday: jest.fn(() => Promise.resolve(90)),
  getSleepToday: jest.fn(() => Promise.resolve(7)),
}));

// Mock health cache
jest.mock("@/utils/healthCache", () => ({
  getCachedHealthData: jest.fn(() => null),
  setCachedHealthData: jest.fn(),
}));

// Mock exercise score utils
jest.mock("@/utils/exerciseScore", () => ({
  calculateAdaptiveExerciseScore: jest.fn(() => 7),
  calculateEffortScore: jest.fn(() => 65),
}));

// Mock notifications service
jest.mock("@/services/notifications", () => ({
  cancelTwoHourWarningToday: jest.fn(() => Promise.resolve()),
  setupAllNotifications: jest.fn(() => Promise.resolve()),
  requestNotificationPermission: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock @react-native-community/slider
jest.mock("@react-native-community/slider", () => {
  const { View } = require("react-native");
  return { __esModule: true, default: View };
});

// Silence harmless warnings
const IGNORED = ["act()", "ReactDOM.render", "Warning: An update to"];
const originalWarn = console.warn;
console.warn = (...args) => {
  if (IGNORED.some((w) => String(args[0]).includes(w))) return;
  originalWarn(...args);
};
