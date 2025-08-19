// @bun:test-environment node
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { beforeAll, describe, expect, it } from "bun:test";
import { getOrpcClient } from "../../../test/fixtures/orpc-client";

// Integration test for roles.list route

describe("Access Manager - Roles List ORPC routes (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

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
  }, 60_000);

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
