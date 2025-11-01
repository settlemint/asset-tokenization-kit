import { getOrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("System value history (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);
  });

  describe("systemValueHistoryByPreset", () => {
    it("should successfully retrieve system value history with trailing24Hours preset", async () => {
      const result = await adminClient.system.stats.systemValueHistoryByPreset({
        preset: "trailing24Hours",
      });

      expect(result).toBeDefined();
      expect(result.range).toBeDefined();
      expect(result.range.from).toBeInstanceOf(Date);
      expect(result.range.to).toBeInstanceOf(Date);
      expect(result.range.interval).toBe("hour");
      expect(result.range.isPreset).toBe(true);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);

      const lastDataPoint = result.data.at(-1);
      expect(lastDataPoint).toBeDefined();
      expect(lastDataPoint?.timestamp).toBeInstanceOf(Date);

      expect(lastDataPoint?.totalValueInBaseCurrency).toBeDefined();
      expect(lastDataPoint?.totalValueInBaseCurrency).toBeGreaterThanOrEqual(0);
    });

    it("should successfully retrieve system value history with trailing7Days preset", async () => {
      const result = await adminClient.system.stats.systemValueHistoryByPreset({
        preset: "trailing7Days",
      });

      expect(result).toBeDefined();
      expect(result.range).toBeDefined();
      expect(result.range.from).toBeInstanceOf(Date);
      expect(result.range.to).toBeInstanceOf(Date);
      expect(result.range.interval).toBe("day");
      expect(result.range.isPreset).toBe(true);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);

      // Verify string-to-number conversion across all data points
      for (const dataPoint of result.data) {
        expect(dataPoint.timestamp).toBeInstanceOf(Date);
        expect(dataPoint.totalValueInBaseCurrency).toBeDefined();
        expect(typeof dataPoint.totalValueInBaseCurrency).toBe("number");
      }
    });
  });

  describe("systemValueHistoryByRange", () => {
    it("should successfully retrieve system value history with custom range", async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const result = await adminClient.system.stats.systemValueHistoryByRange({
        from: oneDayAgo,
        to: now,
        interval: "hour",
      });

      expect(result).toBeDefined();
      expect(result.range).toBeDefined();
      expect(result.range.from).toBeInstanceOf(Date);
      expect(result.range.to).toBeInstanceOf(Date);
      expect(result.range.interval).toBe("hour");
      expect(result.range.isPreset).toBe(false);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);

      const lastDataPoint = result.data.at(-1);
      expect(lastDataPoint).toBeDefined();
      expect(lastDataPoint?.timestamp).toBeInstanceOf(Date);
      expect(lastDataPoint?.totalValueInBaseCurrency).toBeGreaterThanOrEqual(0);
    });

    it("should handle day interval correctly", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const result = await adminClient.system.stats.systemValueHistoryByRange({
        from: sevenDaysAgo,
        to: now,
        interval: "day",
      });

      expect(result).toBeDefined();
      expect(result.range.interval).toBe("day");
      expect(result.data).toBeInstanceOf(Array);

      // @why 7-9 points: Accounts for baseline + 7 days + current, with tolerance for UTC boundaries
      expect(result.data.length).toBeGreaterThanOrEqual(7);
      expect(result.data.length).toBeLessThanOrEqual(9);

      // Assert timestamps are chronologically ordered
      for (let i = 1; i < result.data.length; i++) {
        const prevTimestamp = result.data[i - 1]?.timestamp;
        const currTimestamp = result.data[i]?.timestamp;
        expect(currTimestamp).toBeDefined();
        expect(prevTimestamp).toBeDefined();
        expect(currTimestamp!.getTime()).toBeGreaterThan(
          prevTimestamp!.getTime()
        );
      }
    });
  });

  describe("value consistency", () => {
    it("should have consistent total value between last data point and current state", async () => {
      const historyResult =
        await adminClient.system.stats.systemValueHistoryByPreset({
          preset: "trailing24Hours",
        });

      const valueResult = await adminClient.system.stats.value();

      const lastHistoricalValue =
        historyResult.data.at(-1)?.totalValueInBaseCurrency;
      const currentValue = Number(valueResult.totalValue);

      // @why 1% tolerance: Allows for race conditions and floating point precision differences
      expect(lastHistoricalValue).toBeDefined();
      expect(Math.abs(lastHistoricalValue! - currentValue)).toBeLessThanOrEqual(
        currentValue * 0.01
      );
    });
  });
});
