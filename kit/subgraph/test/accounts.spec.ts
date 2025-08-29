import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

// owner, investorA, investorB, frozenInvestor, maliciousInvestor, claimIssuer, investorANew
const CREATED_ACCOUNTS = 7;

describe("Accounts", () => {
  it("all accounts which are not contracts should have an identity and kyc/aml claims", async () => {
    const query = theGraphGraphql(
      `query {
      accounts(where: { identity_not: null, isContract: false }) {
        id
        identity {
          id
          claims {
            name
            revoked
          }
        }
      }
    }
  `
    );
    const response = await theGraphClient.request(query);
    const accountsWithClaims = response.accounts.filter(
      (account) => (account.identity?.claims?.length ?? 0) > 0
    );
    expect(accountsWithClaims.length).toBe(CREATED_ACCOUNTS - 1);
    for (const account of accountsWithClaims) {
      const claims = account.identity?.claims.map((claim) => claim.name);
      expect(claims?.sort()).toEqual([
        "antiMoneyLaundering",
        "knowYourCustomer",
      ]);
    }

    // One account (malicious) should have a revoked aml claim
    const revokedClaims = accountsWithClaims.filter((account) =>
      account.identity?.claims.find((claim) => claim.revoked)
    );
    expect(revokedClaims.length).toBe(1);
  });

  it("recovered accounts should have a lost and new account", async () => {
    const query = theGraphGraphql(
      `query {
        accounts(where: { isLost: true }) {
          id
          isLost
          recoveredAccount { id isLost}
        }
      }
    `
    );
    const response = await theGraphClient.request(query);
    expect(response.accounts).toEqual([
      {
        id: expect.any(String),
        isLost: true,
        recoveredAccount: {
          id: expect.any(String),
          isLost: false,
        },
      },
    ]);
  });

  it("all accounts which are in the identity registry should have a country", async () => {
    const response = await theGraphClient.request(
      theGraphGraphql(
        `query {
          accounts(where: {identity_not: null}) {
            id
            country
            isContract
            identity {
              id
              registryStorage {
                id
              }
            }
          }
        }
    `
      )
    );
    const accountsInIdentityRegistry = response.accounts.filter(
      (account) => account.identity?.registryStorage?.id
    );
    expect(accountsInIdentityRegistry.length).toBeGreaterThanOrEqual(1);
    expect(accountsInIdentityRegistry.every((account) => account.country)).toBe(
      true
    );
  });

  it("all accounts which are not contracts should have an identity and a claim signer key", async () => {
    const query = theGraphGraphql(
      `query {
      accounts(where: { identity_not: null, isContract: false }) {
        id
        identity {
          id
          keys {
            key
            purpose
            type
          }
        }
      }
    }
  `
    );
    const response = await theGraphClient.request(query);
    const accountsWithKeys = response.accounts.filter(
      (account) => (account.identity?.keys?.length ?? 0) > 0
    );
    expect(accountsWithKeys.length).toBe(CREATED_ACCOUNTS);
    const accountsWithClaimSignerKey = accountsWithKeys.filter((account) =>
      account.identity?.keys.find((key) => key.purpose === "claimSigner")
    );
    // One account (malicious) should have a claimSigner
    expect(accountsWithClaimSignerKey.length).toBe(CREATED_ACCOUNTS - 1);
    ``;
    const accountsWithManagementKey = accountsWithKeys.filter((account) =>
      account.identity?.keys.find((key) => key.purpose === "management")
    );
    expect(accountsWithManagementKey.length).toBe(CREATED_ACCOUNTS);
  });
});
