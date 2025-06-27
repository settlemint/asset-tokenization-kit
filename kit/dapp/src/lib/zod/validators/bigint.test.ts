import { describe, expect, it } from 'bun:test';
import { apiBigInt } from './bigint';

describe('apiBigInt', () => {
  const validator = apiBigInt;

  describe('valid inputs', () => {
    it('should parse a simple positive number string', () => {
      expect(validator.parse('123')).toBe(123n);
    });

    it('should parse a very large number string', () => {
      const largeNum = '123456789012345678901234567890';
      expect(validator.parse(largeNum)).toBe(123456789012345678901234567890n);
    });

    it('should parse zero', () => {
      expect(validator.parse('0')).toBe(0n);
    });

    it('should parse negative numbers', () => {
      expect(validator.parse('-123')).toBe(-123n);
      expect(validator.parse('-999999999999999999999')).toBe(
        -999999999999999999999n
      );
    });

    it('should handle decimal strings by truncating', () => {
      expect(validator.parse('123.456')).toBe(123n);
      expect(validator.parse('999.999')).toBe(999n);
      expect(validator.parse('-123.456')).toBe(-123n);
    });

    it('should parse numbers directly', () => {
      expect(validator.parse(123)).toBe(123n);
      expect(validator.parse(-456)).toBe(-456n);
      expect(validator.parse(0)).toBe(0n);
    });

    it('should parse bigints directly', () => {
      expect(validator.parse(123n)).toBe(123n);
      expect(validator.parse(-456n)).toBe(-456n);
      expect(validator.parse(0n)).toBe(0n);
    });

    it('should handle whitespace in strings', () => {
      expect(validator.parse('  123  ')).toBe(123n);
      expect(validator.parse('\t456\n')).toBe(456n);
    });

    it('should handle leading zeros', () => {
      expect(validator.parse('0000123')).toBe(123n);
      expect(validator.parse('-0000456')).toBe(-456n);
      expect(validator.parse('0000')).toBe(0n);
    });

    it('should handle scientific notation strings', () => {
      // Now we handle scientific notation properly
      expect(validator.parse('1e10')).toBe(10000000000n);
      expect(validator.parse('1.23e4')).toBe(12300n);
      expect(validator.parse('5e3')).toBe(5000n);
      expect(validator.parse('-2.5e6')).toBe(-2500000n);
      expect(validator.parse('1.23e-2')).toBe(0n); // 0.0123 truncates to 0
    });

    it('should handle very large scientific notation', () => {
      // Test with numbers that would exceed Number.MAX_SAFE_INTEGER
      expect(validator.parse('9e15')).toBe(9000000000000000n);
      expect(validator.parse('1.5e18')).toBe(1500000000000000000n);

      // Test with even larger numbers that exceed JavaScript's Number precision
      expect(validator.parse('1e30')).toBe(1000000000000000000000000000000n);
      expect(validator.parse('5.5e25')).toBe(55000000000000000000000000n);
    });
  });

  describe('invalid inputs', () => {
    it('should convert empty string to 0n', () => {
      // z.coerce.bigint() converts empty strings to 0n
      expect(validator.parse('')).toBe(0n);
    });

    it('should reject non-numeric strings', () => {
      expect(() => validator.parse('abc')).toThrow();
      expect(() => validator.parse('12a34')).toThrow();
      expect(() => validator.parse('$123')).toThrow();
    });

    it('should handle multiple decimal points by truncating at first decimal', () => {
      // Our preprocess function now rejects multiple decimal points
      expect(() => validator.parse('123.456.789')).toThrow(
        'Invalid BigInt format: multiple decimal points'
      );
    });

    it('should reject null and undefined', () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
    });

    it('should reject empty objects but convert empty arrays to 0n', () => {
      // z.coerce.bigint() behavior differs for objects and arrays
      expect(() => validator.parse({})).toThrow();
      expect(validator.parse([])).toBe(0n);
    });

    it('should reject Infinity and NaN', () => {
      expect(() => validator.parse(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => validator.parse(Number.NEGATIVE_INFINITY)).toThrow();
      expect(() => validator.parse(Number.NaN)).toThrow();
    });

    it('should reject multiple decimal points', () => {
      // Our preprocess function now rejects multiple decimal points
      expect(() => validator.parse('123.456.789')).toThrow(
        'Invalid BigInt format: multiple decimal points'
      );
      expect(validator.safeParse('123.456.789').success).toBe(false);
    });
    it('should reject multiple decimal points', () => {
      // Our preprocess function now rejects multiple decimal points
      expect(() => validator.parse('123.456.789')).toThrow(
        'Invalid BigInt format: multiple decimal points'
      );
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('67890');
      // Test that the type is correctly inferred
      expect(result).toBe(67890n);
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('12345');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(12345n);
      }
    });
  });
});
