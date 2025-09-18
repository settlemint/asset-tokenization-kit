import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

const SYSTEM_ADDONS = [
  {
    typeId: "ATKFixedYieldScheduleFactory",
    name: "fixed-yield-schedule-factory",
  },
  {
    typeId: "ATKPushAirdropFactory",
    name: "push-airdrop-factory",
  },
  {
    typeId: "ATKTimeBoundAirdropFactory",
    name: "timeBound-airdrop-factory",
  },
  {
    typeId: "ATKVestingAirdropFactory",
    name: "vesting-airdrop-factory",
  },
  {
    typeId: "ATKXvPSettlementFactory",
    name: "xvp-settlement-factory",
  },
];

describe("System Addons", () => {
  it("should fetch a list of all system addons", async () => {
    const query = theGraphGraphql(
      `query {
        systemAddons(orderBy: name) {
          typeId
          name
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.systemAddons.length).toBe(5);
    expect(response.systemAddons).toEqual(SYSTEM_ADDONS);
  });

  it("should fetch a list of all system addons for a system", async () => {
    const query = theGraphGraphql(
      `query {
        systems {
          systemAddonRegistry {
            id
            systemAddons(orderBy: name) {
              typeId
              name
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);
    expect(response.systems.length).toBe(1);
    expect(response.systems[0]?.systemAddonRegistry?.systemAddons.length).toBe(
      5
    );
    expect(response.systems).toEqual([
      {
        systemAddonRegistry: {
          id: expect.any(String),
          systemAddons: SYSTEM_ADDONS,
        },
      },
    ]);
  });
});
