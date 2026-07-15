import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

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
    useReducedMotion: () => false,
  };
});

vi.mock("../../../assets/Services Sections Assets/veterinary-service.webp", () => ({ default: "vet.webp" }));
vi.mock("../../../assets/NavigationBarAssets/PetStore/img2.webp", () => ({ default: "shop.webp" }));
vi.mock("../../../assets/ExportImport/catflying.webp", () => ({ default: "travel.webp" }));
vi.mock("../../../assets/StatsSection/vet-with-dog.jpg", () => ({ default: "tips.jpg" }));

import ServicesSection from "./ServicesSection";

const renderSection = () => render(<ServicesSection />);

describe("ServicesSection (Premium Care pillars)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the Premium Care heading and all four pillars", () => {
    renderSection();
    expect(screen.getByText(/premium care\./i)).toBeInTheDocument();
    expect(screen.getByText(/every step of the way\./i)).toBeInTheDocument();
    ["Veterinary Care", "Pet Store", "Pet Travel", "Pet Care Tips"].forEach((t) =>
      expect(screen.getByText(t)).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: /learn more/i })).toHaveLength(4);
  });

  it("Learn More navigates to the pillar route", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: /learn more/i })[2]);
    expect(mockNavigate).toHaveBeenCalledWith("/import-export-service");
  });
});
