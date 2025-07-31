import { getOrpcClient } from "test/utils/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "test/utils/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("system stats ORPC routes", () => {
  let client: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);
  });

  it("should fetch system assets stats", async () => {
    const result = await client.system.statsAssets({});
    expect(result).toEqual({
      totalAssets: expect.any(Number),
      assetBreakdown: {
        bond: expect.any(Number),
        equity: expect.any(Number),
        fund: expect.any(Number),
        stablecoin: expect.any(Number),
        deposit: expect.any(Number),
      },
    });
  });

  it("should fetch system transaction count stats", async () => {
    const result = await client.system.statsTransactionCount({
      timeRange: 5,
    });
    expect(result).toEqual({
      recentTransactions: expect.any(Number),
      timeRangeDays: 5,
      totalTransactions: expect.any(Number),
    });
  });

  it("should fetch system transaction history stats", async () => {
    const result = await client.system.statsTransactionHistory({
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
    const result = await client.system.statsValue({});
    expect(result).toEqual({
      totalValue: expect.any(String),
    });
  });
});
