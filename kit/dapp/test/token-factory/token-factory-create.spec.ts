import { describe, expect, test } from "vitest";
import { isAssetExtensionArray } from "../../src/lib/zod/validators/asset-extensions";
import { getOrpcClient } from "../utils/orpc-client";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token factory create", () => {
  test("can create a token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.tokenFactoryCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      factories: [{ type: "equity", name: "Test Token" }],
    });

    // The factoryCreate method now returns the updated system details
    expect(result.id).toBeDefined();
    expect(result.tokenFactories).toBeDefined();
    expect(result.tokenFactories.length).toBeGreaterThan(0);

    const factories = await client.system.tokenFactoryList({});
    expect(factories.length).toBeGreaterThan(0);
    const factory = factories.find((f) => f.name === "Test Token");
    expect(factory).toEqual({
      id: expect.any(String),
      name: "Test Token",
      typeId: "ATKEquityFactory",
      tokenExtensions: expect.any(Array),
      hasTokens: expect.any(Boolean),
    });

    // Verify tokenExtensions is a valid asset extension array
    expect(isAssetExtensionArray(factory?.tokenExtensions)).toBe(true);
  });
});
