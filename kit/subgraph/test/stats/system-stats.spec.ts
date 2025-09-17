import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";
import { getTotalValueInBaseCurrency } from "../utils/token-stats-test-utils";

describe("SystemStats", () => {
  it("should fetch system stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        systemStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          system {
            id
          }
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.systemStats_collection).toBeDefined();
    expect(Array.isArray(response.systemStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.systemStats_collection.length > 0) {
      const firstStat = response.systemStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.system).toBeDefined();
      expect(firstStat.totalValueInBaseCurrency).toBeDefined();
    }
  });

  it("should fetch system stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        systemStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          system {
            id
          }
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.systemStats_collection).toBeDefined();
    expect(Array.isArray(response.systemStats_collection)).toBe(true);
  });

  it("should have a persistent system stats state", async () => {
    const query = theGraphGraphql(
      `query {
        systemStatsStates(first: 1) {
          id
          system {
            id
          }
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});

    if (response.systemStatsStates.length > 0) {
      const state = response.systemStatsStates[0];
      expect(state.id).toBeDefined();
      expect(state.system).toBeDefined();
      expect(state.totalValueInBaseCurrency).toBeDefined();
    }
  });

  it("should calculate total value based on token supply and base price", async () => {
    // Get tokens with base price claims
    const tokenQuery = theGraphGraphql(
      `query {
        tokens {
          id
          totalSupply
          basePriceClaim {
            id
            values {
              key
              value
            }
          }
          bond {
            faceValue
            denominationAsset {
              basePriceClaim {
                values {
                  key
                  value
                }
              }
            }
          }
        }
      }
    `
    );
    const tokenResponse = await theGraphClient.request(tokenQuery, {});
    const expectedTotalValue = tokenResponse.tokens.reduce((acc, token) => {
      return acc + getTotalValueInBaseCurrency(token);
    }, 0);

    const statsQuery = theGraphGraphql(
      `query {
          systemStatsStates(first: 1) {
            totalValueInBaseCurrency
          }
        }
      `
    );
    const statsResponse = await theGraphClient.request(statsQuery, {});
    expect(
      Number(statsResponse?.systemStatsStates[0]?.totalValueInBaseCurrency)
    ).toBeCloseTo(expectedTotalValue, 6);
  });

  it("should have processed all events leading to a price change", async () => {
    // Get tokens with base price claims
    const eventsQuery = theGraphGraphql(
      `query {
       events(where: {eventName_in: ["ClaimAdded", "ClaimChanged", "ClaimRemoved", "MintCompleted", "BurnCompleted"]}) {
          eventName
          involved {
            id
          }
        }
      }
    `
    );
    const eventsResponse = await theGraphClient.request(eventsQuery, {});

    // Check that all expected event types are present
    const eventNames = eventsResponse.events.map((event) => event.eventName);

    expect(eventNames).toContain("BurnCompleted");
    expect(eventNames).toContain("MintCompleted");
    expect(eventNames).toContain("ClaimAdded");
    expect(eventNames).toContain("ClaimRemoved");
    expect(eventNames).toContain("ClaimChanged");

    // Verify we have the expected number of events
    expect(eventsResponse.events.length).toBeGreaterThan(0);
  });
});
