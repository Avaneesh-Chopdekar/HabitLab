import { create } from "zustand";

type Source = "manual" | "health";

type HealthState = {
  sleepSource: Source;
  exerciseSource: Source;

  setSleepSource: (s: Source) => void;
  setExerciseSource: (s: Source) => void;
};

export const useHealthStore = create<HealthState>((set) => ({
  sleepSource: "manual",
  exerciseSource: "manual",

  setSleepSource: (s) => set({ sleepSource: s }),
  setExerciseSource: (s) => set({ exerciseSource: s }),
}));
