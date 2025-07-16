import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

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
    expect(response.tokenTypeStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenTypeStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.tokenTypeStats_collection.length > 0) {
      const firstStat = response.tokenTypeStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.type).toBeDefined();
      expect(firstStat.count).toBeDefined();
      expect(firstStat.percentageOfTotalSupply).toBeDefined();
      expect(typeof firstStat.count).toBe("number");
      expect(typeof firstStat.percentageOfTotalSupply).toBe("string");
    }
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
    expect(response.tokenTypeStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenTypeStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.tokenTypeStats_collection.length > 0) {
      const firstStat = response.tokenTypeStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.type).toBeDefined();
      expect(firstStat.count).toBeDefined();
      expect(firstStat.percentageOfTotalSupply).toBeDefined();
      expect(typeof firstStat.count).toBe("number");
      expect(typeof firstStat.percentageOfTotalSupply).toBe("string");
    }
  });

  it("should fetch token type stats data (timeseries)", async () => {
    const query = theGraphGraphql(
      `query {
        tokenTypeStatsData_collection(
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
    expect(response.tokenTypeStatsData_collection).toBeDefined();
    expect(Array.isArray(response.tokenTypeStatsData_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.tokenTypeStatsData_collection.length > 0) {
      const firstStat = response.tokenTypeStatsData_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.type).toBeDefined();
      expect(firstStat.count).toBeDefined();
      expect(firstStat.percentageOfTotalSupply).toBeDefined();
      expect(typeof firstStat.count).toBe("number");
      expect(typeof firstStat.percentageOfTotalSupply).toBe("string");
    }
  });

  it("should fetch token type stats state", async () => {
    const query = theGraphGraphql(
      `query {
        tokenTypeStatsStates(
          orderBy: type
          first: 10
        ) {
          id
          type
          count
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenTypeStatsStates).toBeDefined();
    expect(Array.isArray(response.tokenTypeStatsStates)).toBe(true);

    // Verify that state entities have required fields
    if (response.tokenTypeStatsStates.length > 0) {
      const firstState = response.tokenTypeStatsStates[0];
      expect(firstState.id).toBeDefined();
      expect(firstState.type).toBeDefined();
      expect(firstState.count).toBeDefined();
      expect(firstState.totalValueInBaseCurrency).toBeDefined();
      expect(typeof firstState.count).toBe("number");
      expect(typeof firstState.totalValueInBaseCurrency).toBe("string");
    }
  });

  it("should filter token type stats by specific type", async () => {
    const query = theGraphGraphql(
      `query($type: String!) {
        tokenTypeStats_collection(
          interval: hour
          where: { type: $type }
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
    const response = await theGraphClient.request(query, {
      type: "bond",
    });
    expect(response.tokenTypeStats_collection).toBeDefined();
    expect(Array.isArray(response.tokenTypeStats_collection)).toBe(true);

    // Verify all results have the correct type
    response.tokenTypeStats_collection.forEach((stat: any) => {
      expect(stat.type).toBe("bond");
    });
  });

  it("should validate percentage calculation constraints", async () => {
    const query = theGraphGraphql(
      `query {
        tokenTypeStats_collection(
          interval: hour
          orderBy: timestamp
          first: 100
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

    if (response.tokenTypeStats_collection.length > 0) {
      // Sum all percentages at the same timestamp
      const timestampGroups = response.tokenTypeStats_collection.reduce(
        (acc: any, stat: any) => {
          const timestamp = stat.timestamp;
          if (!acc[timestamp]) {
            acc[timestamp] = [];
          }
          acc[timestamp].push(stat);
          return acc;
        },
        {}
      );

      // For each timestamp, verify percentages are valid
      Object.values(timestampGroups).forEach((stats: any) => {
        stats.forEach((stat: any) => {
          const percentage = parseFloat(stat.percentageOfTotalSupply);
          // Percentage should be between 0 and 100
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
        });
      });
    }
  });
});
