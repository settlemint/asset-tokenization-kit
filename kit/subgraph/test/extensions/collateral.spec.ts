import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Token collateral extension", () => {
  it("tokens can have collateral", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where) {
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
        type: "deposit",
        collateral: {
          identityClaim: {
            name: "collateral",
            issuer: {
              account: {
                isContract: false,
              },
            },
            values: [
              { key: "amount", value: "100000000000" },
              { key: "expiryTimestamp", value: "1780610400" },
            ],
            revoked: false,
          },
        },
      },
      {
        type: "stablecoin",
        collateral: {
          identityClaim: {
            name: "collateral",
            issuer: {
              account: {
                isContract: false,
              },
            },
            values: [
              { key: "amount", value: "1000000000" },
              { key: "expiryTimestamp", value: "1780610400" },
            ],
            revoked: false,
          },
        },
      },
      { type: "stablecoin", collateral: { identityClaim: null } },
    ]);
  });
});
