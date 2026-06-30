import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// --- Mocks (hoisted) ---
vi.mock("../../../Services/api/tipsApi", () => ({
  default: {
    getTipsAdmin: vi.fn(),
    updateTip: vi.fn().mockResolvedValue({ success: true }),
    deleteTip: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../../PetCareTips/tipTheme", () => ({
  capitalize: (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ""),
}));

vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ data, loading, columns, onEdit, onDelete, onView }) => {
    if (loading) return <div data-testid="loading">Loading…</div>;
    return (
      <table>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} data-testid="tip-row">
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
              <td>
                {onEdit && (
                  <button onClick={() => onEdit(row)} aria-label={`Edit ${row.title}`}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} aria-label={`Delete ${row.title}`}>
                    Delete
                  </button>
                )}
                {onView && (
                  <button onClick={() => onView(row)} aria-label={`View ${row.title}`}>
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) =>
        ({ children, ...rest }) => {
          const Tag = typeof tag === "string" ? tag : "div";
          return <Tag {...rest}>{children}</Tag>;
        },
    }
  ),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import tipsApi from "../../../Services/api/tipsApi";
import AdminTips from "./AdminTips";

// AdminTips uses useNavigate so needs MemoryRouter
const renderAdminTips = () =>
  render(
    <MemoryRouter>
      <AdminTips />
    </MemoryRouter>
  );

const SAMPLE_TIPS = [
  {
    _id: "tip1",
    title: "Brush Your Dog Daily",
    animalType: "dog",
    category: "grooming",
    difficulty: "easy",
    featured: true,
    published: true,
    slug: "brush-your-dog-daily",
    createdAt: new Date("2024-01-10").toISOString(),
  },
  {
    _id: "tip2",
    title: "Cat Nutrition Basics",
    animalType: "cat",
    category: "nutrition",
    difficulty: "medium",
    featured: false,
    published: false,
    slug: "cat-nutrition-basics",
    createdAt: new Date("2024-02-05").toISOString(),
  },
];

describe("AdminTips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing and shows page title", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: [] });
    renderAdminTips();
    expect(screen.getByText("Pet Care Tips")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    tipsApi.getTipsAdmin.mockReturnValue(new Promise(() => {}));
    renderAdminTips();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders tip rows after API resolves", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() =>
      expect(screen.getAllByTestId("tip-row")).toHaveLength(2)
    );
    expect(screen.getByText("Brush Your Dog Daily")).toBeInTheDocument();
    expect(screen.getByText("Cat Nutrition Basics")).toBeInTheDocument();
  });

  it("shows Published / Draft status badges", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() => screen.getAllByTestId("tip-row"));
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows stat cards after load (Total, Published, Drafts, Featured)", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() => screen.getAllByTestId("tip-row"));
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getByText("Drafts")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("New Tip link is visible", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: [] });
    renderAdminTips();
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: /new tip/i })).toBeInTheDocument();
  });

  it("animal type and category pills are capitalised", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() => screen.getAllByTestId("tip-row"));
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("Grooming")).toBeInTheDocument();
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByText("Nutrition")).toBeInTheDocument();
  });

  it("clicking Delete opens confirmation modal", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() => screen.getAllByTestId("tip-row"));
    fireEvent.click(screen.getByLabelText("Delete Brush Your Dog Daily"));
    expect(screen.getByText("Delete tip?")).toBeInTheDocument();
    expect(screen.getByText(/will be permanently removed/)).toBeInTheDocument();
  });

  it("confirming delete calls tipsApi.deleteTip", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    render(
      <MemoryRouter>
        <AdminTips />
      </MemoryRouter>
    );
    await waitFor(() => screen.getAllByTestId("tip-row"));
    fireEvent.click(screen.getByLabelText("Delete Brush Your Dog Daily"));
    await waitFor(() => screen.getByText("Delete tip?"));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() =>
      expect(tipsApi.deleteTip).toHaveBeenCalledWith("tip1")
    );
  });

  it("toggleField calls tipsApi.updateTip when featured button clicked", async () => {
    tipsApi.getTipsAdmin.mockResolvedValue({ data: SAMPLE_TIPS });
    renderAdminTips();
    await waitFor(() => screen.getAllByTestId("tip-row"));
    // Find and click the star (featured) toggle for the first tip
    const featureButtons = screen.getAllByTitle(/unfeature|feature/i);
    fireEvent.click(featureButtons[0]);
    await waitFor(() =>
      expect(tipsApi.updateTip).toHaveBeenCalledWith(
        "tip1",
        { featured: false } // tip1 is currently featured:true, toggle → false
      )
    );
  });
});
