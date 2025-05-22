import type { CurrencyCode } from "@/lib/db/schema-settings";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import {
  CalculatedBondSchemaZod,
  type CalculatedBond,
  type OnChainBondSchemaZodType,
} from "@/lib/queries/bond/bond-schema-zod";

/**
 * Calculates additional fields for bond tokens
 *
 * @param onChainBonds - On-chain bond data
 * @param offChainBonds - Off-chain bond data (optional)
 * @returns Calculated fields for the bond token
 */
export async function bondsCalculateFields(
  onChainBonds: OnChainBondSchemaZodType[],
  userCurrency: CurrencyCode
) {
  const prices = await getAssetsPricesInUserCurrency(
    onChainBonds.map((bond) => bond.id),
    userCurrency
  );

  return onChainBonds.reduce((acc, bond) => {
    const price = prices.get(bond.id);
    const c = CalculatedBondSchemaZod.parse({
      price,
    });
    acc.set(bond.id, c);
    return acc;
  }, new Map<string, CalculatedBond>());
}
