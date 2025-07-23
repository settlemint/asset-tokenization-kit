/**
 * Tests for Compliance Module Validation Utilities
 */

import { describe, expect, it } from "bun:test";
import { z } from "zod";
import {
  type ComplianceTypeId,
  ComplianceTypeIdEnum,
  complianceParams,
  complianceTypeId,
  complianceTypeIdArray,
  complianceTypeIdRecord,
  complianceTypeIds,
  complianceTypeIdSet,
  complianceTypeIdWithDefault,
  getComplianceDescription,
  getComplianceParams,
  getComplianceTypeId,
  getComplianceTypeIdArray,
  getComplianceTypeIdSet,
  isAddressBasedCompliance,
  isComplianceParams,
  isComplianceTypeId,
  isComplianceTypeIdArray,
  isComplianceTypeIdSet,
  isCountryBasedCompliance,
} from "./compliance";

describe("complianceTypeId", () => {
  const validator = complianceTypeId();

  describe("valid compliance typeIds", () => {
    it.each([...complianceTypeIds])("should accept '%s'", (typeId) => {
      expect(validator.parse(typeId)).toBe(typeId);
    });
  });

  describe("invalid compliance typeIds", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("InvalidModule")).toThrow();
      expect(() => validator.parse("AddressModule")).toThrow();
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() =>
        validator.parse("addressblocklistcompliancemodule")
      ).toThrow();
      expect(() =>
        validator.parse("ADDRESSBLOCKLISTCOMPLIANCEMODULE")
      ).toThrow();
      expect(() =>
        validator.parse("AddressBlockListcomplianceModule")
      ).toThrow();
    });
  });
});

describe("ComplianceTypeIdEnum", () => {
  it("should have all compliance typeIds", () => {
    expect(ComplianceTypeIdEnum.AddressBlockListComplianceModule).toBe(
      "AddressBlockListComplianceModule"
    );
    expect(ComplianceTypeIdEnum.CountryAllowListComplianceModule).toBe(
      "CountryAllowListComplianceModule"
    );
    expect(ComplianceTypeIdEnum.CountryBlockListComplianceModule).toBe(
      "CountryBlockListComplianceModule"
    );
    expect(ComplianceTypeIdEnum.IdentityAllowListComplianceModule).toBe(
      "IdentityAllowListComplianceModule"
    );
    expect(ComplianceTypeIdEnum.IdentityBlockListComplianceModule).toBe(
      "IdentityBlockListComplianceModule"
    );
    expect(ComplianceTypeIdEnum.SMARTIdentityVerificationComplianceModule).toBe(
      "SMARTIdentityVerificationComplianceModule"
    );
  });

  it("should match complianceTypeIds array", () => {
    const enumValues = Object.values(ComplianceTypeIdEnum);
    expect(enumValues).toEqual([...complianceTypeIds]);
  });
});

