import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
} from "react-native-health-connect";

let initialized = false;

const REQUIRED_PERMISSIONS = [
  { accessType: "read", recordType: "Steps" },
  { accessType: "read", recordType: "HeartRate" },
  { accessType: "read", recordType: "SleepSession" },
  { accessType: "read", recordType: "ExerciseSession" },
] as const;

export const initHealthConnect = async (): Promise<boolean> => {
  try {
    if (!initialized) {
      const ok = await initialize();
      if (!ok) return false;
      initialized = true;
    }
    return true;
  } catch (e) {
    console.log("Health init error:", e);
    return false;
  }
};

export const hasHealthPermissions = async (): Promise<boolean> => {
  try {
    await initHealthConnect();
    const granted = await getGrantedPermissions();
    return REQUIRED_PERMISSIONS.every((req) =>
      granted.some(
        (g) =>
          g.recordType === req.recordType && g.accessType === req.accessType,
      ),
    );
  } catch {
    return false;
  }
};

// ✅ Call this ONLY from a button press handler, never from useEffect
export const requestHealthPermissions = async (): Promise<boolean> => {
  try {
    const ready = await initHealthConnect();
    console.log("HC initialized:", ready);
    if (!ready) return false;

    const alreadyGranted = await hasHealthPermissions();
    console.log("Already granted:", alreadyGranted);
    if (alreadyGranted) return true;

    const result = await requestPermission([...REQUIRED_PERMISSIONS]);
    console.log("Permission result:", JSON.stringify(result));

    return await hasHealthPermissions();
  } catch (e) {
    console.log("Health permission error:", e);
    return false;
  }
};

// 🏃 Steps
export const getStepsToday = async () => {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const res = await readRecords("Steps", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: now.toISOString(),
    },
  });

  return res.records.reduce((sum, r) => sum + (r.count || 0), 0);
};

// ❤️ Heart rate avg
export const getAvgHeartRate = async () => {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const res = await readRecords("HeartRate", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: now.toISOString(),
    },
  });

  if (!res.records.length) return null;

  const values = res.records.flatMap(
    (r: any) => r.samples?.map((s: any) => s.beatsPerMinute) || [],
  );

  if (!values.length) return null;

  return values.reduce((a, b) => a + b, 0) / values.length;
};

// 😴 Sleep duration (hours)
export const getSleepHours = async () => {
  const res = await readRecords("SleepSession", {
    timeRangeFilter: {
      operator: "between",
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date().toISOString(),
    },
  });

  let totalMs = 0;

  res.records.forEach((r: any) => {
    const start = new Date(r.startTime).getTime();
    const end = new Date(r.endTime).getTime();
    totalMs += end - start;
  });

  return totalMs / (1000 * 60 * 60); // hours
};
