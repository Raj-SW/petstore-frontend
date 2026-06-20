import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../../Services/api/announcementsApi", () => ({
  default: {
    createAnnouncement: vi.fn().mockResolvedValue({ success: true, message: "Sent to 3 of 3 subscribers." }),
    getAnnouncements: vi.fn().mockResolvedValue({ data: [] }),
  },
}));
vi.mock("../../../Services/api/productsApi", () => ({
  default: {
    getProducts: vi.fn().mockResolvedValue({
      data: [{ _id: "p1", name: "Dog Food", price: 1000, onSale: true, salePrice: 800, images: [] }],
    }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("../../../context/CurrencyContext", () => ({ useCurrency: () => ({ formatPrice: (n) => `Rs ${n}` }) }));

import announcementsApi from "../../../Services/api/announcementsApi";
import AdminAnnouncements from "./AdminAnnouncements";

describe("AdminAnnouncements composer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires a subject and at least one product before sending", async () => {
    render(<AdminAnnouncements />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    // No subject, no product selected → send is disabled
    expect(screen.getByRole("button", { name: /send announcement/i })).toBeDisabled();
  });

  it("sends with subject + selected product", async () => {
    render(<AdminAnnouncements />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/subject/i), { target: { value: "Big Sale" } });
    fireEvent.click(screen.getByLabelText(/select Dog Food/i));

    const send = screen.getByRole("button", { name: /send announcement/i });
    await waitFor(() => expect(send).not.toBeDisabled());
    fireEvent.click(send);

    // confirm modal → confirm
    await waitFor(() => expect(screen.getByRole("button", { name: /^send$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => expect(announcementsApi.createAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Big Sale", productIds: ["p1"], source: "composer" })
    ));
  });
});
