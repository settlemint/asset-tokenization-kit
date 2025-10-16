import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import {
  getAnvilTimeMilliseconds,
  increaseAnvilTimeForDate,
} from "@/test/anvil";
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

describe(
  "Fixed yield schedule claim",
  {
    // Test can be flaky due to blockchain time manipulation
    retry: 3,
    timeout: 120_000,
  },
  () => {
    let depositToken: Awaited<ReturnType<typeof createToken>>;
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
    }, 120_000);

    test("can claim yield from fixed yield schedule", async () => {
      const anvilTime = await getAnvilTimeMilliseconds();
      const oneMinuteFromNow = new Date(anvilTime + 1 * 60 * 1000);
      const threeMinutesFromNow = new Date(anvilTime + 3 * 60 * 1000);

      const bond = await createToken(
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

      const yieldSchedule = await createFixedYieldSchedule(adminClient, {
        yieldRate: 300, // 3%
        paymentInterval: 30, // 30 seconds
        startTime: oneMinuteFromNow,
        endTime: threeMinutesFromNow,
        token: bond.id,
        countryCode: 56,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
      await adminClient.token.setYieldSchedule({
        contract: bond.id,
        schedule: yieldSchedule.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      await adminClient.token.mint({
        contract: depositToken.id,
        recipients: [yieldSchedule.id],
        amounts: [from(100_000, 18)],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
      await adminClient.token.mint({
        contract: bond.id,
        recipients: [adminUserData.wallet],
        amounts: [from(10, 18)],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
      let processedPeriods = 0;
      for (const period of yieldSchedule.periods) {
        await increaseAnvilTimeForDate(period.endDate);

        const actionsBeforeClaim = await adminClient.token.actions({
          tokenAddress: bond.id,
        });
        const pendingClaimYieldActionsBefore = actionsBeforeClaim.filter(
          (action) =>
            action.name === "ClaimYield" && action.status !== "EXECUTED"
        );
        expect(pendingClaimYieldActionsBefore.length).toBe(
          yieldSchedule.periods.length - processedPeriods
        );
        const result = await adminClient.fixedYieldSchedule.claim({
          contract: yieldSchedule.id,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        });
        expect(result).toBeDefined();
        expect(result.txHash).toBeDefined();
        processedPeriods++;

        const schedule = await adminClient.fixedYieldSchedule.read({
          id: yieldSchedule.id,
        });
        expect(schedule).toBeDefined();
        expect(schedule.currentPeriod?.id ?? null).toBe(
          schedule.periods[processedPeriods]?.id ?? null
        );
        expect(schedule.nextPeriod?.id ?? null).toBe(
          schedule.periods[processedPeriods + 1]?.id ?? null
        );

        const actionsAfterClaim = await adminClient.token.actions({
          tokenAddress: bond.id,
        });
        const pendingClaimYieldActionsAfter = actionsAfterClaim.filter(
          (action) =>
            action.name === "ClaimYield" && action.status !== "EXECUTED"
        );
        expect(pendingClaimYieldActionsAfter.length).toBe(
          yieldSchedule.periods.length - processedPeriods
        );
        const executedClaimYieldActionsAfter = actionsAfterClaim.filter(
          (action) =>
            action.name === "ClaimYield" && action.status === "EXECUTED"
        );
        expect(executedClaimYieldActionsAfter.length).toBe(processedPeriods);

        // Cannot claim yield again
        await expect(
          adminClient.fixedYieldSchedule.claim(
            {
              contract: yieldSchedule.id,
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
      }
    });
  }
);
