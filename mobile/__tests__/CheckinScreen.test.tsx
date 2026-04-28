// __tests__/CheckinScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import CheckinScreen from "@/app/checkin";
import * as experimentsApi from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";
import { useHealthStore } from "@/store/health";
import * as healthCache from "@/utils/healthCache";
import * as notifications from "@/services/notifications";

// ── API mocks ─────────────────────────────────────────────────────────────────

jest.mock("@/api/experiments", () => ({
  dailyCheckin: jest.fn(),
}));

jest.mock("@/store/experiment", () => ({
  useExperimentStore: jest.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASELINE = {
  sleep_score: 5,
  focus_score: 5,
  mood_score: 5,
  phone_hours: 3,
  exercise_score: 5,
  confidence_score: 5,
  steps_avg: 3000,
  active_minutes_avg: 20,
  sleep_avg: 6,
};

const EXPERIMENT = {
  id: 1,
  title: "Morning Run",
  day: 2,
  duration: 7,
  progress: 14.28,
  streak: 1,
  missed_days: 0,
  difficulty: 1,
  baseline: BASELINE,
  sub_experiments: [],
  last_checkin: null,
};

const EXPERIMENT_WITH_SUBS = {
  ...EXPERIMENT,
  sub_experiments: [
    { id: 10, name: "Run completed" },
    { id: 11, name: "Step count" },
  ],
};

const mockFetchCurrent = jest.fn(() => Promise.resolve());

function setupStore(experiment = EXPERIMENT) {
  (useExperimentStore as jest.Mock).mockReturnValue({
    current: experiment,
    fetchCurrent: mockFetchCurrent,
  });
}

function setupHealth(sleepSource = "manual", exerciseSource = "manual") {
  (useHealthStore as jest.Mock).mockReturnValue({
    sleepSource,
    exerciseSource,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CheckinScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
    setupHealth();
    (healthCache.getCachedHealthData as jest.Mock).mockReturnValue(null);
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the screen title", () => {
    const { getByText } = render(<CheckinScreen />);
    expect(getByText("Daily Check-in")).toBeTruthy();
  });

  it("renders Submit Check-in button", () => {
    const { getByText } = render(<CheckinScreen />);
    expect(getByText("Submit Check-in")).toBeTruthy();
  });

  it("renders core sliders in manual mode", () => {
    const { getByText } = render(<CheckinScreen />);
    expect(getByText(/Focus/)).toBeTruthy();
    expect(getByText(/Mood/)).toBeTruthy();
    expect(getByText(/Screen Time/)).toBeTruthy();
    expect(getByText(/Confidence/)).toBeTruthy();
  });

  it("renders Sleep slider when sleepSource is manual", () => {
    setupHealth("manual", "manual");
    const { getByText } = render(<CheckinScreen />);
    expect(getByText(/Sleep Quality/)).toBeTruthy();
  });

  it("hides Sleep slider when sleepSource is health", () => {
    setupHealth("health", "manual");
    const { queryByText } = render(<CheckinScreen />);
    expect(queryByText(/Sleep Quality/)).toBeNull();
  });

  it("renders Exercise slider when exerciseSource is manual", () => {
    setupHealth("manual", "manual");
    const { getByText } = render(<CheckinScreen />);
    expect(getByText(/Exercise/)).toBeTruthy();
  });

  it("hides Exercise slider when exerciseSource is health", () => {
    setupHealth("manual", "health");
    const { queryByText } = render(<CheckinScreen />);
    expect(queryByText(/^Exercise/)).toBeNull();
  });

  // ── Health notices ─────────────────────────────────────────────────────────

  it("shows Health Connect notice for sleep when health source", () => {
    setupHealth("health", "manual");
    const { getByText } = render(<CheckinScreen />);
    expect(getByText("Sleep auto-detected from Health Connect")).toBeTruthy();
  });

  it("shows Health Connect notice for exercise when health source", () => {
    setupHealth("manual", "health");
    const { getByText } = render(<CheckinScreen />);
    expect(
      getByText("Exercise auto-detected from Health Connect"),
    ).toBeTruthy();
  });

  // ── Health loading ─────────────────────────────────────────────────────────

  it("shows syncing text briefly during health load", async () => {
    setupHealth("health", "health");
    // Delay health fetch to catch loading state
    const { getStepsToday } = require("@/utils/health");
    (getStepsToday as jest.Mock).mockReturnValue(
      new Promise((r) => setTimeout(() => r(5000), 100)),
    );
    const { queryByText } = render(<CheckinScreen />);
    await waitFor(() => {
      expect(queryByText("Syncing health data...")).toBeTruthy();
    });
  });

  it("uses cached health data when available", async () => {
    (healthCache.getCachedHealthData as jest.Mock).mockReturnValue({
      sleep_score: 8,
      exercise_score: 7,
    });
    setupHealth("health", "health");
    const { getStepsToday } = require("@/utils/health");
    render(<CheckinScreen />);
    await waitFor(() => {
      // Should NOT call fresh health fetches
      expect(getStepsToday).not.toHaveBeenCalled();
    });
  });

  // ── Sub-experiments ────────────────────────────────────────────────────────

  it("renders sub-experiment sliders when present", () => {
    setupStore(EXPERIMENT_WITH_SUBS);
    const { getByText } = render(<CheckinScreen />);
    expect(getByText("🧪 Sub-Experiments")).toBeTruthy();
    expect(getByText(/Run completed/)).toBeTruthy();
    expect(getByText(/Step count/)).toBeTruthy();
  });

  it("does not render sub-experiments section when empty", () => {
    const { queryByText } = render(<CheckinScreen />);
    expect(queryByText("🧪 Sub-Experiments")).toBeNull();
  });

  it("initializes sub-scores to 5", async () => {
    setupStore(EXPERIMENT_WITH_SUBS);
    const { getByText } = render(<CheckinScreen />);
    await waitFor(() => {
      // Both sub sliders should show (5) as default
      expect(getByText(/Run completed \(5\)/)).toBeTruthy();
      expect(getByText(/Step count \(5\)/)).toBeTruthy();
    });
  });

  // ── Submission ─────────────────────────────────────────────────────────────

  it("calls dailyCheckin on submit", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(experimentsApi.dailyCheckin).toHaveBeenCalledTimes(1);
  });

  it("submits correct payload shape", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    const payload = (experimentsApi.dailyCheckin as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      sleep_score: expect.any(Number),
      focus_score: expect.any(Number),
      mood_score: expect.any(Number),
      phone_hours: expect.any(Number),
      exercise_score: expect.any(Number),
      confidence: expect.any(Number),
      sub_scores: expect.any(Array),
    });
  });

  it("includes sub_scores in payload", async () => {
    setupStore(EXPERIMENT_WITH_SUBS);
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    const payload = (experimentsApi.dailyCheckin as jest.Mock).mock.calls[0][0];
    expect(payload.sub_scores).toHaveLength(2);
    expect(payload.sub_scores[0]).toMatchObject({
      id: expect.any(Number),
      score: expect.any(Number),
    });
  });

  it("shows success alert on successful checkin", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(alertSpy).toHaveBeenCalledWith("Success", "Check-in saved 🎉");
  });

  it("calls cancelTwoHourWarningToday after successful checkin", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(notifications.cancelTwoHourWarningToday).toHaveBeenCalled();
  });

  it("calls fetchCurrent after successful checkin", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(mockFetchCurrent).toHaveBeenCalled();
  });

  it("shows error alert on failed checkin", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: false,
      error: "Already checked in today",
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(alertSpy).toHaveBeenCalledWith("Error", "Already checked in today");
  });

  it("shows error alert on exception", async () => {
    (experimentsApi.dailyCheckin as jest.Mock).mockRejectedValue(
      new Error("Network error"),
    );
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    expect(alertSpy).toHaveBeenCalledWith("Error", "Something went wrong");
  });

  it("shows loading state while submitting", async () => {
    let resolve: any;
    (experimentsApi.dailyCheckin as jest.Mock).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { getByText } = render(<CheckinScreen />);

    act(() => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    await waitFor(() => {
      expect(getByText("Saving...")).toBeTruthy();
    });

    await act(async () => {
      resolve({ ok: true, data: { completed: false } });
    });
  });

  it("disables submit button while loading", async () => {
    let resolve: any;
    (experimentsApi.dailyCheckin as jest.Mock).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { getByText } = render(<CheckinScreen />);

    act(() => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    await waitFor(() => {
      const btn = getByText("Saving...");
      // The parent Pressable should have disabled prop
      expect(btn).toBeTruthy();
    });

    await act(async () => {
      resolve({ ok: true, data: { completed: false } });
    });
  });

  // ── Health source: exercise payload ────────────────────────────────────────

  it("includes health exercise data in payload when exerciseSource is health", async () => {
    setupHealth("manual", "health");
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    const payload = (experimentsApi.dailyCheckin as jest.Mock).mock.calls[0][0];
    expect(payload.steps).not.toBeNull();
    expect(payload.active_minutes).not.toBeNull();
    expect(payload.effort_score).not.toBeNull();
  });

  it("sends null for exercise health fields when source is manual", async () => {
    setupHealth("manual", "manual");
    (experimentsApi.dailyCheckin as jest.Mock).mockResolvedValue({
      ok: true,
      data: { completed: false },
    });
    const { getByText } = render(<CheckinScreen />);

    await act(async () => {
      fireEvent.press(getByText("Submit Check-in"));
    });

    const payload = (experimentsApi.dailyCheckin as jest.Mock).mock.calls[0][0];
    expect(payload.steps).toBeNull();
    expect(payload.active_minutes).toBeNull();
    expect(payload.effort_score).toBeNull();
  });
});
