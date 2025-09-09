import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { describe, expect, it } from "vitest";

describe("Token transfer", () => {
  it("can transfer tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const depositToken = await createToken(
      client,
      {
        name: "Deposit Token",
        symbol: `DT`,
        decimals: 18,
        type: "deposit",
        countryCode: "056", // Belgium numeric code for testing
        basePrice: from("1"),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        grantRole: ["supplyManagement"],
        unpause: true,
      }
    );
    const admin = await getUserData(DEFAULT_ADMIN);
    await client.token.mint({
      contract: depositToken.id,
      amounts: [from("500", depositToken.decimals)],
      recipients: [admin.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    const investor = await getUserData(DEFAULT_INVESTOR);
    await client.token.transfer({
      contract: depositToken.id,
      amounts: [from("5", depositToken.decimals)],
      recipients: [investor.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    const updatedHolders = await client.token.holders({
      tokenAddress: depositToken.id,
    });
    expect(updatedHolders.token?.balances.length).toBe(2);
    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === admin.wallet
      )?.value
    ).toEqual(from("495"));
    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === investor.wallet
      )?.value
    ).toEqual(from("5"));
  });
});
