import { isAssetExtensionArray } from "@atk/zod/asset-extensions";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("Token factory create", () => {
  test("can create a token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.factory.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      factories: [{ type: "equity", name: "Test Token" }],
    });

    // The factoryCreate method now returns the updated system details
    expect(result.id).toBeDefined();
    expect(result.tokenFactoryRegistry.tokenFactories).toBeDefined();
    expect(result.tokenFactoryRegistry.tokenFactories.length).toBeGreaterThan(0);

    const factories = await client.system.factory.list({});
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
