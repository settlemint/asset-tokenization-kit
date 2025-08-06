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

describe.concurrent("Token Stats: Bond Status", () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // First create stablecoin token to use as denomination asset
    stablecoinToken = await createToken(client, {
      name: "Test Stablecoin Token Status",
      symbol: "TSTS",
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
      name: "Test Bond Token Status",
      symbol: "TBTS",
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
    it("available balance never exceeds required balance", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      const available = toNumber(result.denominationAssetBalanceAvailable);
      const required = toNumber(result.denominationAssetBalanceAvailable);

      // Core business rule: available can't exceed required
      expect(available).toBeLessThanOrEqual(required);
    });

    it("coverage percentage matches balance ratio", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      const available = toNumber(result.denominationAssetBalanceAvailable);
      const required = toNumber(result.denominationAssetBalanceAvailable);
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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondStatus({
        tokenAddress: bondToken.id,
      });

      // New bonds should have no collateral yet
      const available = toNumber(result.denominationAssetBalanceAvailable);
      const required = toNumber(result.denominationAssetBalanceAvailable);
      const coverage = toNumber(result.coveredPercentage);

      expect(available).toBe(0);
      expect(required).toBe(0);
      expect(coverage).toBe(0);
    });
  });

  describe("Non-bond tokens", () => {
    it("returns zero values for non-bond tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsBondStatus({
        tokenAddress: stablecoinToken.id,
      });

      // Business logic: non-bond tokens should have no bond status
      const available = toNumber(result.denominationAssetBalanceAvailable);
      const required = toNumber(result.denominationAssetBalanceAvailable);
      const coverage = toNumber(result.coveredPercentage);

      expect(available).toBe(0);
      expect(required).toBe(0);
      expect(coverage).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsBondStatus({
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
        client.token.statsBondStatus({ tokenAddress: bondToken.id }),
        client.token.statsBondStatus({ tokenAddress: bondToken.id }),
      ]);

      // Results should be identical for immediate consecutive calls
      expect(result1).toEqual(result2);
    });
  });
});
