import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe.skip("Vesting Airdrops", () => {
  it("should fetch a list of all vesting airdrops", async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          token {
            name
          }
          vestingAirdrop {
            initializationDeadline
            strategyId
            linearVestingStrategy {
              vestingDuration
              cliffDuration
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        vestingAirdrop_not: null,
      },
    });
    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: "Test Vesting Airdrop",
        token: {
          name: expect.any(String),
        },
        vestingAirdrop: {
          initializationDeadline: expect.any(String),
          strategyId: expect.any(String),
          linearVestingStrategy: expect.any(Object),
        },
      },
    ]);
  });

  it("should fetch vesting airdrop with linear vesting strategy", async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          vestingAirdrop {
            linearVestingStrategy {
              vestingDuration
              cliffDuration
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        vestingAirdrop_not: null,
        vestingAirdrop_: {
          linearVestingStrategy_not: null,
        },
      },
    });
    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: "Test Vesting Airdrop",
        vestingAirdrop: {
          linearVestingStrategy: {
            vestingDuration: expect.any(String),
            cliffDuration: expect.any(String),
          },
        },
      },
    ]);
  });
});
