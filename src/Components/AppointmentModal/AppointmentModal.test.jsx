import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppointmentModal from "./AppointmentModal";

const setup = (props = {}) => {
  const onClose = vi.fn();
  render(
    <AppointmentModal
      open={true}
      onClose={onClose}
      title="Book an Appointment"
      description="We're here for your pet."
      hours={["Mon, Wed, Thu, Sat: 4:30 PM – 6:00 PM"]}
      waMessage="Hi, I'd like to book a vet appointment."
      {...props}
    />
  );
  return { onClose };
};

describe("AppointmentModal", () => {
  it("renders nothing when open is false", () => {
    render(<AppointmentModal open={false} onClose={vi.fn()} title="Hidden" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title, description and hours when open", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Book an Appointment" })).toBeTruthy();
    expect(screen.getByText("We're here for your pet.")).toBeTruthy();
    expect(screen.getByText("Mon, Wed, Thu, Sat: 4:30 PM – 6:00 PM")).toBeTruthy();
  });

  it("builds a WhatsApp link with the pre-filled message", () => {
    setup();
    const link = screen.getByRole("link", { name: /continue on whatsapp/i });
    expect(link.href).toBe(
      "https://wa.me/23057580480?text=Hi%2C%20I%27d%20like%20to%20book%20a%20vet%20appointment."
    );
  });

  it("uses a custom primary label when provided", () => {
    setup({ primaryLabel: "Book via WhatsApp" });
    expect(screen.getByRole("link", { name: /book via whatsapp/i })).toBeTruthy();
  });

  it("shows the Find Our Clinic link by default", () => {
    setup();
    expect(screen.getByRole("link", { name: /find our clinic/i })).toBeTruthy();
  });

  it("hides the Find Our Clinic link when showFindClinic is false", () => {
    setup({ showFindClinic: false });
    expect(screen.queryByRole("link", { name: /find our clinic/i })).toBeNull();
  });

  it("calls onClose when the close button is clicked", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the overlay backdrop", () => {
    const { onClose } = setup();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the modal", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText("We're here for your pet."));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
