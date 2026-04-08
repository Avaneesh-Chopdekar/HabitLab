import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@/lib/mmkv";
import IBaseline from "@/types/IBaseline";

type OnboardingState = {
  selectedHabits: string[];
  selectedProblems: string[];
  baseline: IBaseline;
  experiment: string;

  // actions
  setSelectedHabits: (habits: string[]) => void;
  setSelectedProblems: (problems: string[]) => void;
  setBaseline: (baseline: Partial<IBaseline>) => void;
  setExperiment: (exp: string) => void;

  reset: () => void;
};

const initialBaseline: IBaseline = {
  sleepQualityScore: 0,
  focusScore: 0,
  moodScore: 0,
  phoneHours: 0,
  exerciseScore: 0,
  confidenceScore: 5,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      selectedHabits: [],
      selectedProblems: [],
      baseline: initialBaseline,
      experiment: "",

      setSelectedHabits: (habits) => set({ selectedHabits: habits }),

      setSelectedProblems: (problems) => set({ selectedProblems: problems }),

      setBaseline: (data) =>
        set((state) => ({
          baseline: { ...state.baseline, ...data },
        })),

      setExperiment: (exp) => set({ experiment: exp }),

      reset: () =>
        set({
          selectedHabits: [],
          selectedProblems: [],
          baseline: initialBaseline,
          experiment: "",
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
