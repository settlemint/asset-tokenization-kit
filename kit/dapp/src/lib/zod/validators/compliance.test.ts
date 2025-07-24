/**
 * Tests for Compliance Module Validation Utilities
 */

import { describe, expect, it } from "bun:test";
import { z } from "zod";
import {
  complianceModulePair,
  complianceModulePairArray,
  complianceParams,
  complianceTypeId,
  ComplianceTypeIdEnum,
  complianceTypeIds,
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
        values: [
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        ],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      expect(result.values).toHaveLength(2);
      // Addresses should be normalized to checksummed format
      expect(result.values[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });

    it("should reject invalid addresses", () => {
      const invalidParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0xinvalid", "not-an-address"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty address array", () => {
      const emptyParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryAllowListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["US", "GB", "FR", "DE"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryAllowListComplianceModule");
      expect(result.values).toEqual(["US", "GB", "FR", "DE"]);
    });

    it("should reject invalid country codes", () => {
      const invalidParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["USA", "us", "XX", "123"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty country array", () => {
      const emptyParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryBlockListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryBlockListComplianceModule" as const,
        values: ["CN", "RU", "IR"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryBlockListComplianceModule");
      expect(result.values).toEqual(["CN", "RU", "IR"]);
    });
  });

  describe("IdentityAllowListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityAllowListComplianceModule");
      expect(result.values[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });
  });

  describe("IdentityBlockListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityBlockListComplianceModule" as const,
        values: ["0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityBlockListComplianceModule");
      expect(result.values[0]).toBe(
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
      );
    });
  });

  describe("SMARTIdentityVerificationComplianceModule", () => {
    it("should accept empty parameters", () => {
      const validParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("SMARTIdentityVerificationComplianceModule");
      expect(result.values).toEqual([]);
    });
  });

  describe("type discrimination", () => {
    it("should properly discriminate by typeId", () => {
      const addressParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      const countryParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["US"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      expect(() => validator.parse(addressParams)).not.toThrow();
      expect(() => validator.parse(countryParams)).not.toThrow();
    });

    it("should reject wrong parameter types for given typeId", () => {
      // Address module with country codes should fail
      const wrongParams1 = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["US", "GB"], // Country codes instead of addresses
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(wrongParams1)).toThrow();

      // Country module with addresses should fail
      const wrongParams2 = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"], // Address instead of country codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(() => validator.parse(wrongParams2)).toThrow();
    });
  });
});

describe("complianceModulePair", () => {
  const validator = complianceModulePair();

  it("should accept valid compliance module pairs", () => {
    const addressPair = {
      typeId: "AddressBlockListComplianceModule" as const,
      values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      params:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    };
    const countryPair = {
      typeId: "CountryAllowListComplianceModule" as const,
      values: ["US", "GB"],
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      params:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    };
    const smartPair = {
      typeId: "SMARTIdentityVerificationComplianceModule" as const,
      values: [],
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      params:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    };

    expect(() => validator.parse(addressPair)).not.toThrow();
    expect(() => validator.parse(countryPair)).not.toThrow();
    expect(() => validator.parse(smartPair)).not.toThrow();

    const addressResult = validator.parse(addressPair);
    expect(addressResult.typeId).toBe("AddressBlockListComplianceModule");
    expect(addressResult.values).toHaveLength(1);
  });

  it("should reject invalid compliance module pairs", () => {
    const invalidPair = {
      typeId: "InvalidModule",
      values: [],
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      params:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    };
    expect(() => validator.parse(invalidPair)).toThrow();
  });
});

describe("complianceModulePairArray", () => {
  const validator = complianceModulePairArray();

  it("should accept valid arrays of compliance module pairs", () => {
    const validPairs = [
      {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["US", "GB"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    ];

    const result = validator.parse(validPairs);
    expect(result).toHaveLength(2);
    expect(result[0]?.typeId).toBe("AddressBlockListComplianceModule");
    expect(result[1]?.typeId).toBe("CountryAllowListComplianceModule");
  });

  it("should accept empty arrays", () => {
    const result = validator.parse([]);
    expect(result).toEqual([]);
  });

  it("should use default empty array when no value provided", () => {
    const result = validator.parse(undefined);
    expect(result).toEqual([]);
  });

  it("should reject arrays with invalid pairs", () => {
    const invalidPairs = [
      {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      {
        typeId: "InvalidModule",
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    ];
    expect(() => validator.parse(invalidPairs)).toThrow();
  });

  it("should reject non-array types", () => {
    expect(() => validator.parse("not-an-array")).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
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
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      });
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      if (result.typeId === "AddressBlockListComplianceModule") {
        // TypeScript should know values is Address[] here
        expect(Array.isArray(result.values)).toBe(true);
      }
    });

    it("should handle safeParse", () => {
      const result = complianceParams().safeParse({
        typeId: "CountryAllowListComplianceModule",
        values: ["US", "GB"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.typeId).toBe("CountryAllowListComplianceModule");
        if (result.data.typeId === "CountryAllowListComplianceModule") {
          expect(result.data.values).toEqual(["US", "GB"]);
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
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };
    expect(() => complianceConfigSchema.parse(validConfig)).not.toThrow();

    const invalidConfig = {
      name: "Invalid Config",
      config: {
        typeId: "InvalidModule",
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        params:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };
    expect(() => complianceConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should work with transforms", () => {
    const complianceWithMeta = complianceTypeId().transform((typeId) => ({
      typeId,
      isAddressBased: [
        "AddressBlockListComplianceModule",
        "IdentityAllowListComplianceModule",
        "IdentityBlockListComplianceModule",
      ].includes(typeId),
      isCountryBased: [
        "CountryAllowListComplianceModule",
        "CountryBlockListComplianceModule",
      ].includes(typeId),
    }));

    const result = complianceWithMeta.parse("AddressBlockListComplianceModule");
    expect(result).toEqual({
      typeId: "AddressBlockListComplianceModule",
      isAddressBased: true,
      isCountryBased: false,
    });
  });
});
