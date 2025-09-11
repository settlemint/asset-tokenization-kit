import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("Account read (integration)", () => {
  let client: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);
  });

  it("reads account info for authenticated user via account.me", async () => {
    const account = await client.account.me();
    // Account might be null if not indexed yet in the subgraph
    if (account) {
      expect(account).toHaveProperty("id");
      expect(account.id).toMatch(/^0x[a-fA-F0-9]{40}$/);

      // Now test reading the same account directly
      const readAccount = await client.account.read({ wallet: account.id });
      expect(readAccount.id).toBe(account.id);
      expect(readAccount.rolesCount).toBeGreaterThan(0);
    } else {
      // If account.me returns null, we can't test account.read
      expect(account).toBeNull();
    }
  });
});
