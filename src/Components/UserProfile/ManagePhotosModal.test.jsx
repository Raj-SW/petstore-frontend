import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ManagePhotosModal from "./ManagePhotosModal";

vi.mock("../../Services/api/petApi", () => ({ default: {} }));
vi.mock("../../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));

const petWith = (n) => ({
  _id: "p1",
  name: "Rex",
  images: Array.from({ length: n }, (_, i) => ({ url: `u${i}`, publicId: `pets/${i}` })),
});

describe("ManagePhotosModal", () => {
  it("renders a thumbnail per image and the count", () => {
    render(<ManagePhotosModal pet={petWith(2)} onClose={() => {}} onChange={() => {}} />);
    expect(screen.getByText("2/6")).toBeInTheDocument();
    // images rendered with alt="" have ARIA role "presentation"
    expect(screen.getAllByRole("presentation")).toHaveLength(2);
  });

  it("disables Add when at the 6-photo cap", () => {
    render(<ManagePhotosModal pet={petWith(6)} onClose={() => {}} onChange={() => {}} />);
    expect(screen.getByText(/Maximum reached/i).closest("button")).toBeDisabled();
  });
});
