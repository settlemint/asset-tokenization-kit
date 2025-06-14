import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token redeemable extension", () => {
  it("tokens can be redeemable", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          redeemable {
            redeemedAmountExact
            redeemedAmount
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        redeemable_not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: "Euro Bonds",
        type: "bond",
        redeemable: {
          redeemedAmount: "11",
          redeemedAmountExact: "11000000",
        },
      },
    ]);
  });
});
