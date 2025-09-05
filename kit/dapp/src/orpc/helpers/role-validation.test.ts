/**
 * @vitest-environment node
 */

import type {
  AccessControl,
  AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { describe, expect, test } from "vitest";
import { mapUserRoles } from "./role-validation";

describe("role-validation", () => {
  describe("mapUserRoles", () => {
    const mockWallet =
      "0x1234567890123456789012345678901234567890" as EthereumAddress;
    const anotherWallet =
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as EthereumAddress;

    test("should return all roles as false when accessControl is null", () => {
      const result = mapUserRoles(mockWallet, null);

      // Check that all roles are present and set to false
      expect(result).toEqual({
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
        trustedIssuersMetaRegistryModule: false,
        verificationAdmin: false,
      });
    });

    test("should correctly identify user roles when user has single role", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        minter: [{ id: anotherWallet, isContract: false }],
        burner: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.minter).toBe(false);
      expect(result.burner).toBe(false);
      // All other roles should be false
      expect(result.pauser).toBe(false);
    });

    test("should correctly identify user roles when user has multiple roles", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        minter: [
          { id: mockWallet, isContract: false },
          { id: anotherWallet, isContract: false },
        ],
        tokenManager: [
          { id: anotherWallet, isContract: false },
          { id: mockWallet, isContract: false },
        ],
        pauser: [{ id: anotherWallet, isContract: false }],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.minter).toBe(true);
      expect(result.tokenManager).toBe(true);
      expect(result.pauser).toBe(false);
    });

    test("should handle case-insensitive wallet address comparison", () => {
      const walletAddress = "0xabCDef1234567890aBCdEF1234567890abCDef";
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: walletAddress.toLowerCase(), isContract: false }],
        minter: [{ id: walletAddress.toUpperCase(), isContract: false }],
        burner: [{ id: walletAddress, isContract: false }], // mixed case
      } as unknown as AccessControl;

      // Test with lowercase wallet
      const resultForLowercase = mapUserRoles(
        walletAddress.toLowerCase() as EthereumAddress,
        accessControl
      );
      expect(resultForLowercase.admin).toBe(true);
      expect(resultForLowercase.minter).toBe(true);
      expect(resultForLowercase.burner).toBe(true);

      // Test with uppercase wallet
      const resultForUppercase = mapUserRoles(
        walletAddress.toUpperCase() as EthereumAddress,
        accessControl
      );
      expect(resultForUppercase.admin).toBe(true);
      expect(resultForUppercase.minter).toBe(true);
      expect(resultForUppercase.burner).toBe(true);

      // Test with mixed-case wallet
      const resultForMixedCase = mapUserRoles(
        walletAddress as EthereumAddress,
        accessControl
      );
      expect(resultForMixedCase.admin).toBe(true);
      expect(resultForMixedCase.minter).toBe(true);
      expect(resultForMixedCase.burner).toBe(true);
    });

    test("should handle empty accessControl object", () => {
      const accessControl = {
        id: "access-manager-address",
      } as unknown as AccessControl;
      const result = mapUserRoles(mockWallet, accessControl);

      // All roles should be false
      Object.values(result).forEach((value) => {
        expect(value).toBe(false);
      });
    });

    test("should handle accessControl with GraphQL internal fields", () => {
      const accessControl = {
        __typename: "AccessControl",
        __proto__: {},
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        minter: [{ id: anotherWallet, isContract: false }],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.minter).toBe(false);
    });

    test("should handle accessControl with invalid role values", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        minter: null, // Invalid value
        burner: "invalid", // Invalid value
        pauser: undefined, // Invalid value
        tokenManager: {}, // Invalid value
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      // Should still correctly identify valid roles
      expect(result.admin).toBe(true);
      // Invalid roles should be false
      expect(result.minter).toBe(false);
      expect(result.burner).toBe(false);
      expect(result.pauser).toBe(false);
      expect(result.tokenManager).toBe(false);
    });

    test("should handle malformed role values", () => {
      // The getAccessControlEntries function validates arrays, so malformed values
      // like null/undefined/non-arrays will be filtered out
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }], // Valid
        minter: null, // Will be filtered out
        burner: undefined, // Will be filtered out
        pauser: "not-an-array", // Will be filtered out
        tokenManager: {}, // Will be filtered out
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.minter).toBe(false);
      expect(result.burner).toBe(false);
      expect(result.pauser).toBe(false);
      expect(result.tokenManager).toBe(false);
    });

    test("should return false for all roles when wallet is not in any role", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: anotherWallet, isContract: false }],
        minter: [{ id: anotherWallet, isContract: false }],
        burner: [
          {
            id: "0x9999999999999999999999999999999999999999",
            isContract: false,
          },
        ],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      // All roles should be false
      Object.values(result).forEach((value) => {
        expect(value).toBe(false);
      });
    });

    test("should handle multiple accounts in same role", () => {
      const wallet1 =
        "0x1111111111111111111111111111111111111111" as EthereumAddress;
      const wallet2 =
        "0x2222222222222222222222222222222222222222" as EthereumAddress;
      const wallet3 =
        "0x3333333333333333333333333333333333333333" as EthereumAddress;

      const accessControl = {
        id: "access-manager-address",
        admin: [
          { id: wallet1, isContract: false },
          { id: wallet2, isContract: false },
          { id: wallet3, isContract: false },
        ],
        minter: [
          { id: wallet1, isContract: false },
          { id: wallet3, isContract: false },
        ],
      } as unknown as AccessControl;

      const result1 = mapUserRoles(wallet1, accessControl);
      const result2 = mapUserRoles(wallet2, accessControl);
      const result3 = mapUserRoles(wallet3, accessControl);

      expect(result1.admin).toBe(true);
      expect(result1.minter).toBe(true);

      expect(result2.admin).toBe(true);
      expect(result2.minter).toBe(false);

      expect(result3.admin).toBe(true);
      expect(result3.minter).toBe(true);
    });

    test("should handle all possible roles from AccessControlRoles type", () => {
      // Test that all roles defined in the initial state are handled
      const allRoles: AccessControlRoles[] = [
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
        "trustedIssuersMetaRegistryModule",
        "verificationAdmin",
      ];

      // Create accessControl with user having all roles
      const accessControl = allRoles.reduce(
        (acc, role) => {
          acc[role] = [{ id: mockWallet, isContract: false }];
          return acc;
        },
        { id: "access-manager-address" } as Record<
          AccessControlRoles,
          { id: EthereumAddress; isContract: boolean }[]
        > & { id: string }
      );

      const result = mapUserRoles(mockWallet, accessControl);

      // All roles should be true
      allRoles.forEach((role) => {
        expect(result[role]).toBe(true);
      });
    });
  });
});
