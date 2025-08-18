import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";
import { addDays, addYears, getUnixTime } from "date-fns";

describe("Token set yield schedule", () => {
  test("can set yield schedule on bond", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // First create a stablecoin to use as denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
    };

    const stablecoinResult = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...stablecoinData,
      countryCode: "056",
    });

    expect(stablecoinResult).toBeDefined();
    expect(stablecoinResult.id).toBeDefined();

    // Now create the bond using the stablecoin address
    const bondData = {
      type: "bond" as const,
      name: `Test Yield Bond ${Date.now()}`,
      symbol: "TYSB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: new Date("2025-12-31"),
      denominationAsset: stablecoinResult.id,
      initialModulePairs: [],
    };

    const bondResult = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...bondData,
      countryCode: "056",
    });

    expect(bondResult).toBeDefined();
    expect(bondResult.id).toBeDefined();
    expect(bondResult.type).toBe(bondData.type);

    // Now set the yield schedule on the bond
    const startDate = addDays(new Date(), 1); // Start tomorrow
    const endDate = addYears(new Date(), 1); // End in 1 year
    
    const startTimestamp = getUnixTime(startDate);
    const endTimestamp = getUnixTime(endDate);

    const yieldScheduleResult = await client.token.setYieldSchedule({
      contract: bondResult.id,
      yieldRate: "500", // 5% in basis points
      paymentInterval: "86400", // Daily payments (24 hours)
      startTime: startTimestamp.toString(),
      endTime: endTimestamp.toString(),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Verify the yield schedule was set successfully
    expect(yieldScheduleResult).toBeDefined();
    expect(yieldScheduleResult.id).toBe(bondResult.id);
    expect(yieldScheduleResult.type).toBe("bond");
    expect(yieldScheduleResult.name).toBe(bondData.name);
    expect(yieldScheduleResult.symbol).toBe(bondData.symbol);

    // Verify the bond appears in the token list with yield schedule
    const tokens = await client.token.list({});
    const updatedBond = tokens.find((t) => t.id === bondResult.id);
    expect(updatedBond).toBeDefined();
    expect(updatedBond).toMatchObject({
      id: bondResult.id,
      type: bondData.type,
      name: bondData.name,
      symbol: bondData.symbol,
    });

    // Read the specific token to verify yield data is included
    const tokenDetails = await client.token.read({
      tokenAddress: bondResult.id,
    });
    
    expect(tokenDetails).toBeDefined();
    expect(tokenDetails.yield).toBeDefined();
    expect(tokenDetails.yield).not.toBeNull();
    
    if (tokenDetails.yield) {
      expect(tokenDetails.yield.schedule).toBeDefined();
      expect(tokenDetails.yield.schedule.rate).toBe("500"); // 5% in basis points
      expect(tokenDetails.yield.schedule.interval).toBe("86400"); // Daily interval
      expect(tokenDetails.yield.schedule.startDate.getTime()).toBe(startDate.getTime());
      expect(tokenDetails.yield.schedule.endDate.getTime()).toBe(endDate.getTime());
      expect(tokenDetails.yield.schedule.denominationAsset).toBeDefined();
      expect(tokenDetails.yield.schedule.denominationAsset.id).toBe(stablecoinResult.id);
      expect(tokenDetails.yield.schedule.denominationAsset.symbol).toBe("TSDC");
      
      // Verify yield amounts are initialized
      expect(tokenDetails.yield.schedule.totalClaimed).toBeDefined();
      expect(tokenDetails.yield.schedule.totalUnclaimedYield).toBeDefined();
      expect(tokenDetails.yield.schedule.totalYield).toBeDefined();
      
      // Verify periods array exists
      expect(tokenDetails.yield.schedule.periods).toBeDefined();
      expect(Array.isArray(tokenDetails.yield.schedule.periods)).toBe(true);
    }
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
        contract: "0x1111111111111111111111111111111111111111", // Dummy address
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
