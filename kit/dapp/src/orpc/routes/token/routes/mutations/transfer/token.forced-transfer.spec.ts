import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Token forced transfer", () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    depositToken = await createToken(
      client,
      {
        name: "Deposit Token",
        symbol: `DFT`,
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
        grantRole: ["supplyManagement", "custodian"],
        unpause: true,
      }
    );

    const admin = await getUserData(DEFAULT_ADMIN);
    const investor = await getUserData(DEFAULT_INVESTOR);

    await client.token.mint({
      contract: depositToken.id,
      amounts: [
        from("500", depositToken.decimals),
        from("100", depositToken.decimals),
      ],
      recipients: [admin.wallet, investor.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("allows custodians to forcibly transfer tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const investor = await getUserData(DEFAULT_INVESTOR);
    const issuer = await getUserData(DEFAULT_ISSUER);

    await client.token.forcedTransfer({
      contract: depositToken.id,
      from: [investor.wallet],
      recipients: [issuer.wallet],
      amounts: [from("5", depositToken.decimals)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    const updatedHolders = await client.token.holders({
      tokenAddress: depositToken.id,
    });

    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === investor.wallet
      )?.value
    ).toEqual(from("95"));

    expect(
      updatedHolders.token?.balances.find(
        (balance) => balance.account.id === issuer.wallet
      )?.value
    ).toEqual(from("5"));
  });
});
