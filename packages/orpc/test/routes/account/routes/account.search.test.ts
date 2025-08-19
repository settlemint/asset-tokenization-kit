import type { Mock } from "bun:test";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  createBaseContext,
  createMockErrors,
  getAuthHandler,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";

// Import route to register handler (after mocks are set up)
import "../../../../src/routes/account/routes/account.search";

describe("Account search (integration)", () => {
  let client: OrpcClient;
  let token: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getTestOrpcClient(headers);

    token = await createToken(client, {
      name: "Searchable Token",
      symbol: "SRT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("finds the token account by address and returns contractName", async () => {
    const results = await client.account.search({ query: token.id, limit: 1 });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(token.id);
    expect(results[0]?.contractName).toBeDefined();
  });
});

describe("account.search (unit)", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    const capturedHandler = getAuthHandler();
    if (!capturedHandler) {
      throw new Error("Handler not captured - check mock setup");
    }
    handler = capturedHandler;
    errors = createMockErrors();
  });

  it("returns empty array for non-address queries", async () => {
    const context = createBaseContext();

    const result = await handler({
      input: { query: "not-an-address", limit: 10 },
      context,
      errors,
    });

    expect(result).toEqual([]);
    // TheGraph query should not be called for non-address queries
    expect(context.theGraphClient.query).not.toHaveBeenCalled();
  });

  it("returns account with contractName when found", async () => {
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const context = createBaseContext();

    // Mock TheGraph query to return account data
    (context.theGraphClient.query as Mock<(...args: unknown[]) => Promise<unknown>>).mockResolvedValue({
      account: {
        id: ADDRESS,
        isContract: true,
        contractName: "UnitTestContract",
      },
    });

    const result = await handler({
      input: { query: ADDRESS, limit: 1 },
      context,
      errors,
    });

    expect(context.theGraphClient.query).toHaveBeenCalledWith(
      expect.anything(), // the GraphQL query
      { wallet: ADDRESS }
    );
    expect(result).toEqual([
      {
        id: ADDRESS,
        isContract: true,
        contractName: "UnitTestContract",
      },
    ]);
  });

  it("returns empty array when account not found", async () => {
    const ADDRESS = "0x2222222222222222222222222222222222222222" as const;
    const context = createBaseContext();

    // Mock TheGraph query to return null
    (context.theGraphClient.query as Mock<(...args: unknown[]) => Promise<unknown>>).mockResolvedValue({
      account: null,
    });

    const result = await handler({
      input: { query: ADDRESS, limit: 1 },
      context,
      errors,
    });

    expect(context.theGraphClient.query).toHaveBeenCalledWith(
      expect.anything(), // the GraphQL query
      { wallet: ADDRESS }
    );
    expect(result).toEqual([]);
  });

  it("handles partial address matches", async () => {
    const context = createBaseContext();

    // Test with partial address that's not a valid full address
    const partialAddress = "0x1111";

    const result = await handler({
      input: { query: partialAddress, limit: 10 },
      context,
      errors,
    });

    expect(result).toEqual([]);
    expect(context.theGraphClient.query).not.toHaveBeenCalled();
  });
});
