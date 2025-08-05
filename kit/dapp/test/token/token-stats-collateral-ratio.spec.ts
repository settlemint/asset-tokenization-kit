import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token stats collateral ratio", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Collateral Ratio",
      symbol: "TTCR",
      decimals: 18,
      type: "stablecoin", // Use stablecoin as it's more likely to have collateral
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Wait for TheGraph to index the token creation
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  it("can fetch collateral ratio for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API
    const result = await client.token.statsCollateralRatio({
      tokenAddress: testToken.id,
    });

    // For a newly created token with no collateral data, expect default values
    expect(result).toHaveProperty("buckets");
    expect(result).toHaveProperty("totalCollateral");
    expect(result).toHaveProperty("collateralRatio");

    expect(result.buckets).toBeInstanceOf(Array);
    expect(result.buckets).toHaveLength(2);
    expect(typeof result.totalCollateral).toBe("number");
    expect(typeof result.collateralRatio).toBe("number");
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsCollateralRatio({
        tokenAddress: "invalid-address",
      })
    ).rejects.toThrow();
  });

  it("handles empty collateral data gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Call the real API - new token should have no collateral data
    const result = await client.token.statsCollateralRatio({
      tokenAddress: testToken.id,
    });

    // For a token with no collateral data, expect default values
    expect(result.totalCollateral).toBe(0);
    expect(result.collateralRatio).toBe(0);
    expect(result.buckets).toHaveLength(2);

    // Check bucket structure
    expect(result.buckets[0]).toMatchObject({
      name: "collateralAvailable",
      value: 0,
    });
    expect(result.buckets[1]).toMatchObject({
      name: "collateralUsed",
      value: 0,
    });
  });

  it("returns proper bucket structure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsCollateralRatio({
      tokenAddress: testToken.id,
    });

    // Verify bucket structure is correct
    expect(result.buckets).toHaveLength(2);

    const availableBucket = result.buckets.find(
      (b) => b.name === "collateralAvailable"
    );
    const usedBucket = result.buckets.find((b) => b.name === "collateralUsed");

    expect(availableBucket).toBeDefined();
    expect(usedBucket).toBeDefined();
    expect(typeof availableBucket?.value).toBe("number");
    expect(typeof usedBucket?.value).toBe("number");
  });

  it("calculates collateral ratio correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsCollateralRatio({
      tokenAddress: testToken.id,
    });

    // For a new token with no collateral, ratio should be 0
    expect(result.collateralRatio).toBe(0);
    expect(result.totalCollateral).toBe(0);

    // Verify collateral ratio is a percentage (0-100)
    expect(result.collateralRatio).toBeGreaterThanOrEqual(0);
    expect(result.collateralRatio).toBeLessThanOrEqual(100);
  });

  it("returns consistent data structure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.statsCollateralRatio({
      tokenAddress: testToken.id,
    });

    // Verify all required fields are present with correct types
    expect(result).toMatchObject({
      buckets: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          value: expect.any(Number),
        }),
      ]),
      totalCollateral: expect.any(Number),
      collateralRatio: expect.any(Number),
    });

    // Verify the sum of available + used equals total (for non-zero cases)
    const availableValue =
      result.buckets.find((b) => b.name === "collateralAvailable")?.value || 0;
    const usedValue =
      result.buckets.find((b) => b.name === "collateralUsed")?.value || 0;

    // For new tokens, all values should be 0
    expect(availableValue + usedValue).toBe(result.totalCollateral);
  });
});
