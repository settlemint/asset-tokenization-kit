/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Total Supply", () => {
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Total Supply");
    stablecoinToken = context.tokens.stablecoin;
    bondToken = context.tokens.bond;
    client = context.client;
  });

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const result = await client.token.statsTotalSupply({
        tokenAddress: stablecoinToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no supply history yet
      expect(result.totalSupplyHistory).toHaveLength(0);
    });

    it("validates supply history data integrity", async () => {
      const result = await client.token.statsTotalSupply({
        tokenAddress: stablecoinToken.id,
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

    it("handles different token types consistently", async () => {
      // Test both token types behave the same for total supply tracking
      const [stablecoinResult, bondResult] = await Promise.all([
        client.token.statsTotalSupply({
          tokenAddress: stablecoinToken.id,
          days: 30,
        }),
        client.token.statsTotalSupply({ tokenAddress: bondToken.id, days: 30 }),
      ]);

      // Business logic: all token types should track supply history the same way
      expect(stablecoinResult.totalSupplyHistory).toEqual([]);
      expect(bondResult.totalSupplyHistory).toEqual([]);
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsTotalSupply({
          tokenAddress: stablecoinToken.id,
          days: 0,
        })
      ).rejects.toThrow();

      await expect(
        client.token.statsTotalSupply({
          tokenAddress: stablecoinToken.id,
          days: 400,
        })
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      // Test boundary values for days parameter
      const validDays = [1, 30, TEST_CONSTANTS.MAX_DAYS];

      for (const days of validDays) {
        const result = await client.token.statsTotalSupply({
          tokenAddress: stablecoinToken.id,
          days,
        });
        expect(result.totalSupplyHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsTotalSupply({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
          days: 30,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const params = { tokenAddress: stablecoinToken.id, days: 30 };

      const [result1, result2] = await Promise.all([
        client.token.statsTotalSupply(params),
        client.token.statsTotalSupply(params),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
