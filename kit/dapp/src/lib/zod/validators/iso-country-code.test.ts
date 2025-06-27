/**
 * Tests for ISO 3166-1 Alpha-2 Country Code Validation
 */

import { describe, expect, it } from 'bun:test';
import { z } from 'zod/v4';
import {
  getCountryName,
  getSupportedLocales,
  type ISOCountryCode,
  isoCountryCode,
  isValidCountryCode,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './iso-country-code';

describe('isoCountryCode validator', () => {
  describe('validation', () => {
    it('should accept valid ISO 3166-1 alpha-2 codes', () => {
      const validCodes = [
        'US',
        'GB',
        'DE',
        'FR',
        'JP',
        'CN',
        'BR',
        'IN',
        'AU',
        'CA',
      ];

      for (const code of validCodes) {
        expect(() => isoCountryCode.parse(code)).not.toThrow();
        expect(isoCountryCode.safeParse(code).success).toBe(true);
      }
    });

    it('should reject invalid country codes', () => {
      const invalidCodes = [
        'USA', // Alpha-3 code
        'us', // Lowercase
        'XX', // Invalid code
        '12', // Numbers
        'U', // Too short
        'USD', // Currency code
        '', // Empty string
        '  ', // Whitespace
        'U S', // Space in between
        '🇺🇸', // Emoji flag
      ];

      for (const code of invalidCodes) {
        expect(() => isoCountryCode.parse(code)).toThrow();
        expect(isoCountryCode.safeParse(code).success).toBe(false);
      }
    });

    it('should handle edge cases', () => {
      expect(() => isoCountryCode.parse(null)).toThrow();
      expect(() => isoCountryCode.parse(undefined)).toThrow();
      expect(() => isoCountryCode.parse(123)).toThrow();
      expect(() => isoCountryCode.parse({})).toThrow();
    });
  });

  describe('isValidCountryCode', () => {
    it('should return true for valid codes', () => {
      expect(isValidCountryCode('US')).toBe(true);
      expect(isValidCountryCode('GB')).toBe(true);
      expect(isValidCountryCode('JP')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(isValidCountryCode('USA')).toBe(false);
      expect(isValidCountryCode('us')).toBe(false);
      expect(isValidCountryCode('XX')).toBe(false);
      expect(isValidCountryCode('')).toBe(false);
    });

    it('should work as a type guard', () => {
      const code = 'US';
      if (isValidCountryCode(code)) {
        // TypeScript should recognize code as ISOCountryCode here
        const typedCode: ISOCountryCode = code;
        expect(typedCode).toBe('US');
      }
    });
  });

  describe('getCountryName', () => {
    it('should return country names in English by default', () => {
      expect(getCountryName('US')).toBe('United States of America');
      expect(getCountryName('GB')).toBe('United Kingdom');
      expect(getCountryName('DE')).toBe('Germany');
      expect(getCountryName('FR')).toBe('France');
      expect(getCountryName('JP')).toBe('Japan');
    });

    it('should return country names in German', () => {
      expect(getCountryName('US', 'de')).toBe('Vereinigte Staaten von Amerika');
      expect(getCountryName('DE', 'de')).toBe('Deutschland');
      expect(getCountryName('FR', 'de')).toBe('Frankreich');
      expect(getCountryName('JP', 'de')).toBe('Japan');
    });

    it('should return country names in Japanese', () => {
      expect(getCountryName('US', 'ja')).toBe('アメリカ合衆国');
      expect(getCountryName('JP', 'ja')).toBe('日本');
      expect(getCountryName('CN', 'ja')).toBe('中華人民共和国');
    });

    it('should return country names in Arabic', () => {
      expect(getCountryName('US', 'ar')).toBe('الولايات المتحدة');
      expect(getCountryName('SA', 'ar')).toBe('السعودية');
      expect(getCountryName('EG', 'ar')).toBe('مصر');
    });

    it('should return undefined for invalid country codes', () => {
      expect(getCountryName('XX')).toBeUndefined();
      // Note: i18n-iso-countries also accepts alpha-3 codes
      expect(getCountryName('USA')).toBe('United States of America');
      expect(getCountryName('')).toBeUndefined();
    });

    it('should handle unsupported locales gracefully', () => {
      // With an unsupported locale, it returns undefined
      // @ts-expect-error - Testing with invalid locale
      expect(getCountryName('US', 'xyz')).toBeUndefined();
    });

    it('should work with all supported locales', () => {
      const testCode = 'FR';
      const expectedNames: Record<SupportedLocale, string> = {
        en: 'France',
        ar: 'فرنسا',
        de: 'Frankreich',
        ja: 'フランス',
      };

      for (const locale of SUPPORTED_LOCALES) {
        expect(getCountryName(testCode, locale)).toBe(expectedNames[locale]);
      }
    });
  });

  describe('getSupportedLocales', () => {
    it('should return the correct list of supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toEqual(['en', 'ar', 'de', 'ja']);
      expect(locales).toHaveLength(4);
    });

    it('should return a new array each time', () => {
      const locales1 = getSupportedLocales();
      const locales2 = getSupportedLocales();
      expect(locales1).toEqual(locales2);
      expect(locales1).not.toBe(locales2); // Different array instances
    });

    it('should match SUPPORTED_LOCALES constant', () => {
      expect(getSupportedLocales()).toEqual([...SUPPORTED_LOCALES]);
    });
  });

  describe('type safety', () => {
    it('should infer correct types', () => {
      const result = isoCountryCode.safeParse('US');
      if (result.success) {
        // TypeScript should know this is ISOCountryCode
        const code: ISOCountryCode = result.data;
        expect(code).toBe('US');
      }
    });

    it('should work with optional chaining', () => {
      const schema = isoCountryCode.optional();
      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse('US')).toBe('US');
    });

    it('should work with nullable', () => {
      const schema = isoCountryCode.nullable();
      expect(schema.parse(null)).toBeNull();
      expect(schema.parse('US')).toBe('US');
    });

    it('should enforce locale type safety', () => {
      // These should compile without errors
      const validLocales: SupportedLocale[] = ['en', 'ar', 'de', 'ja'];
      for (const locale of validLocales) {
        expect(typeof getCountryName('US', locale)).toBe('string');
      }

      // This would cause a TypeScript error if the type wasn't cast
      expect(() =>
        getCountryName('US', 'invalid' as SupportedLocale)
      ).not.toThrow();
    });
  });

  describe('integration with Zod schemas', () => {
    it('should work in object schemas', () => {
      const userSchema = z.object({
        name: z.string(),
        country: isoCountryCode,
      });

      const validUser = { name: 'John', country: 'US' as const };
      expect(() => userSchema.parse(validUser)).not.toThrow();

      const invalidUser = { name: 'John', country: 'USA' };
      expect(() => userSchema.parse(invalidUser)).toThrow();
    });

    it('should work with transforms', () => {
      const countryWithName = isoCountryCode.transform((code) => ({
        code,
        name: getCountryName(code) ?? 'Unknown',
      }));

      const result = countryWithName.parse('US');
      expect(result).toEqual({
        code: 'US',
        name: 'United States of America',
      });
    });
  });
});
