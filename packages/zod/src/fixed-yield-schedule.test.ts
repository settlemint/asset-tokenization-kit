import { describe, expect, it } from "bun:test";
import { format, from } from "dnum";
import {
  fixedYieldSchedule,
  fixedYieldSchedulePeriod,
} from "./fixed-yield-schedule";

describe("fixedYieldSchedulePeriod", () => {
  const validator = fixedYieldSchedulePeriod();

  it("should accept valid period with string inputs", () => {
    const validPeriod = {
      id: "0x1234567890abcdef1234567890abcdef12345678",
      startDate: "1680354000",
      endDate: "1683032400",
      totalClaimed: "1000.5",
      totalUnclaimedYield: "500.25",
      totalYield: "1500.75",
    };

    const result = validator.parse(validPeriod);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(Array.isArray(result.totalClaimed)).toBe(true);
    expect(format(result.totalClaimed)).toBe("1,000.5");
  });

  it("should accept period with Date objects and Dnum values", () => {
    const validPeriod = {
      id: "0x1111111111111111111111111111111111111111",
      startDate: new Date("2023-01-01T00:00:00Z"),
      endDate: new Date("2023-02-01T00:00:00Z"),
      totalClaimed: from("999999999999999999999999999999.99"),
      totalUnclaimedYield: from("0"),
      totalYield: from("999999999999999999999999999999.99"),
    };

    const result = validator.parse(validPeriod);
    expect(result.totalClaimed).toEqual(validPeriod.totalClaimed);
    expect(format(result.totalYield, { digits: 30 }).replaceAll(",", "")).toBe(
      "999999999999999999999999999999.99"
    );
  });

  it("should reject invalid data", () => {
    expect(() => validator.parse({ id: "not-hex" })).toThrow();
    expect(() =>
      validator.parse({
        id: "0x1234567890abcdef1234567890abcdef12345678",
        startDate: "invalid-date",
        endDate: new Date(),
        totalClaimed: "1000",
        totalUnclaimedYield: "500",
        totalYield: "invalid-decimal",
      })
    ).toThrow();
  });
});

