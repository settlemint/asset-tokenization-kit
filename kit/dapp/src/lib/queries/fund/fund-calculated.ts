import { safeParse } from "@/lib/utils/typebox";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
import type { CalculatedFund, OffChainFund, OnChainFund } from "./fund-schema";
import { CalculatedFundSchema } from "./fund-schema";

/**
 * Calculates additional fields for fund tokens
 *
 * @param onChainFund - On-chain fund data
 * @param offChainFund - Off-chain fund data (optional)
 * @returns Calculated fields for the fund token
 */
export async function fundCalculateFields(
  onChainFund: OnChainFund,
  _offChainFund?: OffChainFund
): Promise<CalculatedFund> {
  // Calculate ownership concentration from top holders
  const topHoldersSum = onChainFund.holders.reduce(
    (sum, holder) => sum + holder.valueExact,
    0n
  );

  const concentration =
    onChainFund.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / onChainFund.totalSupplyExact);

  // Calculate assets under management from balances
  const assetsUnderManagement = onChainFund.asAccount.balances.reduce(
    (acc, balance) => acc + balance.value,
    0
  );

  const price = await getAssetPriceInUserCurrency(onChainFund.id);

  return safeParse(CalculatedFundSchema, {
    concentration,
    assetsUnderManagement,
    price,
  });
}
