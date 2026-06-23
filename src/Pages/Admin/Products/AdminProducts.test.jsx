import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../../Services/api/productsApi", () => ({
  default: {
    getProducts: vi.fn().mockResolvedValue({
      data: [
        { _id: "p1", name: "Dog Food", price: 1000, quantity: 5, isActive: true, images: [] },
        { _id: "p2", name: "Cat Food", price: 800, quantity: 0, isActive: false, images: [] },
      ],
    }),
    bulkAction: vi.fn().mockResolvedValue({ success: true, data: { requested: 1, matched: 1, modified: 1 } }),
    deleteProduct: vi.fn().mockResolvedValue({ success: true }),
  },
}));
vi.mock("../../../Services/api/subscriptionsApi", () => ({
  default: { getProductCoverage: vi.fn().mockResolvedValue({}) },
}));
vi.mock("../../../context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
}));

import productsApi from "../../../Services/api/productsApi";
import AdminProducts from "./AdminProducts";

describe("AdminProducts bulk actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows no bulk toolbar until a row is selected", async () => {
    render(<AdminProducts />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("selects a row and runs a bulk activate", async () => {
    render(<AdminProducts />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText(/select Dog Food/i));
    await waitFor(() => expect(screen.getByText("1 selected")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^activate$/i }));

    await waitFor(() =>
      expect(productsApi.bulkAction).toHaveBeenCalledWith("activate", ["p1"], undefined)
    );
  });

  it("applies a bulk percent sale through the modal", async () => {
    render(<AdminProducts />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText(/select all rows/i));
    await waitFor(() => expect(screen.getByText("2 selected")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /put on sale/i }));
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 20/i), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: /apply sale/i }));

    await waitFor(() =>
      expect(productsApi.bulkAction).toHaveBeenCalledWith(
        "sale",
        ["p1", "p2"],
        expect.objectContaining({ discountType: "percent", discountValue: 25 })
      )
    );
  });
});
