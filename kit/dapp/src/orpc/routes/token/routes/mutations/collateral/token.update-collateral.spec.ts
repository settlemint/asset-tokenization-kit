import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token update collateral", () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

    const adminData = await getUserData(DEFAULT_ADMIN);
    if (!adminData.wallet) {
      throw new Error("Default admin does not have a wallet");
    }

    // First create a stablecoin to use as denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Collateral Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
      basePrice: from("1.00", 2),
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
      { grantRole: "governance" }
    );
  });

  test("trusted claim issuers can update collateral", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    thirtyDaysFromNow.setMilliseconds(0);

    const amountExact = from("1000000", stablecoinToken.decimals);
    const result = await client.token.updateCollateral({
      contract: stablecoinToken.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      amount: amountExact,
      expiryDays: 30,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(stablecoinToken.type);
    expect(result.name).toBe(stablecoinToken.name);
    expect(result.symbol).toBe(stablecoinToken.symbol);
    expect(result.collateral?.collateral).toEqual(from(1_000_000));
    expect(
      result.collateral?.expiryTimestamp?.getTime()
    ).toBeGreaterThanOrEqual(thirtyDaysFromNow.getTime());
  });

  test("cannot update collateral if not a trusted claim issuer", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.token.updateCollateral(
        {
          contract: stablecoinToken.id,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          amount: "1000000",
          expiryDays: 30,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow();
  });
});
