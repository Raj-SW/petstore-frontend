import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Controls the mocked auth user per test.
let mockUser = null;
vi.mock("./AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock("../Services/api/cartApi", () => ({
  default: {
    getCart: vi.fn(),
    addToCart: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

import cartApi from "../Services/api/cartApi";
import CartContext, { useCart } from "./CartContext";

const wrapper = ({ children }) => <CartContext>{children}</CartContext>;

const item = (over = {}) => ({
  id: "p1",
  productId: "p1",
  price: 100,
  name: "Bone",
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  cartApi.getCart.mockResolvedValue({ items: [] });
});

describe("useCart", () => {
  it("throws outside CartContext", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      /must be used within CartContext/,
    );
  });
});

describe("CartContext — guest (no backend sync)", () => {
  it("addItem updates the local cart without calling the backend", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem(item(), 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p1");
    expect(cartApi.addToCart).not.toHaveBeenCalled();
  });
});

describe("CartContext — logged in (optimistic + backend sync)", () => {
  beforeEach(() => {
    mockUser = { id: "u1" };
  });

  it("addItem updates UI and syncs to the backend", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem(item({ variantId: "v1" }), 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(cartApi.addToCart).toHaveBeenCalledWith("p1", 3, "v1");
  });

  it("updateItemQuantity(0) delegates to removeItem", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem(item(), 1);
    });

    await act(async () => {
      await result.current.updateItemQuantity("p1", 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(cartApi.removeItem).toHaveBeenCalledWith("p1");
    expect(cartApi.updateItem).not.toHaveBeenCalled();
  });

  it("emptyCart clears local items and the backend", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem(item(), 1);
    });

    await act(async () => {
      await result.current.emptyCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(cartApi.clearCart).toHaveBeenCalled();
  });

  it("restores the backend cart on login", async () => {
    cartApi.getCart.mockResolvedValue({
      items: [
        {
          product: { _id: "p9", name: "Leash", images: [{ url: "x.jpg" }] },
          variantId: null,
          price: 50,
          quantity: 2,
        },
      ],
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.items[0]).toMatchObject({
      id: "p9",
      productId: "p9",
      name: "Leash",
      price: 50,
      quantity: 2,
    });
  });
});
