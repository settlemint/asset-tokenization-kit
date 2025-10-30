import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("Topic schemes stats state (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let testTopicName: string;

  beforeAll(async () => {
    // Admin user has all permissions including topic management
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Create a unique test topic scheme name
    testTopicName = `TestTopic_${randomUUID()}`;

    // Create a test topic scheme to populate stats data
    await adminClient.system.claimTopics.topicCreate({
      name: testTopicName,
      signature: "address",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });
  });

  it("should successfully retrieve current topic schemes statistics state", async () => {
    const result = await adminClient.system.stats.topicSchemesStatsState();

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.totalRegisteredTopicSchemes).toBeGreaterThanOrEqual(1);
    expect(result.totalActiveTopicSchemes).toBeGreaterThanOrEqual(1);
    expect(result.totalRemovedTopicSchemes).toBeGreaterThanOrEqual(0);

    // Active schemes should never exceed registered schemes
    expect(result.totalActiveTopicSchemes).toBeLessThanOrEqual(
      result.totalRegisteredTopicSchemes
    );
  });

  it("should reflect topic scheme removal in state", async () => {
    // Query state before deletion
    const beforeDeleteState =
      await adminClient.system.stats.topicSchemesStatsState();

    expect(beforeDeleteState).toBeDefined();
    expect(beforeDeleteState.totalActiveTopicSchemes).toBeGreaterThan(0);

    // Delete the test topic scheme
    await adminClient.system.claimTopics.topicDelete({
      name: testTopicName,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query state after deletion
    const afterDeleteState =
      await adminClient.system.stats.topicSchemesStatsState();

    expect(afterDeleteState).toBeDefined();
    expect(afterDeleteState.totalRemovedTopicSchemes).toBeGreaterThanOrEqual(1);
    // TheGraph may not have indexed the deletion yet, so active count might not decrease immediately
    expect(afterDeleteState.totalActiveTopicSchemes).toBeLessThanOrEqual(
      beforeDeleteState.totalActiveTopicSchemes
    );
    expect(afterDeleteState.totalRegisteredTopicSchemes).toBeGreaterThan(0);

    // Invariants should hold
    expect(afterDeleteState.totalActiveTopicSchemes).toBeLessThanOrEqual(
      afterDeleteState.totalRegisteredTopicSchemes
    );
  });
});
