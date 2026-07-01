import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// ── Framer-motion stub ────────────────────────────────────────────────────────
// AnimatePresence mode="wait" never completes exit animations in jsdom.
// Stub it so content mounts synchronously and useInView always returns true.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const FRAMER_PROPS = new Set([
    "initial", "animate", "exit", "transition", "whileInView", "whileHover",
    "whileTap", "viewport", "layoutId", "layout", "variants", "custom",
  ]);
  const motion = new Proxy(
    {},
    {
      get: (_t, tag) =>
        React.forwardRef(({ children, ...props }, ref) => {
          const rest = {};
          for (const k of Object.keys(props)) {
            if (!FRAMER_PROPS.has(k)) rest[k] = props[k];
          }
          return React.createElement(tag, { ref, ...rest }, children);
        }),
    }
  );
  return {
    motion,
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useInView: () => true,
  };
});

// ── Asset stubs ───────────────────────────────────────────────────────────────
// Vite image imports resolve to URLs in real builds; jest/vitest returns the
// module path string. Stub them so the component can render without real files.
vi.mock("../../../assets/StatsSection/vet-with-dog.jpg", () => ({ default: "vet-with-dog.jpg" }));
vi.mock("../../../assets/StatsSection/slide-1-a.jpg",   () => ({ default: "slide-1-a.jpg" }));
vi.mock("../../../assets/StatsSection/slide-1-b.jpg",   () => ({ default: "slide-1-b.jpg" }));
vi.mock("../../../assets/StatsSection/slide-1-c.jpg",   () => ({ default: "slide-1-c.jpg" }));
vi.mock("../../../assets/StatsSection/slide-2-a.jpg",   () => ({ default: "slide-2-a.jpg" }));
vi.mock("../../../assets/StatsSection/slide-2-b.jpg",   () => ({ default: "slide-2-b.jpg" }));
vi.mock("../../../assets/StatsSection/slide-2-c.png",   () => ({ default: "slide-2-c.png" }));
vi.mock("../../../assets/StatsSection/slide-3-a.jpg",   () => ({ default: "slide-3-a.jpg" }));
vi.mock("../../../assets/StatsSection/slide-3-b.jpg",   () => ({ default: "slide-3-b.jpg" }));
vi.mock("../../../assets/StatsSection/slide-3-c.png",   () => ({ default: "slide-3-c.png" }));

// ── feedbackApi stub ──────────────────────────────────────────────────────────
vi.mock("../../../Services/api/feedbackApi", () => ({
  default: { getFeedback: vi.fn() },
}));

import feedbackApi from "../../../Services/api/feedbackApi";
import StatsSection from "./StatsSection";

// CSS imports in jsdom silently error without a stub; treat as no-op
vi.mock("./StatsSection.css", () => ({}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no DB feedback — component falls back to hardcoded TESTIMONIALS
  feedbackApi.getFeedback.mockResolvedValue({ data: [] });
});

describe("StatsSection — renders without crashing", () => {
  it("mounts and shows the section element", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() =>
      expect(feedbackApi.getFeedback).toHaveBeenCalledWith({ limit: 12 })
    );
    expect(container.querySelector(".ss-section")).toBeInTheDocument();
  });
});

describe("StatsSection — static stats", () => {
  it("displays all three stat values", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText("90K")).toBeInTheDocument();
    expect(screen.getByText("150K")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("displays all three stat labels", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText("Satisfied User")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByText("Project Success")).toBeInTheDocument();
  });
});

describe("StatsSection — about section text", () => {
  it("shows the about heading", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(
      screen.getByText(/where your pets are at the heart/i)
    ).toBeInTheDocument();
  });

  it("shows the about body copy", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText(/from grooming to wellness/i)).toBeInTheDocument();
  });
});

describe("StatsSection — testimonials heading", () => {
  it("shows 'What Our Client Say'", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText(/what our client say/i)).toBeInTheDocument();
  });
});

