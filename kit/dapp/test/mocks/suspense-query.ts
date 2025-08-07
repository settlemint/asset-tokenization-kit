import { vi } from "vitest";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";

/**
 * Creates a mock UseSuspenseQueryResult with all required properties
 * @param data - The data to return from the query
 * @returns A complete mock query result object
 */
export function createMockSuspenseQueryResult<TData>(
  data: TData
): UseSuspenseQueryResult<TData, unknown> {
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
  };
}

/**
 * Creates a mock error result for useSuspenseQuery
 * @param error - The error to throw
 * @returns A mock error query result
 */
export function createMockSuspenseQueryError(error: Error) {
  return () => {
    throw error;
  };
}