describe("complianceParams", () => {
  const validator = complianceParams();

  describe("AddressBlockListComplianceModule", () => {
    it("should accept valid address parameters", () => {
      const validParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: [
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        ],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      expect(result.params).toHaveLength(2);
      // Addresses should be normalized to checksummed format
      expect(result.params[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });

    it("should reject invalid addresses", () => {
      const invalidParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["0xinvalid", "not-an-address"],
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty address array", () => {
      const emptyParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: [],
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryAllowListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        params: ["US", "GB", "FR", "DE"],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryAllowListComplianceModule");
      expect(result.params).toEqual(["US", "GB", "FR", "DE"]);
    });

    it("should reject invalid country codes", () => {
      const invalidParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        params: ["USA", "us", "XX", "123"],
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty country array", () => {
      const emptyParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        params: [],
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryBlockListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryBlockListComplianceModule" as const,
        params: ["CN", "RU", "IR"],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryBlockListComplianceModule");
      expect(result.params).toEqual(["CN", "RU", "IR"]);
    });
  });

  describe("IdentityAllowListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityAllowListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityAllowListComplianceModule");
      expect(result.params[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });
  });

  describe("IdentityBlockListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityBlockListComplianceModule" as const,
        params: ["0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityBlockListComplianceModule");
      expect(result.params[0]).toBe(
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
      );
    });
  });

  describe("SMARTIdentityVerificationComplianceModule", () => {
    it("should accept empty parameters", () => {
      const validParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        params: [],
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("SMARTIdentityVerificationComplianceModule");
      expect(result.params).toEqual([]);
    });

    it("should use default empty array when params not provided", () => {
      const validParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
      };
      const result = validator.parse(validParams);
      expect(result.params).toEqual([]);
    });

    it("should reject non-empty parameters", () => {
      const invalidParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        params: ["some-param"],
      };
      expect(() => validator.parse(invalidParams)).toThrow(
        "SMART Identity Verification module does not accept parameters"
      );
    });
  });

  describe("type discrimination", () => {
    it("should properly discriminate by typeId", () => {
      const addressParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      };

      const countryParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        params: ["US"],
      };

      expect(() => validator.parse(addressParams)).not.toThrow();
      expect(() => validator.parse(countryParams)).not.toThrow();
    });

    it("should reject wrong parameter types for given typeId", () => {
      // Address module with country codes should fail
      const wrongParams1 = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["US", "GB"], // Country codes instead of addresses
      };
      expect(() => validator.parse(wrongParams1)).toThrow();

      // Country module with addresses should fail
      const wrongParams2 = {
        typeId: "CountryAllowListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"], // Address instead of country codes
      };
      expect(() => validator.parse(wrongParams2)).toThrow();
    });
  });
});

