import { create } from "zustand";
import { getCurrentExperiment } from "@/api/experiments";
import {
  getCachedExperiment,
  setCachedExperiment,
  clearCachedExperiment,
} from "@/utils/experimentCache";

type Experiment = {
  id: number;
  title: string;
  day: number;
  duration: number;
  progress: number;
  streak: number;
  missed_days: number;
  difficulty: number;
  status: "active" | "paused" | "completed";
  baseline: {
    sleep_score: number;
    focus_score: number;
    mood_score: number;
    phone_hours: number;
    exercise_score: number;
    confidence_score: number;
    steps_avg: number;
    active_minutes_avg: number;
    sleep_avg: number;
  };
  sub_experiments?: { id: number; name: string }[];
};

type ExperimentState = {
  current: Experiment | null;
  isLoading: boolean;
  error: string | null;

  hydrateFromCache: () => void;
  fetchCurrent: () => Promise<void>;
  clear: () => void;
};

export const useExperimentStore = create<ExperimentState>((set) => ({
  current: null,
  isLoading: false,
  error: null,

  // ✅ 1. INSTANT LOAD FROM CACHE
  hydrateFromCache: () => {
    const cached = getCachedExperiment();
    if (cached) {
      set({ current: cached });
    }
  },

  // ✅ 2. FETCH + UPDATE CACHE
  fetchCurrent: async () => {
    set({ isLoading: true, error: null });

    const res = await getCurrentExperiment();

    if (res.ok) {
      if (res.data.active) {
        set({ current: res.data, isLoading: false });

        // 🔥 save to cache
        setCachedExperiment(res.data);
      } else {
        set({ current: null, isLoading: false });
        clearCachedExperiment();
      }
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  clear: () => {
    clearCachedExperiment();
    set({ current: null });
  },
}));
