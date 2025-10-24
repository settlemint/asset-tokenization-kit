import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Token Factories", () => {
  it("should fetch a list of all token factories", async () => {
    const query = theGraphGraphql(
      `query {
        tokenFactories(orderBy: name) {
          name
          typeId
          tokenExtensions
          tokenImplementsERC3643
          tokenImplementsSMART
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.tokenFactories.length).toBe(5);
    expect(response.tokenFactories).toEqual([
      {
        name: "bond",
        typeId: "ATKBondFactory",
        tokenExtensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "CAPPED",
          "CUSTODIAN",
          "HISTORICAL_BALANCES",
          "PAUSABLE",
          "REDEEMABLE",
          "YIELD",
        ],
        tokenImplementsERC3643: false,
        tokenImplementsSMART: true,
      },
      {
        name: "deposit",
        typeId: "ATKDepositFactory",
        tokenExtensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "CUSTODIAN",
          "PAUSABLE",
        ],
        tokenImplementsERC3643: false,
        tokenImplementsSMART: true,
      },
      {
        name: "equity",
        typeId: "ATKEquityFactory",
        tokenExtensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "CUSTODIAN",
          "PAUSABLE",
        ],
        tokenImplementsERC3643: false,
        tokenImplementsSMART: true,
      },
      {
        name: "fund",
        typeId: "ATKFundFactory",
        tokenExtensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "CUSTODIAN",
          "PAUSABLE",
        ],
        tokenImplementsERC3643: false,
        tokenImplementsSMART: true,
      },
      {
        name: "stablecoin",
        typeId: "ATKStableCoinFactory",
        tokenExtensions: [
          "ACCESS_MANAGED",
          "BURNABLE",
          "COLLATERAL",
          "CUSTODIAN",
          "PAUSABLE",
        ],
        tokenImplementsERC3643: false,
        tokenImplementsSMART: true,
      },
    ]);
  });
});
