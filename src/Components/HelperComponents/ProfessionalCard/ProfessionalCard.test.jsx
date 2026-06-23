import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProfessionalCard from "./ProfessionalCard";

describe("ProfessionalCard (Epic 4)", () => {
  const base = { name: "Dr. Lee", specialty: "Feline medicine", experience: 8, badgeLabel: "Veterinarian" };

  it("shows name, specialty, experience and a View profile action", () => {
    const onBook = vi.fn();
    render(<ProfessionalCard {...base} onBook={onBook} />);
    expect(screen.getByText("Dr. Lee")).toBeInTheDocument();
    expect(screen.getByText("Feline medicine")).toBeInTheDocument();
    expect(screen.getByText(/8 years experience/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /view profile/i }));
    expect(onBook).toHaveBeenCalled();
  });

  it("renders no rating stars and no contact block", () => {
    const { container } = render(
      <ProfessionalCard {...base} phone="123" email="a@b.com" location="X" rating={4} />
    );
    expect(container.querySelector(".professional-rating")).toBeNull();
    expect(container.querySelector(".professional-contact")).toBeNull();
    expect(screen.queryByText("a@b.com")).toBeNull();
  });
});
