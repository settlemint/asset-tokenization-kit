/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../../utils/orpc-client";
import { createToken } from "../../utils/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "../../utils/user";
import { TEST_CONSTANTS } from "./test-helpers";

describe.concurrent("Token Stats: Collateral Ratio", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token Collateral Ratio",
      symbol: "TTCR",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
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
    it("collateral ratio bounds are valid", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsCollateralRatio({
        tokenAddress: testToken.id,
      });

      // Core business rule: collateral ratio must be valid percentage (0-100%)
      expect(result.collateralRatio).toBeGreaterThanOrEqual(0);
      expect(result.collateralRatio).toBeLessThanOrEqual(100);
    });

    it("bucket values sum equals total collateral", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsCollateralRatio({
        tokenAddress: testToken.id,
      });

      const [available, used] = result.buckets;

      // Business logic: available + used = total (accounting consistency)
      expect((available?.value ?? 0) + (used?.value ?? 0)).toBe(
        result.totalCollateral
      );
    });

    it("returns zero values for newly created tokens", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsCollateralRatio({
        tokenAddress: testToken.id,
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

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsCollateralRatio({
          tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
        })
      ).rejects.toThrow();
    });
  });
});
