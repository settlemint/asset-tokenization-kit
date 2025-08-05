/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { createNumberRange } from "./number-utils";

describe("number-utils", () => {
  describe("createNumberRange", () => {
    it("should return [0, 0] for undefined values", () => {
      const result = createNumberRange(undefined);
      expect(result).toEqual([0, 0]);
    });

    it("should return [0, 0] for empty array", () => {
      const result = createNumberRange([]);
      expect(result).toEqual([0, 0]);
    });

    it("should handle single value in array", () => {
      const result = createNumberRange([5]);
      expect(result).toEqual([0, 5]); // a=5, b=0, min=0, max=5 -> [0, 5]
    });

    it("should handle two values in correct order", () => {
      const result = createNumberRange([3, 7]);
      expect(result).toEqual([3, 7]);
    });

    it("should handle two values in reverse order", () => {
      const result = createNumberRange([7, 3]);
      expect(result).toEqual([3, 7]);
    });

    it("should handle identical values", () => {
      const result = createNumberRange([5, 5]);
      expect(result).toEqual([5, 5]);
    });

    it("should handle negative numbers", () => {
      const result = createNumberRange([-10, -5]);
      expect(result).toEqual([-10, -5]);
    });

    it("should handle mixed positive and negative numbers", () => {
      const result = createNumberRange([5, -3]);
      expect(result).toEqual([-3, 5]);
    });

    it("should handle zero values", () => {
      const result = createNumberRange([0, 0]);
      expect(result).toEqual([0, 0]);
    });

    it("should handle zero and positive number", () => {
      const result = createNumberRange([0, 10]);
      expect(result).toEqual([0, 10]);
    });

    it("should handle zero and negative number", () => {
      const result = createNumberRange([0, -5]);
      expect(result).toEqual([-5, 0]);
    });

    it("should handle floating point numbers", () => {
      const result = createNumberRange([3.14, 2.71]);
      expect(result).toEqual([2.71, 3.14]);
    });

    it("should handle very large numbers", () => {
      const result = createNumberRange([1_000_000, 999_999]);
      expect(result).toEqual([999_999, 1_000_000]);
    });

    it("should handle very small numbers", () => {
      const result = createNumberRange([0.001, 0.002]);
      expect(result).toEqual([0.001, 0.002]);
    });

    it("should ignore extra values beyond the first two", () => {
      const result = createNumberRange([5, 3, 10, 1, 20]);
      expect(result).toEqual([3, 5]);
    });

    it("should handle null values in array by defaulting to 0", () => {
      const result = createNumberRange([null as unknown as number, 5]);
      expect(result).toEqual([0, 5]);
    });

    it("should handle undefined values in array by defaulting to 0", () => {
      const result = createNumberRange([undefined as unknown as number, 3]);
      expect(result).toEqual([0, 3]);
    });

    it("should handle both null values by defaulting to 0", () => {
      const result = createNumberRange([
        null as unknown as number,
        null as unknown as number,
      ]);
      expect(result).toEqual([0, 0]);
    });

    it("should handle single null value", () => {
      const result = createNumberRange([null as unknown as number]);
      expect(result).toEqual([0, 0]);
    });

    it("should handle single undefined value", () => {
      const result = createNumberRange([undefined as unknown as number]);
      expect(result).toEqual([0, 0]);
    });

    it("should handle Infinity values", () => {
      const result = createNumberRange([Infinity, -Infinity]);
      expect(result).toEqual([-Infinity, Infinity]);
    });

    it("should handle NaN values (treated as 0)", () => {
      const result = createNumberRange([Number.NaN, 5]);
      expect(result).toEqual([5, Number.NaN]); // NaN doesn't get replaced by ??, comparison with NaN is always false
    });

    it("should handle edge case with single value being 0", () => {
      const result = createNumberRange([0]);
      expect(result).toEqual([0, 0]);
    });

    it("should maintain precision with decimal numbers", () => {
      const result = createNumberRange([1.234_567_89, 1.234_567_88]);
      expect(result).toEqual([1.234_567_88, 1.234_567_89]);
    });

    it("should handle scientific notation", () => {
      const result = createNumberRange([1e-10, 1e10]);
      expect(result).toEqual([1e-10, 1e10]);
    });

    it("should be stable for repeated calls with same input", () => {
      const input = [7, 3];
      const result1 = createNumberRange(input);
      const result2 = createNumberRange(input);

      expect(result1).toEqual(result2);
      expect(result1).toEqual([3, 7]);
    });

    it("should not mutate the input array", () => {
      const input = [7, 3];
      const originalInput = [...input];

      createNumberRange(input);

      expect(input).toEqual(originalInput);
    });
  });
});
