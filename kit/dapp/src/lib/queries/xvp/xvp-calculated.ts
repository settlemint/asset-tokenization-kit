import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { safeParse } from "@/lib/utils/typebox";
import { isBefore } from "date-fns";
import { getAddress } from "viem";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import {
  XvPSettlementFlowSchema,
  XvPSettlementSchema,
  type OnChainXvPSettlement,
  type XvPSettlement,
  type XvPStatus,
} from "./xvp-schema";

/**
 * Calculates the status of an XvP settlement based on execution, cancellation, expiration, and approvals
 *
 * @param settlement - The raw settlement data from The Graph
 * @returns The calculated XvP status
 */
function calculateXvPStatus(settlement: OnChainXvPSettlement): XvPStatus {
  if (settlement.executed) {
    return "EXECUTED";
  }

  if (settlement.cancelled) {
    return "CANCELLED";
  }

  const isExpired = isBefore(settlement.cutoffDate, new Date());
  if (isExpired) {
    return "EXPIRED";
  }

  // Ensure flows is an array, default to empty if not present
  const flows = Array.isArray(settlement.flows) ? settlement.flows : [];

  const approvalsRequiredCount = flows.length;
  const actualApprovalsCount = settlement.approvals.filter(
    (approval) => approval.approved
  ).length;

  if (
    approvalsRequiredCount > 0 &&
    actualApprovalsCount === approvalsRequiredCount
  ) {
    return "READY";
  }

  return "PENDING";
}

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

  const status = calculateXvPStatus(onChainSettlement);

  return safeParse(XvPSettlementSchema, {
    ...onChainSettlement,
    flows: calculatedFlows,
    totalPrice: {
      amount: totalPriceAmount,
      currency: userCurrency,
    },
    status,
  });
}
