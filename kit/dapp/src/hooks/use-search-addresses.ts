import { orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { getAddress } from "viem";

export type AddressSearchScope = "user" | "asset" | "all";

export interface UseSearchAddressesOptions {
  searchTerm: string;
  scope: AddressSearchScope;
}

export interface UseSearchAddressesReturn {
  searchResults: EthereumAddress[];
  isLoading: boolean;
}

export function useSearchAddresses({
  searchTerm,
  scope,
}: UseSearchAddressesOptions): UseSearchAddressesReturn {
  const shouldSearchUsers = scope === "user" || scope === "all";
  const shouldSearchAssets = scope === "asset" || scope === "all";

  // Query for users - use search API for all queries
  const { data: users = [], isLoading: isLoadingUsers } = useQuery(
    orpc.user.search.queryOptions({
      enabled: shouldSearchUsers && searchTerm.length >= 2,
      input: {
        query: searchTerm,
        limit: searchTerm.length > 0 ? 10 : 5,
      },
    })
  );

  // Query for asset search
  const { data: searchAssets = [], isLoading: isLoadingSearch } = useQuery(
    orpc.token.search.queryOptions({
      enabled: shouldSearchAssets && searchTerm.length > 0,
      input: {
        query: searchTerm,
        limit: 10,
      },
    })
  );

  // Query for asset list (when no search term)
  const { data: listAssetsResponse, isLoading: isLoadingList } = useQuery(
    orpc.token.list.queryOptions({
      enabled: shouldSearchAssets && searchTerm.length === 0,
      input: {
        limit: 5,
      },
    })
  );

  // Extract tokens array from response
  const assets =
    searchTerm.length > 0 ? searchAssets : listAssetsResponse?.tokens || [];
  const isLoadingAssets = isLoadingSearch || isLoadingList;

  const searchResults: EthereumAddress[] = [];

  // Process based on scope
  if (scope === "user" || scope === "all") {
    users.forEach((user) => {
      if (!user.wallet) return;

      try {
        const validAddress = getAddress(user.wallet);
        searchResults.push(validAddress);
      } catch {
        // Invalid address format, skip
      }
    });
  }

  if (scope === "asset" || scope === "all") {
    assets.forEach((asset: { id?: string }) => {
      if (!asset.id) return;

      try {
        const validAddress = getAddress(asset.id);
        searchResults.push(validAddress);
      } catch {
        // Invalid address format, skip
      }
    });
  }

  return {
    searchResults,
    isLoading: isLoadingUsers || isLoadingAssets,
  };
}
