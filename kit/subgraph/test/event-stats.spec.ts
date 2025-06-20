import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

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

interface EventStatsResponse {
  eventStats_collection: EventStat[];
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
    expect(response.eventStats_collection).toBeDefined();
    expect(Array.isArray(response.eventStats_collection)).toBe(true);
    
    // Verify that events are counted
    if (response.eventStats_collection.length > 0) {
      const firstStat = response.eventStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.account).toBeDefined();
      expect(firstStat.eventName).toBeDefined();
      expect(firstStat.eventsCount).toBeGreaterThan(0);
    }
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
    expect(response.eventStats_collection).toBeDefined();
    expect(Array.isArray(response.eventStats_collection)).toBe(true);
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
    
    expect(response.eventStats_collection).toBeDefined();
    if (response.eventStats_collection.length > 0) {
      response.eventStats_collection.forEach((stat: EventStat) => {
        expect(stat.eventName).toBe("Transfer");
      });
    }
  });

  it("should filter event stats by account", async () => {
    const query = theGraphGraphql(
      `query($accountId: Bytes!) {
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
    
    if (accountResponse.events.length > 0) {
      const accountId = accountResponse.events[0].emitter.id;
      const response = await theGraphClient.request(query, {
        accountId: accountId,
      });
      
      expect(response.eventStats_collection).toBeDefined();
      if (response.eventStats_collection.length > 0) {
        response.eventStats_collection.forEach((stat: EventStat) => {
          expect(stat.account.id).toBe(accountId);
        });
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
    
    // Group by account and eventName to check cumulative counts
    const groupedStats: { [key: string]: EventStat[] } = {};
    response.eventStats_collection.forEach((stat: EventStat) => {
      const key = `${stat.account.id}-${stat.eventName}`;
      if (!groupedStats[key]) {
        groupedStats[key] = [];
      }
      groupedStats[key].push(stat);
    });
    
    // Verify cumulative nature - counts should be non-decreasing
    Object.values(groupedStats).forEach((stats) => {
      if (stats.length > 1) {
        // Sort by timestamp
        stats.sort((a, b) => a.timestamp - b.timestamp);
        
        for (let i = 1; i < stats.length; i++) {
          expect(stats[i].eventsCount).toBeGreaterThanOrEqual(
            stats[i - 1].eventsCount
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
    
    // Get unique event names
    const eventNames = new Set(
      response.eventStats_collection.map((stat: EventStat) => stat.eventName)
    );
    
    // Should have multiple different event types
    expect(eventNames.size).toBeGreaterThan(1);
  });
});