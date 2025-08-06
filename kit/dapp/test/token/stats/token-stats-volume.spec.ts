/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Volume", () => {
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Volume");
    stablecoinToken = context.tokens.stablecoin;
    bondToken = context.tokens.bond;
    client = context.client;
  });

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const result = await client.token.statsVolume({
        tokenAddress: stablecoinToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no volume history yet
      expect(result.volumeHistory).toHaveLength(0);
    });

    it("validates volume data integrity", async () => {
      const result = await client.token.statsVolume({
        tokenAddress: stablecoinToken.id,
        days: 30,
      });

      // Business logic: if volume history exists, it must be valid
      result.volumeHistory.forEach((item) => {
        // Core business rules for volume data
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future dates
        expect(item.totalVolume).toBeGreaterThanOrEqual(0); // Volume can't be negative
      });
    });

    it("handles different token types consistently", async () => {
      // Test both token types behave the same for volume tracking
      const [stablecoinResult, bondResult] = await Promise.all([
        client.token.statsVolume({
          tokenAddress: stablecoinToken.id,
          days: 30,
        }),
        client.token.statsVolume({ tokenAddress: bondToken.id, days: 30 }),
      ]);

      // Business logic: all token types should track volume history the same way
      expect(stablecoinResult.volumeHistory).toEqual([]);
      expect(bondResult.volumeHistory).toEqual([]);
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsVolume({ tokenAddress: stablecoinToken.id, days: 0 })
      ).rejects.toThrow();

      await expect(
        client.token.statsVolume({
          tokenAddress: stablecoinToken.id,
          days: 400,
        })
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      // Test boundary values for days parameter
      const validDays = [1, 30, TEST_CONSTANTS.MAX_DAYS];

      for (const days of validDays) {
        const result = await client.token.statsVolume({
          tokenAddress: stablecoinToken.id,
          days,
        });
        expect(result.volumeHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsVolume({
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
        client.token.statsVolume(params),
        client.token.statsVolume(params),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
