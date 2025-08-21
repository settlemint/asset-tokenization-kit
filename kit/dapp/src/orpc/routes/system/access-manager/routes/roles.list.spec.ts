// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";

// Integration test for roles.list route

describe("Access Manager - Roles List ORPC routes (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Ensure there is at least one role to list by granting a role to admin
    const me = await adminClient.account.me({});
    if (me) {
      await adminClient.system.accessManager.grantRole({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        address: me.id,
        role: "systemManager",
      });
    }
  }, 60_000);

  it("should return roles grouped by account and respect excludeContracts flag", async () => {
    const all = await adminClient.system.accessManager.rolesList({
      excludeContracts: false,
    });
    const filtered = await adminClient.system.accessManager.rolesList({
      excludeContracts: true,
    });

    // Basic shape checks
    expect(Array.isArray(all)).toBe(true);
    expect(Array.isArray(filtered)).toBe(true);

    // Find the admin in the list and ensure roles is a non-empty array of strings
    const adminEntry = all.find(
      (e) => e.account && e.roles && Array.isArray(e.roles)
    );
    expect(adminEntry).toBeDefined();
    expect(adminEntry?.roles.length).toBeGreaterThan(0);

    // Filtered should be a subset (contracts removed)
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });
});
