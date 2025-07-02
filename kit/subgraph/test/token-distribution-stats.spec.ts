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
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.token).toBeDefined();
      expect(firstStat.percentageOwnedByTop5Holders).toBeDefined();
      expect(firstStat.balancesCountSegment1).toBeDefined();
      expect(firstStat.totalValueSegment1).toBeDefined();
      expect(firstStat.balancesCountSegment2).toBeDefined();
      expect(firstStat.totalValueSegment2).toBeDefined();
      expect(firstStat.balancesCountSegment3).toBeDefined();
      expect(firstStat.totalValueSegment3).toBeDefined();
      expect(firstStat.balancesCountSegment4).toBeDefined();
      expect(firstStat.totalValueSegment4).toBeDefined();
      expect(firstStat.balancesCountSegment5).toBeDefined();
      expect(firstStat.totalValueSegment5).toBeDefined();
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
        tokens(where: {totalSupply_gt: "0"}, first: 5) {
          id
          symbol
          totalSupply
          balances(orderBy: value, orderDirection: desc) {
            account {
              id
            }
            value
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

    // Test distribution stats for the first token
    const token = tokenResponse.tokens[0];
    const statsQuery = theGraphGraphql(
      `query($tokenId: Bytes!) {
        tokenDistributionStats_collection(
          where: {token: $tokenId}
          interval: hour
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
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
    const statsResponse = await theGraphClient.request(statsQuery, {
      tokenId: token.id,
    });

    if (statsResponse.tokenDistributionStats_collection.length === 0) {
      // Skip if no stats exist yet
      return;
    }

    const stats = statsResponse.tokenDistributionStats_collection[0];

    // Verify top 5 holders percentage is valid
    expect(Number(stats.percentageOwnedByTop5Holders)).toBeGreaterThanOrEqual(
      0
    );
    expect(Number(stats.percentageOwnedByTop5Holders)).toBeLessThanOrEqual(100);

    // Verify segment counts sum up correctly
    const totalBalances =
      stats.balancesCountSegment1 +
      stats.balancesCountSegment2 +
      stats.balancesCountSegment3 +
      stats.balancesCountSegment4 +
      stats.balancesCountSegment5;

    // Total balances in segments should match the actual balances count
    expect(totalBalances).toBe(token.balances.length);

    // Verify segment values sum up to total supply (approximately)
    const totalSegmentValue =
      Number(stats.totalValueSegment1) +
      Number(stats.totalValueSegment2) +
      Number(stats.totalValueSegment3) +
      Number(stats.totalValueSegment4) +
      Number(stats.totalValueSegment5);

    expect(totalSegmentValue).toBeCloseTo(Number(token.totalSupply), 2);
  });

  it("should track top 5 holders percentage correctly", async () => {
    // Get a token with at least 5 balances
    const tokenQuery = theGraphGraphql(
      `query {
        tokens(where: {totalSupply_gt: "0"}, first: 10) {
          id
          symbol
          totalSupply
          balances(orderBy: value, orderDirection: desc, first: 10) {
            value
          }
        }
      }
    `
    );
    const tokenResponse = await theGraphClient.request(tokenQuery, {});

    const tokenWithManyBalances = tokenResponse.tokens.find(
      (token) => token.balances.length >= 5
    );

    if (!tokenWithManyBalances) {
      // Skip test if no token with enough balances
      return;
    }

    // Calculate expected top 5 percentage
    const top5Sum = tokenWithManyBalances.balances
      .slice(0, 5)
      .reduce((sum, balance) => sum + Number(balance.value), 0);
    const expectedPercentage =
      (top5Sum / Number(tokenWithManyBalances.totalSupply)) * 100;

    const statsQuery = theGraphGraphql(
      `query($tokenId: Bytes!) {
        tokenDistributionStats_collection(
          where: {token: $tokenId}
          interval: hour
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
          percentageOwnedByTop5Holders
        }
      }
    `
    );
    const statsResponse = await theGraphClient.request(statsQuery, {
      tokenId: tokenWithManyBalances.id,
    });

    if (statsResponse.tokenDistributionStats_collection.length === 0) {
      // Skip if no stats exist yet
      return;
    }

    const actualPercentage = Number(
      statsResponse.tokenDistributionStats_collection[0]
        .percentageOwnedByTop5Holders
    );

    expect(actualPercentage).toBeCloseTo(expectedPercentage, 1);
  });

  it("should handle concentration segments appropriately", async () => {
    const query = theGraphGraphql(
      `query {
        tokenDistributionStats_collection(
          interval: hour
          orderBy: timestamp
          orderDirection: desc
          first: 20
        ) {
          token {
            id
            symbol
            totalSupply
          }
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

    if (response.tokenDistributionStats_collection.length === 0) {
      // Skip if no stats exist
      return;
    }

    // Check that all concentration segments are non-negative
    for (const stat of response.tokenDistributionStats_collection) {
      expect(stat.balancesCountSegment1).toBeGreaterThanOrEqual(0);
      expect(stat.balancesCountSegment2).toBeGreaterThanOrEqual(0);
      expect(stat.balancesCountSegment3).toBeGreaterThanOrEqual(0);
      expect(stat.balancesCountSegment4).toBeGreaterThanOrEqual(0);
      expect(stat.balancesCountSegment5).toBeGreaterThanOrEqual(0);

      expect(Number(stat.totalValueSegment1)).toBeGreaterThanOrEqual(0);
      expect(Number(stat.totalValueSegment2)).toBeGreaterThanOrEqual(0);
      expect(Number(stat.totalValueSegment3)).toBeGreaterThanOrEqual(0);
      expect(Number(stat.totalValueSegment4)).toBeGreaterThanOrEqual(0);
      expect(Number(stat.totalValueSegment5)).toBeGreaterThanOrEqual(0);

      // Total value in segments should not exceed total supply significantly
      const totalSegmentValue =
        Number(stat.totalValueSegment1) +
        Number(stat.totalValueSegment2) +
        Number(stat.totalValueSegment3) +
        Number(stat.totalValueSegment4) +
        Number(stat.totalValueSegment5);

      if (Number(stat.token.totalSupply) > 0) {
        expect(totalSegmentValue).toBeLessThanOrEqual(
          Number(stat.token.totalSupply) * 1.01 // Allow 1% tolerance for rounding
        );
      }
    }
  });

  it("should have processed events that affect distribution", async () => {
    // Check for events that should trigger distribution stats updates
    const eventsQuery = theGraphGraphql(
      `query {
        events(
          where: {
            eventName_in: ["MintCompleted", "BurnCompleted", "TransferCompleted"]
          }
          first: 10
        ) {
          eventName
          involved {
            id
          }
          emitter {
            id
          }
        }
      }
    `
    );
    const eventsResponse = await theGraphClient.request(eventsQuery, {});

    // Check that distribution-affecting events are present
    const eventNames = eventsResponse.events.map((event) => event.eventName);

    if (eventNames.length > 0) {
      // At least one of these events should be present if there's any activity
      const hasDistributionEvents =
        eventNames.includes("MintCompleted") ||
        eventNames.includes("BurnCompleted") ||
        eventNames.includes("TransferCompleted");

      expect(hasDistributionEvents).toBe(true);
    }
  });
});
