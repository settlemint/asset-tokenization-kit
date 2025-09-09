import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { describe, expect, it } from "vitest";

describe("Token burn", () => {
  it("can burn tokens", async () => {
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
        basePrice: from("1.00", 2),
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
      amounts: [from("5", depositToken.decimals)],
      recipients: [admin.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    await client.token.burn({
      contract: depositToken.id,
      addresses: [admin.wallet],
      amounts: [from("1", depositToken.decimals)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    const updatedHolders = await client.token.holders({
      tokenAddress: depositToken.id,
    });
    expect(updatedHolders.token?.balances.length).toBe(1);
    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === admin.wallet
      )?.value
    ).toEqual(from("4"));
  });
});
