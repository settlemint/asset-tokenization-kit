import { describe, expect, it } from 'bun:test';
import { theGraphClient, theGraphGraphql } from '../utils/thegraph-client';

describe('Token Compliance Modules', () => {
  it('should receive the compliance modules for the assets', async () => {
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
      if (token.name === 'Paused Stablecoin') {
        continue;
      }

      const complianceModules = token.tokenComplianceModules;

      const countryAllowListModule = complianceModules.find(
        (m) => m.complianceModule.name === 'Country AllowList Compliance Module'
      );
      expect(countryAllowListModule).toBeDefined();
      expect(countryAllowListModule.countries.map(Number).sort()).toEqual(
        [56, 528, 250, 276].sort()
      );

      const identityBlockListModule = complianceModules.find(
        (m) =>
          m.complianceModule.name === 'Identity BlockList Compliance Module'
      );
      expect(identityBlockListModule).toBeDefined();

      const identityVerificationModule = complianceModules.find(
        (m) => m.complianceModule.name === 'Identity Verification Module'
      );
      expect(identityVerificationModule).toBeDefined();

      const countryBlockListModule = complianceModules.find(
        (m) => m.complianceModule.name === 'Country BlockList Compliance Module'
      );
      if (token.name === 'Euro Deposits') {
        expect(countryBlockListModule).toBeDefined();
      } else {
        expect(countryBlockListModule).toBeUndefined();
      }
    }
  });

  it('should receive the required claim topics for the assets', async () => {
    const query = theGraphGraphql(
      `query {
        tokens(orderBy: name) {
          name
          requiredClaimTopics {
            name
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.tokens.length).toBe(6);
    expect(response.tokens).toEqual([
      {
        name: 'Apple',
        requiredClaimTopics: [],
      },
      {
        name: 'Bens Bugs',
        requiredClaimTopics: [
          {
            name: 'kyc',
          },
        ],
      },
      {
        name: 'Euro Bonds',
        requiredClaimTopics: [
          {
            name: 'kyc',
          },
        ],
      },
      {
        name: 'Euro Deposits',
        requiredClaimTopics: [],
      },
      {
        name: 'Paused Stablecoin',
        requiredClaimTopics: [],
      },
      {
        name: 'Tether',
        requiredClaimTopics: [],
      },
    ]);
  });
});
