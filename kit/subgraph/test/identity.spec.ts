import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Identity", () => {
  it("tokens should have an identity", async () => {
    const query = theGraphGraphql(
      `query {
        tokens {
          identity {
            id
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);
    expect(response.tokens.length).toBe(6);
    expect(response.tokens.every((token) => token.identity !== null)).toBe(
      true
    );
  });

  it("there should be no identities and accounts with the same address", async () => {
    const query = theGraphGraphql(
      `query {
        identities {
          id
          account {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    const allIdentitiesIds = response.identities.map((identity) => identity.id);
    expect(response.identities.length).toBe(12);
    expect(
      response.identities
        .filter((identity) => identity.account)
        .every(
          (identity) =>
            identity.account && !allIdentitiesIds.includes(identity.account.id)
        )
    ).toBe(true);
  });
});
