import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

// owner, investorA, investorB, frozenInvestor, maliciousInvestor, claimIssuer, investorANew
const CREATED_ACCOUNTS = 7;

describe("Accounts", () => {
  it("all EOAs should have an identity and expected KYC/AML claims", async () => {
    const query = theGraphGraphql(
      `query AccountsWithClaims {
        accounts(where: { isContract: false }) {
          id
          identities {
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

    expect(response.accounts.length).toBe(CREATED_ACCOUNTS);

    const accountsWithAtLeastOneIdentity = response.accounts.filter(
      (account) => account.identities.length > 0
    );
    expect(accountsWithAtLeastOneIdentity.length).toBe(CREATED_ACCOUNTS);

    const accountsWithKycAmlClaims = response.accounts.filter((account) => {
      const names = account.identities.flatMap((identity) =>
        identity.claims.map((claim) => claim.name)
      );
      return ["antiMoneyLaundering", "knowYourCustomer"].every((claim) =>
        names.includes(claim)
      );
    });
    // One account (malicious) should have a revoked aml claim
    expect(accountsWithKycAmlClaims.length).toBe(CREATED_ACCOUNTS - 1);

    const accountsWithRevokedAml = response.accounts.filter((account) =>
      account.identities.some((identity) =>
        identity.claims.some(
          (claim) => claim.name === "antiMoneyLaundering" && claim.revoked
        )
      )
    );
    expect(accountsWithRevokedAml.length).toBe(1);
  });

  it("recovered registered identities should link lost and replacement accounts", async () => {
    const query = theGraphGraphql(
      `query LostRegisteredIdentities {
        registeredIdentities(where: { isLost: true }) {
          id
          isLost
          account {
            id
          }
          recoveredIdentity {
            id
            isLost
            account {
              id
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);

    expect(response.registeredIdentities).toEqual([
      {
        id: expect.any(String),
        isLost: true,
        account: {
          id: expect.any(String),
        },
        recoveredIdentity: {
          id: expect.any(String),
          isLost: false,
          account: {
            id: expect.any(String),
          },
        },
      },
    ]);

    const [lost] = response.registeredIdentities;
    expect(lost?.account.id).not.toBe(lost?.recoveredIdentity?.account.id);
  });

  it("registered identities should provide country information", async () => {
    const query = theGraphGraphql(
      `query AccountsWithRegisteredIdentities {
        accounts(where: { isContract: false }) {
          id
          registeredIdentities {
            id
            country
            registryStorage {
              id
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);

    const registeredIdentities = response.accounts.flatMap(
      (account) => account.registeredIdentities
    );
    expect(registeredIdentities.length).toBeGreaterThan(0);
    expect(
      registeredIdentities.every(
        (registered) =>
          registered.registryStorage !== null && registered.country !== null
      )
    ).toBe(true);
  });

  it("EOAs should expose both management and claim signer keys", async () => {
    const query = theGraphGraphql(
      `query AccountsWithKeys {
        accounts(where: { isContract: false }) {
          id
          identities {
            id
            keys {
              purpose
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);

    const accountsWithAnyKeys = response.accounts.filter((account) =>
      account.identities.some((identity) => identity.keys.length > 0)
    );
    expect(accountsWithAnyKeys.length).toBe(CREATED_ACCOUNTS);

    const accountsWithClaimSigner = response.accounts.filter((account) =>
      account.identities.some((identity) =>
        identity.keys.some((key) => key.purpose === "claimSigner")
      )
    );
    // One account (malicious) should not have a claim signer key
    expect(accountsWithClaimSigner.length).toBe(CREATED_ACCOUNTS - 1);

    const accountsWithManagement = response.accounts.filter((account) =>
      account.identities.some((identity) =>
        identity.keys.some((key) => key.purpose === "management")
      )
    );
    expect(accountsWithManagement.length).toBe(CREATED_ACCOUNTS);
  });
});
