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

describe("Trusted issuer stats (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;
  let claimTopicIds: string[];

  beforeAll(async () => {
    // Create a unique test user for this test run
    targetTestUser = await createTestUser("trusted-issuer-stats-test");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has all permissions
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Register identity for the target test user
    await registerUserIdentity(adminClient, targetUserData.wallet);

    // Get the target user's identity address
    const targetIdentity = await adminClient.system.identity.read({
      wallet: targetUserData.wallet,
    });
    targetIdentityAddress = targetIdentity.id;

    // Get available claim topics to use when creating trusted issuer
    const topics = await adminClient.system.claimTopics.topicList({});
    claimTopicIds = topics.map((t) => t.topicId);
  });

  it("should successfully retrieve trusted issuer statistics with trailing24Hours preset", async () => {
    const result =
      await adminClient.system.stats.trustedIssuerStats("trailing24Hours");

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

    // Admin is already a trusted issuer, so these should be >= 1
    expect(lastDataPoint?.totalAddedTrustedIssuers).toBeGreaterThanOrEqual(1);
    expect(lastDataPoint?.totalActiveTrustedIssuers).toBeGreaterThanOrEqual(1);

    // Removed count should be defined
    expect(lastDataPoint?.totalRemovedTrustedIssuers).toBeGreaterThanOrEqual(0);
  });

  it("should reflect trusted issuer addition and removal in stats", async () => {
    // Add the test user as a trusted issuer
    await adminClient.system.trustedIssuers.create({
      issuerAddress: targetIdentityAddress,
      claimTopicIds,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query stats after adding trusted issuer
    const afterAddResult =
      await adminClient.system.stats.trustedIssuerStats("trailing24Hours");

    const afterAddLastDataPoint = afterAddResult.data.at(-1);
    expect(afterAddLastDataPoint).toBeDefined();
    expect(
      afterAddLastDataPoint?.totalAddedTrustedIssuers
    ).toBeGreaterThanOrEqual(2);
    expect(
      afterAddLastDataPoint?.totalActiveTrustedIssuers
    ).toBeGreaterThanOrEqual(2);

    // Remove the test user as a trusted issuer
    await adminClient.system.trustedIssuers.delete({
      issuerAddress: targetIdentityAddress,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query stats after removing trusted issuer
    const afterRemoveResult =
      await adminClient.system.stats.trustedIssuerStats("trailing24Hours");

    const afterRemoveLastDataPoint = afterRemoveResult.data.at(-1);
    expect(afterRemoveLastDataPoint).toBeDefined();
    expect(
      afterRemoveLastDataPoint?.totalRemovedTrustedIssuers
    ).toBeGreaterThanOrEqual(1);
    expect(
      afterRemoveLastDataPoint?.totalAddedTrustedIssuers
    ).toBeGreaterThanOrEqual(2);

    // Active count should have decreased after removal
    expect(afterRemoveLastDataPoint?.totalActiveTrustedIssuers).toBeLessThan(
      afterAddLastDataPoint?.totalActiveTrustedIssuers ?? 0
    );
  });
});
