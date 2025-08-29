import type { SessionUser } from "@/lib/auth";
import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import { describe, expect, it } from "vitest";
import {
  canAccessUser,
  computeIdentityPermissions,
  filterClaimsForUser,
  type IdentityPermissions,
} from "./identity-permissions.middleware";

describe("Identity permissions middleware", () => {
  describe("computeIdentityPermissions", () => {
    const mockUser: SessionUser = {
      id: "test-user",
      wallet: "0x1234567890123456789012345678901234567890",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      pincodeEnabled: false,
      image: null,
      twoFactorEnabled: false,
      banned: false,
      secretCodesConfirmed: false,
    };

    const createMockAccessControl = (
      identityManagers: string[] = []
    ): AccessControl => ({
      id: "test-access-control",
      identityManager: identityManagers.map((id) => ({
        id,
        isContract: false,
      })),
      // Mock all required fields with empty arrays
      addonManager: [],
      addonModule: [],
      addonRegistryModule: [],
      admin: [],
      auditor: [],
      burner: [],
      capManagement: [],
      claimPolicyManager: [],
      complianceAdmin: [],
      complianceManager: [],
      custodian: [],
      emergency: [],
      forcedTransfer: [],
      freezer: [],
      fundsManager: [],
      globalListManager: [],
      governance: [],
      identityRegistryModule: [],
      minter: [],
      organisationIdentityManager: [],
      pauser: [],
      recovery: [],
      saleAdmin: [],
      signer: [],
      supplyManagement: [],
      systemManager: [],
      systemModule: [],
      tokenAdmin: [],
      tokenFactoryModule: [],
      tokenFactoryRegistryModule: [],
      tokenManager: [],
      verificationAdmin: [],
    });

    it("grants full permissions to identity managers", () => {
      const accessControl = createMockAccessControl([
        "0x1234567890123456789012345678901234567890",
      ]);
      const userClaimTopics = ["kyc", "aml"];

      const permissions = computeIdentityPermissions(
        mockUser,
        accessControl,
        userClaimTopics
      );

      expect(permissions).toEqual({
        trustedClaimTopics: [], // Empty array means "all" for identity managers (canSeeAllClaims = true)
        canSeeAllUsers: true,
        canSeeAllClaims: true,
      });
    });

    it("grants user visibility and filtered claims to KYC trusted issuers", () => {
      const accessControl = createMockAccessControl(); // Not an identity manager
      const userClaimTopics = ["kyc"];

      const permissions = computeIdentityPermissions(
        mockUser,
        accessControl,
        userClaimTopics
      );

      expect(permissions).toEqual({
        trustedClaimTopics: ["kyc"], // Only KYC claims
        canSeeAllUsers: true, // Can see users for KYC workflow
        canSeeAllClaims: false, // Cannot see all claims
      });
    });

    it("grants user visibility and filtered claims to AML trusted issuers", () => {
      const accessControl = createMockAccessControl();
      const userClaimTopics = ["aml"];

      const permissions = computeIdentityPermissions(
        mockUser,
        accessControl,
        userClaimTopics
      );

      expect(permissions).toEqual({
        trustedClaimTopics: ["aml"],
        canSeeAllUsers: true, // Can see users for AML workflow
        canSeeAllClaims: false,
      });
    });

    it("denies access to regular users", () => {
      const accessControl = createMockAccessControl();
      const userClaimTopics: string[] = [];

      const permissions = computeIdentityPermissions(
        mockUser,
        accessControl,
        userClaimTopics
      );

      expect(permissions).toEqual({
        trustedClaimTopics: [],
        canSeeAllUsers: false,
        canSeeAllClaims: false,
      });
    });

    it("prioritizes identity manager role over trusted issuer status", () => {
      const accessControl = createMockAccessControl([
        "0x1234567890123456789012345678901234567890",
      ]); // IS identity manager
      const userClaimTopics = ["kyc", "aml"]; // AND trusted issuer

      const permissions = computeIdentityPermissions(
        mockUser,
        accessControl,
        userClaimTopics
      );

      // Identity manager wins - gets full access
      expect(permissions).toEqual({
        trustedClaimTopics: [], // Empty means "all" for identity managers
        canSeeAllUsers: true,
        canSeeAllClaims: true, // Identity manager overrides issuer restrictions
      });
    });

    it("handles undefined access control gracefully", () => {
      const permissions = computeIdentityPermissions(mockUser, undefined, [
        "kyc",
      ]);

      expect(permissions).toEqual({
        trustedClaimTopics: ["kyc"],
        canSeeAllUsers: true, // Still gets user visibility for KYC
        canSeeAllClaims: false,
      });
    });
  });

  describe("canAccessUser", () => {
    it("allows access for users with canSeeAllUsers permission", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["kyc"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      expect(canAccessUser(permissions, "user123")).toBe(true);
      expect(canAccessUser(permissions, undefined)).toBe(true); // List operation
    });

    it("denies access for users without canSeeAllUsers permission", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: [],
        canSeeAllUsers: false,
        canSeeAllClaims: false,
      };

      expect(canAccessUser(permissions, "user123")).toBe(false);
      expect(canAccessUser(permissions, undefined)).toBe(false); // List operation
    });
  });

  describe("filterClaimsForUser", () => {
    const allClaims = ["kyc", "aml", "accredited", "sanctions", "tax"];

    it("returns all claims for identity managers", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: [], // Empty for identity managers
        canSeeAllUsers: true,
        canSeeAllClaims: true, // Identity manager privilege
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(allClaims);
      expect(filteredClaims).toHaveLength(5);
    });

    it("returns only KYC claims for KYC trusted issuers", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["kyc"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["kyc"]);
      expect(filteredClaims).toHaveLength(1);
    });

    it("returns only AML claims for AML trusted issuers", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["aml"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["aml"]);
      expect(filteredClaims).toHaveLength(1);
    });

    it("returns multiple claims for multi-topic trusted issuers", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["kyc", "aml"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["kyc", "aml"]);
      expect(filteredClaims).toHaveLength(2);
    });

    it("returns empty array for non-privileged users", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: [],
        canSeeAllUsers: false,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });

    it("handles claims not in trusted topics", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["nonexistent"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });

    it("preserves claim order for filtered results", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["sanctions", "kyc"], // Different order
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      // Should preserve original order from allClaims
      expect(filteredClaims).toEqual(["kyc", "sanctions"]);
    });

    it("handles empty claims array", () => {
      const permissions: IdentityPermissions = {
        trustedClaimTopics: ["kyc"],
        canSeeAllUsers: true,
        canSeeAllClaims: false,
      };

      const filteredClaims = filterClaimsForUser([], permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });
  });
});
