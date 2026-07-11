import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatableTagSelect from "./CreatableTagSelect";

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const OPTIONS = ["dogs", "cats", "fish", "birds"];

const setup = (props = {}) => {
  const onChange = vi.fn();
  render(
    <CreatableTagSelect
      value={props.value ?? []}
      onChange={onChange}
      options={OPTIONS}
      placeholder="Pick or create…"
      label="Test Field"
      {...props}
      onChange={onChange}
    />
  );
  return { onChange, input: screen.getByRole("combobox") };
};

// ── Rendering ────────────────────────────────────────────────────────────────

describe("CreatableTagSelect — rendering", () => {
  it("renders the label", () => {
    setup();
    expect(screen.getByText("Test Field")).toBeTruthy();
  });

  it("shows required asterisk when required prop is set", () => {
    setup({ required: true });
    expect(screen.getByText("*")).toBeTruthy();
  });

  it("renders selected values as tag pills", () => {
    setup({ value: ["dogs", "cats"] });
    expect(screen.getByText("dogs")).toBeTruthy();
    expect(screen.getByText("cats")).toBeTruthy();
  });

  it("renders placeholder when no value selected", () => {
    setup();
    expect(screen.getByPlaceholderText("Pick or create…")).toBeTruthy();
  });

  it("shows 'Add more…' placeholder when values are selected", () => {
    setup({ value: ["dogs"] });
    expect(screen.getByPlaceholderText("Add more…")).toBeTruthy();
  });

  it("renders hint text when provided", () => {
    setup({ hint: "Press Enter to add" });
    expect(screen.getByText("Press Enter to add")).toBeTruthy();
  });
});

// ── Dropdown open / close ─────────────────────────────────────────────────────

describe("CreatableTagSelect — dropdown", () => {
  it("dropdown is closed initially", () => {
    setup();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens dropdown on input click", () => {
    const { input } = setup();
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("shows all options when opened with no input", () => {
    const { input } = setup();
    fireEvent.focus(input);
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(OPTIONS.length);
  });

  it("excludes already-selected values from the dropdown", () => {
    const { input } = setup({ value: ["dogs"] });
    fireEvent.focus(input);
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(OPTIONS.length - 1);
    expect(screen.queryByText("dogs", { selector: "[role=option]" })).toBeNull();
  });

  it("closes dropdown on Escape", () => {
    const { input } = setup();
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes dropdown on outside click", async () => {
    const { input } = setup();
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});

// ── Filtering ─────────────────────────────────────────────────────────────────

describe("CreatableTagSelect — filtering", () => {
  it("filters options as user types", () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ca" } });
    const items = screen.getAllByRole("option");
    // "cats" matches; also "Create" option since no exact match
    const labels = items.map((el) => el.textContent);
    expect(labels.some((l) => l.includes("cats"))).toBe(true);
    expect(labels.every((l) => l.includes("cats") || l.includes("Create"))).toBe(true);
  });

  it("shows Create option when input has no exact match", () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rabbits" } });
    expect(screen.getByText(/Create/)).toBeTruthy();
    expect(screen.getByText(/"rabbits"/)).toBeTruthy();
  });

  it("does NOT show Create when input exactly matches an existing option (case-insensitive)", () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Dogs" } });
    expect(screen.queryByText(/Create/)).toBeNull();
  });

  it("does NOT show Create when input matches an already-selected value", () => {
    const { input } = setup({ value: ["rabbits"] });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rabbits" } });
    expect(screen.queryByText(/Create/)).toBeNull();
  });
});

// ── Adding values ─────────────────────────────────────────────────────────────

describe("CreatableTagSelect — adding values", () => {
  it("clicking an option calls onChange with it appended", () => {
    const { input, onChange } = setup({ value: ["dogs"] });
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByText("cats"));
    expect(onChange).toHaveBeenCalledWith(["dogs", "cats"]);
  });

  it("pressing Enter adds the highlighted option", () => {
    const { input, onChange } = setup();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Enter" });
    // First option (dogs) was highlighted
    expect(onChange).toHaveBeenCalledWith(["dogs"]);
  });

  it("pressing Enter on Create option calls onChange with the typed value", () => {
    const { input, onChange } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rabbits" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["rabbits"]);
  });

  it("pressing comma adds the current input as a new value", () => {
    const { input, onChange } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "hamsters" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["hamsters"]);
  });

  it("clears input after adding a value", () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rabbits" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });
});

// ── Removing values ───────────────────────────────────────────────────────────

describe("CreatableTagSelect — removing values", () => {
  it("clicking the × button on a tag calls onChange without that value", () => {
    const { onChange } = setup({ value: ["dogs", "cats"] });
    fireEvent.click(screen.getByLabelText("Remove dogs"));
    expect(onChange).toHaveBeenCalledWith(["cats"]);
  });

  it("pressing Backspace on empty input removes the last tag", () => {
    const { input, onChange } = setup({ value: ["dogs", "cats"] });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["dogs"]);
  });

  it("pressing Backspace with text in input does NOT remove a tag", () => {
    const { input, onChange } = setup({ value: ["dogs"] });
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ── Duplicate prevention ──────────────────────────────────────────────────────

describe("CreatableTagSelect — duplicates", () => {
  it("does not add a value already in the list (case-insensitive)", () => {
    const { input, onChange } = setup({ value: ["dogs"] });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Dogs" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ── Keyboard navigation ───────────────────────────────────────────────────────

describe("CreatableTagSelect — keyboard navigation", () => {
  it("ArrowDown moves highlight to the next item", () => {
    const { input, onChange } = setup();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    // Second option (cats) should be selected
    expect(onChange).toHaveBeenCalledWith(["cats"]);
  });

  it("ArrowUp does not go below index 0", () => {
    const { input, onChange } = setup();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowUp" }); // already at 0
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["dogs"]); // still first
  });
});
