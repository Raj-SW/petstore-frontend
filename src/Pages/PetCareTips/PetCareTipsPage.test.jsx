import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../Services/api/tipsApi", () => ({
  default: {
    getTips: vi.fn(),
  },
}));

vi.mock("../../Services/api/advertsApi", () => ({
  default: {
    getAdverts: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const mockAddToast = vi.fn();
vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Stub sub-components to keep tests focused on the page
vi.mock("./components/TipCard", () => ({
  default: ({ tip }) => <div data-testid="tip-card">{tip.title}</div>,
  SponsoredCard: () => <div data-testid="sponsored-card" />,
}));

vi.mock("./components/FeaturedSection", () => ({
  default: ({ tips }) =>
    tips.length > 0 ? (
      <div data-testid="featured-section">Featured: {tips.length}</div>
    ) : null,
}));

vi.mock("./components/AnimalStrip", () => ({
  default: ({ selected, onSelect }) => (
    <div data-testid="animal-strip">
      <button onClick={() => onSelect("dog")}>Dog</button>
      <button onClick={() => onSelect("")}>All Animals</button>
    </div>
  ),
}));

vi.mock("./components/CategoryChips", () => ({
  default: ({ selected, onSelect }) => (
    <div data-testid="category-chips">
      <button onClick={() => onSelect("nutrition")}>Nutrition</button>
      <button onClick={() => onSelect("")}>All Categories</button>
    </div>
  ),
}));

vi.mock("./components/AdvertBanner", () => ({
  default: () => null,
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import tipsApi from "../../Services/api/tipsApi";
import PetCareTipsPage from "./PetCareTipsPage";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_TIPS = [
  { _id: "t1", title: "Dog Nutrition Guide", slug: "dog-nutrition", animalType: "dog", category: "nutrition" },
  { _id: "t2", title: "Cat Grooming Tips", slug: "cat-grooming", animalType: "cat", category: "grooming" },
  { _id: "t3", title: "Rabbit Diet Basics", slug: "rabbit-diet", animalType: "rabbit", category: "nutrition" },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <PetCareTipsPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PetCareTipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tipsApi.getTips.mockResolvedValue({ data: [] });
  });

  it("renders without crashing and shows hero heading", async () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: /pet care tips/i })
    ).toBeInTheDocument();
  });

  it("shows loading state immediately on mount", () => {
    // Never resolves — we observe the skeleton placeholders
    tipsApi.getTips.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    const skeletons = container.querySelectorAll('[data-testid="skeleton-card-item"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders tip cards after API resolves", async () => {
    tipsApi.getTips.mockResolvedValue({ data: SAMPLE_TIPS });
    renderPage();

    expect(await screen.findByText("Dog Nutrition Guide")).toBeInTheDocument();
    expect(await screen.findByText("Cat Grooming Tips")).toBeInTheDocument();
    expect(await screen.findByText("Rabbit Diet Basics")).toBeInTheDocument();

    const cards = screen.getAllByTestId("tip-card");
    expect(cards).toHaveLength(3);
  });

  it("shows empty state when API returns no tips", async () => {
    tipsApi.getTips.mockResolvedValue({ data: [] });
    renderPage();
    expect(
      await screen.findByText(/No tips found/i)
    ).toBeInTheDocument();
  });

  it("renders the search input", () => {
    renderPage();
    expect(
      screen.getByRole("searchbox", { name: /Search tips/i })
    ).toBeInTheDocument();
  });

  it("renders the animal strip component", async () => {
    renderPage();
    expect(screen.getByTestId("animal-strip")).toBeInTheDocument();
  });

  it("renders the category chips component", async () => {
    renderPage();
    expect(screen.getByTestId("category-chips")).toBeInTheDocument();
  });

  it("renders 'Browse all tips' eyebrow label", async () => {
    renderPage();
    expect(screen.getByText(/Browse all tips/i)).toBeInTheDocument();
  });

  it("shows error toast when grid API call fails", async () => {
    tipsApi.getTips.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to load tips/i),
        "error"
      );
    });
  });

  it("refetches tips when animal type filter changes", async () => {
    tipsApi.getTips.mockResolvedValue({ data: [] });
    renderPage();

    // Wait for initial load to settle
    await screen.findByText(/No tips found/i);

    const callsBefore = tipsApi.getTips.mock.calls.length;

    // Trigger animal filter change via stubbed AnimalStrip
    fireEvent.click(screen.getByRole("button", { name: "Dog" }));

    await waitFor(() => {
      // One additional grid refetch triggered by the filter change
      expect(tipsApi.getTips.mock.calls.length).toBeGreaterThanOrEqual(callsBefore + 1);
    });
  });

  it("refetches tips when category filter changes", async () => {
    tipsApi.getTips.mockResolvedValue({ data: [] });
    renderPage();

    await screen.findByText(/No tips found/i);

    const callsBefore = tipsApi.getTips.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Nutrition" }));

    await waitFor(() => {
      expect(tipsApi.getTips.mock.calls.length).toBeGreaterThanOrEqual(callsBefore + 1);
    });
  });
});
