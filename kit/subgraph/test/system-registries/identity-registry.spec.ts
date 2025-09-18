import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Identity registry", () => {
  it("identities should be linked to the identity registry", async () => {
    const identitiesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
        identities {
          id
          identityFactory {
            id
          }
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
              registeredIdentities(where: { isLost: false }) {
                id
              }
            }
          }
        }`
      )
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
