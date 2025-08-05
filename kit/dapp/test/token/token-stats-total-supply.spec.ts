import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token stats total supply", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Total Supply",
      symbol: "TTTS",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Wait for TheGraph to index the token creation
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  it("can fetch total supply history for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new token should have empty total supply history
    const result = await client.token.statsTotalSupply({
      tokenAddress: testToken.id,
      days: 30,
    });

    // For a newly created token, expect empty history
    expect(result.totalSupplyHistory).toBeInstanceOf(Array);
    expect(result.totalSupplyHistory).toHaveLength(0);
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsTotalSupply({
        tokenAddress: "invalid-address",
        days: 30,
      })
    ).rejects.toThrow();
  });

  it("rejects days parameter out of range", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Too small
    await expect(
      client.token.statsTotalSupply({
        tokenAddress: testToken.id,
        days: 0,
      })
    ).rejects.toThrow();

    // Too large
    await expect(
      client.token.statsTotalSupply({
        tokenAddress: testToken.id,
        days: 400,
      })
    ).rejects.toThrow();
  });

  it("uses default days value when not specified", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call without days parameter - should use default (30 days)
    const result = await client.token.statsTotalSupply({
      tokenAddress: testToken.id,
      // days not specified - should default to 30
    });

    // For a new token, expect empty history
    expect(result.totalSupplyHistory).toBeInstanceOf(Array);
    expect(result.totalSupplyHistory).toHaveLength(0);
  });

  it("handles empty data response gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new token should have no total supply data
    const result = await client.token.statsTotalSupply({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.totalSupplyHistory).toHaveLength(0);
    expect(result.totalSupplyHistory).toEqual([]);
  });

  it("returns proper data structure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsTotalSupply({
      tokenAddress: testToken.id,
      days: 30,
    });

    // Verify the structure is correct
    expect(result).toHaveProperty("totalSupplyHistory");
    expect(result.totalSupplyHistory).toBeInstanceOf(Array);
  });
});
