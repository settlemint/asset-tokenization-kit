import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Compliance Modules", () => {
  it("should fetch a list of all compliance modules registered", async () => {
    const query = theGraphGraphql(
      `query {
        complianceModules {
          name
          countries
          addresses
        }
    }
    `
    );
    const response = await theGraphClient.request(query, {});
    const complianceModules = response.complianceModules;
    expect(complianceModules.length).toBe(6);

    const moduleNames = complianceModules.map((m) => m.name);
    expect(moduleNames).toContain("Country AllowList Compliance Module");
    expect(moduleNames).toContain("Country BlockList Compliance Module");
    expect(moduleNames).toContain("Identity Verification Module");
    expect(moduleNames).toContain("Identity AllowList Compliance Module");
    expect(moduleNames).toContain("Identity BlockList Compliance Module");
    expect(moduleNames).toContain("Address BlockList Compliance Module");

    const countryBlockListModule = complianceModules.find(
      (m) => m.name === "Country BlockList Compliance Module"
    );
    expect(countryBlockListModule).toBeDefined();
    expect(countryBlockListModule.countries.map(Number)).toContain(643);
  });

  it("should receive the list of blocked countries", async () => {
    const query = theGraphGraphql(
      `query {
        complianceModules(where: {countries_not: []}) {
          name
          countries
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.complianceModules).toEqual([
      {
        name: "Country BlockList Compliance Module",
        countries: [643],
      },
    ]);
  });

  it("should receive the list of blocked addresses and identities", async () => {
    const query = theGraphGraphql(
      `query {
        complianceModules(where: {addresses_not: []}) {
          name
          addresses
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const expected = [
      {
        name: "Identity BlockList Compliance Module",
        addresses: [expect.any(String)],
      },
      {
        name: "Address BlockList Compliance Module",
        addresses: [expect.any(String)],
      },
    ];

    expect(response.complianceModules).toHaveLength(expected.length);
    expect(response.complianceModules).toEqual(
      expect.arrayContaining(expected)
    );
  });
});
