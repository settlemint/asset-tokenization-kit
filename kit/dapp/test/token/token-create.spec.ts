import { describe, expect, it } from "bun:test";
import { getOrpcClient } from "../utils/orpc-client";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token create", () => {
  it("can create a token", async () => {
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

    expect(system?.tokenFactoryRegistry).toBeDefined();

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      contract: system?.tokenFactoryRegistry,
      ...tokenData,
    });

    let isDeployed = false;
    for await (const event of result) {
      console.log("Create token event", event);
      if (event.status !== "confirmed") {
        continue;
      }
      if (event.result && event.tokenType) {
        // First deploy
        isDeployed = true;
      }
    }

    expect(isDeployed).toBe(true);

    // Give the graph some time to index
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const tokens = await client.token.list({});
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.find((t) => t.name === tokenData.name)).toEqual({
      id: expect.any(String),
      ...tokenData,
      pausable: {
        paused: true,
      },
      totalSupply: "0,0",
    });
  });
});
