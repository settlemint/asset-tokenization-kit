import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("TokenDistributionStats", () => {
  it("should fetch token distribution stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        tokenDistributionStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
          }
          percentageOwnedByTop5Holders
          balancesCountSegment1
          totalValueSegment1
          balancesCountSegment2
          totalValueSegment2
          balancesCountSegment3
          totalValueSegment3
          balancesCountSegment4
          totalValueSegment4
          balancesCountSegment5
          totalValueSegment5
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenDistributionStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenDistributionStats_collection)).toBe(
      true
    );

    // Verify that stats have required fields
    if (response.tokenDistributionStats_collection.length > 0) {
      const firstStat = response.tokenDistributionStats_collection[0];
      expect(firstStat?.timestamp).toBeDefined();
      expect(firstStat?.token).toBeDefined();
      expect(firstStat?.percentageOwnedByTop5Holders).toBeDefined();
      expect(firstStat?.balancesCountSegment1).toBeDefined();
      expect(firstStat?.totalValueSegment1).toBeDefined();
      expect(firstStat?.balancesCountSegment2).toBeDefined();
      expect(firstStat?.totalValueSegment2).toBeDefined();
      expect(firstStat?.balancesCountSegment3).toBeDefined();
      expect(firstStat?.totalValueSegment3).toBeDefined();
      expect(firstStat?.balancesCountSegment4).toBeDefined();
      expect(firstStat?.totalValueSegment4).toBeDefined();
      expect(firstStat?.balancesCountSegment5).toBeDefined();
      expect(firstStat?.totalValueSegment5).toBeDefined();
    }
  });

  it("should fetch token distribution stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        tokenDistributionStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
          }
          percentageOwnedByTop5Holders
          balancesCountSegment1
          balancesCountSegment2
          balancesCountSegment3
          balancesCountSegment4
          balancesCountSegment5
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenDistributionStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenDistributionStats_collection)).toBe(
      true
    );
  });

  it("should calculate distribution segments correctly", async () => {
    // Get tokens with balances
    const tokenQuery = theGraphGraphql(
      `query {
        tokens(where: {totalSupply_gt: "0"}) {
          id
          symbol
          totalSupply
          balances(orderBy: value, orderDirection: desc) {
            account {
              id
            }
            value
          }
          distributionStats {
            balancesCountSegment1
            totalValueSegment1
            balancesCountSegment2
            totalValueSegment2
            balancesCountSegment3
            totalValueSegment3
            balancesCountSegment4
            totalValueSegment4
            balancesCountSegment5
            totalValueSegment5
          }
        }
      }
    `
    );
    const tokenResponse = await theGraphClient.request(tokenQuery, {});

    if (tokenResponse.tokens.length === 0) {
      // Skip test if no tokens with balances exist
      return;
    }

    // Test distribution stats for each token
    for (const token of tokenResponse.tokens) {
      /*
       * Segment 1: 0-2%
       * Segment 2: 2-10%
       * Segment 3: 10-20%
       * Segment 4: 20-40%
       * Segment 5: 40-100%
       */
      const stats = token.distributionStats;
      const topHolder = token.balances.sort((a, b) => {
        return Number(b.value) - Number(a.value);
      })[0];
      const topBalance = topHolder ? Number(topHolder.value) : 0;

      const expectedPerSegment = token.balances
        .filter((balance) => Number(balance.value) > 0)
        .reduce(
          (acc, balance) => {
            const percentage = Number(balance.value) / Number(topBalance);
            if (percentage <= 0.02) {
              acc.segment1 += 1;
              acc.segment1Value = acc.segment1Value + Number(balance.value);
            } else if (percentage <= 0.1) {
              acc.segment2 += 1;
              acc.segment2Value = acc.segment2Value + Number(balance.value);
            } else if (percentage <= 0.2) {
              acc.segment3 += 1;
              acc.segment3Value = acc.segment3Value + Number(balance.value);
            } else if (percentage <= 0.4) {
              acc.segment4 += 1;
              acc.segment4Value = acc.segment4Value + Number(balance.value);
            } else {
              acc.segment5 += 1;
              acc.segment5Value = acc.segment5Value + Number(balance.value);
            }
            return acc;
          },
          {
            segment1: 0,
            segment1Value: 0,
            segment2: 0,
            segment2Value: 0,
            segment3: 0,
            segment3Value: 0,
            segment4: 0,
            segment4Value: 0,
            segment5: 0,
            segment5Value: 0,
          }
        );
      expect(stats?.balancesCountSegment1).toBe(expectedPerSegment.segment1);
      expect(Number(stats?.totalValueSegment1)).toBeCloseTo(
        Number(expectedPerSegment.segment1Value),
        2
      );
      expect(stats?.balancesCountSegment2).toBe(expectedPerSegment.segment2);
      expect(Number(stats?.totalValueSegment2)).toBeCloseTo(
        Number(expectedPerSegment.segment2Value),
        2
      );
      expect(stats?.balancesCountSegment3).toBe(expectedPerSegment.segment3);
      expect(Number(stats?.totalValueSegment3)).toBeCloseTo(
        Number(expectedPerSegment.segment3Value),
        2
      );
      expect(stats?.balancesCountSegment4).toBe(expectedPerSegment.segment4);
      expect(Number(stats?.totalValueSegment4)).toBeCloseTo(
        Number(expectedPerSegment.segment4Value),
        2
      );
      expect(stats?.balancesCountSegment5).toBe(expectedPerSegment.segment5);
      expect(Number(stats?.totalValueSegment5)).toBeCloseTo(
        Number(expectedPerSegment.segment5Value),
        2
      );
    }
  });

  it("should track top 5 holders percentage correctly", async () => {
    // Get a token with at least 5 balances
    const tokenQuery = theGraphGraphql(
      `query {
        tokens(where: {totalSupply_gt: "0"}, first: 10) {
          id
          symbol
          totalSupply
          balances(orderBy: value, orderDirection: desc, first: 10, where: {value_gt: 0}) {
            account {
              id
            }
            value
          }
          distributionStats {
            percentageOwnedByTop5Holders
            topHolders(orderBy: rank, where: {balance_gt: 0}) {
              account {
                id
              }
              balance
              rank
            }
          }
        }
      }
    `
    );
    const tokenResponse = await theGraphClient.request(tokenQuery, {});

    for (const token of tokenResponse.tokens) {
      const top5Holders = token.balances
        .sort((a, b) => {
          return Number(b.value) - Number(a.value);
        })
        .slice(0, 5);
      const top5HoldersBalance = top5Holders.reduce((acc, balance) => {
        return acc + Number(balance.value);
      }, 0);
      const percentageOwnedByTop5Holders =
        (Number(top5HoldersBalance) / Number(token.totalSupply)) * 100;
      const stats = token.distributionStats;
      expect(Number(stats?.percentageOwnedByTop5Holders)).toBeCloseTo(
        percentageOwnedByTop5Holders,
        2
      );
      const topHolders = stats?.topHolders ?? [];
      expect(topHolders.length).toBeLessThanOrEqual(6); // Never track more than 6 holders
      expect(
        topHolders.map((holder) => ({
          account: holder.account.id,
          rank: holder.rank,
        }))
      ).toEqual(
        top5Holders.map((holder, index) => ({
          account: holder.account.id,
          rank: index + 1,
        }))
      );
    }
  });
});
