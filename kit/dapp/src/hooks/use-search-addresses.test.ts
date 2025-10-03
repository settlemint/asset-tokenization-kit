/**
 * @vitest-environment happy-dom
 */
import { renderHook } from "@testing-library/react";
import { getAddress } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    user: {
      search: {
        queryOptions: (options: unknown) => options,
      },
    },
    token: {
      search: {
        queryOptions: (options: unknown) => options,
      },
      list: {
        queryOptions: (options: unknown) => options,
      },
    },
  },
  client: {
    system: {
      identity: {
        read: vi.fn(),
      },
    },
  },
}));

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useSearchAddresses } from "./use-search-addresses";

const mockUseQuery = vi.mocked(useQuery);

const asQueryResult = <TData>(
  result: Partial<UseQueryResult<TData>>
): UseQueryResult<TData> => result as unknown as UseQueryResult<TData>;

describe("useSearchAddresses", () => {
  afterEach(() => {
    mockUseQuery.mockReset();
  });

  it("treats identity lookups as loading and skips user results until they resolve", () => {
    const wallet = "0x0000000000000000000000000000000000000001";
    const checksumWallet = getAddress(wallet);

    mockUseQuery
      .mockImplementationOnce(() =>
        asQueryResult({
          data: [{ wallet }],
          isLoading: false,
        })
      )
      .mockImplementationOnce(() =>
        asQueryResult({
          data: [],
          isLoading: false,
        })
      )
      .mockImplementationOnce(
        (config: UseQueryOptions<unknown, unknown, unknown>) => {
          expect(config.queryKey).toEqual([
            "address-search",
            "wallets-with-identity",
            checksumWallet,
          ]);
          expect(config.enabled).toBe(true);
          return asQueryResult({
            data: undefined,
            isLoading: true,
          });
        }
      );

    const { result } = renderHook(() =>
      useSearchAddresses({ searchTerm: "al", scope: "user" })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.searchResults).toEqual([]);
    expect(mockUseQuery).toHaveBeenCalledTimes(3);
  });
});
