import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// --- Mocks (hoisted) ---
vi.mock("../../../Services/api/feedbackApi", () => ({
  default: {
    getFeedbackAdmin: vi.fn(),
    updateFeedback: vi.fn().mockResolvedValue({ success: true }),
    deleteFeedback: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../../../Components/Admin/DataTable/DataTable", () => ({
  default: ({ data, loading, columns, onView, onDelete }) => {
    if (loading) return <div data-testid="loading">Loading…</div>;
    return (
      <table>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} data-testid="feedback-row">
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
              <td>
                {onView && (
                  <button onClick={() => onView(row)} aria-label={`View ${row.name}`}>
                    View
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} aria-label={`Delete ${row.name}`}>
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

// ImageManager is used inside the view modal — stub it out
vi.mock("../../../Components/Admin/ImageManager/ImageManager", () => ({
  default: () => <div data-testid="image-manager" />,
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

import feedbackApi from "../../../Services/api/feedbackApi";
import AdminFeedback from "./AdminFeedback";

const SAMPLE_FEEDBACK = [
  {
    _id: "fb1",
    name: "Jane Doe",
    role: "Pet Owner",
    rating: 5,
    message: "Absolutely love the service! My dog is always happy.",
    photos: [],
    approved: true,
    createdAt: new Date("2024-03-01").toISOString(),
  },
  {
    _id: "fb2",
    name: "John Smith",
    role: "Cat Lover",
    rating: 3,
    message: "Decent service, could be faster.",
    photos: [{ url: "http://example.com/photo.jpg", publicId: "abc" }],
    approved: false,
    createdAt: new Date("2024-03-10").toISOString(),
  },
];

describe("AdminFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing and shows page title", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: [] });
    render(<AdminFeedback />);
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    feedbackApi.getFeedbackAdmin.mockReturnValue(new Promise(() => {}));
    render(<AdminFeedback />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders feedback rows after API resolves", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() =>
      expect(screen.getAllByTestId("feedback-row")).toHaveLength(2)
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
  });

  it("shows approved/pending status badges", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });

  it("renders star ratings for each feedback item", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    expect(screen.getByLabelText("5 out of 5 stars")).toBeInTheDocument();
    expect(screen.getByLabelText("3 out of 5 stars")).toBeInTheDocument();
  });

  it("shows stat cards after load (Total, Pending, Approved)", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
  });

  it("clicking Delete opens confirmation modal", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    fireEvent.click(screen.getByLabelText("Delete Jane Doe"));
    expect(screen.getByText("Delete feedback?")).toBeInTheDocument();
  });

  it("confirming delete calls feedbackApi.deleteFeedback", async () => {
    feedbackApi.getFeedbackAdmin.mockResolvedValue({ data: SAMPLE_FEEDBACK });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    fireEvent.click(screen.getByLabelText("Delete Jane Doe"));
    await waitFor(() => screen.getByText("Delete feedback?"));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() =>
      expect(feedbackApi.deleteFeedback).toHaveBeenCalledWith("fb1")
    );
  });

  it("message snippet is truncated beyond 80 chars", async () => {
    const longMsg =
      "This is a very long message that definitely exceeds eighty characters total in length here.";
    feedbackApi.getFeedbackAdmin.mockResolvedValue({
      data: [{ ...SAMPLE_FEEDBACK[0], message: longMsg }],
    });
    render(<AdminFeedback />);
    await waitFor(() => screen.getAllByTestId("feedback-row"));
    const snippet = longMsg.slice(0, 80) + "…";
    expect(screen.getByText(snippet)).toBeInTheDocument();
  });
});
