/**
 * @fileoverview Test suite for access control role validation schemas
 *
 * This test suite validates the access control system's role validation logic,
 * ensuring secure and consistent role assignment across the tokenization platform.
 *
 * Test Strategy:
 * - Role Enumeration: Verify all 41 roles are properly defined and accessible
 * - Object Schema: Test role object validation with boolean flags per role
 * - Default Behavior: Ensure undefined roles default to false (security-by-default)
 * - Type Safety: Validate that only known roles are accepted
 * - Edge Cases: Handle malformed inputs, extra properties, and type coercion
 *
 * SECURITY: Role validation is critical - false positives could grant unauthorized access
 * PERFORMANCE: Schema uses computed object shape for O(1) role lookup efficiency
 */

import { describe, expect, it } from "bun:test";
import type { z } from "zod";
import { accessControlRole, accessControlRoles } from "./access-control-roles";

describe("accessControlRoles", () => {
  describe("schema validation for access control roles", () => {
    it("should parse valid access control roles object with all roles false", () => {
      // WHY: Test baseline case where user has no elevated permissions
      // SECURITY: Default state should be restrictive (all permissions denied)
      const validRoles: Record<string, boolean> = {
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: false,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
        claimIssuer: false,
        complianceAdmin: false,
        complianceManager: false,
        custodian: false,
        emergency: false,
        forcedTransfer: false,
        freezer: false,
        fundsManager: false,
        globalListManager: false,
        governance: false,
        identityManager: false,
        identityRegistryModule: false,
        minter: false,
        organisationIdentityManager: false,
        pauser: false,
        recovery: false,
        saleAdmin: false,
        signer: false,
        supplyManagement: false,
        systemManager: false,
        systemModule: false,
        tokenAdmin: false,
        tokenFactoryModule: false,
        tokenFactoryRegistryModule: false,
        tokenManager: false,
        verificationAdmin: false,
      };

      const result = accessControlRoles.parse(validRoles);
      expect(result).toEqual(validRoles);
    });

    it("should parse valid access control roles object with mixed boolean values", () => {
      // WHY: Test realistic permission assignment patterns
      // PATTERN: Different roles enabled for different user types (admin, auditor, etc.)
      const validRoles: Record<string, boolean> = {
        addonManager: true,
        addonModule: false,
        addonRegistryModule: true,
        admin: true,
        auditor: false,
        burner: true,
        capManagement: false,
        claimPolicyManager: true,
        claimIssuer: true,
        complianceAdmin: false,
        complianceManager: true,
        custodian: false,
        emergency: true,
        forcedTransfer: false,
        freezer: true,
        fundsManager: false,
        globalListManager: true,
        governance: false,
        identityManager: true,
        identityRegistryModule: false,
        minter: true,
        organisationIdentityManager: false,
        pauser: false,
        recovery: true,
        saleAdmin: false,
        signer: true,
        supplyManagement: false,
        systemManager: true,
        systemModule: false,
        tokenAdmin: true,
        tokenFactoryModule: false,
        tokenFactoryRegistryModule: true,
        tokenManager: false,
        verificationAdmin: true,
      };

      const result = accessControlRoles.parse(validRoles);
      expect(result).toEqual(validRoles);
    });

    it("should set default values to false when roles are undefined", () => {
      // WHY: Partial role objects should default missing roles to false for security
      // SECURITY: Unknown/undefined permissions must default to DENY, not ALLOW
      const partialRoles = {
        admin: true,
        tokenManager: true,
      };

      const result = accessControlRoles.parse(partialRoles);

      // VERIFICATION: Explicitly provided roles are preserved
      expect(result.admin).toBe(true);
      expect(result.tokenManager).toBe(true);

      // SECURITY: All other roles must default to false (principle of least privilege)
      expect(result.addonManager).toBe(false);
      expect(result.addonModule).toBe(false);
      expect(result.addonRegistryModule).toBe(false);
      expect(result.auditor).toBe(false);
      expect(result.burner).toBe(false);
      expect(result.capManagement).toBe(false);
      expect(result.claimPolicyManager).toBe(false);
      expect(result.claimIssuer).toBe(false);
      expect(result.complianceAdmin).toBe(false);
      expect(result.complianceManager).toBe(false);
      expect(result.custodian).toBe(false);
      expect(result.emergency).toBe(false);
      expect(result.forcedTransfer).toBe(false);
      expect(result.freezer).toBe(false);
      expect(result.fundsManager).toBe(false);
      expect(result.globalListManager).toBe(false);
      expect(result.governance).toBe(false);
      expect(result.identityManager).toBe(false);
      expect(result.identityRegistryModule).toBe(false);
      expect(result.minter).toBe(false);
      expect(result.organisationIdentityManager).toBe(false);
      expect(result.pauser).toBe(false);
      expect(result.recovery).toBe(false);
      expect(result.saleAdmin).toBe(false);
      expect(result.signer).toBe(false);
      expect(result.supplyManagement).toBe(false);
      expect(result.systemManager).toBe(false);
      expect(result.systemModule).toBe(false);
      expect(result.tokenAdmin).toBe(false);
      expect(result.tokenFactoryModule).toBe(false);
      expect(result.tokenFactoryRegistryModule).toBe(false);
      expect(result.verificationAdmin).toBe(false);
    });

    it("should parse empty object with all defaults", () => {
      // WHY: Empty permissions object should create safe default state
      // SECURITY: New users start with no permissions (secure by default)
      const result = accessControlRoles.parse({});

      // INVARIANT: Every role in the system defaults to false
      Object.values(result).forEach((value) => {
        expect(value).toBe(false);
      });
    });

    it("should throw on invalid property types", () => {
      // WHY: Role flags must be strictly boolean to prevent confusion
      // SECURITY: String "true" vs boolean true could cause authorization bugs
      const invalidRoles = {
        admin: "true", // Should be boolean, not string
        tokenManager: false,
      };

      expect(() => accessControlRoles.parse(invalidRoles)).toThrow();
    });

    it("should ignore extra properties and parse valid ones", () => {
      // WHY: API may receive extra/unknown role properties - should ignore safely
      // SECURITY: Unknown roles are stripped out rather than causing validation failure
      const rolesWithExtra = {
        admin: true,
        tokenManager: false,
        unknownRole: true, // This role doesn't exist in our schema
      };

      const result = accessControlRoles.parse(rolesWithExtra);

      // VERIFICATION: Known roles are preserved correctly
      expect(result.admin).toBe(true);
      expect(result.tokenManager).toBe(false);

      // SECURITY: Unknown properties are stripped from output
      expect(result).not.toHaveProperty("unknownRole");

      // INVARIANT: Undefined known roles still default to false
      expect(result.addonManager).toBe(false);
    });

    it("should throw on null or undefined input", () => {
      // WHY: Null/undefined permissions are invalid - must provide object structure
      // SECURITY: Better to fail fast than assume empty permissions
      expect(() => accessControlRoles.parse(null)).toThrow();
      expect(() => accessControlRoles.parse(undefined)).toThrow();
    });

    it("should throw on non-object types", () => {
      // WHY: Roles must be structured as key-value object, not primitive types
      // TYPE_SAFETY: Prevent confusion between different data representations
      expect(() => accessControlRoles.parse("string")).toThrow();
      expect(() => accessControlRoles.parse(123)).toThrow();
      expect(() => accessControlRoles.parse(true)).toThrow();
      expect(() => accessControlRoles.parse([])).toThrow(); // Array is not object
    });
  });

  describe("schema validation for access control role", () => {
    it("should parse valid access control role", () => {
      // WHY: Single role validation for API endpoints that accept one role
      const result = accessControlRole.parse("tokenManager");
      expect(result).toEqual("tokenManager");
    });

    it("should throw on invalid access control role", () => {
      // SECURITY: Reject unknown roles to prevent privilege escalation attempts
      expect(() => accessControlRole.parse("invalidRole")).toThrow();
    });

    it("should throw on null or undefined input", () => {
      // WHY: Role assignment requires explicit value, not null/undefined
      expect(() => accessControlRole.parse(null)).toThrow();
      expect(() => accessControlRole.parse(undefined)).toThrow();
    });
  });

  describe("type safety", () => {
    it("should ensure all AccessControlRoles are covered", () => {
      // WHY: Prevent schema drift - adding new roles requires updating both enum and object
      // MAINTENANCE: This test will fail if roles are added without updating schemas
      // IMPLEMENTATION: Extract schema shape for comparison with expected roles
      if (!("shape" in accessControlRoles)) {
        throw new Error("Expected accessControlRoles to be a ZodObject");
      }
      const schemaShape = (accessControlRoles as z.ZodObject<z.ZodRawShape>)
        .shape;
      const schemaKeys = Object.keys(schemaShape);

      // REFERENCE: Complete list of all system roles (must match source exactly)
      const expectedRoles: string[] = [
        "addonManager",
        "addonModule",
        "addonRegistryModule",
        "admin",
        "auditor",
        "burner",
        "capManagement",
        "claimPolicyManager",
        "claimIssuer",
        "complianceAdmin",
        "complianceManager",
        "custodian",
        "emergency",
        "forcedTransfer",
        "freezer",
        "fundsManager",
        "globalListManager",
        "governance",
        "identityManager",
        "identityRegistryModule",
        "minter",
        "organisationIdentityManager",
        "pauser",
        "recovery",
        "saleAdmin",
        "signer",
        "supplyManagement",
        "systemManager",
        "systemModule",
        "tokenAdmin",
        "tokenFactoryModule",
        "tokenFactoryRegistryModule",
        "tokenManager",
        "verificationAdmin",
      ];

      // VERIFICATION: Schema contains exactly the expected roles (no more, no less)
      expect(schemaKeys).toHaveLength(expectedRoles.length);
      expectedRoles.forEach((role) => {
        expect(schemaKeys).toContain(role);
      });

      // VERIFICATION: Enum schema also has all roles for single role validation
      expect(Object.keys(accessControlRole.enum)).toHaveLength(
        expectedRoles.length
      );
    });
  });
});
