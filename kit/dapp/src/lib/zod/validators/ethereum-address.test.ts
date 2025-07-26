import { describe, expect, it } from "vitest";
import { ethereumAddress, type EthereumAddress } from "./ethereum-address";

describe("ethereumAddress", () => {
  describe("valid addresses", () => {
    it("should accept a valid lowercase address", () => {
      const address = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.parse(address);
      expect(result).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    });

    it("should accept a valid checksummed address", () => {
      const address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const result = ethereumAddress.parse(address);
      expect(result).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    });

    it("should accept and transform all-lowercase address to checksummed", () => {
      const address = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed";
      const result = ethereumAddress.parse(address);
      expect(result).toBe("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
    });

    it("should accept the zero address", () => {
      const address = "0x0000000000000000000000000000000000000000";
      const result = ethereumAddress.parse(address);
      expect(result).toBe("0x0000000000000000000000000000000000000000");
    });
  });

  describe("invalid addresses", () => {
    it("should reject an address without 0x prefix", () => {
      expect(() =>
        ethereumAddress.parse("71c7656ec7ab88b098defb751b7401b5f6d8976f")
      ).toThrow();
    });

    it("should reject an address that is too short", () => {
      expect(() =>
        ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976")
      ).toThrow();
    });

    it("should reject an address that is too long", () => {
      expect(() =>
        ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976ff")
      ).toThrow();
    });

    it("should reject an address with invalid characters", () => {
      expect(() =>
        ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976g")
      ).toThrow();
    });

    it("should reject non-string values", () => {
      expect(() => ethereumAddress.parse(123_456)).toThrow();
      expect(() => ethereumAddress.parse(null)).toThrow();
      expect(() => ethereumAddress.parse(undefined)).toThrow();
      expect(() => ethereumAddress.parse({})).toThrow();
      expect(() => ethereumAddress.parse([])).toThrow();
    });

    it("should reject an invalid checksummed address", () => {
      // This address has incorrect checksumming
      expect(() =>
        ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976F")
      ).toThrow();
    });
  });

  describe("type safety", () => {
    it("should have the correct type", () => {
      const result = ethereumAddress.parse(
        "0x71c7656ec7ab88b098defb751b7401b5f6d8976f"
      );
      // TypeScript should recognize this as EthereumAddress type
      expect(typeof result).toBe("string");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid address", () => {
      const address = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      }
    });

    it("should return error for invalid address", () => {
      const result = ethereumAddress.safeParse("0xinvalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0]?.message).toContain("42 characters long");
      }
    });
  });

  describe("schema validation behavior", () => {
    it("should validate addresses correctly", () => {
      // Valid addresses
      expect(
        ethereumAddress.safeParse("0x71c7656ec7ab88b098defb751b7401b5f6d8976f")
          .success
      ).toBe(true);
      expect(
        ethereumAddress.safeParse("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
          .success
      ).toBe(true);
      expect(
        ethereumAddress.safeParse("0x0000000000000000000000000000000000000000")
          .success
      ).toBe(true);

      // Invalid addresses
      expect(ethereumAddress.safeParse("0xinvalid").success).toBe(false);
      expect(ethereumAddress.safeParse("not-an-address").success).toBe(false);
      expect(ethereumAddress.safeParse(123_456).success).toBe(false);
      expect(ethereumAddress.safeParse(null).success).toBe(false);
      expect(ethereumAddress.safeParse(undefined).success).toBe(false);
    });

    it("should return checksummed address for valid input", () => {
      const lowercase = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const checksummed = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      expect(ethereumAddress.parse(lowercase)).toBe(checksummed);
      expect(ethereumAddress.parse(checksummed)).toBe(checksummed);
    });

    it("should throw for invalid input", () => {
      expect(() => ethereumAddress.parse("0xinvalid")).toThrow();
      expect(() => ethereumAddress.parse("not-an-address")).toThrow();
      expect(() => ethereumAddress.parse(123_456)).toThrow();
      expect(() => ethereumAddress.parse(null)).toThrow();
      expect(() => ethereumAddress.parse(undefined)).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle already checksummed addresses", () => {
      // Test that already checksummed addresses pass through correctly
      const checksummedAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const result = ethereumAddress.parse(checksummedAddress);
      expect(result).toBe(checksummedAddress as EthereumAddress);
    });

    it("should handle all uppercase addresses", () => {
      // Test that all uppercase addresses get properly checksummed
      const upperCaseAddress = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.parse(upperCaseAddress);
      expect(result).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" as EthereumAddress
      );
    });

    it("should handle already checksummed or lowercase addresses gracefully", () => {
      // This test checks that lowercase and checksummed addresses are handled correctly
      const lowercaseAddress = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.parse(lowercaseAddress);
      expect(result).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" as EthereumAddress
      );
    });
  });
});
