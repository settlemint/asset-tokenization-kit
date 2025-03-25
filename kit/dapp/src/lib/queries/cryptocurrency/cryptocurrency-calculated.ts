import {
  CalculatedCryptoCurrencySchema,
  type OffChainCryptoCurrency,
  type OnChainCryptoCurrency,
} from "@/lib/queries/cryptocurrency/cryptocurrency-schema";
import { safeParse } from "@/lib/utils/typebox";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
/**
 * Calculates additional fields for a cryptocurrency
 *
 * @param cryptocurrency - The on-chain cryptocurrency data
 * @param offchainCryptocurrency - The off-chain cryptocurrency data
 * @returns An object containing the calculated fields
 */
export async function cryptoCurrencyCalculateFields(
  cryptocurrency: OnChainCryptoCurrency,
  _offchainCryptocurrency?: OffChainCryptoCurrency
) {
  const price = await getAssetPriceInUserCurrency(cryptocurrency.id);

  return safeParse(CalculatedCryptoCurrencySchema, {
    price,
  });
}
