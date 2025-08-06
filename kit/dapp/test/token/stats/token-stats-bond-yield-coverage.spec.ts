/**
 * @vitest-environment node
 */
import { toNumber } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";
import type { OrpcClient } from "../../utils/orpc-client";
import { createTestTokens } from "../../utils/token-fixtures";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Bond Yield Coverage", () => {
  let bondToken: Awaited<ReturnType<typeof createTestTokens>>["tokens"]["bond"];
  let stablecoinToken: Awaited<
    ReturnType<typeof createTestTokens>
  >["tokens"]["stablecoin"];
  let client: OrpcClient;

  beforeAll(async () => {
    const context = await createTestTokens(" Yield Coverage");
    bondToken = context.tokens.bond;
    stablecoinToken = context.tokens.stablecoin;
    client = context.client;
  });

  describe("Business logic", () => {
    it("yield schedule logic is consistent", async () => {
      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: bondToken.id,
      });

      // Core business rule: can't be running without a schedule
      if (!result.hasYieldSchedule) {
        expect(result.isRunning).toBe(false);
      }
    });

    it("coverage percentage is valid", async () => {
      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: bondToken.id,
      });

      // Business logic: coverage must be valid percentage (0-100%)
      const coverage = toNumber(result.yieldCoverage);
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });

    it("newly created bonds have no yield schedule", async () => {
      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: bondToken.id,
      });

      // Business expectation: new bonds should have no yield setup
      expect(result.hasYieldSchedule).toBe(false);
      expect(result.isRunning).toBe(false);
      expect(toNumber(result.yieldCoverage)).toBe(0);
    });
  });

  describe("Non-bond tokens", () => {
    it("returns default values for non-bond tokens", async () => {
      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: stablecoinToken.id,
      });

      // Business logic: non-bond tokens should have no yield data
      expect(result.hasYieldSchedule).toBe(false);
      expect(result.isRunning).toBe(false);
      expect(toNumber(result.yieldCoverage)).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      await expect(
        client.token.statsBondYieldCoverage({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const [result1, result2] = await Promise.all([
        client.token.statsBondYieldCoverage({ tokenAddress: bondToken.id }),
        client.token.statsBondYieldCoverage({ tokenAddress: bondToken.id }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
