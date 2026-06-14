import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProductPrice from "./ProductPrice";

// Price uses CurrencyContext; mock it to a plain formatter.
vi.mock("../../../context/CurrencyContext", () => ({
  useCurrency: () => ({ formatPrice: (n) => `Rs ${n}`, selectedCurrency: "MUR" }),
}));

describe("ProductPrice", () => {
  it("shows sale price + struck original when on sale", () => {
    render(<ProductPrice price={100} salePrice={80} isOnSaleNow />);
    expect(screen.getByText("Rs 80")).toBeInTheDocument();
    const original = screen.getByText("Rs 100");
    expect(original).toBeInTheDocument();
    expect(original).toHaveClass("product-price-original");
  });

  it("shows only the price when not on sale", () => {
    render(<ProductPrice price={100} salePrice={null} isOnSaleNow={false} />);
    expect(screen.getByText("Rs 100")).toBeInTheDocument();
    expect(screen.queryByText("Rs 80")).not.toBeInTheDocument();
  });
});
