import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token pausable extension", () => {
  it("tokens can be pausable", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where) {
          type
          pausable {
            paused
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        pausable_not: null,
      },
    });
    expect(response.tokens.length).toBe(6);
    expect(response.tokens).toEqual([
      { type: "equity", pausable: { paused: false } },
      { type: "deposit", pausable: { paused: false } },
      { type: "bond", pausable: { paused: false } },
      { type: "stablecoin", pausable: { paused: false } },
      { type: "stablecoin", pausable: { paused: true } },
      { type: "fund", pausable: { paused: false } },
    ]);
  });
});
