import { describe, expect, it } from 'bun:test';
import { pincode } from './pincode';

describe('pincode', () => {
  const validator = pincode();

  describe('valid pincodes', () => {
    it('should accept 6-digit pincodes', () => {
      const pincode1 = validator.parse('123456');
      const pincode2 = validator.parse('000000');
      const pincode3 = validator.parse('999999');
      const pincode4 = validator.parse('567890');

      expect(pincode1).toBe('123456');
      expect(pincode2).toBe('000000');
      expect(pincode3).toBe('999999');
      expect(pincode4).toBe('567890');
    });

    it('should accept pincodes with leading zeros', () => {
      const pincode1 = validator.parse('000001');
      const pincode2 = validator.parse('001234');
      const pincode3 = validator.parse('012345');

      expect(pincode1).toBe('000001');
      expect(pincode2).toBe('001234');
      expect(pincode3).toBe('012345');
    });
  });

  describe('invalid pincodes', () => {
    it('should reject PIN codes with wrong length', () => {
      expect(() => validator.parse('12345')).toThrow(
        'PIN code must be exactly 6 digits'
      );
      expect(() => validator.parse('1234567')).toThrow(
        'PIN code must be exactly 6 digits'
      );
      expect(() => validator.parse('')).toThrow(
        'PIN code must be exactly 6 digits'
      );
      expect(() => validator.parse('1')).toThrow(
        'PIN code must be exactly 6 digits'
      );
    });

    it('should reject non-numeric characters', () => {
      expect(() => validator.parse('12345a')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('a23456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('12-456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('12 456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('12.456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
    });

    it('should reject special characters', () => {
      expect(() => validator.parse('!23456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('12345$')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
      expect(() => validator.parse('12#456')).toThrow(
        'PIN code must contain only numeric digits (0-9)'
      );
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(123_456)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle numeric string input only', () => {
      // Even though 123456 as number has 6 digits, we only accept strings
      expect(() => validator.parse(123_456)).toThrow();

      // String representation is valid
      expect(validator.parse('123456')).toBe('123456');
    });
  });

  describe('safeParse', () => {
    it('should return success for valid pincode', () => {
      const result = validator.safeParse('123456');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('123456');
      }
    });

    it('should return error for invalid pincode', () => {
      const result = validator.safeParse('12345');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('567890');
      // Test that the type is correctly inferred
      expect(result).toBe('567890');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('987654');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('987654');
      }
    });
  });
});
