import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { safeParse } from "@/lib/utils/typebox";
import { getAddress } from "viem";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import {
  XvPSettlementFlowSchema,
  XvPSettlementSchema,
  type OnChainXvPSettlement,
  type XvPSettlement,
} from "./xvp-schema";

/**
 * Enriches a single XvP settlement with calculated fields like assetPrice for flows
 * and totalPrice for the settlement in the specified userCurrency.
 *
 * @param onChainSettlement - The raw settlement data from The Graph.
 * @param userCurrency - The target currency for totalPrice.
 * @returns The enriched XvPSettlement.
 */
export async function calculateXvPSettlement(
  onChainSettlement: OnChainXvPSettlement,
  userCurrency: CurrencyCode
): Promise<XvPSettlement> {
  let totalPriceAmount = 0;

  // Ensure flows is an array, default to empty if not present
  const flows = Array.isArray(onChainSettlement.flows)
    ? onChainSettlement.flows
    : [];

  const allAssets = new Set<string>(
    flows.map((flow) => getAddress(flow.asset.id))
  );
  const allAssetsPrices = await getAssetsPricesInUserCurrency(
    Array.from(allAssets),
    userCurrency
  );

  const calculatedFlows = flows.map((flow) => {
    const assetPrice = allAssetsPrices.get(getAddress(flow.asset.id))!;

    totalPriceAmount += Number(flow.amount) * assetPrice.amount;
    return safeParse(XvPSettlementFlowSchema, {
      ...flow,
      assetPrice,
    });
  });

  return safeParse(XvPSettlementSchema, {
    ...onChainSettlement,
    flows: calculatedFlows,
    totalPrice: {
      amount: totalPriceAmount,
      currency: userCurrency,
    },
  });
}
