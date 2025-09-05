import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TokenStats", () => {
  it("should fetch token stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        tokenStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
          }
          type
          balancesCount
          totalSupply
          totalSupplyExact
          totalMinted
          totalMintedExact
          totalBurned
          totalBurnedExact
          totalTransferred
          totalTransferredExact
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.tokenStats_collection.length > 0) {
      const firstStat = response.tokenStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.token).toBeDefined();
      expect(firstStat.type).toBeDefined();
      expect(firstStat.balancesCount).toBeDefined();
      expect(firstStat.totalSupply).toBeDefined();
      expect(firstStat.totalMinted).toBeDefined();
      expect(firstStat.totalBurned).toBeDefined();
      expect(firstStat.totalTransferred).toBeDefined();
    }
  });

  it("should fetch token stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        tokenStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          token {
            id
            symbol
          }
          type
          balancesCount
          totalSupply
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenStats_collection)).toBe(true);
  });

  it("should track balance count correctly", async () => {
    const query = theGraphGraphql(
      `query {
        tokenStatsStates(orderBy: token__symbol) {
          token {
            symbol
          }
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});

    expect(response.tokenStatsStates).toBeDefined();
    expect(Array.isArray(response.tokenStatsStates)).toBe(true);

    expect(response.tokenStatsStates.length).toBe(6);

    // Verify that all expected tokens are present with correct balance counts
    const tokenStats = response.tokenStatsStates;
    const expectedTokens = [
      { symbol: "AAPL", balancesCount: 3 },
      { symbol: "BB", balancesCount: 3 },
      { symbol: "EURB", balancesCount: 4 },
      { symbol: "EURD", balancesCount: 6 },
      { symbol: "USDT", balancesCount: 3 },
    ];

    for (const expected of expectedTokens) {
      const found = tokenStats.find(
        (stat) => stat.token.symbol === expected.symbol
      );
      expect(found).toBeDefined();
      expect(found?.balancesCount).toBe(expected.balancesCount);
    }
  });

  it("should have correct total supply in stats", async () => {
    // Get tokens with their current supply
    const tokensQuery = theGraphGraphql(
      `query {
        tokens(where: { totalSupply_gt: "0" }) {
          id
          symbol
          totalSupply
          totalSupplyExact
        }
      }
    `
    );
    const tokensResponse = await theGraphClient.request(tokensQuery, {});

    // Get token stats
    const statsQuery = theGraphGraphql(
      `query {
        tokenStatsDatas(orderBy: id, orderDirection: desc, first: 500) {
          id
          token {
            id
            symbol
          }
          totalSupply
          totalSupplyExact
        }
      }
    `
    );
    const statsResponse = await theGraphClient.request(statsQuery, {});

    // Verify total supply matches
    for (const token of tokensResponse.tokens) {
      const stats = statsResponse.tokenStatsDatas.find(
        (s) => s.token.id === token.id
      );
      expect(stats).toBeDefined();
      if (stats) {
        expect(stats.totalSupply).toBe(token.totalSupply);
        expect(stats.totalSupplyExact).toBe(token.totalSupplyExact);
      }
    }
  });

  it("should track stats correctly for mint, burn and transfer events", async () => {
    const query = theGraphGraphql(
      `query {
          tokenStats_collection(
          interval: hour
          orderBy: timestamp
          where: { token_: { symbol: "EURD" } }
        ) {
          token {
            symbol
          }
          type
          balancesCount
          totalSupply
          totalSupplyExact
          totalMinted
          totalMintedExact
          totalBurned
          totalBurnedExact
          totalTransferred
          totalTransferredExact
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenStats_collection)).toBe(true);

    expect(response.tokenStats_collection.length).toBe(5);
    expect(response.tokenStats_collection).toEqual([
      {
        token: { symbol: "EURD" },
        type: "deposit",
        balancesCount: 4,
        totalSupply: "10750",
        totalSupplyExact: "10750000000",
        totalMinted: "11000",
        totalMintedExact: "11000000000",
        totalBurned: "250",
        totalBurnedExact: "250000000",
        totalTransferred: "10750",
        totalTransferredExact: "10750000000",
      },
      {
        token: { symbol: "EURD" },
        type: "deposit",
        balancesCount: 5,
        totalSupply: "10750",
        totalSupplyExact: "10750000000",
        totalMinted: "0",
        totalMintedExact: "0",
        totalBurned: "0",
        totalBurnedExact: "0",
        totalTransferred: "0.000067",
        totalTransferredExact: "67",
      },
      {
        token: { symbol: "EURD" },
        type: "deposit",
        balancesCount: 5,
        totalSupply: "10750",
        totalSupplyExact: "10750000000",
        totalMinted: "0",
        totalMintedExact: "0",
        totalBurned: "0",
        totalBurnedExact: "0",
        totalTransferred: "0.000061",
        totalTransferredExact: "61",
      },
      {
        token: { symbol: "EURD" },
        type: "deposit",
        balancesCount: 6,
        totalSupply: "10900",
        totalSupplyExact: "10900000000",
        totalMinted: "150",
        totalMintedExact: "150000000",
        totalBurned: "0",
        totalBurnedExact: "0",
        totalTransferred: "5.000055",
        totalTransferredExact: "5000055",
      },
      {
        token: { symbol: "EURD" },
        type: "deposit",
        balancesCount: 6,
        totalSupply: "10900",
        totalSupplyExact: "10900000000",
        totalMinted: "0",
        totalMintedExact: "0",
        totalBurned: "0",
        totalBurnedExact: "0",
        totalTransferred: "0.001353",
        totalTransferredExact: "1353",
      },
    ]);
  });
});
