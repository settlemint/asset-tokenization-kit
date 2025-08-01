import { orpc } from "@/orpc/orpc-client";
import { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import { UserList } from "@/orpc/routes/user/routes/user.list.schema";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type AddressSearchScope = "user" | "asset" | "all";

export interface UseSearchAddressesOptions {
  searchTerm: string;
  scope: AddressSearchScope;
}

export interface UseSearchAddressesReturn {
  users: UserList;
  assets: TokenList;
  isLoadingUsers: boolean;
  isLoadingAssets: boolean;
  isLoading: boolean;
}

export function useSearchAddresses({
  searchTerm,
  scope,
}: UseSearchAddressesOptions): UseSearchAddressesReturn {
  const searchByAddress = searchTerm;

  const shouldSearchUsers =
    searchTerm.length > 0 && (scope === "user" || scope === "all");
  const shouldSearchAssets =
    searchTerm.length > 0 && (scope === "asset" || scope === "all");

  // Query for users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery(
    orpc.user.list.queryOptions({
      enabled: shouldSearchUsers,
      input: {
        searchByAddress,
      },

      staleTime: 1000 * 60 * 30, // Cache user data for 30 minutes as it rarely changes
    })
  );

  // Query for assets
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery(
    orpc.token.list.queryOptions({
      enabled: shouldSearchAssets,
      input: {
        searchByAddress,
      },
      staleTime: 1000 * 60 * 30, // Cache token data for 30 minutes as it rarely changes
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
