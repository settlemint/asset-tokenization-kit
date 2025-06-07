import { describe, expect, it } from "bun:test";
import { z } from "zod";
import {
  type AssetType,
  type AssetTypeArray,
  AssetTypeEnum,
  assetType,
  assetTypeArray,
  assetTypeRecord,
  assetTypeSet,
  assetTypeWithDefault,
  assetTypes,
  getAssetType,
  getAssetTypeArray,
  getAssetTypeSet,
  isAssetType,
  isAssetTypeArray,
  isAssetTypeSet,
} from "./asset-types";

describe("assetType", () => {
  const validator = assetType();

  describe("valid asset types", () => {
    it.each([...assetTypes])("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(getAssetType(type));
      expect(isAssetType(type)).toBe(true);
      expect(getAssetType(type)).toBe(getAssetType(type));
    });
  });

  describe("invalid asset types", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("stock")).toThrow();
      expect(() => validator.parse("")).toThrow();

      expect(isAssetType("invalid")).toBe(false);
      expect(isAssetType("stock")).toBe(false);
      expect(isAssetType("")).toBe(false);

      expect(() => getAssetType("invalid")).toThrow();
      expect(() => getAssetType("stock")).toThrow();
      expect(() => getAssetType("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isAssetType(123)).toBe(false);
      expect(isAssetType(null)).toBe(false);
      expect(isAssetType(undefined)).toBe(false);
      expect(isAssetType({})).toBe(false);

      expect(() => getAssetType(123)).toThrow("Expected 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin' | 'deposit', received number");
      expect(() => getAssetType(null)).toThrow("Expected 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin' | 'deposit', received null");
      expect(() => getAssetType(undefined)).toThrow("Required");
      expect(() => getAssetType({})).toThrow("Expected 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin' | 'deposit', received object");
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Bond")).toThrow();
      expect(() => validator.parse("EQUITY")).toThrow();
      expect(() => validator.parse("StableCoin")).toThrow();

      expect(isAssetType("Bond")).toBe(false);
      expect(isAssetType("EQUITY")).toBe(false);
      expect(isAssetType("StableCoin")).toBe(false);

      expect(() => getAssetType("Bond")).toThrow();
      expect(() => getAssetType("EQUITY")).toThrow();
      expect(() => getAssetType("StableCoin")).toThrow();
    });
  });
});

describe("AssetTypeEnum", () => {
  it("should have all asset types", () => {
    expect(AssetTypeEnum.bond).toBe("bond");
    expect(AssetTypeEnum.cryptocurrency).toBe("cryptocurrency");
    expect(AssetTypeEnum.equity).toBe("equity");
    expect(AssetTypeEnum.fund).toBe("fund");
    expect(AssetTypeEnum.stablecoin).toBe("stablecoin");
    expect(AssetTypeEnum.deposit).toBe("deposit");
  });

  it("should match assetTypes array", () => {
    const enumValues = Object.values(AssetTypeEnum);
    expect(enumValues).toEqual([...assetTypes]);
  });
});

describe("assetTypeArray", () => {
  const validator = assetTypeArray();

  it("should accept valid arrays", () => {
    const single = ["bond"];
    const multiple = ["bond", "equity", "fund"];
    const all = [...assetTypes];

    expect(validator.parse(single)).toEqual(getAssetTypeArray(single));
    expect(validator.parse(multiple)).toEqual(getAssetTypeArray(multiple));
    expect(validator.parse(all)).toEqual(getAssetTypeArray(all));

    expect(isAssetTypeArray(single)).toBe(true);
    expect(isAssetTypeArray(multiple)).toBe(true);
    expect(isAssetTypeArray(all)).toBe(true);

    expect(getAssetTypeArray(single)).toEqual(getAssetTypeArray(single));
    expect(getAssetTypeArray(multiple)).toEqual(getAssetTypeArray(multiple));
    expect(getAssetTypeArray(all)).toEqual(getAssetTypeArray(all));
  });

  it("should allow duplicates", () => {
    const duplicates = ["bond", "bond"];
    expect(validator.parse(duplicates)).toEqual(getAssetTypeArray(duplicates));
    expect(isAssetTypeArray(duplicates)).toBe(true);
    expect(getAssetTypeArray(duplicates)).toEqual(
      getAssetTypeArray(duplicates)
    );
  });

  it("should reject empty arrays", () => {
    expect(() => validator.parse([])).toThrow(
      "At least one asset type must be selected"
    );
    expect(isAssetTypeArray([])).toBe(false);
    expect(() => getAssetTypeArray([])).toThrow("At least one asset type must be selected");
  });

  it("should reject invalid asset types in array", () => {
    expect(() => validator.parse(["bond", "invalid"])).toThrow();
    expect(isAssetTypeArray(["bond", "invalid"])).toBe(false);
    expect(() => getAssetTypeArray(["bond", "invalid"])).toThrow();
  });

  it("should reject non-array types", () => {
    expect(isAssetTypeArray("bond")).toBe(false);
    expect(isAssetTypeArray(123)).toBe(false);
    expect(isAssetTypeArray(null)).toBe(false);
    expect(isAssetTypeArray(undefined)).toBe(false);

    expect(() => getAssetTypeArray("bond")).toThrow("Expected array, received string");
    expect(() => getAssetTypeArray(123)).toThrow("Expected array, received number");
    expect(() => getAssetTypeArray(null)).toThrow("Expected array, received null");
    expect(() => getAssetTypeArray(undefined)).toThrow("Required");
  });
});

