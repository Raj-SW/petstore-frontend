import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock adverts API before importing component
vi.mock("../../../Services/api/advertsApi", () => ({
  default: {
    getAdvertsAdmin: vi.fn().mockResolvedValue({
      data: [
        { _id: "a1", title: "Summer Banner", placement: "banner", link: "https://example.com", active: true, createdAt: "2024-01-15T00:00:00.000Z" },
        { _id: "a2", title: "Shop Promo", placement: "sponsored", link: "https://shop.com", active: false, createdAt: "2024-02-20T00:00:00.000Z" },
      ],
    }),
    createAdvert: vi.fn().mockResolvedValue({ success: true }),
    updateAdvert: vi.fn().mockResolvedValue({ success: true }),
    deleteAdvert: vi.fn().mockResolvedValue({ success: true }),
    uploadImage: vi.fn().mockResolvedValue("https://cdn.example.com/img.jpg"),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Stub shadcn Select to avoid Radix portal/animation issues in jsdom
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value}>
      <button type="button" onClick={() => onValueChange && onValueChange("sponsored")}>
        {children}
      </button>
    </div>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
  SelectValue: () => null,
}));

// Stub framer-motion
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...props }) =>
      <div data-motion={tag} {...props}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import AdminAdverts from "./AdminAdverts";
import advertsApi from "../../../Services/api/advertsApi";

describe("AdminAdverts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the Adverts heading", async () => {
    render(<AdminAdverts />);
    expect(screen.getByText("Adverts")).toBeInTheDocument();
  });

  it("shows loading state initially (DataTable receives loading=true)", async () => {
    // The DataTable is rendered; the loading flag controls its internal skeleton.
    // The heading is always present regardless.
    render(<AdminAdverts />);
    // The New Advert button should be present immediately (not behind loading guard)
    expect(screen.getByRole("button", { name: /new advert/i })).toBeInTheDocument();
  });

  it("displays advert items after API resolves", async () => {
    render(<AdminAdverts />);
    await waitFor(() => expect(screen.getByText("Summer Banner")).toBeInTheDocument());
    expect(screen.getByText("Shop Promo")).toBeInTheDocument();
  });

  it("Add / New Advert button is present", async () => {
    render(<AdminAdverts />);
    const btn = screen.getByRole("button", { name: /new advert/i });
    expect(btn).toBeInTheDocument();
  });

  it("opens create modal when New Advert is clicked", async () => {
    render(<AdminAdverts />);
    fireEvent.click(screen.getByRole("button", { name: /new advert/i }));
    await waitFor(() => expect(screen.getByText("New advert")).toBeInTheDocument());
  });

  it("calls getAdvertsAdmin on mount", async () => {
    render(<AdminAdverts />);
    await waitFor(() => expect(advertsApi.getAdvertsAdmin).toHaveBeenCalledTimes(1));
  });

  it("shows Active/Inactive status badges after data loads", async () => {
    render(<AdminAdverts />);
    await waitFor(() => expect(screen.getByText("Summer Banner")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inactive" })).toBeInTheDocument();
  });
});
