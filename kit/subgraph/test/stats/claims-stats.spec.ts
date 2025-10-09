import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("ClaimsStats", () => {
  it("should fetch claims stats state with all claim counts", async () => {
    const query = theGraphGraphql(
      `query {
        claimsStatsStates {
          id
          topicSchemeRegistry {
            id
          }
          totalIssuedClaims
          totalActiveClaims
          totalRemovedClaims
          totalRevokedClaims
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    const claimsStatsStates = response.claimsStatsStates ?? [];

    expect(Array.isArray(claimsStatsStates)).toBe(true);
    const state = claimsStatsStates[0];

    // Verify all required fields exist
    expect(state?.id).toBeDefined();
    expect(state?.topicSchemeRegistry).toBeDefined();
    expect(state?.totalIssuedClaims).toBeDefined();
    expect(state?.totalActiveClaims).toBeDefined();
    expect(state?.totalRemovedClaims).toBeDefined();
    expect(state?.totalRevokedClaims).toBeDefined();

    // Based on the hardhat scripts, we should have 40 issued claims, 38 active claims, 1 removed claim, and 1 revoked claim
    expect(state?.totalIssuedClaims).toBe("40");
    expect(state?.totalActiveClaims).toBe("38");
    expect(state?.totalRemovedClaims).toBe("1");
    expect(state?.totalRevokedClaims).toBe("1");
  });
});
