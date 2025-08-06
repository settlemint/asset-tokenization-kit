import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Bonds", () => {
  it("should fetch a list of all bonds", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          bond {
            isMatured
            maturityDate
            faceValue
            denominationAsset {
              name
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        bond_not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: "Euro Bonds",
        type: "bond",
        bond: {
          isMatured: true,
          maturityDate: expect.not.stringMatching(/^0$/),
          faceValue: "0.000123",
          denominationAsset: {
            name: "Euro Deposits",
          },
        },
      },
    ]);
  });
});
