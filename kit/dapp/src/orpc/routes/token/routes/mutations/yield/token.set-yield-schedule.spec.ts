import { getAnvilTimeMilliseconds } from "@/test/anvil";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token set yield schedule", async () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;

  const anvilTime = await getAnvilTimeMilliseconds();
  const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
  const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  const startTimestamp = Math.ceil(startDate.getTime() / 1000); // Convert to seconds like hardhat
  const endTimestamp = Math.ceil(endDate.getTime() / 1000);

  const yieldScheduleData = {
    yieldRate: "50", // 0.5%
    paymentInterval: "43200", // 12 hours in seconds
    startTime: startTimestamp,
    endTime: endTimestamp,
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE" as const,
    },
    countryCode: 56,
  };

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    // First create a stablecoin to use as denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
    };

    stablecoinToken = await createToken(adminClient, {
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...stablecoinData,
      countryCode: "056",
    });

    // Now create the bond using the stablecoin address
    const bondData = {
      type: "bond" as const,
      name: `Test Yield Bond ${Date.now()}`,
      symbol: "TYSB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: new Date("2025-12-31"),
      denominationAsset: stablecoinToken.id,
      initialModulePairs: [],
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
    expect(bondToken.type).toBe(bondData.type);
  });

  test("can set yield schedule on bond", async () => {
    // First, expect the call to fail because admin doesn't have the governance role
    await expect(
      adminClient.token.setYieldSchedule({
        contract: bondToken.id,
        ...yieldScheduleData,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );

    // Get the admin's wallet address
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet;
    expect(adminAddress).toBeDefined();

    // Grant the governance role to the admin
    await adminClient.token.grantRole({
      contract: bondToken.id,
      accounts: [adminAddress as Address],
      role: "governance",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Now create and set the yield schedule
    const yieldScheduleResult = await adminClient.token.setYieldSchedule({
      contract: bondToken.id,
      ...yieldScheduleData,
    });

    expect(yieldScheduleResult).toBeDefined();
    expect(yieldScheduleResult.id).toBe(bondToken.id);
    expect(yieldScheduleResult.type).toBe("bond");
    expect(yieldScheduleResult.name).toBe(bondToken.name);
    expect(yieldScheduleResult.symbol).toBe(bondToken.symbol);
    expect(yieldScheduleResult.yield).toBeDefined();
    expect(yieldScheduleResult.yield).not.toBeNull();

    expect(yieldScheduleResult.yield?.schedule).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.rate).toBe(
      yieldScheduleData.yieldRate
    );
    expect(yieldScheduleResult.yield?.schedule?.interval).toBe(
      yieldScheduleData.paymentInterval
    );
    expect(yieldScheduleResult.yield?.schedule?.startDate.getTime()).toBe(
      startDate.getTime()
    );
    expect(yieldScheduleResult.yield?.schedule?.endDate.getTime()).toBe(
      endDate.getTime()
    );
    expect(
      yieldScheduleResult.yield?.schedule?.denominationAsset
    ).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.denominationAsset.id).toBe(
      stablecoinToken.id
    );
    expect(yieldScheduleResult.yield?.schedule?.denominationAsset.symbol).toBe(
      stablecoinToken.symbol
    );
    expect(yieldScheduleResult.yield?.schedule?.totalClaimed).toBeDefined();
    expect(
      yieldScheduleResult.yield?.schedule?.totalUnclaimedYield
    ).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.totalYield).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.periods).toBeDefined();
    expect(Array.isArray(yieldScheduleResult.yield?.schedule?.periods)).toBe(
      true
    );
  }, 100_000);

  test("regular users cant set yield schedule", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.token.setYieldSchedule({
        ...yieldScheduleData,
        contract: bondToken.id,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });
});
