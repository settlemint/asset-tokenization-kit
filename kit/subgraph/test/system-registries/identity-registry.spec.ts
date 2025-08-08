import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Identity registry", () => {
  it("identities should be linked to the identity registry", async () => {
    const identitiesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
        identities(where: { account_: { isLost: false } }) {
          id
        }
        trustedIssuers {
          id
        }
      }`
      )
    );
    const identitiyRegistryResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          systems {
            identityRegistry {
              id
            }
            identityRegistryStorage {
              registries {
                id
              }
              id
              identities {
                id
              }
            }
          }
        }`
      )
    );
    const identities = identitiesResponse.identities;
    const trustedIssuers = identitiesResponse.trustedIssuers.map(
      (trustedIssuer) => trustedIssuer.id
    );
    // Trusted issuers are not stored in the identity registry
    const identitiesExpected = identities.filter(
      (identity) => !trustedIssuers.includes(identity.id)
    );
    const idientitiesInRegistryStorage = identitiyRegistryResponse.systems
      .map((system) => system.identityRegistryStorage?.identities ?? [])
      .flat();
    expect(idientitiesInRegistryStorage.length).toBe(identitiesExpected.length);
    expect(idientitiesInRegistryStorage.sort()).toEqual(
      identitiesExpected.sort()
    );
    // Id of the system registry should be in the identityRegistryStorage id list
    expect(
      identitiyRegistryResponse.systems.map(
        (system) => system.identityRegistry?.id
      )
    ).toEqual(
      identitiyRegistryResponse.systems
        .map((system) =>
          system.identityRegistryStorage?.registries.map(
            (registry) => registry.id
          )
        )
        .flat()
    );
  });
});
