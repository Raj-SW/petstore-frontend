import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mutable handles shared with hoisted vi.mock factories
const mocks = vi.hoisted(() => ({
  items: [],
  emptyCart: vi.fn(),
  confirmCardPayment: vi.fn(),
  createSubscription: vi.fn(),
  navigate: vi.fn(),
}));

// ── Stripe ─────────────────────────────────────────────────────────────────────
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({ confirmCardPayment: mocks.confirmCardPayment }),
  useElements: () => ({ getElement: () => ({}) }),
}));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(() => Promise.resolve(null)) }));

// ── Router ─────────────────────────────────────────────────────────────────────
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mocks.navigate };
});

// ── Context ────────────────────────────────────────────────────────────────────
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    items: mocks.items,
    cartTotal: mocks.items.reduce((s, i) => s + i.price * i.quantity, 0),
    totalItems: mocks.items.reduce((s, i) => s + i.quantity, 0),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    emptyCart: mocks.emptyCart,
  }),
}));
vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../context/CurrencyContext", () => ({
  useCurrency: () => ({ selectedCurrency: "MUR" }),
}));

// ── APIs ───────────────────────────────────────────────────────────────────────
vi.mock("../../Services/api/ordersApi", () => ({
  default: { createOrder: vi.fn().mockResolvedValue({ data: { _id: "order1" } }) },
}));
vi.mock("../../Services/api/paymentsApi", () => ({
  default: {
    initializePayment: vi.fn().mockResolvedValue({ clientSecret: "cs_test" }),
    confirmPayment: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("../../Services/api/subscriptionsApi", () => ({
  default: { create: mocks.createSubscription },
}));
vi.mock("../../Services/api/settingsApi", () => ({
  default: {
    getSettings: vi.fn().mockResolvedValue({
      shippingFlatFee: 50, freeShippingThreshold: 500, taxRatePercent: 15, taxInclusive: true,
    }),
  },
}));

// ── Sub-components ─────────────────────────────────────────────────────────────
vi.mock("../../Components/HelperComponents/CartItem/CartItem", () => ({
  CartItem: ({ item }) => <div data-testid="cart-item">{item?.name}</div>,
}));
vi.mock("../../Components/HelperComponents/Price/Price", () => ({
  default: ({ amount }) => <span>Rs {amount}</span>,
}));
vi.mock("../../Components/Subscriptions/SubscriptionChooser", () => ({
  default: () => <div data-testid="subscription-chooser" />,
}));

import CartCheckOutPage from "./CartCheckOutPage";

const ITEM = { id: "p1", productId: "p1", name: "Dog Food", price: 100, quantity: 2 };

const renderPage = () =>
  render(<MemoryRouter><CartCheckOutPage /></MemoryRouter>);

const fillAddressAndSubmit = () => {
  for (const [name, value] of Object.entries({
    street: "1 Test St", city: "Port Louis", state: "PL", country: "Mauritius", zipCode: "11111",
  })) {
    fireEvent.change(document.querySelector(`input[name="${name}"]`), { target: { name, value } });
  }
  fireEvent.click(screen.getByRole("button", { name: /place order/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.items = [];
  mocks.createSubscription.mockResolvedValue({});
});

describe("CartCheckOutPage — empty cart", () => {
  it("shows empty-cart state when no items", () => {
    renderPage();
    expect(screen.getByText(/your cart is empty/i)).toBeTruthy();
  });

  it("does not render the checkout form when cart is empty", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /place order/i })).toBeNull();
  });
});

describe("CartCheckOutPage — payment flow ordering", () => {
  beforeEach(() => {
    mocks.items = [ITEM];
  });

  it("empties the cart only AFTER Stripe confirms the payment", async () => {
    mocks.confirmCardPayment.mockResolvedValue({
      paymentIntent: { id: "pi_1", status: "succeeded" },
    });
    renderPage();
    fillAddressAndSubmit();

    await waitFor(() => expect(mocks.emptyCart).toHaveBeenCalledTimes(1));
    // Ordering: confirmCardPayment must have been invoked before emptyCart
    const confirmOrder = mocks.confirmCardPayment.mock.invocationCallOrder[0];
    const emptyOrder = mocks.emptyCart.mock.invocationCallOrder[0];
    expect(confirmOrder).toBeLessThan(emptyOrder);
  });

  it("does NOT empty the cart when the card is declined", async () => {
    mocks.confirmCardPayment.mockResolvedValue({ error: { message: "Card declined" } });
    renderPage();
    fillAddressAndSubmit();

    await waitFor(() => expect(mocks.confirmCardPayment).toHaveBeenCalled());
    expect(mocks.emptyCart).not.toHaveBeenCalled();
    // The checkout form must still be mounted so the user can retry
    expect(screen.getByRole("button", { name: /place order/i })).toBeTruthy();
  });

  it("does NOT create a subscription when the card is declined", async () => {
    mocks.confirmCardPayment.mockResolvedValue({ error: { message: "Card declined" } });
    renderPage();
    // Opt into recurring before submitting
    const recurringToggle = document.querySelector('input[type="checkbox"]');
    if (recurringToggle) fireEvent.click(recurringToggle);
    fillAddressAndSubmit();

    await waitFor(() => expect(mocks.confirmCardPayment).toHaveBeenCalled());
    expect(mocks.createSubscription).not.toHaveBeenCalled();
  });

  it("navigates to order confirmation after successful payment", async () => {
    mocks.confirmCardPayment.mockResolvedValue({
      paymentIntent: { id: "pi_1", status: "succeeded" },
    });
    renderPage();
    fillAddressAndSubmit();

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        "/order-confirmed/order1",
        expect.objectContaining({ state: expect.objectContaining({ orderId: "order1" }) }),
      ),
    );
  });
});
