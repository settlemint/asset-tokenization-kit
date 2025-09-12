import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import {
  getAnvilTimeMilliseconds,
  getAnvilBasedFutureDate,
} from "@/test/anvil";
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

describe("Fixed yield schedule create", async () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let bondToken: Awaited<ReturnType<typeof createToken>>;
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
      basePrice: from("1.00", 2),
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
      maturityDate: await getAnvilBasedFutureDate(12),
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
    expect(bondToken.type).toBe(bondData.type);
  });

  test("can create fixed yield schedule", async () => {
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

    const result =
      await adminClient.fixedYieldSchedule.create(yieldScheduleData);

    expect(result).toBeDefined();
    expect(result.address).toBeDefined();
    expect(result.address).toBe(getEthereumAddress(result.address));
  }, 100_000);

  test("regular users cannot create yield schedules without proper permissions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const investorClient = getOrpcClient(headers);

    const yieldScheduleData = {
      yieldRate: 250,
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

    await expect(
      investorClient.fixedYieldSchedule.create(yieldScheduleData, {
        context: {
          skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
        },
      })
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });
});
