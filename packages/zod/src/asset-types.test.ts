import { describe, expect, test } from "bun:test";
import * as z from "zod";
import {
  type AssetFactoryTypeId,
  AssetFactoryTypeIdEnum,
  type AssetType,
  // type AssetClass, // Commenting out unused import
  AssetTypeEnum,
  assetClass,
  assetClasses,
  assetFactoryTypeId,
  assetFactoryTypeIdArray,
  assetFactoryTypeIdRecord,
  assetFactoryTypeIdSet,
  assetFactoryTypeIdWithDefault,
  assetFactoryTypeIds,
  assetType,
  assetTypeArray,
  assetTypeRecord,
  assetTypeSet,
  assetTypeWithDefault,
  assetTypes,
  getAssetClassFromFactoryTypeId,
  getAssetFactoryTypeId,
  getAssetFactoryTypeIdArray,
  getAssetFactoryTypeIdSet,
  getAssetType,
  getAssetTypeArray,
  getAssetTypeFromFactoryTypeId,
  getAssetTypeSet,
  getFactoryTypeIdFromAssetType,
  isAssetFactoryTypeId,
  isAssetFactoryTypeIdArray,
  isAssetFactoryTypeIdSet,
  isAssetType,
  isAssetTypeArray,
  isAssetTypeSet,
} from "./asset-types";

describe("assetType", () => {
  const validator = assetType();

  describe("valid asset types", () => {
    test.each([...assetTypes])("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(type);
    });
  });

  describe("invalid asset types", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("stock")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("Bond")).toThrow();
      expect(() => validator.parse("EQUITY")).toThrow();
      expect(() => validator.parse("StableCoin")).toThrow();
    });
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Type of financial asset");
  });
});

describe("AssetTypeEnum", () => {
  test("should have all asset types", () => {
    expect(AssetTypeEnum.bond).toBe("bond");
    expect(AssetTypeEnum.equity).toBe("equity");
    expect(AssetTypeEnum.fund).toBe("fund");
    expect(AssetTypeEnum.stablecoin).toBe("stablecoin");
    expect(AssetTypeEnum.deposit).toBe("deposit");
  });

  test("should match assetTypes array", () => {
    const enumValues = Object.values(AssetTypeEnum);
    expect(enumValues).toEqual([...assetTypes]);
  });
});

describe("assetTypeArray", () => {
  const validator = assetTypeArray();

  test("should accept valid arrays", () => {
    const single: AssetType[] = ["bond"];
    const multiple: AssetType[] = ["bond", "equity", "fund"];
    const all = [...assetTypes];

    expect(validator.parse(single)).toEqual(single);
    expect(validator.parse(multiple)).toEqual(multiple);
    expect(validator.parse(all)).toEqual(all);
  });

  test("should allow duplicates", () => {
    const duplicates: AssetType[] = ["bond", "bond"];
    expect(validator.parse(duplicates)).toEqual(duplicates);
  });

  test("should reject empty arrays", () => {
    expect(() => validator.parse([])).toThrow(
      "At least one asset type must be selected"
    );
  });

  test("should reject invalid asset types in array", () => {
    expect(() => validator.parse(["bond", "invalid"])).toThrow();
  });

  test("should reject non-array types", () => {
    expect(() => validator.parse("bond")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
    expect(() => validator.parse(undefined)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("List of asset types");
  });
});

describe("assetTypeSet", () => {
  const validator = assetTypeSet();

  test("should accept valid sets", () => {
    const testSet = new Set(["bond", "equity"]);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has("bond" as AssetType)).toBe(true);
    expect(result.has("equity" as AssetType)).toBe(true);
  });

  test("should deduplicate values", () => {
    const testSet = new Set(["bond", "bond", "equity"]);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);
  });

  test("should reject empty sets", () => {
    const emptySet = new Set();
    expect(() => validator.parse(emptySet)).toThrow(
      "At least one asset type must be selected"
    );
  });

  test("should reject sets with invalid values", () => {
    const invalidSet = new Set(["bond", "invalid"]);
    expect(() => validator.parse(invalidSet)).toThrow();
  });

  test("should reject non-set types", () => {
    expect(() => validator.parse(["bond"])).toThrow();
    expect(() => validator.parse("bond")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Set of unique asset types");
  });
});

describe("assetTypeWithDefault", () => {
  test("should use provided default", () => {
    const defaultType = assetType().parse("equity");
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse(undefined)).toBe("equity" as AssetType);
  });

  test("should use 'bond' as default when not specified", () => {
    const validator = assetTypeWithDefault();
    expect(validator.parse(undefined)).toBe("bond" as AssetType);
  });

  test("should accept valid values", () => {
    const defaultType = assetType().parse("equity");
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse("fund")).toBe("fund" as AssetType);
  });
});

