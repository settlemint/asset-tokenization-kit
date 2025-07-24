import { describe, expect, it } from "bun:test";
import { isin, type ISIN } from "./isin";

describe("isin", () => {
  const validator = isin();

  describe("valid ISINs", () => {
    it("should accept valid ISINs", () => {
      expect(validator.parse("US0378331005")).toBe("US0378331005" as ISIN); // Apple Inc.
      expect(validator.parse("GB0002634946")).toBe("GB0002634946" as ISIN); // BAE Systems
      expect(validator.parse("DE0005557508")).toBe("DE0005557508" as ISIN); // Deutsche Telekom
      expect(validator.parse("FR0000120271")).toBe("FR0000120271" as ISIN); // Total SE
      expect(validator.parse("CA0679011084")).toBe("CA0679011084" as ISIN); // Barrick Gold
    });

    it("should transform lowercase to uppercase", () => {
      expect(validator.parse("us0378331005")).toBe("US0378331005" as ISIN);
      expect(validator.parse("gb0002634946")).toBe("GB0002634946" as ISIN);
    });

    it("should accept ISINs from different countries", () => {
      expect(validator.parse("CH0012221716")).toBe("CH0012221716" as ISIN); // ABB
      expect(validator.parse("NL0000009355")).toBe("NL0000009355" as ISIN); // Unilever
    });

    it("should accept a valid ISIN", () => {
      const validIsin = "US0378331005";
      expect(validator.parse(validIsin)).toBe(validIsin as ISIN);
    });

    it("should transform a lowercase ISIN to uppercase", () => {
      const lowerIsin = "us0378331005";
      const upperIsin = "US0378331005";
      expect(validator.parse(lowerIsin)).toBe(upperIsin as ISIN);
    });

    it("should accept ISIN with different country codes", () => {
      const deIsin = "DE0005557508";
      const gbIsin = "GB00B03MLX29";
      expect(validator.parse(deIsin)).toBe(deIsin as ISIN);
      expect(validator.parse(gbIsin)).toBe(gbIsin as ISIN);
    });

    it("should handle ISIN with check digit 0", () => {
      const zeroCheckDigit = "DE0005557508";
      expect(validator.parse(zeroCheckDigit)).toBe(zeroCheckDigit as ISIN);
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

    it("should reject ISINs with invalid checksum", () => {
      expect(() => validator.parse("US0378331006")).toThrow(
        "Invalid ISIN checksum"
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
      expect(() => validator.parse(123_456_789_012)).toThrow();
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
      expect(result.slice(0, 2)).toBe("US");

      // Next 9 chars are alphanumeric identifier
      expect(result.slice(2, 11)).toMatch(/^[A-Z0-9]{9}$/);

      // Last char is numeric check digit
      expect(result.slice(11, 12)).toMatch(/^[0-9]$/);
    });
  });

  describe("safeParse", () => {
    it("should return success for valid ISIN", () => {
      const result = validator.safeParse("US0378331005");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("US0378331005" as ISIN);
      }
    });

    it("should return error for invalid ISIN", () => {
      const result = validator.safeParse("US037833100");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("US0378331005");
      // Test that the type is correctly inferred
      expect(result).toBe("US0378331005" as ISIN);
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("GB00B03MLX29");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("GB00B03MLX29" as ISIN);
      }
    });
  });
});
