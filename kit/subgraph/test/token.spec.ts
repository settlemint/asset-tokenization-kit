import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Tokens", () => {
  it("should fetch a list of all tokens", async () => {
    const query = theGraphGraphql(
      `query {
        tokens(orderBy: name) {
          name
          type
          totalSupply
          totalSupplyExact
          extensions
          implementsERC3643
          implementsSMART
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.tokens.length).toBe(6);
    const tokens = response.tokens.map(
      ({ totalSupply, totalSupplyExact, ...token }) => ({
        ...token,
        totalSupply: totalSupply ? Number(totalSupply) : undefined,
        totalSupplyExact: totalSupplyExact
          ? Number(totalSupplyExact)
          : undefined,
      })
    );
    expect(tokens).toEqual([
      {
        name: "Apple",
        type: "equity",
        totalSupply: 75,
        totalSupplyExact: 75000000000000000000,
        extensions: ["ACCESS_MANAGED", "BURNABLE", "CUSTODIAN", "PAUSABLE"],
        implementsERC3643: false,
        implementsSMART: true,
      },
      {
        name: "Bens Bugs",
        type: "fund",
        // The total supply includes the management fee which is calculated based on time, we cannot do an exact match here
        totalSupply: expect.closeTo(8.0016658, 7),
        totalSupplyExact: expect.closeTo(800166580, 1),
        extensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "CUSTODIAN",
          "FUND",
          "PAUSABLE",
        ],
        implementsERC3643: false,
        implementsSMART: true,
      },
      {
        name: "Euro Bonds",
        type: "bond",
        totalSupply: 93,
        totalSupplyExact: 93000000000000000000,
        extensions: [
          "ACCESS_MANAGED",
          "BOND",
          "BURNABLE",
          "CAPPED",
          "CUSTODIAN",
          "HISTORICAL_BALANCES",
          "PAUSABLE",
          "REDEEMABLE",
          "YIELD",
        ],
        implementsERC3643: false,
        implementsSMART: true,
      },
      {
        name: "Euro Deposits",
        type: "deposit",
        totalSupply: 10900,
        totalSupplyExact: 10900000000,
        extensions: ["ACCESS_MANAGED", "BURNABLE", "CUSTODIAN", "PAUSABLE"],
        implementsERC3643: false,
        implementsSMART: true,
      },
      {
        name: "Paused Stablecoin",
        type: "stablecoin",
        totalSupply: 0,
        totalSupplyExact: 0,
        extensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "COLLATERAL",
          "CUSTODIAN",
          "PAUSABLE",
          "REDEEMABLE",
        ],
        implementsERC3643: false,
        implementsSMART: true,
      },
      {
        name: "Tether",
        type: "stablecoin",
        totalSupply: 760,
        totalSupplyExact: 760000000,
        extensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "COLLATERAL",
          "CUSTODIAN",
          "PAUSABLE",
          "REDEEMABLE",
        ],
        implementsERC3643: false,
        implementsSMART: true,
      },
    ]);
  });
});
