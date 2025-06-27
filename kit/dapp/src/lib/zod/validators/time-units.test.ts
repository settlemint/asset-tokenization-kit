import { describe, expect, it } from 'bun:test';
import { timeUnit, timeUnits } from './time-units';

describe('timeUnit', () => {
  const validator = timeUnit();

  describe('valid time units', () => {
    it.each(timeUnits.map((unit) => [unit]))("should accept '%s'", (unit) => {
      expect(validator.parse(unit)).toBe(unit);
    });

    it('should accept all standard time units', () => {
      expect(validator.parse('seconds')).toBe('seconds');
      expect(validator.parse('minutes')).toBe('minutes');
      expect(validator.parse('hours')).toBe('hours');
      expect(validator.parse('days')).toBe('days');
      expect(validator.parse('weeks')).toBe('weeks');
      expect(validator.parse('months')).toBe('months');
      expect(validator.parse('years')).toBe('years');
    });
  });

  describe('invalid time units', () => {
    it('should reject invalid unit names', () => {
      expect(() => validator.parse('second')).toThrow(); // singular
      expect(() => validator.parse('minute')).toThrow(); // singular
      expect(() => validator.parse('milliseconds')).toThrow(); // not in list
      expect(() => validator.parse('decades')).toThrow(); // not in list
      expect(() => validator.parse('')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(60)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it('should be case-sensitive', () => {
      expect(() => validator.parse('Seconds')).toThrow();
      expect(() => validator.parse('MINUTES')).toThrow();
      expect(() => validator.parse('Hours')).toThrow();
    });

    it('should reject abbreviated forms', () => {
      expect(() => validator.parse('sec')).toThrow();
      expect(() => validator.parse('min')).toThrow();
      expect(() => validator.parse('hr')).toThrow();
      expect(() => validator.parse('d')).toThrow();
      expect(() => validator.parse('w')).toThrow();
      expect(() => validator.parse('m')).toThrow();
      expect(() => validator.parse('y')).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid time unit', () => {
      const result = validator.safeParse('hours');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hours');
      }
    });

    it('should return error for invalid time unit', () => {
      const result = validator.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('type checking', () => {
    it('should return proper type', () => {
      const result = validator.parse('hours');
      // Test that the type is correctly inferred
      expect(result).toBe('hours');
    });

    it('should handle safeParse', () => {
      const result = validator.safeParse('days');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('days');
      }
    });
  });
});
