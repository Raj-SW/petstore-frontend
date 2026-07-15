import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const FRAMER_PROPS = new Set([
    "initial", "animate", "exit", "transition", "whileInView", "whileHover",
    "whileTap", "viewport", "layoutId", "layout", "variants",
  ]);
  const motion = new Proxy({}, {
    get: (_t, tag) =>
      React.forwardRef(({ children, ...props }, ref) => {
        const rest = {};
        for (const k of Object.keys(props)) if (!FRAMER_PROPS.has(k)) rest[k] = props[k];
        return React.createElement(tag, { ref, ...rest }, children);
      }),
  });
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useInView: () => true,
    useReducedMotion: () => true, // counters render final values; marquee static
    // count-up helper: jump straight to the target so tests are deterministic
    animate: (_from, to, opts) => { opts?.onUpdate?.(to); return { stop: () => {} }; },
  };
});

vi.mock("../../../Services/api/feedbackApi", () => ({
  default: { getFeedback: vi.fn() },
}));

vi.mock("../../../assets/StatsSection/vet-with-dog.jpg", () => ({ default: "vet.jpg" }));

import feedbackApi from "../../../Services/api/feedbackApi";
import StatsSection from "./StatsSection";

const FEEDBACK = [
  { _id: "f1", name: "Amina Joomun", role: "Dog mum", rating: 5,
    message: "The veterinary team diagnosed my dog quickly and the follow-up care was outstanding.",
    photos: [{ url: "https://img/amina.jpg" }] },
  { _id: "f2", name: "Kevin Chan", rating: 4,
    message: "Grooming is exceptional and my cat actually enjoys going there now." },
  { _id: "f3", name: "Priya Nair", rating: 0,
    message: "Lovely welcoming team, my rabbit felt at home." },
];

beforeEach(() => {
  vi.clearAllMocks();
  feedbackApi.getFeedback.mockResolvedValue({ data: FEEDBACK });
});

describe("StatsSection (trust story band)", () => {
  it("fetches feedback and features the first testimonial with author and stars", async () => {
    render(<StatsSection />);
    expect(await screen.findByText(/follow-up care was outstanding/)).toBeInTheDocument();
    expect(feedbackApi.getFeedback).toHaveBeenCalledWith({ limit: 12 });
    expect(screen.getByText(/Amina Joomun/)).toBeInTheDocument();
    // both the featured note and Amina's chip carry the label — assert at least one
    expect(screen.getAllByLabelText("Rated 5 out of 5").length).toBeGreaterThanOrEqual(1);
  });

  it("falls back to hardcoded testimonials when the API rejects", async () => {
    feedbackApi.getFeedback.mockRejectedValue(new Error("boom"));
    render(<StatsSection />);
    expect(await screen.findByText(/John Corner, Melbourne/)).toBeInTheDocument();
  });

  it("computes the live average rating from rated items only", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    // (5 + 4) / 2 = 4.5 — the rating-0 item is excluded
    expect(screen.getByText("4.5★")).toBeInTheDocument();
  });

  it("uses the fallback average when no items carry ratings", async () => {
    feedbackApi.getFeedback.mockResolvedValue({
      data: [{ _id: "x", name: "NoStars", rating: 0, message: "nice" }],
    });
    render(<StatsSection />);
    await screen.findByText(/nice/);
    expect(screen.getByText("4.8★")).toBeInTheDocument();
  });

  it("clicking a marquee chip features that testimonial and marks it pressed", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    const chip = screen.getByRole("button", { name: /Kevin/ });
    fireEvent.click(chip);
    expect(await screen.findByText(/enjoys going there now/)).toBeInTheDocument();
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a monogram disc when the featured testimonial has no photo", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    fireEvent.click(screen.getByRole("button", { name: /Kevin/ }));
    await screen.findByText(/enjoys going there now/);
    expect(screen.getByTestId("ts-monogram").textContent).toBe("K");
  });

  it("reduced motion renders the marquee as a static grid without duplicate chips", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    // one chip per testimonial — no aria-hidden duplicate track
    const chips = screen.getAllByRole("button", { name: /Amina|Kevin|Priya/ });
    expect(chips).toHaveLength(3);
    expect(document.querySelector(".ts-track[aria-hidden]")).toBeNull();
  });

  it("renders the mission headline and all three trust labels", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    expect(screen.getByText(/at the heart of everything we do/i)).toBeInTheDocument();
    expect(screen.getByText("Successful Relocations")).toBeInTheDocument();
    expect(screen.getByText("Certified Professionals")).toBeInTheDocument();
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
  });

  it("dot N selects testimonial N", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    fireEvent.click(screen.getByRole("button", { name: "Go to testimonial 3" }));
    expect(await screen.findByText(/rabbit felt at home/)).toBeInTheDocument();
  });

  it("renders prev/next arrows that navigate testimonials and stop auto-advance", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }));
    expect(await screen.findByText(/enjoys going there now/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous testimonial" }));
    expect(await screen.findByText(/follow-up care was outstanding/)).toBeInTheDocument();
  });

  it("renders the chip wall statically (no duplicate track) when fewer than 8 testimonials", async () => {
    render(<StatsSection />);
    await screen.findByText(/follow-up care was outstanding/);
    expect(document.querySelector('.ts-track[aria-hidden="true"]')).toBeNull();
  });
});
