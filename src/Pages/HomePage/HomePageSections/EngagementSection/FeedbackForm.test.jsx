import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../../../Services/api/feedbackApi", () => ({
  default: {
    submitFeedback: vi.fn(),
  },
}));

const mockAddToast = vi.fn();
vi.mock("../../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// CSS imports are no-ops in jsdom
vi.mock("./FeedbackForm.css", () => ({}));

// ── Helpers ────────────────────────────────────────────────────────────────

// URL.createObjectURL / revokeObjectURL not available in jsdom
global.URL.createObjectURL = vi.fn(() => "blob:fake-url");
global.URL.revokeObjectURL = vi.fn();

// ── Imports (after mocks) ──────────────────────────────────────────────────

import feedbackApi from "../../../../Services/api/feedbackApi";
import FeedbackForm from "./FeedbackForm";

// ── Tests ──────────────────────────────────────────────────────────────────

describe("FeedbackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    feedbackApi.submitFeedback.mockResolvedValue({ success: true });
  });

  it("renders all form fields", () => {
    render(<FeedbackForm />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your role/i)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /star rating/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/your feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeInTheDocument();
  });

  it("fills fields, selects rating and submits — calls feedbackApi.submitFeedback", async () => {
    render(<FeedbackForm />);

    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { name: "name", value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/your role/i), {
      target: { name: "role", value: "Dog parent" },
    });
    fireEvent.change(screen.getByLabelText(/your feedback/i), {
      target: { name: "message", value: "Absolutely love this place!" },
    });

    // Click the 4-star button
    fireEvent.click(screen.getByRole("button", { name: /4 stars/i }));

    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(feedbackApi.submitFeedback).toHaveBeenCalledTimes(1);
    });

    // Verify the FormData passed contains expected fields
    const fd = feedbackApi.submitFeedback.mock.calls[0][0];
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get("name")).toBe("Alice");
    expect(fd.get("role")).toBe("Dog parent");
    expect(fd.get("rating")).toBe("4");
    expect(fd.get("message")).toBe("Absolutely love this place!");

    // Toast shown
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringMatching(/approved/i),
      "success"
    );
  });

  it("shows a toast error when no rating is selected", async () => {
    render(<FeedbackForm />);

    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { name: "name", value: "Bob" },
    });
    fireEvent.change(screen.getByLabelText(/your feedback/i), {
      target: { name: "message", value: "Great service overall!" },
    });

    // Submit without setting rating
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/rating/i),
        "error"
      );
    });

    expect(feedbackApi.submitFeedback).not.toHaveBeenCalled();
  });

  it("cannot add a 4th photo — picker disappears at cap", () => {
    render(<FeedbackForm />);

    const makeFile = (name) =>
      new File(["x"], name, { type: "image/jpeg" });

    // Add 3 photos via the hidden file input
    const input = screen.getByTestId("photo-input");

    // First: add 2
    fireEvent.change(input, {
      target: { files: [makeFile("a.jpg"), makeFile("b.jpg")] },
    });

    // Picker should still be visible (2 < 3)
    expect(screen.getByTestId("photo-input")).toBeInTheDocument();

    // Now add 1 more (total = 3)
    const input2 = screen.getByTestId("photo-input");
    fireEvent.change(input2, {
      target: { files: [makeFile("c.jpg")] },
    });

    // File picker (and its label with "Add Photo") should be gone
    expect(screen.queryByTestId("photo-input")).not.toBeInTheDocument();
    expect(screen.getByText(/Maximum 3 photos reached/i)).toBeInTheDocument();
  });
});
