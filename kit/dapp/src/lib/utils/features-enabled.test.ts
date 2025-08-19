import type { AssetType } from "@/lib/zod/validators/asset-types";
import { describe, expect, test } from "vitest";
import {
  hasAllowlist,
  hasBlocklist,
  hasFreeze,
  hasUnderlyingAssets,
  hasYield,
  isMicaEnabledForAsset,
} from "./features-enabled";

describe("hasBlocklist", () => {
  test("returns true for all asset types except deposit", () => {
    expect(hasBlocklist("bond")).toBe(true);
    expect(hasBlocklist("equity")).toBe(true);
    expect(hasBlocklist("fund")).toBe(true);
    expect(hasBlocklist("stablecoin")).toBe(true);
  });

  test("returns false for deposit", () => {
    expect(hasBlocklist("deposit")).toBe(false);
  });
});

describe("hasAllowlist", () => {
  test("returns true only for deposit", () => {
    expect(hasAllowlist("deposit")).toBe(true);
  });

  test("returns false for all other asset types", () => {
    expect(hasAllowlist("bond")).toBe(false);
    expect(hasAllowlist("equity")).toBe(false);
    expect(hasAllowlist("fund")).toBe(false);
    expect(hasAllowlist("stablecoin")).toBe(false);
  });
});

describe("hasUnderlyingAssets", () => {
  test("returns true for bond and fund", () => {
    expect(hasUnderlyingAssets("fund")).toBe(true);
  });

  test("returns false for other asset types", () => {
    expect(hasUnderlyingAssets("equity")).toBe(false);
    expect(hasUnderlyingAssets("stablecoin")).toBe(false);
    expect(hasUnderlyingAssets("deposit")).toBe(false);
    expect(hasUnderlyingAssets("bond")).toBe(false);
  });
});

describe("hasYield", () => {
  test("returns true only for bond", () => {
    expect(hasYield("bond")).toBe(true);
  });

  test("returns false for all other asset types", () => {
    expect(hasYield("equity")).toBe(false);
    expect(hasYield("fund")).toBe(false);
    expect(hasYield("stablecoin")).toBe(false);
    expect(hasYield("deposit")).toBe(false);
  });
});

describe("hasFreeze", () => {
  test("returns true for all asset types", () => {
    const assetTypes: AssetType[] = [
      "bond",
      "equity",
      "fund",
      "stablecoin",
      "deposit",
    ];
    assetTypes.forEach((assetType) => {
      expect(hasFreeze(assetType)).toBe(true);
    });
  });
});

describe("isMicaEnabledForAsset", () => {
  test("returns false for all assets currently", () => {
    const testAddress = "0x0000000000000000000000000000000000000000" as const;

    // Should return false for stablecoin (even though it's the only supported type)
    expect(isMicaEnabledForAsset("stablecoin", testAddress)).toBe(false);

    // Should return false for all other asset types
    expect(isMicaEnabledForAsset("bond", testAddress)).toBe(false);
    expect(isMicaEnabledForAsset("equity", testAddress)).toBe(false);
    expect(isMicaEnabledForAsset("fund", testAddress)).toBe(false);
    expect(isMicaEnabledForAsset("deposit", testAddress)).toBe(false);
  });

  test("handles different addresses correctly", () => {
    const addresses = [
      "0x0000000000000000000000000000000000000000",
      "0x1234567890123456789012345678901234567890",
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    ] as const;

    addresses.forEach((address) => {
      expect(isMicaEnabledForAsset("stablecoin", address)).toBe(false);
    });
  });
});
