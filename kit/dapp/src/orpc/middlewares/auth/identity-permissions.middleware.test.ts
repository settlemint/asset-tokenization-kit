import type { SessionUser } from "@/lib/auth/index";
import type { AccessControl } from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  canReadClaims,
  canReadUserData,
  canWriteClaims,
  canWriteUserData,
  computeIdentityPermissions,
  filterClaimsForUser,
  type IdentityPermissions,
} from "./identity-permissions.middleware";

describe("Identity permissions middleware", () => {
  describe("computeIdentityPermissions", () => {
    // Only include fields required by computeIdentityPermissions function
    const mockUser = {
      wallet: "0x1234567890123456789012345678901234567890",
      role: "admin",
    } as Pick<SessionUser, "wallet" | "role">;

    const createMockAccessControl = (
      identityManagers: string[] = []
    ): AccessControl => ({
      id: zeroAddress,
      identityManager: identityManagers.map((id) => ({
        id: id as EthereumAddress,
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
      claimIssuer: [],
    });

    it("grants full permissions to identity managers", () => {
      const accessControl = createMockAccessControl([
        "0x1234567890123456789012345678901234567890",
      ]);
      const userTrustedIssuerTopics = ["kyc", "aml"];

      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        accessControl,
        userTrustedIssuerTopics
      );

      expect(permissions).toEqual({
        claims: {
          read: ["*"], // Can read all claim topics
          write: ["kyc", "aml"], // Can write topics they're trusted issuer for
        },
        userData: {
          read: true,
          write: true,
        },
      });
    });

    it("grants user visibility and filtered claims to KYC trusted issuers", () => {
      const accessControl = createMockAccessControl(); // Not an identity manager
      const userTrustedIssuerTopics = ["kyc"];

      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        accessControl,
        userTrustedIssuerTopics
      );

      expect(permissions).toEqual({
        claims: {
          read: ["kyc"], // Can only read KYC claims
          write: ["kyc"], // Can only write KYC claims
        },
        userData: {
          read: true, // Can read user data for KYC workflow
          write: false, // Cannot modify user data
        },
      });
    });

    it("grants user visibility and filtered claims to AML trusted issuers", () => {
      const accessControl = createMockAccessControl();
      const userTrustedIssuerTopics = ["aml"];

      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        accessControl,
        userTrustedIssuerTopics
      );

      expect(permissions).toEqual({
        claims: {
          read: ["aml"], // Can only read AML claims
          write: ["aml"], // Can only write AML claims
        },
        userData: {
          read: true, // Can read user data for AML workflow
          write: false, // Cannot modify user data
        },
      });
    });

    it("denies access to regular users", () => {
      const accessControl = createMockAccessControl();
      const userTrustedIssuerTopics: string[] = [];

      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        accessControl,
        userTrustedIssuerTopics
      );

      expect(permissions).toEqual({
        claims: {
          read: [], // Cannot read any claims
          write: [], // Cannot write any claims
        },
        userData: {
          read: false, // Cannot read user data
          write: false, // Cannot write user data
        },
      });
    });

    it("prioritizes identity manager role over trusted issuer status", () => {
      const accessControl = createMockAccessControl([
        "0x1234567890123456789012345678901234567890",
      ]); // IS identity manager
      const userTrustedIssuerTopics = ["kyc", "aml"]; // AND trusted issuer

      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        accessControl,
        userTrustedIssuerTopics
      );

      // Identity manager wins - gets full access
      expect(permissions).toEqual({
        claims: {
          read: ["*"], // Can read all claims
          write: ["kyc", "aml"], // Can write topics they're trusted issuer for
        },
        userData: {
          read: true,
          write: true, // Identity manager has full write access
        },
      });
    });

    it("handles undefined access control gracefully", () => {
      const permissions = computeIdentityPermissions(
        mockUser as SessionUser,
        undefined,
        ["kyc"]
      );

      expect(permissions).toEqual({
        claims: {
          read: ["kyc"], // Can read KYC claims
          write: ["kyc"], // Can write KYC claims
        },
        userData: {
          read: true, // Still gets user visibility for KYC
          write: false, // Cannot modify user data without identity manager role
        },
      });
    });
  });

  describe("canReadUserData", () => {
    it("allows read access for users with userData.read permission", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      expect(canReadUserData(permissions, "user123")).toBe(true);
      expect(canReadUserData(permissions, undefined)).toBe(true); // List operation
    });

    it("denies read access for users without userData.read permission", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: [],
          write: [],
        },
        userData: {
          read: false,
          write: false,
        },
      };

      expect(canReadUserData(permissions, "user123")).toBe(false);
      expect(canReadUserData(permissions, undefined)).toBe(false); // List operation
    });
  });

  describe("canWriteUserData", () => {
    it("allows write access for users with userData.write permission", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["*"],
          write: [],
        },
        userData: {
          read: true,
          write: true,
        },
      };

      expect(canWriteUserData(permissions)).toBe(true);
    });

    it("denies write access for users without userData.write permission", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      expect(canWriteUserData(permissions)).toBe(false);
    });
  });

  describe("canReadClaims", () => {
    it("allows reading all topics with wildcard permission", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["*"],
          write: [],
        },
        userData: {
          read: true,
          write: true,
        },
      };

      expect(canReadClaims(["kyc", "aml", "any-topic"], permissions)).toBe(
        true
      );
    });

    it("allows reading specific permitted topics", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc", "aml"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      expect(canReadClaims(["kyc"], permissions)).toBe(true);
      expect(canReadClaims(["kyc", "aml"], permissions)).toBe(true);
    });

    it("denies reading unpermitted topics", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      expect(canReadClaims(["aml"], permissions)).toBe(false);
      expect(canReadClaims(["kyc", "aml"], permissions)).toBe(false);
    });
  });

  describe("canWriteClaims", () => {
    it("allows writing permitted topics", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc", "aml"],
          write: ["kyc", "aml"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      expect(canWriteClaims(["kyc"], permissions)).toBe(true);
      expect(canWriteClaims(["kyc", "aml"], permissions)).toBe(true);
    });

    it("denies writing unpermitted topics", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["*"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: true,
        },
      };

      expect(canWriteClaims(["aml"], permissions)).toBe(false);
      expect(canWriteClaims(["kyc", "aml"], permissions)).toBe(false);
    });
  });

  describe("filterClaimsForUser", () => {
    const allClaims = ["kyc", "aml", "accredited", "sanctions", "tax"];

    it("returns all claims for identity managers", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["*"], // Can read all claims
          write: [],
        },
        userData: {
          read: true,
          write: true,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(allClaims);
      expect(filteredClaims).toHaveLength(5);
    });

    it("returns only KYC claims for KYC trusted issuers", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["kyc"]);
      expect(filteredClaims).toHaveLength(1);
    });

    it("returns only AML claims for AML trusted issuers", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["aml"],
          write: ["aml"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["aml"]);
      expect(filteredClaims).toHaveLength(1);
    });

    it("returns multiple claims for multi-topic trusted issuers", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc", "aml"],
          write: ["kyc", "aml"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual(["kyc", "aml"]);
      expect(filteredClaims).toHaveLength(2);
    });

    it("returns empty array for non-privileged users", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: [],
          write: [],
        },
        userData: {
          read: false,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });

    it("handles claims not in trusted topics", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["nonexistent"],
          write: ["nonexistent"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });

    it("preserves claim order for filtered results", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["sanctions", "kyc"], // Different order
          write: ["sanctions", "kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser(allClaims, permissions);

      // Should preserve original order from allClaims
      expect(filteredClaims).toEqual(["kyc", "sanctions"]);
    });

    it("handles empty claims array", () => {
      const permissions: IdentityPermissions = {
        claims: {
          read: ["kyc"],
          write: ["kyc"],
        },
        userData: {
          read: true,
          write: false,
        },
      };

      const filteredClaims = filterClaimsForUser([], permissions);

      expect(filteredClaims).toEqual([]);
      expect(filteredClaims).toHaveLength(0);
    });
  });
});
