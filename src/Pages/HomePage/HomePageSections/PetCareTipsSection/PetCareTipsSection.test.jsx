import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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
    useReducedMotion: () => true,
  };
});

vi.mock("../../../../Services/api/tipsApi", () => ({
  default: { getTips: vi.fn() },
}));

import tipsApi from "../../../../Services/api/tipsApi";
import PetCareTipsSection from "./PetCareTipsSection";

const TIPS = [
  { _id: "t1", slug: "crate-training", title: "Crate training without tears",
    category: "Behaviour", animalType: "dog", readTime: 4,
    coverImage: { url: "https://img/crate.jpg" } },
  { _id: "t2", slug: "canary-cage", title: "Setting up the perfect canary cage",
    category: "Health", animalType: "bird", readTime: 3 }, // no cover image
  { _id: "t3", slug: "monsoon-skin", title: "Monsoon skincare for short coats",
    category: "Grooming", animalType: "dog" }, // no readTime
];

const renderSection = () =>
  render(<MemoryRouter><PetCareTipsSection /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  tipsApi.getTips.mockResolvedValue({ data: TIPS });
});

describe("PetCareTipsSection (editorial index)", () => {
  it("fetches 3 tips and renders numbered rows linking to detail pages", async () => {
    renderSection();
    // findByRole (not findByText): the frame caption duplicates the active
    // row's title text by design (active tip 0 on first render), so a plain
    // text query is ambiguous here.
    await screen.findByRole("link", { name: /Crate training/ });
    expect(tipsApi.getTips).toHaveBeenCalledWith({ limit: 3 });
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    const row = screen.getByRole("link", { name: /Crate training/ });
    expect(row).toHaveAttribute("href", "/pet-care-tips/crate-training");
  });

  it("hovering a row makes it active — its title shows in the frame caption", async () => {
    renderSection();
    await screen.findByText("Setting up the perfect canary cage");
    fireEvent.mouseEnter(screen.getByRole("link", { name: /canary cage/ }));
    const caption = screen.getByTestId("pcts-frame-caption");
    expect(caption.textContent).toMatch(/canary cage/);
  });

  it("shows the paw fallback in the frame when the active tip has no cover", async () => {
    renderSection();
    await screen.findByText("Setting up the perfect canary cage");
    fireEvent.mouseEnter(screen.getByRole("link", { name: /canary cage/ }));
    expect(screen.getByTestId("pcts-frame-fallback")).toBeInTheDocument();
  });

  it("omits read time from meta when missing", async () => {
    renderSection();
    await screen.findByText("Monsoon skincare for short coats");
    const row = screen.getByRole("link", { name: /Monsoon skincare/ });
    expect(row.textContent).toMatch(/DOG · GROOMING/i);
    expect(row.textContent).not.toMatch(/min read/i);
  });

  it("renders nothing when the API returns no tips", async () => {
    tipsApi.getTips.mockResolvedValue({ data: [] });
    const { container } = renderSection();
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("View All Articles links to the tips page", async () => {
    renderSection();
    await screen.findByRole("link", { name: /Crate training/ });
    expect(screen.getByRole("link", { name: /View All Articles/i }))
      .toHaveAttribute("href", "/pet-care-tips");
  });
});
