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
    expect(response.tokenCollateralStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenCollateralStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.tokenCollateralStats_collection.length > 0) {
      const firstStat = response.tokenCollateralStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.token).toBeDefined();
      expect(firstStat.expiryTimestamp).toBeDefined();
      expect(firstStat.collateral).toBeDefined();
      expect(firstStat.collateralAvailable).toBeDefined();
      expect(firstStat.collateralUsed).toBeDefined();
    }
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
    expect(response.tokenCollateralStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenCollateralStats_collection)).toBe(true);
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

    expect(response.tokenCollateralStatsDatas).toBeDefined();
    expect(Array.isArray(response.tokenCollateralStatsDatas)).toBe(true);

    // Find stats for tokens with collateral
    const eurDepositStats = response.tokenCollateralStatsDatas.find(
      (stat) => stat.token.symbol === "EURD"
    );
    const tetherStats = response.tokenCollateralStatsDatas.find(
      (stat) => stat.token.symbol === "USDT"
    );

    // Verify Euro Deposits collateral stats
    expect(eurDepositStats).toBeDefined();
    if (eurDepositStats) {
      expect(eurDepositStats.collateral).toBe("100000");
      expect(eurDepositStats.collateralExact).toBe("100000000000");
      expect(eurDepositStats.collateralUsed).toBe(
        eurDepositStats.token.totalSupply
      );
      expect(eurDepositStats.expiryTimestamp).toBeDefined();

      // Verify collateral utilization calculation
      const totalSupply = BigInt(eurDepositStats.token.totalSupplyExact);
      const collateral = BigInt(eurDepositStats.collateralExact);
      const expectedAvailable = collateral - totalSupply;

      expect(eurDepositStats.collateralUsedExact).toBe(
        eurDepositStats.token.totalSupplyExact
      );
      expect(BigInt(eurDepositStats.collateralAvailableExact)).toBe(
        expectedAvailable
      );
    }

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

    // Verify collateral utilization calculations
    for (const token of tokensResponse.tokens) {
      if (token.collateral?.collateralExact) {
        const stats = statsResponse.tokenCollateralStatsDatas.find(
          (s) => s.token.id === token.id
        );

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
