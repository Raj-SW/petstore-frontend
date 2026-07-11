import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock("../../../assets/HeroSectionAssets/Hero-Image-left-background.webp", () => ({ default: "left.webp" }));
vi.mock("../../../assets/HeroSectionAssets/hero-image-right.webp", () => ({ default: "right.webp" }));
vi.mock("../../../assets/HeroSectionAssets/VitalPaws Logo.png", () => ({ default: "logo.png" }));

import HeroSection from "./HeroSection";

const renderHero = () => render(<MemoryRouter><HeroSection /></MemoryRouter>);

describe("HeroSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all 4 CTA buttons", () => {
    renderHero();
    expect(screen.getByRole("button", { name: /book appointment/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /mobile vet/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /pet travel/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^shop$/i })).toBeTruthy();
  });

  it("opens the booking modal on Book Appointment click", () => {
    renderHero();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /book appointment/i }));
    expect(screen.getByRole("dialog", { name: /book an appointment/i })).toBeTruthy();
  });

  it("opens the mobile vet modal on Mobile Vet click", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /mobile vet/i }));
    expect(screen.getByRole("dialog", { name: /book a mobile vet visit/i })).toBeTruthy();
  });

  it("navigates to /import-export-service on Pet Travel click", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /pet travel/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/import-export-service");
  });

  it("navigates to /petshop on Shop click", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /^shop$/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/petshop");
  });

  it("renders the headline and tagline", () => {
    renderHero();
    expect(screen.getByText(/They Can't Speak/i)).toBeTruthy();
    expect(screen.getByText(/We Listen/i)).toBeTruthy();
  });
});
