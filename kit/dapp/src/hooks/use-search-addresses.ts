import { client, orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
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

/**
 * Headless address search adapted for the address selectors.
 *
 * - `scope="user"` surfaces user wallets but only if they already have a linked identity.
 * - `scope="asset"` lists token contract addresses.
 * - `scope="all"` combines both sets.
 *
 * Returning only identity-backed wallets keeps the Add Trusted Issuer flow from
 * presenting accounts that cannot be promoted.
 */
export function useSearchAddresses({
  searchTerm,
  scope,
}: UseSearchAddressesOptions): UseSearchAddressesReturn {
  const shouldSearchUsers = scope === "user" || scope === "all";
  const shouldSearchAssets = scope === "asset" || scope === "all";
  const shouldFilterUsersByIdentity = shouldSearchUsers;

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

  // Collect unique, checksummed user wallets so each identity lookup runs at most once
  const userWalletCacheRef = useRef<{
    wallets: EthereumAddress[];
    signature: string;
  }>({ wallets: [], signature: "" });

  const { wallets: userWallets, signature: userWalletSignature } =
    useMemo(() => {
      if (!shouldFilterUsersByIdentity) {
        if (userWalletCacheRef.current.signature !== "") {
          userWalletCacheRef.current = { wallets: [], signature: "" };
        }
        return userWalletCacheRef.current;
      }

      const normalizedWallets = users.flatMap<EthereumAddress>((user) => {
        if (!user.wallet) {
          return [];
        }

        try {
          return [getAddress(user.wallet)];
        } catch {
          return [];
        }
      });

      const uniqueWallets = [...new Set(normalizedWallets)].toSorted();
      const signature = uniqueWallets.join("|");

      if (userWalletCacheRef.current.signature === signature) {
        return userWalletCacheRef.current;
      }

      const next = { wallets: uniqueWallets, signature };
      userWalletCacheRef.current = next;
      return next;
    }, [shouldFilterUsersByIdentity, users]);

  // Confirm the selected wallets actually have identities before exposing them in selectors
  const { data: walletsWithIdentityData, isLoading: isLoadingUserIdentities } =
    useQuery({
      queryKey: [
        "address-search",
        "wallets-with-identity",
        userWalletSignature,
      ],
      enabled: shouldFilterUsersByIdentity && userWallets.length > 0,
      staleTime: 60_000,
      queryFn: async () => {
        const results = await Promise.all(
          userWallets.map(async (wallet) => {
            try {
              await client.system.identity.read({ wallet });
              return wallet;
            } catch {
              return null;
            }
          })
        );

        return new Set<EthereumAddress>(
          results.filter((wallet): wallet is EthereumAddress => wallet !== null)
        );
      },
    });

  const walletsWithIdentity = useMemo(() => {
    return walletsWithIdentityData ?? new Set<EthereumAddress>();
  }, [walletsWithIdentityData]);

  const searchResults = useMemo(() => {
    const addresses: EthereumAddress[] = [];

    // Process based on scope
    if (scope === "user" || scope === "all") {
      users.forEach((user) => {
        if (!user.wallet) return;

        try {
          const validAddress = getAddress(user.wallet);
          if (shouldFilterUsersByIdentity) {
            if (isLoadingUserIdentities && walletsWithIdentity.size === 0) {
              return;
            }

            if (!walletsWithIdentity.has(validAddress)) {
              return;
            }
          }
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
  }, [
    users,
    assets,
    scope,
    shouldFilterUsersByIdentity,
    walletsWithIdentity,
    isLoadingUserIdentities,
  ]);

  return {
    searchResults,
    isLoading: isLoadingUsers || isLoadingAssets || isLoadingUserIdentities,
  };
}
