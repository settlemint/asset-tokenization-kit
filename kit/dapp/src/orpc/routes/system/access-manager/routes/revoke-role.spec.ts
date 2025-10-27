// @vitest-environment node
import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import type { SystemAccessControlRoles } from "@atk/zod/access-control-roles";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { getAddress } from "viem";
import { beforeAll, describe, expect, it } from "vitest";

describe("Access Manager - Revoke Role ORPC routes", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;

  const testAddresses = {
    valid1: getAddress("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"),
    valid2: getAddress("0xbcdefabcdefabcdefabcdefabcdefabcdefabcde"),
    valid3: getAddress("0xcdefabcdefabcdefabcdefabcdefabcdefabcdef"),
    invalid: "0xinvalid",
  };

  beforeAll(async () => {
    const [adminHeaders, investorHeaders] = await Promise.all([
      signInWithUser(DEFAULT_ADMIN),
      signInWithUser(DEFAULT_INVESTOR),
    ]);
    adminClient = getOrpcClient(adminHeaders);
    investorClient = getOrpcClient(investorHeaders);

    // Grant roles to the test addresses
    const rolesToGrant: SystemAccessControlRoles[] = [
      "systemManager",
      "complianceManager",
      "tokenManager",
    ];
    await Promise.all(
      rolesToGrant.map((role) =>
        adminClient.system.accessManager.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: [
            testAddresses.valid1,
            testAddresses.valid2,
            testAddresses.valid3,
          ],
          role,
        })
      )
    );
  }, 60_000);

  describe("successful role revokes", () => {
    it("should revoke a single role from a single account", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: "tokenManager",
      });

      expect(result).toEqual({
        addresses: [testAddresses.valid1],
        roles: ["tokenManager"],
      });

      const systemRoles = await adminClient.system.accessManager.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).not.toContain("tokenManager");
    });

    it("should revoke a single role from multiple accounts", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: [
          testAddresses.valid1,
          testAddresses.valid2,
          testAddresses.valid3,
        ],
        role: "complianceManager",
      });

      expect(result).toEqual({
        addresses: [
          testAddresses.valid1,
          testAddresses.valid2,
          testAddresses.valid3,
        ],
        roles: ["complianceManager"],
      });

      const systemRoles = await adminClient.system.accessManager.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).not.toContain("complianceManager");
    });

    it("should revoke multiple roles from a single account", async () => {
      // Grant the roles first since previous tests may have revoked them
      await adminClient.system.accessManager.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: ["systemManager", "tokenManager"],
      });

      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: ["systemManager", "tokenManager"],
      });

      expect(result).toEqual({
        addresses: [testAddresses.valid1],
        roles: ["systemManager", "tokenManager"],
      });

      const systemRoles = await adminClient.system.accessManager.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles?.roles ?? []).not.toContain("systemManager");
      expect(updatedSystemRoles?.roles ?? []).not.toContain("tokenManager");
    });

    it("should handle empty arrays", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: [],
        role: "tokenManager",
      });

      expect(result).toEqual({
        addresses: [],
        roles: [],
      });
    });
  });

  describe("permission validation", () => {
    it("should allow admin users to revoke roles", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: "tokenManager",
      });

      expect(result).toEqual({
        addresses: [testAddresses.valid1],
        roles: ["tokenManager"],
      });
    });

    it("should reject non-admin users from revoking roles", async () => {
      await expect(
        investorClient.system.accessManager.revokeRole(
          {
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
            address: testAddresses.valid1,
            role: "tokenManager",
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
      );
    });
  });

  describe("error handling", () => {
    it("should reject invalid role names", async () => {
      await expect(
        adminClient.system.accessManager.revokeRole(
          {
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
            address: testAddresses.valid1,
            role: "invalidRole" as never,
          },
          {
            context: {
              skipLoggingFor: [
                CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED,
                CUSTOM_ERROR_CODES.BAD_REQUEST,
              ],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED)
      );
    });

    it("should reject invalid wallet addresses", async () => {
      await expect(
        adminClient.system.accessManager.revokeRole(
          {
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
            address: testAddresses.invalid,
            role: "tokenManager",
          },
          {
            context: {
              skipLoggingFor: [
                CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED,
                CUSTOM_ERROR_CODES.BAD_REQUEST,
              ],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED)
      );
    });

    it("should reject mixed valid and invalid addresses", async () => {
      await expect(
        adminClient.system.accessManager.revokeRole(
          {
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
            address: [
              testAddresses.valid1,
              testAddresses.invalid,
              testAddresses.valid2,
            ],
            role: "tokenManager",
          },
          {
            context: {
              skipLoggingFor: [
                CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED,
                CUSTOM_ERROR_CODES.BAD_REQUEST,
              ],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED)
      );
    });

    it("should reject incorrect pincode verification", async () => {
      await expect(
        adminClient.system.accessManager.revokeRole(
          {
            walletVerification: {
              secretVerificationCode: "000000",
              verificationType: "PINCODE",
            },
            address: testAddresses.valid1,
            role: "tokenManager",
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.PORTAL_ERROR],
            },
          }
        )
      ).rejects.toThrow(/GraphQL.*failed|Invalid authentication challenge/);
    });
  });

  describe("edge cases", () => {
    it("should handle duplicate accounts in the array", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: [
          testAddresses.valid1,
          testAddresses.valid1,
          testAddresses.valid2,
        ],
        role: "tokenManager",
      });
      expect(result.addresses).toEqual([
        testAddresses.valid1,
        testAddresses.valid2,
      ]);
      expect(result.roles).toEqual(["tokenManager"]);
    });

    it("should handle duplicate roles in the array", async () => {
      const result = await adminClient.system.accessManager.revokeRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: ["tokenManager", "tokenManager", "complianceManager"],
      });
      expect(result.addresses).toEqual([testAddresses.valid1]);
      expect(result.roles).toEqual(["tokenManager", "complianceManager"]);
    });
  });
});
