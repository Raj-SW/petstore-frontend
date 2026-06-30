import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// --- Mocks (hoisted) ---
vi.mock("../../../Services/api/faqsApi", () => ({
  default: {
    getFaqsAdmin: vi.fn(),
    createFaq: vi.fn().mockResolvedValue({ success: true }),
    updateFaq: vi.fn().mockResolvedValue({ success: true }),
    deleteFaq: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ data, loading, columns, onEdit, onDelete }) => {
    if (loading) return <div data-testid="loading">Loading…</div>;
    return (
      <table>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} data-testid="faq-row">
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
              <td>
                {onEdit && (
                  <button onClick={() => onEdit(row)} aria-label="Edit">
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} aria-label="Delete">
                    Delete
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

import faqsApi from "../../../Services/api/faqsApi";
import AdminFaqs from "./AdminFaqs";

const SAMPLE_FAQS = [
  {
    _id: "faq1",
    question: "Do you deliver island-wide?",
    answer: "Yes, we deliver to all major cities.",
    order: 1,
    active: true,
  },
  {
    _id: "faq2",
    question: "What payment methods do you accept?",
    answer: "We accept cash on delivery and card.",
    order: 2,
    active: false,
  },
];

describe("AdminFaqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing and shows title", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: [] });
    render(<AdminFaqs />);
    expect(screen.getByText("FAQs")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    faqsApi.getFaqsAdmin.mockReturnValue(new Promise(() => {}));
    render(<AdminFaqs />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders FAQ rows after data loads", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: SAMPLE_FAQS });
    render(<AdminFaqs />);
    await waitFor(() =>
      expect(screen.getAllByTestId("faq-row")).toHaveLength(2)
    );
    expect(screen.getByText("Do you deliver island-wide?")).toBeInTheDocument();
    expect(
      screen.getByText("What payment methods do you accept?")
    ).toBeInTheDocument();
  });

  it("shows Active/Hidden status badges", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: SAMPLE_FAQS });
    render(<AdminFaqs />);
    await waitFor(() => screen.getAllByTestId("faq-row"));
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });

  it("New FAQ button is visible", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: [] });
    render(<AdminFaqs />);
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /new faq/i })).toBeInTheDocument();
  });

  it("clicking New FAQ opens create modal", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: [] });
    render(<AdminFaqs />);
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /new faq/i }));
    expect(screen.getAllByText("New FAQ").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Question")).toBeInTheDocument();
    expect(screen.getByLabelText("Answer")).toBeInTheDocument();
  });

  it("clicking Edit opens edit modal with prefilled data", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: SAMPLE_FAQS });
    render(<AdminFaqs />);
    await waitFor(() => screen.getAllByTestId("faq-row"));
    // First Edit button
    fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);
    expect(screen.getByText("Edit FAQ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Do you deliver island-wide?")).toBeInTheDocument();
  });

  it("clicking Delete sets delete target and shows confirm modal", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: SAMPLE_FAQS });
    render(<AdminFaqs />);
    await waitFor(() => screen.getAllByTestId("faq-row"));
    fireEvent.click(screen.getAllByRole("button", { name: /^delete$/i })[0]);
    expect(screen.getByText("Delete FAQ?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^delete$/i }).length).toBeGreaterThan(0);
  });

  it("confirms delete calls faqsApi.deleteFaq", async () => {
    faqsApi.getFaqsAdmin.mockResolvedValue({ data: SAMPLE_FAQS });
    faqsApi.deleteFaq.mockResolvedValue({ success: true });
    render(<AdminFaqs />);
    await waitFor(() => screen.getAllByTestId("faq-row"));
    // Open delete modal
    fireEvent.click(screen.getAllByRole("button", { name: /^delete$/i })[0]);
    await waitFor(() => screen.getByText("Delete FAQ?"));
    // Confirm delete — pick the last delete button (the modal's danger button)
    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i });
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);
    await waitFor(() =>
      expect(faqsApi.deleteFaq).toHaveBeenCalledWith("faq1")
    );
  });
});
