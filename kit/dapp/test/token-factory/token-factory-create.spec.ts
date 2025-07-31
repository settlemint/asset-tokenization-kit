import { describe, expect, test } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token factory create", () => {
  test("can create a token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.factoryCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      factories: [{ type: "equity", name: "Test Token" }],
    });

    // The factoryCreate method returns a FactoryCreateOutput with status and results
    expect(result.status).toBe("completed");
    expect(result.results).toBeDefined();
    expect(result.results?.length).toBeGreaterThan(0);

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
