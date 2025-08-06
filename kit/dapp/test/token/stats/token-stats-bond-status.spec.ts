/**
 * @vitest-environment node
 */
import { toNumber } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Bond Status", () => {
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Bond Status");
    bondToken = context.tokens.bond;
    stablecoinToken = context.tokens.stablecoin;
    client = context.client;
  });

  describe("Business logic", () => {
    it("available balance never exceeds required balance", async () => {
      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      const available = toNumber(result.underlyingAssetBalanceAvailable);
      const required = toNumber(result.underlyingAssetBalanceRequired);

      // Core business rule: available can't exceed required
      expect(available).toBeLessThanOrEqual(required);
    });

    it("coverage percentage matches balance ratio", async () => {
      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      const available = toNumber(result.underlyingAssetBalanceAvailable);
      const required = toNumber(result.underlyingAssetBalanceRequired);
      const coverage = toNumber(result.coveredPercentage);

      // Business logic: coverage should match actual ratio
      if (required > 0) {
        const expectedCoverage = (available / required) * 100;
        expect(coverage).toBeCloseTo(expectedCoverage, 1); // Allow 0.1% variance
      } else {
        expect(coverage).toBe(0); // No requirement = 0% coverage
      }
    });

    it("returns zero values for newly created bonds", async () => {
      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      // New bonds should have no collateral yet
      const available = toNumber(result.underlyingAssetBalanceAvailable);
      const required = toNumber(result.underlyingAssetBalanceRequired);
      const coverage = toNumber(result.coveredPercentage);

      expect(available).toBe(0);
      expect(required).toBe(0);
      expect(coverage).toBe(0);
    });
  });

  describe("Non-bond tokens", () => {
    it("returns zero values for non-bond tokens", async () => {
      const result = await client.token.statsBondStatus({
        tokenAddress: stablecoinToken.id,
      });

      // Business logic: non-bond tokens should have no bond status
      const available = toNumber(result.underlyingAssetBalanceAvailable);
      const required = toNumber(result.underlyingAssetBalanceRequired);
      const coverage = toNumber(result.coveredPercentage);

      expect(available).toBe(0);
      expect(required).toBe(0);
      expect(coverage).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsBondStatus({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const [result1, result2] = await Promise.all([
        client.token.statsBondStatus({ tokenAddress: bondToken.id }),
        client.token.statsBondStatus({ tokenAddress: bondToken.id }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
