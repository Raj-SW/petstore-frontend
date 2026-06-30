import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── API & context mocks ───────────────────────────────────────────────────────

const { mockGetMyOrders, mockAddToast } = vi.hoisted(() => ({
  mockGetMyOrders: vi.fn(),
  mockAddToast: vi.fn(),
}));

vi.mock("../../Services/api/ordersApi", () => ({
  default: {
    getMyOrders: mockGetMyOrders,
    cancelOrder: vi.fn().mockResolvedValue({ data: {} }),
  },
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

// Stub shadcn Select to avoid Radix portal issues
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
}));

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

  it("shows a loading spinner while fetching orders", () => {
    mockGetMyOrders.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(screen.getByText(/loading your orders/i)).toBeInTheDocument();
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
