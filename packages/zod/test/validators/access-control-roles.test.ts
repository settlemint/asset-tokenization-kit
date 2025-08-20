import { describe, expect, it } from "bun:test";
import type { z } from "zod";
import { accessControlRole, accessControlRoles } from "../../src/validators/access-control-roles";

describe("accessControlRoles", () => {
  describe("schema validation for access control roles", () => {
    it("should parse valid access control roles object with all roles false", () => {
      const validRoles: Record<string, boolean> = {
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: false,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
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
      const validRoles: Record<string, boolean> = {
        addonManager: true,
        addonModule: false,
        addonRegistryModule: true,
        admin: true,
        auditor: false,
        burner: true,
        capManagement: false,
        claimPolicyManager: true,
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
      const partialRoles = {
        admin: true,
        tokenManager: true,
      };

      const result = accessControlRoles.parse(partialRoles);

      // Check that the provided values are preserved
      expect(result.admin).toBe(true);
      expect(result.tokenManager).toBe(true);

      // Check that all other roles default to false
      expect(result.addonManager).toBe(false);
      expect(result.addonModule).toBe(false);
      expect(result.addonRegistryModule).toBe(false);
      expect(result.auditor).toBe(false);
      expect(result.burner).toBe(false);
      expect(result.capManagement).toBe(false);
      expect(result.claimPolicyManager).toBe(false);
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
      const result = accessControlRoles.parse({});

      // All roles should default to false
      Object.values(result).forEach((value) => {
        expect(value).toBe(false);
      });
    });

    it("should throw on invalid property types", () => {
      const invalidRoles = {
        admin: "true", // Should be boolean, not string
        tokenManager: false,
      };

      expect(() => accessControlRoles.parse(invalidRoles)).toThrow();
    });

    it("should ignore extra properties and parse valid ones", () => {
      const rolesWithExtra = {
        admin: true,
        tokenManager: false,
        unknownRole: true, // This role doesn't exist
      };

      const result = accessControlRoles.parse(rolesWithExtra);

      // Valid properties should be preserved
      expect(result.admin).toBe(true);
      expect(result.tokenManager).toBe(false);

      // Extra property should not be in result
      expect(result).not.toHaveProperty("unknownRole");

      // Other roles should default to false
      expect(result.addonManager).toBe(false);
    });

    it("should throw on null or undefined input", () => {
      expect(() => accessControlRoles.parse(null)).toThrow();
      expect(() => accessControlRoles.parse(undefined)).toThrow();
    });

    it("should throw on non-object types", () => {
      expect(() => accessControlRoles.parse("string")).toThrow();
      expect(() => accessControlRoles.parse(123)).toThrow();
      expect(() => accessControlRoles.parse(true)).toThrow();
      expect(() => accessControlRoles.parse([])).toThrow();
    });
  });

  describe("schema validation for access control role", () => {
    it("should parse valid access control role", () => {
      const result = accessControlRole.parse("tokenManager");
      expect(result).toEqual("tokenManager");
    });

    it("should throw on invalid access control role", () => {
      expect(() => accessControlRole.parse("invalidRole")).toThrow();
    });

    it("should throw on null or undefined input", () => {
      expect(() => accessControlRole.parse(null)).toThrow();
      expect(() => accessControlRole.parse(undefined)).toThrow();
    });
  });

  describe("type safety", () => {
    it("should ensure all AccessControlRoles are covered", () => {
      // This test ensures that if a new role is added to AccessControlRoles,
      // it must also be added to the schema
      // Get the shape from the schema
      if (!("shape" in accessControlRoles)) {
        throw new Error("Expected accessControlRoles to be a ZodObject");
      }
      const schemaShape = (accessControlRoles as z.ZodObject<z.ZodRawShape>).shape;
      const schemaKeys = Object.keys(schemaShape);

      // List all expected roles
      const expectedRoles: string[] = [
        "addonManager",
        "addonModule",
        "addonRegistryModule",
        "admin",
        "auditor",
        "burner",
        "capManagement",
        "claimPolicyManager",
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

      expect(schemaKeys).toHaveLength(expectedRoles.length);
      expectedRoles.forEach((role) => {
        expect(schemaKeys).toContain(role);
      });

      // Check that the enum has all the roles
      expect(Object.keys(accessControlRole.enum)).toHaveLength(expectedRoles.length);
    });
  });
});
