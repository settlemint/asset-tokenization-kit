import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TokenCollateralStats", () => {
  it("should fetch token collateral stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        tokenCollateralStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
            name
          }
          expiryTimestamp
          collateral
          collateralExact
          collateralAvailable
          collateralAvailableExact
          collateralUsed
          collateralUsedExact
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const collateralStats = response.tokenCollateralStats_collection;
    expect(collateralStats && Array.isArray(collateralStats)).toBe(true);

    // Verify that stats have required fields
    if (!collateralStats.length) {
      return;
    }
    const firstStat = collateralStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.token).toBeDefined();
    expect(firstStat.expiryTimestamp).toBeDefined();
    expect(firstStat.collateral).toBeDefined();
    expect(firstStat.collateralAvailable).toBeDefined();
    expect(firstStat.collateralUsed).toBeDefined();
  });

  it("should fetch token collateral stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        tokenCollateralStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
          }
          expiryTimestamp
          collateral
          collateralAvailable
          collateralUsed
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const collateralStats = response.tokenCollateralStats_collection;
    expect(collateralStats && Array.isArray(collateralStats)).toBe(true);
  });

  it("should track collateral data correctly", async () => {
    const query = theGraphGraphql(
      `query {
        tokenCollateralStatsDatas(orderBy: id, orderDirection: desc, first: 100) {
          id
          token {
            symbol
            totalSupply
            totalSupplyExact
          }
          expiryTimestamp
          collateral
          collateralExact
          collateralAvailable
          collateralAvailableExact
          collateralUsed
          collateralUsedExact
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const collateralStatsData = response.tokenCollateralStatsDatas;

    expect(Array.isArray(collateralStatsData)).toBe(true);

    const tetherStats = collateralStatsData.find(
      (stat) => stat.token.symbol === "USDT"
    );

    // Verify Tether collateral stats
    expect(tetherStats).toBeDefined();
    if (tetherStats) {
      expect(tetherStats.collateral).toBe("1000");
      expect(tetherStats.collateralExact).toBe("1000000000");
      expect(tetherStats.collateralUsed).toBe(tetherStats.token.totalSupply);
      expect(tetherStats.expiryTimestamp).toBeDefined();

      // Verify collateral utilization
      expect(tetherStats.collateralUsedExact).toBe(
        tetherStats.token.totalSupplyExact
      );
    }
  });

  it("should track collateral utilization correctly", async () => {
    // Get tokens with collateral and their stats
    const query = theGraphGraphql(
      `query {
        tokens(where: { collateral_not: null }) {
          id
          symbol
          totalSupply
          totalSupplyExact
          collateral {
            collateral
            collateralExact
          }
        }
      }
    `
    );
    const tokensResponse = await theGraphClient.request(query, {});
    const tokens = tokensResponse.tokens ?? [];

    // Get latest collateral stats
    const statsQuery = theGraphGraphql(
      `query {
        tokenCollateralStatsDatas(orderBy: id, orderDirection: desc, first: 100) {
          token {
            id
          }
          collateral
          collateralExact
          collateralAvailable
          collateralAvailableExact
          collateralUsed
          collateralUsedExact
        }
      }
    `
    );
    const statsResponse = await theGraphClient.request(statsQuery, {});
    const statsData = statsResponse.tokenCollateralStatsDatas ?? [];

    // Verify collateral utilization calculations
    for (const token of tokens) {
      if (token.collateral?.collateralExact) {
        const stats = statsData.find((s) => s.token.id === token.id);

        if (stats) {
          // Verify collateral amount matches
          expect(stats.collateralExact).toBe(token.collateral.collateralExact);

          // Verify used collateral equals total supply
          expect(stats.collateralUsedExact).toBe(token.totalSupplyExact);

          // Verify available collateral calculation
          const expectedAvailable =
            BigInt(token.collateral.collateralExact) -
            BigInt(token.totalSupplyExact);
          expect(BigInt(stats.collateralAvailableExact)).toBe(
            expectedAvailable
          );
        }
      }
    }
  });
});
