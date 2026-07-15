import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const FRAMER_PROPS = new Set([
    "initial", "animate", "exit", "transition", "whileInView", "whileHover",
    "whileTap", "viewport", "layoutId", "layout", "variants",
  ]);
  const motion = new Proxy({}, {
    get: (_t, tag) =>
      React.forwardRef(({ children, ...props }, ref) => {
        const rest = {};
        for (const k of Object.keys(props)) if (!FRAMER_PROPS.has(k)) rest[k] = props[k];
        return React.createElement(tag, { ref, ...rest }, children);
      }),
  });
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useInView: () => true,
    useReducedMotion: () => true, // disables auto-advance in tests — deterministic
  };
});

vi.mock("../../../../Services/api/professionalsApi", () => ({
  default: { getProfessionals: vi.fn() },
}));

vi.mock("../../../../Components/HelperComponents/SkeletonCard/SkeletonCard", () => ({
  default: () => <div data-testid="skeleton" />,
}));

import professionalsApi from "../../../../Services/api/professionalsApi";
import VetNetworkSection from "./VetNetworkSection";

const PROS = [
  {
    _id: "p1",
    name: "Anisha Ramgoolam",
    role: "veterinarian",
    professionalInfo: { specialization: "Small-animal surgery", rating: 4.9, experience: 12 },
    profileImage: { url: "https://img/anisha.jpg" },
  },
  {
    _id: "p2",
    name: "Kevin Chan",
    role: "groomer",
    // flattened shape + no image + no rating: exercises normalizer and fallbacks
    specialization: "Show grooming",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  professionalsApi.getProfessionals.mockResolvedValue({ data: PROS });
});

describe("VetNetworkSection (spotlight)", () => {
  it("fetches top-rated professionals and shows the first in the spotlight", async () => {
    render(<VetNetworkSection />);
    expect(await screen.findByText("Anisha Ramgoolam")).toBeInTheDocument();
    expect(professionalsApi.getProfessionals).toHaveBeenCalledWith({
      limit: 4,
      sortBy: "professionalInfo.rating",
      sortOrder: "desc",
    });
    expect(screen.getByText(/Veterinarian/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.9/)).toBeInTheDocument();
    expect(screen.getByText(/Small-animal surgery/)).toBeInTheDocument();
    expect(screen.getByText(/12 yrs experience/)).toBeInTheDocument();
  });

  it("renders one avatar button per professional and switches spotlight on click", async () => {
    render(<VetNetworkSection />);
    await screen.findByText("Anisha Ramgoolam");
    const avatars = screen.getAllByRole("button", { name: /^(Anisha Ramgoolam|Kevin Chan)$/ });
    expect(avatars).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Kevin Chan" }));
    expect(await screen.findByText("Kevin Chan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kevin Chan" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Show grooming/)).toBeInTheDocument();
  });

  it("shows initials monogram when the active professional has no photo", async () => {
    render(<VetNetworkSection />);
    await screen.findByText("Anisha Ramgoolam");
    fireEvent.click(screen.getByRole("button", { name: "Kevin Chan" }));
    await screen.findByText("Kevin Chan");
    // portrait monogram (KC) — avatar rail also shows initials for him
    expect(screen.getAllByText("KC").length).toBeGreaterThanOrEqual(1);
  });

  it("omits the star rating when rating is 0/missing", async () => {
    render(<VetNetworkSection />);
    await screen.findByText("Anisha Ramgoolam");
    fireEvent.click(screen.getByRole("button", { name: "Kevin Chan" }));
    await screen.findByText("Kevin Chan");
    const eyebrow = screen.getByTestId("vn-eyebrow");
    expect(eyebrow.textContent).toMatch(/Groomer/i);
    // the rating is rendered as "N.N" next to a star icon — absence of the
    // number is the real signal (the star is an svg with no text content)
    expect(eyebrow.textContent).not.toMatch(/\d\.\d/);
  });

  it("Book CTA navigates to the professional detail page", async () => {
    render(<VetNetworkSection />);
    await screen.findByText("Anisha Ramgoolam");
    fireEvent.click(screen.getByRole("button", { name: /Book with Anisha/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/appointments/professional/p1");
  });

  it("renders nothing when the API returns no professionals", async () => {
    professionalsApi.getProfessionals.mockResolvedValue({ data: [] });
    const { container } = render(<VetNetworkSection />);
    await waitFor(() => expect(container.firstChild).toBeNull());
  });
});
