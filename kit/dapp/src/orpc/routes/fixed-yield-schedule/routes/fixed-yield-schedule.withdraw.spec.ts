import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getAnvilTimeMilliseconds } from "@/test/anvil";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  getUserWallet,
  signInWithUser,
} from "@test/fixtures/user";
import { eq, from } from "dnum";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

describe("Fixed yield schedule withdraw", async () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let bondToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let yieldScheduleAddress: Address;
  let adminWalletAddress: Address;
  let investorWalletAddress: Address;

  const anvilTime = await getAnvilTimeMilliseconds();
  const startDate = new Date(anvilTime + 1 * 24 * 60 * 60 * 1000); // 1 day from now
  const endDate = new Date(anvilTime + 4 * 24 * 60 * 60 * 1000); // 4 days from now

  const startTimestamp = Math.ceil(startDate.getTime() / 1000);
  const endTimestamp = Math.ceil(endDate.getTime() / 1000);

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);
    adminWalletAddress = await getUserWallet(DEFAULT_ADMIN);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);
    investorWalletAddress = await getUserWallet(DEFAULT_INVESTOR);

    // Create stablecoin token for denomination asset
    const deposit = {
      type: "deposit" as const,
      name: `Test Denomination Deposit ${Date.now()}`,
      symbol: "TDP",
      decimals: 18,
      initialModulePairs: [],
    };

    depositToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...deposit,
        basePrice: from("1.00", 2),
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
      maturityDate: new Date("2025-12-31"),
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
      { grantRole: ["supplyManagement"] }
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

    // Mint 100 denomination asset tokens to the admin
    await adminClient.token.mint({
      contract: depositToken.id,
      recipients: [adminWalletAddress],
      amounts: [from(100, 18)], // 100 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Mint 50 denomination asset tokens to the investor
    await adminClient.token.mint({
      contract: depositToken.id,
      recipients: [investorWalletAddress],
      amounts: [from(50, 18)], // 50 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Top up the yield schedule with 50 tokens so there's something to withdraw
    await adminClient.fixedYieldSchedule.topUp({
      contract: yieldScheduleAddress,
      amount: from(50, 18), // 50 tokens with 18 decimals
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  test("can withdraw denomination asset from fixed yield schedule", async () => {
    const withdrawData = {
      contract: bondToken.id, // Bond token address (use to check permissions in token permissions middleware)
      yieldSchedule: yieldScheduleAddress, // Yield schedule contract address
      amount: from(10, 18), // 10 tokens with 18 decimals
      to: adminWalletAddress, // Recipient address
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    const result = await adminClient.fixedYieldSchedule.withdraw(withdrawData);

    expect(result).toBeDefined();
    expect(result.transactionHash).toBeDefined();
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Check that the yield schedule balance decreased
    const yieldBalance = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: yieldScheduleAddress,
    });

    expect(yieldBalance.holder).toBeDefined();
    expect(
      yieldBalance.holder?.available &&
        eq(yieldBalance.holder.available, from(40)) // 50 - 10 = 40
    ).toBe(true);
  }, 100_000);

  test("user without supplyManagement roles cannot withdraw", async () => {
    const withdrawData = {
      contract: bondToken.id, // Bond token address (not yield schedule address)
      yieldSchedule: yieldScheduleAddress, // Yield schedule contract address
      amount: from(5, 18), // 5 tokens with 18 decimals
      to: investorWalletAddress, // Recipient address
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    // Expect this to fail with permission error
    await expect(
      investorClient.fixedYieldSchedule.withdraw(withdrawData, {
        context: {
          skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
        },
      })
    ).rejects.toThrow();
  }, 100_000);

  test("admin can withdraw to a different recipient address", async () => {
    const withdrawData = {
      contract: bondToken.id, // Bond token address (not yield schedule address)
      yieldSchedule: yieldScheduleAddress, // Yield schedule contract address
      amount: from(15, 18), // 15 tokens with 18 decimals
      to: investorWalletAddress, // Withdraw to investor's wallet
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE" as const,
      },
    };

    const result = await adminClient.fixedYieldSchedule.withdraw(withdrawData);

    expect(result).toBeDefined();
    expect(result.transactionHash).toBeDefined();
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Check that the yield schedule balance decreased further
    const yieldBalance = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: yieldScheduleAddress,
    });

    expect(yieldBalance.holder).toBeDefined();
    expect(
      yieldBalance.holder?.available &&
        eq(yieldBalance.holder.available, from(25)) // 40 - 15 = 25
    ).toBe(true);
  }, 100_000);
});
