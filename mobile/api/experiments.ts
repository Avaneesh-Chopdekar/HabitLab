import api from ".";

export type StartExperimentPayload = {
  title?: string;
  duration_days?: number;
  template_id?: number;
  sub_experiments?: string[];
};

export type CheckinPayload = {
  sleep_score: number | null;
  mood_score: number;
  focus_score: number;
  phone_hours: number;
  exercise_score: number | null;
  confidence: number;

  steps?: number | null;
  active_minutes?: number | null;
  avg_heart_rate?: number | null;
  sleep_hours?: number | null;
  effort_score?: number | null;
};

export type UpdateBaselinePayload = {
  sleep_score?: number;
  mood_score?: number;
  focus_score?: number;
  phone_hours?: number;
  exercise_score?: number;
  confidence_score?: number;
};

// 🚀 Start Experiment
export const startExperiment = async (data: StartExperimentPayload) => {
  try {
    const res = await api.post("/api/experiments/start/", data);
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.error || "Failed to start experiment",
    };
  }
};

// 📊 Get current experiment
export const getCurrentExperiment = async () => {
  try {
    const res = await api.get("/api/experiments/current/");
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return { ok: false, error: "Failed to fetch" };
  }
};

// ✅ Daily checkin
export const dailyCheckin = async (data: CheckinPayload) => {
  try {
    const res = await api.post("/api/experiments/checkin/", data);
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.error || "Checkin failed",
    };
  }
};

// 📈 Get result
export const getExperimentResult = async (expId: number) => {
  try {
    const res = await api.get(`/api/experiments/result/${expId}/`);
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.error || "Failed to fetch result",
    };
  }
};

// ⏯ Pause / Resume
export const toggleExperiment = async () => {
  try {
    const res = await api.post("/api/experiments/toggle/");
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return {
      ok: false,
      error: "Failed to toggle experiment",
    };
  }
};

export const restartExperiment = async () => {
  try {
    const res = await api.post("/api/experiments/restart/");

    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.error || "Failed to restart",
    };
  }
};

export const updateBaseline = async (data: UpdateBaselinePayload) => {
  try {
    const res = await api.post("/api/experiments/baseline/", data);
    return { ok: true, data: res.data.data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.error || "Failed to update baseline",
    };
  }
};

export const getAllExperiments = async () => {
  try {
    const res = await api.get("/api/experiments/all/");
    return { ok: true, data: res.data.data };
  } catch {
    return { ok: false, error: "Failed to fetch experiments" };
  }
};

export const getTemplates = async () => {
  try {
    const res = await api.get("/api/experiments/templates/");
    return { ok: true, data: res.data.data };
  } catch {
    return { ok: false, error: "Failed to fetch templates" };
  }
};

export const suggestSubExperiments = async (title: string) => {
  try {
    const res = await api.post("/api/experiments/suggest/", { title });
    return { ok: true, data: res.data.data };
  } catch {
    return { ok: false };
  }
};

export const getBaseline = async () => {
  try {
    const res = await api.get("/api/experiments/baseline/");
    return { ok: true, data: res.data.data };
  } catch {
    return { ok: false, error: "Failed to fetch baseline" };
  }
};
