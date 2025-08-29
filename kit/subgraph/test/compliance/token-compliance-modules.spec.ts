import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token Compliance Modules", () => {
  it("should receive the compliance modules for the assets", async () => {
    const query = theGraphGraphql(
      `query {
        tokens(where: {}) {
          name
          complianceModuleConfigs(where: {}) {
            parameters {
              addresses
              countries
              encodedParams
              expression {
                nodeType
                index
                topicScheme {
                  name
                  topicId
                }
              }
            }
            complianceModule {
              name
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {});

    for (const token of response.tokens) {
      if (token.name === "Paused Stablecoin") {
        continue;
      }

      const complianceModules = token.complianceModuleConfigs;

      const countryAllowListModule = complianceModules.find(
        (m) => m.complianceModule.name === "Country AllowList Compliance Module"
      );
      expect(countryAllowListModule).toBeDefined();
      if (
        countryAllowListModule &&
        countryAllowListModule.parameters.countries
      ) {
        expect(
          countryAllowListModule.parameters.countries.map(Number).sort()
        ).toEqual([56, 528, 250, 276].sort());
      }

      const identityBlockListModule = complianceModules.find(
        (m) =>
          m.complianceModule.name === "Identity BlockList Compliance Module"
      );
      expect(identityBlockListModule).toBeDefined();

      const identityVerificationModule = complianceModules.find(
        (m) => m.complianceModule.name === "Identity Verification Module"
      );
      expect(identityVerificationModule).toBeDefined();

      // Test the new expression-based identity verification
      if (
        identityVerificationModule &&
        identityVerificationModule.parameters.expression
      ) {
        const expressionNodes = Array.isArray(
          identityVerificationModule.parameters.expression
        )
          ? identityVerificationModule.parameters.expression.sort(
              (a, b) => a.index - b.index
            )
          : [];

        // Expected: expressionBuilder().topic(ATKTopic.kyc).and(ATKTopic.aml).build()
        // Should create: [TOPIC(kyc), TOPIC(aml), AND]
        expect(expressionNodes).toHaveLength(3);

        // Node 0: KYC topic
        expect(expressionNodes[0].nodeType).toBe("TOPIC");
        expect(expressionNodes[0].index).toBe(0);
        expect(expressionNodes[0].topicScheme?.name).toBe("knowYourCustomer");

        // Node 1: AML topic
        expect(expressionNodes[1].nodeType).toBe("TOPIC");
        expect(expressionNodes[1].index).toBe(1);
        expect(expressionNodes[1].topicScheme?.name).toBe(
          "antiMoneyLaundering"
        );

        // Node 2: AND operation
        expect(expressionNodes[2].nodeType).toBe("AND");
        expect(expressionNodes[2].index).toBe(2);
        expect(expressionNodes[2].topicScheme).toBeNull();
      }

      const countryBlockListModule = complianceModules.find(
        (m) => m.complianceModule.name === "Country BlockList Compliance Module"
      );
      if (token.name === "Euro Deposits") {
        expect(countryBlockListModule).toBeDefined();
      } else {
        expect(countryBlockListModule).toBeUndefined();
      }
    }
  });
});
