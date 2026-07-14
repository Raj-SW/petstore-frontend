import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Controls the mocked auth user + loading per test.
let mockUser = null;
let mockAuthLoading = false;
vi.mock("./AuthContext", () => ({
  useAuth: () => ({ user: mockUser, loading: mockAuthLoading }),
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
  localStorage.clear(); // react-use-cart persists here — isolate tests
  mockUser = null;
  mockAuthLoading = false;
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

  it("does NOT wipe the persisted guest cart on mount (page refresh)", async () => {
    // First visit: guest adds an item (react-use-cart persists to localStorage)
    const first = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await first.result.current.addItem(item(), 2);
    });
    expect(first.result.current.items).toHaveLength(1);
    first.unmount();

    // "Page refresh": fresh mount, user still null — the cart must survive
    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.items).toHaveLength(1);
    expect(second.result.current.items[0].id).toBe("p1");
  });

  it("does not touch the cart while auth is still resolving", async () => {
    const first = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await first.result.current.addItem(item(), 1);
    });
    first.unmount();

    mockAuthLoading = true;
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(cartApi.getCart).not.toHaveBeenCalled();
  });

  it("clears the cart on a real logged-in → logged-out transition", async () => {
    mockUser = { id: "u1" };
    const { result, rerender } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem(item(), 1);
    });
    expect(result.current.items).toHaveLength(1);

    mockUser = null;
    rerender();

    await waitFor(() => expect(result.current.items).toHaveLength(0));
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
    expect(cartApi.removeItem).toHaveBeenCalledWith("p1", null);
    expect(cartApi.updateItem).not.toHaveBeenCalled();
  });

  it("splits composite variant line ids when syncing remove to the backend", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem(item({ id: "p1::v7", variantId: "v7" }), 1);
    });

    await act(async () => {
      await result.current.removeItem("p1::v7");
    });

    expect(cartApi.removeItem).toHaveBeenCalledWith("p1", "v7");
  });

  it("splits composite variant line ids when syncing quantity updates", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem(item({ id: "p1::v7", variantId: "v7" }), 1);
    });

    await act(async () => {
      await result.current.updateItemQuantity("p1::v7", 3);
    });

    expect(cartApi.updateItem).toHaveBeenCalledWith("p1", 3, "v7");
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

  it("MERGES the guest cart with the backend cart on login (no silent loss)", async () => {
    // Guest session first: add p1 locally
    mockUser = null;
    const guest = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await guest.result.current.addItem(item(), 2); // p1
    });
    guest.unmount();

    // Backend already holds p9 from a previous session
    cartApi.getCart.mockResolvedValue({
      items: [
        {
          product: { _id: "p9", name: "Leash", images: [] },
          variantId: null,
          price: 50,
          quantity: 1,
        },
      ],
    });

    // Now the user logs in
    mockUser = { id: "u1" };
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    const ids = result.current.items.map((i) => i.id).sort();
    expect(ids).toEqual(["p1", "p9"]);
    // The guest-only line is pushed up to the backend
    await waitFor(() => expect(cartApi.addToCart).toHaveBeenCalledWith("p1", 2, null));
  });
});
