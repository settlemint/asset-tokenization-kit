import { describe, expect, it } from 'bun:test';
import { amount } from './amount';

describe('amount', () => {
  describe('basic validation', () => {
    const validator = amount();

    it('should accept positive numbers', () => {
      expect(validator.parse(1)).toBe(1);
      expect(validator.parse(100)).toBe(100);
      expect(validator.parse(999.99)).toBe(999.99);
    });

    it('should accept very small positive numbers', () => {
      expect(validator.parse(0.000_001)).toBe(0.000_001);
      expect(validator.parse(Number.EPSILON)).toBe(Number.EPSILON);
    });

    it('should accept zero by default', () => {
      expect(validator.parse(0)).toBe(0);
    });

    it('should reject negative numbers', () => {
      expect(() => validator.parse(-1)).toThrow('Amount must be at least 0');
      expect(() => validator.parse(-0.01)).toThrow('Amount must be at least 0');
    });

    it('should reject non-numeric types', () => {
      expect(() => validator.parse('100')).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it('should reject NaN', () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    it('should reject Infinity', () => {
      expect(() => validator.parse(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => validator.parse(Number.NEGATIVE_INFINITY)).toThrow();
    });
  });

  describe('with min/max options', () => {
    const validator = amount({ min: 10, max: 1000 });

    it('should accept values within range', () => {
      expect(validator.parse(10)).toBe(10);
      expect(validator.parse(500)).toBe(500);
      expect(validator.parse(1000)).toBe(1000);
    });

    it('should reject values below minimum', () => {
      expect(() => validator.parse(9.99)).toThrow('Amount must be at least 10');
      expect(() => validator.parse(0)).toThrow('Amount must be at least 10');
    });

    it('should reject values above maximum', () => {
      expect(() => validator.parse(1000.01)).toThrow(
        'Amount must not exceed 1000'
      );
      expect(() => validator.parse(10_000)).toThrow(
        'Amount must not exceed 1000'
      );
    });
  });

  describe('with decimals option', () => {
    const validator = amount({ decimals: 2 });

    it('should set minimum based on decimals', () => {
      expect(validator.parse(0.01)).toBe(0.01);
      expect(validator.parse(10.99)).toBe(10.99);
    });

    it('should reject values below decimal-based minimum', () => {
      expect(() => validator.parse(0.009)).toThrow(
        'Amount must be at least 0.01'
      );
      expect(() => validator.parse(0)).toThrow('Amount must be at least 0.01');
    });

    it('should accept any number of decimal places above minimum', () => {
      expect(validator.parse(10.999)).toBe(10.999);
      expect(validator.parse(10.123_45)).toBe(10.123_45);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const validator = amount();
      const result = validator.parse(100);
      // Test that the type is correctly inferred
      expect(result).toBe(100);
    });

    it('should handle safeParse', () => {
      const validator = amount();
      const result = validator.safeParse(100);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(100);
      }
    });
  });
});
