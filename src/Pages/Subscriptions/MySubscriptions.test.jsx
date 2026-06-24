import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../Services/api/subscriptionsApi", () => ({
  default: {
    getMine: vi.fn().mockResolvedValue({
      data: [{
        _id: "s1", status: "active", intervalUnit: "week", intervalCount: 2,
        nextRunAt: new Date(Date.now() + 86400000).toISOString(), discountPercent: 10,
        perCycleTotal: 540, savings: 60, cadenceLabel: "every 2 weeks", nextRunInDays: 1,
        items: [{ product: { _id: "p1", name: "Dog Food", images: [{ url: "http://img/x.jpg" }] }, quantity: 2 }],
        orderHistory: [{ id: "o1", date: new Date("2026-06-01").toISOString(), total: 450, status: "paid" }],
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

  it("shows per-cycle total and savings", async () => {
    render(<MySubscriptions />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    expect(screen.getByText("Rs 540")).toBeInTheDocument();
    expect(screen.getByText(/save rs 60/i)).toBeInTheDocument();
  });

  it("pauses a subscription", async () => {
    render(<MySubscriptions />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    await waitFor(() => expect(subscriptionsApi.update).toHaveBeenCalledWith("s1", { status: "paused" }));
  });
});
