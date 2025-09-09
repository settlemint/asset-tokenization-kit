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
        basePrice: from("1"),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        grantRole: [
          "custodian",
          "governance",
          "supplyManagement",
          "emergency",
          "tokenManager",
        ],
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

    // Use a valid but non-existent address
    await expect(
      client.token.read(
        {
          tokenAddress: "0x0000000000000000000000000000000000000001",
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.THE_GRAPH_ERROR],
          },
        }
      )
    ).rejects.toThrow();
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
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: true,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
        claimIssuer: false,
        complianceAdmin: false,
        complianceManager: false,
        custodian: true,
        emergency: true,
        forcedTransfer: false,
        freezer: false,
        fundsManager: false,
        globalListManager: false,
        governance: true,
        identityManager: false,
        identityRegistryModule: false,
        minter: false,
        organisationIdentityManager: false,
        pauser: false,
        recovery: false,
        saleAdmin: false,
        signer: false,
        supplyManagement: true,
        systemManager: false,
        systemModule: false,
        tokenAdmin: false,
        tokenFactoryModule: false,
        tokenFactoryRegistryModule: false,
        tokenManager: true,
        verificationAdmin: false,
      },
      isAllowed: true,
      actions: {
        burn: true,
        create: true,
        grantRole: true,
        mint: true,
        pause: true,
        addComplianceModule: true,
        approve: true,
        forcedRecover: true,
        freezeAddress: true,
        recoverERC20: true,
        recoverTokens: true,
        redeem: true,
        removeComplianceModule: true,
        revokeRole: true,
        setCap: true,
        setYieldSchedule: true,
        transfer: true,
        unpause: true,
        updateCollateral: true,
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
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: false,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
        claimIssuer: false,
        complianceAdmin: false,
        complianceManager: false,
        custodian: false,
        emergency: false,
        forcedTransfer: false,
        freezer: false,
        fundsManager: false,
        globalListManager: false,
        governance: false,
        identityManager: false,
        identityRegistryModule: false,
        minter: false,
        organisationIdentityManager: false,
        pauser: false,
        recovery: false,
        saleAdmin: false,
        signer: false,
        supplyManagement: false,
        systemManager: false,
        systemModule: false,
        tokenAdmin: false,
        tokenFactoryModule: false,
        tokenFactoryRegistryModule: false,
        tokenManager: false,
        verificationAdmin: false,
      },
      isAllowed: true,
      actions: {
        burn: false,
        create: false,
        grantRole: false,
        mint: false,
        pause: false,
        addComplianceModule: false,
        approve: true,
        forcedRecover: false,
        freezeAddress: false,
        recoverERC20: false,
        recoverTokens: false,
        redeem: false,
        removeComplianceModule: false,
        revokeRole: false,
        setCap: false,
        setYieldSchedule: false,
        transfer: true,
        unpause: false,
        updateCollateral: false,
      },
    };
    expect(tokenInfo.userPermissions).toEqual(expectedPermissions);
  });
});
