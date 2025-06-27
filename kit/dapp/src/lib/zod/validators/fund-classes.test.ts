import { describe, expect, it } from 'bun:test';
import { fundClass, fundClasses } from './fund-classes';

describe('fundClass', () => {
  const validator = fundClass();

  describe('valid fund classes', () => {
    it.each(fundClasses.map((c) => [c]))("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(cls);
    });
  });

  describe('invalid fund classes', () => {
    it('should reject invalid classes', () => {
      expect(() => validator.parse('invalid-class')).toThrow();
      expect(() => validator.parse('')).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid class', () => {
      const result = validator.safeParse('retail');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('retail');
      }
    });

    it('should return error for invalid class', () => {
      const result = validator.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('institutional');
      // Test that the type is correctly inferred
      expect(result).toBe('institutional');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('accredited');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('accredited');
      }
    });
  });
});
