import { describe, expect, it } from "bun:test";
import { roleMap, roleNames, roles } from "./roles";

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
