import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("TimeBound Airdrops", () => {
  it("should fetch a list of all timebound airdrops", async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          token {
            name
          }
          timeBoundAirdrop {
            startTime
            endTime
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        timeBoundAirdrop_not: null,
      },
    });
    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: "Test TimeBound Airdrop",
        token: {
          name: expect.any(String),
        },
        timeBoundAirdrop: {
          startTime: expect.any(String),
          endTime: expect.any(String),
        },
      },
    ]);
  });

  it("should fetch timebound airdrop with time window details", async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          merkleRoot
          timeBoundAirdrop {
            startTime
            endTime
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        timeBoundAirdrop_not: null,
      },
    });
    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: "Test TimeBound Airdrop",
        merkleRoot: expect.any(String),
        timeBoundAirdrop: {
          startTime: expect.not.stringMatching(/^0$/),
          endTime: expect.not.stringMatching(/^0$/),
        },
      },
    ]);
  });
});