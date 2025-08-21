import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Token read", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Create a test token to read
    testToken = await createToken(client, {
      name: "Test Read Token",
      symbol: "TRT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("can read token details", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Verify basic token properties
    expect(token).toBeDefined();
    expect(token.id).toBe(testToken.id);
    expect(token.symbol).toBe("TRT");
    expect(token.decimals).toBe(18);
    expect(token.type).toBe("stablecoin");
  });

  it("returns correct token metadata", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check extended token properties
    expect(token.totalSupply).toBeDefined();
    expect(token.totalSupply).toEqual(from("0")); // New token should have 0 supply
    expect(token.createdAt).toBeInstanceOf(Date);
    expect(token.pausable).toBeDefined();
    expect(token.pausable?.paused).toBe(true); // Tokens start paused by default
    expect(token.extensions).toBeInstanceOf(Array);
  });

  it("throws error for non-existent token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Use a valid but non-existent address
    await expect(
      client.token.read(
        {
          tokenAddress: "0x0000000000000000000000000000000000000001",
        },
        {
          context: {
            expectErrors: [CUSTOM_ERROR_CODES.THE_GRAPH_ERROR],
          },
        }
      )
    ).rejects.toThrow();
  });

  it("throws error for invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.read(
        {
          tokenAddress: "invalid-address" as unknown as string,
        },
        {
          context: {
            expectErrors: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
          },
        }
      )
    ).rejects.toThrow("Token address is not a valid Ethereum address");
  });

  it("includes token-specific metadata when present", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check for optional token-specific metadata
    // These may be null depending on token type
    expect(token.capped).toBeDefined(); // May be null
    expect(token.redeemable).toBeDefined(); // May be null
    expect(token.bond).toBeDefined(); // May be null for non-bond tokens
    expect(token.fund).toBeDefined(); // May be null for non-fund tokens
    expect(token.collateral).toBeDefined(); // May be null for non-collateral tokens
  });

  it("returns implementation flags correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check implementation flags
    expect(typeof token.implementsERC3643).toBe("boolean");
    expect(typeof token.implementsSMART).toBe("boolean");
  });

  it("returns creator information", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    expect(token.createdBy).toBeDefined();
    expect(token.createdBy.id).toBeDefined();
    // The creator ID should be a valid Ethereum address
    expect(token.createdBy.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("handles multiple consecutive reads", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Read the same token multiple times
    const [token1, token2, token3] = await Promise.all([
      client.token.read({ tokenAddress: testToken.id }),
      client.token.read({ tokenAddress: testToken.id }),
      client.token.read({ tokenAddress: testToken.id }),
    ]);

    // All reads should return the same data
    expect(token1.id).toBe(token2.id);
    expect(token2.id).toBe(token3.id);
    expect(token1.name).toBe(token2.name);
    expect(token2.name).toBe(token3.name);
    expect(token1.symbol).toBe(token2.symbol);
    expect(token2.symbol).toBe(token3.symbol);
  });
});
