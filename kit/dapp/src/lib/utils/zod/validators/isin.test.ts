import { describe, expect, it } from "bun:test";
import { getISIN, isin, isISIN, type ISIN } from "./isin";

describe("isin", () => {
  const validator = isin();

  describe("valid ISINs", () => {
    it("should accept valid ISINs", () => {
      expect(validator.parse("US0378331005")).toBe(getISIN("US0378331005")); // Apple Inc.
      expect(validator.parse("GB0002634946")).toBe(getISIN("GB0002634946")); // BAE Systems
      expect(validator.parse("DE0005557508")).toBe(getISIN("DE0005557508")); // Deutsche Telekom
      expect(validator.parse("FR0000120271")).toBe(getISIN("FR0000120271")); // Total SE
      expect(validator.parse("CA0679011084")).toBe(getISIN("CA0679011084")); // Barrick Gold
    });

    it("should transform lowercase to uppercase", () => {
      expect(validator.parse("us0378331005")).toBe(getISIN("US0378331005"));
      expect(validator.parse("gb0002634946")).toBe(getISIN("GB0002634946"));
    });

    it("should accept ISINs from different countries", () => {
      expect(validator.parse("CH0012221716")).toBe(getISIN("CH0012221716")); // ABB
      expect(validator.parse("NL0000009355")).toBe(getISIN("NL0000009355")); // Unilever
    });

    it("should accept a valid ISIN", () => {
      const validIsin = "US0378331005";
      expect(validator.parse(validIsin)).toBe(getISIN(validIsin));
      expect(isISIN(validIsin)).toBe(true);
      expect(getISIN(validIsin)).toBe(getISIN(validIsin));
    });

    it("should transform a lowercase ISIN to uppercase", () => {
      const lowerIsin = "us0378331005";
      const upperIsin = "US0378331005";
      expect(validator.parse(lowerIsin)).toBe(upperIsin);
      expect(isISIN(lowerIsin)).toBe(true);
      expect(getISIN(lowerIsin)).toBe(upperIsin);
    });

    it("should accept ISIN with different country codes", () => {
      const deIsin = "DE0005557508";
      const gbIsin = "GB00B03MLX29";
      expect(validator.parse(deIsin)).toBe(getISIN(deIsin));
      expect(validator.parse(gbIsin)).toBe(getISIN(gbIsin));
      expect(isISIN(deIsin)).toBe(true);
      expect(isISIN(gbIsin)).toBe(true);
      expect(getISIN(deIsin)).toBe(getISIN(deIsin));
      expect(getISIN(gbIsin)).toBe(getISIN(gbIsin));
    });

    it("should handle ISIN with check digit 0", () => {
      const zeroCheckDigit = "DE0005557508";
      expect(validator.parse(zeroCheckDigit)).toBe(getISIN(zeroCheckDigit));
      expect(isISIN(zeroCheckDigit)).toBe(true);
      expect(getISIN(zeroCheckDigit)).toBe(getISIN(zeroCheckDigit));
    });
  });

  describe("invalid ISINs", () => {
    it("should reject ISINs with wrong length", () => {
      expect(() => validator.parse("US037833100")).toThrow(
        "ISIN must be exactly 12 characters long"
      );
      expect(() => validator.parse("US03783310055")).toThrow(
        "ISIN must be exactly 12 characters long"
      );
      expect(() => validator.parse("")).toThrow(
        "ISIN must be exactly 12 characters long"
      );
    });

    it("should reject ISINs with invalid country code", () => {
      expect(() => validator.parse("1S0378331005")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("U10378331005")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
    });

    it("should reject ISINs with invalid characters", () => {
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

    it("should reject ISINs without final check digit", () => {
      expect(() => validator.parse("US037833100A")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
      expect(() => validator.parse("US037833100X")).toThrow(
        "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123456789012)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("ISIN structure", () => {
    it("should follow correct structure", () => {
      const validISIN = "US0378331005";
      const result = validator.parse(validISIN);

      // First 2 chars are country code
      expect(result.substring(0, 2)).toBe("US");

      // Next 9 chars are alphanumeric identifier
      expect(result.substring(2, 11)).toMatch(/^[A-Z0-9]{9}$/);

      // Last char is numeric check digit
      expect(result.substring(11, 12)).toMatch(/^[0-9]$/);
    });
  });

  describe("safeParse", () => {
    it("should return success for valid ISIN", () => {
      const result = validator.safeParse("US0378331005");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getISIN("US0378331005"));
      }
    });

    it("should return error for invalid ISIN", () => {
      const result = validator.safeParse("US037833100");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("helper functions", () => {
    it("should return true for valid ISINs", () => {
      expect(isISIN("US0378331005")).toBe(true);
      expect(isISIN("GB0002634946")).toBe(true);
      expect(isISIN("DE0005557508")).toBe(true);
      expect(isISIN("FR0000120271")).toBe(true);
      expect(isISIN("CA0679011084")).toBe(true);
    });

    it("should return false for invalid ISINs", () => {
      expect(isISIN("US037833100")).toBe(false); // wrong length
      expect(isISIN("US03783310055")).toBe(false); // wrong length
      expect(isISIN("")).toBe(false);
      expect(isISIN("1S0378331005")).toBe(false); // invalid country code
      expect(isISIN("U10378331005")).toBe(false); // invalid country code
      expect(isISIN("us0378331005")).toBe(true); // lowercase transformed to uppercase
      expect(isISIN("US037833100-")).toBe(false); // invalid character
      expect(isISIN("US037833100$")).toBe(false); // invalid character
      expect(isISIN("US037833100 ")).toBe(false); // space
      expect(isISIN("US037833100A")).toBe(false); // non-numeric check digit
      expect(isISIN(123456789012)).toBe(false);
      expect(isISIN(null)).toBe(false);
      expect(isISIN(undefined)).toBe(false);
      expect(isISIN({})).toBe(false);
    });

    it("should return valid ISINs when input is valid", () => {
      const validIsin = "US0378331005";
      const result = getISIN(validIsin);
      expect(result).toBe(getISIN(validIsin));
    });

    it("should throw for invalid ISINs", () => {
      expect(() => getISIN("US037833100")).toThrow("Invalid ISIN: US037833100");
      expect(() => getISIN("")).toThrow("Invalid ISIN: ");
      expect(() => getISIN("1S0378331005")).toThrow(
        "Invalid ISIN: 1S0378331005"
      );
      expect(() => getISIN("US037833100-")).toThrow(
        "Invalid ISIN: US037833100-"
      );
      expect(() => getISIN("US037833100A")).toThrow(
        "Invalid ISIN: US037833100A"
      );
      expect(() => getISIN(123456789012)).toThrow("Invalid ISIN: 123456789012");
      expect(() => getISIN(null)).toThrow("Invalid ISIN: null");
      expect(() => getISIN(undefined)).toThrow("Invalid ISIN: undefined");
      expect(() => getISIN({})).toThrow("Invalid ISIN: [object Object]");
    });

    it("isISIN should work as type guard", () => {
      const value: unknown = "GB00B03MLX29";
      if (isISIN(value)) {
        // TypeScript should recognize value as ISIN here
        const _typeCheck: ISIN = value;
      }
    });

    it("getISIN should return typed value", () => {
      const validIsin = "US0378331005";
      const result = getISIN(validIsin);
      // TypeScript should recognize result as ISIN
      const _typeCheck: ISIN = result;
      expect(result).toBe(getISIN(validIsin));
    });
  });
});
