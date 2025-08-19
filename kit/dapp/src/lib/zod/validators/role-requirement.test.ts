import { describe, expect, it } from "vitest";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import {
  RoleRequirementSchema,
  isAllRoleRequirement,
  isAnyRoleRequirement,
  isSingleRole,
  satisfiesRoleRequirement,
  type RoleRequirement,
} from "./role-requirement";

describe("role-requirement", () => {
  describe("type guards", () => {
    describe("isSingleRole", () => {
      it("should return true for string roles", () => {
        expect(isSingleRole("admin")).toBe(true);
        expect(isSingleRole("tokenManager")).toBe(true);
      });

      it("should return false for object roles", () => {
        expect(isSingleRole({ any: ["admin"] })).toBe(false);
        expect(isSingleRole({ all: ["admin"] })).toBe(false);
      });
    });

    describe("isAnyRoleRequirement", () => {
      it("should return true for 'any' requirement objects", () => {
        expect(isAnyRoleRequirement({ any: ["admin"] })).toBe(true);
        expect(isAnyRoleRequirement({ any: [] })).toBe(true);
      });

      it("should return false for non-'any' requirements", () => {
        expect(isAnyRoleRequirement("admin")).toBe(false);
        expect(isAnyRoleRequirement({ all: ["admin"] })).toBe(false);
      });
    });

    describe("isAllRoleRequirement", () => {
      it("should return true for 'all' requirement objects", () => {
        expect(isAllRoleRequirement({ all: ["admin"] })).toBe(true);
        expect(isAllRoleRequirement({ all: [] })).toBe(true);
      });

      it("should return false for non-'all' requirements", () => {
        expect(isAllRoleRequirement("admin")).toBe(false);
        expect(isAllRoleRequirement({ any: ["admin"] })).toBe(false);
      });
    });
  });

  describe("satisfiesRoleRequirement", () => {
    const userRoles: AccessControlRoles[] = ["admin", "tokenManager"];

    describe("single role requirements", () => {
      it("should return true when user has the required role", () => {
        expect(satisfiesRoleRequirement(userRoles, "admin")).toBe(true);
        expect(satisfiesRoleRequirement(userRoles, "tokenManager")).toBe(true);
      });

      it("should return false when user lacks the required role", () => {
        expect(satisfiesRoleRequirement(userRoles, "systemManager")).toBe(
          false
        );
        expect(satisfiesRoleRequirement(userRoles, "auditor")).toBe(false);
      });

      it("should return false for empty user roles", () => {
        expect(satisfiesRoleRequirement([], "admin")).toBe(false);
      });
    });

    describe("'any' (OR) requirements", () => {
      it("should return true when user has at least one of the required roles", () => {
        expect(
          satisfiesRoleRequirement(userRoles, {
            any: ["admin", "systemManager"],
          })
        ).toBe(true);
        expect(
          satisfiesRoleRequirement(userRoles, {
            any: ["tokenManager", "auditor"],
          })
        ).toBe(true);
      });

      it("should return false when user has none of the required roles", () => {
        expect(
          satisfiesRoleRequirement(userRoles, {
            any: ["systemManager", "auditor"],
          })
        ).toBe(false);
      });

      it("should return true for empty 'any' array (no roles required)", () => {
        expect(satisfiesRoleRequirement(userRoles, { any: [] })).toBe(true);
      });

      it("should handle nested 'any' requirements", () => {
        const nestedRequirement: RoleRequirement = {
          any: ["admin", { any: ["systemManager", "auditor"] }],
        };
        expect(satisfiesRoleRequirement(userRoles, nestedRequirement)).toBe(
          true
        );
      });
    });

    describe("'all' (AND) requirements", () => {
      it("should return true when user has all required roles", () => {
        expect(
          satisfiesRoleRequirement(userRoles, {
            all: ["admin", "tokenManager"],
          })
        ).toBe(true);
        expect(satisfiesRoleRequirement(userRoles, { all: ["admin"] })).toBe(
          true
        );
      });

      it("should return false when user lacks any required role", () => {
        expect(
          satisfiesRoleRequirement(userRoles, {
            all: ["admin", "systemManager"],
          })
        ).toBe(false);
        expect(
          satisfiesRoleRequirement(userRoles, {
            all: ["tokenManager", "systemManager"],
          })
        ).toBe(false);
      });

      it("should return true for empty 'all' array", () => {
        expect(satisfiesRoleRequirement(userRoles, { all: [] })).toBe(true);
      });

      it("should handle nested 'all' requirements", () => {
        const nestedRequirement: RoleRequirement = {
          all: ["admin", { all: ["tokenManager"] }],
        };
        expect(satisfiesRoleRequirement(userRoles, nestedRequirement)).toBe(
          true
        );
      });
    });

    describe("complex nested requirements", () => {
      it("should handle AND with nested OR", () => {
        // User must have admin AND (tokenManager OR systemManager)
        const requirement: RoleRequirement = {
          all: ["admin", { any: ["tokenManager", "systemManager"] }],
        };
        expect(satisfiesRoleRequirement(userRoles, requirement)).toBe(true);
        expect(satisfiesRoleRequirement(["admin"], requirement)).toBe(false);
        expect(
          satisfiesRoleRequirement(["admin", "systemManager"], requirement)
        ).toBe(true);
      });

      it("should handle OR with nested AND", () => {
        // User must have (admin AND tokenManager) OR systemManager
        const requirement: RoleRequirement = {
          any: [{ all: ["admin", "tokenManager"] }, "systemManager"],
        };
        expect(satisfiesRoleRequirement(userRoles, requirement)).toBe(true);
        expect(satisfiesRoleRequirement(["systemManager"], requirement)).toBe(
          true
        );
        expect(satisfiesRoleRequirement(["admin"], requirement)).toBe(false);
      });

      it("should handle deeply nested requirements", () => {
        const requirement: RoleRequirement = {
          all: [
            "admin",
            {
              any: [
                { all: ["tokenManager", "complianceManager"] },
                { all: ["systemManager", "auditor"] },
              ],
            },
          ],
        };
        expect(
          satisfiesRoleRequirement(
            ["admin", "tokenManager", "complianceManager"],
            requirement
          )
        ).toBe(true);
        expect(
          satisfiesRoleRequirement(
            ["admin", "systemManager", "auditor"],
            requirement
          )
        ).toBe(true);
        expect(
          satisfiesRoleRequirement(["admin", "tokenManager"], requirement)
        ).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should return false for invalid requirement objects", () => {
        // This tests the fallback return false case
        // Create an invalid requirement that doesn't match any of the expected types
        const invalidRequirement = { invalid: "structure" };
        // TypeScript will complain here, but we're testing runtime behavior
        // @ts-expect-error Testing invalid input
        expect(satisfiesRoleRequirement(userRoles, invalidRequirement)).toBe(
          false
        );
      });
    });
  });

  describe("RoleRequirementSchema", () => {
    it("should parse valid single role", () => {
      const result = RoleRequirementSchema.parse("admin");
      expect(result).toBe("admin");
    });

    it("should parse valid 'any' requirement", () => {
      const requirement = { any: ["admin", "tokenManager"] };
      const result = RoleRequirementSchema.parse(requirement);
      expect(result).toEqual(requirement);
    });

    it("should parse valid 'all' requirement", () => {
      const requirement = { all: ["admin", "tokenManager"] };
      const result = RoleRequirementSchema.parse(requirement);
      expect(result).toEqual(requirement);
    });

    it("should parse nested requirements", () => {
      const requirement = {
        all: ["admin", { any: ["tokenManager", "systemManager"] }],
      };
      const result = RoleRequirementSchema.parse(requirement);
      expect(result).toEqual(requirement);
    });

    it("should throw on invalid structure", () => {
      expect(() =>
        RoleRequirementSchema.parse({ invalid: "structure" })
      ).toThrow();
      expect(() => RoleRequirementSchema.parse(123)).toThrow();
      expect(() => RoleRequirementSchema.parse(null)).toThrow();
    });

    it("should handle deeply nested structures", () => {
      const deeplyNested = {
        any: [
          "admin",
          {
            all: [
              "tokenManager",
              {
                any: [
                  "systemManager",
                  { all: ["auditor", "complianceManager"] },
                ],
              },
            ],
          },
        ],
      };
      const result = RoleRequirementSchema.parse(deeplyNested);
      expect(result).toEqual(deeplyNested);
    });
  });
});
