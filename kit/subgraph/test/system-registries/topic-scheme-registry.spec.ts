import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Topic scheme registry", () => {
  it("topic schemes should be linked to the topic scheme registry", async () => {
    // Query all topic schemes
    const topicSchemesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          topicSchemes {
            id
            topicId
            name
            signature
            enabled
            registry {
              id
            }
          }
        }`
      )
    );

    // Query topic scheme registries with their schemes
    const topicSchemeRegistriesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          topicSchemeRegistries {
            id
            schemes {
              id
              topicId
              name
              signature
              enabled
            }
          }
        }`
      )
    );

    // Verify that topic schemes exist
    expect(topicSchemesResponse.topicSchemes.length).toBeGreaterThan(0);

    // Verify that all topic schemes have a non-null registry
    topicSchemesResponse.topicSchemes.forEach((topicScheme) => {
      expect(topicScheme.registry).toBeDefined();
      expect(topicScheme.registry.id).toBeDefined();
      expect(topicScheme.registry.id).not.toEqual(
        "0x0000000000000000000000000000000000000000"
      );
    });

    // Verify that registries exist
    expect(
      topicSchemeRegistriesResponse.topicSchemeRegistries.length
    ).toBeGreaterThan(0);

    // Create a map of registry ID to schemes for easier comparison
    const registryToSchemes = new Map<string, string[]>();
    topicSchemeRegistriesResponse.topicSchemeRegistries.forEach((registry) => {
      registryToSchemes.set(
        registry.id,
        registry.schemes.map((scheme) => scheme.id).sort()
      );
    });

    // Verify that each topic scheme is properly linked to its registry
    topicSchemesResponse.topicSchemes.forEach((topicScheme) => {
      const registryId = topicScheme.registry.id;
      const registrySchemes = registryToSchemes.get(registryId) || [];

      // Check that this scheme is in the registry's schemes list
      expect(registrySchemes).toContain(topicScheme.id);
    });

    // Verify that the relationship is bidirectional
    const allTopicSchemeIds = topicSchemesResponse.topicSchemes
      .map((scheme) => scheme.id)
      .sort();

    const allRegistrySchemeIds =
      topicSchemeRegistriesResponse.topicSchemeRegistries
        .flatMap((registry) => registry.schemes.map((scheme) => scheme.id))
        .sort();

    expect(allRegistrySchemeIds).toEqual(allTopicSchemeIds);
  });

  it("should be able to filter topic schemes by registry address", async () => {
    // First get all registries
    const registriesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          topicSchemeRegistries {
            id
            schemes {
              id
              name
            }
          }
        }`
      )
    );

    expect(registriesResponse.topicSchemeRegistries.length).toBeGreaterThan(0);

    // Test filtering by each registry
    for (const registry of registriesResponse.topicSchemeRegistries) {
      const filteredResponse = await theGraphClient.request(
        theGraphGraphql(
          `query GetTopicSchemesByRegistry($registryAddress: String!) {
            topicSchemes(where: { registry: $registryAddress, enabled: true }) {
              id
              topicId
              name
              signature
              registry {
                id
              }
            }
          }`
        ),
        { registryAddress: registry.id }
      );

      // All returned schemes should belong to this registry
      filteredResponse.topicSchemes.forEach((scheme) => {
        expect(scheme.registry.id).toEqual(registry.id);
      });

      // The count should match what we expect from the registry's schemes
      const enabledSchemesInRegistry = registry.schemes.length;
      expect(filteredResponse.topicSchemes.length).toBeLessThanOrEqual(
        enabledSchemesInRegistry
      );
    }
  });

  it("should contain expected system topic schemes", async () => {
    const expectedSystemTopics = [
      "knowYourCustomer",
      "antiMoneyLaundering",
      "collateral",
      "isin",
    ];

    const topicSchemesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          topicSchemes(where: { enabled: true }) {
            id
            name
            signature
            topicId
          }
        }`
      )
    );

    const topicNames = topicSchemesResponse.topicSchemes.map(
      (scheme) => scheme.name
    );

    // Verify that all expected system topics exist
    expectedSystemTopics.forEach((expectedTopic) => {
      expect(topicNames).toContain(expectedTopic);
    });

    // Verify that topic schemes have valid structure
    topicSchemesResponse.topicSchemes.forEach((scheme) => {
      expect(scheme.name).toBeDefined();
      expect(scheme.name.length).toBeGreaterThan(0);
      expect(scheme.signature).toBeDefined();
      expect(scheme.signature.length).toBeGreaterThan(0);
      expect(scheme.topicId).toBeDefined();
    });
  });

  it("should have unique topic IDs", async () => {
    const topicSchemesResponse = await theGraphClient.request(
      theGraphGraphql(
        `query {
          topicSchemes {
            id
            topicId
            name
            registry {
              id
            }
          }
        }`
      )
    );

    // All topic IDs should be unique for a registry
    const topicIds = topicSchemesResponse.topicSchemes.map(
      (scheme) => `${scheme.topicId}-${scheme.registry.id}`
    );
    const uniqueTopicIds = [...new Set(topicIds)];

    // All topic IDs should be unique
    expect(uniqueTopicIds.length).toEqual(topicIds.length);

    // All topic IDs should be valid (non-zero)
    topicSchemesResponse.topicSchemes.forEach(({ topicId }) => {
      expect(BigInt(topicId)).toBeGreaterThan(0n);
    });
  });
});
