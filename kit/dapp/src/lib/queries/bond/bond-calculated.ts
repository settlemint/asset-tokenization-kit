import { getAssetPriceInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { safeParse } from "@/lib/utils/typebox";
import type { CalculatedBond, OffChainBond, OnChainBond } from "./bond-schema";
import { CalculatedBondSchema } from "./bond-schema";

/**
 * Calculates additional fields for bond tokens
 *
 * @param onChainBond - On-chain bond data
 * @param offChainBond - Off-chain bond data (optional)
 * @returns Calculated fields for the bond token
 */
export async function bondCalculateFields(
  onChainBond: OnChainBond,
  _offChainBond?: OffChainBond
): Promise<CalculatedBond> {
  // Calculate ownership concentration from top holders
  const topHoldersSum = onChainBond.holders.reduce(
    (sum, holder) => sum + holder.valueExact,
    0n
  );

  const concentration =
    onChainBond.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / onChainBond.totalSupplyExact);

  const price = await getAssetPriceInUserCurrency(onChainBond.id);

  return safeParse(CalculatedBondSchema, {
    concentration,
    price,
  });
}
