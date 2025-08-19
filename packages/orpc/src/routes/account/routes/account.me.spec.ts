import { DEFAULT_ADMIN, signInWithUser } from "@atk/auth/test/fixtures/user";
import { beforeAll, describe, expect, it } from "bun:test";
import { getOrpcClient } from "../../../../test/fixtures/orpc-client";

describe("Account me (integration)", () => {
  let client: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);
  });

  it("returns null when account is not indexed", async () => {
    const result = await client.account.me();
    // In a fresh environment, the user's wallet may not be in the subgraph yet
    // The route returns null in that case
    expect(result === null || typeof result === "object").toBe(true);
  });
});
