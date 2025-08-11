import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Trusted issuer registry", () => {
  it("trusted issuers should be linked to the trusted issuer registry", async () => {
    const trustedIssuersResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
        trustedIssuers {
          id
        }
      }`
      )
    );
    const trustedIssuerRegistryResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          systems {
            trustedIssuersRegistry {
              id
              trustedIssuers {
                id
              }
            }
          }
        }`
      )
    );
    const trustedIssuers = trustedIssuersResponse.trustedIssuers.map(
      (trustedIssuer) => trustedIssuer.id
    );
    expect(
      trustedIssuerRegistryResponse.systems
        .map((system) =>
          system.trustedIssuersRegistry?.trustedIssuers.map(
            (trustedIssuer) => trustedIssuer.id
          )
        )
        .flat()
    ).toEqual(trustedIssuers);
  });
});
