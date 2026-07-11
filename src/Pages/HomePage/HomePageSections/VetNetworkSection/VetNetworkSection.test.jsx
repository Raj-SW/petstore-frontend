import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock("../../../../Services/api/professionalsApi", () => ({
  default: { getProfessionals: vi.fn() },
}));

import professionalsApi from "../../../../Services/api/professionalsApi";
import VetNetworkSection from "./VetNetworkSection";

const makePros = (n) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `pro${i}`,
    name: `Dr. Person ${i}`,
    role: "veterinarian",
    specialization: "General practice",
  }));

const renderSection = () => render(<MemoryRouter><VetNetworkSection /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe("VetNetworkSection", () => {
  it("requests up to 4 professionals sorted by rating", async () => {
    professionalsApi.getProfessionals.mockResolvedValue({ data: makePros(4) });
    renderSection();
    await waitFor(() => {
      expect(professionalsApi.getProfessionals).toHaveBeenCalledWith({
        limit: 4,
        sortBy: "professionalInfo.rating",
        sortOrder: "desc",
      });
    });
  });

  it("renders the section title and professional cards", async () => {
    professionalsApi.getProfessionals.mockResolvedValue({ data: makePros(4) });
    renderSection();
    expect(await screen.findByText("Dr. Person 0")).toBeTruthy();
    expect(screen.getByText("Meet Our Veterinary Network")).toBeTruthy();
    expect(screen.getByText("Dr. Person 3")).toBeTruthy();
  });

  it("navigates to the professional's appointment page on View profile click", async () => {
    professionalsApi.getProfessionals.mockResolvedValue({ data: makePros(1) });
    renderSection();
    await screen.findByText("Dr. Person 0");
    fireEvent.click(screen.getByRole("button", { name: /view profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/appointments/professional/pro0");
  });

  it("renders nothing when there are no active professionals", async () => {
    professionalsApi.getProfessionals.mockResolvedValue({ data: [] });
    const { container } = renderSection();
    await waitFor(() => expect(professionalsApi.getProfessionals).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("logs and does not crash when the request fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    professionalsApi.getProfessionals.mockRejectedValue(new Error("network fail"));
    const { container } = renderSection();
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    errSpy.mockRestore();
  });
});
