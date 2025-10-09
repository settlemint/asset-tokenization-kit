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

describe("Claims stats (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;

  beforeAll(async () => {
    // Create a unique test user for this test run
    targetTestUser = await createTestUser("claims-stats-test");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has identityManager role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Register identity for the target test user
    await registerUserIdentity(adminClient, targetUserData.wallet);

    // Get the target user's identity address for issuing claims
    const targetIdentity = await adminClient.system.identity.read({
      wallet: targetUserData.wallet,
    });
    targetIdentityAddress = targetIdentity.id;

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

  it("should successfully retrieve claims statistics with trailing24Hours preset", async () => {
    const result =
      await adminClient.system.stats.claimsStats("trailing24Hours");

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.range).toBeDefined();
    expect(result.range.from).toBeInstanceOf(Date);
    expect(result.range.to).toBeInstanceOf(Date);
    expect(result.range.interval).toBe("hour");
    expect(result.range.isPreset).toBe(true);

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);

    // Assert last data point values (end of timeseries)
    const lastDataPoint = result.data.at(-1);
    expect(lastDataPoint).toBeDefined();
    expect(lastDataPoint?.timestamp).toBeInstanceOf(Date);
    expect(lastDataPoint?.totalActiveClaims).toBeGreaterThanOrEqual(1);
    expect(lastDataPoint?.totalIssuedClaims).toBeGreaterThanOrEqual(1);
    expect(lastDataPoint?.totalRemovedClaims).toBeGreaterThanOrEqual(0);
    expect(lastDataPoint?.totalRevokedClaims).toBeGreaterThanOrEqual(0);
  });

  it("should reflect claim revocation in stats", async () => {
    // Issue an AML claim that we'll revoke
    await adminClient.system.identity.claims.issue({
      targetIdentityAddress,
      claim: {
        topic: "antiMoneyLaundering",
        data: {
          claim: "aml-verified",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query stats before revocation to capture counts
    const beforeRevokeResult =
      await adminClient.system.stats.claimsStats("trailing24Hours");

    const beforeRevokeLastDataPoint = beforeRevokeResult.data.at(-1);
    expect(beforeRevokeLastDataPoint).toBeDefined();

    // Revoke the AML claim
    await adminClient.system.identity.claims.revoke({
      targetIdentityAddress,
      claimTopic: "antiMoneyLaundering",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query stats after revocation
    const afterRevokeResult =
      await adminClient.system.stats.claimsStats("trailing24Hours");

    const afterRevokeLastDataPoint = afterRevokeResult.data.at(-1);
    expect(afterRevokeLastDataPoint).toBeDefined();

    // Revoked count should have increased
    expect(afterRevokeLastDataPoint?.totalRevokedClaims).toBeGreaterThanOrEqual(
      1
    );
    expect(afterRevokeLastDataPoint?.totalRevokedClaims).toBeGreaterThan(
      beforeRevokeLastDataPoint?.totalRevokedClaims ?? 0
    );

    // Active count should have decreased after revocation
    expect(afterRevokeLastDataPoint?.totalActiveClaims).toBeLessThan(
      beforeRevokeLastDataPoint?.totalActiveClaims ?? 0
    );

    // Issued count should remain the same (revocation doesn't change issued count)
    expect(afterRevokeLastDataPoint?.totalIssuedClaims).toBeGreaterThanOrEqual(
      beforeRevokeLastDataPoint?.totalIssuedClaims ?? 0
    );
  });
});
