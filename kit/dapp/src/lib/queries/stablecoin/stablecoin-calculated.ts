import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
import type {
  CalculatedStableCoin,
  OffChainStableCoin,
  OnChainStableCoin,
} from "./stablecoin-schema";
import { CalculatedStableCoinSchema } from "./stablecoin-schema";

/**
 * Calculates additional fields for stablecoin tokens
 *
 * @param onChainStableCoin - On-chain stablecoin data
 * @param offChainStableCoin - Off-chain stablecoin data (optional)
 * @returns Calculated fields for the stablecoin token
 */
export async function stablecoinCalculateFields(
  onChainStableCoin: OnChainStableCoin,
  _offChainStableCoin?: OffChainStableCoin
): Promise<CalculatedStableCoin> {
  // Calculate ownership concentration from top holders
  const topHoldersSum = onChainStableCoin.holders.reduce(
    (sum, holder) => sum + BigInt(holder.valueExact),
    0n
  );

  const concentration =
    onChainStableCoin.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / onChainStableCoin.totalSupplyExact);

  // Calculate collateral proof validity date
  const collateralProofValidity =
    onChainStableCoin.lastCollateralUpdate.getTime() > 0
      ? addSeconds(
          onChainStableCoin.lastCollateralUpdate,
          Number(onChainStableCoin.liveness)
        )
      : undefined;

  const price = await getAssetPriceInUserCurrency(onChainStableCoin.id);

  return safeParse(CalculatedStableCoinSchema, {
    concentration,
    collateralProofValidity,
    price,
  });
}
