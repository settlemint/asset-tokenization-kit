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
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.tokens.length).toBe(6);
    expect(response.tokens).toEqual([
      {
        name: "Apple",
        type: "equity",
        totalSupply: "75",
        totalSupplyExact: "75000000000000000000",
        extensions: ["CUSTODIAN", "BURNABLE", "PAUSABLE", "ACCESS_MANAGED"],
      },
      {
        name: "Bens Bugs",
        type: "fund",
        totalSupply: "8",
        totalSupplyExact: "800000000",
        extensions: ["CUSTODIAN", "BURNABLE", "PAUSABLE", "ACCESS_MANAGED"],
      },
      {
        name: "Euro Bonds",
        type: "bond",
        totalSupply: "117",
        totalSupplyExact: "117000000",
        extensions: [
          "ACCESS_MANAGED",
          "CUSTODIAN",
          "BURNABLE",
          "PAUSABLE",
          "YIELD",
          "REDEEMABLE",
          "HISTORICAL_BALANCES",
          "CAPPED",
        ],
      },
      {
        name: "Euro Deposits",
        type: "deposit",
        totalSupply: "10900",
        totalSupplyExact: "10900000000",
        extensions: [
          "CUSTODIAN",
          "BURNABLE",
          "PAUSABLE",
          "ACCESS_MANAGED",
          "COLLATERAL",
        ],
      },
      {
        name: "Paused Stablecoin",
        type: "stablecoin",
        totalSupply: "0",
        totalSupplyExact: "0",
        extensions: [
          "CUSTODIAN",
          "BURNABLE",
          "PAUSABLE",
          "ACCESS_MANAGED",
          "COLLATERAL",
        ],
      },
      {
        name: "Tether",
        type: "stablecoin",
        totalSupply: "760",
        totalSupplyExact: "760000000",
        extensions: [
          "CUSTODIAN",
          "BURNABLE",
          "PAUSABLE",
          "ACCESS_MANAGED",
          "COLLATERAL",
        ],
      },
    ]);
  });
});
