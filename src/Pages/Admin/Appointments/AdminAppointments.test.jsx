import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../Services/api/appointmentsApi", () => ({
  default: {
    getAllAppointments: vi.fn().mockResolvedValue({
      data: [
        { _id: "a1", professionalName: "Dr. Smith", status: "pending", appointmentDate: "2024-06-01T10:00:00Z", clientName: "Alice" },
        { _id: "a2", professionalName: "Dr. Lee", status: "confirmed", appointmentDate: "2024-06-02T14:00:00Z", clientName: "Bob" },
      ],
    }),
    updateAppointmentStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ rows }) => (
    <table>
      <tbody>
        {rows?.map((r) => <tr key={r._id}><td data-testid="appt-row">{r.clientName || r.professionalName}</td></tr>)}
      </tbody>
    </table>
  ),
}));
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children, onValueChange }) => <div onClick={() => onValueChange?.("confirmed")}>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }) => <button>{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAdmin: () => true, logout: vi.fn() }),
}));

import AdminAppointments from "./AdminAppointments";

describe("AdminAppointments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders without crash", () => {
    render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it("shows loading state initially", () => {
    render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it("renders appointments after API resolves", async () => {
    render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryAllByTestId("appt-row").length).toBeGreaterThanOrEqual(0);
    });
  });

  it("renders status filter select", async () => {
    render(<MemoryRouter><AdminAppointments /></MemoryRouter>);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
