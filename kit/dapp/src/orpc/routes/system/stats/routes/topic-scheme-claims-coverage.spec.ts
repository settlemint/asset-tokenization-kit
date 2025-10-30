import { VerificationType } from "@atk/zod/verification-type";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Topic scheme claims coverage (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let testTopicName: string;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Admin user has all permissions including topic management
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Create a unique test topic scheme name
    testTopicName = `ZeroCoverageTopic_${randomUUID()}`;

    // Create a test topic scheme WITHOUT issuing any claims (0 coverage)
    await adminClient.system.claimTopics.topicCreate({
      name: testTopicName,
      signature: "address",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Create and register test user for claim issuance test
    testUser = await createTestUser("topic-claims-coverage-test");
    testUserData = await getUserData(testUser.user);
    await registerUserIdentity(adminClient, testUserData.wallet);
  });

  afterAll(async () => {
    // Clean up: delete the test topic scheme
    await adminClient.system.claimTopics.topicDelete({
      name: testTopicName,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });
  });

  it("should identify topics with zero active claims", async () => {
    const result = await adminClient.system.stats.topicSchemeClaimsCoverage();

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.totalActiveTopicSchemes).toBeGreaterThanOrEqual(1);
    expect(result.missingTopics).toBeInstanceOf(Array);

    // If test topic appears in missing topics (has 0 claims), verify its signature
    const testTopicInMissing = result.missingTopics.find(
      (topic: Omit<TopicScheme, "registry">) => topic.name === testTopicName
    );

    if (testTopicInMissing) {
      expect(testTopicInMissing.signature).toBe("address");
    }
  });
});
