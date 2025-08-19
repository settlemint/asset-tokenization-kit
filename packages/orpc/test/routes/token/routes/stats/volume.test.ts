/**
 * @bun:test-environment node
 */

import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import { TEST_CONSTANTS } from "@test/helpers/test-helpers";

describe("Token Stats: Volume", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Volume",
      symbol: "TTV",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
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

      const result = await client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no volume history yet
      expect(result.volumeHistory).toHaveLength(0);
    });

    it("validates volume data integrity", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      const result = await client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business logic: if volume history exists, it must be valid
      for (const item of result.volumeHistory) {
        // Core business rules for volume data
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future dates
        expect(item.totalVolume).toBeGreaterThanOrEqual(0); // Volume can't be negative
      }
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      // Business rule: days must be within valid range (1-365)
      await expect(client.token.statsVolume({ tokenAddress: testToken.id, days: 0 })).rejects.toThrow();

      await expect(
        client.token.statsVolume({
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
        const result = await client.token.statsVolume({
          tokenAddress: testToken.id,
          days,
        });
        expect(result.volumeHistory).toEqual([]);
      }
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getTestOrpcClient(headers);

      await expect(
        client.token.statsVolume({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
          days: 30,
        })
      ).rejects.toThrow();
    });
  });
});
