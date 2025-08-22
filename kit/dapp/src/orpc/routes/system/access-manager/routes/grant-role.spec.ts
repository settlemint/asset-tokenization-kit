// @vitest-environment node
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { getAddress } from "viem";
import { beforeAll, describe, expect, it } from "vitest";

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
    const [adminHeaders, investorHeaders] = await Promise.all([
      signInWithUser(DEFAULT_ADMIN),
      signInWithUser(DEFAULT_INVESTOR),
    ]);
    adminClient = getOrpcClient(adminHeaders);
    investorClient = getOrpcClient(investorHeaders);
  });

  describe("successful role grants", () => {
    it("should grant a single role to a single account", async () => {
      const result = await adminClient.system.accessManager.grantRole({
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
      expect(updatedSystemRoles?.roles).toContain("tokenManager");
    });

    it("should grant a single role to multiple accounts", async () => {
      const result = await adminClient.system.accessManager.grantRole({
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
        (role) =>
          role.account === testAddresses.valid1 ||
          role.account === testAddresses.valid2 ||
          role.account === testAddresses.valid3
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).toContain("complianceManager");
    });

    it("should grant multiple roles to a single account", async () => {
      const result = await adminClient.system.accessManager.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: ["tokenManager", "complianceManager"],
      });

      expect(result).toEqual({
        addresses: [testAddresses.valid1],
        roles: ["tokenManager", "complianceManager"],
      });

      const systemRoles = await adminClient.system.accessManager.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find(
        (role) => role.account === testAddresses.valid1
      );
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).toContain("tokenManager");
      expect(updatedSystemRoles?.roles).toContain("complianceManager");
    });

    it("should handle empty arrays", async () => {
      const result = await adminClient.system.accessManager.grantRole({
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
    it("should allow admin users to grant roles", async () => {
      const result = await adminClient.system.accessManager.grantRole({
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

    it("should reject non-admin users from granting roles", async () => {
      await expect(
        investorClient.system.accessManager.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: testAddresses.valid1,
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
        adminClient.system.accessManager.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: testAddresses.valid1,
          role: "invalidRole" as never,
        })
      ).rejects.toThrow("Input validation failed");
    });

    it("should reject invalid wallet addresses", async () => {
      await expect(
        adminClient.system.accessManager.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: testAddresses.invalid,
          role: "tokenManager",
        })
      ).rejects.toThrow("Input validation failed");
    });

    it("should reject mixed valid and invalid addresses", async () => {
      await expect(
        adminClient.system.accessManager.grantRole({
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
        })
      ).rejects.toThrow("Input validation failed");
    });

    it("should reject incorrect pincode verification", async () => {
      await expect(
        adminClient.system.accessManager.grantRole({
          walletVerification: {
            secretVerificationCode: "000000",
            verificationType: "PINCODE",
          },
          address: testAddresses.valid1,
          role: "tokenManager",
        })
      ).rejects.toThrow(/GraphQL.*failed|Invalid authentication challenge/);
    });
  });

  describe("edge cases", () => {
    it("should handle duplicate accounts in the array", async () => {
      const result = await adminClient.system.accessManager.grantRole({
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
      const result = await adminClient.system.accessManager.grantRole({
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
