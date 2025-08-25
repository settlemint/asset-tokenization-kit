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
          yield_ {
            id
            schedule {
              id
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
        yield_: {
          id: expect.any(String),
          schedule: expect.any(Object), // This bond has yield configured in test fixtures
        },
      },
    ]);
  });

  it("should handle bonds without yield configuration", async () => {
    const query = theGraphGraphql(
      `query {
        tokens(where: { type: "bond" }, orderBy: createdAt) {
          name
          type
          yield_ {
            id
            schedule {
              id
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query);

    // Check that bonds can have yield entity with null schedule
    for (const token of response.tokens) {
      if (token.yield_) {
        expect(token.yield_.id).toBeDefined();
        // Verify schedule can be null (no yield configured) or contain valid data
        expect(
          token.yield_.schedule === null || token.yield_.schedule?.id
        ).toBeTruthy();
      }
    }
  });

  it("should correctly calculate face value using denomination asset decimals", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where) {
          name
          decimals
          bond {
            faceValue
            faceValueExact
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        bond_not: null,
        name: "Euro Bonds",
      },
    });

    expect(response.tokens.length).toBe(1);
    const euroBond = response.tokens[0];

    expect(euroBond.decimals).toBe(18); // Bond token decimals
    expect(euroBond.bond.denominationAsset.decimals).toBe(6); // Denomination asset decimals
    expect(euroBond.bond.faceValue).toBe("0.000123");
    expect(euroBond.bond.faceValueExact).toBe("123"); // Raw value (0.000123 * 10^6 = 123)
  });
});
