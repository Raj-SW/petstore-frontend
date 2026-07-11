import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FinalCtaStrip from "./FinalCtaStrip";

describe("FinalCtaStrip", () => {
  it("renders the headline and all 3 CTAs", () => {
    render(<FinalCtaStrip />);
    expect(screen.getByText("Need Veterinary Advice?")).toBeTruthy();
    expect(screen.getByRole("button", { name: /book appointment/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /whatsapp us/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /call us/i })).toBeTruthy();
  });

  it("WhatsApp Us links to the clinic's WhatsApp number", () => {
    render(<FinalCtaStrip />);
    const link = screen.getByRole("link", { name: /whatsapp us/i });
    expect(link.href).toBe("https://wa.me/23057580480");
  });

  it("Call Us links to the clinic's phone number", () => {
    render(<FinalCtaStrip />);
    const link = screen.getByRole("link", { name: /call us/i });
    expect(link.href).toBe("tel:+23057580480");
  });

  it("opens the booking modal when Book Appointment is clicked", () => {
    render(<FinalCtaStrip />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /book appointment/i }));
    expect(screen.getByRole("dialog", { name: /book an appointment/i })).toBeTruthy();
  });
});
