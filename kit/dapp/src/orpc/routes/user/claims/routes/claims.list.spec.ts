import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
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

    // Set up test claims for testing filtering
    // Issue a KYC claim that only admin can see
    await adminClient.user.claims.issue({
      targetIdentityAddress: targetAccount.identity,
      claim: {
        topic: "knowYourCustomer",
        data: {
          claim: "kyc-verified",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: "123456",
      },
    });

    // Issue a collateral claim that issuer can see
    await issuerClient.user.claims.issue({
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
        secretVerificationCode: "123456",
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
    const result = await adminClient.user.claims.list({
      wallet: targetUserData.wallet,
    });

    expect(result).toBeDefined();
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.identity).toBeDefined();
    expect(result.isRegistered).toBe(true);
    expect(result.wallet).toBe(targetUserData.wallet);

    // Admin should see both KYC and collateral claims
    const claimTopics = result.claims.map((claim) => claim.name);
    expect(claimTopics).toContain("knowYourCustomer");
    expect(claimTopics).toContain("collateral");
  });

  it("should successfully list filtered claims when user is a trusted issuer", async () => {
    // Debug: ensure system exists and trusted issuer row includes collateral for this issuer
    const systems = await adminClient.system.list({});
    expect(systems.length).toBeGreaterThan(0);
    const issuerMe = await issuerClient.account.me({});
    const issuerIdentity = issuerMe?.identity;
    expect(issuerIdentity).toBeDefined();
    const trustedIssuers = await adminClient.system.trustedIssuers.list({});
    const tiMatch = trustedIssuers.find(
      (t) => t.id?.toLowerCase() === issuerIdentity?.toLowerCase()
    );
    expect(tiMatch).toBeDefined();
    expect(tiMatch?.claimTopics.map((t) => t.name)).toContain("collateral");

    // Wait until issuer can see at least the collateral claim
    await waitUntil({
      get: () =>
        issuerClient.user.claims.list({ wallet: targetUserData.wallet }),
      until: (result) => result.claims.some((c) => c.name === "collateral"),
      timeoutMs: 60_000,
      intervalMs: 1000,
    });

    // Issuer user should only see claims for topics they're trusted issuer for
    const result = await issuerClient.user.claims.list({
      wallet: targetUserData.wallet,
    });

    expect(result).toBeDefined();
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.identity).toBeDefined();
    expect(result.isRegistered).toBe(true);
    expect(result.wallet).toBe(targetUserData.wallet);

    // Issuer should only see collateral claims, not KYC claims
    const claimTopics = result.claims.map((claim) => claim.name);
    expect(claimTopics).toContain("collateral");
    expect(claimTopics).not.toContain("knowYourCustomer");
  });

  it("should not show claims for topics user is not trusted issuer for", async () => {
    // Create another test user and issue only KYC claims (which issuer cannot see)
    const kycOnlyUser = await createTestUser("kyc-only-user");
    const kycUserData = await getUserData(kycOnlyUser.user);

    if (kycUserData.wallet) {
      await registerUserIdentity(adminClient, kycUserData.wallet);
    } else {
      throw new Error("KYC test user does not have a wallet");
    }

    await waitUntil({
      get: () => adminClient.account.read({ wallet: kycUserData.wallet }),
      until: (account) => Boolean(account?.identity),
      timeoutMs: 60_000,
      intervalMs: 1000,
    });

    const kycAccount = await adminClient.account.read({
      wallet: kycUserData.wallet,
    });
    if (!kycAccount?.identity) {
      throw new Error("KYC test user does not have an identity setup");
    }

    // Issue only KYC claim (admin only)
    await adminClient.user.claims.issue({
      targetIdentityAddress: kycAccount.identity,
      claim: {
        topic: "knowYourCustomer",
        data: {
          claim: "kyc-verified",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: "123456",
      },
    });

    await waitUntil({
      get: () => adminClient.account.read({ wallet: kycUserData.wallet }),
      until: (account) =>
        (account?.claims?.filter((c) => c.name === "knowYourCustomer").length ??
          0) >= 1,
      timeoutMs: 60_000,
      intervalMs: 1000,
    });

    // Issuer should see empty claims array for this user
    const result = await issuerClient.user.claims.list({
      wallet: kycUserData.wallet,
    });

    expect(result).toBeDefined();
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims).toHaveLength(0); // No claims visible to issuer
    expect(result.identity).toBeDefined();
    expect(result.isRegistered).toBe(true);
    expect(result.wallet).toBe(kycUserData.wallet);
  });

  it("should fail when user doesn't have required role", async () => {
    // Investor user should NOT have identityManager or claimIssuer role
    await expect(
      investorClient.user.claims.list({
        wallet: targetUserData.wallet,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action"
    );
  });
});
