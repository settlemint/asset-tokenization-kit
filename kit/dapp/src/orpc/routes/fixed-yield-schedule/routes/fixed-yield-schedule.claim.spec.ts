import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import {
  getAnvilTimeMilliseconds,
  increaseAnvilTimeForDate,
} from "@/test/anvil";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { createFixedYieldSchedule } from "@test/fixtures/fixed-yield-schedule";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Fixed yield schedule claim", () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let maturedBond: Awaited<ReturnType<typeof createToken>>;
  let yieldSchedule: Awaited<ReturnType<typeof createFixedYieldSchedule>>;
  let adminClient: OrpcClient;
  let adminUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);
    adminUserData = await getUserData(DEFAULT_ADMIN);

    // Deposit token to use as denomination asset
    depositToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        type: "deposit" as const,
        name: `Claim Yield Deposit`,
        symbol: "TDD",
        decimals: 18,
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "emergency"],
        unpause: true,
      }
    );

    const anvilTime = await getAnvilTimeMilliseconds();
    const threeMinutesFromNow = new Date(anvilTime + 3 * 60 * 1000);
    const fourMinutesFromNow = new Date(anvilTime + 4 * 60 * 1000);

    maturedBond = await createToken(
      adminClient,
      {
        type: "bond",
        name: `Claim Yield Bond`,
        symbol: "TB",
        decimals: 18,
        cap: from(1_000_000, 18),
        faceValue: from(1000, depositToken.decimals),
        maturityDate: threeMinutesFromNow,
        denominationAsset: depositToken.id,
        initialModulePairs: [],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "governance", "emergency"],
        unpause: true,
      }
    );

    yieldSchedule = await createFixedYieldSchedule(adminClient, {
      yieldRate: 300, // 3%
      paymentInterval: TimeIntervalEnum.DAILY,
      startTime: threeMinutesFromNow,
      endTime: fourMinutesFromNow,
      token: maturedBond.id,
      countryCode: 56,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    await adminClient.token.setYieldSchedule({
      contract: maturedBond.id,
      schedule: yieldSchedule.address,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    await adminClient.token.mint({
      contract: depositToken.id,
      recipients: [yieldSchedule.address, maturedBond.id],
      amounts: [from(1000, 18), from(100_000, 18)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    await adminClient.token.mint({
      contract: maturedBond.id,
      recipients: [adminUserData.wallet],
      amounts: [from(10, 18)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    await increaseAnvilTimeForDate(maturedBond.bond?.maturityDate);

    await adminClient.token.mature({
      contract: maturedBond.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }, 120_000);

  test("can claim yield from fixed yield schedule", async () => {
    const schedule = await adminClient.fixedYieldSchedule.read({
      id: yieldSchedule.address,
    });
    expect(schedule).toBeDefined();
    expect(schedule.currentPeriod).toBeDefined();

    await increaseAnvilTimeForDate(schedule.nextPeriod?.endDate);

    const actions = await adminClient.token.actions({
      tokenAddress: maturedBond.id,
    });
    expect(actions).toBeDefined(); // TODO: test actions list
    const result = await adminClient.fixedYieldSchedule.claim({
      contract: yieldSchedule.address,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    expect(result).toBeDefined();
    expect(result.transactionHash).toBeDefined();

    // Second time fails
    await expect(
      adminClient.fixedYieldSchedule.claim(
        {
          contract: yieldSchedule.address,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.PORTAL_ERROR],
          },
        }
      )
    ).rejects.toThrow("NoYieldAvailable");
  });
});
