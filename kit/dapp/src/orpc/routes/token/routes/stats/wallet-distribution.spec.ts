/**
 * @vitest-environment node
 */
import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { TEST_CONSTANTS } from "@test/helpers/test-helpers";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe.concurrent("Token Stats: Wallet Distribution", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Wallet Distribution",
      symbol: "TTWD",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      basePrice: from("1.00", 2),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  describe("Business logic", () => {
    it("returns empty distribution for newly created tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsWalletDistribution({
        tokenAddress: testToken.id,
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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsWalletDistribution({
        tokenAddress: testToken.id,
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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsWalletDistribution({
        tokenAddress: testToken.id,
      });

      // Business rule: should always have exactly 5 distribution buckets
      expect(result.buckets).toHaveLength(5);

      // Verify expected range patterns
      const expectedRanges = ["0-2%", "2-10%", "10-20%", "20-40%", "40-100%"];
      result.buckets.forEach((bucket, index) => {
        expect(bucket.range).toBe(expectedRanges[index]);
      });
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsWalletDistribution(
          {
            tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
            },
          }
        )
      ).rejects.toThrow(
        `Token with address '${TEST_CONSTANTS.ZERO_ADDRESS}' not found`
      );
    });
  });
});