describe("complianceTypeIdArray", () => {
  const validator = complianceTypeIdArray();

  it("should accept valid arrays", () => {
    const single: ComplianceTypeId[] = ["AddressBlockListComplianceModule"];
    const multiple: ComplianceTypeId[] = [
      "AddressBlockListComplianceModule",
      "CountryAllowListComplianceModule",
    ];
    const all = [...complianceTypeIds];

    expect(validator.parse(single)).toEqual(single);
    expect(validator.parse(multiple)).toEqual(multiple);
    expect(validator.parse(all)).toEqual(all);
  });

  it("should allow duplicates", () => {
    const duplicates: ComplianceTypeId[] = [
      "AddressBlockListComplianceModule",
      "AddressBlockListComplianceModule",
    ];
    expect(validator.parse(duplicates)).toEqual(duplicates);
  });

  it("should reject empty arrays", () => {
    expect(() => validator.parse([])).toThrow(
      "At least one compliance module must be selected"
    );
  });

  it("should reject invalid typeIds in array", () => {
    expect(() =>
      validator.parse(["AddressBlockListComplianceModule", "InvalidModule"])
    ).toThrow();
  });

  it("should reject non-array types", () => {
    expect(() => validator.parse("AddressBlockListComplianceModule")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
    expect(() => validator.parse(undefined)).toThrow();
  });
});

describe("complianceTypeIdSet", () => {
  const validator = complianceTypeIdSet();

  it("should accept valid sets", () => {
    const testSet = new Set([
      "AddressBlockListComplianceModule",
      "CountryAllowListComplianceModule",
    ]);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(
      result.has("AddressBlockListComplianceModule" as ComplianceTypeId)
    ).toBe(true);
    expect(
      result.has("CountryAllowListComplianceModule" as ComplianceTypeId)
    ).toBe(true);
  });

  it("should deduplicate values", () => {
    const testSet = new Set([
      "AddressBlockListComplianceModule",
      "AddressBlockListComplianceModule",
      "CountryAllowListComplianceModule",
    ]);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);
  });

  it("should reject empty sets", () => {
    const emptySet = new Set();
    expect(() => validator.parse(emptySet)).toThrow(
      "At least one compliance module must be selected"
    );
  });

  it("should reject sets with invalid values", () => {
    const invalidSet = new Set([
      "AddressBlockListComplianceModule",
      "InvalidModule",
    ]);
    expect(() => validator.parse(invalidSet)).toThrow();
  });

  it("should reject non-set types", () => {
    expect(() =>
      validator.parse(["AddressBlockListComplianceModule"])
    ).toThrow();
    expect(() => validator.parse("AddressBlockListComplianceModule")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
  });
});

describe("complianceTypeIdWithDefault", () => {
  it("should use provided default", () => {
    const defaultTypeId = complianceTypeId().parse(
      "CountryAllowListComplianceModule"
    );
    const validator = complianceTypeIdWithDefault(defaultTypeId);
    expect(validator.parse(undefined)).toBe(
      "CountryAllowListComplianceModule" as ComplianceTypeId
    );
  });

  it("should use 'AddressBlockListComplianceModule' as default when not specified", () => {
    const validator = complianceTypeIdWithDefault();
    expect(validator.parse(undefined)).toBe(
      "AddressBlockListComplianceModule" as ComplianceTypeId
    );
  });

  it("should accept valid values", () => {
    const defaultTypeId = complianceTypeId().parse(
      "CountryAllowListComplianceModule"
    );
    const validator = complianceTypeIdWithDefault(defaultTypeId);
    expect(validator.parse("IdentityAllowListComplianceModule")).toBe(
      "IdentityAllowListComplianceModule" as ComplianceTypeId
    );
  });
});

describe("complianceTypeIdRecord", () => {
  it("should validate record with string values", () => {
    const validator = complianceTypeIdRecord(z.string());
    const result = validator.parse({
      AddressBlockListComplianceModule: "Block malicious addresses",
      CountryAllowListComplianceModule: "Allow specific countries",
    });
    expect(result.AddressBlockListComplianceModule).toBe(
      "Block malicious addresses"
    );
    expect(result.CountryAllowListComplianceModule).toBe(
      "Allow specific countries"
    );
  });

  it("should validate record with object values", () => {
    const validator = complianceTypeIdRecord(
      z.object({
        enabled: z.boolean(),
        severity: z.enum(["low", "medium", "high"]),
      })
    );
    const result = validator.parse({
      AddressBlockListComplianceModule: { enabled: true, severity: "high" },
      CountryBlockListComplianceModule: { enabled: false, severity: "medium" },
    });
    expect(result.AddressBlockListComplianceModule?.enabled).toBe(true);
    expect(result.CountryBlockListComplianceModule?.severity).toBe("medium");
  });

  it("should reject invalid keys", () => {
    const validator = complianceTypeIdRecord(z.string());
    expect(() =>
      validator.parse({
        AddressBlockListComplianceModule: "Valid",
        InvalidModule: "Invalid key",
      })
    ).toThrow();
  });

  it("should validate empty records", () => {
    const validator = complianceTypeIdRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });
});

describe("utility functions", () => {
  describe("isAddressBasedCompliance", () => {
    it("should return true for address-based modules", () => {
      expect(isAddressBasedCompliance("AddressBlockListComplianceModule")).toBe(
        true
      );
      expect(
        isAddressBasedCompliance("IdentityAllowListComplianceModule")
      ).toBe(true);
      expect(
        isAddressBasedCompliance("IdentityBlockListComplianceModule")
      ).toBe(true);
    });

    it("should return false for non-address-based modules", () => {
      expect(isAddressBasedCompliance("CountryAllowListComplianceModule")).toBe(
        false
      );
      expect(isAddressBasedCompliance("CountryBlockListComplianceModule")).toBe(
        false
      );
      expect(
        isAddressBasedCompliance("SMARTIdentityVerificationComplianceModule")
      ).toBe(false);
    });
  });

  describe("isCountryBasedCompliance", () => {
    it("should return true for country-based modules", () => {
      expect(isCountryBasedCompliance("CountryAllowListComplianceModule")).toBe(
        true
      );
      expect(isCountryBasedCompliance("CountryBlockListComplianceModule")).toBe(
        true
      );
    });

    it("should return false for non-country-based modules", () => {
      expect(isCountryBasedCompliance("AddressBlockListComplianceModule")).toBe(
        false
      );
      expect(
        isCountryBasedCompliance("IdentityAllowListComplianceModule")
      ).toBe(false);
      expect(
        isCountryBasedCompliance("IdentityBlockListComplianceModule")
      ).toBe(false);
      expect(
        isCountryBasedCompliance("SMARTIdentityVerificationComplianceModule")
      ).toBe(false);
    });
  });

  describe("getComplianceDescription", () => {
    it("should return correct descriptions", () => {
      expect(getComplianceDescription("AddressBlockListComplianceModule")).toBe(
        "Blocks specific addresses from transactions"
      );
      expect(getComplianceDescription("CountryAllowListComplianceModule")).toBe(
        "Allows transactions only from specific countries"
      );
      expect(getComplianceDescription("CountryBlockListComplianceModule")).toBe(
        "Blocks transactions from specific countries"
      );
      expect(
        getComplianceDescription("IdentityAllowListComplianceModule")
      ).toBe("Allows transactions only from specific identities");
      expect(
        getComplianceDescription("IdentityBlockListComplianceModule")
      ).toBe("Blocks transactions from specific identities");
      expect(
        getComplianceDescription("SMARTIdentityVerificationComplianceModule")
      ).toBe("Verifies identity using SMART protocol");
    });
  });
});

describe("type guards", () => {
  describe("isComplianceTypeId", () => {
    it("should return true for valid typeIds", () => {
      expect(isComplianceTypeId("AddressBlockListComplianceModule")).toBe(true);
      expect(isComplianceTypeId("CountryAllowListComplianceModule")).toBe(true);
      expect(
        isComplianceTypeId("SMARTIdentityVerificationComplianceModule")
      ).toBe(true);
    });

    it("should return false for invalid typeIds", () => {
      expect(isComplianceTypeId("InvalidModule")).toBe(false);
      expect(isComplianceTypeId("")).toBe(false);
      expect(isComplianceTypeId(null)).toBe(false);
      expect(isComplianceTypeId(undefined)).toBe(false);
    });

    it("should work as a type guard", () => {
      const typeId = "AddressBlockListComplianceModule";
      if (isComplianceTypeId(typeId)) {
        // TypeScript should recognize typeId as ComplianceTypeId here
        const typedTypeId: ComplianceTypeId = typeId;
        expect(typedTypeId).toBe("AddressBlockListComplianceModule");
      }
    });
  });

  describe("isComplianceParams", () => {
    it("should return true for valid params", () => {
      const validParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      };
      expect(isComplianceParams(validParams)).toBe(true);
    });

    it("should return false for invalid params", () => {
      const invalidParams = {
        typeId: "InvalidModule",
        params: [],
      };
      expect(isComplianceParams(invalidParams)).toBe(false);
    });
  });

  describe("isComplianceTypeIdArray", () => {
    it("should return true for valid arrays", () => {
      expect(
        isComplianceTypeIdArray(["AddressBlockListComplianceModule"])
      ).toBe(true);
      expect(
        isComplianceTypeIdArray([
          "AddressBlockListComplianceModule",
          "CountryAllowListComplianceModule",
        ])
      ).toBe(true);
    });

    it("should return false for invalid arrays", () => {
      expect(isComplianceTypeIdArray([])).toBe(false); // Empty array
      expect(isComplianceTypeIdArray(["InvalidModule"])).toBe(false);
      expect(isComplianceTypeIdArray("not-an-array")).toBe(false);
    });
  });

  describe("isComplianceTypeIdSet", () => {
    it("should return true for valid sets", () => {
      expect(
        isComplianceTypeIdSet(new Set(["AddressBlockListComplianceModule"]))
      ).toBe(true);
      expect(
        isComplianceTypeIdSet(
          new Set([
            "AddressBlockListComplianceModule",
            "CountryAllowListComplianceModule",
          ])
        )
      ).toBe(true);
    });

    it("should return false for invalid sets", () => {
      expect(isComplianceTypeIdSet(new Set())).toBe(false); // Empty set
      expect(isComplianceTypeIdSet(new Set(["InvalidModule"]))).toBe(false);
      expect(isComplianceTypeIdSet(["not-a-set"])).toBe(false);
    });
  });
});

