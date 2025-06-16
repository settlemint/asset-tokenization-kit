import type { CurrencyCode } from "@/lib/db/schema-settings";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { safeParse } from "@/lib/utils/typebox";
import type { CalculatedFund, OnChainFund } from "./fund-schema";
import { CalculatedFundSchema } from "./fund-schema";
/**
 * Calculates additional fields for fund tokens
 *
 * @param onChainFunds - On-chain fund data
 * @param offChainFunds - Off-chain fund data (optional)
 * @returns Calculated fields for the fund token
 */
export async function fundsCalculateFields(
  onChainFunds: OnChainFund[],
  userCurrency: CurrencyCode
): Promise<Map<string, CalculatedFund>> {
  const prices = await getAssetsPricesInUserCurrency(
    onChainFunds.map((fund) => fund.id),
    userCurrency
  );

  return onChainFunds.reduce((acc, fund) => {
    const price = prices.get(fund.id);
    // Calculate assets under management from balances
    const assetsUnderManagement = fund.asAccount.balances.reduce(
      (acc, balance) => acc + balance.value,
      0
    );
    const calculatedFund = safeParse(CalculatedFundSchema, {
      assetsUnderManagement,
      price,
    });
    acc.set(fund.id, calculatedFund);
    return acc;
  }, new Map<string, CalculatedFund>());
}
