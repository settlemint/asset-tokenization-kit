import type {
  UseQueryResult,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { vi } from "vitest";

/**
 * Creates a mock UseSuspenseQueryResult with all required properties
 * @param data - The data to return from the query
 * @returns A complete mock query result object
 */
function buildQueryResult<TData>(data: TData) {
  return {
    data,
    dataUpdatedAt: Date.now(),
    error: null,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: "idle" as const,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isPending: false,
    isLoading: false,
    isLoadingError: false,
    isInitialLoading: false,
    isEnabled: true,
    isPaused: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    refetch: vi.fn(),
    status: "success" as const,
    isPlaceholderData: false,
    promise: Promise.resolve(data),
  };
}

export function createMockQueryResult<TData>(
  data: TData
): UseQueryResult<TData, unknown> {
  return buildQueryResult(data) as UseQueryResult<TData, unknown>;
}

export function createMockSuspenseQueryResult<TData>(
  data: TData
): UseSuspenseQueryResult<TData, unknown> {
  return buildQueryResult(data) as UseSuspenseQueryResult<TData, unknown>;
}

/**
 * Creates a mock error result for useSuspenseQuery
 * @param error - The error to throw
 * @returns A mock error query result
 */
export function createMockQueryError(error: Error) {
  return () => {
    throw error;
  };
}

export const createMockSuspenseQueryError = createMockQueryError;