describe("parser functions", () => {
  describe("getComplianceTypeId", () => {
    it("should parse valid typeIds", () => {
      expect(getComplianceTypeId("AddressBlockListComplianceModule")).toBe(
        "AddressBlockListComplianceModule"
      );
      expect(getComplianceTypeId("CountryAllowListComplianceModule")).toBe(
        "CountryAllowListComplianceModule"
      );
    });

    it("should throw for invalid typeIds", () => {
      expect(() => getComplianceTypeId("InvalidModule")).toThrow();
      expect(() => getComplianceTypeId("")).toThrow();
      expect(() => getComplianceTypeId(null)).toThrow();
    });
  });

  describe("getComplianceParams", () => {
    it("should parse valid params", () => {
      const validParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      };
      const result = getComplianceParams(validParams);
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      expect(result.params).toHaveLength(1);
    });

    it("should throw for invalid params", () => {
      const invalidParams = {
        typeId: "InvalidModule",
        params: [],
      };
      expect(() => getComplianceParams(invalidParams)).toThrow();
    });
  });

  describe("getComplianceTypeIdArray", () => {
    it("should parse valid arrays", () => {
      const validArray = [
        "AddressBlockListComplianceModule",
        "CountryAllowListComplianceModule",
      ];
      const result = getComplianceTypeIdArray(validArray);
      expect(result).toEqual(validArray);
    });

    it("should throw for invalid arrays", () => {
      expect(() => getComplianceTypeIdArray([])).toThrow();
      expect(() => getComplianceTypeIdArray(["InvalidModule"])).toThrow();
    });
  });

  describe("getComplianceTypeIdSet", () => {
    it("should parse valid sets", () => {
      const validSet = new Set([
        "AddressBlockListComplianceModule",
        "CountryAllowListComplianceModule",
      ]);
      const result = getComplianceTypeIdSet(validSet);
      expect(result).toEqual(validSet);
    });

    it("should throw for invalid sets", () => {
      expect(() => getComplianceTypeIdSet(new Set())).toThrow();
      expect(() =>
        getComplianceTypeIdSet(new Set(["InvalidModule"]))
      ).toThrow();
    });
  });
});

