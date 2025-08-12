import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { describe, expect, test } from "vitest";

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
  }, 100_000);

  test("can create a fund token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const fundData = {
      type: "fund" as const,
      name: `Test Fund ${Date.now()}`,
      symbol: "TSTF",
      decimals: 18,
      managementFeeBps: 100, // 1% management fee
      initialModulePairs: [],
    };

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...fundData,
      countryCode: "056",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(fundData.type);
    expect(result.name).toBe(fundData.name);
    expect(result.symbol).toBe(fundData.symbol);

    const tokens = await client.token.list({});
    const createdFund = tokens.find((t) => t.name === fundData.name);
    expect(createdFund).toBeDefined();
    expect(createdFund).toMatchObject({
      id: expect.any(String),
      type: fundData.type,
      name: fundData.name,
      symbol: fundData.symbol,
    });
  }, 100_000);

  test("can create a bond token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // First create a stablecoin to use as denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
    };

    const stablecoinResult = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...stablecoinData,
      countryCode: "056",
    });

    expect(stablecoinResult).toBeDefined();
    expect(stablecoinResult.id).toBeDefined();

    // Now create the bond using the stablecoin address
    const bondData = {
      type: "bond" as const,
      name: `Test Bond ${Date.now()}`,
      symbol: "TSTB",
      decimals: 18,
      cap: "1000000",
      faceValue: "1000",
      maturityDate: new Date("2025-12-31"),
      denominationAsset: stablecoinResult.id,
      initialModulePairs: [],
    };

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...bondData,
      countryCode: "056",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(bondData.type);
    expect(result.name).toBe(bondData.name);
    expect(result.symbol).toBe(bondData.symbol);

    // Verify the bond appears in the token list
    const tokens = await client.token.list({});
    const createdBond = tokens.find((t) => t.name === bondData.name);
    expect(createdBond).toBeDefined();
    expect(createdBond).toMatchObject({
      id: expect.any(String),
      type: bondData.type,
      name: bondData.name,
      symbol: bondData.symbol,
    });
  }, 100_000);

  test("can create an equity token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const equityData = {
      type: "equity" as const,
      name: `Test Equity ${Date.now()}`,
      symbol: "TSTE",
      decimals: 0,
      initialModulePairs: [],
    };

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...equityData,
      countryCode: "056",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(equityData.type);
    expect(result.name).toBe(equityData.name);
    expect(result.symbol).toBe(equityData.symbol);

    // Verify the equity appears in the token list
    const tokens = await client.token.list({});
    const createdEquity = tokens.find((t) => t.name === equityData.name);
    expect(createdEquity).toBeDefined();
    expect(createdEquity).toMatchObject({
      id: expect.any(String),
      type: equityData.type,
      name: equityData.name,
      symbol: equityData.symbol,
    });
  }, 100_000);

  test("can create a deposit token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const depositData = {
      type: "deposit" as const,
      name: `Test Deposit ${Date.now()}`,
      symbol: "TSTD",
      decimals: 2,
      initialModulePairs: [],
    };

    const result = await client.token.create({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      ...depositData,
      countryCode: "056",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(depositData.type);
    expect(result.name).toBe(depositData.name);
    expect(result.symbol).toBe(depositData.symbol);

    // Verify the deposit appears in the token list
    const tokens = await client.token.list({});
    const createdDeposit = tokens.find((t) => t.name === depositData.name);
    expect(createdDeposit).toBeDefined();
    expect(createdDeposit).toMatchObject({
      id: expect.any(String),
      type: depositData.type,
      name: depositData.name,
      symbol: depositData.symbol,
    });
  }, 100_000);

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
      "User does not have the required role to execute this action."
    );
  });
});
