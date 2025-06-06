import { describe, expect, it } from "bun:test";
import { getPincode, isPincode, pincode, type Pincode } from "./pincode";

describe("pincode", () => {
  const validator = pincode();

  describe("valid pincodes", () => {
    it("should accept 6-digit pincodes", () => {
      const pincode1 = validator.parse("123456");
      const pincode2 = validator.parse("000000");
      const pincode3 = validator.parse("999999");
      const pincode4 = validator.parse("567890");

      expect(pincode1).toBe(getPincode("123456"));
      expect(pincode2).toBe(getPincode("000000"));
      expect(pincode3).toBe(getPincode("999999"));
      expect(pincode4).toBe(getPincode("567890"));
    });

    it("should accept pincodes with leading zeros", () => {
      const pincode1 = validator.parse("000001");
      const pincode2 = validator.parse("001234");
      const pincode3 = validator.parse("012345");

      expect(pincode1).toBe(getPincode("000001"));
      expect(pincode2).toBe(getPincode("001234"));
      expect(pincode3).toBe(getPincode("012345"));
    });
  });

  describe("invalid pincodes", () => {
    it("should reject PIN codes with wrong length", () => {
      expect(() => validator.parse("12345")).toThrow(
        "PIN code must be exactly 6 digits"
      );
      expect(() => validator.parse("1234567")).toThrow(
        "PIN code must be exactly 6 digits"
      );
      expect(() => validator.parse("")).toThrow(
        "PIN code must be exactly 6 digits"
      );
      expect(() => validator.parse("1")).toThrow(
        "PIN code must be exactly 6 digits"
      );
    });

    it("should reject non-numeric characters", () => {
      expect(() => validator.parse("12345a")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("a23456")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("12-456")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("12 456")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("12.456")).toThrow(
        "PIN code must contain only digits"
      );
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("!23456")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("12345$")).toThrow(
        "PIN code must contain only digits"
      );
      expect(() => validator.parse("12#456")).toThrow(
        "PIN code must contain only digits"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123456)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle numeric string input only", () => {
      // Even though 123456 as number has 6 digits, we only accept strings
      expect(() => validator.parse(123456)).toThrow();

      // String representation is valid
      expect(validator.parse("123456") as string).toBe("123456");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid pincode", () => {
      const result = validator.safeParse("123456");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getPincode("123456"));
      }
    });

    it("should return error for invalid pincode", () => {
      const result = validator.safeParse("12345");
      expect(result.success).toBe(false);
    });
  });
});

describe("helper functions", () => {
  describe("isPincode", () => {
    it("should return true for valid pincodes", () => {
      expect(isPincode("123456")).toBe(true);
      expect(isPincode("000000")).toBe(true);
      expect(isPincode("999999")).toBe(true);
      expect(isPincode("567890")).toBe(true);
    });

    it("should return false for invalid pincodes", () => {
      expect(isPincode("12345")).toBe(false); // too short
      expect(isPincode("1234567")).toBe(false); // too long
      expect(isPincode("")).toBe(false);
      expect(isPincode("12345a")).toBe(false); // contains letter
      expect(isPincode("123 45")).toBe(false); // contains space
      expect(isPincode("123-45")).toBe(false); // contains dash
      expect(isPincode(123456)).toBe(false);
      expect(isPincode(null)).toBe(false);
      expect(isPincode(undefined)).toBe(false);
      expect(isPincode({})).toBe(false);
    });

    it("should return valid pincodes when input is valid", () => {
      const validPincode = "123456";
      const result = getPincode(validPincode);
      // Test that the function returns the same result for the same input
      expect(typeof result).toBe("string");
      expect(result.length).toBe(6);
    });

    it("should throw for invalid pincodes", () => {
      expect(() => getPincode("12345")).toThrow("Invalid PIN code: 12345");
      expect(() => getPincode("")).toThrow("Invalid PIN code: ");
      expect(() => getPincode("12345a")).toThrow("Invalid PIN code: 12345a");
      expect(() => getPincode("123 45")).toThrow("Invalid PIN code: 123 45");
      expect(() => getPincode("123-45")).toThrow("Invalid PIN code: 123-45");
      expect(() => getPincode(123456)).toThrow("Invalid PIN code: 123456");
      expect(() => getPincode(null)).toThrow("Invalid PIN code: null");
      expect(() => getPincode(undefined)).toThrow(
        "Invalid PIN code: undefined"
      );
      expect(() => getPincode({})).toThrow("Invalid PIN code: [object Object]");
    });

    it("isPincode should work as type guard", () => {
      const value: unknown = "567890";
      if (isPincode(value)) {
        // TypeScript should recognize value as Pincode here
        const _typeCheck: Pincode = value;
      }
    });

    it("getPincode should return typed value", () => {
      const validPincode = "987654";
      const result = getPincode(validPincode);
      // TypeScript should recognize result as Pincode
      const _typeCheck: Pincode = result;
      expect(result).toBe(getPincode(validPincode));
    });
  });
});
