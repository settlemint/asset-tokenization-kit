import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { addDays } from "date-fns";
import { from } from "dnum";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token update collateral", () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(headers);

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

    const amountExact = from("1000000", stablecoinToken.decimals);
    const thirtyDaysFromNow = addDays(new Date(), 30);
    thirtyDaysFromNow.setMilliseconds(0);

    const result = await client.token.updateCollateral({
      contract: stablecoinToken.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      amount: amountExact,
      expiryTimestamp: thirtyDaysFromNow,
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
    const tomorrow = addDays(new Date(), 1);

    await expect(
      client.token.updateCollateral(
        {
          contract: stablecoinToken.id,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          amount: from("10", stablecoinToken.decimals),
          expiryTimestamp: tomorrow,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow("You are not a trusted issuer for topic(s): collateral");
  });
});
