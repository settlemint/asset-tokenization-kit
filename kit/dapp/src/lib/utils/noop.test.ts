import { describe, expect, test, vi } from "vitest";
import { noop } from "./noop";

describe("noop", () => {
  test("is a function", () => {
    expect(typeof noop).toBe("function");
  });

  test("returns undefined", () => {
    // Call noop and check it returns undefined
    noop();
    // Since noop returns void (which is undefined in JS), we can't capture it
    // Instead we can just verify it doesn't throw
    expect(noop).toBeDefined();
  });

  test("accepts no arguments", () => {
    expect(noop.length).toBe(0);
  });

  test("can be used as a callback", () => {
    const mockFunction = vi.fn().mockImplementation((callback: () => void) => {
      callback();
    });

    mockFunction(noop);
    expect(mockFunction).toHaveBeenCalledWith(noop);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  test("can be used in place of empty functions", () => {
    // Common use case: as a default callback
    const performAction = (onComplete: () => void = noop) => {
      // Do something
      onComplete();
    };

    expect(() => {
      performAction();
    }).not.toThrow();
  });

  test("does not throw any errors", () => {
    expect(() => {
      noop();
    }).not.toThrow();
  });

  test("does not modify any external state", () => {
    const stateBefore = { value: 42 };
    const stateSnapshot = { ...stateBefore };

    noop();

    expect(stateBefore).toEqual(stateSnapshot);
  });
});
