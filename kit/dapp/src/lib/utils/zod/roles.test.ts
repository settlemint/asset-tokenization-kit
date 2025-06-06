import { describe, expect, it } from "bun:test";
import { z } from "zod/v4";
import {
  getRole,
  getRoleMap,
  isRole,
  isRoleMap,
  roleMap,
  roleNames,
  roles,
} from "./roles";

describe("roles", () => {
  const validator = roles();

  describe("valid roles", () => {
    it.each(roleNames.map((role) => [role]))("should accept '%s'", (role) => {
      expect(validator.parse(role) as string).toBe(role);
    });
  });

  describe("invalid roles", () => {
    it("should reject invalid role names", () => {
      expect(() => validator.parse("superadmin")).toThrow();
      expect(() => validator.parse("user")).toThrow();
      expect(() => validator.parse("viewer")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Admin")).toThrow();
      expect(() => validator.parse("MANAGER")).toThrow();
      expect(() => validator.parse("Investor")).toThrow();
    });
  });
});

describe("roleMap", () => {
  const validator = roleMap();

  describe("valid role maps", () => {
    it("should accept empty object", () => {
      expect(validator.parse({}) as any).toEqual({});
    });

    it("should accept single address to role mapping", () => {
      const map = {
        "0x1234567890123456789012345678901234567890": "admin",
      };
      expect(validator.parse(map) as any).toEqual(map);
    });

    it("should accept multiple address to role mappings", () => {
      const map = {
        "0x1234567890123456789012345678901234567890": "admin",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
        user123: "investor",
      };
      expect(validator.parse(map) as any).toEqual(map);
    });

    it("should accept all valid roles", () => {
      const map: Record<string, string> = {};
      roleNames.forEach((role, index) => {
        map[`address${index}`] = role;
      });
      expect(validator.parse(map) as any).toEqual(map);
    });
  });

  describe("invalid role maps", () => {
    it("should reject invalid role values", () => {
      expect(() =>
        validator.parse({
          address1: "superuser",
        })
      ).toThrow();
    });

    it("should reject non-string role values", () => {
      expect(() =>
        validator.parse({
          address1: 123,
        })
      ).toThrow();

      expect(() =>
        validator.parse({
          address1: null,
        })
      ).toThrow();
    });

    it("should reject arrays", () => {
      expect(() => validator.parse(["admin", "manager"])).toThrow();
    });

    it("should reject non-object types", () => {
      expect(() => validator.parse("admin")).toThrow();
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
    });
  });

  describe("mixed valid and invalid", () => {
    it("should reject if any role is invalid", () => {
      expect(() =>
        validator.parse({
          validAddress: "admin",
          invalidAddress: "superadmin",
        })
      ).toThrow();
    });
  });
});

describe("helper functions", () => {
  describe("isRole", () => {
    it("should return true for valid roles", () => {
      expect(isRole("admin")).toBe(true);
      expect(isRole("issuer")).toBe(true);
      expect(isRole("manager")).toBe(true);
      expect(isRole("compliance")).toBe(true);
      expect(isRole("auditor")).toBe(true);
      expect(isRole("investor")).toBe(true);
    });

    it("should return false for invalid roles", () => {
      expect(isRole("superadmin")).toBe(false);
      expect(isRole("user")).toBe(false);
      expect(isRole("viewer")).toBe(false);
      expect(isRole("")).toBe(false);
      expect(isRole(123)).toBe(false);
      expect(isRole(null)).toBe(false);
      expect(isRole(undefined)).toBe(false);
      expect(isRole({})).toBe(false);
      expect(isRole("Admin")).toBe(false);
      expect(isRole("MANAGER")).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = "admin";
      if (isRole(value)) {
        // Type should be narrowed to Role
        const role: z.infer<ReturnType<typeof roles>> = value;
        expect(role as string).toBe("admin");
      }
    });
  });

  describe("getRole", () => {
    it("should return valid roles", () => {
      expect(getRole("admin") as string).toBe("admin");
      expect(getRole("issuer") as string).toBe("issuer");
      expect(getRole("manager") as string).toBe("manager");
      expect(getRole("compliance") as string).toBe("compliance");
      expect(getRole("auditor") as string).toBe("auditor");
      expect(getRole("investor") as string).toBe("investor");
    });

    it("should throw for invalid roles", () => {
      expect(() => getRole("superadmin")).toThrow("Invalid role: superadmin");
      expect(() => getRole("user")).toThrow("Invalid role: user");
      expect(() => getRole("")).toThrow("Invalid role: ");
      expect(() => getRole(123)).toThrow("Invalid role: 123");
      expect(() => getRole(null)).toThrow("Invalid role: null");
      expect(() => getRole(undefined)).toThrow("Invalid role: undefined");
      expect(() => getRole({})).toThrow("Invalid role: [object Object]");
      expect(() => getRole("Admin")).toThrow("Invalid role: Admin");
    });
  });

  describe("isRoleMap", () => {
    it("should return true for valid role maps", () => {
      expect(isRoleMap({})).toBe(true);
      expect(isRoleMap({ "0x123": "admin" })).toBe(true);
      expect(
        isRoleMap({
          "0x1234567890123456789012345678901234567890": "admin",
          "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
          user123: "investor",
        })
      ).toBe(true);
    });

    it("should return false for invalid role maps", () => {
      expect(isRoleMap({ address1: "superuser" })).toBe(false);
      expect(isRoleMap({ address1: 123 })).toBe(false);
      expect(isRoleMap({ address1: null })).toBe(false);
      expect(isRoleMap(["admin", "manager"])).toBe(false);
      expect(isRoleMap("admin")).toBe(false);
      expect(isRoleMap(123)).toBe(false);
      expect(isRoleMap(null)).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = { "0x123": "admin" };
      if (isRoleMap(value)) {
        // Type should be narrowed to RoleMap
        const map: z.infer<ReturnType<typeof roleMap>> = value;
        expect(map as any).toEqual({ "0x123": "admin" });
      }
    });
  });

  describe("getRoleMap", () => {
    it("should return valid role maps", () => {
      expect(getRoleMap({})).toEqual({});
      expect(getRoleMap({ "0x123": "admin" }) as any).toEqual({
        "0x123": "admin",
      });
      expect(
        getRoleMap({
          "0x1234567890123456789012345678901234567890": "admin",
          "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
        }) as any
      ).toEqual({
        "0x1234567890123456789012345678901234567890": "admin",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
      });
    });

    it("should throw for invalid role maps", () => {
      expect(() => getRoleMap({ address1: "superuser" })).toThrow(
        "Invalid role map: [object Object]"
      );
      expect(() => getRoleMap({ address1: 123 })).toThrow(
        "Invalid role map: [object Object]"
      );
      expect(() => getRoleMap(["admin", "manager"])).toThrow(
        "Invalid role map: admin,manager"
      );
      expect(() => getRoleMap("admin")).toThrow("Invalid role map: admin");
      expect(() => getRoleMap(123)).toThrow("Invalid role map: 123");
      expect(() => getRoleMap(null)).toThrow("Invalid role map: null");
    });
  });
});
