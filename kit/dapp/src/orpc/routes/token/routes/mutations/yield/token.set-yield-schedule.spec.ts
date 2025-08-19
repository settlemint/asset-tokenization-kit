import { getOrpcClient, OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { addDays, addYears, getUnixTime } from "date-fns";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token set yield schedule", () => {
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;

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
    const startDate = addDays(new Date(), 1); // Start tomorrow
    const endDate = addYears(new Date(), 1); // End in 1 year

    const startTimestamp = getUnixTime(startDate);
    const endTimestamp = getUnixTime(endDate);

    const yieldScheduleData = {
      contract: bondToken.id,
      yieldRate: "500", // 5% in basis points
      paymentInterval: "86400", // Daily payments (24 hours)
      startTime: startTimestamp.toString(),
      endTime: endTimestamp.toString(),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    // First, expect the call to fail because admin doesn't have the governance role
    await expect(
      adminClient.token.setYieldSchedule(yieldScheduleData)
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
      accounts: [adminAddress!],
      role: "governance",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Wait a bit for the role grant to be processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Now setting the yield schedule should succeed
    const yieldScheduleResult =
      await adminClient.token.setYieldSchedule(yieldScheduleData);

    // Verify the yield schedule was set successfully
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

    // Verify yield amounts are initialized
    expect(yieldScheduleResult.yield?.schedule?.totalClaimed).toBeDefined();
    expect(
      yieldScheduleResult.yield?.schedule?.totalUnclaimedYield
    ).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.totalYield).toBeDefined();

    // Verify periods array exists
    expect(yieldScheduleResult.yield?.schedule?.periods).toBeDefined();
    expect(Array.isArray(yieldScheduleResult.yield?.schedule?.periods)).toBe(
      true
    );
  }, 100_000);

  test("regular users cant set yield schedule", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    // Try to set yield schedule without proper permissions
    const startDate = addDays(new Date(), 1); // Start tomorrow
    const endDate = addYears(new Date(), 1); // End in 1 year

    const startTimestamp = getUnixTime(startDate);
    const endTimestamp = getUnixTime(endDate);

    await expect(
      client.token.setYieldSchedule({
        contract: bondToken.id,
        yieldRate: "500",
        paymentInterval: "86400", // Daily payments
        startTime: startTimestamp.toString(),
        endTime: endTimestamp.toString(),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });
});
