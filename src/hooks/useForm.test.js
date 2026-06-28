import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useForm from "./useForm";

const change = (name, value, type = "text", checked = false) => ({
  target: { name, value, type, checked },
});

describe("useForm", () => {
  it("initializes with the given values and empty meta", () => {
    const { result } = renderHook(() => useForm({ email: "a@b.co" }));
    expect(result.current.values).toEqual({ email: "a@b.co" });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("handleChange updates text and checkbox fields", () => {
    const { result } = renderHook(() => useForm({ name: "", agree: false }));

    act(() => result.current.handleChange(change("name", "Bob")));
    expect(result.current.values.name).toBe("Bob");

    act(() =>
      result.current.handleChange(change("agree", "", "checkbox", true)),
    );
    expect(result.current.values.agree).toBe(true);
  });

  it("handleChange clears an existing error for that field", () => {
    const { result } = renderHook(() => useForm({ name: "" }));
    act(() => result.current.setFieldError("name", "Required"));
    expect(result.current.errors.name).toBe("Required");

    act(() => result.current.handleChange(change("name", "x")));
    expect(result.current.errors.name).toBe("");
  });

  it("handleBlur marks touched and validates the single field", () => {
    const validate = vi.fn(({ email }) =>
      email ? {} : { email: "Required" },
    );
    const { result } = renderHook(() => useForm({ email: "" }, validate));

    act(() => result.current.handleBlur(change("email", "")));
    expect(result.current.touched.email).toBe(true);
    expect(validate).toHaveBeenCalledWith({ email: "" });
    expect(result.current.errors.email).toBe("Required");
  });

  it("validateForm sets all errors and returns validity", () => {
    const validate = (values) =>
      values.name ? {} : { name: "Required" };
    const { result } = renderHook(() => useForm({ name: "" }, validate));

    let valid;
    act(() => {
      valid = result.current.validateForm();
    });
    expect(valid).toBe(false);
    expect(result.current.errors.name).toBe("Required");
  });

  it("validateForm returns true when there is no validator", () => {
    const { result } = renderHook(() => useForm({ a: 1 }));
    let valid;
    act(() => {
      valid = result.current.validateForm();
    });
    expect(valid).toBe(true);
  });

  it("handleSubmit calls onSubmit and resets when valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const { result } = renderHook(() =>
      useForm({ name: "Bob" }, null, onSubmit),
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "Bob" });
    expect(result.current.values).toEqual({ name: "Bob" }); // reset to initial
    expect(result.current.isSubmitting).toBe(false);
  });

  it("handleSubmit does not call onSubmit when invalid", async () => {
    const onSubmit = vi.fn();
    const validate = () => ({ name: "Required" });
    const { result } = renderHook(() =>
      useForm({ name: "" }, validate, onSubmit),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.touched.name).toBe(true); // all fields marked touched
  });

  it("handleSubmit swallows onSubmit errors and logs them", async () => {
    const err = new Error("submit failed");
    const onSubmit = vi.fn().mockRejectedValue(err);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useForm({ name: "Bob" }, null, onSubmit),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).toHaveBeenCalledWith("Form submission error:", err);
    expect(result.current.isSubmitting).toBe(false);
    spy.mockRestore();
  });

  it("setFieldValue / resetForm work", () => {
    const { result } = renderHook(() => useForm({ a: 1 }));
    act(() => result.current.setFieldValue("a", 9));
    expect(result.current.values.a).toBe(9);

    act(() => result.current.resetForm({ a: 5 }));
    expect(result.current.values).toEqual({ a: 5 });
    expect(result.current.errors).toEqual({});
  });

  it("getFieldProps exposes value and only shows errors once touched", () => {
    const { result } = renderHook(() => useForm({ email: "x" }));
    act(() => result.current.setFieldError("email", "Bad"));

    let props = result.current.getFieldProps("email");
    expect(props.value).toBe("x");
    expect(props.error).toBe(""); // not touched yet

    act(() => result.current.handleBlur(change("email", "x")));
    props = result.current.getFieldProps("email");
    expect(props.error).toBe("Bad");
  });
});
