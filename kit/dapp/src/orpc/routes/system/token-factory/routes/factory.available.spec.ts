import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { describe, expect, test } from "vitest";

describe("Factory available", () => {
  test("returns true for new token parameters that haven't been deployed", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Check availability for parameters that haven't been used yet
    const result = await client.system.factory.available({
      parameters: {
        type: "equity",
        name: `Undeployed Token ${Date.now()}`,
        symbol: "UNDP",
        decimals: 18,
      },
    });

    expect(result.isAvailable).toBe(true);
  }, 100_000);

  test("returns false after deploying token with same parameters", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Define token parameters
    const tokenParams = {
      type: "equity" as const,
      name: `Test Equity ${Date.now()}`,
      symbol: "TSTE",
      decimals: 18,
    };

    // Check availability before deployment - should be true
    const availabilityBefore = await client.system.factory.available({
      parameters: tokenParams,
    });

    expect(availabilityBefore.isAvailable).toBe(true);

    // Deploy the token
    const token = await createToken(
      client,
      {
        ...tokenParams,
        basePrice: from("1.00", 2),
        countryCode: "056",
        class: "COMMON_EQUITY",
        category: "VENTURE_CAPITAL",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        useExactName: true,
      }
    );

    expect(token).toBeDefined();
    expect(token.id).toBeDefined();

    // Check availability after deployment - should be false
    const availabilityAfter = await client.system.factory.available({
      parameters: tokenParams,
    });

    expect(availabilityAfter.isAvailable).toBe(false);
  }, 100_000);

  test("returns false when checking deployed token's access control address directly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Deploy a token
    const token = await createToken(
      client,
      {
        type: "equity",
        name: `Direct Check Token ${Date.now()}`,
        symbol: "DRCT",
        decimals: 18,
        basePrice: from("1.00", 2),
        countryCode: "056",
        class: "COMMON_EQUITY",
        category: "VENTURE_CAPITAL",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        useExactName: true,
      }
    );

    expect(token).toBeDefined();
    expect(token.accessControl?.id).toBeDefined();

    // Check availability using the deployed token's access control address
    const result = await client.system.factory.available({
      accessControl: token.accessControl!.id,
    });

    expect(result.isAvailable).toBe(false);
  }, 100_000);
});
