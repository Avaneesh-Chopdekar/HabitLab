import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { Platform } from "react-native";
import { storage } from "@/lib/mmkv";

// ── Config ────────────────────────────────────────────────────────────────────

const BACKGROUND_TASK = "checkin-reminder-task";
const PREF_KEY = "notification_prefs";

// Set how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Permission ────────────────────────────────────────────────────────────────

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

// ── Preferences ───────────────────────────────────────────────────────────────

export type NotificationPrefs = {
  enabled: boolean;
  dailyReminderHour: number; // 0-23, default 20 (8 PM)
  dailyReminderMinute: number; // default 0
  twoHourWarning: boolean;
  streakReminder: boolean;
  missedCheckin: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  dailyReminderHour: 20,
  dailyReminderMinute: 0,
  twoHourWarning: true,
  streakReminder: true,
  missedCheckin: true,
};

export const getNotificationPrefs = (): NotificationPrefs => {
  const raw = storage.getString(PREF_KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const saveNotificationPrefs = (prefs: NotificationPrefs) => {
  storage.set(PREF_KEY, JSON.stringify(prefs));
};

// ── Schedule helpers ──────────────────────────────────────────────────────────

// Cancel all scheduled notifications with a given identifier prefix
const cancelByIdentifier = async (prefix: string) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
};

// ── 1. Daily check-in reminder (fires every day at set time) ──────────────────

export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  await cancelByIdentifier("daily-reminder");

  const prefs = getNotificationPrefs();
  if (!prefs.enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: "daily-reminder",
    content: {
      title: "Time for your daily check-in! 📋",
      body: "How are you feeling today? It only takes 30 seconds.",
      sound: true,
      data: { screen: "/(tabs)/checkin" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

// ── 2. Two-hour warning (fires at 10 PM = 22:00 every day) ───────────────────

export const scheduleTwoHourWarning = async () => {
  await cancelByIdentifier("two-hour-warning");

  const prefs = getNotificationPrefs();
  if (!prefs.enabled || !prefs.twoHourWarning) return;

  await Notifications.scheduleNotificationAsync({
    identifier: "two-hour-warning",
    content: {
      title: "⏰ 2 hours left today!",
      body: "Don't break your streak — quick check-in before midnight?",
      sound: true,
      data: { screen: "/(tabs)/checkin" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 22,
      minute: 0,
    },
  });
};

// ── 3. Experiment complete (one-shot, fired immediately) ──────────────────────

export const sendExperimentCompleteNotification = async (
  title: string,
  streak: number,
) => {
  const messages = [
    `You just finished "${title}" — ${streak} days of real effort. Check your results! 🏆`,
    `"${title}" is done! Look how far you've come in ${streak} days. 🌟`,
    `${streak} days. You showed up every single day. "${title}" is complete! 🎉`,
  ];
  const body = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: `experiment-complete-${Date.now()}`,
    content: {
      title: "🎉 Experiment Complete!",
      body,
      sound: true,
      data: { screen: "/result" },
    },
    trigger: null, // fire immediately
  });
};

// ── 4. Streak reminder (fires if user has a streak going) ────────────────────

export const sendStreakReminder = async (streak: number) => {
  if (streak < 2) return;

  const prefs = getNotificationPrefs();
  if (!prefs.enabled || !prefs.streakReminder) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `streak-reminder-${Date.now()}`,
    content: {
      title: `🔥 ${streak}-day streak!`,
      body: `You've checked in ${streak} days in a row. Don't stop now!`,
      sound: true,
      data: { screen: "/(tabs)/checkin" },
    },
    trigger: null,
  });
};

// ── 5. Missed check-in (call this on app open if last checkin > 1 day ago) ────

export const maybeSendMissedCheckinNotification = async (
  lastCheckinAt: string | null,
) => {
  const prefs = getNotificationPrefs();
  if (!prefs.enabled || !prefs.missedCheckin) return;
  if (!lastCheckinAt) return;

  const diffDays =
    (Date.now() - new Date(lastCheckinAt).getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays >= 1 && diffDays < 2) {
    await Notifications.scheduleNotificationAsync({
      identifier: `missed-checkin-${Date.now()}`,
      content: {
        title: "We missed you yesterday 😔",
        body: "Come back today and keep your experiment going!",
        sound: true,
        data: { screen: "/(tabs)/checkin" },
      },
      trigger: null,
    });
  }
};

// ── 6. Cancel two-hour warning after user checks in ──────────────────────────

export const cancelTwoHourWarningToday = async () => {
  // We re-schedule tomorrow's version — effectively skipping today's
  await cancelByIdentifier("two-hour-warning");
  await scheduleTwoHourWarning(); // re-add for future days
};

// ── Master setup (call once on app boot after permissions) ───────────────────

export const setupAllNotifications = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const prefs = getNotificationPrefs();
  if (!prefs.enabled) return;

  await scheduleDailyReminder(
    prefs.dailyReminderHour,
    prefs.dailyReminderMinute,
  );
  await scheduleTwoHourWarning();
};

// ── Cancel everything (e.g. on logout or no active experiment) ───────────────

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// ── Handle notification tap → navigate to correct screen ─────────────────────

export const useNotificationNavigation = (router: any) => {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (screen) {
      router.push(screen);
    }
  });
};
