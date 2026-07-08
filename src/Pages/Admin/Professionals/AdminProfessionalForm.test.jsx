import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@/Services/api/adminProfessionalsApi", () => ({
  default: { create: vi.fn(), promote: vi.fn(), update: vi.fn(), list: vi.fn(), searchUsers: vi.fn() },
}));
vi.mock("@/context/ToastContext", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("@/Components/Admin/ImageManager/ImageManager", () => ({ default: () => <div data-testid="image-manager" /> }));

import adminProfessionalsApi from "@/Services/api/adminProfessionalsApi";
import AdminProfessionalForm from "./AdminProfessionalForm";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/professionals/new" element={<AdminProfessionalForm />} />
        <Route path="/admin/professionals/:id/edit" element={<AdminProfessionalForm />} />
        <Route path="/admin/professionals" element={<div>list</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

describe("AdminProfessionalForm — create", () => {
  it("submits a create payload with professionalInfo", async () => {
    adminProfessionalsApi.create.mockResolvedValue({ data: {} });
    renderAt("/admin/professionals/new");

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Dr New" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@x.com" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "1 St" } });
    fireEvent.change(screen.getByLabelText(/specialization/i), { target: { value: "Feline" } });
    fireEvent.change(screen.getByLabelText(/experience/i), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /save|create/i }));

    await waitFor(() => expect(adminProfessionalsApi.create).toHaveBeenCalledTimes(1));
    const payload = adminProfessionalsApi.create.mock.calls[0][0];
    expect(payload.name).toBe("Dr New");
    expect(payload.professionalInfo.specialization).toBe("Feline");
    expect(payload.professionalInfo.experience).toBe(5);
  });

  it("blocks submit when required fields are missing", async () => {
    renderAt("/admin/professionals/new");
    fireEvent.click(screen.getByRole("button", { name: /save|create/i }));
    await waitFor(() => expect(adminProfessionalsApi.create).not.toHaveBeenCalled());
  });
});
