import { describe, expect, it } from 'bun:test';
import { verificationType, verificationTypes } from './verification-type';

describe('verificationType', () => {
  const validator = verificationType;

  describe('valid verification types', () => {
    it.each(verificationTypes.map((type) => [type]))(
      "should accept '%s'",
      (type) => {
        expect(validator.parse(type)).toBe(type);
      }
    );

    it('should accept all defined verification types', () => {
      expect(validator.parse('two-factor')).toBe('two-factor');
      expect(validator.parse('pincode')).toBe('pincode');
      expect(validator.parse('secret-code')).toBe('secret-code');
    });
  });

  describe('invalid verification types', () => {
    it('should reject invalid type names', () => {
      expect(() => validator.parse('sms')).toThrow();
      expect(() => validator.parse('otp')).toThrow();
      expect(() => validator.parse('biometric')).toThrow();
      expect(() => validator.parse('')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
    });

    it('should be case-sensitive', () => {
      expect(() => validator.parse('Email')).toThrow();
      expect(() => validator.parse('PHONE')).toThrow();
      expect(() => validator.parse('Identity')).toThrow();
    });

    it('should reject similar but incorrect values', () => {
      expect(() => validator.parse('e-mail')).toThrow();
      expect(() => validator.parse('telephone')).toThrow();
      expect(() => validator.parse('id')).toThrow();
      expect(() => validator.parse('identification')).toThrow();
    });
  });

  describe('verification type contexts', () => {
    it('should support different verification methods', () => {
      // Email verification for account confirmation
      expect(validator.parse('two-factor')).toBe('two-factor');

      // Phone verification for 2FA or SMS codes
      expect(validator.parse('pincode')).toBe('pincode');

      // Identity verification for KYC/AML
      expect(validator.parse('secret-code')).toBe('secret-code');
    });
  });

  describe('safeParse', () => {
    it('should return success for valid verification type', () => {
      const result = validator.safeParse('two-factor');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('two-factor');
      }
    });

    it('should return error for invalid verification type', () => {
      const result = validator.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('two-factor');
      // Test that the type is correctly inferred
      expect(result).toBe('two-factor');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('pincode');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('pincode');
      }
    });
  });
});
