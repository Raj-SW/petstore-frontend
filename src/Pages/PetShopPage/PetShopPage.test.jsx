import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/Services/localServices/ProductService", () => ({
  default: {
    fetchAllProducts: vi.fn().mockResolvedValue({
      products: [
        { _id: "p1", name: "Dog Collar", price: 15, images: [], description: "desc" },
        { _id: "p2", name: "Cat Toy", price: 8, images: [], description: "desc2" },
      ],
      pagination: { pages: 1, total: 2 },
    }),
  },
}));

vi.mock("@/Components/HelperComponents/ProductCard/ProductCardV2", () => ({
  default: ({ title }) => <div data-testid="product-card">{title}</div>,
}));
vi.mock("@/Components/HelperComponents/SortDropDown/SortDropDown", () => ({
  default: () => <div data-testid="sort-dropdown" />,
}));
vi.mock("@/Components/Shop/ShopBanner", () => ({
  default: () => <div data-testid="shop-banner" />,
}));
vi.mock("./FilterComponent", () => ({
  default: () => <div data-testid="filter-component" />,
}));
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <button>{children}</button>,
  SelectValue: () => <span />,
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAdmin: () => false, logout: vi.fn() }),
}));
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ cartItems: [], addToCart: vi.fn() }),
}));
vi.mock("@/context/CurrencyContext", () => ({
  useCurrency: () => ({ currency: "USD", convertPrice: (p) => p }),
}));
vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <div id="petshop-page-wrapper">
        {(() => {
          const PetShopPage = require("./PetShopPage").default;
          return <PetShopPage />;
        })()}
      </div>
    </MemoryRouter>
  );

describe("PetShopPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders search bar and shop banner", async () => {
    const { default: PetShopPage } = await import("./PetShopPage");
    render(<MemoryRouter><PetShopPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("searchbox", { name: /Search products/i })).toBeInTheDocument());
  });

  it("shows product cards after load", async () => {
    const { default: PetShopPage } = await import("./PetShopPage");
    render(<MemoryRouter><PetShopPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
    });
  });

  it("renders sort dropdown", async () => {
    const { default: PetShopPage } = await import("./PetShopPage");
    render(<MemoryRouter><PetShopPage /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByTestId("sort-dropdown")).toBeDefined());
  });
});
