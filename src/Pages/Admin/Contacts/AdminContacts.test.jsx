import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// --- Mocks (hoisted) ---
vi.mock("../../../Services/api/contactApi", () => ({
  default: {
    getContactsAdmin: vi.fn(),
    updateContact: vi.fn().mockResolvedValue({ success: true }),
    replyContact: vi.fn().mockResolvedValue({ success: true }),
    deleteContact: vi.fn().mockResolvedValue({ success: true }),
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
            <tr key={i} data-testid="contact-row">
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

import contactApi from "../../../Services/api/contactApi";
import AdminContacts from "./AdminContacts";

const SAMPLE_CONTACTS = [
  {
    _id: "c1",
    name: "Alice Brown",
    email: "alice@example.com",
    message: "I have a question about my order status and delivery timeline.",
    status: "new",
    createdAt: new Date("2024-04-01").toISOString(),
  },
  {
    _id: "c2",
    name: "Charlie Green",
    email: "charlie@example.com",
    message: "Can I change my subscription plan mid-cycle?",
    status: "replied",
    createdAt: new Date("2024-04-05").toISOString(),
  },
];

describe("AdminContacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing and shows page title", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: [] });
    render(<AdminContacts />);
    expect(screen.getByText("Contact Messages")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    contactApi.getContactsAdmin.mockReturnValue(new Promise(() => {}));
    render(<AdminContacts />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders contact rows after API resolves", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() =>
      expect(screen.getAllByTestId("contact-row")).toHaveLength(2)
    );
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    expect(screen.getByText("Charlie Green")).toBeInTheDocument();
  });

  it("shows empty list gracefully when no contacts", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: [] });
    render(<AdminContacts />);
    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
    );
    expect(screen.queryAllByTestId("contact-row")).toHaveLength(0);
  });

  it("renders status badges (new / replied)", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(screen.getByText("replied")).toBeInTheDocument();
  });

  it("shows stat cards (Total, Unread, Replied) after load", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
    expect(screen.getByText("Replied")).toBeInTheDocument();
  });

  it("clicking View opens view modal with contact details", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    fireEvent.click(screen.getByLabelText("View Alice Brown"));
    expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("I have a question about my order status and delivery timeline.").length
    ).toBeGreaterThan(0);
  });

  it("clicking Delete opens confirmation modal", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    fireEvent.click(screen.getByLabelText("Delete Alice Brown"));
    expect(screen.getByText("Delete message?")).toBeInTheDocument();
  });

  it("confirming delete calls contactApi.deleteContact", async () => {
    contactApi.getContactsAdmin.mockResolvedValue({ data: SAMPLE_CONTACTS });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    fireEvent.click(screen.getByLabelText("Delete Alice Brown"));
    await waitFor(() => screen.getByText("Delete message?"));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() =>
      expect(contactApi.deleteContact).toHaveBeenCalledWith("c1")
    );
  });

  it("message snippet is truncated beyond 60 chars", async () => {
    const longMsg =
      "This message is definitely longer than sixty characters total right here.";
    contactApi.getContactsAdmin.mockResolvedValue({
      data: [{ ...SAMPLE_CONTACTS[0], message: longMsg }],
    });
    render(<AdminContacts />);
    await waitFor(() => screen.getAllByTestId("contact-row"));
    const snippet = longMsg.slice(0, 60) + "…";
    expect(screen.getByText(snippet)).toBeInTheDocument();
  });
});
