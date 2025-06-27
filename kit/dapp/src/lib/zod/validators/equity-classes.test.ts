import { describe, expect, it } from 'bun:test';
import { equityClass, equityClasses } from './equity-classes';

describe('equityClass', () => {
  const validator = equityClass();

  describe('valid equity classes', () => {
    it.each(equityClasses.map((c) => [c]))("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(cls);
    });
  });

  describe('invalid equity classes', () => {
    it('should reject invalid strings', () => {
      expect(() => validator.parse('D')).toThrow();
      expect(() => validator.parse('X')).toThrow();
      expect(() => validator.parse('')).toThrow();
    });

    it('should reject lowercase letters', () => {
      expect(() => validator.parse('a')).toThrow();
      expect(() => validator.parse('b')).toThrow();
      expect(() => validator.parse('c')).toThrow();
    });

    it('should reject multiple characters', () => {
      expect(() => validator.parse('AA')).toThrow();
      expect(() => validator.parse('AB')).toThrow();
      expect(() => validator.parse('Class A')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(1)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid class', () => {
      const result = validator.safeParse('A');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('A');
      }
    });

    it('should return error for invalid class', () => {
      const result = validator.safeParse('D');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('B');
      // Test that the type is correctly inferred
      expect(result).toBe('B');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('C');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('C');
      }
    });
  });
});
