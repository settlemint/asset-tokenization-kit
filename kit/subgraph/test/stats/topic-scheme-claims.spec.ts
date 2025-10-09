import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TopicSchemeStats", () => {
  it("should verify topic schemes with stats have exact expected values", async () => {
    const query = theGraphGraphql(
      `query {
        topicSchemes {
          name
          stats {
            totalActiveClaims
            totalIssuedClaims
            totalRemovedClaims
            totalRevokedClaims
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    const topicSchemes = response.topicSchemes ?? [];

    expect(Array.isArray(topicSchemes)).toBe(true);

    // Expected stats for topic schemes that have claims
    const expectedStatsMap: Record<
      string,
      {
        totalActiveClaims: number;
        totalIssuedClaims: number;
        totalRemovedClaims: number;
        totalRevokedClaims: number;
      } | null
    > = {
      accreditedInvestor: null,
      issuerJurisdiction: null,
      assetClassification: {
        totalActiveClaims: 2,
        totalIssuedClaims: 2,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      knowYourCustomer: {
        totalActiveClaims: 6,
        totalIssuedClaims: 6,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      qualifiedInstitutionalInvestor: null,
      contractIdentity: {
        totalActiveClaims: 8,
        totalIssuedClaims: 8,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      collateral: {
        totalActiveClaims: 1,
        totalIssuedClaims: 1,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      basePrice: {
        totalActiveClaims: 5,
        totalIssuedClaims: 6,
        totalRemovedClaims: 1,
        totalRevokedClaims: 0,
      },
      assetIssuer: {
        totalActiveClaims: 6,
        totalIssuedClaims: 6,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      accreditedInvestorVerified: null,
      issuerReportingCompliant: null,
      issuerProspectusFiled: null,
      issuerLicensed: null,
      antiMoneyLaundering: {
        totalActiveClaims: 5,
        totalIssuedClaims: 6,
        totalRemovedClaims: 0,
        totalRevokedClaims: 1,
      },
      isin: {
        totalActiveClaims: 5,
        totalIssuedClaims: 5,
        totalRemovedClaims: 0,
        totalRevokedClaims: 0,
      },
      professionalInvestor: null,
      issuerProspectusExempt: null,
      regulationS: null,
    };

    // Verify each topic scheme matches expected stats
    for (const topicScheme of topicSchemes) {
      const expectedStats = expectedStatsMap[topicScheme.name];

      if (!expectedStats) {
        // Topic schemes with no claims should have null stats
        expect(topicScheme.stats).toBeNull();
        continue;
      }

      // Topic schemes with claims should have exact matching stats
      const totalActiveClaims = topicScheme.stats?.totalActiveClaims;
      const totalIssuedClaims = topicScheme.stats?.totalIssuedClaims;
      const totalRemovedClaims = topicScheme.stats?.totalRemovedClaims;
      const totalRevokedClaims = topicScheme.stats?.totalRevokedClaims;

      expect(topicScheme.stats).not.toBeNull();
      expect(totalActiveClaims).toBe(
        expectedStats.totalActiveClaims.toString()
      );
      expect(totalIssuedClaims).toBe(
        expectedStats.totalIssuedClaims.toString()
      );
      expect(totalRemovedClaims).toBe(
        expectedStats.totalRemovedClaims.toString()
      );
      expect(totalRevokedClaims).toBe(
        expectedStats.totalRevokedClaims.toString()
      );
    }
  });

  it("should aggregate to match overall claims stats", async () => {
    const query = theGraphGraphql(
      `query {
        topicSchemes {
          name
          stats {
            totalIssuedClaims
            totalActiveClaims
            totalRemovedClaims
            totalRevokedClaims
          }
        }
        claimsStatsStates {
          totalIssuedClaims
          totalActiveClaims
          totalRemovedClaims
          totalRevokedClaims
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    const topicSchemes = response.topicSchemes ?? [];
    const claimsStatsStates = response.claimsStatsStates ?? [];

    if (!topicSchemes.length || !claimsStatsStates.length) {
      return;
    }

    // Sum up all topic scheme stats (only those with stats)
    let sumIssuedClaims = 0;
    let sumActiveClaims = 0;
    let sumRemovedClaims = 0;
    let sumRevokedClaims = 0;

    for (const topicScheme of topicSchemes) {
      if (topicScheme.stats) {
        sumIssuedClaims += Number(topicScheme.stats.totalIssuedClaims);
        sumActiveClaims += Number(topicScheme.stats.totalActiveClaims);
        sumRemovedClaims += Number(topicScheme.stats.totalRemovedClaims);
        sumRevokedClaims += Number(topicScheme.stats.totalRevokedClaims);
      }
    }

    const overallStats = claimsStatsStates[0]!;

    // The sum of all topic scheme stats should equal the overall claims stats
    expect(sumIssuedClaims).toBe(Number(overallStats.totalIssuedClaims));
    expect(sumActiveClaims).toBe(Number(overallStats.totalActiveClaims));
    expect(sumRemovedClaims).toBe(Number(overallStats.totalRemovedClaims));
    expect(sumRevokedClaims).toBe(Number(overallStats.totalRevokedClaims));
  });
});
