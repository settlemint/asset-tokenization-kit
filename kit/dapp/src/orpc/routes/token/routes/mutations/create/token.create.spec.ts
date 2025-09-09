import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { addYears } from "date-fns";
import { equal as dnumEqual, from as dnumFrom } from "dnum";
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
      basePrice: dnumFrom("2.25", 2),
    } as const;

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    expect(tokens.find((t) => t.id === result.id)).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...tokenData,
      account: {
        identity: {
          id: expect.any(String),
        },
      },
      pausable: {
        paused: true,
      },
      totalSupply: dnumFrom("0"),
      basePrice: dnumFrom("2.25", 2),
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
      basePrice: dnumFrom("1.33", 2),
    };

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    const createdFund = tokens.find((t) => t.id === result.id);
    expect(createdFund).toBeDefined();
    expect(createdFund).toMatchObject({
      id: expect.any(String),
      type: fundData.type,
      name: fundData.name,
      symbol: fundData.symbol,
      basePrice: dnumFrom("1.33", 2),
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
      basePrice: dnumFrom("1"),
    };

    const stablecoinResult = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
      cap: dnumFrom("1000000", 18),
      faceValue: dnumFrom("1000", 18), // 1000 stablecoin scaled to 18 decimals
      maturityDate: new Date("2025-12-31"),
      denominationAsset: stablecoinResult.id,
      initialModulePairs: [],
    };

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    const createdBond = tokens.find((t) => t.id === result.id);
    expect(createdBond).toBeDefined();
    expect(createdBond).toMatchObject({
      id: expect.any(String),
      type: bondData.type,
      name: bondData.name,
      symbol: bondData.symbol,
    });
  }, 100_000);

  test("can create a bond with different decimals than denomination asset", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Create a USDC-like denomination asset with 6 decimals
    const usdcData = {
      type: "stablecoin" as const,
      name: `Test USDC ${Date.now()}`,
      symbol: "TUSDC",
      decimals: 6, // USDC-like with 6 decimals
      initialModulePairs: [],
      basePrice: dnumFrom("1.25", 2),
    };

    const usdcResult = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...usdcData,
      countryCode: "056",
    });

    expect(usdcResult).toBeDefined();
    expect(usdcResult.id).toBeDefined();

    // Create bond with 18 decimals but denomination asset has 6 decimals
    // Face value should be scaled according to denomination asset decimals
    const faceValue = dnumFrom("1000", 6);
    const cap = dnumFrom("1000000", 18);
    const bondData = {
      type: "bond" as const,
      name: `Test Bond Different Decimals ${Date.now()}`,
      symbol: "TBDD",
      decimals: 18, // Bond token has 18 decimals
      cap: cap,
      faceValue: faceValue,
      maturityDate: addYears(new Date(), 1),
      denominationAsset: usdcResult.id,
      initialModulePairs: [],
    };

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      ...bondData,
      countryCode: "056",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe(bondData.type);
    expect(result.name).toBe(bondData.name);
    expect(result.symbol).toBe(bondData.symbol);

    const token = await client.token.read({ tokenAddress: result.id });
    expect(
      token.bond?.faceValue && dnumEqual(faceValue, token.bond.faceValue)
    ).toBe(true);
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
      basePrice: dnumFrom("1"),
    };

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    const createdEquity = tokens.find((t) => t.id === result.id);
    expect(createdEquity).toBeDefined();
    expect(createdEquity).toMatchObject({
      id: expect.any(String),
      type: equityData.type,
      name: equityData.name,
      symbol: equityData.symbol,
      basePrice: dnumFrom("1"),
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
      basePrice: dnumFrom("1"),
    };

    const result = await client.token.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    const createdDeposit = tokens.find((t) => t.id === result.id);
    expect(createdDeposit).toBeDefined();
    expect(createdDeposit).toMatchObject({
      id: expect.any(String),
      type: depositData.type,
      name: depositData.name,
      symbol: depositData.symbol,
      basePrice: dnumFrom("1"),
    });
  }, 100_000);

  test("regular users cant create tokens", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.token.create(
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          type: "stablecoin",
          name: `Test Stablecoin Investor ${Date.now()}`,
          symbol: "TSTC",
          decimals: 18,
          basePrice: dnumFrom("1"),
          countryCode: "056", // Belgium numeric code for testing
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });
});
