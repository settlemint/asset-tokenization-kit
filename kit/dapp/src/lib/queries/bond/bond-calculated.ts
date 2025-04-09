import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { safeParse } from "@/lib/utils/typebox";
import type { CalculatedBond, OffChainBond, OnChainBond } from "./bond-schema";
import { CalculatedBondSchema } from "./bond-schema";

/**
 * Calculates additional fields for bond tokens
 *
 * @param onChainBonds - On-chain bond data
 * @param offChainBonds - Off-chain bond data (optional)
 * @returns Calculated fields for the bond token
 */
export async function bondsCalculateFields(
  onChainBonds: OnChainBond[],
  _offChainBonds?: (OffChainBond | undefined)[]
) {
  const prices = await getAssetsPricesInUserCurrency(
    onChainBonds.map((bond) => bond.id)
  );

  return onChainBonds.reduce((acc, bond) => {
    const price = prices.get(bond.id);
    const calculatedBond = safeParse(CalculatedBondSchema, {
      price,
    });
    acc.set(bond.id, calculatedBond);
    return acc;
  }, new Map<string, CalculatedBond>());
}
