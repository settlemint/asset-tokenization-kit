/**
 * @vitest-environment node
 */
import { TEST_CONSTANTS } from "@test/helpers/test-helpers";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe.concurrent("Token Stats: Total Supply", () => {
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

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsTotalSupply({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no supply history yet
      expect(result.totalSupplyHistory).toHaveLength(0);
    });

    it("validates supply history data integrity", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsTotalSupply({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business logic: if history exists, it must be valid
      result.totalSupplyHistory.forEach((item) => {
        // Core business rules for supply history
        expect(item.timestamp).toBeGreaterThan(0); // Valid timestamp
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future dates
        expect(item.totalSupply).toBeGreaterThanOrEqual(0); // Supply can't be negative
      });
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsTotalSupply({
          tokenAddress: testToken.id,
          days: 0,
        })
      ).rejects.toThrow();

      await expect(
        client.token.statsTotalSupply({
          tokenAddress: testToken.id,
          days: 400,
        })
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Test boundary values for days parameter
      const validDays = [1, 30, TEST_CONSTANTS.MAX_DAYS];

      for (const days of validDays) {
        const result = await client.token.statsTotalSupply({
          tokenAddress: testToken.id,
          days,
        });
        expect(result.totalSupplyHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsTotalSupply({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
          days: 30,
        })
      ).rejects.toThrow();
    });
  });
});
