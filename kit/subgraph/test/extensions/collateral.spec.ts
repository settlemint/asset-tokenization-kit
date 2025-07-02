import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token collateral extension", () => {
  it("tokens can have collateral", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          collateral {
            identityClaim {
              name
              issuer {
                account {
                  isContract
                }
              }
              values {
                key
                value
              }
              revoked
            }
            expiryTimestamp
            collateral
            collateralExact
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        collateral_not: null,
      },
    });
    expect(response.tokens.length).toBe(3);
    expect(response.tokens).toEqual([
      {
        name: "Euro Deposits",
        type: "deposit",
        collateral: {
          identityClaim: {
            name: "collateral",
            issuer: { account: { isContract: false } },
            values: [
              { key: "amount", value: "100000000000" },
              { key: "expiryTimestamp", value: expect.any(String) },
            ],
            revoked: false,
          },
          expiryTimestamp: expect.any(String),
          collateral: "100000",
          collateralExact: "100000000000",
        },
      },
      {
        name: "Paused Stablecoin",
        type: "stablecoin",
        collateral: {
          identityClaim: null,
          expiryTimestamp: null,
          collateral: null,
          collateralExact: null,
        },
      },
      {
        name: "Tether",
        type: "stablecoin",
        collateral: {
          identityClaim: {
            name: "collateral",
            issuer: { account: { isContract: false } },
            values: [
              { key: "amount", value: "1000000000" },
              { key: "expiryTimestamp", value: expect.any(String) },
            ],
            revoked: false,
          },
          expiryTimestamp: expect.any(String),
          collateral: "1000",
          collateralExact: "1000000000",
        },
      },
    ]);
  });
});
