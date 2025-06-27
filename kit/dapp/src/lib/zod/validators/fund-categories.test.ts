import { describe, expect, it } from 'bun:test';
import { fundCategories, fundCategory } from './fund-categories';

describe('fundCategory', () => {
  const validator = fundCategory();

  describe('valid fund categories', () => {
    it.each(fundCategories.map((c) => [c]))(
      "should accept '%s'",
      (category) => {
        expect(validator.parse(category)).toBe(category);
      }
    );
  });

  describe('invalid fund categories', () => {
    it('should reject invalid strings', () => {
      expect(() => validator.parse('invalid')).toThrow();
      expect(() => validator.parse('private')).toThrow();
      expect(() => validator.parse('venture')).toThrow();
      expect(() => validator.parse('')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it('should be case-sensitive', () => {
      expect(() => validator.parse('Mutual')).toThrow();
      expect(() => validator.parse('HEDGE')).toThrow();
      expect(() => validator.parse('ETF')).toThrow(); // uppercase
      expect(() => validator.parse('Index')).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid category', () => {
      const result = validator.safeParse('hedge');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hedge');
      }
    });

    it('should return error for invalid category', () => {
      const result = validator.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('mutual');
      // Test that the type is correctly inferred
      expect(result).toBe('mutual');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('etf');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('etf');
      }
    });
  });
});
