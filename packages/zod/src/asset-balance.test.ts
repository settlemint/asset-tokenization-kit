/**
 * @fileoverview Test suite for asset balance validation utilities
 */
import { test, expect, describe } from "bun:test";
import {
  assetBalance,
  assetBalanceAccount,
  isAssetBalance,
  getAssetBalance,
  type AssetBalance,
  type AssetBalanceAccount,
} from "./asset-balance";

describe("assetBalanceAccount", () => {
  test("validates valid Ethereum address", () => {
    const validAccount = {
      id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234",
    };

    expect(() => assetBalanceAccount().parse(validAccount)).not.toThrow();

    const result = assetBalanceAccount().parse(validAccount);
    expect(result.id).toBe("0x742d35CC6635C0532925A3b8d61d78f51B5c1234");
  });

  test("rejects invalid Ethereum address", () => {
    const invalidAccount = {
      id: "invalid-address",
    };

    expect(() => assetBalanceAccount().parse(invalidAccount)).toThrow();
  });

  test("rejects missing id field", () => {
    const invalidAccount = {};

    expect(() => assetBalanceAccount().parse(invalidAccount)).toThrow();
  });
});

describe("assetBalance", () => {
  const validBalanceData = {
    account: {
      id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234",
    },
    available: [1000n, 18] as const,
    frozen: [500n, 18] as const,
    isFrozen: false,
    value: [1500n, 18] as const,
    lastUpdatedAt: new Date("2024-01-15T10:30:00Z"),
  };

  test("validates complete balance data with timestamp", () => {
    expect(() => assetBalance().parse(validBalanceData)).not.toThrow();

    const result = assetBalance().parse(validBalanceData);
    expect(result.account.id).toBe(
      "0x742d35CC6635C0532925A3b8d61d78f51B5c1234"
    );
    expect(result.available).toEqual([1000n, 18]);
    expect(result.frozen).toEqual([500n, 18]);
    expect(result.isFrozen).toBe(false);
    expect(result.value).toEqual([1500n, 18]);
    expect(result.lastUpdatedAt).toBeInstanceOf(Date);
    expect(result.lastUpdatedAt.toISOString()).toBe("2024-01-15T10:30:00.000Z");
  });

  test("validates frozen balance scenario", () => {
    const frozenBalance = {
      ...validBalanceData,
      isFrozen: true,
    };

    expect(() => assetBalance().parse(frozenBalance)).not.toThrow();

    const result = assetBalance().parse(frozenBalance);
    expect(result.isFrozen).toBe(true);
  });

  test("rejects invalid account structure", () => {
    const invalidBalance = {
      ...validBalanceData,
      account: {
        id: "invalid-address",
      },
    };

    expect(() => assetBalance().parse(invalidBalance)).toThrow();
  });

  test("rejects invalid bigDecimal values", () => {
    const invalidBalance = {
      ...validBalanceData,
      available: "invalid-decimal",
    };

    expect(() => assetBalance().parse(invalidBalance)).toThrow();
  });

  test("rejects non-boolean isFrozen", () => {
    const invalidBalance = {
      ...validBalanceData,
      isFrozen: "false",
    };

    expect(() => assetBalance().parse(invalidBalance)).toThrow();
  });

  test("rejects missing required fields", () => {
    const incompleteBalance = {
      account: validBalanceData.account,
      available: validBalanceData.available,
      // Missing frozen, isFrozen, value, lastUpdatedAt
    };

    expect(() => assetBalance().parse(incompleteBalance)).toThrow();
  });

  test("rejects invalid timestamp", () => {
    const invalidTimestampBalance = {
      ...validBalanceData,
      lastUpdatedAt: "invalid-date",
    };

    expect(() => assetBalance().parse(invalidTimestampBalance)).toThrow();
  });

  test("rejects missing timestamp", () => {
    const missingTimestampBalance = {
      account: validBalanceData.account,
      available: validBalanceData.available,
      frozen: validBalanceData.frozen,
      isFrozen: validBalanceData.isFrozen,
      value: validBalanceData.value,
      // Missing lastUpdatedAt
    };

    expect(() => assetBalance().parse(missingTimestampBalance)).toThrow();
  });
});

describe("type guards", () => {
  const validBalance = {
    account: {
      id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234",
    },
    available: [1000n, 18] as const,
    frozen: [500n, 18] as const,
    isFrozen: false,
    value: [1500n, 18] as const,
    lastUpdatedAt: new Date("2024-01-15T10:30:00Z"),
  };

  test("isAssetBalance returns true for valid balance", () => {
    expect(isAssetBalance(validBalance)).toBe(true);
  });

  test("isAssetBalance returns false for invalid data", () => {
    expect(isAssetBalance("invalid")).toBe(false);
    expect(isAssetBalance(null)).toBe(false);
    expect(isAssetBalance({})).toBe(false);
  });

  test("isAssetBalance returns false for balance without timestamp", () => {
    const balanceWithoutTimestamp = {
      account: validBalance.account,
      available: validBalance.available,
      frozen: validBalance.frozen,
      isFrozen: validBalance.isFrozen,
      value: validBalance.value,
    };
    expect(isAssetBalance(balanceWithoutTimestamp)).toBe(false);
  });
});

describe("parsing functions", () => {
  const validBalance = {
    account: {
      id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234",
    },
    available: [1000n, 18] as const,
    frozen: [500n, 18] as const,
    isFrozen: false,
    value: [1500n, 18] as const,
    lastUpdatedAt: new Date("2024-01-15T10:30:00Z"),
  };

  test("getAssetBalance parses valid balance", () => {
    const result = getAssetBalance(validBalance);
    expect(result.account.id).toBe(
      "0x742d35CC6635C0532925A3b8d61d78f51B5c1234"
    );
    expect(result.available).toEqual([1000n, 18]);
    expect(result.lastUpdatedAt).toBeInstanceOf(Date);
  });

  test("getAssetBalance throws on invalid data", () => {
    expect(() => getAssetBalance("invalid")).toThrow();
    expect(() => getAssetBalance({})).toThrow();
  });

  test("getAssetBalance throws on missing timestamp", () => {
    const balanceWithoutTimestamp = {
      account: validBalance.account,
      available: validBalance.available,
      frozen: validBalance.frozen,
      isFrozen: validBalance.isFrozen,
      value: validBalance.value,
    };
    expect(() => getAssetBalance(balanceWithoutTimestamp)).toThrow();
  });
});

describe("type inference", () => {
  test("AssetBalanceAccount type is correctly inferred", () => {
    const account: AssetBalanceAccount = {
      id: "0x742d35CC6635C0532925A3b8d61d78f51B5c1234",
    };

    // TypeScript compilation check - this should not cause type errors
    expect(account.id).toBeDefined();
  });

  test("AssetBalance type is correctly inferred", () => {
    const balance: AssetBalance = {
      account: {
        id: "0x742d35CC6635C0532925A3b8d61d78f51B5c1234",
      },
      available: [1000n, 18],
      frozen: [500n, 18],
      isFrozen: false,
      value: [1500n, 18],
      lastUpdatedAt: new Date("2024-01-15T10:30:00Z"),
    };

    // TypeScript compilation check - this should not cause type errors
    expect(balance.account.id).toBeDefined();
    expect(balance.available).toBeDefined();
    expect(balance.frozen).toBeDefined();
    expect(balance.isFrozen).toBeDefined();
    expect(balance.value).toBeDefined();
    expect(balance.lastUpdatedAt).toBeInstanceOf(Date);
  });
});
