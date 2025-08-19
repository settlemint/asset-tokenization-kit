// @bun:test-environment node

import type { Mock } from "bun:test";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import type { AccessControlRoles } from "@atk/auth/fragments/the-graph/access-control-fragment";
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
import "../../../../../src/routes/system/access-manager/routes/revoke-role";

function getHandler(): OrpcHandler {
  const handler = getPortalHandler();
  if (!handler) {
    throw new Error("Handler not captured");
  }
  return handler;
}

describe("Access Manager - Revoke Role ORPC routes", () => {
  let adminClient: ReturnType<typeof getTestOrpcClient>;
  let investorClient: ReturnType<typeof getTestOrpcClient>;

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
    adminClient = getTestOrpcClient(adminHeaders);
    investorClient = getTestOrpcClient(investorHeaders);

    // Grant roles to the test addresses
    const rolesToGrant: AccessControlRoles[] = ["systemManager", "complianceManager", "tokenManager"];
    await Promise.all(
      rolesToGrant.map((role) =>
        adminClient.system.grantRole({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          address: [testAddresses.valid1, testAddresses.valid2, testAddresses.valid3],
          role,
        })
      )
    );
  });

  describe("successful role revokes", () => {
    it("should revoke a single role from a single account", async () => {
      const result = await adminClient.system.revokeRole({
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
      expect(updatedSystemRoles?.roles).not.toContain("tokenManager");
    });

    it("should revoke a single role from multiple accounts", async () => {
      const result = await adminClient.system.revokeRole({
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
      const updatedSystemRoles = systemRoles.find((role) => role.account === testAddresses.valid1);
      expect(updatedSystemRoles).toBeDefined();
      expect(updatedSystemRoles?.roles).not.toContain("complianceManager");
    });

    it("should revoke multiple roles from a single account", async () => {
      // Grant the roles first since previous tests may have revoked them
      await adminClient.system.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: testAddresses.valid1,
        role: ["systemManager", "tokenManager"],
      });

      const result = await adminClient.system.revokeRole({
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

      const systemRoles = await adminClient.system.rolesList({
        excludeContracts: true,
      });
      const updatedSystemRoles = systemRoles.find((role) => role.account === testAddresses.valid1);
      expect(updatedSystemRoles?.roles ?? []).not.toContain("systemManager");
      expect(updatedSystemRoles?.roles ?? []).not.toContain("tokenManager");
    });

    it("should handle empty arrays", async () => {
      const result = await adminClient.system.revokeRole({
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
      const result = await adminClient.system.revokeRole({
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
        investorClient.system.revokeRole({
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
        adminClient.system.revokeRole({
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
        adminClient.system.revokeRole({
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
        adminClient.system.revokeRole({
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
        adminClient.system.revokeRole({
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
      const result = await adminClient.system.revokeRole({
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
      const result = await adminClient.system.revokeRole({
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

describe("system.access-manager.revoke-role unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("single address, single role -> uses REVOKE_ROLE mutation", async () => {
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

    // returns normalized
    expect(result).toEqual({
      addresses: ["0x1234567890123456789012345678901234567890"],
      roles: ["tokenManager"],
    });

    // called correct mutation with bytes role and account
    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    const call = (context.portalClient.mutate as Mock<(...args: unknown[]) => unknown>).mock.calls[0];
    // variables object is at index 1
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

  it("multiple addresses, single role -> uses BATCH_REVOKE_ROLE mutation", async () => {
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
          "0x1111111111111111111111111111111111111111", // duplicate
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
    const call = (context.portalClient.mutate as Mock<(...args: unknown[]) => unknown>).mock.calls[0];
    expect(call?.[1]).toMatchObject({
      accounts: ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"],
      role: expect.stringMatching(/^0x[0-9a-f]{64}$/),
    });
  });

  it("single address, multiple roles -> uses REVOKE_MULTIPLE_ROLES mutation", async () => {
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
    const call = (context.portalClient.mutate as Mock<(...args: unknown[]) => unknown>).mock.calls[0];
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

  it("handles missing system.accessManager with INTERNAL_SERVER_ERROR", async () => {
    const handler = getHandler();
    const context = createBaseContext({ system: undefined });

    await expect(
      handler({
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
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
