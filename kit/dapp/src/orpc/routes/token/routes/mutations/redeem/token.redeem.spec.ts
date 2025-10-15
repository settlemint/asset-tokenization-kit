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
import { format, from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe(
  "Token redeem",
  {
    // Test can be flaky due to blockchain time manipulation
    retry: 3,
  },
  () => {
    let depositToken: Awaited<ReturnType<typeof createToken>>;
    let bond: Awaited<ReturnType<typeof createToken>>;
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
          name: `Redeem Deposit`,
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
      const oneMinuteFromNow = new Date(anvilTime + 1 * 60 * 1000);
      const threeMinutesFromNow = new Date(anvilTime + 3 * 60 * 1000);

      bond = await createToken(
        adminClient,
        {
          type: "bond",
          name: `Redeem Bond`,
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
        recipients: [bond.id],
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

      await increaseAnvilTimeForDate(bond.bond?.maturityDate);

      await adminClient.token.mature({
        contract: bond.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }, 120_000);

    test("can redeem bond after maturity", async () => {
      await increaseAnvilTimeForDate(bond.bond?.maturityDate);

      const actionsBeforeRedeem = await adminClient.token.actions({
        tokenAddress: bond.id,
      });
      expect(
        actionsBeforeRedeem.filter((action) => action.name === "RedeemBond")
      ).toEqual([
        {
          activeAt: expect.any(Date),
          executedAt: null,
          executedBy: null,
          executor: {
            executors: [adminUserData.wallet],
            id: expect.any(String),
          },
          id: expect.any(String),
          name: "RedeemBond",
          status: "ACTIVE",
          target: bond.id,
        },
      ]);

      const result = await adminClient.token.redeem({
        contract: bond.id,
        redeemAll: true,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
      expect(result).toBeDefined();
      const totalRedeemedAmount = format(
        result?.redeemable?.redeemedAmount ?? from(0)
      );
      expect(totalRedeemedAmount).toBe("10");

      const actionsAfterRedeem = await adminClient.token.actions({
        tokenAddress: bond.id,
      });
      expect(
        actionsAfterRedeem.filter((action) => action.name === "RedeemBond")
      ).toEqual([
        {
          activeAt: expect.any(Date),
          executedAt: expect.any(Date),
          executedBy: adminUserData.wallet,
          executor: {
            executors: [adminUserData.wallet],
            id: expect.any(String),
          },
          id: expect.any(String),
          name: "RedeemBond",
          status: "EXECUTED",
          target: bond.id,
        },
      ]);
    });

    test("cannot redeem an already redeemed bond", async () => {
      await expect(
        adminClient.token.redeem(
          {
            contract: bond.id,
            redeemAll: true,
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
      ).rejects.toThrow("InvalidRedemptionAmount");
    });
  }
);
