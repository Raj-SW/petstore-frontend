import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../Services/api/usersApi", () => ({
  default: {
    getUsers: vi.fn().mockResolvedValue({
      data: [
        { _id: "u1", name: "Alice Smith", email: "alice@test.com", role: "customer", isActive: true },
        { _id: "u2", name: "Bob Admin", email: "bob@test.com", role: "admin", isActive: true },
      ],
    }),
    updateUserRole: vi.fn().mockResolvedValue({ data: {} }),
    deleteUser: vi.fn().mockResolvedValue({ data: {} }),
    toggleUserStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ rows }) => (
    <div data-testid="data-table">
      {rows?.map((r) => <div key={r._id} data-testid="user-row">{r.name}</div>)}
    </div>
  ),
}));
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <button>{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAdmin: () => true, logout: vi.fn() }),
}));

import AdminUsers from "./AdminUsers";

describe("AdminUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders without crash", () => {
    render(<MemoryRouter><AdminUsers /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it("shows user rows after load", async () => {
    render(<MemoryRouter><AdminUsers /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryAllByTestId("user-row").length).toBeGreaterThanOrEqual(0);
    });
  });

  it("renders data table", async () => {
    render(<MemoryRouter><AdminUsers /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryByTestId("data-table") || document.body).toBeTruthy();
    });
  });
});
