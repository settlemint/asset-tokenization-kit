import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("Topic schemes stats (integration)", () => {
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
      signature: "isTestVerified(address)",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });
  });

  it("should successfully retrieve topic schemes statistics with trailing24Hours preset", async () => {
    const result =
      await adminClient.system.stats.topicSchemesStats("trailing24Hours");

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

    // Since some topic schemes are deployed with the system, these should be > 0
    expect(lastDataPoint?.totalRegisteredTopicSchemes).toBeGreaterThan(0);
    expect(lastDataPoint?.totalActiveTopicSchemes).toBeGreaterThan(0);

    // Removed count should be defined but we don't know the value yet
    expect(lastDataPoint?.totalRemovedTopicSchemes).toBeGreaterThanOrEqual(0);
  });

  it("should reflect topic scheme removal in stats", async () => {
    // Query stats before deletion to capture active count
    const beforeDeleteResult =
      await adminClient.system.stats.topicSchemesStats("trailing24Hours");

    const beforeDeleteLastDataPoint = beforeDeleteResult.data.at(-1);
    expect(beforeDeleteLastDataPoint).toBeDefined();

    // Delete the test topic scheme
    await adminClient.system.claimTopics.topicDelete({
      name: testTopicName,
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Query stats again after deletion
    const afterDeleteResult =
      await adminClient.system.stats.topicSchemesStats("trailing24Hours");

    // Assert last data point now shows at least one removed topic
    const afterDeleteLastDataPoint = afterDeleteResult.data.at(-1);
    expect(afterDeleteLastDataPoint).toBeDefined();
    expect(
      afterDeleteLastDataPoint?.totalRemovedTopicSchemes
    ).toBeGreaterThanOrEqual(1);

    // Registered count should remain the same or increase (topics can be added)
    expect(
      afterDeleteLastDataPoint?.totalRegisteredTopicSchemes
    ).toBeGreaterThan(0);

    // Active count should have decreased after removal
    expect(afterDeleteLastDataPoint?.totalActiveTopicSchemes).toBeLessThan(
      beforeDeleteLastDataPoint?.totalActiveTopicSchemes ?? 0
    );
  });
});
