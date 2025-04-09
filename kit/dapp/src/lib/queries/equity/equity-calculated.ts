import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { safeParse } from "@/lib/utils/typebox";
import type {
  CalculatedEquity,
  OffChainEquity,
  OnChainEquity,
} from "./equity-schema";
import { CalculatedEquitySchema } from "./equity-schema";
/**
 * Calculates additional fields for equity tokens
 *
 * @param onChainEquity - On-chain equity data
 * @param offChainEquity - Off-chain equity data (optional)
 * @returns Calculated fields for the equity token
 */
export async function equitiesCalculateFields(
  onChainEquities: OnChainEquity[],
  _offChainEquities?: (OffChainEquity | undefined)[]
): Promise<Map<string, CalculatedEquity>> {
  const prices = await getAssetsPricesInUserCurrency(
    onChainEquities.map((equity) => equity.id)
  );

  return onChainEquities.reduce((acc, equity) => {
    const price = prices.get(equity.id);
    const calculatedEquity = safeParse(CalculatedEquitySchema, {
      price,
    });
    acc.set(equity.id, calculatedEquity);
    return acc;
  }, new Map<string, CalculatedEquity>());
}
