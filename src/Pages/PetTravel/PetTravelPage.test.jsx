import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Reveal-on-scroll: make framer render immediately and treat in-view as true
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
          for (const k of Object.keys(props)) if (!FRAMER_PROPS.has(k)) rest[k] = props[k];
          return React.createElement(tag, { ref, ...rest }, children);
        }),
    }
  );
  return { motion, AnimatePresence: ({ children }) => children, useInView: () => true };
});

vi.mock("../../hooks/useSEO", () => ({ default: vi.fn() }));
vi.mock("../../assets/ExportImport/catflying.webp", () => ({ default: "catflying.webp" }));

import PetTravelPage from "./PetTravelPage";
import {
  ptProcess,
  ptDestinations,
  ptFinalCta,
} from "./petTravelContent";

const renderPage = () =>
  render(<MemoryRouter><PetTravelPage /></MemoryRouter>);

describe("PetTravelPage", () => {
  it("renders a single H1 with the hero headline", () => {
    renderPage();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toMatch(/Moving Abroad/i);
  });

  it("renders all process steps", () => {
    renderPage();
    ptProcess.steps.forEach((step) => {
      expect(screen.getByText(step.title)).toBeTruthy();
    });
  });

  it("renders every popular destination with an accessible flag", () => {
    renderPage();
    ptDestinations.countries.forEach((c) => {
      expect(screen.getByText(c.name)).toBeTruthy();
      expect(screen.getByRole("img", { name: c.name })).toBeTruthy();
    });
  });

  it("renders the primary hero CTAs", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /book a consultation/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /whatsapp us/i })).toBeTruthy();
  });

  it("WhatsApp link points at the clinic number with a prefilled message", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /whatsapp us/i });
    expect(link.href).toMatch(/^https:\/\/wa\.me\/23057580480\?text=/);
  });

  it("opens the consultation modal from the hero CTA", () => {
    renderPage();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /book a consultation/i }));
    expect(screen.getByRole("dialog", { name: /book a relocation consultation/i })).toBeTruthy();
  });

  it("renders the final CTA", () => {
    renderPage();
    expect(screen.getByText(ptFinalCta.title)).toBeTruthy();
    expect(screen.getByRole("button", { name: new RegExp(ptFinalCta.cta, "i") })).toBeTruthy();
  });
});
