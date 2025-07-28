import { describe, expect, test } from "vitest";
import { getElementAtIndex } from "./array";

describe("getElementAtIndex", () => {
  test("returns element at valid index", () => {
    const arr = ["a", "b", "c"];
    expect(getElementAtIndex(arr, 0)).toBe("a");
    expect(getElementAtIndex(arr, 1)).toBe("b");
    expect(getElementAtIndex(arr, 2)).toBe("c");
  });

  test("works with different data types", () => {
    const numbers = [1, 2, 3];
    expect(getElementAtIndex(numbers, 0)).toBe(1);

    const objects = [{ id: 1 }, { id: 2 }];
    expect(getElementAtIndex(objects, 1)).toEqual({ id: 2 });

    const mixed = [1, "two", { three: 3 }];
    expect(getElementAtIndex(mixed, 2)).toEqual({ three: 3 });
  });

  test("throws error for negative index", () => {
    const arr = ["a", "b", "c"];
    expect(() => getElementAtIndex(arr, -1)).toThrow(
      "Invalid index -1 for array of length 3"
    );
  });

  test("throws error for index equal to array length", () => {
    const arr = ["a", "b", "c"];
    expect(() => getElementAtIndex(arr, 3)).toThrow(
      "Invalid index 3 for array of length 3"
    );
  });

  test("throws error for index greater than array length", () => {
    const arr = ["a", "b"];
    expect(() => getElementAtIndex(arr, 5)).toThrow(
      "Invalid index 5 for array of length 2"
    );
  });

  test("throws error for empty array", () => {
    const arr: string[] = [];
    expect(() => getElementAtIndex(arr, 0)).toThrow(
      "Invalid index 0 for array of length 0"
    );
  });

  test("works with single element array", () => {
    const arr = ["only"];
    expect(getElementAtIndex(arr, 0)).toBe("only");
  });
});
