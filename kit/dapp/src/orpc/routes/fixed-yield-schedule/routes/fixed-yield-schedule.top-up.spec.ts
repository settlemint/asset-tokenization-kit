import { getAnvilTimeMilliseconds, getAnvilBasedFutureDate } from "@/test/anvil";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { eq, from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Fixed yield schedule top up", async () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let yieldScheduleAddress: string;

  const anvilTime = await getAnvilTimeMilliseconds();
  const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
  const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  const startTimestamp = Math.ceil(startDate.getTime() / 1000);
  const endTimestamp = Math.ceil(endDate.getTime() / 1000);

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Create stablecoin token for denomination asset
    const deposit = {
      type: "deposit" as const,
      name: `Test Denomination Deposit ${Date.now()}`,
      symbol: "TDP",
      decimals: 18,
      initialModulePairs: [],
      basePrice: from("1.00", 2),
    };

    depositToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...deposit,
        countryCode: "056",
      },
      { grantRole: ["supplyManagement", "emergency"], unpause: true }
    );

    // Create bond token
    const bondData = {
      type: "bond" as const,
      name: `Test Yield Bond ${Date.now()}`,
      symbol: "TYSB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: await getAnvilBasedFutureDate(12),
      initialModulePairs: [],
      denominationAsset: depositToken.id,
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
      { grantRole: "governance" }
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
      contract: depositToken.id,
      recipients: [adminWalletAddress],
      amounts: [from(50, 18)], // 50 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    const investorUser = await investorClient.user.me();
    const investorWalletAddress = investorUser?.wallet;

    if (!investorWalletAddress) {
      throw new Error("Investor wallet address not found");
    }

    // Mint 100 denomination asset tokens to the investor for testing top-up
    await adminClient.token.mint({
      contract: depositToken.id,
      recipients: [investorWalletAddress],
      amounts: [from(100, 18)], // 100 tokens with 18 decimals
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

    const readResult = await adminClient.fixedYieldSchedule.read({
      id: yieldScheduleAddress,
    });

    expect(readResult).toBeDefined();

    const denominationAsset = await adminClient.token.holders({
      tokenAddress: depositToken.id,
    });
    const yieldBalance = denominationAsset.token?.balances.find(
      (holder) => holder.account.id === yieldScheduleAddress
    );

    expect(yieldBalance).toBeDefined();
    expect(
      yieldBalance?.available && eq(yieldBalance.available, from(10))
    ).toBe(true);
  }, 100_000);

  test("regular users can top up", async () => {
    const topUpData = {
      contract: yieldScheduleAddress,
      amount: from(10, 18), // 10 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    const result = await investorClient.fixedYieldSchedule.topUp(topUpData);

    expect(result).toBeDefined();
    expect(result.transactionHash).toBeDefined();
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    const readResult = await investorClient.fixedYieldSchedule.read({
      id: yieldScheduleAddress,
    });

    expect(readResult).toBeDefined();
    const denominationAsset = await investorClient.token.holders({
      tokenAddress: depositToken.id,
    });
    const yieldBalance = denominationAsset.token?.balances.find(
      (holder) => holder.account.id === yieldScheduleAddress
    );
    expect(yieldBalance).toBeDefined();
    expect(
      yieldBalance?.available && eq(yieldBalance.available, from(20))
    ).toBe(true);
  }, 100_000);
});
