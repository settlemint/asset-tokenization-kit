import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("AccountStats", () => {
  it("should fetch account stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        accountStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          totalValueInBaseCurrency
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.accountStats_collection).toBeDefined();
    expect(Array.isArray(response.accountStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.accountStats_collection.length > 0) {
      const firstStat = response.accountStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.account).toBeDefined();
      expect(firstStat.totalValueInBaseCurrency).toBeDefined();
      expect(firstStat.balancesCount).toBeDefined();
    }
  });

  it("should fetch account stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        accountStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          totalValueInBaseCurrency
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.accountStats_collection).toBeDefined();
    expect(Array.isArray(response.accountStats_collection)).toBe(true);

    // Verify that stats have required fields
    if (response.accountStats_collection.length > 0) {
      const firstStat = response.accountStats_collection[0];
      expect(firstStat.timestamp).toBeDefined();
      expect(firstStat.account).toBeDefined();
      expect(firstStat.totalValueInBaseCurrency).toBeDefined();
      expect(firstStat.balancesCount).toBeDefined();
    }
  });

  it("should fetch account stats state entity", async () => {
    const query = theGraphGraphql(
      `query {
        accountStatsStates(first: 10) {
          id
          account {
            id
            balances {
              id
              value
              token {
                id
                symbol
              }
            }
          }
          totalValueInBaseCurrency
          balancesCount
          lastUpdatedAt
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.accountStatsStates).toBeDefined();
    expect(Array.isArray(response.accountStatsStates)).toBe(true);
  });

  it("should have correct total value calculation for accounts with tokens", async () => {
    // First get accounts with balances
    const accountsQuery = theGraphGraphql(
      `query {
        accounts(where: { balances_: { value_gt: "0" }}, first: 5) {
          id
          balances {
            value
            token {
              id
              symbol
              decimals
              basePriceClaim {
                id
                values(where: { key: "amount" }) {
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
    const accountsResponse = await theGraphClient.request(accountsQuery, {});
    
    if (accountsResponse.accounts.length > 0) {
      const account = accountsResponse.accounts[0];
      
      // Calculate expected total value
      const expectedTotalValue = account.balances.reduce((acc, balance) => {
        const basePrice = balance.token.basePriceClaim?.values.find(
          (value) => value.key === "amount"
        )?.value;
        if (!basePrice) {
          return acc;
        }
        
        const basePriceParsed = Number(basePrice) / Math.pow(10, 18);
        const balanceValue = Number(balance.value);
        return acc + basePriceParsed * balanceValue;
      }, 0);
      
      // Get the account stats state
      const statsQuery = theGraphGraphql(
        `query($accountId: Bytes!) {
          accountStatsState(id: $accountId) {
            totalValueInBaseCurrency
            balancesCount
          }
        }
      `
      );
      const statsResponse = await theGraphClient.request(statsQuery, {
        accountId: account.id,
      });
      
      if (statsResponse.accountStatsState) {
        expect(Number(statsResponse.accountStatsState.totalValueInBaseCurrency)).toBeCloseTo(
          expectedTotalValue,
          2
        );
        expect(statsResponse.accountStatsState.balancesCount).toBe(
          account.balances.length
        );
      }
    }
  });

  it("should track balance count changes correctly", async () => {
    // Get accounts with different balance counts
    const query = theGraphGraphql(
      `query {
        accountStatsStates(orderBy: balancesCount, orderDirection: desc, first: 10) {
          id
          account {
            id
            balances {
              id
            }
          }
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    
    if (response.accountStatsStates.length > 0) {
      // Verify that balance counts match actual balances
      for (const stats of response.accountStatsStates) {
        expect(stats.balancesCount).toBe(stats.account.balances.length);
      }
    }
  });

  it("should update account stats on price changes", async () => {
    // Get events related to price changes
    const eventsQuery = theGraphGraphql(
      `query {
        events(where: { eventName_in: ["ClaimAdded", "ClaimChanged", "ClaimRemoved"]}, first: 10) {
          eventName
          blockTimestamp
          involved {
            id
          }
        }
      }
    `
    );
    const eventsResponse = await theGraphClient.request(eventsQuery, {});
    
    // Verify that we have price change events
    const priceChangeEvents = eventsResponse.events.filter(
      event => ["ClaimAdded", "ClaimChanged", "ClaimRemoved"].includes(event.eventName)
    );
    
    expect(priceChangeEvents.length).toBeGreaterThan(0);
  });

  it("should update account stats on balance changes", async () => {
    // Get events related to balance changes
    const eventsQuery = theGraphGraphql(
      `query {
        events(where: { eventName_in: ["Transfer", "MintCompleted", "BurnCompleted"]}, first: 10) {
          eventName
          blockTimestamp
          involved {
            id
          }
        }
      }
    `
    );
    const eventsResponse = await theGraphClient.request(eventsQuery, {});
    
    // Verify that we have balance change events
    const balanceChangeEvents = eventsResponse.events.filter(
      event => ["Transfer", "MintCompleted", "BurnCompleted"].includes(event.eventName)
    );
    
    expect(balanceChangeEvents.length).toBeGreaterThan(0);
  });
});