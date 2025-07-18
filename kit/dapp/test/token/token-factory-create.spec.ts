import { describe, expect, it } from "bun:test";
import { getOrpcClient } from "../utils/orpc-client";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token factory create", () => {
  it("can create a token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const system = await client.system.read({ id: "default" });

    expect(system?.tokenFactoryRegistry).toBeDefined();
    if (!system?.tokenFactoryRegistry) {
      return;
    }

    const result = await client.token.factoryCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      contract: system?.tokenFactoryRegistry,
      factories: [{ type: "equity", name: "Test Token" }],
    });

    let isDeployed = false;
    for await (const event of result) {
      if (event.status !== "completed") {
        continue;
      }
      if (event.currentFactory) {
        // It is alread deployed
        isDeployed = true;
      }
      if (event.result?.["0"]?.transactionHash) {
        // First deploy
        isDeployed = true;
      }
    }

    expect(isDeployed).toBe(true);

    const factories = await client.token.factoryList({});
    expect(factories.length).toBeGreaterThan(0);
    expect(factories.find((f) => f.name === "Test Token")).toEqual({
      id: expect.any(String),
      name: "Test Token",
      typeId: "ATKEquityFactory",
      hasTokens: expect.any(Boolean),
    });
  });
});
