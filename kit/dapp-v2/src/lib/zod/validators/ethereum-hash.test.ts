import { describe, expect, it } from "bun:test";
import {
  ethereumHash,
  getEthereumHash,
  type EthereumHash,
} from "./ethereum-hash";

describe("Ethereum Hash Validation", () => {
  const validHash =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const validUpperHash =
    "0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF";
  const validMixedHash =
    "0x1234567890AbCdEf1234567890aBcDeF1234567890AbCdEf1234567890aBcDeF";
  const zeroHash =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const maxHash =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

  const invalidNoPrefix =
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const invalidShort =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
  const invalidLong =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefff";
  const invalidChars =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdeg";

  describe("ethereumHash Zod schema", () => {
    describe("valid hashes", () => {
      it("should accept valid 32-byte hash", () => {
        expect(ethereumHash.parse(validHash) as string).toEqual(validHash);
      });

      it("should accept hash with uppercase letters", () => {
        expect(ethereumHash.parse(validUpperHash) as string).toEqual(
          validUpperHash
        );
      });

      it("should accept hash with mixed case", () => {
        expect(ethereumHash.parse(validMixedHash) as string).toEqual(
          validMixedHash
        );
      });

      it("should accept all zeros hash", () => {
        expect(ethereumHash.parse(zeroHash) as string).toEqual(zeroHash);
      });

      it("should accept all F's hash", () => {
        expect(ethereumHash.parse(maxHash) as string).toEqual(maxHash);
      });
    });

    describe("invalid hashes", () => {
      it("should reject hash without 0x prefix", () => {
        const result = ethereumHash.safeParse(invalidNoPrefix);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Ethereum hash must be exactly 66 characters long"
          );
        }
      });

      it("should reject hash with wrong length", () => {
        const shortResult = ethereumHash.safeParse(invalidShort);
        expect(shortResult.success).toBe(false);
        if (!shortResult.success) {
          expect(shortResult.error.issues[0].message).toBe(
            "Ethereum hash must be exactly 66 characters long"
          );
        }

        const longResult = ethereumHash.safeParse(invalidLong);
        expect(longResult.success).toBe(false);
        if (!longResult.success) {
          expect(longResult.error.issues[0].message).toBe(
            "Ethereum hash must be exactly 66 characters long"
          );
        }
      });

      it("should reject hash with invalid characters", () => {
        const result = ethereumHash.safeParse(invalidChars);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Ethereum hash must start with '0x' followed by 64 hexadecimal characters"
          );
        }
      });

      it("should reject non-string types", () => {
        expect(() => ethereumHash.parse(123)).toThrow();
        expect(() => ethereumHash.parse(null)).toThrow();
        expect(() => ethereumHash.parse(undefined)).toThrow();
        expect(() => ethereumHash.parse({})).toThrow();
      });
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = ethereumHash.parse(validHash);
      // Test that the type is correctly inferred
      const _typeCheck: EthereumHash = result;
      expect(result).toBe(validHash);
    });

    it("should handle safeParse", () => {
      const result = ethereumHash.safeParse(validHash);
      expect(result.success).toBe(true);
      if (result.success) {
        const _typeCheck: EthereumHash = result.data;
        expect(result.data).toBe(validHash);
      }
    });
  });

  describe("getEthereumHash", () => {
    it("should return valid hash for valid inputs", () => {
      expect(getEthereumHash(validHash) as string).toEqual(validHash);
      expect(getEthereumHash(validUpperHash) as string).toEqual(validUpperHash);
      expect(getEthereumHash(validMixedHash) as string).toEqual(validMixedHash);
    });

    it("should throw for invalid hashes", () => {
      expect(() => getEthereumHash(invalidNoPrefix)).toThrow();
      expect(() => getEthereumHash(invalidShort)).toThrow();
      expect(() => getEthereumHash(invalidLong)).toThrow();
      expect(() => getEthereumHash(invalidChars)).toThrow();
      expect(() => getEthereumHash(123)).toThrow();
      expect(() => getEthereumHash(null)).toThrow();
      expect(() => getEthereumHash({})).toThrow();
    });
  });
});
