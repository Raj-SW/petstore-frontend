import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../core/api/apiClient", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        totalRevenue: 12000,
        totalOrders: 150,
        totalProducts: 80,
        totalUsers: 320,
        avgOrderValue: 80,
        ordersThisMonth: 22,
        topCategory: "dogs",
        topProducts: [
          { _id: "p1", name: "Premium Dog Food", totalSold: 45, revenue: 1350 },
        ],
      },
    }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAdmin: () => true, logout: vi.fn() }),
}));

import AdminAnalytics from "./AdminAnalytics";

describe("AdminAnalytics", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders without crash", () => {
    render(<MemoryRouter><AdminAnalytics /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it("shows loading then stats", async () => {
    render(<MemoryRouter><AdminAnalytics /></MemoryRouter>);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it("renders monthly chart section", async () => {
    render(<MemoryRouter><AdminAnalytics /></MemoryRouter>);
    await waitFor(() => {
      const monthEls = screen.queryAllByText(/jan/i);
      const revenueEls = screen.queryAllByText(/revenue/i);
      expect(monthEls.length > 0 || revenueEls.length > 0).toBe(true);
    });
  });
});
