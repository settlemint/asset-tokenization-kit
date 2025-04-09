import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import type {
  CalculatedStableCoin,
  OffChainStableCoin,
  OnChainStableCoin,
} from "./stablecoin-schema";
import { CalculatedStableCoinSchema } from "./stablecoin-schema";
/**
 * Calculates additional fields for stablecoin tokens
 *
 * @param onChainStableCoins - On-chain stablecoin data
 * @param offChainStableCoins - Off-chain stablecoin data (optional)
 * @returns Calculated fields for the stablecoin token
 */
export async function stablecoinsCalculateFields(
  onChainStableCoins: OnChainStableCoin[],
  _offChainStableCoins?: (OffChainStableCoin | undefined)[]
): Promise<Map<string, CalculatedStableCoin>> {
  const prices = await getAssetsPricesInUserCurrency(
    onChainStableCoins.map((stablecoin) => stablecoin.id)
  );

  return onChainStableCoins.reduce((acc, stablecoin) => {
    const price = prices.get(stablecoin.id);
    // Calculate collateral proof validity date
    const collateralProofValidity =
      stablecoin.lastCollateralUpdate.getTime() > 0
        ? addSeconds(
            stablecoin.lastCollateralUpdate,
            Number(stablecoin.liveness)
          )
        : undefined;

    const calculatedStableCoin = safeParse(CalculatedStableCoinSchema, {
      collateralProofValidity,
      price,
    });
    acc.set(stablecoin.id, calculatedStableCoin);
    return acc;
  }, new Map<string, CalculatedStableCoin>());
}
