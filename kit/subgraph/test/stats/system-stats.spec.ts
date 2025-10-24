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
    const systemStats = response.systemStats_collection ?? [];
    expect(Array.isArray(systemStats)).toBe(true);

    // Verify that stats have required fields
    if (!systemStats.length) {
      return;
    }
    const firstStat = systemStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.system).toBeDefined();
    expect(firstStat.totalValueInBaseCurrency).toBeDefined();
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
    const systemStats = response.systemStats_collection;
    expect(systemStats && Array.isArray(systemStats)).toBe(true);
  });

  it("should have a persistent system stats state", async () => {
    const query = theGraphGraphql(
      `query {
        systemStatsStates(first: 1) {
          id
          system {
            id
          }
          tokensCreatedCount
          tokensLaunchedCount
          transferEventsCount
          forcedTransferEventsCount
          mintEventsCount
          burnEventsCount
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const states = response.systemStatsStates ?? [];

    if (!states.length) {
      return;
    }
    const state = states[0]!;

    expect(state.id).toBeDefined();
    expect(state.system).toBeDefined();
    expect(state.totalValueInBaseCurrency).toBeDefined();
    expect(state.tokensCreatedCount).toBe(6);
    expect(state.tokensLaunchedCount).toBe(6);
    expect(state.transferEventsCount).toBe(30);
    expect(state.forcedTransferEventsCount).toBe(0);
    expect(state.mintEventsCount).toBe(12);
    expect(state.burnEventsCount).toBe(8);
  });

  it("should calculate total value based on token supply and base price", async () => {
    // Get tokens with base price claims
    const tokenQuery = theGraphGraphql(
      `query {
        tokens {
          id
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
    );
    const tokenResponse = await theGraphClient.request(tokenQuery, {});
    const tokens = tokenResponse.tokens ?? [];
    const expectedTotalValue = tokens.reduce((acc, token) => {
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
    const stat = statsResponse.systemStatsStates?.[0];
    expect(Number(stat?.totalValueInBaseCurrency)).toBeCloseTo(
      expectedTotalValue,
      6
    );
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
    const events = eventsResponse.events ?? [];

    // Check that all expected event types are present
    const eventNames = events.map((event) => event.eventName);

    expect(eventNames).toContain("BurnCompleted");
    expect(eventNames).toContain("MintCompleted");
    expect(eventNames).toContain("ClaimAdded");
    expect(eventNames).toContain("ClaimRemoved");
    expect(eventNames).toContain("ClaimChanged");

    // Verify we have the expected number of events
    expect(events.length).toBeGreaterThan(0);
  });
});
