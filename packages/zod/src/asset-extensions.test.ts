import { describe, expect, test } from "bun:test";
import * as z from "zod";
import {
  type AssetExtension,
  AssetExtensionEnum,
  type AssetExtensionSet,
  assetExtension,
  assetExtensionArray,
  assetExtensionRecord,
  assetExtensionSet,
  assetExtensionWithDefault,
  assetExtensions,
  getAssetExtension,
  getAssetExtensionArray,
  getAssetExtensionSet,
  isAssetExtension,
  isAssetExtensionArray,
  isAssetExtensionSet,
} from "./asset-extensions";

describe("assetExtension", () => {
  const validator = assetExtension();

  describe("valid asset extensions", () => {
    test.each([...assetExtensions])("should accept '%s'", (extension) => {
      expect(validator.parse(extension)).toBe(extension);
    });
  });

  describe("invalid asset extensions", () => {
    test("should reject invalid strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("INVALID_EXTENSION")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    test("should be case-sensitive", () => {
      expect(() => validator.parse("burnable")).toThrow();
      expect(() => validator.parse("Pausable")).toThrow();
      expect(() => validator.parse("historical_balances")).toThrow();
    });
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Token extension capability");
  });
});

describe("AssetExtensionEnum", () => {
  test("should have all asset extensions", () => {
    expect(AssetExtensionEnum.ACCESS_MANAGED).toBe("ACCESS_MANAGED");
    expect(AssetExtensionEnum.BOND).toBe("BOND");
    expect(AssetExtensionEnum.BURNABLE).toBe("BURNABLE");
    expect(AssetExtensionEnum.CAPPED).toBe("CAPPED");
    expect(AssetExtensionEnum.COLLATERAL).toBe("COLLATERAL");
    expect(AssetExtensionEnum.CUSTODIAN).toBe("CUSTODIAN");
    expect(AssetExtensionEnum.FUND).toBe("FUND");
    expect(AssetExtensionEnum.HISTORICAL_BALANCES).toBe("HISTORICAL_BALANCES");
    expect(AssetExtensionEnum.PAUSABLE).toBe("PAUSABLE");
    expect(AssetExtensionEnum.REDEEMABLE).toBe("REDEEMABLE");
    expect(AssetExtensionEnum.YIELD).toBe("YIELD");
  });

  test("should match assetExtensions array", () => {
    const enumValues = Object.values(AssetExtensionEnum);
    expect(enumValues).toEqual([...assetExtensions]);
  });
});

