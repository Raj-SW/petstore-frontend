import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks must be declared before component import ──────────────────────────

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showCartToast: vi.fn(), showAuthToast: vi.fn(), addToast: vi.fn() }),
}));

vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ totalItems: 0, cartItems: [] }),
}));

vi.mock("../../context/CurrencyContext", () => ({
  useCurrency: () => ({
    selectedCurrency: "USD",
    setSelectedCurrency: vi.fn(),
    formatPrice: (n) => `$${n}`,
  }),
}));

vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return {
    ...real,
    useLocation: () => ({ pathname: "/home" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock heavy child components that have their own dependencies
vi.mock("./AddToCart", () => ({ default: () => <div data-testid="add-to-cart" /> }));
vi.mock("./Dropdowns/ServicesDropdown", () => ({ default: () => <div data-testid="services-dropdown" /> }));
vi.mock("./Dropdowns/ClinicDropdown", () => ({ default: () => <div data-testid="clinic-dropdown" /> }));
vi.mock("./Dropdowns/SignUpDropdown", () => ({
  default: ({ showLogin, setShowLogin }) => (
    <div data-testid="signup-dropdown">
      <button onClick={() => setShowLogin(true)}>Login</button>
      <button onClick={() => setShowLogin(false)}>Signup</button>
    </div>
  ),
}));
vi.mock("../HelperComponents/CurrencySelector/CurrencySelector", () => ({
  default: () => <div data-testid="currency-selector" />,
}));

// Static assets
vi.mock("../../assets/NavBar Assets/Vital-paws-logo.png", () => ({ default: "logo.png" }));
vi.mock("../../assets/NavBar Assets/Paws.png", () => ({ default: "paws.png" }));

import { useAuth } from "../../context/AuthContext";
import NavigationBar from "./NavigationBar";

const renderNav = () => render(<NavigationBar />);

describe("NavigationBar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the VitalPaws logo image", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(screen.getByAltText("VitalPaws")).toBeInTheDocument();
  });

  it("renders all expected nav links in the desktop list", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^shop$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pet travel/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pet care tips/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  it("renders the Care dropdown trigger button", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(
      screen.getByRole("button", { name: /care/i })
    ).toBeInTheDocument();
  });

  it("renders the Our Clinic dropdown trigger button", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(
      screen.getByRole("button", { name: /our clinic/i })
    ).toBeInTheDocument();
  });

  it("shows login/signup controls when user is null", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(screen.getByTestId("signup-dropdown")).toBeInTheDocument();
  });

  it("shows user name and logout button when user is logged in", async () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { name: "Alice", profileImage: null },
      logout: mockLogout,
      isAdmin: () => false,
    });
    renderNav();

    // User name appears in the nav button
    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Open user menu to reveal logout
    const userBtn = screen.getByRole("button", { name: /alice/i });
    await userEvent.click(userBtn);

    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("renders mobile hamburger button", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: () => false });
    renderNav();
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("shows Admin Dashboard link in user menu when isAdmin returns true", async () => {
    useAuth.mockReturnValue({
      user: { name: "Bob", profileImage: null },
      logout: vi.fn(),
      isAdmin: () => true,
    });
    renderNav();

    const userBtn = screen.getByRole("button", { name: /bob/i });
    await userEvent.click(userBtn);

    expect(screen.getByRole("link", { name: /admin dashboard/i })).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", async () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { name: "Carol", profileImage: null },
      logout: mockLogout,
      isAdmin: () => false,
    });
    renderNav();

    await userEvent.click(screen.getByRole("button", { name: /carol/i }));
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
