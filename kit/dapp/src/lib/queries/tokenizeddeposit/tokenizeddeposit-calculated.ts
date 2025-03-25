import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
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
export function tokenizedDepositCalculateFields(
  onChainTokenizedDeposit: OnChainTokenizedDeposit,
  _offChainTokenizedDeposit?: OffChainTokenizedDeposit
): CalculatedTokenizedDeposit {
  // Calculate collateral proof validity date
  const collateralProofValidity =
    Number(onChainTokenizedDeposit.lastCollateralUpdate) > 0
      ? addSeconds(
          new Date(Number(onChainTokenizedDeposit.lastCollateralUpdate) * 1000),
          Number(onChainTokenizedDeposit.liveness)
        )
      : undefined;

  return safeParse(CalculatedTokenizedDepositSchema, {
    collateralProofValidity,
  });
}
