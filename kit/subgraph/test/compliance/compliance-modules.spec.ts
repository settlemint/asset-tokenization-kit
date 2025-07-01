import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Compliance Modules", () => {
  it("should fetch a list of all compliance modules registered", async () => {
    const query = theGraphGraphql(
      `query {
        complianceModules(orderBy: name) {
          name
          typeId
          countries
          addresses
        }
    }
    `
    );
    const response = await theGraphClient.request(query, {});
    const complianceModules = response.complianceModules;
    expect(complianceModules.length).toBe(6);

    expect(complianceModules).toEqual([
      {
        name: "Address BlockList Compliance Module",
        typeId: "AddressBlockListComplianceModule",
        countries: [],
        addresses: expect.any(Array),
      },
      {
        name: "Country AllowList Compliance Module",
        typeId: "CountryAllowListComplianceModule",
        countries: [],
        addresses: [],
      },
      {
        name: "Country BlockList Compliance Module",
        typeId: "CountryBlockListComplianceModule",
        countries: [643],
        addresses: [],
      },
      {
        name: "Identity AllowList Compliance Module",
        typeId: "IdentityAllowListComplianceModule",
        countries: [],
        addresses: [],
      },
      {
        name: "Identity BlockList Compliance Module",
        typeId: "IdentityBlockListComplianceModule",
        countries: [],
        addresses: expect.any(Array),
      },
      {
        name: "Identity Verification Module",
        typeId: "SMARTIdentityVerificationComplianceModule",
        countries: [],
        addresses: [],
      },
    ]);
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
