import { getOrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "@test/fixtures/user";
import { subDays } from "date-fns";
import { isDnum } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("system stats ORPC routes", () => {
  let client: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);
  });

  it("should fetch system assets stats", async () => {
    const result = await client.system.stats.assets({});
    expect(result.totalAssets).toEqual(expect.any(Number));
    expect(result.assetBreakdown).toEqual({
      bond: expect.any(Number),
      equity: expect.any(Number),
      fund: expect.any(Number),
      stablecoin: expect.any(Number),
      deposit: expect.any(Number),
    });
    expect(isDnum(result.totalValue)).toBe(true);
    expect(isDnum(result.valueBreakdown.bond)).toBe(true);
    expect(isDnum(result.valueBreakdown.equity)).toBe(true);
    expect(isDnum(result.valueBreakdown.fund)).toBe(true);
    expect(isDnum(result.valueBreakdown.stablecoin)).toBe(true);
    expect(isDnum(result.valueBreakdown.deposit)).toBe(true);
    expect(result.tokensCreatedCount).toEqual(expect.any(Number));
    expect(result.tokensLaunchedCount).toEqual(expect.any(Number));
    expect(result.pendingLaunchesCount).toEqual(expect.any(Number));
  });

  it("should fetch system asset lifecycle stats", async () => {
    const result = await client.system.stats.assetLifecycle({
      from: subDays(new Date(), 30),
      to: new Date(),
      interval: "day",
    });
    expect(result).toEqual({
      data: expect.any(Array),
      range: {
        from: expect.any(Date),
        to: expect.any(Date),
        interval: "day",
        isPreset: false,
      },
    });
  });

  it("should fetch system transaction count stats", async () => {
    const result = await client.system.stats.transactionCount({
      timeRange: 5,
    });
    expect(result).toEqual({
      recentTransactions: expect.any(Number),
      timeRangeDays: 5,
      totalTransactions: expect.any(Number),
    });
  });

  it("should fetch system transaction history stats", async () => {
    const result = await client.system.stats.transactionHistory({
      timeRange: 20,
    });
    expect(result).toEqual({
      recentTransactions: expect.any(Number),
      timeRangeDays: 20,
      totalTransactions: expect.any(Number),
      transactionHistory: expect.any(Array),
    });
  });

  it("should fetch system value stats", async () => {
    const result = await client.system.stats.value({});
    expect(result).toEqual({
      totalValue: expect.any(String),
    });
  });
});
