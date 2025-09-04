import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getAnvilTimeMilliseconds } from "@/test/anvil";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import {
  errorMessageForCode,
  getOrpcClient,
  type OrpcClient,
} from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Fixed yield schedule top up", async () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let yieldScheduleAddress: string;

  const anvilTime = await getAnvilTimeMilliseconds();
  const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
  const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  const startTimestamp = Math.ceil(startDate.getTime() / 1000);
  const endTimestamp = Math.ceil(endDate.getTime() / 1000);

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    // Create stablecoin token for denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
    };

    stablecoinToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...stablecoinData,
        countryCode: "056",
      },
      ["supplyManagement"]
    );

    // Create bond token
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

    bondToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...bondData,
        countryCode: "056",
      },
      ["governance"]
    );

    // Create a fixed yield schedule
    const yieldScheduleData = {
      yieldRate: 250, // 2.5%
      paymentInterval: TimeIntervalEnum.DAILY,
      startTime: startTimestamp,
      endTime: endTimestamp,
      token: bondToken.id,
      countryCode: 56,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    const yieldScheduleResult =
      await adminClient.fixedYieldSchedule.create(yieldScheduleData);
    yieldScheduleAddress = yieldScheduleResult.address;

    expect(yieldScheduleAddress).toBeDefined();
    expect(yieldScheduleAddress).toBe(getEthereumAddress(yieldScheduleAddress));

    const adminUser = await adminClient.user.me();
    const adminWalletAddress = adminUser?.wallet;

    if (!adminWalletAddress) {
      throw new Error("Admin wallet address not found");
    }

    // Mint 50 denomination asset tokens to the admin for testing top-up
    await adminClient.token.mint({
      contract: stablecoinToken.id,
      recipients: [adminWalletAddress],
      amounts: [from(50, 18)], // 50 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  test("can top up denomination asset in fixed yield schedule", async () => {
    const topUpData = {
      contract: yieldScheduleAddress,
      amount: from(10, 18), // 10 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    const result = await adminClient.fixedYieldSchedule.topUp(topUpData);

    expect(result).toBeDefined();
    expect(result.transactionHash).toBeDefined();
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  }, 100_000);

  test("regular users cannot top up without proper permissions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const investorClient = getOrpcClient(headers);

    const topUpData = {
      contract: yieldScheduleAddress,
      amount: "1000000000000000000",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    await expect(
      investorClient.fixedYieldSchedule.topUp(topUpData, {
        context: {
          skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
        },
      })
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });
});
