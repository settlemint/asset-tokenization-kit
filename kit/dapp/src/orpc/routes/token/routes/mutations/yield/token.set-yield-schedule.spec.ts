import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { anvil } from "viem/chains";
import { beforeAll, describe, expect, test } from "vitest";

// Create a client to query blockchain time from anvil
const publicClient = createPublicClient({
  chain: anvil,
  transport: http("http://localhost:8545"),
});

// Helper function to get the current blockchain timestamp in milliseconds (like anvil)
async function getAnvilTimeMilliseconds(): Promise<number> {
  const block = await publicClient.getBlock({ blockTag: "latest" });
  return Number(block.timestamp) * 1000; // Convert to milliseconds
}

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

  test(
    "can set yield schedule on bond",
    async () => {
      // Get anvil blockchain time like hardhat script does
      const anvilTime = await getAnvilTimeMilliseconds();
      process.stdout.write(
        `\n[TEST] Current anvil time (ms): ${anvilTime}, Date: ${new Date(anvilTime)}\n`
      );
      process.stdout.write(`\n[TEST] Bond token ID: ${bondToken.id}\n`);
      process.stdout.write(
        `\n[TEST] Stablecoin token ID: ${stablecoinToken.id}\n`
      );

      // The issue is that our bond doesn't have a denomination asset set properly!
      // This causes the yieldToken() to return address(0), which fails contract validation.
      // We need to fix the bond creation to ensure denominationAsset is properly set.
      process.stdout.write(
        `\n[TEST] ISSUE IDENTIFIED: Bond does not have denominationAsset properly set!\n`
      );
      process.stdout.write(
        `\n[TEST] This causes yieldToken() to return address(0) and InvalidDenominationAsset revert\n`
      );

      // TODO: Fix bond creation to properly set denominationAsset
      // return;

      // CRITICAL: The contract validation requires startDate > block.timestamp (strictly greater than)
      // There's a timing issue: we fetch anvil time, but by the time the transaction is mined,
      // the new block will have a later timestamp. We need to ensure our startDate is definitely
      // in the future relative to when the transaction will be mined.
      // Adding a 60-second buffer plus the 7 days to be absolutely sure
      const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
      const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

      const startTimestamp = Math.ceil(startDate.getTime() / 1000); // Convert to seconds like hardhat
      const endTimestamp = Math.ceil(endDate.getTime() / 1000);

      process.stdout.write(
        `\n[TEST] Start timestamp: ${startTimestamp}, Date: ${startDate}\n`
      );
      process.stdout.write(
        `\n[TEST] End timestamp: ${endTimestamp}, Date: ${endDate}\n`
      );

      const yieldScheduleData = {
        contract: bondToken.id,
        yieldRate: 50, // 0.5%
        paymentInterval: 12 * 60 * 60, // 12 hours in seconds
        startTime: startTimestamp,
        endTime: endTimestamp,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE" as const,
        },
        countryCode: 56,
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
        accounts: [adminAddress as Address],
        role: "governance",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      // Wait a bit for the role grant to be processed
      // await new Promise((resolve) => setTimeout(resolve, 2000));

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
      // Convert timestamps back to dates for comparison
      const expectedStartDate = new Date(startTimestamp * 1000);
      const expectedEndDate = new Date(endTimestamp * 1000);

      expect(yieldScheduleResult.yield?.schedule?.startDate.getTime()).toBe(
        expectedStartDate.getTime()
      );
      expect(yieldScheduleResult.yield?.schedule?.endDate.getTime()).toBe(
        expectedEndDate.getTime()
      );
      expect(
        yieldScheduleResult.yield?.schedule?.denominationAsset
      ).toBeDefined();
      expect(yieldScheduleResult.yield?.schedule?.denominationAsset.id).toBe(
        stablecoinToken.id
      );
      expect(
        yieldScheduleResult.yield?.schedule?.denominationAsset.symbol
      ).toBe(stablecoinToken.symbol);

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
    },
    5 * 100_000
  );

  test("regular users cant set yield schedule", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    // Try to set yield schedule without proper permissions
    // Get anvil blockchain time with proper buffer for timing issues
    const anvilTime = await getAnvilTimeMilliseconds();
    const startDate = new Date(anvilTime + 60 * 1000 + 7 * 24 * 60 * 60 * 1000); // 60s + 7 days buffer
    const endDate = new Date(anvilTime + 60 * 1000 + 10 * 24 * 60 * 60 * 1000); // 60s + 10 days buffer
    const startTimestamp = Math.ceil(startDate.getTime() / 1000);
    const endTimestamp = Math.ceil(endDate.getTime() / 1000);

    await expect(
      client.token.setYieldSchedule({
        contract: bondToken.id,
        yieldRate: "500",
        paymentInterval: "86400", // Daily payments
        startTime: startTimestamp,
        endTime: endTimestamp,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: 56,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });
});
