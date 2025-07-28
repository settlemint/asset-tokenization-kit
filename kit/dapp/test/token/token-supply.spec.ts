import { describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "../utils/user";

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
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    const admin = await getUserData(DEFAULT_ADMIN);
    const investor = await getUserData(DEFAULT_INVESTOR);
    await client.token.mint({
      contract: depositToken.id,
      amounts: ["500", "100"],
      recipients: [admin.wallet, investor.wallet],
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
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
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    await client.token.transfer({
      contract: depositToken.id,
      amounts: ["5"],
      recipients: [issuer.wallet],
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
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
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    await client.token.burn({
      contract: depositToken.id,
      addresses: [admin.wallet],
      amounts: ["1"],
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
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
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    await client.token.approve({
      contract: depositToken.id,
      spender: admin.id,
      amount: "10",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
  });
});
