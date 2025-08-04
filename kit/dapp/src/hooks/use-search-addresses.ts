import { orpc } from "@/orpc/orpc-client";
import { TokenSearchResult } from "@/orpc/routes/token/routes/token.search.schema";
import { UserSearchOutput } from "@/orpc/routes/user/routes/user.search.schema";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type AddressSearchScope = "user" | "asset" | "all";

export interface UseSearchAddressesOptions {
  searchTerm: string;
  scope: AddressSearchScope;
}

export interface UseSearchAddressesReturn {
  users: UserSearchOutput;
  assets: TokenSearchResult[];
  isLoadingUsers: boolean;
  isLoadingAssets: boolean;
  isLoading: boolean;
}

export function useSearchAddresses({
  searchTerm,
  scope,
}: UseSearchAddressesOptions): UseSearchAddressesReturn {
  const shouldSearchUsers = scope === "user" || scope === "all";
  const shouldSearchAssets = scope === "asset" || scope === "all";

  // Query for users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery(
    orpc.user.search.queryOptions({
      enabled: shouldSearchUsers && searchTerm.length > 0,
      input: {
        query: searchTerm,
        limit: 10,
      },
    })
  );

  // Query for assets
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery(
    orpc.token.search.queryOptions({
      enabled: shouldSearchAssets && searchTerm.length > 0,
      input: {
        query: searchTerm,
        limit: 10,
      },
    })
  );

  const result = useMemo(() => {
    const isLoading = isLoadingUsers || isLoadingAssets;

    return {
      users: users || [],
      assets: assets || [],
      isLoadingUsers,
      isLoadingAssets,
      isLoading,
    };
  }, [users, assets, isLoadingUsers, isLoadingAssets]);

  return result;
}
