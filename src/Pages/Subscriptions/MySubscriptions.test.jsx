import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../Services/api/subscriptionsApi", () => ({
  default: {
    getMine: vi.fn().mockResolvedValue({
      data: [{
        _id: "s1", status: "active", intervalUnit: "week", intervalCount: 2,
        nextRunAt: new Date(Date.now() + 86400000).toISOString(), discountPercent: 10,
        items: [{ product: { _id: "p1", name: "Dog Food" }, quantity: 2 }],
      }],
    }),
    update: vi.fn().mockResolvedValue({ data: {} }),
    cancel: vi.fn().mockResolvedValue({ data: {} }),
  },
}));
vi.mock("../../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("../../context/CurrencyContext", () => ({ useCurrency: () => ({ formatPrice: (n) => `Rs ${n}` }) }));

import subscriptionsApi from "../../Services/api/subscriptionsApi";
import MySubscriptions from "./MySubscriptions";

describe("MySubscriptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the customer's subscriptions", async () => {
    render(<MySubscriptions />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    expect(screen.getByText(/every 2 week/i)).toBeInTheDocument();
  });

  it("pauses a subscription", async () => {
    render(<MySubscriptions />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    await waitFor(() => expect(subscriptionsApi.update).toHaveBeenCalledWith("s1", { status: "paused" }));
  });
});
