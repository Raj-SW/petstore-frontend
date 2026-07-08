// frontend/src/context/CartContext.jsx
import { createContext, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import { CartProvider as RUCProvider, useCart as useRUCCart } from "react-use-cart";
import { useAuth } from "./AuthContext";
import cartApi from "../Services/api/cartApi";

const CartSyncCtx = createContext(null);

// Extracted to module level to avoid exceeding 4 function-nesting levels (Sonar S2004)
const pushCartItemToBackend = (item) =>
  cartApi.addToCart(item.productId || item.id, item.quantity, item.variantId || null).catch(() => {});

/**
 * Inner layer — has access to both useAuth and react-use-cart.
 * Intercepts every mutation to also sync with the backend cart.
 */
function CartSyncLayer({ children }) {
  const { user } = useAuth();
  const ruc = useRUCCart();
  // Always keep a ref to the latest ruc so stale useCallback closures never
  // check an outdated items array (which causes "No such item to update" and
  // duplicate-item bugs when cart is restored from the backend after login).
  const rucRef = useRef(ruc);
  rucRef.current = ruc;

  // On login: fetch backend cart and populate local state.
  // On logout: clear local cart.
  useEffect(() => {
    if (!user) {
      ruc.emptyCart();
      return;
    }

    cartApi
      .getCart()
      .then((backendCart) => {
        if (backendCart?.items?.length) {
          // Backend has items → restore into local cart
          const converted = backendCart.items.map((item) => ({
            id: item.variantId
              ? `${item.product?._id || item.product}::${item.variantId}`
              : (item.product?._id || item.product),
            productId: item.product?._id || item.product,
            variantId: item.variantId || null,
            variantLabel: item.variantLabel || null,
            name: item.product?.name || "Product",
            price: item.price,
            image: item.product?.images?.[0]?.url || "",
            quantity: item.quantity,
          }));
          ruc.setItems(converted);
        } else if (ruc.items?.length) {
          // Backend is empty but local cart has items (added before login) → push up
          ruc.items.forEach(pushCartItemToBackend);
        }
      })
      .catch(() => {
        // Backend cart unavailable — local cart stays as-is
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id ?? user?.id]);

  // Optimistic add: update UI immediately, sync to backend in background
  const addItem = useCallback(
    async (item, quantity = 1) => {
      rucRef.current.addItem(item, quantity);
      if (user) {
        try {
          await cartApi.addToCart(item.productId || item.id, quantity, item.variantId || null);
        } catch {
          /* silent — UI already updated */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?._id ?? user?.id]
  );

  const removeItem = useCallback(
    async (id) => {
      rucRef.current.removeItem(id);
      if (user) {
        try {
          await cartApi.removeItem(id);
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?._id ?? user?.id]
  );

  const updateItemQuantity = useCallback(
    async (id, quantity) => {
      if (quantity <= 0) {
        return removeItem(id);
      }
      rucRef.current.updateItemQuantity(id, quantity);
      if (user) {
        try {
          await cartApi.updateItem(id, quantity);
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?._id ?? user?.id, removeItem]
  );

  const emptyCart = useCallback(
    async () => {
      rucRef.current.emptyCart();
      if (user) {
        try {
          await cartApi.clearCart();
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?._id ?? user?.id]
  );

  const value = useMemo(() => ({
    ...ruc,
    addItem,
    removeItem,
    updateItemQuantity,
    emptyCart,
  }), [ruc, addItem, removeItem, updateItemQuantity, emptyCart]);

  return <CartSyncCtx.Provider value={value}>{children}</CartSyncCtx.Provider>;
}

/**
 * Drop-in replacement for react-use-cart's useCart hook.
 * Import this instead of importing from "react-use-cart".
 */
export function useCart() {
  const ctx = useContext(CartSyncCtx);
  if (!ctx) throw new Error("useCart must be used within CartContext");
  return ctx;
}

/**
 * Provider component — wraps react-use-cart's CartProvider + sync layer.
 * Used in main.jsx as <CartContext>...</CartContext>.
 */
function CartContext({ children }) {
  return (
    <RUCProvider>
      <CartSyncLayer>{children}</CartSyncLayer>
    </RUCProvider>
  );
}

export default CartContext;
