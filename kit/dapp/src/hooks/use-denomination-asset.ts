import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";

interface DenominationAssetData {
  denominationAsset: Token | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook to fetch denomination asset information for assets
 *
 * This hook fetches the denomination asset details using token.read endpoint
 *
 * @param denominationAssetAddress - The address of the denomination asset
 * @returns Object containing denomination asset data and loading states
 */
export function useDenominationAsset(
  denominationAssetAddress: EthereumAddress
): DenominationAssetData {
  const {
    data: denominationAsset,
    isLoading: isDenominationAssetLoading,
    isError: isDenominationAssetError,
  } = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetAddress },
    })
  );

  return {
    denominationAsset: denominationAsset ?? null,
    isLoading: isDenominationAssetLoading,
    isError: isDenominationAssetError,
  };
}
