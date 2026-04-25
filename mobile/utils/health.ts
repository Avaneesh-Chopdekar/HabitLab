import { readRecords } from "react-native-health-connect";

const getTodayRange = () => {
  const now = new Date();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return {
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
};

export async function getStepsToday(): Promise<number> {
  try {
    const { startTime, endTime } = getTodayRange();

    const res = await readRecords("Steps", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    const total = res.records.reduce((sum, r) => sum + (r.count ?? 0), 0);

    return total;
  } catch (e) {
    console.log("Steps error:", e);
    return 0;
  }
}

export async function getActiveMinutesToday(): Promise<number> {
  try {
    const { startTime, endTime } = getTodayRange();

    const res = await readRecords("ExerciseSession", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    let totalMinutes = 0;

    res.records.forEach((session) => {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();

      const minutes = (end - start) / (1000 * 60);
      totalMinutes += minutes;
    });

    return Math.round(totalMinutes);
  } catch (e) {
    console.log("Active minutes error:", e);
    return 0;
  }
}

export async function getAvgHeartRateToday(): Promise<number> {
  try {
    const { startTime, endTime } = getTodayRange();

    const res = await readRecords("HeartRate", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    if (!res.records.length) return 0;

    const total = res.records.reduce(
      (sum, r) => sum + (r.samples?.[0]?.beatsPerMinute ?? 0),
      0,
    );

    return Math.round(total / res.records.length);
  } catch (e) {
    console.log("Heart rate error:", e);
    return 0;
  }
}

export async function getSleepToday(): Promise<number> {
  try {
    const { startTime, endTime } = getTodayRange();

    const res = await readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    let totalHours = 0;

    res.records.forEach((session) => {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();

      const hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
    });

    return Math.round(totalHours * 10) / 10; // 6.5 hrs etc
  } catch (e) {
    console.log("Sleep error:", e);
    return 0;
  }
}
