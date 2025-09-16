import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";
import { getBasePrice } from "../utils/token-stats-test-utils";

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
        accountStatsStates {
          account {
            balances {
              value
              token {
                symbol
              }
            }
          }
          totalValueInBaseCurrency
          balancesCount
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
        accounts(where: { balances_: { value_gt: "0" } }) {
          id
          isContract
          identity { id }
          balances {
            value
            token {
              id
              symbol
              decimals
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
        }
      }
    `
    );
    const accountsResponse = await theGraphClient.request(accountsQuery, {});
    // Holders
    // - Owner
    // - Investor A New
    // - Investor B
    // - Bond contract (denomination deposit asset)
    // - Fixed yield schedule contract (denomination deposit asset)
    expect(accountsResponse.accounts.length).toBe(5);

    for (const account of accountsResponse.accounts) {
      // Calculate expected total value
      const expectedTotalValue = account.balances.reduce((acc, balance) => {
        const balanceValue = Number(balance.value);
        return acc + getBasePrice(balance.token) * balanceValue;
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
        expect(
          Number(statsResponse.accountStatsState.totalValueInBaseCurrency)
        ).toBeCloseTo(expectedTotalValue, 6);
        expect(statsResponse.accountStatsState.balancesCount).toBe(
          account.balances.length
        );
      }
    }
  });
});
