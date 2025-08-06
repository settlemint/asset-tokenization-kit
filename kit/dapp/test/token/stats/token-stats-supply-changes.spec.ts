/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Supply Changes", () => {
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Supply Changes");
    stablecoinToken = context.tokens.stablecoin;
    client = context.client;
  });

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const result = await client.token.statsSupplyChanges({
        tokenAddress: stablecoinToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no supply changes yet
      expect(result.supplyChangesHistory).toHaveLength(0);
    });

    it("validates supply change data integrity", async () => {
      const result = await client.token.statsSupplyChanges({
        tokenAddress: stablecoinToken.id,
        days: 30,
      });

      // Business logic: if supply changes exist, they must be valid
      result.supplyChangesHistory.forEach((item) => {
        // Core business rules for supply changes
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future timestamps
        expect(BigInt(item.totalMinted)).toBeGreaterThanOrEqual(0n); // Can't mint negative amounts
        expect(BigInt(item.totalBurned)).toBeGreaterThanOrEqual(0n); // Can't burn negative amounts

        // Values must be valid decimal strings (Wei format)
        expect(item.totalMinted).toMatch(/^\d+$/);
        expect(item.totalBurned).toMatch(/^\d+$/);
      });
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsSupplyChanges({
          tokenAddress: stablecoinToken.id,
          days: 0,
        })
      ).rejects.toThrow();

      await expect(
        client.token.statsSupplyChanges({
          tokenAddress: stablecoinToken.id,
          days: 400,
        })
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      // Test boundary values for days parameter
      const validDays = [1, 30, TEST_CONSTANTS.MAX_DAYS];

      for (const days of validDays) {
        const result = await client.token.statsSupplyChanges({
          tokenAddress: stablecoinToken.id,
          days,
        });
        expect(result.supplyChangesHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsSupplyChanges({
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
        client.token.statsSupplyChanges(params),
        client.token.statsSupplyChanges(params),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
