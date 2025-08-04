import type { ResultOf } from "@settlemint/sdk-thegraph";
import { beforeAll, describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TokenBondStats", () => {
  const bondQuery = theGraphGraphql(
    `query {
      tokens(where: { bond_not: null }, first: 1) {
        id
        totalSupply
        totalSupplyExact
        decimals
        bond {
          faceValue
          faceValueExact
          underlyingAsset {
            id
            balances {
              id
              account {
                id
              }
              value
              valueExact
            }
          }
        }
      }
    }
  `
  );

  let bondToken: ResultOf<typeof bondQuery>["tokens"][0];
  beforeAll(async () => {
    const bondResponse = await theGraphClient.request(bondQuery);
    bondToken = bondResponse.tokens[0];
  });

  it("should track bond statistics with underlying asset balance", async () => {
    const query = theGraphGraphql(
      `query($tokenId: String!) {
        tokenBondStatsState(id: $tokenId) {
          id
          underlyingAssetBalanceAvailable
          underlyingAssetBalanceAvailableExact
          underlyingAssetBalanceRequired
          underlyingAssetBalanceRequiredExact
          coveredPercentage
        }
      }
    `
    );

    const response = await theGraphClient.request(query, {
      tokenId: bondToken.id,
    });

    const underlyingAssetBalance =
      bondToken.bond?.underlyingAsset.balances.find(
        (balance) => balance.account.id === bondToken.id
      );
    const requiredBalanceExact =
      Number(bondToken.totalSupplyExact) *
      Number(bondToken.bond?.faceValueExact ?? 0);
    const coveredPercentage =
      (Number(underlyingAssetBalance?.valueExact ?? 0) / requiredBalanceExact) *
      100;
    expect(
      Number(response.tokenBondStatsState?.underlyingAssetBalanceAvailableExact)
    ).toBeCloseTo(Number(underlyingAssetBalance?.valueExact ?? 0), 2);
    expect(
      Number(response.tokenBondStatsState?.underlyingAssetBalanceRequiredExact)
    ).toBeCloseTo(requiredBalanceExact, 2);
    expect(Number(response.tokenBondStatsState?.coveredPercentage)).toBeCloseTo(
      coveredPercentage,
      2
    );
  });

  it("should track aggregated bond statistics over time", async () => {
    const query = theGraphGraphql(
      `query($tokenId: String!) {
        tokenBondStatsHours: tokenBondStats_collection(
          where: { token: $tokenId }
          orderBy: timestamp
          orderDirection: desc
          first: 5
          interval: hour
        ) {
          id
          timestamp
          underlyingAssetBalanceAvailable
          underlyingAssetBalanceAvailableExact
          underlyingAssetBalanceRequired
          coveredPercentage
        }
      }
    `
    );

    const response = await theGraphClient.request(query, {
      tokenId: bondToken.id,
    });

    // Check if we have aggregated stats (might be empty if no time has passed)
    if (response.tokenBondStatsHours.length > 0) {
      const stats = response.tokenBondStatsHours[0];
      expect(stats).toHaveProperty("coveredPercentage");

      // Coverage percentage should be (available / required) * 100
      const available = Number(stats.underlyingAssetBalanceAvailable);
      const required = Number(stats.underlyingAssetBalanceRequired);

      if (required > 0) {
        const expectedCoverage = (available / required) * 100;
        // Allow for some rounding differences
        expect(
          Math.abs(parseFloat(stats.coveredPercentage) - expectedCoverage)
        ).toBeLessThan(0.01);
      }
    }
  });
});
