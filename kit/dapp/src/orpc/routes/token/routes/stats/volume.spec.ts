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

describe.concurrent("Token Stats: Volume", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Volume",
      symbol: "TTV",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      basePrice: from("1"),
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

      const result = await client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business expectation: new tokens have no volume history yet
      expect(result.volumeHistory).toHaveLength(0);
    });

    it("validates volume data integrity", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 30,
      });

      // Business logic: if volume history exists, it must be valid
      result.volumeHistory.forEach((item) => {
        // Core business rules for volume data
        expect(item.timestamp).toBeLessThanOrEqual(Date.now() / 1000); // No future dates
        expect(item.totalVolume).toBeGreaterThanOrEqual(0); // Volume can't be negative
      });
    });
  });

  describe("Parameter validation", () => {
    it("rejects invalid days parameter bounds", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Business rule: days must be within valid range (1-365)
      await expect(
        client.token.statsVolume(
          { tokenAddress: testToken.id, days: 0 },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.BAD_REQUEST],
            },
          }
        )
      ).rejects.toThrow();

      await expect(
        client.token.statsVolume(
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
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsVolume(
          {
            tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
            days: 30,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.THE_GRAPH_ERROR],
            },
          }
        )
      ).rejects.toThrow();
    });
  });
});
