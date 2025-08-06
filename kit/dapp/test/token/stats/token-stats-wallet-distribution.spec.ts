/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Wallet Distribution", () => {
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Wallet Distribution");
    stablecoinToken = context.tokens.stablecoin;
    bondToken = context.tokens.bond;
    client = context.client;
  });

  describe("Business logic", () => {
    it("returns empty distribution for newly created tokens", async () => {
      const result = await client.token.statsWalletDistribution({
        tokenAddress: stablecoinToken.id,
      });

      // Business expectation: new tokens have no holders
      expect(result.totalHolders).toBe(0);
      expect(result.buckets).toHaveLength(5); // Always 5 buckets

      // All bucket counts should be zero for new tokens
      result.buckets.forEach((bucket) => {
        expect(bucket.count).toBe(0);
      });
    });

    it("validates distribution bucket integrity", async () => {
      const result = await client.token.statsWalletDistribution({
        tokenAddress: stablecoinToken.id,
      });

      // Business logic: buckets must be valid and consistent
      result.buckets.forEach((bucket) => {
        // Core business rules for distribution buckets
        expect(bucket.count).toBeGreaterThanOrEqual(0); // Count can't be negative
        expect(bucket.range).toMatch(/^\d+-\d+%$/); // Valid percentage range format
      });

      // Business rule: total holders must equal sum of bucket counts
      const sumOfBuckets = result.buckets.reduce(
        (sum, bucket) => sum + bucket.count,
        0
      );
      expect(result.totalHolders).toBe(sumOfBuckets);
    });

    it("validates bucket structure consistency", async () => {
      const result = await client.token.statsWalletDistribution({
        tokenAddress: stablecoinToken.id,
      });

      // Business rule: should always have exactly 5 distribution buckets
      expect(result.buckets).toHaveLength(5);

      // Verify expected range patterns
      const expectedRanges = ["0-2%", "2-10%", "10-20%", "20-40%", "40-100%"];
      result.buckets.forEach((bucket, index) => {
        expect(bucket.range).toBe(expectedRanges[index]);
      });
    });

    it("handles different token types consistently", async () => {
      // Test both token types behave the same for wallet distribution
      const [stablecoinResult, bondResult] = await Promise.all([
        client.token.statsWalletDistribution({
          tokenAddress: stablecoinToken.id,
        }),
        client.token.statsWalletDistribution({ tokenAddress: bondToken.id }),
      ]);

      // Business logic: all token types should track distribution the same way
      expect(stablecoinResult.totalHolders).toBe(0);
      expect(bondResult.totalHolders).toBe(0);
      expect(stablecoinResult.buckets).toHaveLength(5);
      expect(bondResult.buckets).toHaveLength(5);
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsWalletDistribution({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const [result1, result2] = await Promise.all([
        client.token.statsWalletDistribution({
          tokenAddress: stablecoinToken.id,
        }),
        client.token.statsWalletDistribution({
          tokenAddress: stablecoinToken.id,
        }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
