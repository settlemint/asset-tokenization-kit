import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getAddress } from "viem";
import { orpc } from "@/orpc/orpc-client";

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

  // Query for users - search when there's a term, list first 5 when empty
  const { data: users = [], isLoading: isLoadingUsers } = useQuery(
    searchTerm.length > 0
      ? orpc.user.search.queryOptions({
          enabled: shouldSearchUsers,
          input: {
            query: searchTerm,
            limit: 10,
          },
        })
      : orpc.user.list.queryOptions({
          enabled: shouldSearchUsers,
          input: {
            limit: 5,
          },
        })
  );

  // Query for assets - search when there's a term, list first 5 when empty
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery(
    searchTerm.length > 0
      ? orpc.token.search.queryOptions({
          enabled: shouldSearchAssets,
          input: {
            query: searchTerm,
            limit: 10,
          },
        })
      : orpc.token.list.queryOptions({
          enabled: shouldSearchAssets,
          input: {
            limit: 5,
          },
        })
  );

  const searchResults = useMemo(() => {
    const addresses: EthereumAddress[] = [];

    // Process based on scope
    if (scope === "user" || scope === "all") {
      users.forEach((user) => {
        if (!user.wallet) return;

        try {
          const validAddress = getAddress(user.wallet);
          addresses.push(validAddress);
        } catch {
          // Invalid address format, skip
        }
      });
    }

    if (scope === "asset" || scope === "all") {
      assets.forEach((asset) => {
        if (!asset.id) return;

        try {
          const validAddress = getAddress(asset.id);
          addresses.push(validAddress);
        } catch {
          // Invalid address format, skip
        }
      });
    }

    return addresses;
  }, [users, assets, scope]);

  return {
    searchResults,
    isLoading: isLoadingUsers || isLoadingAssets,
  };
}
