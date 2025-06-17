import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Fixed yield", () => {
  it("should fetch a list of all fixed yield tokens", async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          createdAt
          createdBy { id }
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
        createdAt: expect.any(String),
        createdBy: { id: expect.any(String) },
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
});
