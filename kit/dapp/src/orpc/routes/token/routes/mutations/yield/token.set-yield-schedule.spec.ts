import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getAnvilTimeMilliseconds, getAnvilBasedFutureDate } from "@/test/anvil";
import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { createFixedYieldSchedule } from "@test/fixtures/fixed-yield-schedule";
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
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token set yield schedule", async () => {
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

    // First create a stablecoin to use as denomination asset
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

    // Now create the bond using the stablecoin address
    const bondData = {
      type: "bond" as const,
      name: `Test Yield Bond ${Date.now()}`,
      symbol: "TYSB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: await getAnvilBasedFutureDate(12),
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

    yieldSchedule = await createFixedYieldSchedule(adminClient, {
      yieldRate: 50, // 0.5%
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

  test("can set yield schedule on bond", async () => {
    // Get the admin's wallet address
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet;
    expect(adminAddress).toBeDefined();

    // Check if admin already has governance role
    const tokenDetails = await adminClient.token.read({
      tokenAddress: bondToken.id,
    });

    const hasGovernanceRole =
      tokenDetails.userPermissions?.roles?.governance ?? false;

    if (!hasGovernanceRole) {
      // If admin doesn't have governance role, expect the call to fail first
      await expect(
        adminClient.token.setYieldSchedule(
          {
            contract: bondToken.id,
            schedule: yieldSchedule.address,
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
      );

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
    }

    // Now the admin should have permissions to set yield schedule
    const yieldScheduleResult = await adminClient.token.setYieldSchedule({
      contract: bondToken.id,
      schedule: yieldSchedule.address,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(yieldScheduleResult).toBeDefined();
    expect(yieldScheduleResult.id).toBe(bondToken.id);
    expect(yieldScheduleResult.yield).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule).toBeDefined();
    expect(yieldScheduleResult.yield?.schedule?.id).toBe(yieldSchedule.address);
  }, 100_000);

  test("regular users cant set yield schedule", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.token.setYieldSchedule(
        {
          contract: bondToken.id,
          schedule: yieldSchedule.address,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });
});
