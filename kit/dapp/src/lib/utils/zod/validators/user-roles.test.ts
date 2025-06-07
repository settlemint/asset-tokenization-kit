import { describe, expect, it } from "bun:test";
import {
  getUserRole,
  isUserRole,
  userRoleNames,
  userRoles,
  type UserRole,
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
      expect(validator.parse("user") as string).toBe("user");
      expect(validator.parse("viewer") as string).toBe("viewer");
    });
  });

  describe("invalid user roles", () => {
    it("should reject invalid role names", () => {
      expect(() => validator.parse("superadmin")).toThrow();
      expect(() => validator.parse("moderator")).toThrow();
      expect(() => validator.parse("guest")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Admin")).toThrow();
      expect(() => validator.parse("USER")).toThrow();
      expect(() => validator.parse("Viewer")).toThrow();
      expect(() => validator.parse("ADMIN")).toThrow();
    });

    it("should reject similar but incorrect values", () => {
      expect(() => validator.parse("admins")).toThrow();
      expect(() => validator.parse("users")).toThrow();
      expect(() => validator.parse("view")).toThrow();
      expect(() => validator.parse("administrator")).toThrow();
    });
  });

  describe("role hierarchy understanding", () => {
    it("should distinguish between different permission levels", () => {
      // Admin has highest permissions
      expect(validator.parse("admin") as string).toBe("admin");

      // User has standard permissions
      expect(validator.parse("user") as string).toBe("user");

      // Viewer has read-only permissions
      expect(validator.parse("viewer") as string).toBe("viewer");
    });
  });
});

describe("helper functions", () => {
  describe("isUserRole", () => {
    it("should return true for valid user roles", () => {
      expect(isUserRole("admin")).toBe(true);
      expect(isUserRole("user")).toBe(true);
      expect(isUserRole("viewer")).toBe(true);
    });

    it("should return false for invalid user roles", () => {
      expect(isUserRole("superadmin")).toBe(false);
      expect(isUserRole("moderator")).toBe(false);
      expect(isUserRole("guest")).toBe(false);
      expect(isUserRole("")).toBe(false);
      expect(isUserRole(123)).toBe(false);
      expect(isUserRole(null)).toBe(false);
      expect(isUserRole(undefined)).toBe(false);
      expect(isUserRole({})).toBe(false);
      expect(isUserRole([])).toBe(false);
      expect(isUserRole("Admin")).toBe(false); // wrong case
      expect(isUserRole("USER")).toBe(false);
      expect(isUserRole("admins")).toBe(false); // plural
      expect(isUserRole("administrator")).toBe(false); // different word
    });

    it("should narrow types correctly", () => {
      const value: unknown = "admin";
      if (isUserRole(value)) {
        // Type should be narrowed to UserRole
        const role: UserRole = value;
        expect(role as string).toBe("admin");
      }
    });
  });

  describe("getUserRole", () => {
    it("should return valid user roles", () => {
      expect(getUserRole("admin") as string).toBe("admin");
      expect(getUserRole("user") as string).toBe("user");
      expect(getUserRole("viewer") as string).toBe("viewer");
    });

    it("should throw for invalid user roles", () => {
      expect(() => getUserRole("superadmin")).toThrow();
      expect(() => getUserRole("moderator")).toThrow();
      expect(() => getUserRole("guest")).toThrow();
      expect(() => getUserRole("")).toThrow();
      expect(() => getUserRole(123)).toThrow("Expected 'admin' | 'user' | 'viewer', received number");
      expect(() => getUserRole(null)).toThrow("Expected 'admin' | 'user' | 'viewer', received null");
      expect(() => getUserRole(undefined)).toThrow("Required");
      expect(() => getUserRole({})).toThrow("Expected 'admin' | 'user' | 'viewer', received object");
      expect(() => getUserRole("Admin")).toThrow();
      expect(() => getUserRole("USER")).toThrow();
    });
  });
});
