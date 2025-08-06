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

describe.concurrent("Token Stats: Bond Yield Coverage", () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  // let bondTokenWithYield: Awaited<ReturnType<typeof createToken>>; // TODO: Uncomment when yield schedule creation works
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

    // Create bond token without yield schedule
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

    // TODO: Create bond token with yield schedule
    // Currently disabled due to role permission issues
    // bondTokenWithYield = await createToken(client, {
    //   name: "Test Bond Token With Yield",
    //   symbol: "TBTWY",
    //   decimals: 18,
    //   type: "bond",
    //   countryCode: "056",
    //   cap: "1000000",
    //   faceValue: "1000",
    //   maturityDate: (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
    //   denominationAsset: stablecoinToken.id,
    //   initialModulePairs: [],
    //   verification: {
    //     verificationCode: DEFAULT_PINCODE,
    //     verificationType: "pincode",
    //   },
    // });

    // Wait for TheGraph to index the token creation and yield schedule
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });

  // TODO: Re-enable once yield schedule creation is working
  // describe("Business logic", () => {
  // it("bonds with yield schedule return valid coverage data", async () => {
  //   const headers = await signInWithUser(DEFAULT_ADMIN);
  //   const client = getOrpcClient(headers);
  //   const result = await client.token.statsBondYieldCoverage({
  //     tokenAddress: bondTokenWithYield.id,
  //   });
  //   // Verify the response structure and data types
  //   expect(result).toHaveProperty("hasYieldSchedule");
  //   expect(result).toHaveProperty("isRunning");
  //   expect(result).toHaveProperty("yieldCoverage");
  //   // Business logic: bond with yield schedule should have valid data
  //   expect(result.hasYieldSchedule).toBe(true);
  //   expect(typeof result.isRunning).toBe("boolean");
  //   // Coverage should be a valid percentage (0-100%)
  //   const coverage = toNumber(result.yieldCoverage);
  //   expect(coverage).toBeGreaterThanOrEqual(0);
  //   expect(coverage).toBeLessThanOrEqual(100);
  // });
  // it("yield schedule running status is correctly determined", async () => {
  //   const headers = await signInWithUser(DEFAULT_ADMIN);
  //   const client = getOrpcClient(headers);
  //   const result = await client.token.statsBondYieldCoverage({
  //     tokenAddress: bondTokenWithYield.id,
  //   });
  //   // Since we created a yield schedule starting now, it should be running
  //   expect(result.hasYieldSchedule).toBe(true);
  //   expect(result.isRunning).toBe(true);
  // });
  // });

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
    it("returns error for bonds without yield schedule", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      await expect(
        client.token.statsBondYieldCoverage({ tokenAddress: bondToken.id })
      ).rejects.toThrow("Null value resolved for non-null field");
    });
  });
});
