import { create } from "zustand";
import { getCurrentExperiment } from "@/api/experiments";

type Experiment = {
  id: number;
  title: string;
  day: number;
  duration: number;
  progress: number;
  streak: number;
  missed_days: number;
  difficulty: number;
};

type ExperimentState = {
  current: Experiment | null;
  isLoading: boolean;
  error: string | null;

  setCurrent: (exp: Experiment | null) => void;
  fetchCurrent: () => Promise<void>;
  clear: () => void;
};

export const useExperimentStore = create<ExperimentState>((set) => ({
  current: null,
  isLoading: false,
  error: null,

  setCurrent: (exp) => set({ current: exp }),

  fetchCurrent: async () => {
    set({ isLoading: true, error: null });

    const res = await getCurrentExperiment();

    if (res.ok) {
      if (res.data.active) {
        set({ current: res.data, isLoading: false });
      } else {
        set({ current: null, isLoading: false });
      }
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  clear: () => set({ current: null }),
}));
