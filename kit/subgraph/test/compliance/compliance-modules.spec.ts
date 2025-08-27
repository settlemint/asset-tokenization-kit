import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Compliance Modules", () => {
  it("should fetch a list of all compliance modules registered", async () => {
    const query = theGraphGraphql(
      `query {
        complianceModules(orderBy: name) {
          name
          typeId
          globalConfigs {
            parameters {
              countries
              addresses
            }
          }
        }
    }
    `
    );
    const response = await theGraphClient.request(query, {});
    const complianceModules = response.complianceModules;
    expect(complianceModules.length).toBe(9);

    expect(complianceModules).toEqual(
      expect.arrayContaining([
        {
          name: "Address BlockList Compliance Module",
          typeId: "AddressBlockListComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Country AllowList Compliance Module",
          typeId: "CountryAllowListComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Country BlockList Compliance Module",
          typeId: "CountryBlockListComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Identity AllowList Compliance Module",
          typeId: "IdentityAllowListComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Identity BlockList Compliance Module",
          typeId: "IdentityBlockListComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Identity Verification Module",
          typeId: "SMARTIdentityVerificationComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Investor Count Compliance Module",
          typeId: "InvestorCountComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "Token Supply Limit Compliance Module",
          typeId: "TokenSupplyLimitComplianceModule",
          globalConfigs: expect.any(Array),
        },
        {
          name: "TimeLock Compliance Module",
          typeId: "TimeLockComplianceModule",
          globalConfigs: expect.any(Array),
        },
      ])
    );
  });

  it("should receive the list of blocked countries through global compliance configs", async () => {
    const query = theGraphGraphql(
      `query {
        globalComplianceModuleConfigs(where: {parameters_: {countries_not: []}}) {
          complianceModule {
            name
          }
          parameters {
            countries
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.globalComplianceModuleConfigs).toEqual([
      {
        complianceModule: {
          name: "Country BlockList Compliance Module",
        },
        parameters: {
          countries: [643],
        },
      },
    ]);
  });

  it("should receive the list of blocked addresses and identities through global compliance configs", async () => {
    const query = theGraphGraphql(
      `query {
        globalComplianceModuleConfigs(where: {parameters_: {addresses_not: []}}) {
          complianceModule {
            name
          }
          parameters {
            addresses
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    const expected = [
      {
        complianceModule: {
          name: "Identity BlockList Compliance Module",
        },
        parameters: {
          addresses: [expect.any(String)],
        },
      },
      {
        complianceModule: {
          name: "Address BlockList Compliance Module",
        },
        parameters: {
          addresses: [expect.any(String)],
        },
      },
    ];

    expect(response.globalComplianceModuleConfigs).toHaveLength(
      expected.length
    );
    expect(response.globalComplianceModuleConfigs).toEqual(
      expect.arrayContaining(expected)
    );
  });

  it("should receive the list of globally bypassed accounts", async () => {
    // There is one account which is not a contract and is globally bypassed (owner actor)
    const query = theGraphGraphql(
      `query {
        systems {
          compliance {
            id
            bypassList(where: { isContract: false }) {
              id
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {});
    expect(response.systems).toEqual([
      {
        compliance: {
          id: expect.any(String),
          bypassList: [{ id: expect.any(String) }],
        },
      },
    ]);
  });
});
