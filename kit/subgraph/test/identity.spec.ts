import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Identity", () => {
  it("tokens should have an identity", async () => {
    const query = theGraphGraphql(
      `query {
        tokens {
          account {
            identities {
              id
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);
    expect(response.tokens.length).toBe(6);
    expect(
      response.tokens.every((token) => token.account.identities.length > 0)
    ).toBe(true);
  });

  it("there should be no identities and accounts with the same address", async () => {
    const query = theGraphGraphql(
      `query {
        identities {
          id
          account {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.identities.length).toBe(16);

    const identityIds = response.identities.map((identity) => identity.id);
    const accountIds = response.identities
      .map((identity) => identity.account?.id)
      .filter((id): id is string => Boolean(id));
    // Ensure no account ID is also used as an identity ID
    expect(accountIds.every((id) => !identityIds.includes(id))).toBe(true);
  });

  it("wallet identities should remain wallets without supported interfaces", async () => {
    const query = theGraphGraphql(
      `query {
        accounts(where: { isContract: false }) {
          id
          identities {
            id
            entityType
            supportedInterfaces
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    const walletIdentities = response.accounts.flatMap(
      (account) => account.identities
    );

    expect(walletIdentities.length).toBeGreaterThan(0);
    expect(
      walletIdentities.every((identity) => identity.entityType === "wallet")
    ).toBe(true);
    expect(
      walletIdentities.every(
        (identity) => identity.supportedInterfaces.length === 0
      )
    ).toBe(true);
  });

  it("token contracts should expose SMART interfaces and token classification", async () => {
    const SMART_INTERFACE_ID = "0x6b39c018";
    const query = theGraphGraphql(
      `query {
        tokens {
          account {
            id
            isContract
            identities {
              id
              entityType
              supportedInterfaces
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    const smartInterfaceHex = SMART_INTERFACE_ID.toLowerCase();
    const contractIdentities = response.tokens
      .filter((token) => token.account?.isContract)
      .flatMap((token) => token.account.identities);

    expect(contractIdentities.length).toBeGreaterThan(0);
    expect(
      contractIdentities.every((identity) => identity.entityType === "token")
    ).toBe(true);
    expect(
      contractIdentities.every((identity) =>
        identity.supportedInterfaces.some(
          (iface: string) => iface.toLowerCase() === smartInterfaceHex
        )
      )
    ).toBe(true);
    expect(
      contractIdentities.every(
        (identity) => identity.supportedInterfaces.length > 0
      )
    ).toBe(true);
  });
});
