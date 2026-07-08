import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/Services/api/adminProfessionalsApi", () => ({
  default: {
    list: vi.fn(),
    toggleStatus: vi.fn(),
    offboard: vi.fn(),
  },
}));
vi.mock("@/context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));

import adminProfessionalsApi from "@/Services/api/adminProfessionalsApi";
import AdminProfessionals from "./AdminProfessionals";

beforeEach(() => vi.clearAllMocks());

describe("AdminProfessionals", () => {
  it("renders professional rows from the API", async () => {
    adminProfessionalsApi.list.mockResolvedValue({
      data: [
        { _id: "1", name: "Dr Lee", email: "lee@x.com", role: "veterinarian",
          professionalInfo: { specialization: "Feline", experience: 8, rating: 4.5, isActive: true } },
      ],
      pagination: { total: 1, page: 1, pages: 1 },
    });
    render(<MemoryRouter><AdminProfessionals /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Dr Lee")).toBeInTheDocument());
    expect(screen.getByText("Feline")).toBeInTheDocument();
  });
});
