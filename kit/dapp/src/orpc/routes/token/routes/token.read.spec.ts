import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Token read", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Create a test token to read
    testToken = await createToken(
      client,
      {
        name: "Test Read Token",
        symbol: "TRT",
        decimals: 18,
        type: "stablecoin",
        countryCode: "056",
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        grantRole: ["custodian", "governance", "supplyManagement", "emergency"],
      }
    );
  });

  it("can read token details", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Verify basic token properties
    expect(token).toBeDefined();
    expect(token.id).toBe(testToken.id);
    expect(token.symbol).toBe("TRT");
    expect(token.decimals).toBe(18);
    expect(token.type).toBe("stablecoin");
    expect(token.stats?.totalValueInBaseCurrency).toEqual(from("0"));
    expect(token.stats?.balancesCount).toEqual(0);
    const basePriceClaim = token.identity?.claims?.find(
      (c) => c.name === "basePrice"
    );
    expect(basePriceClaim).toBeDefined();
    expect(basePriceClaim?.values).toEqual([
      { key: "amount", value: "100" },
      { key: "currencyCode", value: "USD" },
      { key: "decimals", value: "2" },
    ]);
  });

  it("returns correct token metadata", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check extended token properties
    expect(token.totalSupply).toBeDefined();
    expect(token.totalSupply).toEqual(from("0")); // New token should have 0 supply
    expect(token.createdAt).toBeInstanceOf(Date);
    expect(token.pausable).toBeDefined();
    expect(token.pausable?.paused).toBe(true); // Tokens start paused by default
    expect(token.extensions).toBeInstanceOf(Array);
  });

  it("throws error for non-existent token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const nonExistentToken = "0x0000000000000000000000000000000000000001";

    // Use a valid but non-existent address
    await expect(
      client.token.read(
        {
          tokenAddress: nonExistentToken,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
          },
        }
      )
    ).rejects.toThrow(`Token with address '${nonExistentToken}' not found`);
  });

  it("throws error for invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.read(
        {
          tokenAddress: "invalid-address" as unknown as string,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
          },
        }
      )
    ).rejects.toThrow("Token address is not a valid Ethereum address");
  });

  it("includes token-specific metadata when present", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check for optional token-specific metadata
    // These may be null depending on token type
    expect(token.capped).toBeDefined(); // May be null
    expect(token.redeemable).toBeDefined(); // May be null
    expect(token.bond).toBeDefined(); // May be null for non-bond tokens
    expect(token.fund).toBeDefined(); // May be null for non-fund tokens
    expect(token.collateral).toBeDefined(); // May be null for non-collateral tokens
  });

  it("returns implementation flags correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    // Check implementation flags
    expect(typeof token.implementsERC3643).toBe("boolean");
    expect(typeof token.implementsSMART).toBe("boolean");
  });

  it("returns creator information", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const token = await client.token.read({
      tokenAddress: testToken.id,
    });

    expect(token.createdBy).toBeDefined();
    expect(token.createdBy.id).toBeDefined();
    // The creator ID should be a valid Ethereum address
    expect(token.createdBy.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("handles multiple consecutive reads", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Read the same token multiple times
    const [token1, token2, token3] = await Promise.all([
      client.token.read({ tokenAddress: testToken.id }),
      client.token.read({ tokenAddress: testToken.id }),
      client.token.read({ tokenAddress: testToken.id }),
    ]);

    // All reads should return the same data
    expect(token1.id).toBe(token2.id);
    expect(token2.id).toBe(token3.id);
    expect(token1.name).toBe(token2.name);
    expect(token2.name).toBe(token3.name);
    expect(token1.symbol).toBe(token2.symbol);
    expect(token2.symbol).toBe(token3.symbol);
  });

  it("admin has all permissions to execute token actions", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const tokenInfo = await client.token.read({
      tokenAddress: testToken.id,
    });
    const expectedPermissions: typeof tokenInfo.userPermissions = {
      roles: {
        custodian: true,
        emergency: true,
        governance: true,
        supplyManagement: true,
        admin: true,
      },
      isAllowed: true,
      actions: {
        burn: true,
        grantRole: true,
        mint: true,
        pause: true,
        addComplianceModule: true,
        approve: true,
        forcedRecover: true,
        freezeAddress: true,
        freezePartial: true,
        unfreezePartial: true,
        recoverERC20: true,
        recoverTokens: true,
        mature: true,
        redeem: true,
        removeComplianceModule: true,
        revokeRole: true,
        setCap: true,
        setYieldSchedule: true,
        transfer: true,
        forcedTransfer: true,
        unpause: true,
        updateCollateral: false,
        withdrawDenominationAsset: true,
        topUpDenominationAsset: true,
      },
    };
    expect(tokenInfo.userPermissions).toEqual(expectedPermissions);
  });

  it("investor has limited permissions to execute token actions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);
    const tokenInfo = await client.token.read({
      tokenAddress: testToken.id,
    });
    const expectedPermissions: typeof tokenInfo.userPermissions = {
      roles: {
        custodian: false,
        emergency: false,
        governance: false,
        supplyManagement: false,
        admin: false,
      },
      isAllowed: true,
      actions: {
        burn: false,
        grantRole: false,
        mint: false,
        pause: false,
        addComplianceModule: false,
        approve: true,
        forcedRecover: false,
        freezeAddress: false,
        freezePartial: false,
        unfreezePartial: false,
        recoverERC20: false,
        recoverTokens: false,
        mature: false,
        redeem: true,
        removeComplianceModule: false,
        revokeRole: false,
        setCap: false,
        setYieldSchedule: false,
        transfer: true,
        forcedTransfer: false,
        unpause: false,
        updateCollateral: true,
        withdrawDenominationAsset: false,
        topUpDenominationAsset: true,
      },
    };
    expect(tokenInfo.userPermissions).toEqual(expectedPermissions);
  });
});
