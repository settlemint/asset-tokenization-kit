import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";
import { from } from "dnum";

describe("Token stats bond status", () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let nonBondToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Create a bond token
    bondToken = await createToken(client, {
      name: "Test Bond Token",
      symbol: "TBT",
      decimals: 18,
      type: "bond", // Specifically test with bond type
      countryCode: "056",
      faceValue: "1000",
      maturityDate: new Date("2025-12-31"),
      underlyingAsset: "0x0000000000000000000000000000000000000001", // Dummy address for testing
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Create a non-bond token to test the edge case
    nonBondToken = await createToken(client, {
      name: "Test Non-Bond Token",
      symbol: "TNBT",
      decimals: 18,
      type: "stablecoin", // Non-bond type
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Wait for TheGraph to index the token creation
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  it("can fetch bond status for a bond token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API with bond token
    const result = await client.token.statsBondStatus({
      tokenAddress: bondToken.id,
    });

    // Verify the structure and types
    expect(result).toHaveProperty("underlyingAssetBalanceAvailable");
    expect(result).toHaveProperty("underlyingAssetBalanceRequired");
    expect(result).toHaveProperty("coveredPercentage");

    // All values should be dnum objects
    expect(Array.isArray(result.underlyingAssetBalanceAvailable)).toBe(true);
    expect(Array.isArray(result.underlyingAssetBalanceRequired)).toBe(true);
    expect(Array.isArray(result.coveredPercentage)).toBe(true);

    // For a new bond with no activity, expect zero values
    expect(result.underlyingAssetBalanceAvailable).toEqual(from(0));
    expect(result.underlyingAssetBalanceRequired).toEqual(from(0));
    expect(result.coveredPercentage).toEqual(from(0));
  });

  it("handles non-bond tokens gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API with non-bond token
    const result = await client.token.statsBondStatus({
      tokenAddress: nonBondToken.id,
    });

    // Should return zero values for non-bond tokens
    expect(result.underlyingAssetBalanceAvailable).toEqual(from(0));
    expect(result.underlyingAssetBalanceRequired).toEqual(from(0));
    expect(result.coveredPercentage).toEqual(from(0));
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsBondStatus({
        tokenAddress: "invalid-address",
      })
    ).rejects.toThrow();
  });

  it("handles empty bond data gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new bond should have no bond stats data
    const result = await client.token.statsBondStatus({
      tokenAddress: bondToken.id,
    });

    // For a token with no bond data, expect zero dnum values
    expect(result.underlyingAssetBalanceAvailable).toEqual(from(0));
    expect(result.underlyingAssetBalanceRequired).toEqual(from(0));
    expect(result.coveredPercentage).toEqual(from(0));
  });

  it("returns proper dnum data structure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsBondStatus({
      tokenAddress: bondToken.id,
    });

    // Verify all values are proper dnum arrays [bigint, number]
    expect(Array.isArray(result.underlyingAssetBalanceAvailable)).toBe(true);
    expect(result.underlyingAssetBalanceAvailable).toHaveLength(2);
    expect(typeof result.underlyingAssetBalanceAvailable[0]).toBe("bigint");
    expect(typeof result.underlyingAssetBalanceAvailable[1]).toBe("number");

    expect(Array.isArray(result.underlyingAssetBalanceRequired)).toBe(true);
    expect(result.underlyingAssetBalanceRequired).toHaveLength(2);
    expect(typeof result.underlyingAssetBalanceRequired[0]).toBe("bigint");
    expect(typeof result.underlyingAssetBalanceRequired[1]).toBe("number");

    expect(Array.isArray(result.coveredPercentage)).toBe(true);
    expect(result.coveredPercentage).toHaveLength(2);
    expect(typeof result.coveredPercentage[0]).toBe("bigint");
    expect(typeof result.coveredPercentage[1]).toBe("number");
  });

  it("validates coverage percentage bounds", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsBondStatus({
      tokenAddress: bondToken.id,
    });

    // Convert dnum to number for percentage validation
    const coverageValue =
      Number(result.coveredPercentage[0]) /
      10 ** Math.abs(result.coveredPercentage[1]);

    // Coverage percentage should be 0-100 (0% for new bond)
    expect(coverageValue).toBeGreaterThanOrEqual(0);
    expect(coverageValue).toBeLessThanOrEqual(100);
    expect(coverageValue).toBe(0); // New bond should have 0% coverage
  });

  it("maintains data consistency", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsBondStatus({
      tokenAddress: bondToken.id,
    });

    // Convert dnum values to numbers for comparison
    const available =
      Number(result.underlyingAssetBalanceAvailable[0]) /
      10 ** Math.abs(result.underlyingAssetBalanceAvailable[1]);
    const required =
      Number(result.underlyingAssetBalanceRequired[0]) /
      10 ** Math.abs(result.underlyingAssetBalanceRequired[1]);
    const coverage =
      Number(result.coveredPercentage[0]) /
      10 ** Math.abs(result.coveredPercentage[1]);

    // For new bonds, all should be 0
    expect(available).toBe(0);
    expect(required).toBe(0);
    expect(coverage).toBe(0);

    // Available should never exceed required
    expect(available).toBeLessThanOrEqual(required);
  });
});
