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
        admin: false,
        bypassListManager: false,
        claimManager: false,
        custodian: false,
        deployer: false,
        emergency: false,
        implementationManager: false,
        registryManager: false,
        registrar: false,
        storageModifier: false,
        supplyManagement: false,
        governance: false,
      },
      isAllowed: true,
      actions: {
        burn: false,
        create: false,
        mint: false,
        pause: false,
        tokenAddComplianceModule: false,
        tokenApprove: true,
        tokenForcedRecover: false,
        tokenFreezeAddress: false,
        tokenRecoverERC20: false,
        tokenRecoverTokens: false,
        tokenRedeem: false,
        tokenRemoveComplianceModule: false,
        tokenSetCap: false,
        tokenSetYieldSchedule: false,
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
        admin: false,
        bypassListManager: false,
        claimManager: false,
        custodian: false,
        deployer: false,
        emergency: false,
        implementationManager: false,
        registryManager: false,
        registrar: false,
        storageModifier: false,
        supplyManagement: false,
        governance: false,
      },
      isAllowed: true,
      actions: {
        burn: false,
        create: false,
        mint: false,
        pause: false,
        tokenAddComplianceModule: false,
        tokenApprove: true,
        tokenForcedRecover: false,
        tokenFreezeAddress: false,
        tokenRecoverERC20: false,
        tokenRecoverTokens: false,
        tokenRedeem: false,
        tokenRemoveComplianceModule: false,
        tokenSetCap: false,
        tokenSetYieldSchedule: false,
        transfer: true,
        unpause: false,
      },
    });
  });
});
