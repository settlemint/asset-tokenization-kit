import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("TokenBalances", () => {
  it("should fetch all token balances", async () => {
    const query = theGraphGraphql(
      `query {
        tokenBalances {
          id
          value
          valueExact
          lastUpdatedAt
          token {
            id
            name
            symbol
            decimals
          }
          account {
            id
            isContract
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenBalances).toBeDefined();
    expect(Array.isArray(response.tokenBalances)).toBe(true);
    expect(response.tokenBalances.length).toBe(19);

    // Group balances by account
    const balancesByAccount = response.tokenBalances.reduce(
      (acc, balance) => {
        const accountId = balance.account.id;
        if (!acc[accountId]) {
          acc[accountId] = [];
        }
        acc[accountId].push(balance);
        return acc;
      },
      {} as Record<string, typeof response.tokenBalances>
    );

    // Holders
    // - Owner
    // - Investor A New
    // - Investor B
    // - Frozen investor
    // - Bond contract (denomination deposit asset)
    // - Fixed yield schedule contract (denomination deposit asset)
    expect(Object.keys(balancesByAccount).length).toBe(6);
  });

  it("there should be no balances with a zero value unless the balance is frozen", async () => {
    const query = theGraphGraphql(
      `query {
        tokenBalances(where: { value: "0", isFrozen: false }) {
          id
          value
          valueExact
          lastUpdatedAt
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenBalances.length).toBe(0);
  });

  it("tracks balances for frozen accounts", async () => {
    const query = theGraphGraphql(
      `query {
        tokenBalances(where: { isFrozen: true }) {
          id
          isFrozen
          value
          valueExact
          account {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokenBalances.length).toBe(5);
    // Should be all from the same account
    expect(
      response.tokenBalances.every(
        (balance) =>
          balance.account.id === response.tokenBalances[0]?.account.id
      )
    ).toBe(true);
  });
});
