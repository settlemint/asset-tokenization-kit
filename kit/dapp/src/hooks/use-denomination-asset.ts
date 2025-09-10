import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { AssetBalance } from "@atk/zod/asset-balance";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";

interface DenominationAssetData {
  denominationAsset: Token | null;
  assetHolding: AssetBalance | null;
  userHolding: AssetBalance | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook to fetch denomination asset information for assets
 *
 * This hook:
 * 1. Fetches the denomination asset details using token.read endpoint
 * 2. Fetches the denomination asset details using token.read endpoint
 * 3. Fetches how much denomination asset the asset contract holds
 * 4. Fetches how much denomination asset the current user holds
 *
 * All queries are properly skipped when required parameters are not available,
 * ensuring the page loads normally regardless of denomination asset query states.
 *
 * @param asset - The asset to get denomination asset information for
 * @returns Object containing denomination asset data and loading states
 */
export function useDenominationAsset(
  denominationAssetAddress: EthereumAddress,
  asset: Token
): DenominationAssetData {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    data: denominationAsset,
    isLoading: isDenominationAssetLoading,
    isError: isDenominationAssetError,
  } = useQuery({
    ...orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetAddress },
    }),
  });

  // Query how much denomination asset the asset contract holds
  const {
    data: assetHoldingData,
    isLoading: isAssetHoldingLoading,
    isError: isAssetHoldingError,
  } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAssetAddress,
        holderAddress: asset.id,
      },
    }),
  });

  // Query how much denomination asset the current user holds
  const {
    data: userHoldingData,
    isLoading: isUserHoldingLoading,
    isError: isUserHoldingError,
  } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAssetAddress,
        holderAddress: user?.wallet ?? "",
      },
    }),
    enabled: !!user?.wallet,
  });

  return {
    denominationAsset: denominationAsset ?? null,
    assetHolding: assetHoldingData?.holder ?? null,
    userHolding: userHoldingData?.holder ?? null,
    isLoading:
      isDenominationAssetLoading ||
      isAssetHoldingLoading ||
      isUserHoldingLoading,
    isError:
      isDenominationAssetError || isAssetHoldingError || isUserHoldingError,
  };
}
