import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

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
    const complianceModules = response.complianceModules as any[];
    expect(complianceModules.length).toBe(6);

    const moduleNames = complianceModules.map((m: any) => m.name);
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

  it("should receive the compliance modules for the assets", async () => {
    const query = theGraphGraphql(
      `query {
        tokens(where: {}) {
          name
          tokenComplianceModules(where: {}) {
            addresses
            countries
            encodedParams
            complianceModule {
              name
              addresses
              countries
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});

    for (const token of response.tokens) {
      if (token.name === "Paused Stablecoin") {
        continue;
      }

      const complianceModules = token.tokenComplianceModules as any[];

      const countryAllowListModule = complianceModules.find(
        (m: any) =>
          m.complianceModule.name === "Country AllowList Compliance Module"
      );
      expect(countryAllowListModule).toBeDefined();
      expect(countryAllowListModule.countries.map(Number).sort()).toEqual(
        [56, 528, 250, 276].sort()
      );

      const identityBlockListModule = complianceModules.find(
        (m: any) =>
          m.complianceModule.name === "Identity BlockList Compliance Module"
      );
      expect(identityBlockListModule).toBeDefined();

      const identityVerificationModule = complianceModules.find(
        (m: any) => m.complianceModule.name === "Identity Verification Module"
      );
      expect(identityVerificationModule).toBeDefined();

      const countryBlockListModule = complianceModules.find(
        (m: any) =>
          m.complianceModule.name === "Country BlockList Compliance Module"
      );
      expect(countryBlockListModule).toBeUndefined();
    }
  });
});