describe("StatsSection — hardcoded testimonials fallback", () => {
  it("shows the first testimonial author when API returns empty", async () => {
    feedbackApi.getFeedback.mockResolvedValue({ data: [] });
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText(/john corner/i)).toBeInTheDocument();
  });

  it("shows the first testimonial quote text", async () => {
    feedbackApi.getFeedback.mockResolvedValue({ data: [] });
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByText(/best in the area/i)).toBeInTheDocument();
  });

  it("renders navigation buttons (Previous / Next)", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("renders one dot per hardcoded testimonial (5 total)", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    const dots = screen.getAllByRole("button", { name: /go to testimonial/i });
    expect(dots).toHaveLength(5);
  });

  it("navigates to the next testimonial when next is clicked", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());

    // Initially shows first author (John Corner)
    expect(screen.getAllByText(/john corner/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // After clicking next, shows second author (Sarah Mitchell)
    expect(screen.getAllByText(/sarah mitchell/i).length).toBeGreaterThan(0);
  });

  it("navigates to the previous testimonial when prev is clicked", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());

    // Click next to get to slide 2
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getAllByText(/sarah mitchell/i).length).toBeGreaterThan(0);

    // Click prev to go back to slide 1
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getAllByText(/john corner/i).length).toBeGreaterThan(0);
  });

  it("clicking prev from first slide wraps to the last slide", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());

    // Initially on slide 0 (dot 1 active)
    const activeBefore = container.querySelectorAll(".ss-dot--active");
    expect(activeBefore[0].getAttribute("aria-label")).toBe("Go to testimonial 1");

    // Clicking prev from slide 0 should wrap to the last slide (index 4)
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    const activeAfter = container.querySelectorAll(".ss-dot--active");
    expect(activeAfter[0].getAttribute("aria-label")).toBe("Go to testimonial 5");
  });

  it("jumps to a specific testimonial when a dot is clicked", async () => {
    render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());

    const dots = screen.getAllByRole("button", { name: /go to testimonial/i });
    fireEvent.click(dots[2]); // jump to 3rd (David Lim)
    expect(screen.getAllByText(/david lim/i).length).toBeGreaterThan(0);
  });
});

describe("StatsSection — DB feedback path", () => {
  it("renders testimonials from the API when data is present", async () => {
    feedbackApi.getFeedback.mockResolvedValue({
      data: [
        { _id: "f1", name: "Alice", role: "Admin", message: "Great place!", rating: 5, photos: [] },
        { _id: "f2", name: "Bob",   role: "",      message: "Loved it!",    rating: 4, photos: [] },
      ],
    });

    render(<StatsSection />);
    await waitFor(() => screen.getByText(/alice/i));
    expect(screen.getByText(/great place!/i)).toBeInTheDocument();
  });

  it("shows author initials when DB testimonial has no photos", async () => {
    feedbackApi.getFeedback.mockResolvedValue({
      data: [
        { _id: "f1", name: "Charlie", role: "User", message: "Awesome!", rating: 5, photos: [] },
      ],
    });

    render(<StatsSection />);
    await waitFor(() => screen.getByText(/charlie/i));
    // The initial avatar shows the first letter
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("formats 'name, role' as author when role is present", async () => {
    feedbackApi.getFeedback.mockResolvedValue({
      data: [
        { _id: "f1", name: "Diana", role: "Vet", message: "Test.", rating: 5, photos: [] },
      ],
    });

    render(<StatsSection />);
    await waitFor(() => screen.getByText("Diana, Vet"));
  });

  it("shows only name when role is empty", async () => {
    feedbackApi.getFeedback.mockResolvedValue({
      data: [
        { _id: "f1", name: "Eve", role: "", message: "Nice.", rating: 5, photos: [] },
      ],
    });

    render(<StatsSection />);
    await waitFor(() => screen.getByText("Eve"));
  });

  it("falls back to hardcoded testimonials when getFeedback rejects", async () => {
    feedbackApi.getFeedback.mockRejectedValue(new Error("Network error"));
    render(<StatsSection />);
    // Wait for the rejection to be handled
    await waitFor(() =>
      expect(feedbackApi.getFeedback).toHaveBeenCalled()
    );
    // Should still show hardcoded content
    expect(screen.getByText(/john corner/i)).toBeInTheDocument();
  });
});

describe("StatsSection — CSS classes present", () => {
  it("has ss-section root class", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(container.querySelector(".ss-section")).toBeInTheDocument();
  });

  it("has ss-about class for the about row", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(container.querySelector(".ss-about")).toBeInTheDocument();
  });

  it("has ss-stats class for the stats grid", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(container.querySelector(".ss-stats")).toBeInTheDocument();
  });

  it("has ss-test-card class for the testimonial card", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(container.querySelector(".ss-test-card")).toBeInTheDocument();
  });

  it("has ss-dots class for the dot indicators", async () => {
    const { container } = render(<StatsSection />);
    await waitFor(() => expect(feedbackApi.getFeedback).toHaveBeenCalled());
    expect(container.querySelector(".ss-dots")).toBeInTheDocument();
  });
});
