import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Identity claims", () => {
  it("claims should be issued by both contracts and non-contract accounts", async () => {
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
    const response = (await theGraphClient.request(query)) as {
      identityClaims: Array<{
        name: string;
        issuer?: {
          id: string;
          account?: {
            id: string;
            isContract: boolean;
          };
        };
      }>;
    };

    expect(response.identityClaims.length).toBeGreaterThan(0);

    // Separate claims by issuer type
    const contractIssuedClaims = response.identityClaims.filter(
      (claim) => claim.issuer?.account?.isContract === true
    );
    const nonContractIssuedClaims = response.identityClaims.filter(
      (claim) => claim.issuer?.account?.isContract === false
    );

    // Verify both contracts and non-contracts can issue claims
    expect(contractIssuedClaims.length).toBeGreaterThan(0);
    expect(nonContractIssuedClaims.length).toBeGreaterThan(0);

    // Verify all claims have valid issuers
    expect(
      response.identityClaims.every(
        (claim) => claim.issuer?.account !== undefined
      )
    ).toBe(true);
  });
});