describe("type safety", () => {
  describe("complianceTypeId", () => {
    it("should return proper type", () => {
      const result = complianceTypeId().parse(
        "AddressBlockListComplianceModule"
      );
      expect(result).toBe("AddressBlockListComplianceModule");
    });

    it("should handle safeParse", () => {
      const result = complianceTypeId().safeParse(
        "CountryAllowListComplianceModule"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("CountryAllowListComplianceModule");
      }
    });
  });

  describe("complianceParams", () => {
    it("should return proper discriminated union type", () => {
      const result = complianceParams().parse({
        typeId: "AddressBlockListComplianceModule",
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      });
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      if (result.typeId === "AddressBlockListComplianceModule") {
        // TypeScript should know params is Address[] here
        expect(Array.isArray(result.params)).toBe(true);
      }
    });

    it("should handle safeParse", () => {
      const result = complianceParams().safeParse({
        typeId: "CountryAllowListComplianceModule",
        params: ["US", "GB"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.typeId).toBe("CountryAllowListComplianceModule");
        if (result.data.typeId === "CountryAllowListComplianceModule") {
          expect(result.data.params).toEqual(["US", "GB"]);
        }
      }
    });
  });
});

describe("integration with Zod schemas", () => {
  it("should work in object schemas", () => {
    const complianceConfigSchema = z.object({
      name: z.string(),
      config: complianceParams(),
    });

    const validConfig = {
      name: "Address Blocklist",
      config: {
        typeId: "AddressBlockListComplianceModule" as const,
        params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      },
    };
    expect(() => complianceConfigSchema.parse(validConfig)).not.toThrow();

    const invalidConfig = {
      name: "Invalid Config",
      config: {
        typeId: "InvalidModule",
        params: [],
      },
    };
    expect(() => complianceConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should work with transforms", () => {
    const complianceWithDescription = complianceTypeId().transform(
      (typeId) => ({
        typeId,
        description: getComplianceDescription(typeId),
        isAddressBased: isAddressBasedCompliance(typeId),
        isCountryBased: isCountryBasedCompliance(typeId),
      })
    );

    const result = complianceWithDescription.parse(
      "AddressBlockListComplianceModule"
    );
    expect(result).toEqual({
      typeId: "AddressBlockListComplianceModule",
      description: "Blocks specific addresses from transactions",
      isAddressBased: true,
      isCountryBased: false,
    });
  });
});
