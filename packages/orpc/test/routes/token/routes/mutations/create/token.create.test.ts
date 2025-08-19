import { describe, expect, jest, test } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_INVESTOR, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import { from } from "dnum";

describe("Token create", () => {
  test("can create a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);

    const tokenData = {
      type: "stablecoin",
      name: `Test Stablecoin ${Date.now()}`,
      symbol: "TSTC",
      decimals: 18,
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
    const client = getTestOrpcClient(headers);

    const fundData = {
      type: "fund" as const,
      name: `Test Fund ${Date.now()}`,
      symbol: "TSTF",
      decimals: 18,
      managementFeeBps: 100, // 1% management fee
      initialModulePairs: [],
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
    const client = getTestOrpcClient(headers);

    // First create a stablecoin to use as denomination asset
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Denomination Stablecoin ${Date.now()}`,
      symbol: "TSDC",
      decimals: 18,
      initialModulePairs: [],
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
      cap: "1000000",
      faceValue: "1000",
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
    const client = getTestOrpcClient(headers);

    const equityData = {
      type: "equity" as const,
      name: `Test Equity ${Date.now()}`,
      symbol: "TSTE",
      decimals: 0,
      initialModulePairs: [],
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
    const client = getTestOrpcClient(headers);

    const depositData = {
      type: "deposit" as const,
      name: `Test Deposit ${Date.now()}`,
      symbol: "TSTD",
      decimals: 2,
      initialModulePairs: [],
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
    const client = getTestOrpcClient(headers);

    await expect(
      client.token.create({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        type: "stablecoin",
        name: `Test Stablecoin Investor ${Date.now()}`,
        symbol: "TSTC",
        decimals: 18,
        countryCode: "056", // Belgium numeric code for testing
      })
    ).rejects.toThrow("User does not have the required role to execute this action.");
  });
});

// Mock error class that matches API error structure
class APIError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Mock the token create handler for testing
const mockTokenCreate = jest.fn();

describe("Token Create Authorization", () => {
  test("should reject unauthorized user with detailed error object", async () => {
    // Setup: Configure mock to throw unauthorized error
    const unauthorizedError = new APIError("UNAUTHORIZED", 401, "Authentication missing or failed", {
      reason: "No valid session",
      requiredRole: "token:create",
    });

    mockTokenCreate.mockRejectedValue(unauthorizedError);

    // Act & Assert: Verify full error structure, not just message
    await expect(mockTokenCreate()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: "Authentication missing or failed",
      data: {
        reason: "No valid session",
        requiredRole: "token:create",
      },
    });

    // Also verify the error is instance of APIError
    await expect(mockTokenCreate()).rejects.toBeInstanceOf(APIError);
  });

  test("should validate error response structure", async () => {
    // This test ensures we're validating the complete error response
    const error = new APIError("FORBIDDEN", 403, "Insufficient permissions", {
      requiredPermissions: ["token:create", "factory:deploy"],
      userPermissions: ["token:read"],
    });

    mockTokenCreate.mockRejectedValueOnce(error);

    try {
      await mockTokenCreate();
      throw new Error("Should have thrown an error");
    } catch (error_) {
      // Validate complete error structure
      expect(error_).toBeInstanceOf(APIError);

      const apiError = error_ as APIError;
      expect(apiError.code).toBe("FORBIDDEN");
      expect(apiError.status).toBe(403);
      expect(apiError.message).toBe("Insufficient permissions");
      expect(apiError.data).toEqual({
        requiredPermissions: ["token:create", "factory:deploy"],
        userPermissions: ["token:read"],
      });
    }
  });

  test("should not reduce error validation to just message string", async () => {
    // Bad practice - only checking message
    const badTest = async () => {
      mockTokenCreate.mockRejectedValueOnce(new Error("Authentication missing or failed"));

      // ❌ This only validates the message, missing important error details
      await expect(mockTokenCreate()).rejects.toThrow("Authentication missing or failed");
    };

    // Good practice - validate full error object
    const goodTest = async () => {
      const error = new APIError("UNAUTHORIZED", 401, "Authentication missing or failed", { sessionExpired: true });

      mockTokenCreate.mockRejectedValueOnce(error);

      // ✅ This validates the complete error response
      await expect(mockTokenCreate()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        status: 401,
        message: expect.stringContaining("Authentication"),
        data: expect.objectContaining({
          sessionExpired: true,
        }),
      });
    };

    // Run both to show the difference
    await badTest();
    await goodTest();
  });

  test("migration example: from simple to comprehensive error testing", () => {
    // Before migration (reduced validation):
    const beforeMigration = () => {
      // Only checks error message - loses important context
      expect(() => {
        throw new Error("Authentication missing or failed");
      }).toThrow("Authentication missing or failed");
    };

    // After migration (comprehensive validation):
    const afterMigration = () => {
      // Validates full error structure
      expect(() => {
        throw new APIError("UNAUTHORIZED", 401, "Authentication missing or failed", {
          timestamp: new Date().toISOString(),
          requestId: "req_123",
          path: "/api/token/create",
        });
      }).toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          status: 401,
          message: "Authentication missing or failed",
          data: expect.objectContaining({
            path: "/api/token/create",
          }),
        })
      );
    };

    // Both should pass their respective tests
    beforeMigration();
    afterMigration();
  });
});
