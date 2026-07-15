import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock("../../../assets/Services Sections Assets/veterinary-service.webp", () => ({ default: "vet.webp" }));
vi.mock("../../../assets/Services Sections Assets/boarding-service.webp", () => ({ default: "home.webp" }));
vi.mock("../../../assets/ExportImport/catflying.webp", () => ({ default: "travel.webp" }));
vi.mock("../../../assets/NavigationBarAssets/PetStore/img1.webp", () => ({ default: "shop.webp" }));

import ServicesSection from "./ServicesSection";

describe("ServicesSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the new section title", () => {
    render(<ServicesSection />);
    expect(screen.getByText("WELCOME TO THE HOME OF PET CARE")).toBeTruthy();
  });

  it("renders exactly 4 service cards", () => {
    render(<ServicesSection />);
    expect(screen.getByText("Veterinary Care")).toBeTruthy();
    expect(screen.getByText("Home Visits")).toBeTruthy();
    expect(screen.getByText("Pet Relocation")).toBeTruthy();
    expect(screen.getByText("Shop")).toBeTruthy();
    expect(screen.queryByText("Grooming")).toBeNull();
    expect(screen.queryByText("Adoption & Rescue")).toBeNull();
    expect(screen.queryByText("Boarding")).toBeNull();
    expect(screen.queryByText("Pet Training")).toBeNull();
  });

  it("none of the 4 cards show a Coming Soon badge", () => {
    render(<ServicesSection />);
    expect(screen.queryByText("Coming Soon")).toBeNull();
  });

  it("navigates to /import-export-service when Pet Relocation is clicked", () => {
    render(<ServicesSection />);
    fireEvent.click(screen.getByText("Pet Relocation"));
    expect(mockNavigate).toHaveBeenCalledWith("/import-export-service");
  });

  it("navigates to /petshop when Shop is clicked", () => {
    render(<ServicesSection />);
    fireEvent.click(screen.getByText("Shop"));
    expect(mockNavigate).toHaveBeenCalledWith("/petshop");
  });
});
