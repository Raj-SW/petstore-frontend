import { describe, it, expect, vi } from "vitest";
import {
  validationRules,
  validationMessages,
  createValidator,
  commonValidations,
  formatFieldName,
} from "./validation";

describe("validationRules", () => {
  describe("required", () => {
    it("rejects null/undefined/empty string", () => {
      expect(validationRules.required(null)).toBe(false);
      expect(validationRules.required(undefined)).toBe(false);
      expect(validationRules.required("")).toBe(false);
    });
    it("accepts non-empty scalar values", () => {
      expect(validationRules.required("x")).toBe(true);
      expect(validationRules.required(0)).toBe(true);
      expect(validationRules.required(false)).toBe(true);
    });
    it("treats arrays/objects by their contents", () => {
      expect(validationRules.required([])).toBe(false);
      expect(validationRules.required([1])).toBe(true);
      expect(validationRules.required({})).toBe(false);
      expect(validationRules.required({ a: 1 })).toBe(true);
    });
  });

  describe("email", () => {
    it("accepts well-formed addresses", () => {
      expect(validationRules.email("a@b.co")).toBe(true);
    });
    it("rejects malformed addresses", () => {
      expect(validationRules.email("a@b")).toBe(false);
      expect(validationRules.email("nope")).toBe(false);
      expect(validationRules.email("a b@c.d")).toBe(false);
    });
  });

  describe("minLength / maxLength", () => {
    it("minLength enforces a lower bound", () => {
      expect(validationRules.minLength(3)("abc")).toBe(true);
      expect(validationRules.minLength(3)("ab")).toBe(false);
    });
    it("maxLength passes when empty or within bound", () => {
      expect(validationRules.maxLength(3)("")).toBe(true);
      expect(validationRules.maxLength(3)("abc")).toBe(true);
      expect(validationRules.maxLength(3)("abcd")).toBe(false);
    });
  });

  describe("pattern", () => {
    it("passes empty values and matching values", () => {
      expect(validationRules.pattern(/^x+$/)("")).toBe(true);
      expect(validationRules.pattern(/^x+$/)("xxx")).toBe(true);
      expect(validationRules.pattern(/^x+$/)("xy")).toBe(false);
    });
  });

  describe("numeric / alphanumeric", () => {
    it("numeric allows empty or digit-only", () => {
      expect(validationRules.numeric("")).toBe(true);
      expect(validationRules.numeric("123")).toBe(true);
      expect(validationRules.numeric("12a")).toBe(false);
    });
    it("alphanumeric allows empty or letters+digits", () => {
      expect(validationRules.alphanumeric("")).toBe(true);
      expect(validationRules.alphanumeric("abc123")).toBe(true);
      expect(validationRules.alphanumeric("ab-12")).toBe(false);
    });
  });

  describe("phoneNumber", () => {
    it("accepts empty and common formats", () => {
      expect(validationRules.phoneNumber("")).toBe(true);
      expect(validationRules.phoneNumber("123-456-7890")).toBe(true);
      expect(validationRules.phoneNumber("(123) 456-7890")).toBe(true);
      expect(validationRules.phoneNumber("+123 456 7890")).toBe(true);
    });
    it("rejects clearly invalid numbers", () => {
      expect(validationRules.phoneNumber("abc")).toBe(false);
      expect(validationRules.phoneNumber("12")).toBe(false);
    });
  });

  describe("url", () => {
    it("accepts absolute URLs, rejects junk", () => {
      expect(validationRules.url("https://x.io")).toBe(true);
      expect(validationRules.url("not a url")).toBe(false);
      expect(validationRules.url("")).toBe(false);
    });
  });

  describe("min / max", () => {
    it("min passes empty or numbers >= bound", () => {
      expect(validationRules.min(5)("")).toBe(true);
      expect(validationRules.min(5)("5")).toBe(true);
      expect(validationRules.min(5)("4")).toBe(false);
    });
    it("max passes empty or numbers <= bound", () => {
      expect(validationRules.max(5)("")).toBe(true);
      expect(validationRules.max(5)("5")).toBe(true);
      expect(validationRules.max(5)("6")).toBe(false);
    });
  });

  describe("matches", () => {
    it("compares against another field in allValues", () => {
      expect(validationRules.matches("password")("pw", { password: "pw" })).toBe(
        true,
      );
      expect(
        validationRules.matches("password")("pw", { password: "other" }),
      ).toBe(false);
    });
  });
});

