import { describe, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { getAssetTypePlural, useAssetTypePlural } from "./asset-pluralization";

// Create mock functions using vi.hoisted
const mocks = vi.hoisted(() => {
  return {
    t: vi.fn((key: string, options?: { count?: number }) => {
      // Simulate i18next pluralization behavior
      if (options?.count === 1) {
        return key.toLowerCase().slice(0, -1); // Remove 's' for singular
      }
      return key.toLowerCase();
    }),
  };
});

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mocks.t,
    i18n: {},
    ready: true,
  }),
}));

describe("getAssetTypePlural", () => {
  const mockT = vi.fn((key, options) => {
    // Mock translation behavior
    if (key === "Bonds") {
      return options?.count === 1 ? "bond" : "bonds";
    }
    if (key === "Equities") {
      return options?.count === 1 ? "equity" : "equities";
    }
    if (key === "Funds") {
      return options?.count === 1 ? "fund" : "funds";
    }
    if (key === "Stablecoins") {
      return options?.count === 1 ? "stablecoin" : "stablecoins";
    }
    if (key === "Deposits") {
      return options?.count === 1 ? "deposit" : "deposits";
    }
    // Return key if no translation found
    return key;
  });

  test("returns singular form for count of 1", () => {
    expect(getAssetTypePlural(mockT, "bond", 1)).toBe("bond");
    expect(getAssetTypePlural(mockT, "equity", 1)).toBe("equity");
    expect(getAssetTypePlural(mockT, "fund", 1)).toBe("fund");
    expect(getAssetTypePlural(mockT, "stablecoin", 1)).toBe("stablecoin");
    expect(getAssetTypePlural(mockT, "deposit", 1)).toBe("deposit");
  });

  test("returns plural form for count greater than 1", () => {
    expect(getAssetTypePlural(mockT, "bond", 2)).toBe("bonds");
    expect(getAssetTypePlural(mockT, "equity", 5)).toBe("equities");
    expect(getAssetTypePlural(mockT, "fund", 10)).toBe("funds");
    expect(getAssetTypePlural(mockT, "stablecoin", 3)).toBe("stablecoins");
    expect(getAssetTypePlural(mockT, "deposit", 100)).toBe("deposits");
  });

  test("returns plural form for count of 0", () => {
    expect(getAssetTypePlural(mockT, "bond", 0)).toBe("bonds");
    expect(getAssetTypePlural(mockT, "equity", 0)).toBe("equities");
  });

  test("falls back to basic pluralization for unknown asset types", () => {
    expect(getAssetTypePlural(mockT, "unknown", 1)).toBe("unknown");
    expect(getAssetTypePlural(mockT, "unknown", 2)).toBe("unknowns");
    expect(getAssetTypePlural(mockT, "custom", 0)).toBe("customs");
  });

  test("falls back to basic pluralization when translation returns the key", () => {
    const mockTReturnKey = vi.fn((key) => key); // Return the key itself
    expect(getAssetTypePlural(mockTReturnKey, "bond", 1)).toBe("bond");
    expect(getAssetTypePlural(mockTReturnKey, "bond", 2)).toBe("bonds");
  });

  test("calls translation function with correct parameters", () => {
    mockT.mockClear();
    getAssetTypePlural(mockT, "bond", 5);
    expect(mockT).toHaveBeenCalledWith("Bonds", { count: 5 });
  });
});

describe("useAssetTypePlural", () => {
  test("returns a function that pluralizes asset types", () => {
    const { result } = renderHook(() => useAssetTypePlural());
    const pluralize = result.current;

    expect(typeof pluralize).toBe("function");
    // The mock will return lowercase versions based on our mock implementation
    expect(pluralize("bond", 1)).toBe("bond");
    expect(pluralize("bond", 2)).toBe("bonds");
  });

  test("handles different asset types correctly", () => {
    const { result } = renderHook(() => useAssetTypePlural());
    const pluralize = result.current;

    expect(pluralize("equity", 1)).toBe("equitie");
    expect(pluralize("fund", 3)).toBe("funds");
    expect(pluralize("stablecoin", 1)).toBe("stablecoin");
    expect(pluralize("deposit", 0)).toBe("deposits");
  });
});
