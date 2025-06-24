import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Identity claims", () => {
  it("claims should be issued by an account which is not a contract", async () => {
    const query = theGraphGraphql(
      `query {
        identityClaims {
          name
          issuer {
            id
            account {
              id
              isContract
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.identityClaims.length).toBe(27);
    expect(
      response.identityClaims.every(
        (identity) =>
          identity.issuer?.account && !identity.issuer.account.isContract
      )
    ).toBe(true);
  });
});
