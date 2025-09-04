/**
 * @vitest-environment node
 */

import { describe, expect, it } from "bun:test";
import { ZodError } from "zod";
import {
  type AddonCategory,
  type AddonFactoryTypeId,
  type AddonType,
  addonCategories,
  addonCategory,
  addonFactoryTypeId,
  addonFactoryTypeIds,
  addonType,
  addonTypes,
  getAddonCategoryFromFactoryTypeId,
  getFactoryTypeIdsFromAddonType,
} from "./addon-types";

describe("addonType", () => {
  const schema = addonType();

  it("should have correct description", () => {
    expect(schema.description).toBe("Type of system addon");
  });

  describe("valid inputs", () => {
    it.each([...addonTypes])('should accept "%s"', (type) => {
      const result = schema.parse(type);
      expect(result).toBe(type);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid addon type", () => {
      expect(() => schema.parse("invalid")).toThrow(ZodError);
    });

    it("should reject empty string", () => {
      expect(() => schema.parse("")).toThrow(ZodError);
    });

    it("should reject null", () => {
      expect(() => schema.parse(null)).toThrow(ZodError);
    });

    it("should reject undefined", () => {
      expect(() => schema.parse(undefined)).toThrow(ZodError);
    });

    it("should reject number", () => {
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    it("should reject uppercase version", () => {
      expect(() => schema.parse("AIRDROPS")).toThrow(ZodError);
    });
  });

  describe("type inference", () => {
    it("should correctly infer the type", () => {
      const _result = schema.parse("airdrops");
      type CheckType = typeof _result extends AddonType ? true : false;
      const isCorrectType: CheckType = true;
      expect(isCorrectType).toBe(true);
    });
  });
});

describe("addonCategory", () => {
  const schema = addonCategory();

  it("should have correct description", () => {
    expect(schema.description).toBe("Category of system addon");
  });

  describe("valid inputs", () => {
    it.each([...addonCategories])('should accept "%s"', (category) => {
      const result = schema.parse(category);
      expect(result).toBe(category);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid addon category", () => {
      expect(() => schema.parse("invalid")).toThrow(ZodError);
    });

    it("should reject empty string", () => {
      expect(() => schema.parse("")).toThrow(ZodError);
    });

    it("should reject null", () => {
      expect(() => schema.parse(null)).toThrow(ZodError);
    });

    it("should reject undefined", () => {
      expect(() => schema.parse(undefined)).toThrow(ZodError);
    });

    it("should reject number", () => {
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    it("should reject uppercase version", () => {
      expect(() => schema.parse("DISTRIBUTION")).toThrow(ZodError);
    });
  });

  describe("type inference", () => {
    it("should correctly infer the type", () => {
      const _result = schema.parse("distribution");
      type CheckType = typeof _result extends AddonCategory ? true : false;
      const isCorrectType: CheckType = true;
      expect(isCorrectType).toBe(true);
    });
  });
});

describe("addonFactoryTypeId", () => {
  const schema = addonFactoryTypeId();

  it("should have correct description", () => {
    expect(schema.description).toBe("Addon factory typeId identifier");
  });

  describe("valid inputs", () => {
    it.each([...addonFactoryTypeIds])('should accept "%s"', (typeId) => {
      const result = schema.parse(typeId);
      expect(result).toBe(typeId);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid factory typeId", () => {
      expect(() => schema.parse("InvalidFactory")).toThrow(ZodError);
    });

    it("should reject empty string", () => {
      expect(() => schema.parse("")).toThrow(ZodError);
    });

    it("should reject null", () => {
      expect(() => schema.parse(null)).toThrow(ZodError);
    });

    it("should reject undefined", () => {
      expect(() => schema.parse(undefined)).toThrow(ZodError);
    });

    it("should reject number", () => {
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    it("should reject lowercase version", () => {
      expect(() => schema.parse("atkpushairdropfactory")).toThrow(ZodError);
    });
  });

  describe("type inference", () => {
    it("should correctly infer the type", () => {
      const _result = schema.parse("ATKPushAirdropFactory");
      type CheckType = typeof _result extends AddonFactoryTypeId ? true : false;
      const isCorrectType: CheckType = true;
      expect(isCorrectType).toBe(true);
    });
  });
});

describe("getFactoryTypeIdsFromAddonType", () => {
  it("should return correct factory typeIds for airdrops", () => {
    const result = getFactoryTypeIdsFromAddonType("airdrops");
    expect(result).toEqual([
      "ATKPushAirdropFactory",
      "ATKVestingAirdropFactory",
      "ATKTimeBoundAirdropFactory",
    ]);
  });

  it("should return correct factory typeIds for yield", () => {
    const result = getFactoryTypeIdsFromAddonType("yield");
    expect(result).toEqual(["ATKFixedYieldScheduleFactory"]);
  });

  it("should return correct factory typeIds for xvp", () => {
    const result = getFactoryTypeIdsFromAddonType("xvp");
    expect(result).toEqual(["ATKXvPSettlementFactory"]);
  });
});

describe("getAddonCategoryFromFactoryTypeId", () => {
  it("should return distribution for airdrop factories", () => {
    expect(getAddonCategoryFromFactoryTypeId("ATKPushAirdropFactory")).toBe(
      "distribution"
    );
    expect(getAddonCategoryFromFactoryTypeId("ATKVestingAirdropFactory")).toBe(
      "distribution"
    );
    expect(
      getAddonCategoryFromFactoryTypeId("ATKTimeBoundAirdropFactory")
    ).toBe("distribution");
  });

  it("should return income for yield factory", () => {
    expect(
      getAddonCategoryFromFactoryTypeId("ATKFixedYieldScheduleFactory")
    ).toBe("income");
  });

  it("should return exchange for XvP factory", () => {
    expect(getAddonCategoryFromFactoryTypeId("ATKXvPSettlementFactory")).toBe(
      "exchange"
    );
  });

  it("should return custody for vault factory", () => {
    expect(getAddonCategoryFromFactoryTypeId("ATKVaultFactory")).toBe(
      "custody"
    );
  });

  it("should return distribution for unknown", () => {
    expect(getAddonCategoryFromFactoryTypeId("unknown")).toBe("distribution");
  });
});

describe("constants", () => {
  it("should export addonTypes as const tuple", () => {
    expect(addonTypes).toEqual(["airdrops", "yield", "xvp"]);
    expect(addonTypes.length).toBe(3);
  });

  it("should export addonCategories as const tuple", () => {
    expect(addonCategories).toEqual([
      "distribution",
      "exchange",
      "custody",
      "income",
    ]);
    expect(addonCategories.length).toBe(4);
  });

  it("should export addonFactoryTypeIds as const tuple", () => {
    expect(addonFactoryTypeIds).toEqual([
      "ATKPushAirdropFactory",
      "ATKVestingAirdropFactory",
      "ATKTimeBoundAirdropFactory",
      "ATKFixedYieldScheduleFactory",
      "ATKXvPSettlementFactory",
      "ATKVaultFactory",
      "unknown",
    ]);
    expect(addonFactoryTypeIds.length).toBe(7);
  });
});
