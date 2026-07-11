import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const FRAMER_PROPS = new Set([
    "initial", "animate", "exit", "transition", "whileInView", "whileHover",
    "whileTap", "viewport", "layoutId", "layout", "variants",
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
  return { motion, useInView: () => true };
});

vi.mock("../../../../Services/api/tipsApi", () => ({
  default: { getTips: vi.fn() },
}));

import tipsApi from "../../../../Services/api/tipsApi";
import PetCareTipsSection from "./PetCareTipsSection";

const makeTips = (n) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `tip${i}`,
    slug: `tip-${i}`,
    title: `Tip Title ${i}`,
    category: "health",
    animalType: "dog",
    difficulty: "beginner",
    readTime: 5,
  }));

const renderSection = () => render(<MemoryRouter><PetCareTipsSection /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe("PetCareTipsSection", () => {
  it("requests the 3 latest tips", async () => {
    tipsApi.getTips.mockResolvedValue({ data: makeTips(3) });
    renderSection();
    await waitFor(() => {
      expect(tipsApi.getTips).toHaveBeenCalledWith({ limit: 3 });
    });
  });

  it("renders the section title, tip cards, and View All Articles CTA", async () => {
    tipsApi.getTips.mockResolvedValue({ data: makeTips(3) });
    renderSection();
    expect(await screen.findByText("Tip Title 0")).toBeTruthy();
    expect(screen.getByText("Pet Care Tips")).toBeTruthy();
    expect(screen.getByText("Tip Title 2")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view all articles/i })).toBeTruthy();
  });

  it("shows the readTime badge on each card", async () => {
    tipsApi.getTips.mockResolvedValue({ data: makeTips(1) });
    renderSection();
    await screen.findByText("Tip Title 0");
    expect(screen.getByText(/5 min/)).toBeTruthy();
  });

  it("renders nothing when there are no published tips", async () => {
    tipsApi.getTips.mockResolvedValue({ data: [] });
    const { container } = renderSection();
    await waitFor(() => expect(tipsApi.getTips).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("logs and does not crash when the request fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    tipsApi.getTips.mockRejectedValue(new Error("network fail"));
    const { container } = renderSection();
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    errSpy.mockRestore();
  });
});
