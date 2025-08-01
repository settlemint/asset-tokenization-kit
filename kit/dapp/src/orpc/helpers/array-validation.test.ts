/**
 * @vitest-environment node
 */
import { ORPCError } from "@orpc/server";
import { describe, expect, test } from "vitest";
import {
  validateArrayLengths,
  validateBatchArrays,
  validateNonEmptyArrays,
} from "./array-validation";

describe("array-validation", () => {
  describe("validateArrayLengths", () => {
    test("should not throw when all arrays have the same length", () => {
      expect(() => {
        validateArrayLengths(
          {
            addresses: ["0x1", "0x2", "0x3"],
            amounts: [100, 200, 300],
            tokens: ["A", "B", "C"],
          },
          "batchTransfer"
        );
      }).not.toThrow();
    });

    test("should not throw when only one array is provided", () => {
      expect(() => {
        validateArrayLengths(
          {
            addresses: ["0x1", "0x2", "0x3"],
          },
          "singleArray"
        );
      }).not.toThrow();
    });

    test("should not throw when no arrays are provided", () => {
      expect(() => {
        validateArrayLengths({}, "noArrays");
      }).not.toThrow();
    });

    test("should throw ORPCError when arrays have mismatched lengths", () => {
      expect(() => {
        validateArrayLengths(
          {
            addresses: ["0x1", "0x2", "0x3"],
            amounts: [100, 200], // Different length
          },
          "batchTransfer"
        );
      }).toThrow(ORPCError);

      try {
        validateArrayLengths(
          {
            addresses: ["0x1", "0x2", "0x3"],
            amounts: [100, 200],
          },
          "batchTransfer"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("BAD_REQUEST");
          expect(error.message).toBe("Array length mismatch in batchTransfer");
          expect(error.data).toEqual({
            error: "addresses has 3 elements but amounts has 2 elements",
            expected: 3,
            actual: 2,
            operation: "batchTransfer",
          });
        }
      }
    });

    test("should check all arrays against the first one", () => {
      expect(() => {
        validateArrayLengths(
          {
            first: [1, 2],
            second: [3, 4],
            third: [5, 6, 7], // Mismatched
            fourth: [8, 9],
          },
          "multiArray"
        );
      }).toThrow(ORPCError);

      try {
        validateArrayLengths(
          {
            first: [1, 2],
            second: [3, 4],
            third: [5, 6, 7],
            fourth: [8, 9],
          },
          "multiArray"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.data.error).toBe(
            "first has 2 elements but third has 3 elements"
          );
        }
      }
    });

    test("should handle empty arrays", () => {
      expect(() => {
        validateArrayLengths(
          {
            addresses: [],
            amounts: [],
            tokens: [],
          },
          "emptyArrays"
        );
      }).not.toThrow();
    });

    test("should throw when mixing empty and non-empty arrays", () => {
      expect(() => {
        validateArrayLengths(
          {
            addresses: ["0x1", "0x2"],
            amounts: [],
          },
          "mixedEmpty"
        );
      }).toThrow(ORPCError);
    });
  });

  describe("validateNonEmptyArrays", () => {
    test("should not throw when all arrays are non-empty", () => {
      expect(() => {
        validateNonEmptyArrays(
          {
            addresses: ["0x1"],
            amounts: [100, 200],
            tokens: ["A", "B", "C"],
          },
          "nonEmpty"
        );
      }).not.toThrow();
    });

    test("should not throw when no arrays are provided", () => {
      expect(() => {
        validateNonEmptyArrays({}, "noArrays");
      }).not.toThrow();
    });

    test("should throw ORPCError when any array is empty", () => {
      expect(() => {
        validateNonEmptyArrays(
          {
            addresses: ["0x1"],
            amounts: [], // Empty array
            tokens: ["A"],
          },
          "batchOperation"
        );
      }).toThrow(ORPCError);

      try {
        validateNonEmptyArrays(
          {
            addresses: ["0x1"],
            amounts: [],
            tokens: ["A"],
          },
          "batchOperation"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("BAD_REQUEST");
          expect(error.message).toBe("Empty array in batchOperation");
          expect(error.data).toEqual({
            error: "amounts must contain at least one element",
            operation: "batchOperation",
          });
        }
      }
    });

    test("should throw for the first empty array encountered", () => {
      try {
        validateNonEmptyArrays(
          {
            first: ["a"],
            second: [], // First empty
            third: [], // Also empty
          },
          "multiEmpty"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.data.error).toBe(
            "second must contain at least one element"
          );
        }
      }
    });
  });

  describe("validateBatchArrays", () => {
    test("should not throw when arrays are valid", () => {
      expect(() => {
        validateBatchArrays(
          {
            addresses: ["0x1", "0x2"],
            amounts: [100, 200],
            tokens: ["A", "B"],
          },
          "batchOperation"
        );
      }).not.toThrow();
    });

    test("should throw when any array is empty", () => {
      expect(() => {
        validateBatchArrays(
          {
            addresses: [],
            amounts: [],
          },
          "emptyBatch"
        );
      }).toThrow("Empty array in emptyBatch");
    });

    test("should throw when arrays have mismatched lengths", () => {
      expect(() => {
        validateBatchArrays(
          {
            addresses: ["0x1", "0x2"],
            amounts: [100],
          },
          "mismatchedBatch"
        );
      }).toThrow("Array length mismatch in mismatchedBatch");
    });

    test("should throw when arrays exceed maximum length", () => {
      const largeArray = Array.from({ length: 101 }).fill("x");
      const largeNumbers = Array.from({ length: 101 }).fill(100);

      expect(() => {
        validateBatchArrays(
          {
            addresses: largeArray,
            amounts: largeNumbers,
          },
          "largeBatch"
        );
      }).toThrow(ORPCError);

      try {
        validateBatchArrays(
          {
            addresses: largeArray,
            amounts: largeNumbers,
          },
          "largeBatch"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("BAD_REQUEST");
          expect(error.message).toBe("Too many elements in largeBatch");
          expect(error.data).toEqual({
            error: "Maximum 100 elements allowed, but 101 provided",
            operation: "largeBatch",
          });
        }
      }
    });

    test("should respect custom maximum length", () => {
      const smallArray = Array.from({ length: 6 }).fill("x");

      expect(() => {
        validateBatchArrays(
          {
            items: smallArray,
          },
          "customMax",
          5
        );
      }).toThrow("Too many elements in customMax");

      expect(() => {
        validateBatchArrays(
          {
            items: smallArray.slice(0, 5),
          },
          "customMax",
          5
        );
      }).not.toThrow();
    });

    test("should validate in correct order: empty check, length check, then max check", () => {
      // Empty array should fail first
      try {
        validateBatchArrays(
          {
            addresses: [],
            amounts: ["a"], // Different length, but empty check comes first
          },
          "orderTest"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.message).toBe("Empty array in orderTest");
        }
      }

      // Length mismatch should fail before max check
      const mediumArray = Array.from({ length: 50 }).fill("x");
      const smallArray = Array.from({ length: 40 }).fill("y");

      try {
        validateBatchArrays(
          {
            first: mediumArray,
            second: smallArray,
          },
          "orderTest2",
          30 // Both arrays exceed max, but length mismatch comes first
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.message).toBe("Array length mismatch in orderTest2");
        }
      }
    });

    test("should handle single array validation", () => {
      expect(() => {
        validateBatchArrays(
          {
            items: ["a", "b", "c"],
          },
          "singleArray"
        );
      }).not.toThrow();

      // Should still check for empty
      expect(() => {
        validateBatchArrays(
          {
            items: [],
          },
          "emptySingle"
        );
      }).toThrow("Empty array in emptySingle");

      // Should still check for max length
      const largeArray = Array.from({ length: 101 }).fill("x");
      expect(() => {
        validateBatchArrays(
          {
            items: largeArray,
          },
          "largeSingle"
        );
      }).toThrow("Too many elements in largeSingle");
    });

    test("should handle no arrays gracefully", () => {
      expect(() => {
        validateBatchArrays({}, "noArrays");
      }).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    test("should validate batch transfer operation", () => {
      const recipients = [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
      ];
      const amounts = [100, 200, 300];

      expect(() => {
        validateBatchArrays(
          {
            recipients,
            amounts,
          },
          "batchTransfer"
        );
      }).not.toThrow();
    });

    test("should validate batch mint operation with metadata", () => {
      const addresses = ["0xaaa", "0xbbb", "0xccc"];
      const tokenIds = [1, 2, 3];
      const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];

      expect(() => {
        validateBatchArrays(
          {
            addresses,
            tokenIds,
            uris,
          },
          "batchMint"
        );
      }).not.toThrow();
    });

    test("should handle complex validation errors", () => {
      const validArray = Array.from({ length: 50 }).fill("valid");
      const invalidArray = Array.from({ length: 51 }).fill("invalid");

      try {
        validateBatchArrays(
          {
            validData: validArray,
            invalidData: invalidArray,
          },
          "complexOperation"
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.message).toBe(
            "Array length mismatch in complexOperation"
          );
          expect(error.data.expected).toBe(50);
          expect(error.data.actual).toBe(51);
        }
      }
    });
  });
});
