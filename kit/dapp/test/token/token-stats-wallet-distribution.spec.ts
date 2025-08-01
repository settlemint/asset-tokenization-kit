import { beforeAll, describe, expect, it, beforeEach } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";
import { theGraphClient } from "../the-graph-mocks";

describe("Token stats wallet distribution", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token",
      symbol: "TST",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
  });

  beforeEach(() => {
    theGraphClient.query.mockReset();
  });

  it("can fetch wallet distribution for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock TheGraph response
    const mockGraphResponse = {
      tokenHolders_collection: [
        { balance: "50000000000000000000" }, // 50 tokens
        { balance: "150000000000000000000" }, // 150 tokens
        { balance: "500000000000000000000" }, // 500 tokens
        { balance: "1500000000000000000000" }, // 1500 tokens
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsWalletDistribution({
      tokenAddress: testToken.id,
    });

    expect(result.totalHolders).toBe(4);
    expect(result.buckets).toBeInstanceOf(Array);
    expect(result.buckets.length).toBeGreaterThan(0);

    // Check bucket structure
    expect(result.buckets[0]).toMatchObject({
      range: expect.any(String),
      count: expect.any(Number),
    });
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsWalletDistribution({
        tokenAddress: "invalid-address",
      })
    ).rejects.toThrow();
  });

  it("handles empty data response gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock empty response - no token holders
    const mockGraphResponse = {
      tokenHolders_collection: [],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsWalletDistribution({
      tokenAddress: testToken.id,
    });

    expect(result.totalHolders).toBe(0);
    expect(result.buckets).toEqual([]);
  });

  it("handles single token holder", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock response with single holder
    const mockGraphResponse = {
      tokenHolders_collection: [
        { balance: "1000000000000000000000" }, // 1000 tokens
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsWalletDistribution({
      tokenAddress: testToken.id,
    });

    expect(result.totalHolders).toBe(1);
    expect(result.buckets).toBeInstanceOf(Array);
    expect(result.buckets.length).toBeGreaterThan(0);
  });

  it("handles zero balance holders correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock response with some zero balance holders (should be filtered out)
    const mockGraphResponse = {
      tokenHolders_collection: [
        { balance: "0" }, // 0 tokens - should be filtered
        { balance: "1000000000000000000000" }, // 1000 tokens
        { balance: "0" }, // 0 tokens - should be filtered
        { balance: "500000000000000000000" }, // 500 tokens
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsWalletDistribution({
      tokenAddress: testToken.id,
    });

    // Should only count holders with non-zero balance
    expect(result.totalHolders).toBe(2);
    expect(result.buckets).toBeInstanceOf(Array);
  });

  it("handles TheGraph service failure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock service failure
    theGraphClient.query.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      client.token.statsWalletDistribution({
        tokenAddress: testToken.id,
      })
    ).rejects.toThrow("Network error");
  });

  it("creates proper distribution buckets", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock response with diverse balance ranges
    const mockGraphResponse = {
      tokenHolders_collection: [
        { balance: "1000000000000000000" }, // 1 token
        { balance: "10000000000000000000" }, // 10 tokens
        { balance: "100000000000000000000" }, // 100 tokens
        { balance: "1000000000000000000000" }, // 1000 tokens
        { balance: "10000000000000000000000" }, // 10000 tokens
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsWalletDistribution({
      tokenAddress: testToken.id,
    });

    expect(result.totalHolders).toBe(5);
    expect(result.buckets).toBeInstanceOf(Array);

    // All buckets should have non-negative counts
    result.buckets.forEach((bucket) => {
      expect(bucket.count).toBeGreaterThanOrEqual(0);
      expect(bucket.range).toBeTruthy();
    });

    // Sum of all bucket counts should equal total holders
    const totalBucketCount = result.buckets.reduce(
      (sum, bucket) => sum + bucket.count,
      0
    );
    expect(totalBucketCount).toBe(result.totalHolders);
  });
});