describe("assetTypeSet", () => {
  const validator = assetTypeSet();

  it("should accept valid sets", () => {
    const testSet = new Set(["bond", "equity"]);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has("bond" as AssetType)).toBe(true);
    expect(result.has("equity" as AssetType)).toBe(true);

    expect(isAssetTypeSet(testSet)).toBe(true);
    const getResult = getAssetTypeSet(testSet);
    expect(getResult).toBeInstanceOf(Set);
    expect(getResult.size).toBe(2);
  });

  it("should deduplicate values", () => {
    const testSet = new Set(["bond", "bond", "equity"]);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);

    expect(isAssetTypeSet(testSet)).toBe(true);
    expect(getAssetTypeSet(testSet).size).toBe(2);
  });

  it("should reject empty sets", () => {
    const emptySet = new Set();
    expect(() => validator.parse(emptySet)).toThrow(
      "At least one asset type must be selected"
    );
    expect(isAssetTypeSet(emptySet)).toBe(false);
    expect(() => getAssetTypeSet(emptySet)).toThrow("At least one asset type must be selected");
  });

  it("should reject sets with invalid values", () => {
    const invalidSet = new Set(["bond", "invalid"]);
    expect(() => validator.parse(invalidSet)).toThrow();
    expect(isAssetTypeSet(invalidSet)).toBe(false);
    expect(() => getAssetTypeSet(invalidSet)).toThrow();
  });

  it("should reject non-set types", () => {
    expect(isAssetTypeSet(["bond"])).toBe(false);
    expect(isAssetTypeSet("bond")).toBe(false);
    expect(isAssetTypeSet(123)).toBe(false);
    expect(isAssetTypeSet(null)).toBe(false);

    expect(() => getAssetTypeSet(["bond"])).toThrow("Expected set, received array");
    expect(() => getAssetTypeSet("bond")).toThrow("Expected set, received string");
    expect(() => getAssetTypeSet(123)).toThrow("Expected set, received number");
    expect(() => getAssetTypeSet(null)).toThrow("Expected set, received null");
  });
});

describe("assetTypeWithDefault", () => {
  it("should use provided default", () => {
    const defaultType = assetType().parse("equity");
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse(undefined)).toBe("equity" as AssetType);
  });

  it("should use 'bond' as default when not specified", () => {
    const validator = assetTypeWithDefault();
    expect(validator.parse(undefined)).toBe("bond" as AssetType);
  });

  it("should accept valid values", () => {
    const defaultType = assetType().parse("equity");
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse("fund")).toBe("fund" as AssetType);
  });
});

describe("assetTypeRecord", () => {
  it("should validate record with string values", () => {
    const validator = assetTypeRecord(z.string());
    const result = validator.parse({
      bond: "Government Bond",
      equity: "Common Stock",
    });
    expect(result.bond).toBe("Government Bond");
    expect(result.equity).toBe("Common Stock");
  });

  it("should validate record with number values", () => {
    const validator = assetTypeRecord(z.number());
    const result = validator.parse({
      bond: 100,
      equity: 200,
      fund: 300,
    });
    expect(result.bond).toBe(100);
    expect(result.equity).toBe(200);
    expect(result.fund).toBe(300);
  });

  it("should reject invalid keys", () => {
    const validator = assetTypeRecord(z.string());
    expect(() =>
      validator.parse({
        bond: "Valid",
        invalid: "Invalid key",
      })
    ).toThrow();
  });

  it("should validate empty records", () => {
    const validator = assetTypeRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });
});

describe("helper functions", () => {
  it("isAssetType should work as type guard", () => {
    const value: unknown = "bond";
    if (isAssetType(value)) {
      // TypeScript should recognize value as AssetType here
      const _typeCheck:
        | "bond"
        | "cryptocurrency"
        | "equity"
        | "fund"
        | "stablecoin"
        | "deposit" = value;
    }
  });

  it("getAssetType should return typed value", () => {
    const result = getAssetType("equity");
    // TypeScript should recognize result as AssetType
    const _typeCheck:
      | "bond"
      | "cryptocurrency"
      | "equity"
      | "fund"
      | "stablecoin"
      | "deposit" = result;
    expect(result).toBe(getAssetType("equity"));
  });

  it("isAssetTypeArray should work as type guard", () => {
    const value: unknown = ["bond", "equity"];
    if (isAssetTypeArray(value)) {
      // TypeScript should recognize value as AssetTypeArray here
      const _typeCheck: (
        | "bond"
        | "cryptocurrency"
        | "equity"
        | "fund"
        | "stablecoin"
        | "deposit"
      )[] = value;
    }
  });

  it("getAssetTypeArray should return typed value", () => {
    const result = getAssetTypeArray(["fund", "deposit"]);
    // TypeScript should recognize result as AssetTypeArray
    const _typeCheck: (
      | "bond"
      | "cryptocurrency"
      | "equity"
      | "fund"
      | "stablecoin"
      | "deposit"
    )[] = result;
    expect(result).toEqual(["fund", "deposit"] as AssetTypeArray);
  });

  it("isAssetTypeSet should work as type guard", () => {
    const value: unknown = new Set(["bond", "equity"]);
    if (isAssetTypeSet(value)) {
      // TypeScript should recognize value as AssetTypeSet here
      const _typeCheck: Set<
        "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin" | "deposit"
      > = value;
    }
  });

  it("getAssetTypeSet should return typed value", () => {
    const result = getAssetTypeSet(new Set(["stablecoin", "cryptocurrency"]));
    // TypeScript should recognize result as AssetTypeSet
    const _typeCheck: Set<
      "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin" | "deposit"
    > = result;
    expect(result.has("stablecoin" as AssetType)).toBe(true);
    expect(result.has("cryptocurrency" as AssetType)).toBe(true);
  });
});