describe("assetTypeRecord", () => {
  test("should validate record with string values", () => {
    const validator = assetTypeRecord(z.string());
    const result = validator.parse({
      bond: "Government Bond",
      equity: "Common Stock",
    });
    expect(result.bond).toBe("Government Bond");
    expect(result.equity).toBe("Common Stock");
  });

  test("should validate record with number values", () => {
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

  test("should reject invalid keys", () => {
    const validator = assetTypeRecord(z.string());
    expect(() =>
      validator.parse({
        bond: "Valid",
        invalid: "Invalid key",
      })
    ).toThrow();
  });

  test("should validate empty records", () => {
    const validator = assetTypeRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });

  test("should have proper description", () => {
    const validator = assetTypeRecord(z.string());
    expect(validator.description).toBe("Mapping of asset types to values");
  });
});

describe("type checking", () => {
  describe("assetType", () => {
    test("should return proper type", () => {
      const result = assetType().parse("bond");
      // Test that the type is correctly inferred
      expect(result).toBe("bond");
    });

    test("should handle safeParse", () => {
      const result = assetType().safeParse("equity");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("equity");
      }
    });
  });

  describe("assetTypeArray", () => {
    test("should return proper type", () => {
      const result = assetTypeArray().parse(["bond", "equity"]);
      // Test that the type is correctly inferred
      expect(result).toEqual(["bond", "equity"]);
    });

    test("should handle safeParse", () => {
      const result = assetTypeArray().safeParse(["fund", "deposit"]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["fund", "deposit"]);
      }
    });
  });

  describe("assetTypeSet", () => {
    test("should return proper type", () => {
      const result = assetTypeSet().parse(new Set(["bond", "equity"]));
      // Test that the type is correctly inferred
      expect(result.has("bond")).toBe(true);
      expect(result.has("equity")).toBe(true);
    });

    test("should handle safeParse", () => {
      const result = assetTypeSet().safeParse(
        new Set(["stablecoin", "equity"])
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has("stablecoin")).toBe(true);
        expect(result.data.has("equity")).toBe(true);
      }
    });
  });
});

// Tests for assetClass
describe("assetClass", () => {
  const validator = assetClass();

  describe("valid asset classes", () => {
    test.each([...assetClasses])("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(cls);
    });
  });

  describe("invalid asset classes", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("commodity")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("FixedIncome")).toThrow();
      expect(() => validator.parse("FLEXIBLE_INCOME")).toThrow();
    });
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Class of financial asset");
  });
});

// Tests for assetFactoryTypeId
describe("assetFactoryTypeId", () => {
  const validator = assetFactoryTypeId();

  describe("valid factory typeIds", () => {
    test.each([...assetFactoryTypeIds])("should accept '%s'", (typeId) => {
      expect(validator.parse(typeId)).toBe(typeId);
    });
  });

  describe("invalid factory typeIds", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("BondFactory")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("atkbondfactory")).toThrow();
      expect(() => validator.parse("atkBondFactory")).toThrow();
    });
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Asset factory typeId identifier");
  });
});

// Tests for AssetFactoryTypeIdEnum
describe("AssetFactoryTypeIdEnum", () => {
  test("should have all factory typeIds", () => {
    expect(AssetFactoryTypeIdEnum.ATKBondFactory).toBe("ATKBondFactory");
    expect(AssetFactoryTypeIdEnum.ATKEquityFactory).toBe("ATKEquityFactory");
    expect(AssetFactoryTypeIdEnum.ATKFundFactory).toBe("ATKFundFactory");
    expect(AssetFactoryTypeIdEnum.ATKStableCoinFactory).toBe(
      "ATKStableCoinFactory"
    );
    expect(AssetFactoryTypeIdEnum.ATKDepositFactory).toBe("ATKDepositFactory");
  });

  test("should match assetFactoryTypeIds array", () => {
    const enumValues = Object.values(AssetFactoryTypeIdEnum);
    expect(enumValues).toEqual([...assetFactoryTypeIds]);
  });
});

