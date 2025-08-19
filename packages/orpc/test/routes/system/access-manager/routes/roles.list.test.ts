import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import {
  createBaseContext,
  createMockErrors,
  getOnboardedHandler,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";
import "../../../../../src/routes/system/access-manager/routes/roles.list";

function getHandler(): OrpcHandler<{ excludeContracts?: boolean }, Array<{ account: string; roles: string[] }>> {
  const handler = getOnboardedHandler();
  if (!handler) {
    throw new Error("Handler not captured");
  }
  return handler as OrpcHandler<{ excludeContracts?: boolean }, Array<{ account: string; roles: string[] }>>;
}

// Integration test for roles.list route

describe("Access Manager - Roles List ORPC routes (integration)", () => {
  let adminClient: ReturnType<typeof getTestOrpcClient>;

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getTestOrpcClient(adminHeaders);

    // Ensure there is at least one role to list by granting a role to admin
    const me = await adminClient.account.me({});
    if (me) {
      await adminClient.system.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: me.id,
        role: "systemManager",
      });
    }
  });

  it("should return roles grouped by account and respect excludeContracts flag", async () => {
    const all = await adminClient.system.rolesList({ excludeContracts: false });
    const filtered = await adminClient.system.rolesList({
      excludeContracts: true,
    });

    // Basic shape checks
    expect(Array.isArray(all)).toBe(true);
    expect(Array.isArray(filtered)).toBe(true);

    // Find the admin in the list and ensure roles is a non-empty array of strings
    const adminEntry = all.find((e) => e.account && e.roles && Array.isArray(e.roles));
    expect(adminEntry).toBeDefined();
    expect(adminEntry?.roles.length).toBeGreaterThan(0);

    // Filtered should be a subset (contracts removed)
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });
});

describe("system.access-manager.roles.list unit", () => {
  let handler: OrpcHandler<{ excludeContracts?: boolean }, Array<{ account: string; roles: string[] }>>;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("returns empty array when no access control", async () => {
    const context = createBaseContext({
      system: { systemAccessManager: { id: "0x0", accessControl: undefined } },
    });
    const result = await handler({
      input: { excludeContracts: false },
      context,
      errors,
    });
    expect(result).toEqual([]);
  });

  it("groups roles per account and filters contracts when requested", async () => {
    const accessControl = {
      id: "system",
      admin: [
        { id: "0xaaaaa00000000000000000000000000000000000", isContract: false },
        { id: "0xccccc00000000000000000000000000000000000", isContract: true },
      ],
      tokenManager: [
        { id: "0xaaaaa00000000000000000000000000000000000", isContract: false },
        { id: "0xbbbbb00000000000000000000000000000000000", isContract: false },
      ],
    };

    const context = createBaseContext({
      system: { systemAccessManager: { id: "0x0", accessControl } },
    });

    const all = (await handler({
      input: { excludeContracts: false },
      context,
      errors,
    })) as Array<{
      account: string;
      roles: string[];
    }>;
    const filtered = (await handler({
      input: { excludeContracts: true },
      context,
      errors,
    })) as Array<{
      account: string;
      roles: string[];
    }>;

    expect(all).toEqual(
      expect.arrayContaining([
        {
          account: getEthereumAddress("0xaaaaa00000000000000000000000000000000000"),
          roles: expect.arrayContaining(["admin", "tokenManager"]),
        },
        {
          account: getEthereumAddress("0xbbbbb00000000000000000000000000000000000"),
          roles: ["tokenManager"],
        },
        {
          account: getEthereumAddress("0xccccc00000000000000000000000000000000000"),
          roles: ["admin"],
        },
      ])
    );

    expect(filtered).toEqual(
      expect.arrayContaining([
        {
          account: getEthereumAddress("0xaaaaa00000000000000000000000000000000000"),
          roles: expect.arrayContaining(["admin", "tokenManager"]),
        },
        {
          account: getEthereumAddress("0xbbbbb00000000000000000000000000000000000"),
          roles: ["tokenManager"],
        },
      ])
    );
    expect(
      filtered.find((r) => r.account === getEthereumAddress("0xccccc00000000000000000000000000000000000"))
    ).toBeUndefined();
  });
});
