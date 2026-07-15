import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCardV2 from "./ProductCardV2";

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));
vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({ showCartToast: vi.fn() }),
}));
vi.mock("@/context/CurrencyContext", () => ({
  useCurrency: () => ({ formatPrice: (n) => `Rs ${n}`, selectedCurrency: "MUR" }),
}));

const baseProps = { id: "p1", title: "Dog Collar", price: 15, description: "desc" };

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <ProductCardV2 {...baseProps} {...props} />
    </MemoryRouter>
  );

describe("ProductCardV2 badges", () => {
  it("shows the Vet Recommended badge", () => {
    renderCard({ vetRecommended: true });
    expect(screen.getByText(/vet recommended/i)).toBeInTheDocument();
  });

  it("shows at most two badges, sale first", () => {
    renderCard({ isOnSaleNow: true, discountPercentLabel: 20, vetRecommended: true, bestSeller: true });
    expect(screen.getByText(/-20%/)).toBeInTheDocument();
    expect(screen.getByText(/vet recommended/i)).toBeInTheDocument();
    expect(screen.queryByText(/best seller/i)).toBeNull();
  });
});
