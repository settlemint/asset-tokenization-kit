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
            systemStats {
              id
              system {
                id
              }
              totalValueInBaseCurrency
              balancesCount
            }
            tokenFactoryStats {
              id
              system {
                id
              }
              tokenFactory {
                id
                name
              }
              tokenBalancesCount
              totalValueInBaseCurrency
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

  it("should fetch account system stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        accountSystemStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          system {
            id
          }
          totalValueInBaseCurrency
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountSystemStats = response.accountSystemStats_collection ?? [];
    expect(Array.isArray(accountSystemStats)).toBe(true);

    // Verify that stats have required fields
    if (!accountSystemStats.length) {
      return;
    }
    const firstStat = accountSystemStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.account).toBeDefined();
    expect(firstStat.system).toBeDefined();
    expect(firstStat.totalValueInBaseCurrency).toBeDefined();
    expect(firstStat.balancesCount).toBeDefined();
  });

  it("should fetch account system stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        accountSystemStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          system {
            id
          }
          totalValueInBaseCurrency
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountSystemStats = response.accountSystemStats_collection ?? [];
    expect(Array.isArray(accountSystemStats)).toBe(true);
  });

  it("should fetch account system stats state entity", async () => {
    const query = theGraphGraphql(
      `query {
        accountSystemStatsStates {
          id
          account {
            id
            balances {
              value
              token {
                symbol
                tokenFactory {
                  tokenFactoryRegistry {
                    system {
                      id
                    }
                  }
                }
              }
            }
          }
          system {
            id
          }
          totalValueInBaseCurrency
          balancesCount
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountSystemStatsStates = response.accountSystemStatsStates;
    expect(
      accountSystemStatsStates && Array.isArray(accountSystemStatsStates)
    ).toBe(true);

    // Verify relationships and data integrity
    if (accountSystemStatsStates?.length > 0) {
      const firstStat = accountSystemStatsStates[0];
      expect(firstStat?.account).toBeDefined();
      expect(firstStat?.system).toBeDefined();
      expect(firstStat?.totalValueInBaseCurrency).toBeDefined();
      expect(firstStat?.balancesCount).toBeDefined();
    }
  });

  it("should fetch account token factory stats aggregated by hour", async () => {
    const query = theGraphGraphql(
      `query {
        accountTokenFactoryStats_collection(
          interval: hour
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          system {
            id
          }
          tokenBalancesCount
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountTokenFactoryStats =
      response.accountTokenFactoryStats_collection ?? [];
    expect(Array.isArray(accountTokenFactoryStats)).toBe(true);

    // Verify that stats have required fields
    if (!accountTokenFactoryStats.length) {
      return;
    }
    const firstStat = accountTokenFactoryStats[0]!;
    expect(firstStat.timestamp).toBeDefined();
    expect(firstStat.account).toBeDefined();
    expect(firstStat.system).toBeDefined();
    expect(firstStat.tokenBalancesCount).toBeDefined();
    expect(firstStat.totalValueInBaseCurrency).toBeDefined();
  });

  it("should fetch account token factory stats aggregated by day", async () => {
    const query = theGraphGraphql(
      `query {
        accountTokenFactoryStats_collection(
          interval: day
          orderBy: timestamp
          first: 10
        ) {
          timestamp
          account {
            id
          }
          system {
            id
          }
          tokenBalancesCount
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountTokenFactoryStats =
      response.accountTokenFactoryStats_collection ?? [];
    expect(Array.isArray(accountTokenFactoryStats)).toBe(true);
  });

  it("should fetch account token factory stats state entity", async () => {
    const query = theGraphGraphql(
      `query {
        accountTokenFactoryStatsStates {
          id
          account {
            id
            balances {
              value
              token {
                symbol
                tokenFactory {
                  id
                  name
                  typeId
                }
              }
            }
          }
          system {
            id
          }
          tokenFactory {
            id
            name
            typeId
          }
          tokenBalancesCount
          totalValueInBaseCurrency
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const accountTokenFactoryStatsStates =
      response.accountTokenFactoryStatsStates;
    expect(
      accountTokenFactoryStatsStates &&
        Array.isArray(accountTokenFactoryStatsStates)
    ).toBe(true);

    // Verify relationships and data integrity
    if (accountTokenFactoryStatsStates?.length > 0) {
      const firstStat = accountTokenFactoryStatsStates[0];
      expect(firstStat?.account).toBeDefined();
      expect(firstStat?.system).toBeDefined();
      expect(firstStat?.tokenFactory).toBeDefined();
      expect(firstStat?.tokenBalancesCount).toBeDefined();
      expect(firstStat?.totalValueInBaseCurrency).toBeDefined();
    }
  });

  it("should correctly calculate system-scoped values for accounts", async () => {
    // Get accounts with balances and their system relationships
    const accountsQuery = theGraphGraphql(
      `query {
        accounts(where: { balances_: { value_gt: "0" } }) {
          id
          balances {
            value
            token {
              id
              symbol
              totalSupply
              basePriceClaim {
                values {
                  key
                  value
                }
              }
              tokenFactory {
                tokenFactoryRegistry {
                  system {
                    id
                  }
                }
              }
            }
          }
          systemStats {
            system {
              id
            }
            totalValueInBaseCurrency
            balancesCount
          }
        }
      }
    `
    );
    const accountsResponse = await theGraphClient.request(accountsQuery, {});
    const accounts = accountsResponse.accounts ?? [];

    for (const account of accounts) {
      if (account.systemStats?.length > 0) {
        // Group balances by system
        const balancesBySystem: Record<
          string,
          Array<(typeof account.balances)[0]>
        > = {};
        for (const balance of account.balances) {
          if (balance.token?.tokenFactory?.tokenFactoryRegistry?.system?.id) {
            const systemId =
              balance.token.tokenFactory.tokenFactoryRegistry.system.id;
            if (!balancesBySystem[systemId]) {
              balancesBySystem[systemId] = [];
            }
            balancesBySystem[systemId].push(balance);
          }
        }

        // Verify that system stats match the grouped balances
        for (const systemStat of account.systemStats) {
          const systemId = systemStat.system.id;
          const systemBalances = balancesBySystem[systemId] || [];
          expect(systemStat.balancesCount).toBe(systemBalances.length);
        }
      }
    }
  });

  it("should correctly calculate token factory-scoped values for accounts", async () => {
    // Get accounts with balances and their token factory relationships
    const accountsQuery = theGraphGraphql(
      `query {
        accounts(where: { balances_: { value_gt: "0" } }) {
          id
          balances {
            value
            token {
              id
              symbol
              totalSupply
              basePriceClaim {
                values {
                  key
                  value
                }
              }
              tokenFactory {
                id
                name
              }
            }
          }
          tokenFactoryStats {
            tokenFactory {
              id
              name
            }
            tokenBalancesCount
            totalValueInBaseCurrency
          }
        }
      }
    `
    );
    const accountsResponse = await theGraphClient.request(accountsQuery, {});
    const accounts = accountsResponse.accounts ?? [];

    for (const account of accounts) {
      if (account.tokenFactoryStats?.length > 0) {
        // Group balances by token factory
        const balancesByFactory: Record<
          string,
          Array<(typeof account.balances)[0]>
        > = {};
        for (const balance of account.balances) {
          if (balance.token?.tokenFactory?.id) {
            const factoryId = balance.token.tokenFactory.id;
            if (!balancesByFactory[factoryId]) {
              balancesByFactory[factoryId] = [];
            }
            balancesByFactory[factoryId].push(balance);
          }
        }

        // Verify that token factory stats match the grouped balances
        for (const factoryStat of account.tokenFactoryStats) {
          const factoryId = factoryStat.tokenFactory.id;
          const factoryBalances = balancesByFactory[factoryId] || [];
          expect(factoryStat.tokenBalancesCount).toBe(factoryBalances.length);
        }
      }
    }
  });
});
