import { useState } from "react";
import { View, Text, Switch, Pressable, StyleSheet, Alert } from "react-native";
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  setupAllNotifications,
  cancelAllNotifications,
  NotificationPrefs,
} from "@/services/notifications";

const C = {
  primary: "#6366f1",
  bg: "#f8f9ff",
  surface: "#fff",
  border: "#e2e8f0",
  text: "#1e293b",
  textSecondary: "#64748b",
  success: "#10b981",
  danger: "#ef4444",
};

type RowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

function ToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: RowProps) {
  return (
    <View style={[s.row, disabled && { opacity: 0.4 }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: C.border, true: C.primary + "80" }}
        thumbColor={value ? C.primary : "#fff"}
      />
    </View>
  );
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(getNotificationPrefs);

  const update = (patch: Partial<NotificationPrefs>) => {
    const updated = { ...prefs, ...patch };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const handleMasterToggle = async (enabled: boolean) => {
    update({ enabled });
    if (enabled) {
      await setupAllNotifications();
      Alert.alert(
        "Notifications on ✅",
        "You'll get daily reminders and updates.",
      );
    } else {
      await cancelAllNotifications();
      Alert.alert("Notifications off", "We won't send you any reminders.");
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>🔔 Notifications</Text>

      <View style={s.card}>
        <ToggleRow
          label="Enable notifications"
          description="Master switch for all reminders"
          value={prefs.enabled}
          onChange={handleMasterToggle}
        />
      </View>

      <View style={[s.card, { marginTop: 16 }]}>
        <ToggleRow
          label="Daily reminder"
          description="Reminds you to check in every evening at 8 PM"
          value={prefs.enabled}
          onChange={() => {}}
          disabled={!prefs.enabled}
        />
        <View style={s.divider} />
        <ToggleRow
          label="2-hour warning"
          description="Nudge at 10 PM if you haven't checked in yet"
          value={prefs.twoHourWarning}
          onChange={(v) => update({ twoHourWarning: v })}
          disabled={!prefs.enabled}
        />
        {/*<View style={s.divider} />
        <ToggleRow
          label="Streak reminders"
          description="Celebrate your streaks and keep you motivated"
          value={prefs.streakReminder}
          onChange={(v) => update({ streakReminder: v })}
          disabled={!prefs.enabled}
        />*/}
        <View style={s.divider} />
        <ToggleRow
          label="Missed check-in alert"
          description="Gentle reminder if you skipped a day"
          value={prefs.missedCheckin}
          onChange={(v) => update({ missedCheckin: v })}
          disabled={!prefs.enabled}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, marginBottom: 100 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    paddingTop: 20,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: "700", color: C.text },
  rowDesc: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },
  note: {
    fontSize: 12,
    color: C.textSecondary,
    marginHorizontal: 16,
    marginTop: 12,
    lineHeight: 18,
  },
});
