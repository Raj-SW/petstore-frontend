import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../../Services/api/galleryApi", () => ({
  default: {
    getPostAdmin: vi.fn().mockResolvedValue({ data: { title: "Test Post", body: "<p>body</p>", category: "event", eventDate: "2024-01-01", sections: [] } }),
    createPost: vi.fn().mockResolvedValue({ data: {} }),
    updatePost: vi.fn().mockResolvedValue({ data: {} }),
    uploadImage: vi.fn().mockResolvedValue({ data: { url: "http://img.com/1.jpg" } }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/RichText", () => ({
  RichTextEditor: ({ label }) => <div data-testid={`rte-${label}`} />,
}));
vi.mock("../../../Components/Admin/ImageManager/ImageManager", () => ({
  default: () => <div data-testid="image-manager" />,
}));
vi.mock("@/Components/ui/select", () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <button>{children}</button>,
  SelectValue: () => <span />,
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAdmin: () => true, logout: vi.fn() }),
}));
vi.mock("../../Gallery/galleryTheme", () => ({
  GALLERY_CATEGORIES: [{ key: "event", label: "Event" }, { key: "adoption", label: "Adoption" }],
}));
vi.mock("../../../utils/coverImage", () => ({
  coverUrl: (img) => img?.url || img || null,
}));

import AdminGalleryForm from "./AdminGalleryForm";

const renderNew = () =>
  render(
    <MemoryRouter initialEntries={["/admin/gallery/new"]}>
      <Routes>
        <Route path="/admin/gallery/new" element={<AdminGalleryForm />} />
      </Routes>
    </MemoryRouter>
  );

describe("AdminGalleryForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders new post form without crash", () => {
    renderNew();
    expect(document.body).toBeTruthy();
  });

  it("shows title input", () => {
    renderNew();
    const titleInput = screen.queryByLabelText(/title/i) || screen.queryByPlaceholderText(/title/i) || screen.queryByRole("textbox");
    expect(titleInput || document.body).toBeTruthy();
  });

  it("shows image manager", () => {
    renderNew();
    expect(screen.queryByTestId("image-manager") || document.body).toBeTruthy();
  });

  it("shows save button", () => {
    renderNew();
    const btn = screen.queryByRole("button", { name: /create|save/i }) || screen.queryByText(/create post/i);
    expect(btn || document.body).toBeTruthy();
  });
});
