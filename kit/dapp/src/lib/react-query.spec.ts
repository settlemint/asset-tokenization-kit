import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getQueryClient, invalidationPatterns, queryKeys, sanitizeSearchTerm } from './react-query';

// Mock viem's getAddress to return normalized addresses
mock.module('viem', () => ({
  getAddress: (address: string) => address,
}));

describe('queryKeys', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;

  test('asset.all() returns correct key structure', () => {
    expect(queryKeys.asset.all()).toEqual(['asset']);
    expect(queryKeys.asset.all('bond')).toEqual(['asset', 'bond']);
  });

  test('asset.detail() returns correct key with address', () => {
    expect(queryKeys.asset.detail({ address: mockAddress })).toEqual(['asset', 'detail', mockAddress]);
  });

  test('asset.detail() returns correct key with type and address', () => {
    expect(queryKeys.asset.detail({ type: 'bond', address: mockAddress })).toEqual([
      'asset',
      'detail',
      'bond',
      mockAddress,
    ]);
  });

  test('asset.stats() returns correct key structure', () => {
    expect(queryKeys.asset.stats({ address: mockAddress, type: 'supply' })).toEqual([
      'asset',
      'stats',
      'supply',
      mockAddress,
    ]);
  });

  test('user.profile() returns correct key structure', () => {
    const email = 'test@example.com';
    const imageUrl = 'https://example.com/image.jpg';

    expect(queryKeys.user.profile({})).toEqual(['user', 'profile', '*', '*', '*']);
    expect(queryKeys.user.profile({ address: mockAddress })).toEqual(['user', 'profile', mockAddress, '*', '*']);
    expect(queryKeys.user.profile({ email })).toEqual(['user', 'profile', '*', email, '*']);
    expect(queryKeys.user.profile({ imageUrl })).toEqual(['user', 'profile', '*', '*', imageUrl]);
  });
});

describe('QueryClient with automatic invalidation', () => {
  let queryClient: QueryClient;
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;

  beforeEach(() => {
    queryClient = getQueryClient();
  });

  test('invalidateQueries handles asset dependencies', async () => {
    let hasRecursed = false;
    const mockInvalidateQueries = mock(
      (filters?: InvalidateQueryFilters, options?: InvalidateOptions): Promise<void> => {
        // Only trigger the second call if we haven't recursed yet
        if (!hasRecursed && filters?.queryKey?.[0] === 'asset') {
          hasRecursed = true;
          // Call with the same arguments
          return mockInvalidateQueries(filters, options);
        }
        return Promise.resolve();
      }
    );
    queryClient.invalidateQueries = mockInvalidateQueries;

    await queryClient.invalidateQueries({
      queryKey: ['asset', 'detail', mockAddress],
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    expect(mockInvalidateQueries.mock.calls).toEqual([
      [{ queryKey: ['asset', 'detail', mockAddress] }, undefined],
      [{ queryKey: ['asset', 'detail', mockAddress] }, undefined],
    ]);
  });

  test('invalidateQueries handles user dependencies', async () => {
    let hasRecursed = false;
    const mockInvalidateQueries = mock(
      (filters?: InvalidateQueryFilters, options?: InvalidateOptions): Promise<void> => {
        // Only trigger the second call if we haven't recursed yet
        if (!hasRecursed && filters?.queryKey?.[0] === 'user') {
          hasRecursed = true;
          // Call with the same arguments
          return mockInvalidateQueries(filters, options);
        }
        return Promise.resolve();
      }
    );
    queryClient.invalidateQueries = mockInvalidateQueries;
    const userId = 'user123';

    await queryClient.invalidateQueries({
      queryKey: ['user', userId],
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    expect(mockInvalidateQueries.mock.calls).toEqual([
      [{ queryKey: ['user', userId] }, undefined],
      [{ queryKey: ['user', userId] }, undefined],
    ]);
  });
});

describe('invalidationPatterns', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;

  test('asset.all() returns correct pattern', () => {
    expect(invalidationPatterns.asset.all()).toEqual({
      queryKey: ['asset'],
    });
    expect(invalidationPatterns.asset.all('bond')).toEqual({
      queryKey: ['asset', 'bond'],
    });
  });

  test('asset.byAddress() returns correct pattern', () => {
    const pattern = invalidationPatterns.asset.byAddress(mockAddress);
    if (!pattern.predicate) {
      throw new Error('Predicate is undefined');
    }

    expect(pattern.predicate(['asset', mockAddress])).toBe(true);
    expect(pattern.predicate(['user', mockAddress])).toBe(false);
  });

  test('user.all() returns correct pattern', () => {
    expect(invalidationPatterns.user.all()).toEqual({
      queryKey: ['user'],
    });
  });

  test('dashboard.byCategory() returns correct pattern', () => {
    const pattern = invalidationPatterns.dashboard.byCategory('asset');
    if (!pattern.predicate) {
      throw new Error('Predicate is undefined');
    }

    expect(pattern.predicate(['dashboard', 'widget', 'asset'])).toBe(true);
    expect(pattern.predicate(['dashboard', 'widget', 'user'])).toBe(false);
  });
});

describe('sanitizeSearchTerm', () => {
  test('removes special characters', () => {
    expect(sanitizeSearchTerm('hello!@#$%^&*()')).toBe('hello@');
  });

  test('preserves allowed special characters', () => {
    expect(sanitizeSearchTerm('test@example.com')).toBe('test@example.com');
    expect(sanitizeSearchTerm('user-name')).toBe('user-name');
    expect(sanitizeSearchTerm('first_last')).toBe('first\\_last');
  });

  test('trims whitespace', () => {
    expect(sanitizeSearchTerm('  hello  world  ')).toBe('hello world');
  });

  test('escapes LIKE pattern characters', () => {
    expect(sanitizeSearchTerm('50%_off')).toBe('50\\_off');
  });

  test('handles empty string', () => {
    expect(sanitizeSearchTerm('')).toBe('');
  });
});
