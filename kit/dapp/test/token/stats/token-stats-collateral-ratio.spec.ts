/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Collateral Ratio", () => {
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Collateral Ratio");
    stablecoinToken = context.tokens.stablecoin;
    bondToken = context.tokens.bond;
    client = context.client;
  });

  describe("Business logic", () => {
    it("collateral ratio bounds are valid", async () => {
      const result = await client.token.statsCollateralRatio({
        tokenAddress: stablecoinToken.id,
      });

      // Core business rule: collateral ratio must be valid percentage (0-100%)
      expect(result.collateralRatio).toBeGreaterThanOrEqual(0);
      expect(result.collateralRatio).toBeLessThanOrEqual(100);
    });

    it("bucket values sum equals total collateral", async () => {
      const result = await client.token.statsCollateralRatio({
        tokenAddress: stablecoinToken.id,
      });

      const [available, used] = result.buckets;

      // Business logic: available + used = total (accounting consistency)
      expect((available?.value ?? 0) + (used?.value ?? 0)).toBe(
        result.totalCollateral
      );
    });

    it("returns zero values for newly created tokens", async () => {
      const result = await client.token.statsCollateralRatio({
        tokenAddress: stablecoinToken.id,
      });

      // Business expectation: new tokens have no collateral yet
      expect(result.totalCollateral).toBe(0);
      expect(result.collateralRatio).toBe(0);
      expect(result.buckets).toHaveLength(2);

      const [available, used] = result.buckets;
      expect(available?.value).toBe(0);
      expect(used?.value).toBe(0);
    });
  });

  describe("Token type behavior", () => {
    it("handles stablecoin collateral tracking", async () => {
      const result = await client.token.statsCollateralRatio({
        tokenAddress: stablecoinToken.id,
      });

      // Business logic: stablecoins track collateral (even if zero initially)
      expect(result.buckets).toHaveLength(2);
      expect(result?.buckets?.[0]?.name).toBe("collateralAvailable");
      expect(result?.buckets?.[1]?.name).toBe("collateralUsed");
    });

    it("handles bond token collateral tracking", async () => {
      const result = await client.token.statsCollateralRatio({
        tokenAddress: bondToken.id,
      });

      // Business logic: bonds also track collateral (different from underlying assets)
      expect(result.buckets).toHaveLength(2);
      expect(result?.buckets?.[0]?.name).toBe("collateralAvailable");
      expect(result?.buckets?.[1]?.name).toBe("collateralUsed");
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsCollateralRatio({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const [result1, result2] = await Promise.all([
        client.token.statsCollateralRatio({ tokenAddress: stablecoinToken.id }),
        client.token.statsCollateralRatio({ tokenAddress: stablecoinToken.id }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
