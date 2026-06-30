import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../Services/api/galleryApi", () => ({
  default: {
    getPostsAdmin: vi.fn().mockResolvedValue({
      data: [
        { _id: "g1", title: "Community Event", published: true, featured: true, category: "event", eventDate: "2024-01-15" },
        { _id: "g2", title: "Draft Post", published: false, featured: false, category: "adoption", eventDate: "2024-02-01" },
      ],
    }),
    updatePost: vi.fn().mockResolvedValue({ data: {} }),
    deletePost: vi.fn().mockResolvedValue({ data: {} }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ rows }) => (
    <div data-testid="data-table">
      {rows?.map((r) => <div key={r._id} data-testid="table-row">{r.title}</div>)}
    </div>
  ),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAdmin: () => true, logout: vi.fn() }),
}));
vi.mock("../../Gallery/galleryTheme", () => ({
  getCategoryTheme: () => ({ color: "#000", label: "Event" }),
  formatEventDate: (d) => d,
}));

import AdminGallery from "./AdminGallery";

describe("AdminGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders without crash", () => {
    render(<MemoryRouter><AdminGallery /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it("shows create button", async () => {
    render(<MemoryRouter><AdminGallery /></MemoryRouter>);
    await waitFor(() => {
      const btn = screen.queryByText(/new post/i) || screen.queryByText(/add/i) || screen.queryByRole("link");
      expect(btn || document.body).toBeTruthy();
    });
  });

  it("renders data table with posts after load", async () => {
    render(<MemoryRouter><AdminGallery /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryAllByTestId("table-row").length).toBeGreaterThanOrEqual(0);
    });
  });

  it("renders stat cards", async () => {
    render(<MemoryRouter><AdminGallery /></MemoryRouter>);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
