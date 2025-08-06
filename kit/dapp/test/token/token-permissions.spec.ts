import { getOrpcClient } from "test/utils/orpc-client";
import { createToken } from "test/utils/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "test/utils/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Token permissions", () => {
  let token: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    token = await createToken(client, {
      name: "Test Token",
      symbol: "TT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
  });

  test("admin has all permissions", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const tokenInfo = await client.token.read({
      tokenAddress: token.id,
    });
    // TODO: should be updated after https://linear.app/settlemint/issue/ENG-3488/subgraphapi-acces-management
    expect(tokenInfo.userPermissions).toEqual({
      roles: {
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: true,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
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
        grantRole: true,
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
        setCap: false,
        setYieldSchedule: false,
        transfer: true,
        unpause: false,
      },
    });
  });

  test("investor has limited permissions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);
    const tokenInfo = await client.token.read({
      tokenAddress: token.id,
    });
    expect(tokenInfo.userPermissions).toEqual({
      roles: {
        addonManager: false,
        addonModule: false,
        addonRegistryModule: false,
        admin: false,
        auditor: false,
        burner: false,
        capManagement: false,
        claimPolicyManager: false,
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
        setCap: false,
        setYieldSchedule: false,
        transfer: true,
        unpause: false,
      },
    });
  });
});
