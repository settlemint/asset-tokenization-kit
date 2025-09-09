import { getAnvilTimeMilliseconds } from "@/test/anvil";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { createFixedYieldSchedule } from "@test/fixtures/fixed-yield-schedule";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Fixed yield schedule read", async () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let yieldSchedule: Awaited<ReturnType<typeof createFixedYieldSchedule>>;
  let adminClient: OrpcClient;

  const anvilTime = await getAnvilTimeMilliseconds();
  const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
  const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  const startTimestamp = Math.ceil(startDate.getTime() / 1000); // Convert to seconds like hardhat
  const endTimestamp = Math.ceil(endDate.getTime() / 1000);

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
      basePrice: from("1"),
    };

    stablecoinToken = await createToken(adminClient, {
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...stablecoinData,
      countryCode: "056",
    });

    const bondData = {
      type: "bond" as const,
      name: `Test Yield Bond ${Date.now()}`,
      symbol: "TYSB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: new Date("2025-12-31"),
      initialModulePairs: [],
      denominationAsset: stablecoinToken.id,
    };

    bondToken = await createToken(adminClient, {
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...bondData,
      countryCode: "056",
    });

    expect(bondToken).toBeDefined();
    expect(bondToken.id).toBeDefined();

    yieldSchedule = await createFixedYieldSchedule(adminClient, {
      yieldRate: 300, // 3%
      paymentInterval: TimeIntervalEnum.DAILY,
      startTime: startTimestamp,
      endTime: endTimestamp,
      token: bondToken.id,
      countryCode: 56,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(yieldSchedule).toBeDefined();
    expect(yieldSchedule.address).toBeDefined();
  });

  test("can read fixed yield schedule details", async () => {
    const result = await adminClient.fixedYieldSchedule.read({
      id: yieldSchedule.address,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(yieldSchedule.address);
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
    expect(result.rate).toBeDefined();
    expect(result.interval).toBeDefined();
    expect(result.totalClaimed).toBeDefined();
    expect(result.totalUnclaimedYield).toBeDefined();
    expect(result.totalYield).toBeDefined();
    expect(result.denominationAsset).toBeDefined();
    expect(result.denominationAsset.id).toBeDefined();
    expect(result.periods).toBeDefined();
    expect(Array.isArray(result.periods)).toBe(true);
  }, 30_000);

  test("regular users can read yield schedule details", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const investorClient = getOrpcClient(headers);

    const result = await investorClient.fixedYieldSchedule.read({
      id: yieldSchedule.address,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(yieldSchedule.address);
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
    expect(result.rate).toBeDefined();
    expect(result.interval).toBeDefined();
  }, 30_000);

  test("yield schedule structure matches expected schema", async () => {
    const result = await adminClient.fixedYieldSchedule.read({
      id: yieldSchedule.address,
    });

    // Verify the structure matches our Zod schema
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("startDate");
    expect(result).toHaveProperty("endDate");
    expect(result).toHaveProperty("rate");
    expect(result).toHaveProperty("interval");
    expect(result).toHaveProperty("totalClaimed");
    expect(result).toHaveProperty("totalUnclaimedYield");
    expect(result).toHaveProperty("totalYield");
    expect(result).toHaveProperty("denominationAsset");
    expect(result).toHaveProperty("currentPeriod");
    expect(result).toHaveProperty("nextPeriod");
    expect(result).toHaveProperty("periods");

    // Verify denomination asset structure
    expect(result.denominationAsset).toHaveProperty("id");
    expect(typeof result.denominationAsset.id).toBe("string");

    // Verify periods array structure
    expect(Array.isArray(result.periods)).toBe(true);

    // If there are periods, verify their structure
    if (result.periods.length > 0) {
      const period = result.periods[0];
      expect(period).toHaveProperty("id");
      expect(period).toHaveProperty("startDate");
      expect(period).toHaveProperty("endDate");
      expect(period).toHaveProperty("totalClaimed");
      expect(period).toHaveProperty("totalUnclaimedYield");
      expect(period).toHaveProperty("totalYield");
    }
  });
});
