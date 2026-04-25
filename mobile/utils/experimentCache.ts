import { storage } from "@/lib/mmkv";

const KEY = "current_experiment";

export const getCachedExperiment = () => {
  const data = storage.getString(KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setCachedExperiment = (exp: any) => {
  storage.set(KEY, JSON.stringify(exp));
};

export const clearCachedExperiment = () => {
  storage.remove(KEY);
};