// Tests for assetFactoryTypeIdArray
describe("assetFactoryTypeIdArray", () => {
  const validator = assetFactoryTypeIdArray();

  test("should accept valid arrays", () => {
    const single: AssetFactoryTypeId[] = ["ATKBondFactory"];
    const multiple: AssetFactoryTypeId[] = [
      "ATKBondFactory",
      "ATKEquityFactory",
      "ATKFundFactory",
    ];
    const all = [...assetFactoryTypeIds];

    expect(validator.parse(single)).toEqual(single);
    expect(validator.parse(multiple)).toEqual(multiple);
    expect(validator.parse(all)).toEqual(all);
  });

  test("should allow duplicates", () => {
    const duplicates: AssetFactoryTypeId[] = [
      "ATKBondFactory",
      "ATKBondFactory",
    ];
    expect(validator.parse(duplicates)).toEqual(duplicates);
  });

  test("should reject empty arrays", () => {
    expect(() => validator.parse([])).toThrow(
      "At least one factory typeId must be selected"
    );
  });

  test("should reject invalid factory typeIds in array", () => {
    expect(() => validator.parse(["ATKBondFactory", "invalid"])).toThrow();
  });

  test("should reject non-array types", () => {
    expect(() => validator.parse("ATKBondFactory")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
    expect(() => validator.parse(undefined)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("List of asset factory typeIds");
  });
});

// Tests for assetFactoryTypeIdSet
describe("assetFactoryTypeIdSet", () => {
  const validator = assetFactoryTypeIdSet();

  test("should accept valid sets", () => {
    const testSet = new Set(["ATKBondFactory", "ATKEquityFactory"]);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has("ATKBondFactory" as AssetFactoryTypeId)).toBe(true);
    expect(result.has("ATKEquityFactory" as AssetFactoryTypeId)).toBe(true);
  });

  test("should deduplicate values", () => {
    const testSet = new Set([
      "ATKBondFactory",
      "ATKBondFactory",
      "ATKEquityFactory",
    ]);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);
  });

  test("should reject empty sets", () => {
    const emptySet = new Set();
    expect(() => validator.parse(emptySet)).toThrow(
      "At least one factory typeId must be selected"
    );
  });

  test("should reject sets with invalid values", () => {
    const invalidSet = new Set(["ATKBondFactory", "invalid"]);
    expect(() => validator.parse(invalidSet)).toThrow();
  });

  test("should reject non-set types", () => {
    expect(() => validator.parse(["ATKBondFactory"])).toThrow();
    expect(() => validator.parse("ATKBondFactory")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Set of unique asset factory typeIds");
  });
});

// Tests for assetFactoryTypeIdWithDefault
describe("assetFactoryTypeIdWithDefault", () => {
  test("should use provided default", () => {
    const defaultTypeId = assetFactoryTypeId().parse("ATKEquityFactory");
    const validator = assetFactoryTypeIdWithDefault(defaultTypeId);
    expect(validator.parse(undefined)).toBe(
      "ATKEquityFactory" as AssetFactoryTypeId
    );
  });

  test("should use 'ATKBondFactory' as default when not specified", () => {
    const validator = assetFactoryTypeIdWithDefault();
    expect(validator.parse(undefined)).toBe(
      "ATKBondFactory" as AssetFactoryTypeId
    );
  });

  test("should accept valid values", () => {
    const defaultTypeId = assetFactoryTypeId().parse("ATKEquityFactory");
    const validator = assetFactoryTypeIdWithDefault(defaultTypeId);
    expect(validator.parse("ATKFundFactory")).toBe(
      "ATKFundFactory" as AssetFactoryTypeId
    );
  });
});

// Tests for assetFactoryTypeIdRecord
describe("assetFactoryTypeIdRecord", () => {
  test("should validate record with string values", () => {
    const validator = assetFactoryTypeIdRecord(z.string());
    const result = validator.parse({
      ATKBondFactory: "Bond Factory Config",
      ATKEquityFactory: "Equity Factory Config",
    });
    expect(result.ATKBondFactory).toBe("Bond Factory Config");
    expect(result.ATKEquityFactory).toBe("Equity Factory Config");
  });

  test("should validate record with object values", () => {
    const validator = assetFactoryTypeIdRecord(
      z.object({
        enabled: z.boolean(),
        maxSupply: z.number(),
      })
    );
    const result = validator.parse({
      ATKBondFactory: { enabled: true, maxSupply: 1_000_000 },
      ATKEquityFactory: { enabled: false, maxSupply: 500_000 },
    });
    expect(result.ATKBondFactory).toEqual({
      enabled: true,
      maxSupply: 1_000_000,
    });
    expect(result.ATKEquityFactory).toEqual({
      enabled: false,
      maxSupply: 500_000,
    });
  });

  test("should reject invalid keys", () => {
    const validator = assetFactoryTypeIdRecord(z.string());
    expect(() =>
      validator.parse({
        ATKBondFactory: "Valid",
        InvalidFactory: "Invalid key",
      })
    ).toThrow();
  });

  test("should validate empty records", () => {
    const validator = assetFactoryTypeIdRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });

  test("should have proper description", () => {
    const validator = assetFactoryTypeIdRecord(z.string());
    expect(validator.description).toBe(
      "Mapping of asset factory typeIds to values"
    );
  });
});

// Tests for type guard functions
describe("type guard functions", () => {
  describe("isAssetType", () => {
    test("should return true for valid asset types", () => {
      expect(isAssetType("bond")).toBe(true);
      expect(isAssetType("equity")).toBe(true);
      expect(isAssetType("fund")).toBe(true);
      expect(isAssetType("stablecoin")).toBe(true);
      expect(isAssetType("deposit")).toBe(true);
    });

    test("should return false for invalid asset types", () => {
      expect(isAssetType("invalid")).toBe(false);
      expect(isAssetType("")).toBe(false);
      expect(isAssetType(123)).toBe(false);
      expect(isAssetType(null)).toBe(false);
      expect(isAssetType(undefined)).toBe(false);
      expect(isAssetType({})).toBe(false);
    });
  });

  describe("isAssetFactoryTypeId", () => {
    test("should return true for valid factory typeIds", () => {
      expect(isAssetFactoryTypeId("ATKBondFactory")).toBe(true);
      expect(isAssetFactoryTypeId("ATKEquityFactory")).toBe(true);
      expect(isAssetFactoryTypeId("ATKFundFactory")).toBe(true);
      expect(isAssetFactoryTypeId("ATKStableCoinFactory")).toBe(true);
      expect(isAssetFactoryTypeId("ATKDepositFactory")).toBe(true);
    });

    test("should return false for invalid factory typeIds", () => {
      expect(isAssetFactoryTypeId("invalid")).toBe(false);
      expect(isAssetFactoryTypeId("")).toBe(false);
      expect(isAssetFactoryTypeId(123)).toBe(false);
      expect(isAssetFactoryTypeId(null)).toBe(false);
      expect(isAssetFactoryTypeId(undefined)).toBe(false);
      expect(isAssetFactoryTypeId({})).toBe(false);
    });
  });

  describe("isAssetTypeArray", () => {
    test("should return true for valid asset type arrays", () => {
      expect(isAssetTypeArray(["bond"])).toBe(true);
      expect(isAssetTypeArray(["bond", "equity"])).toBe(true);
      expect(isAssetTypeArray([...assetTypes])).toBe(true);
    });

    test("should return false for invalid arrays", () => {
      expect(isAssetTypeArray([])).toBe(false);
      expect(isAssetTypeArray(["bond", "invalid"])).toBe(false);
      expect(isAssetTypeArray("bond")).toBe(false);
      expect(isAssetTypeArray(123)).toBe(false);
      expect(isAssetTypeArray(null)).toBe(false);
    });
  });

  describe("isAssetFactoryTypeIdArray", () => {
    test("should return true for valid factory typeId arrays", () => {
      expect(isAssetFactoryTypeIdArray(["ATKBondFactory"])).toBe(true);
      expect(
        isAssetFactoryTypeIdArray(["ATKBondFactory", "ATKEquityFactory"])
      ).toBe(true);
      expect(isAssetFactoryTypeIdArray([...assetFactoryTypeIds])).toBe(true);
    });

    test("should return false for invalid arrays", () => {
      expect(isAssetFactoryTypeIdArray([])).toBe(false);
      expect(isAssetFactoryTypeIdArray(["ATKBondFactory", "invalid"])).toBe(
        false
      );
      expect(isAssetFactoryTypeIdArray("ATKBondFactory")).toBe(false);
      expect(isAssetFactoryTypeIdArray(123)).toBe(false);
      expect(isAssetFactoryTypeIdArray(null)).toBe(false);
    });
  });

  describe("isAssetTypeSet", () => {
    test("should return true for valid asset type sets", () => {
      expect(isAssetTypeSet(new Set(["bond"]))).toBe(true);
      expect(isAssetTypeSet(new Set(["bond", "equity"]))).toBe(true);
      expect(isAssetTypeSet(new Set(assetTypes))).toBe(true);
    });

    test("should return false for invalid sets", () => {
      expect(isAssetTypeSet(new Set())).toBe(false);
      expect(isAssetTypeSet(new Set(["bond", "invalid"]))).toBe(false);
      expect(isAssetTypeSet(["bond"])).toBe(false);
      expect(isAssetTypeSet("bond")).toBe(false);
      expect(isAssetTypeSet(123)).toBe(false);
    });
  });

  describe("isAssetFactoryTypeIdSet", () => {
    test("should return true for valid factory typeId sets", () => {
      expect(isAssetFactoryTypeIdSet(new Set(["ATKBondFactory"]))).toBe(true);
      expect(
        isAssetFactoryTypeIdSet(new Set(["ATKBondFactory", "ATKEquityFactory"]))
      ).toBe(true);
      expect(isAssetFactoryTypeIdSet(new Set(assetFactoryTypeIds))).toBe(true);
    });

    test("should return false for invalid sets", () => {
      expect(isAssetFactoryTypeIdSet(new Set())).toBe(false);
      expect(
        isAssetFactoryTypeIdSet(new Set(["ATKBondFactory", "invalid"]))
      ).toBe(false);
      expect(isAssetFactoryTypeIdSet(["ATKBondFactory"])).toBe(false);
      expect(isAssetFactoryTypeIdSet("ATKBondFactory")).toBe(false);
      expect(isAssetFactoryTypeIdSet(123)).toBe(false);
    });
  });
});

// Tests for getter functions
describe("getter functions", () => {
  describe("getAssetType", () => {
    test("should return valid asset types", () => {
      expect(getAssetType("bond")).toBe("bond");
      expect(getAssetType("equity")).toBe("equity");
      expect(getAssetType("fund")).toBe("fund");
      expect(getAssetType("stablecoin")).toBe("stablecoin");
      expect(getAssetType("deposit")).toBe("deposit");
    });

    test("should throw for invalid asset types", () => {
      expect(() => getAssetType("invalid")).toThrow();
      expect(() => getAssetType("")).toThrow();
      expect(() => getAssetType(123)).toThrow();
      expect(() => getAssetType(null)).toThrow();
    });
  });

  describe("getAssetFactoryTypeId", () => {
    test("should return valid factory typeIds", () => {
      expect(getAssetFactoryTypeId("ATKBondFactory")).toBe("ATKBondFactory");
      expect(getAssetFactoryTypeId("ATKEquityFactory")).toBe(
        "ATKEquityFactory"
      );
      expect(getAssetFactoryTypeId("ATKFundFactory")).toBe("ATKFundFactory");
      expect(getAssetFactoryTypeId("ATKStableCoinFactory")).toBe(
        "ATKStableCoinFactory"
      );
      expect(getAssetFactoryTypeId("ATKDepositFactory")).toBe(
        "ATKDepositFactory"
      );
    });

    test("should throw for invalid factory typeIds", () => {
      expect(() => getAssetFactoryTypeId("invalid")).toThrow();
      expect(() => getAssetFactoryTypeId("")).toThrow();
      expect(() => getAssetFactoryTypeId(123)).toThrow();
      expect(() => getAssetFactoryTypeId(null)).toThrow();
    });
  });

  describe("getAssetTypeArray", () => {
    test("should return valid asset type arrays", () => {
      expect(getAssetTypeArray(["bond"])).toEqual(["bond"]);
      expect(getAssetTypeArray(["bond", "equity"])).toEqual(["bond", "equity"]);
    });

    test("should throw for invalid arrays", () => {
      expect(() => getAssetTypeArray([])).toThrow();
      expect(() => getAssetTypeArray(["bond", "invalid"])).toThrow();
      expect(() => getAssetTypeArray("bond")).toThrow();
      expect(() => getAssetTypeArray(123)).toThrow();
    });
  });

  describe("getAssetFactoryTypeIdArray", () => {
    test("should return valid factory typeId arrays", () => {
      expect(getAssetFactoryTypeIdArray(["ATKBondFactory"])).toEqual([
        "ATKBondFactory",
      ]);
      expect(
        getAssetFactoryTypeIdArray(["ATKBondFactory", "ATKEquityFactory"])
      ).toEqual(["ATKBondFactory", "ATKEquityFactory"]);
    });

    test("should throw for invalid arrays", () => {
      expect(() => getAssetFactoryTypeIdArray([])).toThrow();
      expect(() =>
        getAssetFactoryTypeIdArray(["ATKBondFactory", "invalid"])
      ).toThrow();
      expect(() => getAssetFactoryTypeIdArray("ATKBondFactory")).toThrow();
      expect(() => getAssetFactoryTypeIdArray(123)).toThrow();
    });
  });

  describe("getAssetTypeSet", () => {
    test("should return valid asset type sets", () => {
      const result1 = getAssetTypeSet(new Set(["bond"]));
      expect(result1.has("bond")).toBe(true);
      expect(result1.size).toBe(1);

      const result2 = getAssetTypeSet(new Set(["bond", "equity"]));
      expect(result2.has("bond")).toBe(true);
      expect(result2.has("equity")).toBe(true);
      expect(result2.size).toBe(2);
    });

    test("should throw for invalid sets", () => {
      expect(() => getAssetTypeSet(new Set())).toThrow();
      expect(() => getAssetTypeSet(new Set(["bond", "invalid"]))).toThrow();
      expect(() => getAssetTypeSet(["bond"])).toThrow();
      expect(() => getAssetTypeSet("bond")).toThrow();
    });
  });

  describe("getAssetFactoryTypeIdSet", () => {
    test("should return valid factory typeId sets", () => {
      const result1 = getAssetFactoryTypeIdSet(new Set(["ATKBondFactory"]));
      expect(result1.has("ATKBondFactory")).toBe(true);
      expect(result1.size).toBe(1);

      const result2 = getAssetFactoryTypeIdSet(
        new Set(["ATKBondFactory", "ATKEquityFactory"])
      );
      expect(result2.has("ATKBondFactory")).toBe(true);
      expect(result2.has("ATKEquityFactory")).toBe(true);
      expect(result2.size).toBe(2);
    });

    test("should throw for invalid sets", () => {
      expect(() => getAssetFactoryTypeIdSet(new Set())).toThrow();
      expect(() =>
        getAssetFactoryTypeIdSet(new Set(["ATKBondFactory", "invalid"]))
      ).toThrow();
      expect(() => getAssetFactoryTypeIdSet(["ATKBondFactory"])).toThrow();
      expect(() => getAssetFactoryTypeIdSet("ATKBondFactory")).toThrow();
    });
  });
});

// Tests for utility mapping functions
describe("utility mapping functions", () => {
  describe("getFactoryTypeIdFromAssetType", () => {
    test("should map asset types to factory typeIds correctly", () => {
      expect(getFactoryTypeIdFromAssetType("bond")).toBe("ATKBondFactory");
      expect(getFactoryTypeIdFromAssetType("equity")).toBe("ATKEquityFactory");
      expect(getFactoryTypeIdFromAssetType("fund")).toBe("ATKFundFactory");
      expect(getFactoryTypeIdFromAssetType("stablecoin")).toBe(
        "ATKStableCoinFactory"
      );
      expect(getFactoryTypeIdFromAssetType("deposit")).toBe(
        "ATKDepositFactory"
      );
    });
  });

  describe("getAssetTypeFromFactoryTypeId", () => {
    test("should map factory typeIds to asset types correctly", () => {
      expect(getAssetTypeFromFactoryTypeId("ATKBondFactory")).toBe("bond");
      expect(getAssetTypeFromFactoryTypeId("ATKEquityFactory")).toBe("equity");
      expect(getAssetTypeFromFactoryTypeId("ATKFundFactory")).toBe("fund");
      expect(getAssetTypeFromFactoryTypeId("ATKStableCoinFactory")).toBe(
        "stablecoin"
      );
      expect(getAssetTypeFromFactoryTypeId("ATKDepositFactory")).toBe(
        "deposit"
      );
    });
  });

  describe("getAssetClassFromFactoryTypeId", () => {
    test("should map factory typeIds to asset classes correctly", () => {
      expect(getAssetClassFromFactoryTypeId("ATKBondFactory")).toBe(
        "fixedIncome"
      );
      expect(getAssetClassFromFactoryTypeId("ATKEquityFactory")).toBe(
        "flexibleIncome"
      );
      expect(getAssetClassFromFactoryTypeId("ATKFundFactory")).toBe(
        "flexibleIncome"
      );
      expect(getAssetClassFromFactoryTypeId("ATKStableCoinFactory")).toBe(
        "cashEquivalent"
      );
      expect(getAssetClassFromFactoryTypeId("ATKDepositFactory")).toBe(
        "cashEquivalent"
      );
    });
  });
});
