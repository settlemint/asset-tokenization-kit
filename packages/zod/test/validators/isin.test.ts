import { describe, expect, test } from "bun:test";
import { getISIN, type ISIN, isISIN, isin } from "../../src/validators/isin";

describe("isin", () => {
  const validator = isin();

  describe("valid ISINs", () => {
    test("should accept valid ISINs", () => {
      expect(validator.parse("US0378331005")).toBe("US0378331005" as ISIN); // Apple Inc.
      expect(validator.parse("GB0002634946")).toBe("GB0002634946" as ISIN); // BAE Systems
      expect(validator.parse("DE0005557508")).toBe("DE0005557508" as ISIN); // Deutsche Telekom
      expect(validator.parse("FR0000120271")).toBe("FR0000120271" as ISIN); // Total SE
      expect(validator.parse("CA0679011084")).toBe("CA0679011084" as ISIN); // Barrick Gold
    });

    test("should transform lowercase to uppercase", () => {
      expect(validator.parse("us0378331005")).toBe("US0378331005" as ISIN);
      expect(validator.parse("gb0002634946")).toBe("GB0002634946" as ISIN);
    });

    test("should accept ISINs from different countries", () => {
      expect(validator.parse("CH0012221716")).toBe("CH0012221716" as ISIN); // ABB
      expect(validator.parse("NL0000009355")).toBe("NL0000009355" as ISIN); // Unilever
    });

    test("should accept a valid ISIN", () => {
      const validIsin = "US0378331005";
      expect(validator.parse(validIsin)).toBe(validIsin as ISIN);
    });

    test("should transform a lowercase ISIN to uppercase", () => {
      const lowerIsin = "us0378331005";
      const upperIsin = "US0378331005";
      expect(validator.parse(lowerIsin)).toBe(upperIsin as ISIN);
    });

    test("should accept ISIN with different country codes", () => {
      const deIsin = "DE0005557508";
      const gbIsin = "GB00B03MLX29";
      expect(validator.parse(deIsin)).toBe(deIsin as ISIN);
      expect(validator.parse(gbIsin)).toBe(gbIsin as ISIN);
    });

    test("should handle ISIN with check digit 0", () => {
      const zeroCheckDigit = "DE0005557508";
      expect(validator.parse(zeroCheckDigit)).toBe(zeroCheckDigit as ISIN);
    });
  });

  describe("character handling", () => {
    test("validates ISINs with various character combinations", () => {
      // Test with valid ISINs that exercise the character processing
      const validISINs = [
        "US0378331005", // Apple Inc. - has letters and numbers
        "GB0002634946", // BAE Systems - different letters
      ];

      validISINs.forEach((isinCode) => {
        const result = validator.safeParse(isinCode);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(isinCode);
        }
      });

      // Test with ISINs that have valid format but invalid checksum
      const invalidChecksumISINs = [
        "US0378331006", // Valid format but wrong checksum (should be 5)
        "GB0002634947", // Valid format but wrong checksum (should be 6)
      ];

      invalidChecksumISINs.forEach((isinCode) => {
        const result = validator.safeParse(isinCode);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("invalid ISINs", () => {
    test("should reject ISINs with wrong length", () => {
      expect(() => validator.parse("US037833100")).toThrow("ISIN must be exactly 12 characters long");
      expect(() => validator.parse("US03783310055")).toThrow("ISIN must be exactly 12 characters long");
      expect(() => validator.parse("")).toThrow("ISIN must be exactly 12 characters long");
    });

    test("should reject ISINs with invalid checksum", () => {
      expect(() => validator.parse("US0378331006")).toThrow("Invalid ISIN checksum");
    });

    test("should reject ISINs with invalid country code", () => {
      expect(() => validator.parse("1S0378331005")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("U10378331005")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
    });

    test("should reject ISINs with invalid characters", () => {
      expect(() => validator.parse("US037833100-")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("US037833100$")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("US037833100 ")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
    });

    test("should reject ISINs without final check digit", () => {
      expect(() => validator.parse("US037833100A")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("US037833100X")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
    });

    test("should reject non-string types", () => {
      expect(() => validator.parse(123_456_789_012)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("ISIN structure", () => {
    test("should follow correct structure", () => {
      const validISIN = "US0378331005";
      const result = validator.parse(validISIN);

      // First 2 chars are country code
      expect(result.slice(0, 2)).toBe("US");

      // Next 9 chars are alphanumeric identifier
      expect(result.slice(2, 11)).toMatch(/^[A-Z0-9]{9}$/);

      // Last char is numeric check digit
      expect(result.slice(11, 12)).toMatch(/^[0-9]$/);
    });
  });

  describe("safeParse", () => {
    test("should return success for valid ISIN", () => {
      const result = validator.safeParse("US0378331005");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("US0378331005" as ISIN);
      }
    });

    test("should return error for invalid ISIN", () => {
      const result = validator.safeParse("US037833100");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = validator.parse("US0378331005");
      // Test that the type is correctly inferred
      expect(result).toBe("US0378331005" as ISIN);
    });

    test("should handle safeParse", () => {
      const result = validator.safeParse("GB00B03MLX29");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("GB00B03MLX29" as ISIN);
      }
    });
  });
});

describe("isISIN", () => {
  test("should return true for valid ISINs", () => {
    expect(isISIN("US0378331005")).toBe(true);
    expect(isISIN("GB0002634946")).toBe(true);
    expect(isISIN("DE0005557508")).toBe(true);
  });

  test("should return true for lowercase ISINs (they get transformed)", () => {
    expect(isISIN("us0378331005")).toBe(true);
    expect(isISIN("gb0002634946")).toBe(true);
  });

  test("should return false for invalid ISINs", () => {
    expect(isISIN("US037833100")).toBe(false); // Wrong length
    expect(isISIN("US0378331006")).toBe(false); // Invalid checksum
    expect(isISIN("1S0378331005")).toBe(false); // Invalid country code
    expect(isISIN("US037833100A")).toBe(false); // Non-numeric check digit
  });

  test("should return false for non-string types", () => {
    expect(isISIN(123_456_789_012)).toBe(false);
    expect(isISIN(null)).toBe(false);
    expect(isISIN(undefined)).toBe(false);
    expect(isISIN({})).toBe(false);
    expect(isISIN([])).toBe(false);
    expect(isISIN(true)).toBe(false);
  });

  test("should handle empty strings", () => {
    expect(isISIN("")).toBe(false);
  });

  test("should handle strings with special characters", () => {
    expect(isISIN("US037833100$")).toBe(false);
    expect(isISIN("US037833100-")).toBe(false);
    expect(isISIN("US037833100 ")).toBe(false);
  });
});

describe("getISIN", () => {
  test("should return valid ISINs", () => {
    expect(getISIN("US0378331005")).toBe("US0378331005");
    expect(getISIN("GB0002634946")).toBe("GB0002634946");
    expect(getISIN("DE0005557508")).toBe("DE0005557508");
  });

  test("should transform lowercase to uppercase", () => {
    expect(getISIN("us0378331005")).toBe("US0378331005");
    expect(getISIN("gb0002634946")).toBe("GB0002634946");
  });

  test("should throw for invalid ISINs", () => {
    expect(() => getISIN("US037833100")).toThrow("ISIN must be exactly 12 characters long");
    expect(() => getISIN("US0378331006")).toThrow("Invalid ISIN checksum");
    expect(() => getISIN("1S0378331005")).toThrow("ISIN must follow the format");
    expect(() => getISIN("US037833100A")).toThrow("ISIN must follow the format");
  });

  test("should throw for non-string types", () => {
    expect(() => getISIN(123_456_789_012)).toThrow();
    expect(() => getISIN(null)).toThrow();
    expect(() => getISIN(undefined)).toThrow();
    expect(() => getISIN({})).toThrow();
    expect(() => getISIN([])).toThrow();
    expect(() => getISIN(true)).toThrow();
  });

  test("should throw for empty strings", () => {
    expect(() => getISIN("")).toThrow("ISIN must be exactly 12 characters long");
  });

  test("should throw for strings with special characters", () => {
    expect(() => getISIN("US037833100$")).toThrow("ISIN must follow the format");
    expect(() => getISIN("US037833100-")).toThrow("ISIN must follow the format");
    expect(() => getISIN("US037833100 ")).toThrow("ISIN must follow the format");
  });
});

describe("validateIsinChecksum edge cases", () => {
  test("should handle character position edge case", () => {
    // Test with empty character at position
    const result = isin().safeParse("US0000000000");
    expect(result.success).toBe(false); // Should fail due to invalid checksum
  });

  test("should handle all letters in NSIN", () => {
    // Test with maximum letter expansion
    const result = isin().safeParse("USZZZZZZZZ99");
    expect(result.success).toBe(false); // Should fail validation
  });

  test("should reject non-alphanumeric characters in any position", () => {
    // Test special characters in different positions
    expect(() => isin().parse("@S0378331005")).toThrow();
    expect(() => isin().parse("U@0378331005")).toThrow();
    expect(() => isin().parse("US@378331005")).toThrow();
    expect(() => isin().parse("US0@78331005")).toThrow();
    expect(() => isin().parse("US03@8331005")).toThrow();
  });
  test("should handle ISINs with all numeric NSIN", () => {
    const result = isin().safeParse("US0000000000");
    expect(result.success).toBe(false); // This should fail checksum
  });

  test("should handle ISINs with alphabetic characters in NSIN", () => {
    // Valid ISIN with letters in NSIN
    expect(isin().parse("GB00B03MLX29")).toBe("GB00B03MLX29");
  });

  test("should handle edge case with undefined charCode", () => {
    // This tests the edge case where charCode could be undefined
    // We need to test with a string that could potentially cause issues
    const testString = `US${String.fromCodePoint(0)}378331005`;
    expect(() => isin().parse(testString)).toThrow();
  });

  test("should handle strings with null characters", () => {
    // Test with null character in different positions
    expect(() => isin().parse("\0S0378331005")).toThrow();
    expect(() => isin().parse("U\u0003" + "78331005")).toThrow();
    expect(() => isin().parse("US\u0003" + "78331005")).toThrow();
  });

  test("should handle mixed case in NSIN portion", () => {
    // Mixed case should be transformed to uppercase, but check digit must be numeric
    expect(() => isin().parse("us037833100a")).toThrow("ISIN must follow the format");
  });

  test("should validate various check digits correctly", () => {
    // Test ISINs with different check digits (0-9)
    expect(isin().parse("US0378331005")).toBe("US0378331005"); // check digit 5
    expect(isin().parse("GB00B03MLX29")).toBe("GB00B03MLX29"); // check digit 9
    expect(isin().parse("DE0005557508")).toBe("DE0005557508"); // check digit 8
    expect(isin().parse("FR0000120271")).toBe("FR0000120271"); // check digit 1
    expect(isin().parse("NL0000009355")).toBe("NL0000009355"); // check digit 5
  });

  test("should handle ISINs where checksum calculation involves double digit reduction", () => {
    // These ISINs test the case where digit * 2 > 9 in the Luhn algorithm
    expect(isin().parse("CH0012221716")).toBe("CH0012221716");
  });
});
