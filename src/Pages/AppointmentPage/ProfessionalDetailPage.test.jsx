import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../Services/api/professionalsApi", () => ({
  default: { getProfessionalById: vi.fn() },
}));

import professionalsApi from "../../Services/api/professionalsApi";
import ProfessionalDetailPage from "./ProfessionalDetailPage";

const renderAt = (id) =>
  render(
    <MemoryRouter initialEntries={[`/appointments/professional/${id}`]}>
      <Routes>
        <Route path="/appointments/professional/:id" element={<ProfessionalDetailPage />} />
        <Route path="/contact" element={<div>Contact Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("ProfessionalDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the professional's profile, a service, and a Get in touch link", async () => {
    professionalsApi.getProfessionalById.mockResolvedValue({
      _id: "p1", name: "Dr. Jo Alexander", role: "veterinarian",
      specialization: "Small animals", experience: 6, bio: "Caring vet with a gentle touch.",
      qualifications: ["DVM"], services: [{ name: "Wellness exam", description: "Full checkup" }],
      availability: "Mon–Fri", email: "jo@example.com", phone: "+230 5000 0000",
    });
    renderAt("p1");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Dr. Jo Alexander" })).toBeInTheDocument());
    expect(screen.getByText(/caring vet/i)).toBeInTheDocument();
    expect(screen.getByText("Wellness exam")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get in touch/i })).toHaveAttribute("href", "/contact");
  });

  it("shows a not-found state when the professional can't be loaded", async () => {
    professionalsApi.getProfessionalById.mockRejectedValue(new Error("404"));
    renderAt("missing");
    await waitFor(() => expect(screen.getByText(/not found/i)).toBeInTheDocument());
  });
});
