import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Token Factories", () => {
  it("should fetch a list of all token factories", async () => {
    const query = theGraphGraphql(
      `query {
        tokenFactories(orderBy: name) {
          name
          typeId
          extensions
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.tokenFactories.length).toBe(5);
    expect(response.tokenFactories).toEqual([
      {
        name: "bond",
        typeId: "ATKBondFactory",
        extensions: [
          "ACCESS_MANAGED",
          "CUSTODIAN",
          "PAUSABLE",
          "BURNABLE",
          "REDEEMABLE",
          "HISTORICAL_BALANCES",
          "YIELD",
          "CAPPED",
        ],
      },
      {
        name: "deposit",
        typeId: "ATKDepositFactory",
        extensions: [
          "ACCESS_MANAGED",
          "COLLATERAL",
          "CUSTODIAN",
          "PAUSABLE",
          "BURNABLE",
        ],
      },
      {
        name: "equity",
        typeId: "ATKEquityFactory",
        extensions: ["ACCESS_MANAGED", "CUSTODIAN", "PAUSABLE", "BURNABLE"],
      },
      {
        name: "fund",
        typeId: "ATKFundFactory",
        extensions: ["ACCESS_MANAGED", "BURNABLE", "PAUSABLE", "CUSTODIAN"],
      },
      {
        name: "stablecoin",
        typeId: "ATKStableCoinFactory",
        extensions: [
          "ACCESS_MANAGED",
          "COLLATERAL",
          "CUSTODIAN",
          "PAUSABLE",
          "BURNABLE",
        ],
      },
    ]);
  });
});
