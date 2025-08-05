import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token stats supply changes", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Supply Changes",
      symbol: "TTSC",
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

  it("can fetch supply changes history for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new token should have empty supply changes history
    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      days: 30,
    });

    // For a newly created token with no mint/burn operations, expect empty history
    expect(result.supplyChangesHistory).toBeInstanceOf(Array);
    expect(result.supplyChangesHistory).toHaveLength(0);
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsSupplyChanges({
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
      client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 0,
      })
    ).rejects.toThrow();

    // Too large
    await expect(
      client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 400,
      })
    ).rejects.toThrow();
  });

  it("uses default days value when not specified", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call without days parameter - should use default (30 days)
    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      // days not specified - should default to 30
    });

    // For a new token, expect empty history
    expect(result.supplyChangesHistory).toBeInstanceOf(Array);
    expect(result.supplyChangesHistory).toHaveLength(0);
  });

  it("handles empty data response gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new token should have no supply changes data
    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.supplyChangesHistory).toHaveLength(0);
    expect(result.supplyChangesHistory).toEqual([]);
  });

  it("returns proper data structure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      days: 30,
    });

    // Verify the structure is correct
    expect(result).toHaveProperty("supplyChangesHistory");
    expect(result.supplyChangesHistory).toBeInstanceOf(Array);
  });
});
