import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Context mocks ────────────────────────────────────────────────────────────

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      _id: "u1",
      id: "u1",
      name: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "555-1234",
      address: "123 Pet Lane",
      createdAt: "2023-01-01T00:00:00.000Z",
      emailPreferences: { sales: true, news: false },
    },
    updateUser: vi.fn(),
  }),
}));

// ── API mocks ────────────────────────────────────────────────────────────────

vi.mock("@/Services/api/usersApi", () => ({
  default: {
    getUserPets: vi.fn().mockResolvedValue([
      { _id: "pet1", id: "pet1", name: "Buddy", species: "dog", breed: "Labrador", age: 3 },
    ]),
  },
}));

vi.mock("../Services/localServices/userProfileService", () => ({
  default: {
    updateUserProfile: vi.fn().mockResolvedValue({ data: {} }),
    addPet: vi.fn(),
    updatePet: vi.fn(),
    deletePet: vi.fn(),
    changePassword: vi.fn(),
  },
}));

// ── Heavy sub-component stubs ────────────────────────────────────────────────

vi.mock("../Components/UserProfile/AvatarUploader", () => ({
  default: () => <div data-testid="avatar-uploader" />,
}));

vi.mock("../Components/UserProfile/ManagePhotosModal", () => ({
  default: () => null,
}));

vi.mock("../Components/UserProfile/PetForm", () => ({
  default: ({ show }) => show ? <div data-testid="pet-form" /> : null,
}));

vi.mock("../Components/UserProfile/PetList", () => ({
  default: ({ pets }) => (
    <ul data-testid="pet-list">
      {pets.map((p) => <li key={p._id || p.id}>{p.name}</li>)}
    </ul>
  ),
}));

vi.mock("../Components/UserProfile/ProfileForm", () => ({
  default: ({ show }) => show ? <div data-testid="profile-form" /> : null,
}));

vi.mock("../Components/UserProfile/PasswordChangeForm", () => ({
  default: ({ show }) => show ? <div data-testid="password-form" /> : null,
}));

vi.mock("../Components/UserProfile/ConfirmModal", () => ({
  default: ({ show }) => show ? <div data-testid="confirm-modal" /> : null,
}));

vi.mock("../Components/HelperComponents/Breadcrumb/Breadcrumb", () => ({
  default: () => <nav data-testid="breadcrumb" />,
}));

vi.mock("../models", () => ({
  User: class User { constructor(d) { Object.assign(this, d); } },
  Pet:  class Pet  { constructor(d) { Object.assign(this, d); } },
}));

// ── Import after mocks ────────────────────────────────────────────────────────

import UserProfile from "./UserProfile";
import usersApi from "@/Services/api/usersApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <UserProfile />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UserProfile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersApi.getUserPets.mockResolvedValue([
      { _id: "pet1", id: "pet1", name: "Buddy", species: "dog", breed: "Labrador", age: 3 },
    ]);
  });

  it("renders without crash", () => {
    renderPage();
    expect(document.body).toBeTruthy();
  });

  it("displays the user name in the profile header", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    );
  });

  it("displays the user email", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("jane@example.com")).toBeInTheDocument()
    );
  });

  it("displays the user phone number", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("555-1234")).toBeInTheDocument()
    );
  });

  it("renders Edit Profile and Change Password action buttons", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument();
  });

  it("shows the My Pets section heading", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("My Pets")).toBeInTheDocument()
    );
  });

  it("renders pet list after pets load", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("pet-list")).toBeInTheDocument()
    );
    expect(screen.getByText("Buddy")).toBeInTheDocument();
  });

  it("shows empty pets message when no pets exist", async () => {
    usersApi.getUserPets.mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/no pets added yet/i)).toBeInTheDocument()
    );
  });

  it("shows Add Pet button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add pet/i })).toBeInTheDocument()
    );
  });

  it("opens the pet form when Add Pet is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add pet/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /add pet/i }));
    expect(screen.getByTestId("pet-form")).toBeInTheDocument();
  });

  it("opens the profile edit form when Edit Profile is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
  });

  it("opens the password form when Change Password is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.getByTestId("password-form")).toBeInTheDocument();
  });

  it("shows email preferences toggles", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/email preferences/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/receive sale/i)).toBeInTheDocument();
    expect(screen.getByText(/receive news/i)).toBeInTheDocument();
  });

  it("calls getUserPets on mount", async () => {
    renderPage();
    await waitFor(() =>
      expect(usersApi.getUserPets).toHaveBeenCalledTimes(1)
    );
  });
});
