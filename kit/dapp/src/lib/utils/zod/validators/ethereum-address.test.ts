import { describe, expect, it, spyOn } from "bun:test";
import * as viem from "viem";
import {
  ethereumAddress,
  getEthereumAddress,
  isEthereumAddress,
  type EthereumAddress,
} from "./ethereum-address";

describe("ethereumAddress", () => {
  describe("valid addresses", () => {
    it("should accept a valid lowercase address", () => {
      const address = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.parse(address);
      expect(result).toBe(
        getEthereumAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
      );
    });

    it("should accept a valid checksummed address", () => {
      const address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const result = ethereumAddress.parse(address);
      expect(result).toBe(
        getEthereumAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
      );
    });

    it("should accept and transform all-lowercase address to checksummed", () => {
      const address = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed";
      const result = ethereumAddress.parse(address);
      expect(result).toBe(
        getEthereumAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")
      );
    });

    it("should accept the zero address", () => {
      const address = "0x0000000000000000000000000000000000000000";
      const result = ethereumAddress.parse(address);
      expect(result).toBe(
        getEthereumAddress("0x0000000000000000000000000000000000000000")
      );
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
      expect(() => ethereumAddress.parse(123456)).toThrow();
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
    it("should have the correct brand", () => {
      const result = ethereumAddress.parse(
        "0x71c7656ec7ab88b098defb751b7401b5f6d8976f"
      );
      // TypeScript should recognize this as a branded type
      const _typeCheck: EthereumAddress = result;
      expect(typeof result).toBe("string");
    });
  });

  describe("safeParse", () => {
    it("should return success for valid address", () => {
      const address = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(
          getEthereumAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
        );
      }
    });

    it("should return error for invalid address", () => {
      const result = ethereumAddress.safeParse("0xinvalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0].message).toContain("42 characters long");
      }
    });
  });

  describe("isEthereumAddress", () => {
    it("should return true for valid addresses", () => {
      expect(
        isEthereumAddress("0x71c7656ec7ab88b098defb751b7401b5f6d8976f")
      ).toBe(true);
      expect(
        isEthereumAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
      ).toBe(true);
      expect(
        isEthereumAddress("0x0000000000000000000000000000000000000000")
      ).toBe(true);
    });

    it("should return false for invalid addresses", () => {
      expect(isEthereumAddress("0xinvalid")).toBe(false);
      expect(isEthereumAddress("not-an-address")).toBe(false);
      expect(isEthereumAddress(123456)).toBe(false);
      expect(isEthereumAddress(null)).toBe(false);
      expect(isEthereumAddress(undefined)).toBe(false);
    });
  });

  describe("getEthereumAddress", () => {
    it("should return checksummed address for valid input", () => {
      const lowercase = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const checksummed = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const expectedResult = getEthereumAddress(checksummed);
      expect(getEthereumAddress(lowercase)).toBe(expectedResult);
      expect(getEthereumAddress(checksummed)).toBe(expectedResult);
    });

    it("should throw for invalid input", () => {
      expect(() => getEthereumAddress("0xinvalid")).toThrow();
      expect(() => getEthereumAddress("not-an-address")).toThrow();
      expect(() => getEthereumAddress(123456)).toThrow();
      expect(() => getEthereumAddress(null)).toThrow();
      expect(() => getEthereumAddress(undefined)).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle the catch block in transform when getAddress fails", () => {
      // Create a spy that throws an error when getAddress is called
      const getAddressSpy = spyOn(viem, "getAddress");
      getAddressSpy.mockImplementation(() => {
        throw new Error("getAddress failed");
      });

      // This should still work and return the value as-is
      const address = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
      const result = ethereumAddress.parse(address);
      expect(result).toBe(getEthereumAddress(address));

      // Restore the spy
      getAddressSpy.mockRestore();
    });
  });
});
