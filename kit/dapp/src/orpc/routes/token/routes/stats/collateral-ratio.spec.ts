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
import { from, toNumber } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

const COLLATERAL = from("10", 18);

describe.concurrent("Token Stats: Collateral Ratio", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(
      client,
      {
        name: "Test Token Collateral Ratio",
        symbol: "TTCR",
        decimals: 18,
        type: "stablecoin",
        countryCode: "056",
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        unpause: true,
        grantRole: ["supplyManagement", "governance"],
      }
    );

    const result = await client.token.updateCollateral({
      contract: testToken.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      amount: COLLATERAL,
      expiryDays: 365,
    });
    expect(toNumber(result.collateral?.collateral ?? from(0))).toBe(
      toNumber(COLLATERAL)
    );
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

    it("returns correct values for test token", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const result = await client.token.statsCollateralRatio({
        tokenAddress: testToken.id,
      });

      // Business expectation: new tokens have no collateral yet
      expect(result.totalCollateral).toBe(toNumber(COLLATERAL));
      expect(result.collateralRatio).toBe(0);
      expect(result.buckets).toHaveLength(2);

      const [available, used] = result.buckets;
      expect(available?.value).toBe(toNumber(COLLATERAL));
      expect(used?.value).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("rejects zero address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsCollateralRatio(
          {
            tokenAddress: TEST_CONSTANTS.ZERO_ADDRESS,
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
