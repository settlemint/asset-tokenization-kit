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

describe("Token mint", () => {
  it("can mint tokens to an address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const depositToken = await createToken(
      client,
      {
        name: "Deposit Token",
        symbol: `DT`,
        decimals: 18,
        type: "deposit",
        countryCode: "056",
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
    const investor = await getUserData(DEFAULT_INVESTOR);
    await client.token.mint({
      contract: depositToken.id,
      amounts: [
        from("500.2", depositToken.decimals),
        from("100.3", depositToken.decimals),
      ],
      recipients: [admin.wallet, investor.wallet],
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
      )
    ).toEqual({
      account: {
        id: admin.wallet,
      },
      available: from("500.2", 1),
      frozen: from("0"),
      isFrozen: false,
      lastUpdatedAt: expect.any(Date),
      value: from("500.2", 1),
    });
    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === investor.wallet
      )
    ).toEqual({
      account: {
        id: investor.wallet,
      },
      available: from("100.3", 1),
      frozen: from("0"),
      isFrozen: false,
      lastUpdatedAt: expect.any(Date),
      value: from("100.3", 1),
    });
  });
});
