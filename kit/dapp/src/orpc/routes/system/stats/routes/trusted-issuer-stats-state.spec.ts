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

describe("Trusted issuer stats state (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;
  let claimTopicIds: string[];

  beforeAll(async () => {
    // Create a unique test user for this test run
    targetTestUser = await createTestUser("trusted-issuer-stats-state-test");
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

  it("should successfully retrieve current trusted issuer statistics state", async () => {
    const result = await adminClient.system.stats.trustedIssuerStatsState();

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.totalAddedTrustedIssuers).toBeGreaterThanOrEqual(1);
    expect(result.totalActiveTrustedIssuers).toBeGreaterThanOrEqual(1);
    expect(result.totalRemovedTrustedIssuers).toBeGreaterThanOrEqual(0);

    // Active issuers should never exceed added issuers
    expect(result.totalActiveTrustedIssuers).toBeLessThanOrEqual(
      result.totalAddedTrustedIssuers
    );
  });

  it("should reflect trusted issuer addition and removal in state", async () => {
    // Query state before adding
    const beforeAddState =
      await adminClient.system.stats.trustedIssuerStatsState();

    expect(beforeAddState).toBeDefined();

    // Add the test user as a trusted issuer
    await adminClient.system.trustedIssuers.create({
      issuerAddress: targetIdentityAddress,
      claimTopicIds,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query state after adding
    const afterAddState =
      await adminClient.system.stats.trustedIssuerStatsState();

    expect(afterAddState).toBeDefined();
    expect(afterAddState.totalAddedTrustedIssuers).toBeGreaterThan(
      beforeAddState.totalAddedTrustedIssuers
    );
    expect(afterAddState.totalActiveTrustedIssuers).toBeGreaterThan(
      beforeAddState.totalActiveTrustedIssuers
    );

    // Remove the test user as a trusted issuer
    await adminClient.system.trustedIssuers.delete({
      issuerAddress: targetIdentityAddress,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query state after removal
    const afterRemoveState =
      await adminClient.system.stats.trustedIssuerStatsState();

    expect(afterRemoveState).toBeDefined();
    expect(afterRemoveState.totalRemovedTrustedIssuers).toBeGreaterThanOrEqual(
      1
    );
    expect(afterRemoveState.totalActiveTrustedIssuers).toBeLessThan(
      afterAddState.totalActiveTrustedIssuers
    );

    // Invariants should hold
    expect(afterRemoveState.totalActiveTrustedIssuers).toBeLessThanOrEqual(
      afterRemoveState.totalAddedTrustedIssuers
    );
  });
});
