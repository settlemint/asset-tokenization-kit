import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Token Factories", () => {
  it("should fetch a list of all token factories", async () => {
    const query = theGraphGraphql(
      `query {
        tokenFactories(orderBy: name) {
          name
          typeId
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.tokenFactories.length).toBe(5);
    expect(response.tokenFactories).toEqual([
      {
        name: "bond",
        typeId: "ATKBondFactory",
      },
      {
        name: "deposit",
        typeId: "ATKDepositFactory",
      },
      {
        name: "equity",
        typeId: "ATKEquityFactory",
      },
      {
        name: "fund",
        typeId: "ATKFundFactory",
      },
      {
        name: "stablecoin",
        typeId: "ATKStableCoinFactory",
      },
    ]);
  });
});
