import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

// TypeScript interfaces for EventStats data structures
interface Account {
  id: string;
}

interface EventStat {
  timestamp: string;
  account: Account;
  eventName: string;
  eventsCount: number;
}

describe("EventStats", () => {
  it("should fetch event stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        eventStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          eventName
          eventsCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const eventStats = response.eventStats_collection;
    expect(eventStats && Array.isArray(eventStats)).toBe(true);

    // Verify that events are counted
    if (!eventStats.length) {
      return;
    }
    const firstStat = eventStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.account).toBeDefined();
    expect(firstStat.eventName).toBeDefined();
    expect(firstStat.eventsCount).toBeGreaterThan(0);
  });

  it("should fetch event stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        eventStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          eventName
          eventsCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const eventStats = response.eventStats_collection ?? [];
    expect(Array.isArray(eventStats)).toBe(true);
  });

  it("should filter event stats by event name", async () => {
    const query = theGraphGraphql(
      `query($where: EventStats_filter) {
        eventStats_collection(
          interval: hour
          where: $where
          orderBy: timestamp
        ) {
          timestamp
          account {
            id
          }
          eventName
          eventsCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        eventName: "Transfer",
      },
    });

    const eventStats = response.eventStats_collection ?? [];
    for (const stat of eventStats) {
      expect(stat.eventName).toBe("Transfer");
    }
  });

  it("should filter event stats by account", async () => {
    const query = theGraphGraphql(
      `query($accountId: String) {
        eventStats_collection(
          interval: hour
          where: { account: $accountId }
          orderBy: timestamp
        ) {
          timestamp
          account {
            id
          }
          eventName
          eventsCount
        }
      }
    `
    );

    // First get an account that has events
    const accountQuery = theGraphGraphql(
      `query {
        events(first: 1) {
          emitter {
            id
          }
        }
      }
    `
    );
    const accountResponse = await theGraphClient.request(accountQuery, {});
    const events = accountResponse.events ?? [];

    if (events.length > 0) {
      const accountId = events[0]!.emitter.id;
      const response = await theGraphClient.request(query, {
        accountId: accountId,
      });

      const eventStats = response.eventStats_collection ?? [];
      for (const stat of eventStats) {
        expect(stat.account.id).toBe(accountId);
      }
    }
  });

  it("should show cumulative event counts", async () => {
    const query = theGraphGraphql(
      `query {
        eventStats_collection(
          interval: hour
          orderBy: timestamp
          first: 50
        ) {
          timestamp
          account {
            id
          }
          eventName
          eventsCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const eventStats = response.eventStats_collection ?? [];

    // Group by account and eventName to check cumulative counts
    const groupedStats: { [key: string]: EventStat[] } = {};
    for (const stat of eventStats) {
      const key = `${stat.account.id}-${stat.eventName}`;
      if (!groupedStats[key]) {
        groupedStats[key] = [];
      }
      groupedStats[key].push(stat);
    }

    // Verify cumulative nature - counts should be non-decreasing
    Object.values(groupedStats).forEach((stats) => {
      if (stats.length > 1) {
        // Sort by timestamp (parse strings to numbers for proper sorting)
        stats.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

        for (let i = 1; i < stats.length; i++) {
          const current = stats[i]!;
          const previous = stats[i - 1]!;
          expect(current.eventsCount).toBeGreaterThanOrEqual(
            previous.eventsCount
          );
        }
      }
    });
  });

  it("should track different event types separately", async () => {
    const query = theGraphGraphql(
      `query {
        eventStats_collection(
          interval: day
          orderBy: eventName
        ) {
          eventName
          eventsCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const eventStats = response.eventStats_collection ?? [];

    // Get unique event names
    const eventNames = new Set(eventStats.map((stat) => stat.eventName));

    // Should have multiple different event types
    expect(eventNames.size).toBeGreaterThan(1);
  });
});
