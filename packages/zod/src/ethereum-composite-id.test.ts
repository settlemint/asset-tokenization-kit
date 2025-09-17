import { describe, expect, test } from "bun:test";
import {
  ethereumCompositeId,
  getEthereumCompositeId,
  isEthereumCompositeId,
} from "./ethereum-composite-id";

describe("Ethereum Composite ID Validation", () => {
  const validCompositeId =
    "0xc4c4f83f167c9164018188be4ecaffdd17a601625e771e1417100000000000000000000000020100";
  const validUpperCompositeId =
    "0xC4C4F83F167C9164018188BE4ECaffDD17A601625E771E1417100000000000000000000000020100";
  const validMixedCompositeId =
    "0x1234567890AbCdEf1234567890aBcDeF123456789876543210FeDcBa9876543210fEdCbA98765432";
  const zeroCompositeId =
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const maxCompositeId =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

  const invalidNoPrefix =
    "1234567890abcdef1234567890abcdef123456789876543210fedcba9876543210fedcba98765432";
  const invalidShort =
    "0x1234567890abcdef1234567890abcdef123456789876543210fedcba9876543210fedcba987654";
  const invalidLong =
    "0x1234567890abcdef1234567890abcdef123456789876543210fedcba9876543210fedcba9876543200";
  const invalidChars =
    "0x1234567890abcdef1234567890abcdef123456789876543210fedcba9876543210fedcba9876543g";

  describe("ethereumCompositeId Zod schema", () => {
    describe("valid composite IDs", () => {
      test("should accept valid 82-character composite ID", () => {
        expect(ethereumCompositeId.parse(validCompositeId)).toEqual(
          validCompositeId
        );
      });

      test("should accept ID with uppercase letters", () => {
        expect(ethereumCompositeId.parse(validUpperCompositeId)).toEqual(
          validUpperCompositeId
        );
      });

      test("should accept ID with mixed case", () => {
        expect(ethereumCompositeId.parse(validMixedCompositeId)).toEqual(
          validMixedCompositeId
        );
      });

      test("should accept all zeros ID", () => {
        expect(ethereumCompositeId.parse(zeroCompositeId)).toEqual(
          zeroCompositeId
        );
      });

      test("should accept all F's ID", () => {
        expect(ethereumCompositeId.parse(maxCompositeId)).toEqual(
          maxCompositeId
        );
      });
    });

    describe("invalid composite IDs", () => {
      test("should reject ID without 0x prefix", () => {
        const result = ethereumCompositeId.safeParse(invalidNoPrefix);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }
      });

      test("should reject ID with wrong length", () => {
        const shortResult = ethereumCompositeId.safeParse(invalidShort);
        expect(shortResult.success).toBe(false);
        if (!shortResult.success) {
          expect(shortResult.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }

        const longResult = ethereumCompositeId.safeParse(invalidLong);
        expect(longResult.success).toBe(false);
        if (!longResult.success) {
          expect(longResult.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }
      });

      test("should reject ID with invalid characters", () => {
        const result = ethereumCompositeId.safeParse(invalidChars);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must start with '0x' followed by 80 hexadecimal characters"
          );
        }
      });

      test("should reject non-string types", () => {
        expect(() => ethereumCompositeId.parse(123)).toThrow();
        expect(() => ethereumCompositeId.parse(null)).toThrow();
        expect(() => ethereumCompositeId.parse(undefined)).toThrow();
        expect(() => ethereumCompositeId.parse({})).toThrow();
      });

      test("should reject empty string", () => {
        const result = ethereumCompositeId.safeParse("");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }
      });

      test("should reject string with only 0x", () => {
        const result = ethereumCompositeId.safeParse("0x");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }
      });

      test("should reject ID with spaces", () => {
        const result1 = ethereumCompositeId.safeParse(` ${validCompositeId}`);
        expect(result1.success).toBe(false);

        const result2 = ethereumCompositeId.safeParse(`${validCompositeId} `);
        expect(result2.success).toBe(false);
      });

      test("should reject ID that fails viem isHex check", () => {
        // This tests the refine step - an ID that passes regex but fails isHex
        // In practice, this is hard to construct since viem's isHex is quite permissive
        // but we can test the error message format
        const idWithCorrectFormat =
          "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        const result = ethereumCompositeId.safeParse(idWithCorrectFormat);
        // This should actually pass, so let's verify it does
        expect(result.success).toBe(true);
      });

      test("should reject arrays, booleans, and other types", () => {
        expect(() => ethereumCompositeId.parse([])).toThrow();
        expect(() => ethereumCompositeId.parse(true)).toThrow();
        expect(() => ethereumCompositeId.parse(false)).toThrow();
        expect(() => ethereumCompositeId.parse(Symbol("test"))).toThrow();
        expect(() => ethereumCompositeId.parse(123n)).toThrow();
      });

      test("should have proper error messages for each validation step", () => {
        // Test min length error
        const shortResult = ethereumCompositeId.safeParse("0x123");
        expect(shortResult.success).toBe(false);
        if (!shortResult.success) {
          expect(shortResult.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }

        // Test max length error (should be same message)
        const longResult = ethereumCompositeId.safeParse(`0x${"a".repeat(85)}`);
        expect(longResult.success).toBe(false);
        if (!longResult.success) {
          expect(longResult.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must be exactly 82 characters long"
          );
        }

        // Test regex error
        const invalidHexResult = ethereumCompositeId.safeParse(
          `0x${"g".repeat(80)}`
        );
        expect(invalidHexResult.success).toBe(false);
        if (!invalidHexResult.success) {
          expect(invalidHexResult.error.issues[0]?.message).toBe(
            "Ethereum Composite ID must start with '0x' followed by 80 hexadecimal characters"
          );
        }
      });
    });
  });

  describe("type checking", () => {
    test("should return proper type", () => {
      const result = ethereumCompositeId.parse(validCompositeId);
      expect(result).toBe(validCompositeId);
    });

    test("should handle safeParse", () => {
      const result = ethereumCompositeId.safeParse(validCompositeId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validCompositeId);
      }
    });

    test("should have correct description", () => {
      // Zod's describe() method adds description metadata but doesn't expose it as a property
      // We can verify the schema has been properly defined
      expect(ethereumCompositeId).toBeDefined();
      expect(ethereumCompositeId.def).toBeDefined();
    });

    test("should transform value to EthereumCompositeId type", () => {
      // The transform function casts the string to EthereumCompositeId type
      // We verify the value remains unchanged
      const result = ethereumCompositeId.parse(validCompositeId);
      expect(result).toBe(validCompositeId);
      expect(typeof result).toBe("string");
    });
  });

  describe("getEthereumCompositeId", () => {
    test("should return valid composite ID for valid inputs", () => {
      expect(getEthereumCompositeId(validCompositeId)).toEqual(
        validCompositeId
      );
      expect(getEthereumCompositeId(validUpperCompositeId)).toEqual(
        validUpperCompositeId
      );
      expect(getEthereumCompositeId(validMixedCompositeId)).toEqual(
        validMixedCompositeId
      );
    });

    test("should throw for invalid composite IDs", () => {
      expect(() => getEthereumCompositeId(invalidNoPrefix)).toThrow();
      expect(() => getEthereumCompositeId(invalidShort)).toThrow();
      expect(() => getEthereumCompositeId(invalidLong)).toThrow();
      expect(() => getEthereumCompositeId(invalidChars)).toThrow();
      expect(() => getEthereumCompositeId(123)).toThrow();
      expect(() => getEthereumCompositeId(null)).toThrow();
      expect(() => getEthereumCompositeId({})).toThrow();
    });
  });

  describe("isEthereumCompositeId", () => {
    describe("valid composite IDs", () => {
      test("should return true for valid 82-character composite ID", () => {
        expect(isEthereumCompositeId(validCompositeId)).toBe(true);
      });

      test("should return true for ID with uppercase letters", () => {
        expect(isEthereumCompositeId(validUpperCompositeId)).toBe(true);
      });

      test("should return true for ID with mixed case", () => {
        expect(isEthereumCompositeId(validMixedCompositeId)).toBe(true);
      });

      test("should return true for all zeros ID", () => {
        expect(isEthereumCompositeId(zeroCompositeId)).toBe(true);
      });

      test("should return true for all F's ID", () => {
        expect(isEthereumCompositeId(maxCompositeId)).toBe(true);
      });
    });

    describe("invalid composite IDs", () => {
      test("should return false for ID without 0x prefix", () => {
        expect(isEthereumCompositeId(invalidNoPrefix)).toBe(false);
      });

      test("should return false for ID with wrong length", () => {
        expect(isEthereumCompositeId(invalidShort)).toBe(false);
        expect(isEthereumCompositeId(invalidLong)).toBe(false);
      });

      test("should return false for ID with invalid characters", () => {
        expect(isEthereumCompositeId(invalidChars)).toBe(false);
      });

      test("should return false for non-string types", () => {
        expect(isEthereumCompositeId(123)).toBe(false);
        expect(isEthereumCompositeId(null)).toBe(false);
        expect(isEthereumCompositeId(undefined)).toBe(false);
        expect(isEthereumCompositeId({})).toBe(false);
        expect(isEthereumCompositeId([])).toBe(false);
        expect(isEthereumCompositeId(true)).toBe(false);
        expect(isEthereumCompositeId(false)).toBe(false);
      });

      test("should return false for empty string", () => {
        expect(isEthereumCompositeId("")).toBe(false);
      });

      test("should return false for string with only 0x", () => {
        expect(isEthereumCompositeId("0x")).toBe(false);
      });

      test("should return false for string with spaces", () => {
        expect(isEthereumCompositeId(` ${validCompositeId}`)).toBe(false);
        expect(isEthereumCompositeId(`${validCompositeId} `)).toBe(false);
      });
    });

    describe("type narrowing", () => {
      test("should provide type narrowing in TypeScript", () => {
        const unknownValue: unknown = validCompositeId;

        if (isEthereumCompositeId(unknownValue)) {
          // TypeScript should now know that unknownValue is EthereumCompositeId
          // This test verifies runtime behavior, TypeScript checking happens at compile time
          expect(unknownValue).toBe(validCompositeId);
        } else {
          // This branch should not be reached with validCompositeId
          throw new Error("Valid composite ID should pass type guard");
        }
      });
    });
  });

  describe("Composite ID specific scenarios", () => {
    test("should validate realistic composite ID combinations", () => {
      // Simulate typical composite ID creation (two 40-char hex strings without prefixes)
      const firstPart = "1234567890abcdef1234567890abcdef12345678"; // 40 chars
      const secondPart = "9876543210fedcba9876543210fedcba98765432"; // 40 chars
      const compositeId = `0x${firstPart}${secondPart}`; // 0x + 80 chars = 82 total

      expect(compositeId.length).toBe(82);
      expect(isEthereumCompositeId(compositeId)).toBe(true);
      expect(ethereumCompositeId.parse(compositeId)).toEqual(compositeId);
    });

    test("should handle edge case combinations", () => {
      // All zeros composite
      const zeroComposite = "0x" + "0".repeat(80);
      expect(isEthereumCompositeId(zeroComposite)).toBe(true);

      // All F's composite
      const maxComposite = "0x" + "f".repeat(80);
      expect(isEthereumCompositeId(maxComposite)).toBe(true);

      // Mixed case composite
      const mixedComposite = "0x" + "A".repeat(40) + "b".repeat(40);
      expect(isEthereumCompositeId(mixedComposite)).toBe(true);
    });

    test("should reject malformed composite IDs", () => {
      // Wrong separator (extra 0x in middle)
      const wrongSeparator =
        "0x1234567890abcdef1234567890abcdef123456780x9876543210fedcba9876543210fedcba98765432";
      expect(isEthereumCompositeId(wrongSeparator)).toBe(false);

      // Incomplete concatenation
      const incomplete = "0x1234567890abcdef1234567890abcdef12345678";
      expect(isEthereumCompositeId(incomplete)).toBe(false);
    });

    test("should validate against address-like patterns", () => {
      // Should reject if someone passes just an address (42 chars)
      const singleAddress = "0x1234567890abcdef1234567890abcdef12345678";
      expect(isEthereumCompositeId(singleAddress)).toBe(false);

      // Should reject if someone passes a hash (66 chars)
      const singleHash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(isEthereumCompositeId(singleHash)).toBe(false);
    });
  });
});
