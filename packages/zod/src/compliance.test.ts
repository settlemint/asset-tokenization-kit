/**
 * Tests for Compliance Module Validation Utilities
 */

import { describe, expect, it } from "bun:test";
import * as z from "zod";
import {
  addressBlockListValues,
  complianceModulePair,
  complianceModulePairArray,
  complianceParams,
  complianceTypeId,
  ComplianceTypeIdEnum,
  complianceTypeIds,
  countryAllowListValues,
  countryBlockListValues,
  identityAllowListValues,
  identityBlockListValues,
  smartIdentityVerificationValues,
} from "./compliance";
import { getTopicId } from "./topics";

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
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty address array", () => {
      const emptyParams = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryAllowListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [840, 826, 250, 276], // US, GB, FR, DE as numeric codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryAllowListComplianceModule");
      expect(result.values).toEqual([840, 826, 250, 276]);
    });

    it("should reject invalid country codes", () => {
      const invalidParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [999, 1000, -1, 0], // Invalid numeric codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty country array", () => {
      const emptyParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("CountryBlockListComplianceModule", () => {
    it("should accept valid country codes", () => {
      const validParams = {
        typeId: "CountryBlockListComplianceModule" as const,
        values: [156, 643, 364], // CN, RU, IR as numeric codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("CountryBlockListComplianceModule");
      expect(result.values).toEqual([156, 643, 364]);
    });
  });

  describe("IdentityAllowListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: [
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        ],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityAllowListComplianceModule");
      expect(result.values).toHaveLength(2);
      // Addresses should be normalized to checksummed format
      expect(result.values[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });

    it("should reject invalid addresses", () => {
      const invalidParams = {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: ["0xinvalid", "not-an-address"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty address array", () => {
      const emptyParams = {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("IdentityBlockListComplianceModule", () => {
    it("should accept valid identity addresses", () => {
      const validParams = {
        typeId: "IdentityBlockListComplianceModule" as const,
        values: [
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        ],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("IdentityBlockListComplianceModule");
      expect(result.values).toHaveLength(2);
      // Addresses should be normalized to checksummed format
      expect(result.values[0]).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
    });

    it("should reject invalid addresses", () => {
      const invalidParams = {
        typeId: "IdentityBlockListComplianceModule" as const,
        values: ["0xinvalid", "not-an-address"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(invalidParams)).toThrow();
    });

    it("should accept empty address array", () => {
      const emptyParams = {
        typeId: "IdentityBlockListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(emptyParams)).not.toThrow();
    });
  });

  describe("SMARTIdentityVerificationComplianceModule", () => {
    it("should accept valid expression nodes", () => {
      const validParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        values: [
          { nodeType: 0, value: getTopicId("knowYourCustomer") }, // TOPIC node with real KYC topic ID
          "(",
          { nodeType: 0, value: getTopicId("antiMoneyLaundering") }, // TOPIC node with real AML topic ID
          { nodeType: 0, value: getTopicId("collateral") }, // TOPIC node with real collateral topic ID
          { nodeType: 1, value: 0n }, // AND node
          ")",
        ],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(validParams);
      expect(result.typeId).toBe("SMARTIdentityVerificationComplianceModule");
      expect(result.values).toHaveLength(6);
      expect(result.values[0]).toEqual({
        nodeType: 0,
        value: getTopicId("knowYourCustomer"),
      });
    });

    it("should accept empty expression array", () => {
      const emptyParams = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      const result = validator.parse(emptyParams);
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
      };

      const countryParams = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [840], // US as numeric code
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };

      expect(() => validator.parse(addressParams)).not.toThrow();
      expect(() => validator.parse(countryParams)).not.toThrow();
    });

    it("should reject wrong parameter types for given typeId", () => {
      // Address module with country codes should fail
      const wrongParams1 = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [840, 826], // Numeric country codes instead of addresses
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(wrongParams1)).toThrow();

      // Country module with addresses should fail
      const wrongParams2 = {
        typeId: "CountryAllowListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"], // Address instead of numeric country codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(wrongParams2)).toThrow();

      // Identity module with expression nodes should fail
      const wrongParams3 = {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: [{ nodeType: 0, value: 1n }], // Expression node instead of addresses
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(wrongParams3)).toThrow();

      // SMART Identity Verification with addresses should fail
      const wrongParams4 = {
        typeId: "SMARTIdentityVerificationComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"], // Address instead of expression nodes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => validator.parse(wrongParams4)).toThrow();
    });
  });

  describe("module and params field validation", () => {
    it("should reject invalid module addresses", () => {
      const invalidModule = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0xinvalid", // Invalid address
      };
      expect(() => validator.parse(invalidModule)).toThrow();
    });

    it("should reject missing 0x prefix in module", () => {
      const invalidModule = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [],
        module: "71c7656ec7ab88b098defb751b7401b5f6d8976f", // Missing 0x
      };
      expect(() => validator.parse(invalidModule)).toThrow();
    });

    it("should reject null/undefined module", () => {
      const missingModule = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [],
        module: null,
      };
      expect(() => validator.parse(missingModule)).toThrow();
    });

    it("should normalize module addresses to checksum format", () => {
      const lowerCaseModule = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f", // lowercase
      };
      const result = validator.parse(lowerCaseModule);
      expect(result.module).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
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
    };
    const countryPair = {
      typeId: "CountryAllowListComplianceModule" as const,
      values: [840, 826], // US, GB as numeric codes
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    };
    const smartPair = {
      typeId: "SMARTIdentityVerificationComplianceModule" as const,
      values: [],
      module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
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
      },
      {
        typeId: "CountryAllowListComplianceModule" as const,
        values: [840, 826], // US, GB as numeric codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
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
      },
      {
        typeId: "InvalidModule",
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
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

    it("should handle safeParse with invalid data", () => {
      const result = complianceTypeId().safeParse("InvalidModule");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("complianceParams", () => {
    it("should return proper discriminated union type", () => {
      const result = complianceParams().parse({
        typeId: "AddressBlockListComplianceModule",
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
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
        values: [840, 826], // US, GB as numeric codes
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.typeId).toBe("CountryAllowListComplianceModule");
        if (result.data.typeId === "CountryAllowListComplianceModule") {
          expect(result.data.values).toEqual([840, 826]);
        }
      }
    });

    it("should handle safeParse with missing fields", () => {
      const result = complianceParams().safeParse({
        typeId: "AddressBlockListComplianceModule",
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        // Missing module and params
      });
      expect(result.success).toBe(false);
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
      },
    };
    expect(() => complianceConfigSchema.parse(validConfig)).not.toThrow();

    const validIdentityConfig = {
      name: "Identity Allowlist",
      config: {
        typeId: "IdentityAllowListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      },
    };
    expect(() =>
      complianceConfigSchema.parse(validIdentityConfig)
    ).not.toThrow();

    const invalidConfig = {
      name: "Invalid Config",
      config: {
        typeId: "InvalidModule",
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
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
      isExpressionBased: ["SMARTIdentityVerificationComplianceModule"].includes(
        typeId
      ),
    }));

    const result = complianceWithMeta.parse("AddressBlockListComplianceModule");
    expect(result).toEqual({
      typeId: "AddressBlockListComplianceModule",
      isAddressBased: true,
      isCountryBased: false,
      isExpressionBased: false,
    });
  });
});

describe("Schema descriptions", () => {
  it("should have proper descriptions for all schemas", () => {
    expect(complianceTypeId().description).toBe(
      "Compliance module typeId identifier"
    );
    expect(complianceParams().description).toBe(
      "Compliance module configuration with type-specific parameters"
    );
    expect(complianceModulePair().description).toBe(
      "Compliance module pair with typeId and values"
    );
    expect(complianceModulePairArray().description).toBe(
      "Array of compliance module pairs for token initialization"
    );
  });
});

describe("Individual value validators", () => {
  describe("countryAllowListValues", () => {
    const validator = countryAllowListValues();

    it("should accept valid ISO numeric country codes", () => {
      const validCodes = [840, 826, 250, 276, 392, 156]; // US, GB, FR, DE, JP, CN
      const result = validator.parse(validCodes);
      expect(result).toEqual(validCodes);
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid country codes", () => {
      expect(() => validator.parse([999])).toThrow(); // invalid numeric code
      expect(() => validator.parse([0])).toThrow(); // invalid code
      expect(() => validator.parse([-1])).toThrow(); // negative code
      expect(() => validator.parse([1000])).toThrow(); // too high
    });

    it("should reject mixed valid and invalid codes", () => {
      expect(() => validator.parse([840, 826, 999, 276])).toThrow();
    });

    it("should reject non-numeric values", () => {
      expect(() => validator.parse(["US"])).toThrow(); // string code
      expect(() => validator.parse([null])).toThrow();
      expect(() => validator.parse([undefined])).toThrow();
      expect(() => validator.parse([{}])).toThrow();
    });

    it("should have proper description", () => {
      expect(validator.description).toBe("Array of ISO country codes to allow");
    });
  });

  describe("countryBlockListValues", () => {
    const validator = countryBlockListValues();

    it("should accept valid ISO numeric country codes", () => {
      const validCodes = [643, 156, 364, 408]; // RU, CN, IR, KP
      const result = validator.parse(validCodes);
      expect(result).toEqual(validCodes);
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid country codes", () => {
      expect(() => validator.parse([999])).toThrow(); // invalid numeric code
      expect(() => validator.parse([0])).toThrow(); // invalid code
      expect(() => validator.parse([-1])).toThrow(); // negative code
    });

    it("should have proper description", () => {
      expect(validator.description).toBe("Array of ISO country codes to block");
    });
  });

  describe("addressBlockListValues", () => {
    const validator = addressBlockListValues();

    it("should accept valid Ethereum addresses", () => {
      const addresses = [
        "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
        "0x0000000000000000000000000000000000000000",
      ];
      const result = validator.parse(addresses);
      // Should normalize to checksummed addresses
      expect(result[0]).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      expect(result[1]).toBe("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
      expect(result[2]).toBe("0x0000000000000000000000000000000000000000");
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid addresses", () => {
      expect(() => validator.parse(["0xinvalid"])).toThrow();
      expect(() =>
        validator.parse(["71c7656ec7ab88b098defb751b7401b5f6d8976f"])
      ).toThrow(); // missing 0x
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976"])
      ).toThrow(); // too short
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976fg"])
      ).toThrow(); // invalid hex
    });

    it("should reject mixed valid and invalid addresses", () => {
      expect(() =>
        validator.parse([
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "invalid-address",
        ])
      ).toThrow();
    });

    it("should have proper description", () => {
      expect(validator.description).toBe(
        "Array of Ethereum addresses to block"
      );
    });
  });

  describe("identityAllowListValues", () => {
    const validator = identityAllowListValues();

    it("should accept valid identity addresses", () => {
      const addresses = [
        "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
        "0x0000000000000000000000000000000000000000",
      ];
      const result = validator.parse(addresses);
      // Should normalize to checksummed addresses
      expect(result[0]).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      expect(result[1]).toBe("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
      expect(result[2]).toBe("0x0000000000000000000000000000000000000000");
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid addresses", () => {
      expect(() => validator.parse(["0xinvalid"])).toThrow();
      expect(() =>
        validator.parse(["71c7656ec7ab88b098defb751b7401b5f6d8976f"])
      ).toThrow(); // missing 0x
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976"])
      ).toThrow(); // too short
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976fg"])
      ).toThrow(); // invalid hex
    });

    it("should reject mixed valid and invalid addresses", () => {
      expect(() =>
        validator.parse([
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "invalid-address",
        ])
      ).toThrow();
    });

    it("should have proper description", () => {
      expect(validator.description).toBe(
        "Array of identity contract addresses to allow"
      );
    });
  });

  describe("identityBlockListValues", () => {
    const validator = identityBlockListValues();

    it("should accept valid identity addresses", () => {
      const addresses = [
        "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
        "0x0000000000000000000000000000000000000000",
      ];
      const result = validator.parse(addresses);
      // Should normalize to checksummed addresses
      expect(result[0]).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      expect(result[1]).toBe("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
      expect(result[2]).toBe("0x0000000000000000000000000000000000000000");
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid addresses", () => {
      expect(() => validator.parse(["0xinvalid"])).toThrow();
      expect(() =>
        validator.parse(["71c7656ec7ab88b098defb751b7401b5f6d8976f"])
      ).toThrow(); // missing 0x
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976"])
      ).toThrow(); // too short
      expect(() =>
        validator.parse(["0x71c7656ec7ab88b098defb751b7401b5f6d8976fg"])
      ).toThrow(); // invalid hex
    });

    it("should reject mixed valid and invalid addresses", () => {
      expect(() =>
        validator.parse([
          "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
          "invalid-address",
        ])
      ).toThrow();
    });

    it("should have proper description", () => {
      expect(validator.description).toBe(
        "Array of identity contract addresses to block"
      );
    });
  });

  describe("smartIdentityVerificationValues", () => {
    const validator = smartIdentityVerificationValues();

    it("should accept valid expression nodes and groups", () => {
      const values = [
        { nodeType: 0, value: getTopicId("basePrice") }, // TOPIC node with basePrice topic ID
        "(",
        { nodeType: 0, value: getTopicId("knowYourCustomer") }, // TOPIC node with KYC topic ID
        { nodeType: 0, value: getTopicId("antiMoneyLaundering") }, // TOPIC node with AML topic ID
        { nodeType: 2, value: 0n }, // OR node
        ")",
        { nodeType: 1, value: 0n }, // AND node
      ];
      const result = validator.parse(values);
      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({
        nodeType: 0,
        value: getTopicId("basePrice"),
      });
      expect(result[1]).toBe("(");
      expect(result[6]).toEqual({ nodeType: 1, value: 0n });
    });

    it("should accept empty array", () => {
      const result = validator.parse([]);
      expect(result).toEqual([]);
    });

    it("should reject invalid expression values", () => {
      expect(() =>
        validator.parse(["0x1234567890123456789012345678901234567890"])
      ).toThrow();
      expect(() =>
        validator.parse([{ nodeType: "invalid", value: 1n }])
      ).toThrow();
      expect(() =>
        validator.parse([{ nodeType: 0, value: "not-bigint" }])
      ).toThrow();
    });

    it("should have proper description", () => {
      expect(validator.description).toBe("Array of expression nodes");
    });
  });
});

describe("Edge cases and error handling", () => {
  describe("complianceTypeId edge cases", () => {
    it("should handle empty strings in error messages", () => {
      try {
        complianceTypeId().parse("");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues).toBeDefined();
          expect(error.issues.length).toBeGreaterThan(0);
        }
      }
    });

    it("should handle boolean values", () => {
      expect(() => complianceTypeId().parse(true)).toThrow();
      expect(() => complianceTypeId().parse(false)).toThrow();
    });

    it("should handle array values", () => {
      expect(() => complianceTypeId().parse([])).toThrow();
      expect(() =>
        complianceTypeId().parse(["AddressBlockListComplianceModule"])
      ).toThrow();
    });
  });

  describe("complianceParams edge cases", () => {
    it("should reject objects without typeId", () => {
      const noTypeId = {
        values: [],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };
      expect(() => complianceParams().parse(noTypeId)).toThrow();
    });

    it("should reject empty objects", () => {
      expect(() => complianceParams().parse({})).toThrow();
    });

    it("should reject string values", () => {
      expect(() =>
        complianceParams().parse("AddressBlockListComplianceModule")
      ).toThrow();
    });

    it("should reject arrays", () => {
      expect(() => complianceParams().parse([])).toThrow();
    });

    it("should handle extra fields gracefully", () => {
      const withExtraFields = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        extraField: "should be ignored",
      };
      const result = complianceParams().parse(withExtraFields);
      expect(result.typeId).toBe("AddressBlockListComplianceModule");
      expect((result as { extraField?: unknown }).extraField).toBeUndefined();
    });
  });

  describe("Array validators edge cases", () => {
    it("should handle non-array values for array validators", () => {
      expect(() => countryAllowListValues().parse(840)).toThrow(); // single number instead of array
      expect(() => countryBlockListValues().parse(156)).toThrow(); // single number instead of array
      expect(() => addressBlockListValues().parse({})).toThrow();
      expect(() => identityAllowListValues().parse(null)).toThrow();
      expect(() => identityBlockListValues().parse(undefined)).toThrow();
      expect(() => smartIdentityVerificationValues().parse(false)).toThrow();
    });

    it("should handle nested arrays", () => {
      expect(() => countryAllowListValues().parse([[840]])).toThrow(); // nested numeric codes
      expect(() =>
        addressBlockListValues().parse([
          ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
        ])
      ).toThrow();
    });

    it("should handle objects in arrays", () => {
      expect(() => countryAllowListValues().parse([{ code: 840 }])).toThrow(); // object instead of number
      expect(() =>
        addressBlockListValues().parse([
          { address: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f" },
        ])
      ).toThrow();
    });
  });

  describe("complianceModulePairArray edge cases", () => {
    it("should handle single invalid item in array", () => {
      const mixedArray = [
        {
          typeId: "AddressBlockListComplianceModule" as const,
          values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"],
          module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        },
        null, // Invalid item
      ];
      expect(() => complianceModulePairArray().parse(mixedArray)).toThrow();
    });

    it("should handle deeply nested invalid data", () => {
      const nestedInvalid = [
        {
          typeId: "CountryAllowListComplianceModule" as const,
          values: [840, "invalid"], // Invalid country code (mixed with string)
          module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        },
      ];
      expect(() => complianceModulePairArray().parse(nestedInvalid)).toThrow();
    });

    it("should preserve order of valid items", () => {
      const orderedArray = [
        {
          typeId: "CountryAllowListComplianceModule" as const,
          values: [840], // US as numeric code
          module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        },
        {
          typeId: "AddressBlockListComplianceModule" as const,
          values: ["0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"],
          module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        },
      ];
      const result = complianceModulePairArray().parse(orderedArray);
      expect(result[0]?.typeId).toBe("CountryAllowListComplianceModule");
      expect(result[1]?.typeId).toBe("AddressBlockListComplianceModule");
    });
  });

  describe("Discriminated union behavior", () => {
    it("should provide clear error for mismatched typeId and values", () => {
      const mismatch = {
        typeId: "AddressBlockListComplianceModule" as const,
        values: [840, 826], // Numeric country codes for address module (should fail)
        module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };

      try {
        complianceParams().parse(mismatch);
        throw new Error("Should have thrown");
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Should have validation error for invalid address format
          expect(error.issues).toBeDefined();
          expect(error.issues.length).toBeGreaterThan(0);
        }
      }
    });

    it("should handle all compliance module types", () => {
      // Test that all types in complianceTypeIds are handled
      complianceTypeIds.forEach((typeId) => {
        const hasCase = (() => {
          try {
            const testData = {
              typeId,
              values: [],
              module: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
            };
            complianceParams().parse(testData);
            return true;
          } catch {
            return false;
          }
        })();
        expect(hasCase).toBe(true);
      });
    });
  });
});
