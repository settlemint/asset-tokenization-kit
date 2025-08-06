/**
 * @vitest-environment node
 */
import { toNumber } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../../utils/orpc-client";
import { createToken } from "../../utils/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "../../utils/user";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Bond Yield Coverage", () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // First create stablecoin token to use as denomination asset
    stablecoinToken = await createToken(client, {
      name: "Test Stablecoin Token Yield Coverage",
      symbol: "TSTYC",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      initialModulePairs: [],
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Create bond token using the stablecoin as denomination asset
    bondToken = await createToken(client, {
      name: "Test Bond Token Yield Coverage",
      symbol: "TBTYC",
      decimals: 18,
      type: "bond",
      countryCode: "056",
      cap: "1000000",
      faceValue: "1000",
      maturityDate: (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
      denominationAsset: stablecoinToken.id,
      initialModulePairs: [],
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });

    // Wait for TheGraph to index the token creation
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  describe("Business logic", () => {
    it("yield schedule logic is consistent", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: bondToken.id,
      });

      // Core business rule: can't be running without a schedule
      if (!result.hasYieldSchedule) {
        expect(result.isRunning).toBe(false);
      }
    });

    it("coverage percentage is valid", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondYieldCoverage({
        tokenAddress: bondToken.id,
      });

      // Business logic: coverage must be valid percentage (0-100%)
      const coverage = toNumber(result.yieldCoverage);
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });

    it("newly created bonds have no yield schedule", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsBondYieldCoverage({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });

  describe("Data consistency", () => {
    it("returns consistent data across multiple calls", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const [result1, result2] = await Promise.all([
        client.token.statsBondYieldCoverage({ tokenAddress: bondToken.id }),
        client.token.statsBondYieldCoverage({ tokenAddress: bondToken.id }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