describe("validationMessages", () => {
  it("interpolates field names and params", () => {
    expect(validationMessages.required("Email")).toBe("Email is required");
    expect(validationMessages.minLength("Name", 2)).toBe(
      "Name must be at least 2 characters",
    );
    expect(validationMessages.matches("Confirm", "Password")).toBe(
      "Confirm must match Password",
    );
  });
});

describe("createValidator", () => {
  it("returns no errors when all rules pass", () => {
    const validate = createValidator({
      email: [{ validator: "required" }, { validator: "email" }],
    });
    expect(validate({ email: "a@b.co" })).toEqual({});
  });

  it("returns the first failing rule's message per field", () => {
    const validate = createValidator({
      email: [
        { validator: "required", message: "Email required" },
        { validator: "email", message: "Bad email" },
      ],
    });
    expect(validate({ email: "" })).toEqual({ email: "Email required" });
    expect(validate({ email: "nope" })).toEqual({ email: "Bad email" });
  });

  it("passes params to parameterized validators", () => {
    const validate = createValidator({
      pw: [{ validator: "minLength", params: [6], message: "Too short" }],
    });
    expect(validate({ pw: "12345" })).toEqual({ pw: "Too short" });
    expect(validate({ pw: "123456" })).toEqual({});
  });

  it("supports inline function validators with access to all values", () => {
    const validate = createValidator({
      confirm: [
        {
          validator: (value, all) => value === all.password,
          message: "Mismatch",
        },
      ],
    });
    expect(validate({ password: "a", confirm: "b" })).toEqual({
      confirm: "Mismatch",
    });
    expect(validate({ password: "a", confirm: "a" })).toEqual({});
  });

  it("falls back to a generated message when none is provided", () => {
    const validate = createValidator({
      email: [{ validator: "email" }],
    });
    expect(validate({ email: "bad" })).toEqual({
      email: "Please enter a valid email address",
    });
  });

  it("warns and skips unknown validators", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const validate = createValidator({ x: [{ validator: "nope" }] });
    expect(validate({ x: "" })).toEqual({});
    expect(warn).toHaveBeenCalledWith("Unknown validator: nope");
    warn.mockRestore();
  });
});

describe("commonValidations.signupSchema (integration through createValidator)", () => {
  const validate = createValidator(commonValidations.signupSchema);

  it("flags multiple invalid fields", () => {
    const errors = validate({
      name: "A",
      email: "bad",
      password: "short",
      confirmPassword: "nope",
      phoneNumber: "abc",
      address: "",
    });
    expect(errors.name).toBe("Name must be at least 2 characters");
    expect(errors.email).toBe("Please enter a valid email address");
    expect(errors.password).toBe("Password must be at least 8 characters");
    expect(errors.confirmPassword).toBe("Passwords do not match");
    expect(errors.phoneNumber).toBe("Please enter a valid phone number");
    expect(errors.address).toBe("Address is required");
  });

  it("passes a fully valid signup payload", () => {
    expect(
      validate({
        name: "Alice",
        email: "alice@example.com",
        password: "supersecret",
        confirmPassword: "supersecret",
        phoneNumber: "123-456-7890",
        address: "1 Main St",
      }),
    ).toEqual({});
  });
});

describe("formatFieldName", () => {
  it("splits camelCase and capitalizes", () => {
    expect(formatFieldName("firstName")).toBe("First Name");
    expect(formatFieldName("confirmPassword")).toBe("Confirm Password");
    expect(formatFieldName("email")).toBe("Email");
  });
});
