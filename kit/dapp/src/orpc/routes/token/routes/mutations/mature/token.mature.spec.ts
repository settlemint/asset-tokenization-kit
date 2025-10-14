import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import {
  getAnvilBasedFutureDate,
  getAnvilTimeMilliseconds,
  increaseAnvilTimeForDate,
} from "@/test/anvil";
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
import { addSeconds } from "date-fns";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token mature", () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    // Deposit token to use as denomination asset
    const depositData = {
      type: "deposit" as const,
      name: `Test Denomination Deposit`,
      symbol: "TDD",
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
        ...depositData,
        basePrice: from("1.00", 2),
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "emergency"],
        unpause: true,
      }
    );
  }, 120_000);

  test("cannot mature bond before maturity date", async () => {
    const maturityDate = await getAnvilBasedFutureDate(1);
    const bond = await createToken(
      adminClient,
      {
        type: "bond" as const,
        name: `Test Bond`,
        symbol: "TB",
        decimals: 18,
        cap: from(1_000_000, 18),
        faceValue: from(1000, depositToken.decimals),
        maturityDate,
        denominationAsset: depositToken.id,
        initialModulePairs: [],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: "056",
      },
      {
        grantRole: ["governance", "emergency"],
        unpause: true,
      }
    );

    // Try to mature before maturity date - should fail
    await expect(
      adminClient.token.mature(
        {
          contract: bond.id,
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
    ).rejects.toThrow(/BondNotYetMatured/);
  });

  test("regular users cannot mature bond", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    const maturityDate = await getAnvilBasedFutureDate(1);
    const bond = await createToken(
      adminClient,
      {
        type: "bond" as const,
        name: `Test Bond`,
        symbol: "TB",
        decimals: 18,
        cap: from(1_000_000, 18),
        faceValue: from(1000, depositToken.decimals),
        maturityDate,
        denominationAsset: depositToken.id,
        initialModulePairs: [],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: "056",
      },
      {
        grantRole: ["governance", "emergency"],
        unpause: true,
      }
    );

    await expect(
      client.token.mature(
        {
          contract: bond.id,
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
  }, 120_000);

  test(
    "can mature bond after maturity date",
    {
      // Test can be flaky due to blockchain time manipulation
      // If there are many concurrent blocks being mined, the maturity date may already be in the past
      retry: 3,
      // Increase timeout for proper blockchain time manipulation
      timeout: 120_000,
    },
    async () => {
      const timeAtCreate = await getAnvilTimeMilliseconds();
      const bond = await createToken(
        adminClient,
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          type: "bond" as const,
          name: `Test Mature Bond`,
          symbol: "TMB2",
          decimals: 18,
          cap: from(1_000_000, 18),
          faceValue: from(1000, depositToken.decimals),
          maturityDate: addSeconds(new Date(timeAtCreate), 10),
          denominationAsset: depositToken.id,
          initialModulePairs: [],
          countryCode: "056",
        },
        {
          grantRole: ["governance", "emergency"],
          unpause: true,
        }
      );

      await increaseAnvilTimeForDate(bond.bond?.maturityDate);

      // Fund the bond contract with denomination assets
      await adminClient.token.mint({
        contract: depositToken.id,
        recipients: [bond.id],
        amounts: from(1_000_000, 18), // 1M denomination assets
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      const result = await adminClient.token.mature({
        contract: bond.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(bond.id);
      expect(result.bond).toBeDefined();
      expect(result.bond?.isMatured).toBe(true);
    }
  ); // Increase timeout for proper blockchain time manipulation

  test(
    "cannot mature already matured bond",
    {
      // Test can be flaky due to blockchain time manipulation
      // If there are many concurrent blocks being mined, the maturity date may already be in the past
      retry: 3,
      // Increase timeout for proper blockchain time manipulation
      timeout: 120_000,
    },
    async () => {
      const timeAtCreate = await getAnvilTimeMilliseconds();
      const bond = await createToken(
        adminClient,
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          type: "bond" as const,
          name: `Test Already Matured Bond`,
          symbol: "TAMB",
          decimals: 18,
          cap: from(1_000_000, 18),
          faceValue: from(1000, depositToken.decimals),
          maturityDate: addSeconds(new Date(timeAtCreate), 10),
          denominationAsset: depositToken.id,
          initialModulePairs: [],
          countryCode: "056",
        },
        {
          grantRole: ["governance", "emergency"],
          unpause: true,
        }
      );

      await increaseAnvilTimeForDate(bond.bond?.maturityDate);

      await adminClient.token.mint({
        contract: depositToken.id,
        recipients: [bond.id],
        amounts: from(1_000_000, 18), // 1M denomination assets
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      const firstMatureResult = await adminClient.token.mature({
        contract: bond.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      expect(firstMatureResult).toBeDefined();
      expect(firstMatureResult.id).toBe(bond.id);
      expect(firstMatureResult.bond).toBeDefined();
      expect(firstMatureResult.bond?.isMatured).toBe(true);

      await expect(
        adminClient.token.mature(
          {
            contract: bond.id,
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
            },
          }
        )
      ).rejects.toThrow(/Bond is already matured/);
    }
  );

  test(
    "cannot mature without sufficient denomination asset balance",
    {
      // Test can be flaky due to blockchain time manipulation
      // If there are many concurrent blocks being mined, the maturity date may already be in the past
      retry: 3,
      // Increase timeout for proper blockchain time manipulation
      timeout: 120_000,
    },
    async () => {
      const timeAtCreate = await getAnvilTimeMilliseconds();
      const bond = await createToken(
        adminClient,
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          type: "bond" as const,
          name: `Test Already Matured Bond`,
          symbol: "TAMB",
          decimals: 18,
          cap: from(1_000_000, 18),
          faceValue: from(1000, depositToken.decimals),
          maturityDate: addSeconds(new Date(timeAtCreate), 10),
          denominationAsset: depositToken.id,
          initialModulePairs: [],
          countryCode: "056",
        },
        {
          grantRole: ["governance", "emergency", "supplyManagement"],
          unpause: true,
        }
      );

      await increaseAnvilTimeForDate(bond.bond?.maturityDate);

      // Mint some bonds to have a non-zero amount of denomination asset required for maturity
      await adminClient.token.mint({
        contract: bond.id,
        recipients: [bond.id],
        amounts: from(1_000_000, 18),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });

      await expect(
        adminClient.token.mature(
          {
            contract: bond.id,
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
            },
          }
        )
      ).rejects.toThrow("Insufficient denomination asset balance");
    }
  );
});
