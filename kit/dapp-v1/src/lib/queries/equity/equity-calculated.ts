import type { CurrencyCode } from "@/lib/db/schema-settings";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { safeParse } from "@/lib/utils/typebox";
import type { CalculatedEquity, OnChainEquity } from "./equity-schema";
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
  userCurrency: CurrencyCode
): Promise<Map<string, CalculatedEquity>> {
  const prices = await getAssetsPricesInUserCurrency(
    onChainEquities.map((equity) => equity.id),
    userCurrency
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
