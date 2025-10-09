import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TrustedIssuerStats", () => {
  it("should fetch trusted issuer stats state with all issuer counts", async () => {
    const query = theGraphGraphql(
      `query {
        trustedIssuerStatsStates {
          id
          trustedIssuersRegistry {
            id
          }
          totalAddedTrustedIssuers
          totalActiveTrustedIssuers
          totalRemovedTrustedIssuers
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    const trustedIssuerStatsStates = response.trustedIssuerStatsStates ?? [];

    expect(Array.isArray(trustedIssuerStatsStates)).toBe(true);
    const state = trustedIssuerStatsStates[0];

    // Verify all required fields exist
    expect(state?.id).toBeDefined();
    expect(state?.trustedIssuersRegistry).toBeDefined();
    expect(state?.totalAddedTrustedIssuers).toBeDefined();
    expect(state?.totalActiveTrustedIssuers).toBeDefined();
    expect(state?.totalRemovedTrustedIssuers).toBeDefined();

    // Based on the hardhat scripts, we should have 3 added issuers, 3 active issuers, and 0 removed issuers
    expect(state?.totalAddedTrustedIssuers).toBe("3");
    expect(state?.totalActiveTrustedIssuers).toBe("3");
    expect(state?.totalRemovedTrustedIssuers).toBe("0");
  });
});
