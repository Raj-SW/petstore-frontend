import { describe, it, expect } from "vitest";
import User from "./User";

describe("User entity", () => {
  describe("constructor defaults", () => {
    it("creates with empty defaults when no data", () => {
      const u = new User();
      expect(u.id).toBe("");
      expect(u.name).toBe("");
      expect(u.email).toBe("");
      expect(u.phoneNumber).toBe("");
      expect(u.address).toBe("");
      expect(u.role).toBe("customer");
      expect(u.isEmailVerified).toBe(false);
      expect(u.createdAt).toBeInstanceOf(Date);
      expect(u.updatedAt).toBeInstanceOf(Date);
    });

    it("maps _id to id", () => {
      const u = new User({ _id: "abc123" });
      expect(u.id).toBe("abc123");
    });

    it("maps all fields", () => {
      const now = new Date().toISOString();
      const u = new User({
        _id: "u1",
        name: "Alice",
        email: "alice@test.com",
        phoneNumber: "+123",
        address: "123 Main St",
        role: "admin",
        isEmailVerified: true,
        createdAt: now,
        updatedAt: now,
      });
      expect(u.name).toBe("Alice");
      expect(u.email).toBe("alice@test.com");
      expect(u.phoneNumber).toBe("+123");
      expect(u.address).toBe("123 Main St");
      expect(u.role).toBe("admin");
      expect(u.isEmailVerified).toBe(true);
      expect(u.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("toJSON()", () => {
    it("returns plain object with _id key", () => {
      const u = new User({ _id: "x1", name: "Bob", email: "b@b.com" });
      const json = u.toJSON();
      expect(json._id).toBe("x1");
      expect(json.name).toBe("Bob");
      expect(json.email).toBe("b@b.com");
      expect(typeof json.createdAt).toBe("string");
    });
  });

  describe("validate()", () => {
    it("returns empty array for valid user", () => {
      const u = new User({ name: "Alice", email: "a@b.com", phoneNumber: "123", address: "addr" });
      expect(u.validate()).toHaveLength(0);
    });

    it("requires name", () => {
      const u = new User({ email: "a@b.com", phoneNumber: "1", address: "a" });
      expect(u.validate()).toContain("Name is required");
    });

    it("requires email", () => {
      const u = new User({ name: "A", phoneNumber: "1", address: "a" });
      expect(u.validate()).toContain("Email is required");
    });

    it("rejects invalid email format", () => {
      const u = new User({ name: "A", email: "notanemail", phoneNumber: "1", address: "a" });
      expect(u.validate()).toContain("Invalid email format");
    });

    it("requires phone number", () => {
      const u = new User({ name: "A", email: "a@b.com", address: "a" });
      expect(u.validate()).toContain("Phone number is required");
    });

    it("requires address", () => {
      const u = new User({ name: "A", email: "a@b.com", phoneNumber: "1" });
      expect(u.validate()).toContain("Address is required");
    });

    it("returns multiple errors", () => {
      const u = new User();
      const errors = u.validate();
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe("static fromJSON()", () => {
    it("creates a User instance", () => {
      const u = User.fromJSON({ _id: "y1", name: "Carol" });
      expect(u).toBeInstanceOf(User);
      expect(u.name).toBe("Carol");
    });
  });
});
