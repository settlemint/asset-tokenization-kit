import { describe, it, expect } from "bun:test";
import { from, isDnum } from "dnum";

describe("AutoCell Dnum support", () => {
  it("should identify Dnum values correctly", () => {
    const dnumValue = from("123456.789");
    expect(isDnum(dnumValue)).toBe(true);
  });

  it("should not identify regular numbers as Dnum", () => {
    const regularNumber = 123456.789;
    expect(isDnum(regularNumber)).toBe(false);
  });

  it("should not identify strings as Dnum", () => {
    const stringValue = "123456.789";
    expect(isDnum(stringValue)).toBe(false);
  });

  it("Dnum value should be a tuple", () => {
    const dnumValue = from("123456.789");
    expect(Array.isArray(dnumValue)).toBe(true);
    expect(dnumValue.length).toBe(2);
    expect(typeof dnumValue[0]).toBe("bigint");
    expect(typeof dnumValue[1]).toBe("number");
  });
});
