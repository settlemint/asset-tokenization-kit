import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Identity", () => {
  it("tokens should have an identity", async () => {
    const query = theGraphGraphql(
      `query {
        tokens {
          account {
            identity {
              id
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);
    expect(response.tokens.length).toBe(6);
    expect(
      response.tokens.every((token) => token.account.identity !== null)
    ).toBe(true);
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
    expect(response.identities.length).toBe(16);

    const identityIds = response.identities.map((identity) => identity.id);
    const accountIds = response.identities
      .map((identity) => identity.account?.id)
      .filter((id): id is string => Boolean(id));
    // Ensure no account ID is also used as an identity ID
    expect(accountIds.every((id) => !identityIds.includes(id))).toBe(true);
  });
});
