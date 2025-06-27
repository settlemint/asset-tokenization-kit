import { describe, expect, it } from 'bun:test';
import { fiatCurrency } from './fiat-currency';

describe('fiatCurrency', () => {
  const validator = fiatCurrency();

  describe('valid currencies', () => {
    it('should accept common 3-letter currency codes', () => {
      expect(validator.parse('USD')).toBe('USD');
      expect(validator.parse('EUR')).toBe('EUR');
      expect(validator.parse('GBP')).toBe('GBP');
      expect(validator.parse('JPY')).toBe('JPY');
    });

    it('should transform to uppercase', () => {
      expect(validator.parse('usd')).toBe('USD');
      expect(validator.parse('eur')).toBe('EUR');
    });
  });

  describe('invalid currencies', () => {
    it('should reject invalid currency codes', () => {
      expect(() => validator.parse('XXX')).toThrow();
      expect(() => validator.parse('BTC')).toThrow(); // Crypto, not fiat
      expect(() => validator.parse('USDT')).toThrow(); // Stablecoin, not fiat
      expect(() => validator.parse('')).toThrow();
    });

    it('should accept and transform mixed case codes', () => {
      expect(validator.parse('usd')).toBe('USD');
      expect(validator.parse('eur')).toBe('EUR');
      expect(validator.parse('Usd')).toBe('USD');
    });

    it('should reject non-3-letter codes', () => {
      expect(() => validator.parse('US')).toThrow();
      expect(() => validator.parse('USDD')).toThrow();
      expect(() => validator.parse('$')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid currency', () => {
      const result = validator.safeParse('chf');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('CHF');
      }
    });

    it('should return error for invalid currency', () => {
      const result = validator.safeParse('XXX');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('CAD');
      // Test that the type is correctly inferred
      expect(result).toBe('CAD');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('aud');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('AUD');
      }
    });
  });
});
