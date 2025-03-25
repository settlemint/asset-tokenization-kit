import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
import type {
  CalculatedTokenizedDeposit,
  OffChainTokenizedDeposit,
  OnChainTokenizedDeposit,
} from "./tokenizeddeposit-schema";
import { CalculatedTokenizedDepositSchema } from "./tokenizeddeposit-schema";
/**
 * Calculates additional fields for tokenized deposit tokens
 *
 * @param onChainTokenizedDeposit - On-chain tokenized deposit data
 * @param offChainTokenizedDeposit - Off-chain tokenized deposit data (optional)
 * @returns Calculated fields for the tokenized deposit token
 */
export async function tokenizedDepositCalculateFields(
  onChainTokenizedDeposit: OnChainTokenizedDeposit,
  _offChainTokenizedDeposit?: OffChainTokenizedDeposit
): Promise<CalculatedTokenizedDeposit> {
  // Calculate collateral proof validity date
  const collateralProofValidity =
    Number(onChainTokenizedDeposit.lastCollateralUpdate) > 0
      ? addSeconds(
          new Date(Number(onChainTokenizedDeposit.lastCollateralUpdate) * 1000),
          Number(onChainTokenizedDeposit.liveness)
        )
      : undefined;

  const price = await getAssetPriceInUserCurrency(onChainTokenizedDeposit.id);

  return safeParse(CalculatedTokenizedDepositSchema, {
    collateralProofValidity,
    price,
  });
}
