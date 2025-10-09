import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TopicsStats", () => {
  it("should fetch topics stats state with all topic scheme counts", async () => {
    const query = theGraphGraphql(
      `query {
        topicsStatsStates {
          id
          topicSchemeRegistry {
            id
          }
          totalRegisteredTopicSchemes
          totalActiveTopicSchemes
          totalRemovedTopicSchemes
        }
        topicSchemes {
          id
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    const topicsStatsStates = response.topicsStatsStates ?? [];
    const topicSchemes = response.topicSchemes ?? [];
    const topicSchemesCount = topicSchemes.length;

    expect(Array.isArray(topicSchemes)).toBe(true);
    expect(Array.isArray(topicsStatsStates)).toBe(true);
    expect(topicSchemesCount).toBe(18);

    const state = topicsStatsStates[0];

    // Verify all required fields exist
    expect(state?.id).toBeDefined();
    expect(state?.topicSchemeRegistry).toBeDefined();
    expect(state?.totalRegisteredTopicSchemes).toBeDefined();
    expect(state?.totalActiveTopicSchemes).toBeDefined();
    expect(state?.totalRemovedTopicSchemes).toBeDefined();

    // Based on the hardhat scripts, we should have 18 registered topic schemes, 18 active topic schemes, and 0 removed topic schemes
    expect(state?.totalRegisteredTopicSchemes).toBe(topicSchemesCount);
    expect(state?.totalActiveTopicSchemes).toBe(topicSchemesCount);
    expect(state?.totalRemovedTopicSchemes).toBe(0);
  });
});
