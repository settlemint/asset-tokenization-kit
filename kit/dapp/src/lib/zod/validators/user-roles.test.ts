import { describe, expect, it } from "vitest";
import {
  getUserRole,
  isUserRole,
  userRoleNames,
  userRoles,
} from "./user-roles";

describe("userRoles", () => {
  const validator = userRoles();

  describe("valid user roles", () => {
    it.each(userRoleNames.map((role) => [role]))(
      "should accept '%s'",
      (role) => {
        expect(validator.parse(role) as string).toBe(role);
      }
    );

    it("should accept all defined roles", () => {
      expect(validator.parse("admin") as string).toBe("admin");
      expect(validator.parse("investor") as string).toBe("investor");
      expect(validator.parse("issuer") as string).toBe("issuer");
      expect(validator.parse(undefined) as string).toBe("investor");
    });
  });

  describe("invalid user roles", () => {
    it("should reject invalid role names", () => {
      expect(() => validator.parse("superadmin")).toThrow();
      expect(() => validator.parse("moderator")).toThrow();
      expect(() => validator.parse("guest")).toThrow();
      expect(() => validator.parse("viewer")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Admin")).toThrow();
      expect(() => validator.parse("USER")).toThrow();
      expect(() => validator.parse("Issuer")).toThrow();
      expect(() => validator.parse("ADMIN")).toThrow();
    });

    it("should reject similar but incorrect values", () => {
      expect(() => validator.parse("admins")).toThrow();
      expect(() => validator.parse("users")).toThrow();
      expect(() => validator.parse("issuers")).toThrow();
      expect(() => validator.parse("administrator")).toThrow();
    });
  });

  describe("role hierarchy understanding", () => {
    it("should distinguish between different permission levels", () => {
      // Admin has highest permissions
      expect(validator.parse("admin") as string).toBe("admin");

      // Investor has standard permissions
      expect(validator.parse("investor") as string).toBe("investor");

      // Issuer has trusted issuer permissions
      expect(validator.parse("issuer") as string).toBe("issuer");
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("admin");
      // Test that the type is correctly inferred
      expect(result).toBe("admin");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("issuer");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("issuer");
      }
    });
  });
});

describe("getUserRole function", () => {
  describe("getUserRole", () => {
    it("should return valid user roles", () => {
      expect(getUserRole("admin") as string).toBe("admin");
      expect(getUserRole("investor") as string).toBe("investor");
      expect(getUserRole("issuer") as string).toBe("issuer");
    });

    it("should throw for invalid user roles", () => {
      expect(() => getUserRole("superadmin")).toThrow();
      expect(() => getUserRole("moderator")).toThrow();
      expect(() => getUserRole("guest")).toThrow();
      expect(() => getUserRole("viewer")).toThrow();
      expect(() => getUserRole("")).toThrow();
      expect(() => getUserRole(123)).toThrow();
      expect(() => getUserRole(null)).toThrow();
      expect(() => getUserRole({})).toThrow();
      expect(() => getUserRole("Admin")).toThrow();
      expect(() => getUserRole("USER")).toThrow();
    });
  });
});

describe("isUserRole", () => {
  it("should return true for valid user roles", () => {
    expect(isUserRole("admin")).toBe(true);
    expect(isUserRole("investor")).toBe(true);
    expect(isUserRole("issuer")).toBe(true);
  });

  it("should return false for invalid user roles", () => {
    expect(isUserRole("superadmin")).toBe(false);
    expect(isUserRole("moderator")).toBe(false);
    expect(isUserRole("guest")).toBe(false);
    expect(isUserRole("")).toBe(false);
    expect(isUserRole(null)).toBe(false);
    expect(isUserRole(123)).toBe(false);
    expect(isUserRole({})).toBe(false);
    expect(isUserRole([])).toBe(false);
    expect(isUserRole("Admin")).toBe(false);
    expect(isUserRole("INVESTOR")).toBe(false);
  });

  it("should handle undefined by returning true (defaults to investor)", () => {
    // The userRoles schema has a default value of "investor" for undefined
    expect(isUserRole(undefined)).toBe(true);
  });

  it("should work as a type guard", () => {
    const value: unknown = "admin";
    if (isUserRole(value)) {
      // TypeScript should recognize value as UserRole here
      const validRole: "admin" | "investor" | "issuer" = value;
      expect(validRole).toBe("admin");
    }
  });
});
