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
          denominationAsset {
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

  type BondToken = NonNullable<ResultOf<typeof bondQuery>["tokens"]>[number];
  let bondToken: BondToken;
  beforeAll(async () => {
    const bondResponse = await theGraphClient.request(bondQuery);
    const firstToken = bondResponse.tokens?.[0];
    if (!firstToken) {
      throw new Error("Expected at least one bond token for stats tests");
    }
    bondToken = firstToken;
  });

  it("should track bond statistics with denomination asset balance", async () => {
    const query = theGraphGraphql(
      `query($tokenId: ID!) {
        tokenBondStatsState(id: $tokenId) {
          id
          denominationAssetBalanceAvailable
          denominationAssetBalanceAvailableExact
          denominationAssetBalanceRequired
          denominationAssetBalanceRequiredExact
          coveredPercentage
        }
      }
    `
    );

    const response = await theGraphClient.request(query, {
      tokenId: bondToken.id,
    });

    const denominationAssetBalance =
      bondToken.bond?.denominationAsset.balances.find(
        (balance) => balance.account.id === bondToken.id
      );
    const requiredBalanceExact =
      Number(bondToken.totalSupplyExact) *
      Number(bondToken.bond?.faceValueExact ?? 0);
    const coveredPercentage =
      requiredBalanceExact > 0
        ? (Number(denominationAssetBalance?.valueExact ?? 0) /
            requiredBalanceExact) *
          100
        : 0;
    expect(
      Number(
        response.tokenBondStatsState?.denominationAssetBalanceAvailableExact
      )
    ).toBeCloseTo(Number(denominationAssetBalance?.valueExact ?? 0), 2);
    expect(
      Number(
        response.tokenBondStatsState?.denominationAssetBalanceRequiredExact
      )
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
          where: { bond: $tokenId }
          orderBy: timestamp
          orderDirection: desc
          first: 5
          interval: hour
        ) {
          id
          timestamp
          denominationAssetBalanceAvailable
          denominationAssetBalanceAvailableExact
          denominationAssetBalanceRequired
          coveredPercentage
        }
      }
    `
    );

    const response = await theGraphClient.request(query, {
      tokenId: bondToken.id,
    });
    const aggregatedStats = response.tokenBondStatsHours ?? [];

    // Check if we have aggregated stats (might be empty if no time has passed)
    if (!aggregatedStats.length) {
      return;
    }
    const stats = aggregatedStats[0]!;
    expect(stats).toHaveProperty("coveredPercentage");

    // Coverage percentage should be (available / required) * 100
    const available = Number(stats.denominationAssetBalanceAvailable);
    const required = Number(stats.denominationAssetBalanceRequired);

    if (required > 0) {
      const expectedCoverage = (available / required) * 100;
      // Allow for some rounding differences
      expect(
        Math.abs(parseFloat(stats.coveredPercentage) - expectedCoverage)
      ).toBeLessThan(0.01);
    }
  });
});
