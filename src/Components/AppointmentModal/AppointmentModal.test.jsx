import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
    useReducedMotion: () => false,
  };
});

import AppointmentModal, { BOOKING_PRESET, MOBILE_VET_PRESET } from "./AppointmentModal";

describe("AppointmentModal (booking preset)", () => {
  it("shows hours, note and footnote", () => {
    render(<AppointmentModal open onClose={() => {}} preset={BOOKING_PRESET} />);
    expect(screen.getByText("Book Your Appointment")).toBeInTheDocument();
    expect(screen.getAllByText(/4:30 PM – 6:00 PM/).length).toBe(4);
    expect(screen.getByText(/Home visits and special appointments/)).toBeInTheDocument();
    expect(screen.getByText(/reply within a few minutes/)).toBeInTheDocument();
  });

  it("builds the WhatsApp URL from the form values", () => {
    render(<AppointmentModal open onClose={() => {}} preset={BOOKING_PRESET} />);
    fireEvent.change(screen.getByLabelText("Pet's Name"), { target: { value: "Rex" } });
    fireEvent.change(screen.getByLabelText("Owner's Name"), { target: { value: "Raj" } });
    const link = screen.getByRole("link", { name: /Continue with WhatsApp/i });
    const href = decodeURIComponent(link.getAttribute("href"));
    expect(href).toContain("wa.me/23057580480");
    expect(href).toContain("Pet's Name: Rex");
    expect(href).toContain("Owner's Name: Raj");
    expect(href).toContain("Reason for Visit:"); // blank field keeps its bullet
  });

  it("mobile vet preset shows the checklist and Call Now", () => {
    render(<AppointmentModal open onClose={() => {}} preset={MOBILE_VET_PRESET} />);
    expect(screen.getByText(/Pets unable to travel/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Call Now/i }))
      .toHaveAttribute("href", "tel:+23057580480");
  });

  it("renders nothing when closed and closes on Escape", () => {
    const onClose = vi.fn();
    const { rerender } = render(<AppointmentModal open={false} onClose={onClose} preset={BOOKING_PRESET} />);
    expect(screen.queryByText("Book Your Appointment")).toBeNull();
    rerender(<AppointmentModal open onClose={onClose} preset={BOOKING_PRESET} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("moves focus into the dialog on open", async () => {
    render(<AppointmentModal open onClose={() => {}} preset={BOOKING_PRESET} />);
    await waitFor(() => {
      expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
    });
  });
});
