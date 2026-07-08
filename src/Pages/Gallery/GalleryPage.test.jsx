import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../Services/api/galleryApi", () => ({
  default: {
    getPosts: vi.fn(),
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

// Stub GalleryCard to avoid deep dep tree
vi.mock("./components/GalleryCard", () => ({
  default: ({ post }) => <div data-testid="gallery-card">{post.title}</div>,
}));

// Stub AdvertBanner
vi.mock("../PetCareTips/components/AdvertBanner", () => ({
  default: () => null,
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import galleryApi from "../../Services/api/galleryApi";
import GalleryPage from "./GalleryPage";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_POSTS = [
  { _id: "p1", title: "Pet Expo 2026", slug: "pet-expo-2026", category: "event" },
  { _id: "p2", title: "Adoption Drive", slug: "adoption-drive", category: "community" },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <GalleryPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GalleryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolve immediately with empty data
    galleryApi.getPosts.mockResolvedValue({ data: [] });
  });

  it("renders without crashing and shows the Gallery heading", async () => {
    renderPage();
    // The hero h1 "Gallery" should appear
    expect(screen.getByRole("heading", { name: /Gallery/i })).toBeInTheDocument();
  });

  it("shows skeleton loading state while API is pending", async () => {
    // Never resolves so we stay in loading
    galleryApi.getPosts.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    // Skeletons are rendered by the shared SkeletonCard component
    const skeletons = container.querySelectorAll('[data-testid="skeleton-card-item"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when API returns no posts", async () => {
    galleryApi.getPosts.mockResolvedValue({ data: [] });
    renderPage();
    expect(
      await screen.findByText(/No posts found/i)
    ).toBeInTheDocument();
  });

  it("renders gallery cards after API resolves", async () => {
    // The page makes two getPosts calls: one for featured, one for the grid.
    // We only want the grid cards to render (featured is separate).
    // Return an empty featured result so FeaturedHero doesn't also show the title.
    galleryApi.getPosts
      .mockResolvedValueOnce({ data: [] })          // featured call
      .mockResolvedValueOnce({ data: SAMPLE_POSTS }) // grid call
      .mockResolvedValue({ data: SAMPLE_POSTS });    // any subsequent calls

    renderPage();

    const cards = await screen.findAllByTestId("gallery-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Pet Expo 2026");
    expect(cards[1]).toHaveTextContent("Adoption Drive");
  });

  it("renders the category filter buttons (All + GALLERY_CATEGORIES)", async () => {
    galleryApi.getPosts.mockResolvedValue({ data: [] });
    renderPage();
    // "All" chip is always present
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    // Category chips from GALLERY_CATEGORIES
    expect(screen.getByRole("button", { name: "Event" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Community" })).toBeInTheDocument();
  });

  it("renders the search input", () => {
    renderPage();
    expect(screen.getByRole("searchbox", { name: /Search gallery/i })).toBeInTheDocument();
  });

  it("shows error toast when API fails on filter change", async () => {
    // First call (mount) succeeds; second call (category change) fails
    galleryApi.getPosts
      .mockResolvedValueOnce({ data: [] })
      .mockRejectedValueOnce(new Error("Network error"));

    renderPage();

    // Wait for initial load to complete
    await screen.findByText(/No posts found/i);

    // Click a category chip to trigger a refetch
    fireEvent.click(screen.getByRole("button", { name: "Event" }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to load gallery/i),
        "error"
      );
    });
  });

  it("clicking All chip clears active category", async () => {
    galleryApi.getPosts.mockResolvedValue({ data: [] });
    renderPage();
    await screen.findByText(/No posts found/i);

    const callsBefore = galleryApi.getPosts.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Event" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));

    // Should have triggered at least 2 additional grid refetches
    await waitFor(() => {
      expect(galleryApi.getPosts.mock.calls.length).toBeGreaterThanOrEqual(callsBefore + 2);
    });
  });
});
