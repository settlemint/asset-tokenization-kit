// @vitest-environment node
import { getAddress } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";

describe("Access Manager - Grant Role ORPC routes", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;

  const testAddresses = {
    valid1: getAddress("0x1234567890123456789012345678901234567890"),
    valid2: getAddress("0x2345678901234567890123456789012345678901"),
    valid3: getAddress("0x3456789012345678901234567890123456789012"),
    invalid: "0xinvalid",
  };

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);
  });

  describe("successful role grants", () => {
    it("should grant a single role to a single account", async () => {
      const result = await adminClient.system.grantRole({
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
      expect(updatedSystemRoles?.roles).toContain("tokenManager");
    });

    it("should grant a role to multiple accounts", async () => {
      const result = await adminClient.system.grantRole({
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
        (role) =>
          role.account === testAddresses.valid1 ||
          role.account === testAddresses.valid2 ||
          role.account === testAddresses.valid3
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).toContain("complianceManager");
    });

    it("should handle empty accounts array", async () => {
      const result = await adminClient.system.grantRole({
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
    it("should allow admin users to grant roles", async () => {
      const result = await adminClient.system.grantRole({
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

    it("should reject non-admin users from granting roles", async () => {
      await expect(
        investorClient.system.grantRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "tokenManager",
        })
      ).rejects.toThrow(
        "User does not have the required role to execute this action."
      );
    });
  });

  describe("error handling", () => {
    it("should reject invalid role names", async () => {
      await expect(
        adminClient.system.grantRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "invalidRole" as never,
        })
      ).rejects.toThrow("INPUT_VALIDATION_FAILED");
    });

    it("should reject invalid wallet addresses", async () => {
      await expect(
        adminClient.system.grantRole({
          verification: {
            verificationCode: DEFAULT_PINCODE,
            verificationType: "pincode",
          },
          accounts: [testAddresses.invalid],
          role: "tokenManager",
        })
      ).rejects.toThrow("INPUT_VALIDATION_FAILED");
    });

    it("should reject mixed valid and invalid addresses", async () => {
      await expect(
        adminClient.system.grantRole({
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
      ).rejects.toThrow("INPUT_VALIDATION_FAILED");
    });

    it("should reject incorrect pincode verification", async () => {
      await expect(
        adminClient.system.grantRole({
          verification: {
            verificationCode: "000000",
            verificationType: "pincode",
          },
          accounts: [testAddresses.valid1],
          role: "tokenManager",
        })
      ).rejects.toThrow("Invalid authentication challenge");
    });
  });

  describe("edge cases", () => {
    it("should handle duplicate accounts in the array", async () => {
      const result = await adminClient.system.grantRole({
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
