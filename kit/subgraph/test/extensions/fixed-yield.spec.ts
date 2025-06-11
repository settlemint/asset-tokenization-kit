import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Fixed yield", () => {
  it("should fetch a list of all fixed yield tokens", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          totalSupply
          totalSupplyExact
          yield_ {
            schedule {
              startDate
              endDate
              currentPeriod {
                startDate
                endDate
              }
              nextPeriod {
                startDate
                endDate
              }
              totalYield
              totalClaimed
              totalUnclaimedYield
              periods(orderBy: startDate) {
                startDate
                endDate
                totalYield
                totalClaimed
                totalUnclaimedYield
              }
              underlyingAsset {
                name
              }
              underlyingAssetBalanceAvailable
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        yield__not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: "Euro Bonds",
        type: "bond",
        totalSupply: "117",
        totalSupplyExact: "117000000",
        yield_: {
          schedule: {
            startDate: expect.any(String),
            endDate: expect.any(String),
            currentPeriod: {
              startDate: expect.any(String),
              endDate: expect.any(String),
            },
            nextPeriod: null,
            totalYield: "359.775",
            totalClaimed: "184.5",
            totalUnclaimedYield: "31.365",
            periods: [
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "71.955",
                totalClaimed: "67.035",
                totalUnclaimedYield: "4.92",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "71.955",
                totalClaimed: "61.5",
                totalUnclaimedYield: "10.455",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "71.955",
                totalClaimed: "55.965",
                totalUnclaimedYield: "15.99",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "71.955",
                totalClaimed: "0",
                totalUnclaimedYield: "0",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "71.955",
                totalClaimed: "0",
                totalUnclaimedYield: "0",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "0",
                totalClaimed: "0",
                totalUnclaimedYield: "0",
              },
              {
                startDate: expect.any(String),
                endDate: expect.any(String),
                totalYield: "0",
                totalClaimed: "0",
                totalUnclaimedYield: "0",
              },
            ],
            underlyingAsset: {
              name: "Euro Deposits",
            },
            underlyingAssetBalanceAvailable: "9810.5",
          },
        },
      },
    ]);

    // the first period should start at the same time as the schedule
    for (const token of response.tokens) {
      expect(token.yield_?.schedule.startDate).toBe(
        token.yield_?.schedule.periods[0]?.startDate ?? "0"
      );
    }

    // the last period should end at the same time as the schedule
    for (const token of response.tokens) {
      const periods = token.yield_?.schedule.periods ?? [];
      expect(token.yield_?.schedule.endDate).toBe(
        periods[periods.length - 1]?.endDate
      );
    }

    // there should be no periods which have overlapping dates
    for (const token of response.tokens) {
      const periods = token.yield_?.schedule.periods ?? [];
      for (const period1 of periods) {
        for (const period2 of periods) {
          if (period1 === period2) continue;
          expect(
            !(
              period1.startDate < period2.endDate &&
              period1.endDate > period2.startDate
            )
          ).toBe(true);
        }
      }
    }

    // Total yield should be the sum of all periods
    for (const token of response.tokens) {
      const periods = token.yield_?.schedule.periods ?? [];
      let totalYieldPeriods = 0;
      for (const period of periods) {
        totalYieldPeriods += Number(period.totalYield);
      }
      expect(totalYieldPeriods.toFixed(3)).toBe(
        Number(token.yield_?.schedule.totalYield ?? "0").toFixed(3)
      );
    }

    // Total claimed should be the sum of all periods
    for (const token of response.tokens) {
      const periods = token.yield_?.schedule.periods ?? [];
      let totalClaimedPeriods = 0;
      for (const period of periods) {
        totalClaimedPeriods += Number(period.totalClaimed);
      }
      expect(totalClaimedPeriods.toFixed(3)).toBe(
        Number(token.yield_?.schedule.totalClaimed ?? "0").toFixed(3)
      );
    }

    // Total unclaimed yield should be the sum of all periods
    for (const token of response.tokens) {
      const periods = token.yield_?.schedule.periods ?? [];
      let totalUnclaimedYieldPeriods = 0;
      for (const period of periods) {
        totalUnclaimedYieldPeriods += Number(period.totalUnclaimedYield);
      }
      expect(totalUnclaimedYieldPeriods.toFixed(3)).toBe(
        Number(token.yield_?.schedule.totalUnclaimedYield ?? "0").toFixed(3)
      );
    }
  });

  it("underlying asset balance should match with the balance of the account for the scheduler contract", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokenFixedYieldSchedules {
          id
          token {
            id
            name
          }
          account {
            balances {
              token {
                id
                name
              }
              value
            }
          }
        }
        tokens(where: $where, orderBy: name) {
          id
          name
          type
          yield_ {
            schedule {
              id
              underlyingAsset {
                id
                name
              }
              underlyingAssetBalanceAvailable
            }
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        yield__not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        id: expect.any(String),
        name: "Euro Bonds",
        type: "bond",
        yield_: {
          schedule: {
            id: expect.any(String),
            underlyingAsset: {
              id: expect.any(String),
              name: "Euro Deposits",
            },
            underlyingAssetBalanceAvailable: "9810.5",
          },
        },
      },
    ]);
    expect(response.tokenFixedYieldSchedules.length).toBe(1);
    expect(response.tokenFixedYieldSchedules).toEqual([
      {
        id: expect.any(String),
        token: {
          id: expect.any(String),
          name: "Euro Bonds",
        },
        account: {
          balances: [
            {
              token: {
                id: expect.any(String),
                name: "Euro Deposits",
              },
              value: "9810.5",
            },
          ],
        },
      },
    ]);
    for (const token of response.tokens) {
      const fixedYieldSchedule = response.tokenFixedYieldSchedules.find(
        (schedule) => schedule.id === token.yield_?.schedule.id
      );
      expect(fixedYieldSchedule).toBeDefined();
      expect(fixedYieldSchedule?.token.id).toBe(token.id);
      // Balance should be equal to the underlying asset balance available
      const balance =
        fixedYieldSchedule?.account.balances.find(
          (balance) =>
            balance.token.id === token.yield_?.schedule.underlyingAsset?.id
        )?.value ?? "0";
      expect(balance).toBe(
        token.yield_?.schedule.underlyingAssetBalanceAvailable ?? "0"
      );
    }
  });
});
