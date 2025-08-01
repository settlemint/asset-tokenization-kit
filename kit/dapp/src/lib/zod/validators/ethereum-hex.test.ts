import { describe, expect, it } from "vitest";
import { ethereumHex, getEthereumHex, isEthereumHex } from "./ethereum-hex";

describe("Ethereum Hex Validation", () => {
  const validHashes = [
    "0x", // Empty hex data
    "0x00", // Single byte
    "0x1234", // Short hex
    "0xabcdef", // Odd length
    "0x1234567890abcdef", // 8 bytes
    "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000038", // ABI encoded data
  ];

  const invalidHashes = [
    "", // Empty string
    "0", // Missing 0x prefix
    "x1234", // Wrong prefix
    "0xgg", // Invalid hex characters
    "0x 1234", // Space in hex
    123, // Not a string
    null, // Null value
    undefined, // Undefined
  ];

  describe("ethereumHex schema", () => {
    it("should accept valid hex strings", () => {
      validHashes.forEach((hex) => {
        expect(() => ethereumHex.parse(hex)).not.toThrow();
      });
    });

    it("should reject invalid hex strings", () => {
      invalidHashes.forEach((hex) => {
        expect(() => ethereumHex.parse(hex)).toThrow();
      });
    });

    it("should handle mixed case hex", () => {
      const mixedCase = "0xAbCdEf123";
      expect(ethereumHex.parse(mixedCase)).toBe(mixedCase);
    });
  });

  describe("isEthereumHex", () => {
    it("should return true for valid hex", () => {
      validHashes.forEach((hex) => {
        expect(isEthereumHex(hex)).toBe(true);
      });
    });

    it("should return false for invalid hex", () => {
      invalidHashes.forEach((hex) => {
        expect(isEthereumHex(hex)).toBe(false);
      });
    });
  });

  describe("getEthereumHex", () => {
    it("should return hex for valid input", () => {
      const hex = "0x1234abcd";
      expect(getEthereumHex(hex)).toBe(hex);
    });

    it("should throw for invalid input", () => {
      expect(() => getEthereumHex("not-hex")).toThrow();
    });
  });
});
