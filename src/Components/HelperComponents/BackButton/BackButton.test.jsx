import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

import BackButton from "./BackButton";

beforeEach(() => vi.clearAllMocks());

describe("BackButton", () => {
  it("goes back when there is history", () => {
    window.history.pushState({ idx: 2 }, "");
    render(<BackButton fallbackTo="/petshop" />);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("uses the fallback route when there is no history", () => {
    window.history.pushState({ idx: 0 }, "");
    render(<BackButton fallbackTo="/petshop" />);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/petshop");
  });

  it("renders a custom label", () => {
    window.history.pushState({ idx: 0 }, "");
    render(<BackButton fallbackTo="/" label="Continue Shopping" />);
    expect(screen.getByRole("button", { name: /continue shopping/i })).toBeInTheDocument();
  });
});
