import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── API & context mocks ───────────────────────────────────────────────────────

const { mockGetMyOrders, mockAddToast, mockSubmitContact } = vi.hoisted(() => ({
  mockGetMyOrders: vi.fn(),
  mockAddToast: vi.fn(),
  mockSubmitContact: vi.fn(),
}));

vi.mock("../../Services/api/ordersApi", () => ({
  default: {
    getMyOrders: mockGetMyOrders,
    cancelOrder: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock("../../Services/api/contactApi", () => ({
  default: { submitContact: mockSubmitContact },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Raj Test", email: "raj@test.com" } }),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("../../context/CartContext", () => ({
  useCart: () => ({
    addItem: vi.fn(),
    cartItems: [],
    removeFromCart: vi.fn(),
    total: 0,
  }),
}));

vi.mock("../../Components/HelperComponents/Breadcrumb/Breadcrumb", () => ({
  default: () => <nav data-testid="breadcrumb" />,
}));

vi.mock("../../Components/HelperComponents/Price/Price", () => ({
  default: ({ amount }) => <span>${amount}</span>,
}));

// Stub shadcn Select to avoid Radix portal issues.
// Select passes onValueChange down via context so SelectItem renders a real
// clickable button — lets tests pick a value (e.g. the refund reason).
vi.mock("@/Components/ui/select", async () => {
  const React = await import("react");
  const SelectCtx = React.createContext(() => {});
  return {
    Select: ({ children, onValueChange }) => (
      <SelectCtx.Provider value={onValueChange || (() => {})}>
        <div>{children}</div>
      </SelectCtx.Provider>
    ),
    SelectTrigger: ({ children }) => <div>{children}</div>,
    SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
    SelectContent: ({ children }) => <div>{children}</div>,
    SelectItem: ({ children, value }) => {
      const onValueChange = React.useContext(SelectCtx);
      return (
        <button type="button" data-testid={`select-item-${value}`} onClick={() => onValueChange(value)}>
          {children}
        </button>
      );
    },
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_ORDERS = [
  {
    _id: "order001234567",
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "stripe",
    createdAt: "2026-06-01T10:00:00.000Z",
    totalAmount: 150,
    finalAmount: 150,
    discount: 0,
    items: [
      {
        _id: "item1",
        product: { _id: "p1", name: "Dog Food", images: [{ url: "http://img/x.jpg" }] },
        quantity: 2,
        price: 75,
      },
    ],
  },
  {
    _id: "order009876543",
    status: "delivered",
    paymentStatus: "completed",
    paymentMethod: "stripe",
    createdAt: "2026-05-15T08:00:00.000Z",
    totalAmount: 200,
    finalAmount: 200,
    discount: 0,
    items: [
      {
        _id: "item2",
        product: { _id: "p2", name: "Cat Toy", images: [] },
        quantity: 1,
        price: 200,
      },
    ],
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/my-orders"]}>
      <MyOrdersPage />
    </MemoryRouter>
  );

// ── Import after mocks ────────────────────────────────────────────────────────

import MyOrdersPage from "./MyOrdersPage";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MyOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crash", () => {
    mockGetMyOrders.mockReturnValue(new Promise(() => {})); // stays loading
    renderPage();
    expect(document.body).toBeTruthy();
  });

  it("shows a loading skeleton while fetching orders", () => {
    mockGetMyOrders.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = renderPage();
    const skeletons = container.querySelectorAll('[data-testid="skeleton-row-item"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows 'No orders yet' empty state when the user has no orders", async () => {
    mockGetMyOrders.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /start shopping/i })).toBeInTheDocument();
  });

  it("renders order cards when orders are returned", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/my orders/i)).toBeInTheDocument()
    );
    // Product names are visible in item rows
    expect(screen.getByText("Dog Food")).toBeInTheDocument();
    expect(screen.getByText("Cat Toy")).toBeInTheDocument();
  });

  it("shows the order count in the header", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("2 orders")).toBeInTheDocument()
    );
  });

  it("renders status badges", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("Pending").length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText("Delivered").length).toBeGreaterThan(0);
  });

  it("renders filter tabs", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("All")).toBeInTheDocument()
    );
    expect(screen.getAllByRole("button", { name: /pending/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /delivered/i }).length).toBeGreaterThan(0);
  });

  it("renders the search bar", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/search by product name/i)).toBeInTheDocument()
    );
  });

  it("shows Cancel Order button for pending orders", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument()
    );
  });

  it("shows 'Buy Again' button for delivered orders", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /buy again/i })).toBeInTheDocument()
    );
  });

  it("shows an error toast when the API call fails", async () => {
    mockGetMyOrders.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith("Failed to load orders.", "error")
    );
  });

  it("shows breadcrumb after data loads", async () => {
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("breadcrumb")).toBeInTheDocument()
    );
  });
});

describe("MyOrdersPage — refund request (really recorded, not faked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMyOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    mockSubmitContact.mockResolvedValue({ success: true });
  });

  const openRefundModalAndPickReason = async () => {
    renderPage();
    const refundBtn = await screen.findByRole("button", { name: /return \/ refund/i });
    fireEvent.click(refundBtn);
    await screen.findByText(/request return \/ refund/i);
    fireEvent.click(screen.getByTestId("select-item-Item arrived damaged"));
  };

  it("submits the request through the contact API with order + reason details", async () => {
    await openRefundModalAndPickReason();
    fireEvent.change(screen.getByLabelText(/additional notes/i), {
      target: { value: "Box was crushed" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => expect(mockSubmitContact).toHaveBeenCalledTimes(1));
    const payload = mockSubmitContact.mock.calls[0][0];
    expect(payload.name).toBe("Raj Test");
    expect(payload.email).toBe("raj@test.com");
    expect(payload.message).toContain("RETURN/REFUND REQUEST");
    expect(payload.message).toContain("order009876543"); // delivered order id
    expect(payload.message).toContain("Item arrived damaged");
    expect(payload.message).toContain("Box was crushed");
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/return request received/i), "success")
    );
  });

  it("shows an error toast and keeps the modal open when submission fails", async () => {
    mockSubmitContact.mockRejectedValue(new Error("Server unavailable"));
    await openRefundModalAndPickReason();
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith("Server unavailable", "error")
    );
    // Modal must remain open so the user can retry — no fake success
    expect(screen.getByText(/request return \/ refund/i)).toBeInTheDocument();
  });
});
