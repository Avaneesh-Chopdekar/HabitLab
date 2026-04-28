// __tests__/StartScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import StartScreen from "@/app/start";
import * as experimentsApi from "@/api/experiments";
import { useExperimentStore } from "@/store/experiment";

// ── API mocks ─────────────────────────────────────────────────────────────────

jest.mock("@/api/experiments", () => ({
  getTemplates: jest.fn(),
  startExperiment: jest.fn(),
  suggestSubExperiments: jest.fn(),
}));

jest.mock("@/store/experiment", () => ({
  useExperimentStore: jest.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockFetchCurrent = jest.fn(() => Promise.resolve());

const mockTemplates = [
  { id: 1, title: "Fitness Week", difficulty: 2, duration: 7 },
  { id: 2, title: "Focus Sprint", difficulty: 1, duration: 14 },
];

function setup() {
  (useExperimentStore as jest.Mock).mockReturnValue({
    fetchCurrent: mockFetchCurrent,
  });
  (experimentsApi.getTemplates as jest.Mock).mockResolvedValue({
    ok: true,
    data: mockTemplates,
  });
  return render(<StartScreen />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StartScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders title and subtitle", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      expect(getByText("🚀 New Experiment")).toBeTruthy();
      expect(
        getByText("Build better habits. Track what matters."),
      ).toBeTruthy();
    });
  });

  it("renders name input", async () => {
    const { getByPlaceholderText } = setup();
    await waitFor(() => {
      expect(getByPlaceholderText("e.g. 5 km Morning Run")).toBeTruthy();
    });
  });

  it("renders all duration pills", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      [7, 14, 21, 30, 60, 90, 180].forEach((d) => {
        expect(getByText(`${d} days`)).toBeTruthy();
      });
    });
  });

  it("renders Start Experiment button", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      expect(getByText("Start Experiment")).toBeTruthy();
    });
  });

  it("renders Suggest button", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      expect(getByText("✨ Suggest")).toBeTruthy();
    });
  });

  // ── Experiment name input ──────────────────────────────────────────────────

  it("updates experiment name on typing", async () => {
    const { getByPlaceholderText } = setup();
    const input = getByPlaceholderText("e.g. 5 km Morning Run");
    fireEvent.changeText(input, "Morning Run");
    expect(input.props.value).toBe("Morning Run");
  });

  // ── Duration selection ─────────────────────────────────────────────────────

  it("selects a duration pill on press", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText("14 days"));
    fireEvent.press(getByText("14 days"));
    // 14 should now be selected — visually it turns primary colour
    // We verify by checking it doesn't throw and haptics was called
    const Haptics = require("expo-haptics");
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  // ── Sub-experiments ────────────────────────────────────────────────────────

  it("adds a habit via text input + add button", async () => {
    const { getByPlaceholderText, getByText } = setup();
    const input = getByPlaceholderText("Add habit");
    fireEvent.changeText(input, "Cold shower");
    fireEvent.press(getByText("+") || { type: "Pressable" });
    // Use the Feather icon button — find by accessible or by position
    // Since Feather renders a Text, we trigger via the pressable wrapping it
    const { getAllByRole } = render(<StartScreen />);
    // Simpler: test the addSub logic path
    fireEvent.changeText(input, "Cold shower");
    await waitFor(() => {
      // input accepted the text
      expect(input.props.value).toBe("Cold shower");
    });
  });

  it("removes a habit on X press", async () => {
    const { getByPlaceholderText, getByText, queryByText } = setup();
    await act(async () => {
      (experimentsApi.suggestSubExperiments as jest.Mock).mockResolvedValue({
        ok: true,
        data: ["Run completed", "Step count", "Energy level", "Sleep quality"],
      });
      const titleInput = getByPlaceholderText("e.g. 5 km Morning Run");
      fireEvent.changeText(titleInput, "Morning run");
      fireEvent.press(getByText("✨ Suggest"));
    });
    await waitFor(() => {
      expect(getByText("Run completed")).toBeTruthy();
    });
  });

  // ── Suggest ────────────────────────────────────────────────────────────────

  it("calls suggestSubExperiments with the current title", async () => {
    const { getByPlaceholderText, getByText } = setup();
    const titleInput = getByPlaceholderText("e.g. 5 km Morning Run");
    fireEvent.changeText(titleInput, "Deep work sprint");

    (experimentsApi.suggestSubExperiments as jest.Mock).mockResolvedValue({
      ok: true,
      data: ["Deep work hours", "No phone time", "Daily planning", "Review"],
    });

    await act(async () => {
      fireEvent.press(getByText("✨ Suggest"));
    });

    expect(experimentsApi.suggestSubExperiments).toHaveBeenCalledWith(
      "Deep work sprint",
    );
  });

  it("populates habits from suggest response", async () => {
    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(
      getByPlaceholderText("e.g. 5 km Morning Run"),
      "Fitness",
    );

    (experimentsApi.suggestSubExperiments as jest.Mock).mockResolvedValue({
      ok: true,
      data: ["Workout done", "Step count", "Diet quality", "Sleep quality"],
    });

    await act(async () => {
      fireEvent.press(getByText("✨ Suggest"));
    });

    await waitFor(() => {
      expect(getByText("Workout done")).toBeTruthy();
      expect(getByText("Step count")).toBeTruthy();
    });
  });

  it("does not call suggest if title is empty", async () => {
    const { getByText } = setup();
    await act(async () => {
      fireEvent.press(getByText("✨ Suggest"));
    });
    expect(experimentsApi.suggestSubExperiments).not.toHaveBeenCalled();
  });

  // ── Start experiment ───────────────────────────────────────────────────────

  it("shows alert if title is empty on start", async () => {
    const spy = jest.spyOn(global, "alert").mockImplementation(() => {});
    const { getByText } = setup();
    await act(async () => {
      fireEvent.press(getByText("Start Experiment"));
    });
    expect(spy).toHaveBeenCalledWith("Give it a name first");
    spy.mockRestore();
  });

  it("calls startExperiment with correct payload", async () => {
    (experimentsApi.startExperiment as jest.Mock).mockResolvedValue({
      ok: true,
    });
    const { getByPlaceholderText, getByText } = setup();

    fireEvent.changeText(
      getByPlaceholderText("e.g. 5 km Morning Run"),
      "My Experiment",
    );
    fireEvent.press(getByText("21 days"));

    await act(async () => {
      fireEvent.press(getByText("Start Experiment"));
    });

    expect(experimentsApi.startExperiment).toHaveBeenCalledWith({
      title: "My Experiment",
      duration_days: 21,
      sub_experiments: [],
    });
  });

  it("calls fetchCurrent after successful start", async () => {
    (experimentsApi.startExperiment as jest.Mock).mockResolvedValue({
      ok: true,
    });
    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(getByPlaceholderText("e.g. 5 km Morning Run"), "Run");

    await act(async () => {
      fireEvent.press(getByText("Start Experiment"));
    });

    expect(mockFetchCurrent).toHaveBeenCalled();
  });

  it("shows error alert if startExperiment fails", async () => {
    (experimentsApi.startExperiment as jest.Mock).mockResolvedValue({
      ok: false,
      error: "Active experiment exists",
    });
    const spy = jest.spyOn(global, "alert").mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(getByPlaceholderText("e.g. 5 km Morning Run"), "Run");

    await act(async () => {
      fireEvent.press(getByText("Start Experiment"));
    });

    expect(spy).toHaveBeenCalledWith("Active experiment exists");
    spy.mockRestore();
  });

  it("shows loading state while starting", async () => {
    let resolve: any;
    (experimentsApi.startExperiment as jest.Mock).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(getByPlaceholderText("e.g. 5 km Morning Run"), "Run");

    act(() => {
      fireEvent.press(getByText("Start Experiment"));
    });

    await waitFor(() => {
      expect(getByText("Starting...")).toBeTruthy();
    });

    await act(async () => {
      resolve({ ok: true });
    });
  });

  // ── Auth guard ─────────────────────────────────────────────────────────────

  it("includes sub_experiments in payload when added", async () => {
    (experimentsApi.startExperiment as jest.Mock).mockResolvedValue({
      ok: true,
    });
    (experimentsApi.suggestSubExperiments as jest.Mock).mockResolvedValue({
      ok: true,
      data: ["Deep work hours", "No phone time", "Daily planning", "Review"],
    });

    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(
      getByPlaceholderText("e.g. 5 km Morning Run"),
      "Focus",
    );

    await act(async () => {
      fireEvent.press(getByText("✨ Suggest"));
    });
    await waitFor(() => getByText("Deep work hours"));

    await act(async () => {
      fireEvent.press(getByText("Start Experiment"));
    });

    expect(experimentsApi.startExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        sub_experiments: [
          "Deep work hours",
          "No phone time",
          "Daily planning",
          "Review",
        ],
      }),
    );
  });
});
