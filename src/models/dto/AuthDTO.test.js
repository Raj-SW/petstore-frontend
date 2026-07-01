import { describe, it, expect } from "vitest";
import { LoginDTO, SignupDTO, PasswordResetDTO, PasswordChangeDTO } from "./AuthDTO";

describe("LoginDTO", () => {
  it("defaults empty fields", () => {
    const dto = new LoginDTO();
    expect(dto.username).toBe("");
    expect(dto.password).toBe("");
  });

  it("maps provided data", () => {
    const dto = new LoginDTO({ username: "alice", password: "secret" });
    expect(dto.username).toBe("alice");
    expect(dto.password).toBe("secret");
  });

  describe("validate()", () => {
    it("valid when both fields present", () => {
      const { isValid, errors } = new LoginDTO({ username: "u", password: "p" }).validate();
      expect(isValid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it("requires username", () => {
      const { isValid, errors } = new LoginDTO({ password: "p" }).validate();
      expect(isValid).toBe(false);
      expect(errors).toContain("Username is required");
    });

    it("requires password", () => {
      const { isValid, errors } = new LoginDTO({ username: "u" }).validate();
      expect(isValid).toBe(false);
      expect(errors).toContain("Password is required");
    });

    it("returns both errors when empty", () => {
      const { errors } = new LoginDTO().validate();
      expect(errors).toHaveLength(2);
    });
  });
});

describe("SignupDTO", () => {
  it("defaults empty fields", () => {
    const dto = new SignupDTO();
    expect(dto.username).toBe("");
    expect(dto.email).toBe("");
    expect(dto.password).toBe("");
    expect(dto.firstName).toBe("");
    expect(dto.lastName).toBe("");
  });

  it("maps all fields", () => {
    const dto = new SignupDTO({ username: "u", email: "e@e.com", password: "passw0rd", firstName: "F", lastName: "L" });
    expect(dto.username).toBe("u");
    expect(dto.email).toBe("e@e.com");
    expect(dto.firstName).toBe("F");
    expect(dto.lastName).toBe("L");
  });

  describe("validate()", () => {
    const valid = { username: "user1", email: "a@b.com", password: "secure123" };

    it("valid when required fields present", () => {
      const { isValid } = new SignupDTO(valid).validate();
      expect(isValid).toBe(true);
    });

    it("requires username", () => {
      const { errors } = new SignupDTO({ ...valid, username: "" }).validate();
      expect(errors).toContain("Username is required");
    });

    it("requires email", () => {
      const { errors } = new SignupDTO({ ...valid, email: "" }).validate();
      expect(errors).toContain("Email is required");
    });

    it("requires password", () => {
      const { errors } = new SignupDTO({ ...valid, password: "" }).validate();
      expect(errors).toContain("Password is required");
    });

    it("rejects invalid email format", () => {
      const { errors } = new SignupDTO({ ...valid, email: "badformat" }).validate();
      expect(errors).toContain("Invalid email format");
    });

    it("rejects short password", () => {
      const { errors } = new SignupDTO({ ...valid, password: "abc" }).validate();
      expect(errors).toContain("Password must be at least 6 characters long");
    });
  });
});

describe("PasswordResetDTO", () => {
  it("defaults empty email", () => {
    const dto = new PasswordResetDTO();
    expect(dto.email).toBe("");
  });

  it("maps email", () => {
    const dto = new PasswordResetDTO({ email: "x@y.com" });
    expect(dto.email).toBe("x@y.com");
  });

  describe("validate()", () => {
    it("valid with proper email", () => {
      const { isValid } = new PasswordResetDTO({ email: "x@y.com" }).validate();
      expect(isValid).toBe(true);
    });

    it("requires email", () => {
      const { errors } = new PasswordResetDTO().validate();
      expect(errors).toContain("Email is required");
    });

    it("rejects invalid email", () => {
      const { errors } = new PasswordResetDTO({ email: "nope" }).validate();
      expect(errors).toContain("Invalid email format");
    });
  });
});

describe("PasswordChangeDTO", () => {
  it("defaults empty passwords", () => {
    const dto = new PasswordChangeDTO();
    expect(dto.oldPassword).toBe("");
    expect(dto.newPassword).toBe("");
  });

  describe("validate()", () => {
    it("valid with both passwords", () => {
      const { isValid } = new PasswordChangeDTO({ oldPassword: "old123", newPassword: "new123" }).validate();
      expect(isValid).toBe(true);
    });

    it("requires old password", () => {
      const { errors } = new PasswordChangeDTO({ newPassword: "new123" }).validate();
      expect(errors).toContain("Current password is required");
    });

    it("requires new password", () => {
      const { errors } = new PasswordChangeDTO({ oldPassword: "old" }).validate();
      expect(errors).toContain("New password is required");
    });

    it("rejects short new password", () => {
      const { errors } = new PasswordChangeDTO({ oldPassword: "old", newPassword: "abc" }).validate();
      expect(errors).toContain("New password must be at least 6 characters long");
    });
  });
});
