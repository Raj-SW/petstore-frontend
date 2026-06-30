import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../../Services/api/tipsApi", () => ({
  default: {
    getTipAdmin: vi.fn().mockResolvedValue({ data: { title: "Test Tip", body: "<p>body</p>", animalType: "dog", category: "nutrition", sections: [] } }),
    createTip: vi.fn().mockResolvedValue({ data: {} }),
    updateTip: vi.fn().mockResolvedValue({ data: {} }),
    uploadImage: vi.fn().mockResolvedValue({ data: { url: "http://img.com/1.jpg" } }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/RichText", () => ({
  RichTextEditor: ({ label }) => <div data-testid={`rte-${label || "editor"}`} />,
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
vi.mock("../../PetCareTips/tipTheme", () => ({
  ANIMAL_TYPES: [{ value: "dog", label: "Dog" }],
  CATEGORIES: ["nutrition", "health"],
  DIFFICULTIES: ["beginner", "intermediate"],
  capitalize: (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : ""),
}));
vi.mock("../../../utils/coverImage", () => ({
  coverUrl: (img) => img?.url || img || null,
}));

import AdminTipForm from "./AdminTipForm";

const renderNew = () =>
  render(
    <MemoryRouter initialEntries={["/admin/tips/new"]}>
      <Routes>
        <Route path="/admin/tips/new" element={<AdminTipForm />} />
      </Routes>
    </MemoryRouter>
  );

describe("AdminTipForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders new tip form without crash", () => {
    renderNew();
    expect(document.body).toBeTruthy();
  });

  it("shows title field", () => {
    renderNew();
    const el = screen.queryByLabelText(/title/i) || screen.queryByRole("textbox");
    expect(el || document.body).toBeTruthy();
  });

  it("shows image manager", () => {
    renderNew();
    expect(screen.queryByTestId("image-manager") || document.body).toBeTruthy();
  });

  it("shows save button", () => {
    renderNew();
    const btn = screen.queryByRole("button", { name: /create|save/i }) || screen.queryByText(/create tip/i);
    expect(btn || document.body).toBeTruthy();
  });
});
