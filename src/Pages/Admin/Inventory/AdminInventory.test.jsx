import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// vi.mock is hoisted — define fixture data inside the factory, not outside.
vi.mock("../../../Services/api/inventoryApi", () => ({
  default: {
    getInventory: vi.fn().mockResolvedValue({
      data: [
        {
          _id: "prod1", name: "Dog Food",
          variantId: "v1", variantLabel: "1kg", hasVariants: true,
          price: 500, quantity: 3, stockStatus: "low",
          isActive: true, images: [], categories: ["dogs"],
        },
        {
          _id: "prod1", name: "Dog Food",
          variantId: "v2", variantLabel: "3kg", hasVariants: true,
          price: 1200, quantity: 0, stockStatus: "out",
          isActive: true, images: [], categories: ["dogs"],
        },
        {
          _id: "prod2", name: "Cat Toy",
          hasVariants: false,
          price: 200, quantity: 50, stockStatus: "in",
          isActive: true, images: [], categories: ["cats"],
        },
      ],
      stats: { total: 3, out: 1, low: 1, in: 1, totalValue: 11700 },
    }),
    restockProduct: vi.fn().mockResolvedValue({ success: true }),
    adjustStock: vi.fn().mockResolvedValue({ success: true }),
    getMovements: vi.fn().mockResolvedValue({
      data: [
        {
          _id: "m1", type: "restock",
          delta: 10, prevQty: 0, newQty: 10,
          variantLabel: "1kg",
          note: "Initial stock",
          createdBy: { name: "Admin" },
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

import inventoryApi from "../../../Services/api/inventoryApi";
import AdminInventory from "./AdminInventory";

describe("AdminInventory — variant awareness", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a Variant column and shows the variant label for each row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getAllByText("Dog Food").length).toBeGreaterThan(0));

    expect(screen.getByRole("columnheader", { name: /variant/i })).toBeInTheDocument();
    expect(screen.getByText("1kg")).toBeInTheDocument();
    expect(screen.getByText("3kg")).toBeInTheDocument();
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("restock sends variantId for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const restockBtns = screen.getAllByRole("button", { name: /restock/i });
    fireEvent.click(restockBtns[0]);

    await waitFor(() => expect(screen.getByPlaceholderText(/e\.g\. 50/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 50/i), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: /add stock/i }));

    await waitFor(() =>
      expect(inventoryApi.restockProduct).toHaveBeenCalledWith("prod1", 20, "", "v1")
    );
  });

  it("adjust sends variantId for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const adjustBtns = screen.getAllByRole("button", { name: /adjust/i });
    fireEvent.click(adjustBtns[0]);

    await waitFor(() => expect(screen.getByRole("button", { name: /save adjustment/i })).toBeInTheDocument());
    const qtyInput = screen.getByDisplayValue("3");
    fireEvent.change(qtyInput, { target: { value: "15" } });
    fireEvent.change(screen.getByPlaceholderText(/damaged/i), {
      target: { value: "Correction" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save adjustment/i }));

    await waitFor(() =>
      expect(inventoryApi.adjustStock).toHaveBeenCalledWith("prod1", 15, "Correction", "v1")
    );
  });

  it("history passes variantId in the API call for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const historyBtns = screen.getAllByRole("button", { name: /history/i });
    fireEvent.click(historyBtns[0]);

    await waitFor(() =>
      expect(inventoryApi.getMovements).toHaveBeenCalledWith("prod1", { variantId: "v1" })
    );
  });

  it("history drawer shows variantLabel on each movement", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const historyBtns = screen.getAllByRole("button", { name: /history/i });
    fireEvent.click(historyBtns[0]);

    await waitFor(() => expect(screen.getByText("Initial stock")).toBeInTheDocument());
    expect(screen.getAllByText("1kg").length).toBeGreaterThan(0);
  });
});
