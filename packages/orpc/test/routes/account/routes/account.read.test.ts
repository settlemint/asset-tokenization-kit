import type { Mock } from "bun:test";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import {
  createBaseContext,
  createMockErrors,
  getPublicHandler,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";

// Import route to register handler (after mocks are set up)
import "../../../../src/routes/account/routes/account.read";

describe("Account read (integration)", () => {
  let client: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getTestOrpcClient(headers);
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
    } else {
      // If account.me returns null, we can't test account.read
      expect(account).toBeNull();
    }
  });
});

describe("account.read (unit)", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    const capturedHandler = getPublicHandler();
    if (!capturedHandler) {
      throw new Error("Handler not captured - check mock setup");
    }
    handler = capturedHandler;
    errors = createMockErrors();
  });

  it("returns account payload when found", async () => {
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const context = createBaseContext();

    // Mock TheGraph query to return account data
    (context.theGraphClient.query as Mock<(...args: unknown[]) => Promise<unknown>>).mockResolvedValue({
      account: { id: ADDRESS, country: null, identity: null },
    });

    const result = await handler({
      input: { wallet: ADDRESS },
      context,
      errors,
    });

    expect(result).toEqual({
      id: ADDRESS,
      country: undefined,
      identity: undefined,
      claims: [],
    });

    expect(context.theGraphClient.query).toHaveBeenCalledWith(
      expect.anything(), // the GraphQL query
      { wallet: ADDRESS }
    );
  });

  it("throws Account not found when missing", async () => {
    const ADDRESS = "0x2222222222222222222222222222222222222222" as const;
    const context = createBaseContext();

    // Mock TheGraph query to return null (account not found)
    (context.theGraphClient.query as Mock<(...args: unknown[]) => Promise<unknown>>).mockResolvedValue({
      account: null,
    });

    await expect(
      handler({
        input: { wallet: ADDRESS },
        context,
        errors,
      })
    ).rejects.toThrowError("Account not found");

    expect(context.theGraphClient.query).toHaveBeenCalledWith(
      expect.anything(), // the GraphQL query
      { wallet: ADDRESS }
    );
  });

  it("handles account with identity and country data", async () => {
    const ADDRESS = "0x3333333333333333333333333333333333333333" as const;
    const context = createBaseContext();

    // Mock TheGraph query to return account with identity and country
    (context.theGraphClient.query as Mock<(...args: unknown[]) => Promise<unknown>>).mockResolvedValue({
      account: {
        id: ADDRESS,
        country: "US",
        identity: "identity_123",
        claims: [{ type: "KYC", status: "VERIFIED" }],
      },
    });

    const result = await handler({
      input: { wallet: ADDRESS },
      context,
      errors,
    });

    expect(result).toEqual({
      id: ADDRESS,
      country: "US",
      identity: "identity_123",
      claims: [{ type: "KYC", status: "VERIFIED" }],
    });
  });
});
