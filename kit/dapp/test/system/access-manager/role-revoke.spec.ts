// @vitest-environment node
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { ORPCError } from "@orpc/server";
import { getAddress } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../../utils/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "../../utils/user";

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
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Grant roles to the test addresses
    const rolesToGrant: AccessControlRoles[] = [
      "systemManager",
      "complianceManager",
      "tokenManager",
    ];
    await Promise.all(
      rolesToGrant.map((role) =>
        adminClient.system.grantRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [
            testAddresses.valid1,
            testAddresses.valid2,
            testAddresses.valid3,
          ],
          role,
        })
      )
    );
  });

  describe("successful role revokes", () => {
    it("should revoke a single role from a single account", async () => {
      const result = await adminClient.system.revokeRole({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        accounts: [testAddresses.valid1],
        role: "tokenManager",
      });

      expect(result).toEqual({
        accounts: [testAddresses.valid1],
      });

      const systemRoles = await adminClient.system.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).not.toContain("tokenManager");
    });

    it("should revoke a role from multiple accounts", async () => {
      const result = await adminClient.system.revokeRole({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        accounts: [
          testAddresses.valid1,
          testAddresses.valid2,
          testAddresses.valid3,
        ],
        role: "complianceManager",
      });

      expect(result).toEqual({
        accounts: [
          testAddresses.valid1,
          testAddresses.valid2,
          testAddresses.valid3,
        ],
      });

      const systemRoles = await adminClient.system.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).not.toContain("complianceManager");
    });

    it("should handle empty accounts array", async () => {
      const result = await adminClient.system.revokeRole({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        accounts: [],
        role: "tokenManager",
      });

      expect(result).toEqual({
        accounts: [],
      });
    });
  });

  describe("permission validation", () => {
    it("should allow admin users to revoke roles", async () => {
      const result = await adminClient.system.revokeRole({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        accounts: [testAddresses.valid1],
        role: "tokenManager",
      });

      expect(result).toEqual({
        accounts: [testAddresses.valid1],
      });
    });

    it("should reject non-admin users from revoking roles", async () => {
      await expect(
        investorClient.system.revokeRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "tokenManager",
        })
      ).rejects.toThrow(
        new ORPCError("USER_NOT_AUTHORIZED", {
          message:
            "User does not have the required role to execute this action.",
        })
      );
    });
  });

  describe("error handling", () => {
    it("should reject invalid role names", async () => {
      await expect(
        adminClient.system.revokeRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "invalidRole" as never,
        })
      ).rejects.toThrow(new ORPCError("INPUT_VALIDATION_FAILED"));
    });

    it("should reject invalid wallet addresses", async () => {
      await expect(
        adminClient.system.revokeRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.invalid],
          role: "tokenManager",
        })
      ).rejects.toThrow(new ORPCError("INPUT_VALIDATION_FAILED"));
    });

    it("should reject mixed valid and invalid addresses", async () => {
      await expect(
        adminClient.system.revokeRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [
            testAddresses.valid1,
            testAddresses.invalid,
            testAddresses.valid2,
          ],
          role: "tokenManager",
        })
      ).rejects.toThrow(new ORPCError("INPUT_VALIDATION_FAILED"));
    });

    it("should reject incorrect pincode verification", async () => {
      await expect(
        adminClient.system.revokeRole({
          verification: {
            verificationCode: "000000",
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "tokenManager",
        })
      ).rejects.toThrow(
        new ORPCError("PORTAL_ERROR", {
          message: "Invalid authentication challenge",
        })
      );
    });
  });

  describe("edge cases", () => {
    it("should handle duplicate accounts in the array", async () => {
      const result = await adminClient.system.revokeRole({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        accounts: [
          testAddresses.valid1,
          testAddresses.valid1,
          testAddresses.valid2,
        ],
        role: "tokenManager",
      });
      expect(result.accounts).toEqual([
        testAddresses.valid1,
        testAddresses.valid2,
      ]);
    });
  });
});
