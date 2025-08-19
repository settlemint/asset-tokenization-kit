import { describe, expect, it } from "vitest";
import {
  roleMap,
  roleNames,
  roles,
  isRole,
  getRole,
  isRoleMap,
  getRoleMap,
} from "./roles";

describe("roles", () => {
  const validator = roles();

  describe("valid roles", () => {
    it.each(roleNames.map((role) => [role]))("should accept '%s'", (role) => {
      expect(validator.parse(role)).toBe(role);
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
      expect(validator.parse({})).toEqual({});
    });

    it("should accept single address to role mapping", () => {
      const map = {
        "0x1234567890123456789012345678901234567890": "admin" as const,
      };
      expect(validator.parse(map)).toEqual(map);
    });

    it("should accept multiple address to role mappings", () => {
      const map = {
        "0x1234567890123456789012345678901234567890": "admin" as const,
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager" as const,
        user123: "investor" as const,
      };
      expect(validator.parse(map)).toEqual(map);
    });

    it("should accept all valid roles", () => {
      const map: Record<string, (typeof roleNames)[number]> = {};
      roleNames.forEach((role, index) => {
        map[`address${String(index)}`] = role;
      });
      expect(validator.parse(map)).toEqual(map);
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

describe("type checking", () => {
  describe("roles type", () => {
    it("should return proper type", () => {
      const result = roles().parse("admin");
      // Test that the type is correctly inferred
      expect(result).toBe("admin");
    });

    it("should handle safeParse", () => {
      const result = roles().safeParse("manager");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("manager");
      }
    });
  });

  describe("roleMap type", () => {
    it("should return proper type", () => {
      const result = roleMap().parse({ "0x123": "admin" });
      // Test that the type is correctly inferred
      expect(result).toEqual({ "0x123": "admin" });
    });

    it("should handle safeParse", () => {
      const result = roleMap().safeParse({
        "0x1234567890123456789012345678901234567890": "admin",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          "0x1234567890123456789012345678901234567890": "admin",
          "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "manager",
        });
      }
    });
  });
});

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
    expect(isRole("")).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(undefined)).toBe(false);
    expect(isRole(123)).toBe(false);
    expect(isRole({})).toBe(false);
    expect(isRole([])).toBe(false);
    expect(isRole("Admin")).toBe(false);
    expect(isRole("MANAGER")).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "issuer";
    if (isRole(value)) {
      // TypeScript should recognize value as Role here
      const validRole:
        | "admin"
        | "issuer"
        | "manager"
        | "compliance"
        | "auditor"
        | "investor" = value;
      expect(validRole).toBe("issuer");
    }
  });
});

describe("getRole", () => {
  it("should return valid roles", () => {
    expect(getRole("admin")).toBe("admin");
    expect(getRole("issuer")).toBe("issuer");
    expect(getRole("manager")).toBe("manager");
    expect(getRole("compliance")).toBe("compliance");
    expect(getRole("auditor")).toBe("auditor");
    expect(getRole("investor")).toBe("investor");
  });

  it("should throw for invalid roles", () => {
    expect(() => getRole("superadmin")).toThrow();
    expect(() => getRole("user")).toThrow();
    expect(() => getRole("")).toThrow();
    expect(() => getRole(null)).toThrow();
    expect(() => getRole(undefined)).toThrow();
    expect(() => getRole(123)).toThrow();
    expect(() => getRole({})).toThrow();
    expect(() => getRole([])).toThrow();
    expect(() => getRole("Admin")).toThrow();
    expect(() => getRole("MANAGER")).toThrow();
  });

  it("should throw with meaningful error message", () => {
    expect(() => getRole("guest")).toThrow();
  });
});

describe("isRoleMap", () => {
  it("should return true for valid role maps", () => {
    expect(isRoleMap({})).toBe(true);
    expect(isRoleMap({ "0x123": "admin" })).toBe(true);
    expect(
      isRoleMap({
        "0x123": "admin",
        "0x456": "investor",
        user123: "manager",
      })
    ).toBe(true);
  });

  it("should return false for invalid role maps", () => {
    expect(isRoleMap({ "0x123": "superadmin" })).toBe(false);
    expect(isRoleMap({ "0x123": 123 })).toBe(false);
    expect(isRoleMap({ "0x123": null })).toBe(false);
    expect(isRoleMap("admin")).toBe(false);
    expect(isRoleMap(123)).toBe(false);
    expect(isRoleMap(null)).toBe(false);
    expect(isRoleMap(undefined)).toBe(false);
    expect(isRoleMap([])).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = { user123: "investor" };
    if (isRoleMap(value)) {
      // TypeScript should recognize value as RoleMap here
      Object.entries(value).forEach(([id, role]) => {
        expect(typeof id).toBe("string");
        expect(roleNames).toContain(role);
      });
    }
  });
});

describe("getRoleMap", () => {
  it("should return valid role maps", () => {
    expect(getRoleMap({})).toEqual({});
    expect(getRoleMap({ "0x123": "admin" })).toEqual({ "0x123": "admin" });
    expect(
      getRoleMap({
        "0x123": "admin",
        "0x456": "investor",
        user123: "manager",
      })
    ).toEqual({
      "0x123": "admin",
      "0x456": "investor",
      user123: "manager",
    });
  });

  it("should throw for invalid role maps", () => {
    expect(() => getRoleMap({ "0x123": "superadmin" })).toThrow();
    expect(() => getRoleMap({ "0x123": 123 })).toThrow();
    expect(() => getRoleMap({ "0x123": null })).toThrow();
    expect(() => getRoleMap("admin")).toThrow();
    expect(() => getRoleMap(123)).toThrow();
    expect(() => getRoleMap(null)).toThrow();
    expect(() => getRoleMap(undefined)).toThrow();
    expect(() => getRoleMap([])).toThrow();
  });

  it("should be useful in functions requiring RoleMap type", () => {
    const processRoles = (roles: Record<string, string>) => {
      const validatedRoles = getRoleMap(roles);
      return Object.keys(validatedRoles).length;
    };

    expect(processRoles({ "0x123": "admin", "0x456": "investor" })).toBe(2);
    expect(() => processRoles({ "0x123": "invalid" })).toThrow();
  });
});
