import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
import type {
  CalculatedDeposit,
  OffChainDeposit,
  OnChainDeposit,
} from "./deposit-schema";
import { CalculatedDepositSchema } from "./deposit-schema";
/**
 * Calculates additional fields for tokenized deposit tokens
 *
 * @param onChainDeposit - On-chain tokenized deposit data
 * @param offChainDeposit - Off-chain tokenized deposit data (optional)
 * @returns Calculated fields for the tokenized deposit token
 */
export async function depositCalculateFields(
  onChainDeposit: OnChainDeposit,
  _offChainDeposit?: OffChainDeposit
): Promise<CalculatedDeposit> {
  // Calculate collateral proof validity date
  const collateralProofValidity =
    Number(onChainDeposit.lastCollateralUpdate) > 0
      ? addSeconds(
          new Date(Number(onChainDeposit.lastCollateralUpdate) * 1000),
          Number(onChainDeposit.liveness)
        )
      : undefined;

  const price = await getAssetPriceInUserCurrency(onChainDeposit.id);

  return safeParse(CalculatedDepositSchema, {
    collateralProofValidity,
    price,
  });
}
