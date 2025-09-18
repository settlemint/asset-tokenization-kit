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
    const accountStats = response.accountStats_collection ?? [];
    expect(Array.isArray(accountStats)).toBe(true);

    // Verify that stats have required fields
    if (!accountStats.length) {
      return;
    }
    const firstStat = accountStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.account).toBeDefined();
    expect(firstStat.totalValueInBaseCurrency).toBeDefined();
    expect(firstStat.balancesCount).toBeDefined();
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
    const accountStats = response.accountStats_collection ?? [];
    expect(Array.isArray(accountStats)).toBe(true);

    // Verify that stats have required fields
    if (!accountStats.length) {
      return;
    }
    const firstStat = accountStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.account).toBeDefined();
    expect(firstStat.totalValueInBaseCurrency).toBeDefined();
    expect(firstStat.balancesCount).toBeDefined();
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
    const accountStatsStates = response.accountStatsStates;
    expect(accountStatsStates && Array.isArray(accountStatsStates)).toBe(true);
  });

  it("should have correct total value calculation for accounts with tokens", async () => {
    // First get accounts with balances
    const accountsQuery = theGraphGraphql(
      `query {
        accounts(where: { balances_: { value_gt: "0" } }) {
          id
          isContract
          balances {
            value
            token {
              id
              name
              type
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
    const accounts = accountsResponse.accounts ?? [];
    expect(accounts.length).toBe(5);

    for (const account of accounts) {
      // Calculate expected total value
      const expectedTotalValue = account.balances.reduce((acc, balance) => {
        const balanceValue = Number(balance.value);
        const basePrice = getBasePrice(balance.token);
        const totalValue = basePrice * balanceValue;
        console.log(
          `${balance.token.name} ${balance.token.type} ${balanceValue} ${basePrice} ${totalValue}`
        );
        return acc + totalValue;
      }, 0);

      // Get the account stats state
      const statsQuery = theGraphGraphql(
        `query($accountId: ID!) {
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
