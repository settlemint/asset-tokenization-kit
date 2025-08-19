// @bun:test-environment node

import type { Mock } from "bun:test";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_INVESTOR, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import {
  createBaseContext,
  createMockErrors,
  getPortalHandler,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";
import { getAddress } from "viem";
import "../../../../../src/routes/system/access-manager/routes/grant-role";

function getHandler(): OrpcHandler {
  const handler = getPortalHandler();
  if (!handler) {
    throw new Error("Handler not captured");
  }
  return handler;
}

describe("Access Manager - Grant Role ORPC routes", () => {
  let adminClient: ReturnType<typeof getTestOrpcClient>;
  let investorClient: ReturnType<typeof getTestOrpcClient>;

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
    adminClient = getTestOrpcClient(adminHeaders);
    investorClient = getTestOrpcClient(investorHeaders);
  });

  describe("successful role grants", () => {
    it("should grant a single role to a single account", async () => {
      const result = await adminClient.system.grantRole({
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

      const systemRoles = await adminClient.system.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find((role) => role.account === testAddresses.valid1);
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).toContain("tokenManager");
    });

    it("should grant a single role to multiple accounts", async () => {
      const result = await adminClient.system.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: [testAddresses.valid1, testAddresses.valid2, testAddresses.valid3],
        role: "complianceManager",
      });

      expect(result).toEqual({
        addresses: [testAddresses.valid1, testAddresses.valid2, testAddresses.valid3],
        roles: ["complianceManager"],
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

    it("should grant multiple roles to a single account", async () => {
      const result = await adminClient.system.grantRole({
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

      const systemRoles = await adminClient.system.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find((role) => role.account === testAddresses.valid1);
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).toContain("tokenManager");
      expect(updatedSystemRoles?.roles).toContain("complianceManager");
    });

    it("should handle empty arrays", async () => {
      const result = await adminClient.system.grantRole({
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
      const result = await adminClient.system.grantRole({
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
        investorClient.system.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: testAddresses.valid1,
          role: "tokenManager",
        })
      ).rejects.toThrow("User does not have the required role to execute this action.");
    });
  });

  describe("error handling", () => {
    it("should reject invalid role names", async () => {
      await expect(
        adminClient.system.grantRole({
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
        adminClient.system.grantRole({
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
        adminClient.system.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: [testAddresses.valid1, testAddresses.invalid, testAddresses.valid2],
          role: "tokenManager",
        })
      ).rejects.toThrow("Input validation failed");
    });

    it("should reject incorrect pincode verification", async () => {
      await expect(
        adminClient.system.grantRole({
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
      const result = await adminClient.system.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: [testAddresses.valid1, testAddresses.valid1, testAddresses.valid2],
        role: "tokenManager",
      });
      expect(result.addresses).toEqual([testAddresses.valid1, testAddresses.valid2]);
      expect(result.roles).toEqual(["tokenManager"]);
    });

    it("should handle duplicate roles in the array", async () => {
      const result = await adminClient.system.grantRole({
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

describe("system.access-manager.grant-role unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("single address, single role -> uses GRANT_ROLE mutation", async () => {
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: "0x1234567890123456789012345678901234567890",
        role: "tokenManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result).toEqual({
      addresses: ["0x1234567890123456789012345678901234567890"],
      roles: ["tokenManager"],
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    const call = (context.portalClient.mutate as Mock<any>).mock.calls[0];
    expect(call?.[1]).toMatchObject({
      address: context.system.systemAccessManager.id,
      from: context.auth.user.wallet,
      account: "0x1234567890123456789012345678901234567890",
      role: expect.stringMatching(/^0x[0-9a-f]{64}$/),
    });
    // Check the third argument (walletVerification)
    expect(call?.[2]).toMatchObject({
      sender: context.auth.user,
      code: "123456",
      type: "PINCODE",
    });
  });

  it("multiple addresses, single role -> uses BATCH_GRANT_ROLE mutation", async () => {
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
          "0x1111111111111111111111111111111111111111",
        ],
        role: "complianceManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result.addresses).toEqual([
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
    ]);
    expect(result.roles).toEqual(["complianceManager"]);

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    const call = (context.portalClient.mutate as Mock<any>).mock.calls[0];
    expect(call?.[1]).toMatchObject({
      accounts: ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"],
      role: expect.stringMatching(/^0x[0-9a-f]{64}$/),
    });
  });

  it("single address, multiple roles -> uses GRANT_MULTIPLE_ROLES mutation", async () => {
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: "0x3333333333333333333333333333333333333333",
        role: ["systemManager", "tokenManager", "tokenManager"],
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result.addresses).toEqual(["0x3333333333333333333333333333333333333333"]);
    expect(result.roles).toEqual(["systemManager", "tokenManager"]);

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    const call = (context.portalClient.mutate as Mock<any>).mock.calls[0];
    expect(call?.[1]).toMatchObject({
      account: "0x3333333333333333333333333333333333333333",
      roles: expect.arrayContaining([
        expect.stringMatching(/^0x[0-9a-f]{64}$/),
        expect.stringMatching(/^0x[0-9a-f]{64}$/),
      ]),
    });
  });

  it("multiple addresses and multiple roles -> rejects with INPUT_VALIDATION_FAILED", async () => {
    const context = createBaseContext();

    await expect(
      handler({
        input: {
          walletVerification: {
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          },
          address: ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"],
          role: ["systemManager", "tokenManager"],
        },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "INPUT_VALIDATION_FAILED" });
  });

  it("invalid roles -> NOT_FOUND", async () => {
    const context = createBaseContext();
    await expect(
      handler({
        input: {
          walletVerification: {
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          },
          address: "0x1234567890123456789012345678901234567890",

          role: ["invalidRole" as unknown as never],
        },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns empty arrays when inputs are empty after normalization", async () => {
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: [],
        role: "tokenManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result).toEqual({ addresses: [], roles: [] });
    expect(context.portalClient.mutate).not.toHaveBeenCalled();
  });
});
