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
import { describe, expect, it } from "vitest";

// TODO: fix tests as part of https://linear.app/settlemint/issue/ENG-3488/subgraphapi-acces-management

describe("Token supply", () => {
  it.skip("can mint tokens to an address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const depositToken = await createToken(client, {
      name: "Deposit Token",
      symbol: `DT`,
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      basePrice: from("1"),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    const admin = await getUserData(DEFAULT_ADMIN);
    const investor = await getUserData(DEFAULT_INVESTOR);
    await client.token.mint({
      contract: depositToken.id,
      amounts: ["500", "100"],
      recipients: [admin.wallet, investor.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    const updatedHolders = await client.token.holders({
      tokenAddress: depositToken.id,
    });

    expect(updatedHolders.token?.balances).toEqual([]);
  });

  it.skip("can transfer tokens", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);
    const issuer = await getUserData(DEFAULT_ISSUER);
    const depositToken = await createToken(client, {
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
    });
    await client.token.transfer({
      contract: depositToken.id,
      amounts: ["5"],
      recipients: [issuer.wallet],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it.skip("can burn tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const admin = await getUserData(DEFAULT_ADMIN);
    const depositToken = await createToken(client, {
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
    });
    await client.token.burn({
      contract: depositToken.id,
      addresses: [admin.wallet],
      amounts: ["1"],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it.skip("can approve tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const admin = await getUserData(DEFAULT_ADMIN);
    const depositToken = await createToken(client, {
      name: "Deposit Token",
      symbol: `DT`,
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      basePrice: from("1"),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    await client.token.approve({
      contract: depositToken.id,
      spender: admin.id,
      amount: "10",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });
});
