/**
 * Tests for debounce utility
 */

import { describe, expect, it, mock } from "bun:test";
import { debounce, debounceLeading } from "./debounce";

describe("debounce", () => {
  it("should debounce function calls", async () => {
    const fn = mock();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    expect(fn).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("should cancel pending execution", async () => {
    const fn = mock();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("test");
    expect(debouncedFn.pending()).toBe(true);

    debouncedFn.cancel();
    expect(debouncedFn.pending()).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(fn).not.toHaveBeenCalled();
  });

  it("should flush pending execution immediately", () => {
    const fn = mock();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("test");
    expect(fn).not.toHaveBeenCalled();

    debouncedFn.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test");
    expect(debouncedFn.pending()).toBe(false);
  });

  it("should correctly report pending state", async () => {
    const fn = mock();
    const debouncedFn = debounce(fn, 100);

    expect(debouncedFn.pending()).toBe(false);

    debouncedFn("test");
    expect(debouncedFn.pending()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(debouncedFn.pending()).toBe(false);
  });

  it("should handle rapid successive calls", async () => {
    const fn = mock();
    const debouncedFn = debounce(fn, 50);

    // Rapid calls
    for (let i = 0; i < 10; i++) {
      debouncedFn(i);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(fn).not.toHaveBeenCalled();

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(9); // Last value
  });
});

describe("debounceLeading", () => {
  it("should execute immediately on first call", () => {
    const fn = mock();
    const debouncedFn = debounceLeading(fn, 100);

    debouncedFn("first");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
  });

  it("should debounce subsequent calls", async () => {
    const fn = mock();
    const debouncedFn = debounceLeading(fn, 100);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1]).toEqual(["third"]);
  });

  it("should allow new leading execution after delay", async () => {
    const fn = mock();
    const debouncedFn = debounceLeading(fn, 100);

    debouncedFn("first");
    expect(fn).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 150));

    debouncedFn("second");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1]).toEqual(["second"]);
  });

  it("should handle cancel correctly", async () => {
    const fn = mock();
    const debouncedFn = debounceLeading(fn, 100);

    debouncedFn("first");
    debouncedFn("second");

    expect(fn).toHaveBeenCalledTimes(1);

    debouncedFn.cancel();
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(fn).toHaveBeenCalledTimes(1); // No additional call
  });

  it("should handle flush correctly", () => {
    const fn = mock();
    const debouncedFn = debounceLeading(fn, 100);

    debouncedFn("first");
    debouncedFn("second");

    expect(fn).toHaveBeenCalledTimes(1);

    debouncedFn.flush();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1]).toEqual(["second"]);
  });
});
