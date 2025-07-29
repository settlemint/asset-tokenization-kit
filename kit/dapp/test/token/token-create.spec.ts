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
    const system = await client.system.read({ id: "default" });

    expect(system?.tokenFactoryRegistry).toBeDefined();
    if (!system?.tokenFactoryRegistry) {
      return;
    }

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
      contract: system?.tokenFactoryRegistry,
      ...tokenData,
    });

    let isDeployed = false;
    if (result.id && result.type) {
      // Token was successfully created
      isDeployed = true;
    }

    expect(isDeployed).toBe(true);

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
  });

  test("regular users cant create tokens", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);
    const system = await client.system.read({ id: "default" });

    expect(system?.tokenFactoryRegistry).toBeDefined();
    const tokenFactoryRegistry = system?.tokenFactoryRegistry;
    if (!tokenFactoryRegistry) {
      return;
    }

    await expect(
      client.token.create({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        contract: tokenFactoryRegistry,
        type: "stablecoin",
        name: `Test Stablecoin Investor ${Date.now()}`,
        symbol: "TSTC",
        decimals: 18,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });
});
