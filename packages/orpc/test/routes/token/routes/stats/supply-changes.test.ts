/**
 * @bun:test-environment node
 */

import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import { TEST_CONSTANTS } from "@test/helpers/test-helpers";

describe("Token Stats: Supply Changes", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Supply Changes",
      symbol: "TTSC",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      initialModulePairs: [],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      const result = await client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no supply changes yet
      expect(result.supplyChangesHistory).toHaveLength(0);
    });

    it("validates supply change data integrity", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      const result = await client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business logic: if supply changes exist, they must be valid
      for (const item of result.supplyChangesHistory) {
        // Core business rules for supply changes
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future timestamps
        expect(BigInt(item.totalMinted)).toBeGreaterThanOrEqual(0n); // Can't mint negative amounts
        expect(BigInt(item.totalBurned)).toBeGreaterThanOrEqual(0n); // Can't burn negative amounts

        // Values must be valid decimal strings (Wei format)
        expect(item.totalMinted).toMatch(/^\d+$/);
        expect(item.totalBurned).toMatch(/^\d+$/);
      }
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsSupplyChanges({
          tokenAddress: testToken.id,
          days: 0,
        })
      ).rejects.toThrow();

      await expect(
        client.token.statsSupplyChanges({
          tokenAddress: testToken.id,
          days: 400,
        })
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      // Test boundary values for days parameter
      const validDays = [1, 30, TEST_CONSTANTS.MAX_DAYS];

      for (const days of validDays) {
        const result = await client.token.statsSupplyChanges({
          tokenAddress: testToken.id,
          days,
        });
        expect(result.supplyChangesHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      await expect(
        client.token.statsSupplyChanges({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
          days: 30,
        })
      ).rejects.toThrow();
    });
  });
});
