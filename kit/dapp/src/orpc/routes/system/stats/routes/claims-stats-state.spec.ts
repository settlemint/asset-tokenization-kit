import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims stats state (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Create a unique test user for this test run
    targetTestUser = await createTestUser("claims-stats-state-test");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has identityManager role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Register identity for the target test user
    await registerUserIdentity(adminClient, targetUserData.wallet);

    // Get the target user's identity address for issuing claims
    const targetIdentity = await adminClient.system.identity.readByWallet({
      wallet: targetUserData.wallet,
    });

    // Issue a KYC claim to populate stats data
    await adminClient.system.identity.claims.issue({
      targetIdentityAddress: targetIdentity.id,
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
  });

  it("should successfully retrieve current claims statistics state", async () => {
    const result = await adminClient.system.stats.claimsStatsState();

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.totalIssuedClaims).toBeGreaterThanOrEqual(1);
    expect(result.totalActiveClaims).toBeGreaterThanOrEqual(1);
    expect(result.totalRemovedClaims).toBeGreaterThanOrEqual(0);
    expect(result.totalRevokedClaims).toBeGreaterThanOrEqual(0);

    // Active claims should never exceed issued claims
    expect(result.totalActiveClaims).toBeLessThanOrEqual(
      result.totalIssuedClaims
    );
  });
});
