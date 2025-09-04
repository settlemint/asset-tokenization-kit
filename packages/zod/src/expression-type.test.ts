import { describe, expect, it } from "bun:test";
import {
  ExpressionTypeEnum,
  expressionType,
  expressionTypes,
} from "./expression-type";

describe("expressionType", () => {
  const validator = expressionType();

  describe("valid inputs", () => {
    it.each([...expressionTypes])("should accept literal value %s", (value) => {
      expect(validator.parse(value)).toBe(value);
    });

    it("should accept ExpressionTypeEnum.TOPIC", () => {
      expect(validator.parse(ExpressionTypeEnum.TOPIC)).toBe(0);
    });

    it("should accept ExpressionTypeEnum.AND", () => {
      expect(validator.parse(ExpressionTypeEnum.AND)).toBe(1);
    });

    it("should accept ExpressionTypeEnum.OR", () => {
      expect(validator.parse(ExpressionTypeEnum.OR)).toBe(2);
    });

    it("should accept ExpressionTypeEnum.NOT", () => {
      expect(validator.parse(ExpressionTypeEnum.NOT)).toBe(3);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid numbers", () => {
      expect(() => validator.parse(4)).toThrow();
      expect(() => validator.parse(-1)).toThrow();
      expect(() => validator.parse(99)).toThrow();
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("0")).toThrow();
      expect(() => validator.parse("TOPIC")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
    });

    it("should reject floating point numbers", () => {
      expect(() => validator.parse(0.5)).toThrow();
      expect(() => validator.parse(1.1)).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid values", () => {
      const result = validator.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should return error for invalid values", () => {
      const result = validator.safeParse(99);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

describe("ExpressionTypeEnum", () => {
  it("should have correct constant values", () => {
    expect(ExpressionTypeEnum.TOPIC).toBe(0);
    expect(ExpressionTypeEnum.AND).toBe(1);
    expect(ExpressionTypeEnum.OR).toBe(2);
    expect(ExpressionTypeEnum.NOT).toBe(3);
  });

  it("should have consistent type structure", () => {
    expect(typeof ExpressionTypeEnum).toBe("object");
    expect(Object.keys(ExpressionTypeEnum)).toEqual([
      "TOPIC",
      "AND",
      "OR",
      "NOT",
    ]);
  });
});

describe("expressionTypes", () => {
  it("should contain all valid expression types", () => {
    expect(expressionTypes).toEqual([0, 1, 2, 3]);
  });

  it("should have consistent length", () => {
    expect(expressionTypes.length).toBe(4);
    expect(Array.isArray(expressionTypes)).toBe(true);
  });

  it("should match ExpressionTypeEnum values", () => {
    expect(expressionTypes).toContain(ExpressionTypeEnum.TOPIC);
    expect(expressionTypes).toContain(ExpressionTypeEnum.AND);
    expect(expressionTypes).toContain(ExpressionTypeEnum.OR);
    expect(expressionTypes).toContain(ExpressionTypeEnum.NOT);
  });
});