describe("fixedYieldSchedule", () => {
  const validator = fixedYieldSchedule();

  it("should accept complete valid schedule", () => {
    const validSchedule = {
      id: "0x1234567890abcdef1234567890abcdef12345678",
      startDate: "1680354000",
      endDate: "1711890000",
      rate: "500", // 5% in basis points
      interval: "2592000", // 30 days
      totalClaimed: "10000.50",
      totalUnclaimedYield: "5000.25",
      totalYield: "15000.75",
      denominationAsset: {
        id: "0x1111111111111111111111111111111111111111",
        decimals: 18,
        symbol: "USDC",
      },
      currentPeriod: {
        id: "0x2222222222222222222222222222222222222222",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "1000",
        totalUnclaimedYield: "500",
        totalYield: "1500",
      },
      nextPeriod: null,
      periods: [],
    };

    const result = validator.parse(validSchedule);

    // Check essential fields
    expect(result.id.toLowerCase()).toBe(validSchedule.id.toLowerCase());
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.rate).toBe("500");
    expect(result.denominationAsset.id.toLowerCase()).toBe(
      validSchedule.denominationAsset.id.toLowerCase()
    );

    // Check Dnum parsing
    expect(format(result.totalClaimed).replaceAll(",", "")).toBe("10000.5");
    expect(format(result.totalYield).replaceAll(",", "")).toBe("15000.75");

    // Check nullable fields
    expect(result.nextPeriod).toBeNull();
    expect(result.currentPeriod).not.toBeNull();
    expect(result.currentPeriod?.id).toBe(
      validSchedule.currentPeriod.id as `0x${string}`
    );
  });

  it("should accept schedule with multiple periods and different asset types", () => {
    const period1 = {
      id: "0xaaaa111111111111111111111111111111111111",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-02-01"),
      totalClaimed: "1000",
      totalUnclaimedYield: "500",
      totalYield: "1500",
    };

    const schedule = {
      id: "0x1234567890abcdef1234567890abcdef12345678",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2024-01-01"),
      rate: "1000", // 10%
      interval: "86400", // 1 day
      totalClaimed: "3000",
      totalUnclaimedYield: "1500",
      totalYield: "4500",
      denominationAsset: {
        id: "0x5555555555555555555555555555555555555555",
        decimals: 18,
        symbol: "WETH",
      },
      currentPeriod: null,
      nextPeriod: period1,
      periods: [period1],
    };

    const result = validator.parse(schedule);
    expect(result.periods).toHaveLength(1);
    expect(result.nextPeriod?.id).toBe(period1.id as `0x${string}`);
    expect(result.denominationAsset.id.toLowerCase()).toBe(
      "0x5555555555555555555555555555555555555555"
    );
  });

  it("should handle edge cases correctly", () => {
    // Test with zero values and minimal data
    const minimalSchedule = {
      id: "0x0000000000000000000000000000000000000000",
      startDate: new Date(0),
      endDate: new Date("2038-01-19T03:14:07Z"), // Unix timestamp limit
      rate: "0", // 0%
      interval: "1", // 1 second
      totalClaimed: "0",
      totalUnclaimedYield: "0.000000000000000001", // Very small decimal
      totalYield: "999999999999999999999999999999.999999999", // Very large decimal
      denominationAsset: {
        id: "0x2222222222222222222222222222222222222222",
        decimals: 18,
        symbol: "USDC",
      },
      currentPeriod: null,
      nextPeriod: null,
      periods: [],
    };

    const result = validator.parse(minimalSchedule);
    expect(result.rate).toBe("0");
    expect(result.interval).toBe("1");
    expect(format(result.totalClaimed)).toBe("0");
    expect(format(result.totalYield, { digits: 30 }).replaceAll(",", "")).toBe(
      "999999999999999999999999999999.999999999"
    );
  });

  it("should reject invalid data with proper error handling", () => {
    // Invalid address
    expect(() =>
      validator.parse({
        id: "not-an-address",
      })
    ).toThrow();

    // Invalid rate type (partial object to trigger specific error)
    expect(() =>
      validator.parse({
        id: "0x1234567890abcdef1234567890abcdef12345678",
        startDate: new Date(),
        endDate: new Date(),
        rate: 500, // Should be string
        interval: "86400",
        totalClaimed: "0",
        totalUnclaimedYield: "0",
        totalYield: "0",
        denominationAsset: {
          id: "0x1111111111111111111111111111111111111111",
          decimals: 18,
          symbol: "USDC",
        },
        currentPeriod: null,
        nextPeriod: null,
        periods: [],
      })
    ).toThrow();

    // Invalid denominationAsset structure (missing required field)
    expect(() =>
      validator.parse({
        id: "0x1234567890abcdef1234567890abcdef12345678",
        startDate: new Date(),
        endDate: new Date(),
        rate: "500",
        interval: "86400",
        totalClaimed: "0",
        totalUnclaimedYield: "0",
        totalYield: "0",
        denominationAsset: {
          // Missing fields
        },
        currentPeriod: null,
        nextPeriod: null,
        periods: [],
      })
    ).toThrow();
  });

  it("should handle safeParse correctly", () => {
    const validData = {
      id: "0x1234567890abcdef1234567890abcdef12345678",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86_400_000),
      rate: "500",
      interval: "86400",
      totalClaimed: "0",
      totalUnclaimedYield: "0",
      totalYield: "0",
      denominationAsset: {
        id: "0x1111111111111111111111111111111111111111",
        decimals: 18,
        symbol: "USDC",
      },
      currentPeriod: null,
      nextPeriod: null,
      periods: [],
    };

    const validResult = validator.safeParse(validData);
    expect(validResult.success).toBe(true);

    const invalidResult = validator.safeParse({ id: "invalid" });
    expect(invalidResult.success).toBe(false);
  });

  it("should preserve precision in scientific notation and large numbers", () => {
    const schedule = {
      id: "0x1234567890abcdef1234567890abcdef12345678",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86_400_000),
      rate: "10000", // 100%
      interval: "31536000", // 1 year
      totalClaimed: "1.23e10", // Scientific notation
      totalUnclaimedYield: "0.000000000000000001", // Very small
      totalYield: "12345678901234567890123456789.123456789", // Very large with decimals
      denominationAsset: {
        id: "0x1111111111111111111111111111111111111111",
        decimals: 18,
        symbol: "USDC",
      },
      currentPeriod: null,
      nextPeriod: null,
      periods: [],
    };

    const result = validator.parse(schedule);
    expect(format(result.totalClaimed).replaceAll(",", "")).toBe("12300000000");
    expect(format(result.totalUnclaimedYield)).toBe("0.000000000000000001");
    expect(format(result.totalYield, { digits: 30 }).replaceAll(",", "")).toBe(
      "12345678901234567890123456789.123456789"
    );
  });
});
