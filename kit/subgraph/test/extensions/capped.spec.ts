import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token capped extension", () => {
  it("tokens can be capped", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          capped {
            capExact
            cap
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        capped_not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: "Euro Bonds",
        type: "bond",
        capped: { capExact: "1500000000000000000000000", cap: "1500000" },
      },
    ]);
  });
});