describe("assetExtensionArray", () => {
  const validator = assetExtensionArray();

  test("should accept valid arrays", () => {
    const single: AssetExtension[] = ["BURNABLE"];
    const multiple: AssetExtension[] = ["BURNABLE", "PAUSABLE", "CAPPED"];
    const all = [...assetExtensions];

    expect(validator.parse(single)).toEqual(single);
    expect(validator.parse(multiple)).toEqual(multiple);
    expect(validator.parse(all)).toEqual(all);
  });

  test("should allow duplicates", () => {
    const duplicates: AssetExtension[] = ["BURNABLE", "BURNABLE"];
    expect(validator.parse(duplicates)).toEqual(duplicates);
  });

  test("should accept empty arrays", () => {
    expect(validator.parse([])).toEqual([]);
  });

  test("should reject invalid asset extensions in array", () => {
    expect(() => validator.parse(["BURNABLE", "INVALID"])).toThrow();
  });

  test("should reject non-array types", () => {
    expect(() => validator.parse("BURNABLE")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
    expect(() => validator.parse(undefined)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("List of asset extensions");
  });
});

describe("assetExtensionSet", () => {
  const validator = assetExtensionSet();

  test("should accept valid sets", () => {
    const testSet = new Set(["BURNABLE", "PAUSABLE"]);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has("BURNABLE" as AssetExtension)).toBe(true);
    expect(result.has("PAUSABLE" as AssetExtension)).toBe(true);
  });

  test("should deduplicate values", () => {
    const testSet = new Set(["BURNABLE", "BURNABLE", "PAUSABLE"]);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);
  });

  test("should accept empty sets", () => {
    const emptySet = new Set();
    const result = validator.parse(emptySet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  test("should reject sets with invalid values", () => {
    const invalidSet = new Set(["BURNABLE", "INVALID"]);
    expect(() => validator.parse(invalidSet)).toThrow();
  });

  test("should reject non-set types", () => {
    expect(() => validator.parse(["BURNABLE"])).toThrow();
    expect(() => validator.parse("BURNABLE")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
  });

  test("should have proper description", () => {
    expect(validator.description).toBe("Set of unique asset extensions");
  });
});

describe("assetExtensionWithDefault", () => {
  test("should use provided default", () => {
    const defaultExt = assetExtension().parse("PAUSABLE");
    const validator = assetExtensionWithDefault(defaultExt);
    expect(validator.parse(undefined)).toBe("PAUSABLE" as AssetExtension);
  });

  test("should use 'BURNABLE' as default when not specified", () => {
    const validator = assetExtensionWithDefault();
    expect(validator.parse(undefined)).toBe("BURNABLE" as AssetExtension);
  });

  test("should accept valid values", () => {
    const defaultExt = assetExtension().parse("PAUSABLE");
    const validator = assetExtensionWithDefault(defaultExt);
    expect(validator.parse("CAPPED")).toBe("CAPPED" as AssetExtension);
  });
});

describe("assetExtensionRecord", () => {
  test("should validate record with string values", () => {
    const validator = assetExtensionRecord(z.string());
    const result = validator.parse({
      BURNABLE: "Burn functionality enabled",
      PAUSABLE: "Pause functionality enabled",
    });
    expect(result.BURNABLE).toBe("Burn functionality enabled");
    expect(result.PAUSABLE).toBe("Pause functionality enabled");
  });

  test("should validate record with object values", () => {
    const validator = assetExtensionRecord(
      z.object({
        enabled: z.boolean(),
        gasLimit: z.number(),
      })
    );
    const result = validator.parse({
      BURNABLE: { enabled: true, gasLimit: 100_000 },
      PAUSABLE: { enabled: false, gasLimit: 50_000 },
    });
    expect(result.BURNABLE).toEqual({ enabled: true, gasLimit: 100_000 });
    expect(result.PAUSABLE).toEqual({ enabled: false, gasLimit: 50_000 });
  });

  test("should reject invalid keys", () => {
    const validator = assetExtensionRecord(z.string());
    expect(() =>
      validator.parse({
        BURNABLE: "Valid",
        INVALID_EXTENSION: "Invalid key",
      })
    ).toThrow();
  });

  test("should validate empty records", () => {
    const validator = assetExtensionRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });

  test("should have proper description", () => {
    const validator = assetExtensionRecord(z.string());
    expect(validator.description).toBe("Mapping of asset extensions to values");
  });
});

describe("type checking", () => {
  describe("assetExtension", () => {
    test("should return proper type", () => {
      const result = assetExtension().parse("BURNABLE");
      // Test that the type is correctly inferred
      expect(result).toBe("BURNABLE");
    });

    test("should handle safeParse", () => {
      const result = assetExtension().safeParse("PAUSABLE");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("PAUSABLE");
      }
    });
  });

  describe("assetExtensionArray", () => {
    test("should return proper type", () => {
      const result = assetExtensionArray().parse(["BURNABLE", "PAUSABLE"]);
      // Test that the type is correctly inferred
      expect(result).toEqual(["BURNABLE", "PAUSABLE"]);
    });

    test("should handle safeParse", () => {
      const result = assetExtensionArray().safeParse(["CAPPED", "REDEEMABLE"]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["CAPPED", "REDEEMABLE"]);
      }
    });
  });

  describe("assetExtensionSet", () => {
    test("should return proper type", () => {
      const result = assetExtensionSet().parse(
        new Set(["BURNABLE", "PAUSABLE"])
      );
      // Test that the type is correctly inferred
      expect(result.has("BURNABLE")).toBe(true);
      expect(result.has("PAUSABLE")).toBe(true);
    });

    test("should handle safeParse", () => {
      const result = assetExtensionSet().safeParse(
        new Set(["CUSTODIAN", "PAUSABLE"])
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has("CUSTODIAN")).toBe(true);
        expect(result.data.has("PAUSABLE")).toBe(true);
      }
    });
  });
});

describe("type guard functions", () => {
  describe("isAssetExtension", () => {
    test("should return true for valid asset extensions", () => {
      expect(isAssetExtension("BURNABLE")).toBe(true);
      expect(isAssetExtension("PAUSABLE")).toBe(true);
      expect(isAssetExtension("CAPPED")).toBe(true);
      expect(isAssetExtension("CUSTODIAN")).toBe(true);
      expect(isAssetExtension("YIELD")).toBe(true);
    });

    test("should return false for invalid asset extensions", () => {
      expect(isAssetExtension("INVALID")).toBe(false);
      expect(isAssetExtension("")).toBe(false);
      expect(isAssetExtension(123)).toBe(false);
      expect(isAssetExtension(null)).toBe(false);
      expect(isAssetExtension(undefined)).toBe(false);
      expect(isAssetExtension({})).toBe(false);
    });
  });

  describe("isAssetExtensionArray", () => {
    test("should return true for valid asset extension arrays", () => {
      expect(isAssetExtensionArray(["BURNABLE"])).toBe(true);
      expect(isAssetExtensionArray(["BURNABLE", "PAUSABLE"])).toBe(true);
      expect(isAssetExtensionArray([...assetExtensions])).toBe(true);
    });

    test("should return false for invalid arrays", () => {
      expect(isAssetExtensionArray([])).toBe(true);
      expect(isAssetExtensionArray(["BURNABLE", "INVALID"])).toBe(false);
      expect(isAssetExtensionArray("BURNABLE")).toBe(false);
      expect(isAssetExtensionArray(123)).toBe(false);
      expect(isAssetExtensionArray(null)).toBe(false);
    });
  });

  describe("isAssetExtensionSet", () => {
    test("should return true for valid asset extension sets", () => {
      expect(isAssetExtensionSet(new Set(["BURNABLE"]))).toBe(true);
      expect(isAssetExtensionSet(new Set(["BURNABLE", "PAUSABLE"]))).toBe(true);
      expect(isAssetExtensionSet(new Set(assetExtensions))).toBe(true);
    });

    test("should return false for invalid sets", () => {
      expect(isAssetExtensionSet(new Set())).toBe(true);
      expect(isAssetExtensionSet(new Set(["BURNABLE", "INVALID"]))).toBe(false);
      expect(isAssetExtensionSet(["BURNABLE"])).toBe(false);
      expect(isAssetExtensionSet("BURNABLE")).toBe(false);
      expect(isAssetExtensionSet(123)).toBe(false);
    });
  });
});

describe("getter functions", () => {
  describe("getAssetExtension", () => {
    test("should return valid asset extensions", () => {
      expect(getAssetExtension("BURNABLE")).toBe("BURNABLE");
      expect(getAssetExtension("PAUSABLE")).toBe("PAUSABLE");
      expect(getAssetExtension("CUSTODIAN")).toBe("CUSTODIAN");
      expect(getAssetExtension("HISTORICAL_BALANCES")).toBe(
        "HISTORICAL_BALANCES"
      );
      expect(getAssetExtension("YIELD")).toBe("YIELD");
    });

    test("should throw for invalid asset extensions", () => {
      expect(() => getAssetExtension("invalid")).toThrow();
      expect(() => getAssetExtension("")).toThrow();
      expect(() => getAssetExtension(123)).toThrow();
      expect(() => getAssetExtension(null)).toThrow();
    });
  });

  describe("getAssetExtensionArray", () => {
    test("should return valid asset extension arrays", () => {
      expect(getAssetExtensionArray(["BURNABLE"])).toEqual(["BURNABLE"]);
      expect(getAssetExtensionArray(["BURNABLE", "PAUSABLE"])).toEqual([
        "BURNABLE",
        "PAUSABLE",
      ]);
    });

    test("should throw for invalid arrays", () => {
      expect(getAssetExtensionArray([])).toEqual([]);
      expect(() => getAssetExtensionArray(["BURNABLE", "INVALID"])).toThrow();
      expect(() => getAssetExtensionArray("BURNABLE")).toThrow();
      expect(() => getAssetExtensionArray(123)).toThrow();
    });
  });

  describe("getAssetExtensionSet", () => {
    test("should return valid asset extension sets", () => {
      const result1 = getAssetExtensionSet(new Set(["BURNABLE"]));
      expect(result1.has("BURNABLE")).toBe(true);
      expect(result1.size).toBe(1);

      const result2 = getAssetExtensionSet(new Set(["BURNABLE", "PAUSABLE"]));
      expect(result2.has("BURNABLE")).toBe(true);
      expect(result2.has("PAUSABLE")).toBe(true);
      expect(result2.size).toBe(2);
    });

    test("should throw for invalid sets", () => {
      const emptySet = getAssetExtensionSet(new Set());
      expect(emptySet).toBeInstanceOf(Set);
      expect(emptySet.size).toBe(0);
      expect(() =>
        getAssetExtensionSet(new Set(["BURNABLE", "INVALID"]))
      ).toThrow();
      expect(() => getAssetExtensionSet(["BURNABLE"])).toThrow();
      expect(() => getAssetExtensionSet("BURNABLE")).toThrow();
    });
  });
});

describe("usage in practical scenarios", () => {
  test("should work with token extension checks", () => {
    const tokenExtensions: AssetExtensionSet = new Set([
      "BURNABLE",
      "PAUSABLE",
      "CUSTODIAN",
    ]);

    // Check if token has specific extension
    expect(tokenExtensions.has(AssetExtensionEnum.CUSTODIAN)).toBe(true);
    expect(tokenExtensions.has(AssetExtensionEnum.YIELD)).toBe(false);
  });

  test("should work with form validation", () => {
    const formSchema = z.object({
      name: z.string(),
      extensions: assetExtensionArray(),
    });

    const validForm = {
      name: "My Token",
      extensions: ["BURNABLE", "PAUSABLE"] as AssetExtension[],
    };

    expect(formSchema.parse(validForm)).toEqual(validForm);

    const emptyExtensionsForm = {
      name: "My Token",
      extensions: [],
    };

    expect(formSchema.parse(emptyExtensionsForm)).toEqual(emptyExtensionsForm);
  });

  test("should work with configuration objects", () => {
    const extensionConfig = assetExtensionRecord(
      z.object({
        enabled: z.boolean(),
        adminOnly: z.boolean().optional(),
      })
    );

    const config = {
      BURNABLE: { enabled: true, adminOnly: true },
      PAUSABLE: { enabled: true },
      CUSTODIAN: { enabled: false },
    };

    const parsed = extensionConfig.parse(config);
    expect(parsed.BURNABLE?.enabled).toBe(true);
    expect(parsed.BURNABLE?.adminOnly).toBe(true);
    expect(parsed.PAUSABLE?.enabled).toBe(true);
    expect(parsed.CUSTODIAN?.enabled).toBe(false);
  });
});
