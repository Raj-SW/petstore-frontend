import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../../Services/api/subscriptionsApi", () => ({
  default: {
    getAllAdmin: vi.fn().mockResolvedValue({
      data: [
        { _id: "s1", status: "active", intervalUnit: "week", intervalCount: 2,
          nextRunAt: new Date(Date.now() + 2 * 86400000).toISOString(),
          user: { name: "Alice" }, items: [{ quantity: 1 }], createdOrders: [],
          cadenceLabel: "every 2 weeks", perCycleTotal: 540, savings: 60, nextRunInDays: 2 },
        { _id: "s2", status: "paused", intervalUnit: "day", intervalCount: 10,
          nextRunAt: new Date(Date.now() + 40 * 86400000).toISOString(),
          user: { name: "Bob" }, items: [{ quantity: 1 }], createdOrders: [],
          cadenceLabel: "every 10 days", perCycleTotal: 200, savings: 0, nextRunInDays: 40 },
      ],
    }),
    getAnalytics: vi.fn().mockResolvedValue({ totalActiveSubscriptions: 1, productsAtRisk: 0, horizonDays: 30, rows: [] }),
    getAdminOne: vi.fn().mockResolvedValue({
      data: { _id: "s1", status: "active", intervalUnit: "week", intervalCount: 2,
        nextRunAt: new Date(Date.now() + 2 * 86400000).toISOString(), user: { name: "Alice" },
        cadenceLabel: "every 2 weeks", perCycleTotal: 540, savings: 60, nextRunInDays: 2,
        items: [{ product: { name: "Dog Food" }, variantLabel: null, quantity: 2 }],
        orderHistory: [{ id: "o1", date: new Date("2026-06-01").toISOString(), total: 450, status: "paid" }] },
    }),
    updateAdmin: vi.fn().mockResolvedValue({ data: {} }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));

import subscriptionsApi from "../../../Services/api/subscriptionsApi";
import AdminSubscriptions from "./AdminSubscriptions";

describe("AdminSubscriptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens an enriched detail drawer with per-cycle total and history", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    fireEvent.click(screen.getAllByTitle("View items")[0]);
    await waitFor(() => expect(subscriptionsApi.getAdminOne).toHaveBeenCalledWith("s1"));
    expect(await screen.findByText("Rs 540")).toBeInTheDocument();
    expect(screen.getByText(/save rs 60/i)).toBeInTheDocument();
    expect(screen.getByText(/past orders/i)).toBeInTheDocument();
  });
});
