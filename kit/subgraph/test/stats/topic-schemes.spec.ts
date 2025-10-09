import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TopicSchemesStats", () => {
  it("should fetch topic schemes registration stats with all topic scheme counts", async () => {
    const query = theGraphGraphql(
      `query {
        topicSchemesStates {
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
    const topicSchemesStates = response.topicSchemesStates ?? [];
    const topicSchemes = response.topicSchemes ?? [];
    const topicSchemesCount = topicSchemes.length;

    expect(Array.isArray(topicSchemes)).toBe(true);
    expect(Array.isArray(topicSchemesStates)).toBe(true);
    expect(topicSchemesCount).toBe(18);

    const state = topicSchemesStates[0];

    // Verify all required fields exist
    expect(state?.id).toBeDefined();
    expect(state?.topicSchemeRegistry).toBeDefined();
    expect(state?.totalRegisteredTopicSchemes).toBeDefined();
    expect(state?.totalActiveTopicSchemes).toBeDefined();
    expect(state?.totalRemovedTopicSchemes).toBeDefined();

    // Based on the hardhat scripts, we should have 18 registered topic schemes, 18 active topic schemes, and 0 removed topic schemes
    expect(state?.totalRegisteredTopicSchemes).toBe(
      topicSchemesCount.toString()
    );
    expect(state?.totalActiveTopicSchemes).toBe(topicSchemesCount.toString());
    expect(state?.totalRemovedTopicSchemes).toBe("0");
  });
});
