import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Token search", () => {
  let usdToken: Awaited<ReturnType<typeof createToken>>;
  let euroToken: Awaited<ReturnType<typeof createToken>>;
  let ethToken: Awaited<ReturnType<typeof createToken>>;
  let client: OrpcClient;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);

    // Create tokens with different names and symbols for search testing
    [usdToken, euroToken, ethToken] = await Promise.all([
      createToken(client, {
        name: "USD Stablecoin",
        symbol: "USDC",
        decimals: 18,
        type: "stablecoin",
        countryCode: "056",
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      }),

      createToken(client, {
        name: "Euro Token",
        symbol: "EURT",
        decimals: 18,
        type: "stablecoin",
        countryCode: "056",
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      }),

      createToken(client, {
        name: "Ethereum Deposit",
        symbol: "ETH",
        decimals: 18,
        type: "deposit",
        countryCode: "056",
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      }),
    ]);
  });

  it("can search tokens by name", async () => {
    const results = await client.token.search({
      query: "USD",
      limit: 10,
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.find((t) => t.id === usdToken.id)).toBeDefined();

    // Should not find tokens without USD in name
    expect(results.find((t) => t.id === euroToken.id)).toBeUndefined();
  });

  it("can search tokens by symbol", async () => {
    const results = await client.token.search({
      query: "EUR",
      limit: 10,
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.find((t) => t.id === euroToken.id)).toBeDefined();

    // Should not find tokens without EUR in symbol
    expect(results.find((t) => t.id === usdToken.id)).toBeUndefined();
  });

  it("can search tokens by address", async () => {
    // Search by the exact token address
    const results = await client.token.search({
      query: ethToken.id,
      limit: 10,
    });

    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(ethToken.id);
    expect(results[0]?.symbol).toBe("ETH");
  });

  it("performs case-insensitive search", async () => {
    // Search with lowercase
    const lowercaseResults = await client.token.search({
      query: "eth",
      limit: 10,
    });

    // Search with uppercase
    const uppercaseResults = await client.token.search({
      query: "ETH",
      limit: 10,
    });

    // Both should find the ETH token
    expect(lowercaseResults.find((t) => t.id === ethToken.id)).toBeDefined();
    expect(uppercaseResults.find((t) => t.id === ethToken.id)).toBeDefined();
  });

  it("respects the limit parameter", async () => {
    // Create a generic search that might match multiple tokens
    const results = await client.token.search({
      query: "e", // This should match Euro, Ethereum
      limit: 2,
    });

    expect(results.length).toBe(2);
  });

  it("returns empty array for non-matching search", async () => {
    const results = await client.token.search({
      query: "NONEXISTENTTOKEN123",
      limit: 10,
    });

    expect(results).toEqual([]);
  });

  it("can perform partial matches", async () => {
    // Search for partial name match
    const nameResults = await client.token.search({
      query: "Stable", // Should match "USD Stablecoin"
      limit: 10,
    });

    expect(nameResults.length).toBeGreaterThanOrEqual(1);

    // Search for partial symbol match
    const symbolResults = await client.token.search({
      query: "USD", // Should match "USDC" symbol
      limit: 10,
    });

    expect(symbolResults.length).toBeGreaterThanOrEqual(1);
  });
});
