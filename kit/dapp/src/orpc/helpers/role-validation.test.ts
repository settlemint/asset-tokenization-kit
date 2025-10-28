/**
 * @vitest-environment node
 */

import {
  roles,
  type AccessControl,
  type AccessControlRoles,
} from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { zeroAddress } from "viem";
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
        complianceManager: false,
        claimPolicyManager: false,
        claimIssuer: false,
        custodian: false,
        emergency: false,
        fundsManager: false,
        governance: false,
        identityManager: false,
        identityRegistryModule: false,
        organisationIdentityManager: false,
        saleAdmin: false,
        supplyManagement: false,
        systemManager: false,
        systemModule: false,
        tokenFactoryModule: false,
        tokenFactoryRegistryModule: false,
        tokenManager: false,
        trustedIssuersMetaRegistryModule: false,
      });
    });

    test("should correctly identify user roles when user has single role", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        auditor: [{ id: anotherWallet, isContract: false }],
        complianceManager: [],
        roleAdmins: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      // All other roles should be false
      expect(result.addonManager).toBe(false);
    });

    test("should correctly identify user roles when user has multiple roles", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        addonManager: [
          { id: mockWallet, isContract: false },
          { id: anotherWallet, isContract: false },
        ],
        tokenManager: [
          { id: anotherWallet, isContract: false },
          { id: mockWallet, isContract: false },
        ],
        auditor: [{ id: anotherWallet, isContract: false }],
        roleAdmins: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.addonManager).toBe(true);
      expect(result.tokenManager).toBe(true);
      expect(result.auditor).toBe(false);
    });

    test("should handle case-insensitive wallet address comparison", () => {
      const walletAddress = "0xabCDef1234567890aBCdEF1234567890abCDef";
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: walletAddress.toLowerCase(), isContract: false }],
        auditor: [{ id: walletAddress.toUpperCase(), isContract: false }],
        complianceManager: [{ id: walletAddress, isContract: false }], // mixed case
        roleAdmins: [],
      } as unknown as AccessControl;

      // Test with lowercase wallet
      const resultForLowercase = mapUserRoles(
        walletAddress.toLowerCase() as EthereumAddress,
        accessControl
      );
      expect(resultForLowercase.admin).toBe(true);
      expect(resultForLowercase.auditor).toBe(true);
      expect(resultForLowercase.complianceManager).toBe(true);

      // Test with uppercase wallet
      const resultForUppercase = mapUserRoles(
        walletAddress.toUpperCase() as EthereumAddress,
        accessControl
      );
      expect(resultForUppercase.admin).toBe(true);
      expect(resultForUppercase.auditor).toBe(true);
      expect(resultForUppercase.complianceManager).toBe(true);

      // Test with mixed-case wallet
      const resultForMixedCase = mapUserRoles(
        walletAddress as EthereumAddress,
        accessControl
      );
      expect(resultForMixedCase.admin).toBe(true);
      expect(resultForMixedCase.auditor).toBe(true);
      expect(resultForMixedCase.complianceManager).toBe(true);
    });

    test("should handle empty accessControl object", () => {
      const accessControl = {
        id: "access-manager-address",
        roleAdmins: [],
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
        auditor: [{ id: anotherWallet, isContract: false }],
        roleAdmins: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.auditor).toBe(false);
    });

    test("should handle accessControl with invalid role values", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }],
        auditor: null, // Invalid value
        complianceManager: "invalid", // Invalid value
        custodian: undefined, // Invalid value
        tokenManager: {}, // Invalid value
        roleAdmins: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      // Should still correctly identify valid roles
      expect(result.admin).toBe(true);
      // Invalid roles should be false
      expect(result.auditor).toBe(false);
      expect(result.complianceManager).toBe(false);
      expect(result.custodian).toBe(false);
      expect(result.tokenManager).toBe(false);
    });

    test("should handle malformed role values", () => {
      // The getAccessControlEntries function validates arrays, so malformed values
      // like null/undefined/non-arrays will be filtered out
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: mockWallet, isContract: false }], // Valid
        auditor: null, // Will be filtered out
        complianceManager: undefined, // Will be filtered out
        custodian: "not-an-array", // Will be filtered out
        tokenManager: {}, // Will be filtered out
        roleAdmins: [],
      } as unknown as AccessControl;

      const result = mapUserRoles(mockWallet, accessControl);

      expect(result.admin).toBe(true);
      expect(result.auditor).toBe(false);
      expect(result.complianceManager).toBe(false);
      expect(result.custodian).toBe(false);
      expect(result.tokenManager).toBe(false);
    });

    test("should return false for all roles when wallet is not in any role", () => {
      const accessControl = {
        id: "access-manager-address",
        admin: [{ id: anotherWallet, isContract: false }],
        auditor: [{ id: anotherWallet, isContract: false }],
        complianceManager: [
          {
            id: "0x9999999999999999999999999999999999999999",
            isContract: false,
          },
        ],
        roleAdmins: [],
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
        auditor: [
          { id: wallet1, isContract: false },
          { id: wallet3, isContract: false },
        ],
        roleAdmins: [],
      } as unknown as AccessControl;

      const result1 = mapUserRoles(wallet1, accessControl);
      const result2 = mapUserRoles(wallet2, accessControl);
      const result3 = mapUserRoles(wallet3, accessControl);

      expect(result1.admin).toBe(true);
      expect(result1.auditor).toBe(true);

      expect(result2.admin).toBe(true);
      expect(result2.auditor).toBe(false);

      expect(result3.admin).toBe(true);
      expect(result3.auditor).toBe(true);
    });

    test("should handle all possible roles from AccessControlRoles type", () => {
      // Test that all roles defined in the initial state are handled

      const rolesData: Record<
        AccessControlRoles,
        { id: EthereumAddress; isContract: boolean }[]
      > = {} as Record<
        AccessControlRoles,
        { id: EthereumAddress; isContract: boolean }[]
      >;
      roles.map((role: AccessControlRoles) => {
        rolesData[role] = [{ id: mockWallet, isContract: false }];
      });

      // Create a valid AccessControl object with all roles containing the mock wallet
      const accessControl: AccessControl = {
        id: zeroAddress,
        ...rolesData,
        roleAdmins: [],
      };

      const result = mapUserRoles(mockWallet, accessControl);

      // All roles should be true
      roles.forEach((role: AccessControlRoles) => {
        expect(result[role]).toBe(true);
      });
    });
  });
});
