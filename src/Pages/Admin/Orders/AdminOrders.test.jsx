import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// --- Mocks (hoisted) ---
vi.mock("../../../Services/api/ordersApi", () => ({
  default: {
    getAllOrders: vi.fn(),
    updateOrderStatus: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Shadcn Select — render as a native <select> to keep tests simple
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      data-testid="status-select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ value, children }) => <option value={value}>{children}</option>,
}));

// DataTable — thin stub that renders rows
vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ data, loading, columns, customActions }) => {
    if (loading) return <div data-testid="loading">Loading…</div>;
    return (
      <table>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} data-testid="order-row">
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
              {customActions && <td>{customActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

// framer-motion — passthrough
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) =>
        ({ children, ...rest }) => {
          const Tag = typeof tag === "string" ? tag : "div";
          return <Tag {...rest}>{children}</Tag>;
        },
    }
  ),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import ordersApi from "../../../Services/api/ordersApi";
import AdminOrders from "./AdminOrders";

const SAMPLE_ORDERS = [
  {
    _id: "abc123def456",
    user: { name: "Alice Smith", email: "alice@example.com" },
    items: [{ product: { name: "Dog Food" }, quantity: 2, price: 500 }],
    totalAmount: 1000,
    status: "pending",
    paymentStatus: "completed",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    _id: "xyz789uvw012",
    user: { name: "Bob Jones", email: "bob@example.com" },
    items: [],
    totalAmount: 500,
    status: "delivered",
    paymentStatus: "completed",
    createdAt: new Date("2024-02-20").toISOString(),
  },
];

describe("AdminOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: [] });
    render(<AdminOrders />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    // Never resolves during this check
    ordersApi.getAllOrders.mockReturnValue(new Promise(() => {}));
    render(<AdminOrders />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders order rows after API resolves", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() =>
      expect(screen.getAllByTestId("order-row")).toHaveLength(2)
    );
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders status badges for orders", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() => screen.getAllByTestId("order-row"));
    // pending badge
    expect(screen.getByText("pending")).toBeInTheDocument();
    // delivered badge
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("stat pills show total order count", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() => screen.getAllByTestId("order-row"));
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    // 2 total orders
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("search input filters displayed orders", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() => screen.getAllByTestId("order-row"));

    const searchInput = screen.getByPlaceholderText(/search by order id/i);
    fireEvent.change(searchInput, { target: { value: "alice" } });

    await waitFor(() => {
      expect(screen.getAllByTestId("order-row")).toHaveLength(1);
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    });
  });

  it("status filter chips filter displayed orders", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() => screen.getAllByTestId("order-row"));

    // Click "Pending" chip (first match = order status chip)
    const pendingChips = screen.getAllByRole("button", { name: /^pending$/i });
    fireEvent.click(pendingChips[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId("order-row")).toHaveLength(1);
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
  });

  it("clear search button removes filter text", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: SAMPLE_ORDERS });
    render(<AdminOrders />);
    await waitFor(() => screen.getAllByTestId("order-row"));

    const searchInput = screen.getByPlaceholderText(/search by order id/i);
    fireEvent.change(searchInput, { target: { value: "alice" } });
    await waitFor(() =>
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByLabelText("Clear search"));

    await waitFor(() =>
      expect(screen.getAllByTestId("order-row")).toHaveLength(2)
    );
  });

  it("shows empty table gracefully when API returns empty array", async () => {
    ordersApi.getAllOrders.mockResolvedValue({ data: [] });
    render(<AdminOrders />);
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.queryAllByTestId("order-row")).toHaveLength(0);
  });
});
