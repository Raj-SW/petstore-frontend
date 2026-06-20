import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
vi.mock("@/Components/HelperComponents/ProfessionalList/ProfessionalList", () => ({
  default: ({ role }) => <div data-testid="prolist">{role}</div>,
}));

import AppointmentPage from "./AppointmentPage";

describe("AppointmentPage (directory)", () => {
  it("shows category tabs and no dashboard or booking", () => {
    render(<MemoryRouter><AppointmentPage /></MemoryRouter>);
    expect(screen.getByText("Veterinarians")).toBeInTheDocument();
    expect(screen.getByText("Groomers")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText(/Book Appointment/i)).not.toBeInTheDocument();
  });
});
