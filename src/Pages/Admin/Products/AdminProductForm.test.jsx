import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("../../../Components/RichText", () => ({
  RichTextEditor: ({ value }) => <textarea data-testid="rte" defaultValue={value} />,
}));
vi.mock("../../../Components/Admin/ImageManager/ImageManager", () => ({
  default: () => <div data-testid="image-manager" />,
}));
vi.mock("../../../Services/api/announcementsApi", () => ({
  default: { createAnnouncement: vi.fn() },
}));

import { api } from "@/core/api/apiClient";
import AdminProductForm from "./AdminProductForm";

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={["/admin/products/new"]}>
      <AdminProductForm />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({
    data: { data: { categories: ["dogs", "reptiles"], colors: ["red"], genders: [], optionNames: ["Weight"] } },
  });
});

describe("AdminProductForm — option matrix", () => {
  it("renders in create mode with the flat variant editor", () => {
    renderForm();
    expect(screen.getByText("+ Add variant")).toBeTruthy();
    expect(screen.getByText("+ Add option")).toBeTruthy();
  });

  it("adding an axis with values generates combination rows", () => {
    renderForm();
    fireEvent.click(screen.getByText("+ Add option"));

    const nameInput = screen.getByPlaceholderText("Option name (e.g. Weight)");
    fireEvent.change(nameInput, { target: { value: "Weight" } });

    const valueInput = screen.getByPlaceholderText("Type a value and press Enter… (e.g. 5kg)");
    fireEvent.change(valueInput, { target: { value: "5kg" } });
    fireEvent.keyDown(valueInput, { key: "Enter" });
    fireEvent.change(valueInput, { target: { value: "10kg" } });
    fireEvent.keyDown(valueInput, { key: "Enter" });

    // Two combination rows with derived read-only labels
    const comboLabels = [...document.querySelectorAll(".apf-combo-label")].map((el) => el.textContent);
    expect(comboLabels).toEqual(["5kg", "10kg"]);
    // Flat "+ Add variant" is replaced by the combinations header
    expect(screen.queryByText("+ Add variant")).toBeNull();
    expect(screen.getByText(/Combinations \(price & stock per combination\)/)).toBeTruthy();
  });

  it("merges fetched attribute values into quick-pick suggestions", async () => {
    renderForm();
    expect(await screen.findByText("+ Reptiles")).toBeTruthy();
    expect(await screen.findByText("+ red")).toBeTruthy();
  });
});
