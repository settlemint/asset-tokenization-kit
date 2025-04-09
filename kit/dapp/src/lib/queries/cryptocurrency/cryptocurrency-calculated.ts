import {
  CalculatedCryptoCurrencySchema,
  type CalculatedCryptoCurrency,
  type OffChainCryptoCurrency,
  type OnChainCryptoCurrency,
} from "@/lib/queries/cryptocurrency/cryptocurrency-schema";
import { safeParse } from "../../utils/typebox";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
/**
 * Calculates additional fields for a cryptocurrency
 *
 * @param cryptocurrencies - The on-chain cryptocurrencies data
 * @param offchainCryptocurrencies - The off-chain cryptocurrencies data
 * @returns An object containing the calculated fields
 */
export async function cryptoCurrenciesCalculateFields(
  cryptocurrencies: OnChainCryptoCurrency[],
  _offchainCryptocurrencies?: (OffChainCryptoCurrency | undefined)[]
) {
  const prices = await getAssetsPricesInUserCurrency(
    cryptocurrencies.map((cryptocurrency) => cryptocurrency.id)
  );

  return cryptocurrencies.reduce((acc, cryptocurrency) => {
    const price = prices.get(cryptocurrency.id);
    const calculatedCryptoCurrency = safeParse(CalculatedCryptoCurrencySchema, {
      price,
    });
    acc.set(cryptocurrency.id, calculatedCryptoCurrency);
    return acc;
  }, new Map<string, CalculatedCryptoCurrency>());
}
