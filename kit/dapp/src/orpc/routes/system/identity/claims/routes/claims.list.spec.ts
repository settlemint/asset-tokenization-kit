import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import type { IdentityClaim } from "@atk/zod/claim";
import { VerificationType } from "@atk/zod/verification-type";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { waitUntil } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims list (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Create a unique test user for this test run to ensure determinism
    targetTestUser = await createTestUser("claim-list-target");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has identityManager role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Issuer user has claimIssuer role but is only trusted for specific topics (not KYC)
    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Register identity for the target test user
    if (targetUserData.wallet) {
      await registerUserIdentity(adminClient, targetUserData.wallet);
    } else {
      throw new Error("Target test user does not have a wallet");
    }

    // Wait until identity is indexed in the subgraph
    await waitUntil({
      get: () => adminClient.account.read({ wallet: targetUserData.wallet }),
      until: (account) => Boolean(account?.identity),
      timeoutMs: 60_000,
      intervalMs: 1000,
    });

    // Get the target user's identity address for issuing claims
    const targetAccount = await adminClient.account.read({
      wallet: targetUserData.wallet,
    });
    if (!targetAccount?.identity) {
      throw new Error("Target test user does not have an identity setup");
    }

    // Set up test claims (no read filtering applied by API)
    // Issue a KYC claim
    await adminClient.system.identity.claims.issue({
      targetIdentityAddress: targetAccount.identity,
      claim: {
        topic: "knowYourCustomer",
        data: {
          claim: "kyc-verified",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Issue a collateral claim
    await issuerClient.system.identity.claims.issue({
      targetIdentityAddress: targetAccount.identity,
      claim: {
        topic: "collateral",
        data: {
          amount: "1000000000000000000",
          expiryTimestamp: "1735689600",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Wait until both claims are visible in the subgraph
    await waitUntil({
      get: () => adminClient.account.read({ wallet: targetUserData.wallet }),
      until: (account) => (account?.claims?.length ?? 0) >= 2,
      timeoutMs: 60_000,
      intervalMs: 1000,
    });
  });

  it("should successfully list all claims when user has identityManager role", async () => {
    // Admin user should see ALL claims (KYC + collateral)
    const result = await adminClient.system.identity.claims.list({
      accountId: targetUserData.wallet,
    });

    expect(result).toBeDefined();
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.identity).toBeDefined();
    expect(result.isRegistered).toBe(true);
    expect(result.accountId).toBe(targetUserData.wallet);

    // Admin should see both KYC and collateral claims
    const claimTopics = result.claims.map((claim: IdentityClaim) => claim.name);
    expect(claimTopics).toContain("knowYourCustomer");
    expect(claimTopics).toContain("collateral");
  });

  it("should list all claims regardless of issuer trust", async () => {
    // Issuer user should see all claims (public on-chain)
    const result = await issuerClient.system.identity.claims.list({
      accountId: targetUserData.wallet,
    });

    expect(result).toBeDefined();
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.identity).toBeDefined();
    expect(result.isRegistered).toBe(true);
    expect(result.accountId).toBe(targetUserData.wallet);

    // Issuer should see both KYC and collateral claims
    const claimTopics = result.claims.map((claim: IdentityClaim) => claim.name);
    expect(claimTopics).toContain("collateral");
    expect(claimTopics).toContain("knowYourCustomer");
  });

  // No per-topic filtering: claims are public on-chain; issuer sees all

  it("should fail when user doesn't have required role", async () => {
    // Investor user should NOT have identityManager or claimIssuer role
    await expect(
      investorClient.system.identity.claims.list(
        {
          accountId: targetUserData.wallet,
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
