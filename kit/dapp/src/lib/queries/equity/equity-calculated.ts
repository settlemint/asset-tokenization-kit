import { safeParse } from "@/lib/utils/typebox";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
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
export async function equityCalculateFields(
  onChainEquity: OnChainEquity,
  _offChainEquity?: OffChainEquity
): Promise<CalculatedEquity> {
  const price = await getAssetPriceInUserCurrency(onChainEquity.id);

  return safeParse(CalculatedEquitySchema, {
    price,
  });
}
