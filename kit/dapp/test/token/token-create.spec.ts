import { ORPCError } from "@orpc/server";
import { from } from "dnum";
import { describe, expect, test } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "../utils/user";

describe("Token create", () => {
  test("can create a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const tokenData = {
      type: "stablecoin",
      name: `Test Stablecoin ${Date.now()}`,
      symbol: "TSTC",
      decimals: 18,
    } as const;

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...tokenData,
      countryCode: "056",
    });

    // The create method now returns the complete token object directly
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(tokenData.type);
    expect(result.name).toBe(tokenData.name);
    expect(result.symbol).toBe(tokenData.symbol);

    // Give the graph some time to index
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const tokens = await client.token.list({});
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.find((t) => t.name === tokenData.name)).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...tokenData,
      pausable: {
        paused: true,
      },
      totalSupply: from("0"),
    });
  }, 10_0000);

  test("regular users cant create tokens", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.token.create({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        type: "stablecoin",
        name: `Test Stablecoin Investor ${Date.now()}`,
        symbol: "TSTC",
        decimals: 18,
        countryCode: "056", // Belgium numeric code for testing
      })
    ).rejects.toThrow(
      new ORPCError("USER_NOT_AUTHORIZED", {
        message: "User does not have the required role to execute this action.",
      })
    );
  });
});
