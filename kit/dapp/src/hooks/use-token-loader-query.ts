import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";

/**
 * Hook to combine token loader data with fresh query data
 *
 * This hook abstracts the common pattern of:
 * 1. Getting the initial token data from the parent route loader
 * 2. Setting up a query to keep the data fresh after mutations
 *
 * The hook ensures UI reactivity by automatically refetching data
 * when the token is modified through mutations, while providing
 * immediate data from the loader for fast initial renders.
 *
 * @returns Object containing the current token data and query state
 *
 * @example
 * ```tsx
 * function RouteComponent() {
 *   const { asset, isLoading, isError } = useTokenLoaderQuery();
 *
 *   if (isLoading) return <Spinner />;
 *   if (isError) return <ErrorMessage />;
 *
 *   return <TokenHoldersTable token={asset} />;
 * }
 * ```
 */
export function useTokenLoaderQuery() {
  // Get the initial token data from the parent route loader
  const { asset: loaderAsset } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });

  // Keep data fresh so UI reacts to invalidations after mutations
  const {
    data: queriedAsset,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: loaderAsset.id },
    })
  );

  // Prefer fresh queried data but preserve fields only available from loader (e.g., identity claims)
  const asset = {
    ...loaderAsset,
    ...queriedAsset,
    identity: loaderAsset.identity ?? queriedAsset?.identity,
  };
  return {
    asset,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  };
}
