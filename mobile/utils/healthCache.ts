import { storage } from "@/lib/mmkv";

const getTodayKey = () => {
  const today = new Date().toISOString().split("T")[0];
  return `health_${today}`;
};

export const getCachedHealthData = () => {
  const key = getTodayKey();
  const data = storage.getString(key);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setCachedHealthData = (data: any) => {
  const key = getTodayKey();
  storage.set(key, JSON.stringify(data));
};
