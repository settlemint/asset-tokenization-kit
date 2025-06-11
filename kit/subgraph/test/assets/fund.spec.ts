import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Funds", () => {
  it("should fetch a list of all funds", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          fund {
            managementFeeBps
            lastFeeCollection
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        fund_not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: "Euro Bonds",
        type: "bond",
        fund: {
          managementFeeBps: 20,
          lastFeeCollection: 35074,
        },
      },
    ]);
  });
});
