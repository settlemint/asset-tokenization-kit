/**
 * @vitest-environment node
 */
import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { TEST_CONSTANTS } from "@test/helpers/test-helpers";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe.concurrent("Token Stats: Supply Changes", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Supply Changes",
      symbol: "TTSC",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      initialModulePairs: [],
      basePrice: from("1.00", 2),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  describe("Business logic", () => {
    it("returns empty history for newly created tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no supply changes yet
      expect(result.supplyChangesHistory).toHaveLength(0);
    });

    it("validates supply change data integrity", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
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
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsSupplyChanges(
          {
            tokenAddress: testToken.id,
            days: 0,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.BAD_REQUEST],
            },
          }
        )
      ).rejects.toThrow();

      await expect(
        client.token.statsSupplyChanges(
          {
            tokenAddress: testToken.id,
            days: 400,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.BAD_REQUEST],
            },
          }
        )
      ).rejects.toThrow();
    });

    it("accepts valid days parameter range", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

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
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsSupplyChanges(
          {
            tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
            days: 30,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
            },
          }
        )
      ).rejects.toThrow(
        `Token with address '${TEST_CONSTANTS.ZERO_ADDRESS}' not found`
      );
    });
  });
});
