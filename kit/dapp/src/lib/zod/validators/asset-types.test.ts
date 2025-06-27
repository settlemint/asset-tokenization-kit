import { describe, expect, it } from 'bun:test';
import { z } from 'zod/v4';
import {
  type AssetType,
  AssetTypeEnum,
  assetType,
  assetTypeArray,
  assetTypeRecord,
  assetTypeSet,
  assetTypes,
  assetTypeWithDefault,
} from './asset-types';

describe('assetType', () => {
  const validator = assetType();

  describe('valid asset types', () => {
    it.each([...assetTypes])("should accept '%s'", (type) => {
      expect(validator.parse(type)).toBe(type);
    });
  });

  describe('invalid asset types', () => {
    it('should reject invalid strings', () => {
      expect(() => validator.parse('invalid')).toThrow();
      expect(() => validator.parse('stock')).toThrow();
      expect(() => validator.parse('')).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it('should be case-sensitive', () => {
      expect(() => validator.parse('Bond')).toThrow();
      expect(() => validator.parse('EQUITY')).toThrow();
      expect(() => validator.parse('StableCoin')).toThrow();
    });
  });
});

describe('AssetTypeEnum', () => {
  it('should have all asset types', () => {
    expect(AssetTypeEnum.bond).toBe('bond');
    expect(AssetTypeEnum.equity).toBe('equity');
    expect(AssetTypeEnum.fund).toBe('fund');
    expect(AssetTypeEnum.stablecoin).toBe('stablecoin');
    expect(AssetTypeEnum.deposit).toBe('deposit');
  });

  it('should match assetTypes array', () => {
    const enumValues = Object.values(AssetTypeEnum);
    expect(enumValues).toEqual([...assetTypes]);
  });
});

describe('assetTypeArray', () => {
  const validator = assetTypeArray();

  it('should accept valid arrays', () => {
    const single: AssetType[] = ['bond'];
    const multiple: AssetType[] = ['bond', 'equity', 'fund'];
    const all = [...assetTypes];

    expect(validator.parse(single)).toEqual(single);
    expect(validator.parse(multiple)).toEqual(multiple);
    expect(validator.parse(all)).toEqual(all);
  });

  it('should allow duplicates', () => {
    const duplicates: AssetType[] = ['bond', 'bond'];
    expect(validator.parse(duplicates)).toEqual(duplicates);
  });

  it('should reject empty arrays', () => {
    expect(() => validator.parse([])).toThrow(
      'At least one asset type must be selected'
    );
  });

  it('should reject invalid asset types in array', () => {
    expect(() => validator.parse(['bond', 'invalid'])).toThrow();
  });

  it('should reject non-array types', () => {
    expect(() => validator.parse('bond')).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
    expect(() => validator.parse(undefined)).toThrow();
  });
});

describe('assetTypeSet', () => {
  const validator = assetTypeSet();

  it('should accept valid sets', () => {
    const testSet = new Set(['bond', 'equity']);
    const result = validator.parse(testSet);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has('bond' as AssetType)).toBe(true);
    expect(result.has('equity' as AssetType)).toBe(true);
  });

  it('should deduplicate values', () => {
    const testSet = new Set(['bond', 'bond', 'equity']);
    const result = validator.parse(testSet);
    expect(result.size).toBe(2);
  });

  it('should reject empty sets', () => {
    const emptySet = new Set();
    expect(() => validator.parse(emptySet)).toThrow(
      'At least one asset type must be selected'
    );
  });

  it('should reject sets with invalid values', () => {
    const invalidSet = new Set(['bond', 'invalid']);
    expect(() => validator.parse(invalidSet)).toThrow();
  });

  it('should reject non-set types', () => {
    expect(() => validator.parse(['bond'])).toThrow();
    expect(() => validator.parse('bond')).toThrow();
    expect(() => validator.parse(123)).toThrow();
    expect(() => validator.parse(null)).toThrow();
  });
});

describe('assetTypeWithDefault', () => {
  it('should use provided default', () => {
    const defaultType = assetType().parse('equity');
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse(undefined)).toBe('equity' as AssetType);
  });

  it("should use 'bond' as default when not specified", () => {
    const validator = assetTypeWithDefault();
    expect(validator.parse(undefined)).toBe('bond' as AssetType);
  });

  it('should accept valid values', () => {
    const defaultType = assetType().parse('equity');
    const validator = assetTypeWithDefault(defaultType);
    expect(validator.parse('fund')).toBe('fund' as AssetType);
  });
});

describe('assetTypeRecord', () => {
  it('should validate record with string values', () => {
    const validator = assetTypeRecord(z.string());
    const result = validator.parse({
      bond: 'Government Bond',
      equity: 'Common Stock',
    });
    expect(result.bond).toBe('Government Bond');
    expect(result.equity).toBe('Common Stock');
  });

  it('should validate record with number values', () => {
    const validator = assetTypeRecord(z.number());
    const result = validator.parse({
      bond: 100,
      equity: 200,
      fund: 300,
    });
    expect(result.bond).toBe(100);
    expect(result.equity).toBe(200);
    expect(result.fund).toBe(300);
  });

  it('should reject invalid keys', () => {
    const validator = assetTypeRecord(z.string());
    expect(() =>
      validator.parse({
        bond: 'Valid',
        invalid: 'Invalid key',
      })
    ).toThrow();
  });

  it('should validate empty records', () => {
    const validator = assetTypeRecord(z.string());
    expect(validator.parse({})).toEqual({});
  });
});

describe('type checking', () => {
  describe('assetType', () => {
    it('should return proper type', () => {
      const result = assetType().parse('bond');
      // Test that the type is correctly inferred
      expect(result).toBe('bond');
    });

    it('should handle safeParse', () => {
      const result = assetType().safeParse('equity');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('equity');
      }
    });
  });

  describe('assetTypeArray', () => {
    it('should return proper type', () => {
      const result = assetTypeArray().parse(['bond', 'equity']);
      // Test that the type is correctly inferred
      expect(result).toEqual(['bond', 'equity']);
    });

    it('should handle safeParse', () => {
      const result = assetTypeArray().safeParse(['fund', 'deposit']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['fund', 'deposit']);
      }
    });
  });

  describe('assetTypeSet', () => {
    it('should return proper type', () => {
      const result = assetTypeSet().parse(new Set(['bond', 'equity']));
      // Test that the type is correctly inferred
      expect(result.has('bond')).toBe(true);
      expect(result.has('equity')).toBe(true);
    });

    it('should handle safeParse', () => {
      const result = assetTypeSet().safeParse(
        new Set(['stablecoin', 'equity'])
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has('stablecoin')).toBe(true);
        expect(result.data.has('equity')).toBe(true);
      }
    });
  });
});
