import { describe, it, expect } from "vitest";
import { intersection, uniq, take, flatten } from "./data-table-array";

describe("Data Table Array Utils", () => {
  describe("intersection", () => {
    it("should return intersection of two arrays", () => {
      const a = [1, 2, 3, 4];
      const b = [3, 4, 5, 6];
      const result = intersection(a, b);
      expect(result).toEqual([3, 4]);
    });

    it("should return empty array when no intersection", () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const result = intersection(a, b);
      expect(result).toEqual([]);
    });

    it("should handle empty first array", () => {
      const a: number[] = [];
      const b = [1, 2, 3];
      const result = intersection(a, b);
      expect(result).toEqual([]);
    });

    it("should handle empty second array", () => {
      const a = [1, 2, 3];
      const b: number[] = [];
      const result = intersection(a, b);
      expect(result).toEqual([]);
    });

    it("should handle both arrays empty", () => {
      const a: number[] = [];
      const b: number[] = [];
      const result = intersection(a, b);
      expect(result).toEqual([]);
    });

    it("should handle duplicates in first array", () => {
      const a = [1, 2, 2, 3];
      const b = [2, 4];
      const result = intersection(a, b);
      expect(result).toEqual([2, 2]);
    });

    it("should work with strings", () => {
      const a = ["apple", "banana", "cherry"];
      const b = ["banana", "date", "apple"];
      const result = intersection(a, b);
      expect(result).toEqual(["apple", "banana"]);
    });

    it("should work with objects (reference equality)", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 1 }; // Different reference but same content
      const a = [obj1, obj2];
      const b = [obj1, obj3]; // obj1 is the same reference, obj3 is different
      const result = intersection(a, b);
      expect(result).toEqual([obj1]);
    });
  });

  describe("uniq", () => {
    it("should remove duplicates from array", () => {
      const a = [1, 2, 2, 3, 3, 3, 4];
      const result = uniq(a);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should handle empty array", () => {
      const a: number[] = [];
      const result = uniq(a);
      expect(result).toEqual([]);
    });

    it("should handle array with no duplicates", () => {
      const a = [1, 2, 3, 4];
      const result = uniq(a);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should work with strings", () => {
      const a = ["apple", "banana", "apple", "cherry", "banana"];
      const result = uniq(a);
      expect(result).toEqual(["apple", "banana", "cherry"]);
    });

    it("should preserve order of first occurrence", () => {
      const a = [3, 1, 2, 1, 3, 2];
      const result = uniq(a);
      expect(result).toEqual([3, 1, 2]);
    });

    it("should handle single element array", () => {
      const a = [42];
      const result = uniq(a);
      expect(result).toEqual([42]);
    });

    it("should work with boolean values", () => {
      const a = [true, false, true, true, false];
      const result = uniq(a);
      expect(result).toEqual([true, false]);
    });
  });

  describe("take", () => {
    it("should take first n elements", () => {
      const a = [1, 2, 3, 4, 5];
      const result = take(a, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle n greater than array length", () => {
      const a = [1, 2, 3];
      const result = take(a, 5);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle n equals array length", () => {
      const a = [1, 2, 3];
      const result = take(a, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle n equals 0", () => {
      const a = [1, 2, 3];
      const result = take(a, 0);
      expect(result).toEqual([]);
    });

    it("should handle negative n", () => {
      const a = [1, 2, 3, 4, 5];
      const result = take(a, -2);
      // slice() with negative n returns from the end, but take(a, -2) returns slice(0, -2)
      // which excludes the last 2 elements
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle empty array", () => {
      const a: number[] = [];
      const result = take(a, 3);
      expect(result).toEqual([]);
    });

    it("should work with strings", () => {
      const a = ["apple", "banana", "cherry", "date"];
      const result = take(a, 2);
      expect(result).toEqual(["apple", "banana"]);
    });

    it("should not mutate original array", () => {
      const a = [1, 2, 3, 4, 5];
      const original = [...a];
      take(a, 3);
      expect(a).toEqual(original);
    });
  });

  describe("flatten", () => {
    it("should flatten array of arrays", () => {
      const a = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const result = flatten(a);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should handle empty outer array", () => {
      const a: number[][] = [];
      const result = flatten(a);
      expect(result).toEqual([]);
    });

    it("should handle arrays with empty sub-arrays", () => {
      const a = [[1, 2], [], [3, 4], []];
      const result = flatten(a);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should handle array with all empty sub-arrays", () => {
      const a = [[], [], []];
      const result = flatten(a);
      expect(result).toEqual([]);
    });

    it("should handle single sub-array", () => {
      const a = [[1, 2, 3, 4, 5]];
      const result = flatten(a);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should work with strings", () => {
      const a = [["apple", "banana"], ["cherry"], ["date", "elderberry"]];
      const result = flatten(a);
      expect(result).toEqual([
        "apple",
        "banana",
        "cherry",
        "date",
        "elderberry",
      ]);
    });

    it("should handle mixed length sub-arrays", () => {
      const a = [[1], [2, 3, 4], [5, 6], [7, 8, 9, 10]];
      const result = flatten(a);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should not flatten deeply nested arrays", () => {
      const a = [
        [1, [2, 3]],
        [4, [5, 6]],
      ];
      const result = flatten(a);
      expect(result).toEqual([1, [2, 3], 4, [5, 6]]);
    });

    it("should preserve order", () => {
      const a = [
        [3, 1],
        [4, 1],
        [5, 9],
      ];
      const result = flatten(a);
      expect(result).toEqual([3, 1, 4, 1, 5, 9]);
    });
  });
});
