import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock("../../../../assets/ExportImport/catflying.webp", () => ({ default: "catflying.webp" }));

import PetTravelBand from "./PetTravelBand";

describe("PetTravelBand", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the heading and sub-copy", () => {
    render(<PetTravelBand />);
    expect(screen.getByText("Travelling with Your Pet?")).toBeTruthy();
    expect(screen.getByText(/relocating abroad/i)).toBeTruthy();
  });

  it("renders the bullet points", () => {
    render(<PetTravelBand />);
    expect(screen.getByText(/paperwork and logistics/i)).toBeTruthy();
    expect(screen.getByText(/vaccination and health-certificate/i)).toBeTruthy();
  });

  it("navigates to /import-export-service when Learn More is clicked", () => {
    render(<PetTravelBand />);
    fireEvent.click(screen.getByRole("button", { name: /learn more/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/import-export-service");
  });
});
