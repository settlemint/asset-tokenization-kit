import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";
import { getTotalValueInBaseCurrency } from "../utils/token-stats-test-utils";

describe("TokenTypeStats", () => {
  it("should fetch token type stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        tokenTypeStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          type
          count
          percentageOfTotalSupply
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const tokenTypeStatsCollection = response.tokenTypeStats_collection ?? [];
    expect(Array.isArray(tokenTypeStatsCollection)).toBe(true);

    // Verify that stats have required fields
    if (!tokenTypeStatsCollection.length) {
      return;
    }
    const firstStat = tokenTypeStatsCollection[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.type).toBeDefined();
    expect(firstStat.count).toBeDefined();
    expect(firstStat.percentageOfTotalSupply).toBeDefined();
    expect(typeof firstStat.count).toBe("number");
    expect(typeof firstStat.percentageOfTotalSupply).toBe("string");
  });

  it("should fetch token type stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        tokenTypeStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          type
          count
          percentageOfTotalSupply
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const tokenTypeStatsCollection = response.tokenTypeStats_collection;
    expect(Array.isArray(tokenTypeStatsCollection)).toBe(true);

    // Verify that stats have required fields
    if (!tokenTypeStatsCollection.length) {
      return;
    }
    const firstStat = tokenTypeStatsCollection[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.type).toBeDefined();
    expect(firstStat.count).toBeDefined();
    expect(firstStat.percentageOfTotalSupply).toBeDefined();
    expect(typeof firstStat.count).toBe("number");
    expect(typeof firstStat.percentageOfTotalSupply).toBe("string");
  });

  it("should track token type stats correctly", async () => {
    const systemStatQuery = theGraphGraphql(
      `query {
          systemStatsStates {
            id
            totalValueInBaseCurrency
          }
        }
      `
    );
    const systemStatsResponse = await theGraphClient.request(
      systemStatQuery,
      {}
    );
    const systemStatsStates = systemStatsResponse?.systemStatsStates;
    expect(Array.isArray(systemStatsStates)).toBe(true);
    expect(systemStatsStates.length).toEqual(1);

    const systemStat = systemStatsStates[0];
    if (!systemStat) {
      throw new Error("Expected system stats state for token type stats tests");
    }
    const systemValueInBaseCurrency = systemStat.totalValueInBaseCurrency;
    const tokenTypeStatsQuery = theGraphGraphql(
      `query ($system: Bytes!) {
          tokenTypeStatsStates(
            where: { system_: { id: $system } }
          ) {
            id
            type
            system {
              id
            }
            totalValueInBaseCurrency
            count
            percentageOfTotalSupply
          }
        }
      `
    );
    const tokenTypeStatsResponse = await theGraphClient.request(
      tokenTypeStatsQuery,
      {
        system: systemStat.id,
      }
    );
    const tokenTypeStatsStates = tokenTypeStatsResponse?.tokenTypeStatsStates;
    expect(Array.isArray(tokenTypeStatsStates)).toBe(true);
    expect(tokenTypeStatsStates.length).toEqual(5);

    const totalValueInBaseCurrency = tokenTypeStatsStates.reduce(
      (acc, tokenTypeStat) => {
        return acc + Number(tokenTypeStat.totalValueInBaseCurrency);
      },
      0
    );
    expect(totalValueInBaseCurrency).toBeCloseTo(
      Number(systemValueInBaseCurrency),
      6
    );

    for (const tokenTypeStat of tokenTypeStatsStates) {
      expect(tokenTypeStat.system.id).toBe(systemStat.id);

      const tokenResponse = await theGraphClient.request(
        theGraphGraphql(
          `query($type: String!) {
            tokens(where: { type: $type }) {
              id
              type
              totalSupply
              basePrice
              bond {
                faceValue
                denominationAsset {
                  basePrice
                }
              }
            }
          }
        `
        ),
        { type: tokenTypeStat.type }
      );
      const tokens = tokenResponse.tokens;
      expect(tokens.length).toEqual(tokenTypeStat.count);

      const expectedTotalValue = tokens.reduce((acc, token) => {
        return acc + getTotalValueInBaseCurrency(token);
      }, 0);
      expect(Number(tokenTypeStat.totalValueInBaseCurrency)).toBeCloseTo(
        expectedTotalValue,
        6
      );

      const expectedPercentageOfTotalSupply =
        (Number(tokenTypeStat.totalValueInBaseCurrency) /
          Number(systemValueInBaseCurrency)) *
        100;
      expect(Number(tokenTypeStat.percentageOfTotalSupply)).toBeCloseTo(
        expectedPercentageOfTotalSupply,
        6
      );
    }
  });
});
