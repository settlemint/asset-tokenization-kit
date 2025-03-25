import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import type {
  CalculatedStableCoin,
  OffChainStableCoin,
  OnChainStableCoin,
} from "./stablecoin-schema";
import { CalculatedStableCoinSchema } from "./stablecoin-schema";

/**
 * Calculates additional fields for stablecoin tokens
 *
 * @param onChainStableCoin - On-chain stablecoin data
 * @param offChainStableCoin - Off-chain stablecoin data (optional)
 * @returns Calculated fields for the stablecoin token
 */
export function stablecoinCalculateFields(
  onChainStableCoin: OnChainStableCoin,
  _offChainStableCoin?: OffChainStableCoin
): CalculatedStableCoin {
  // Calculate collateral proof validity date
  const collateralProofValidity =
    onChainStableCoin.lastCollateralUpdate.getTime() > 0
      ? addSeconds(
          onChainStableCoin.lastCollateralUpdate,
          Number(onChainStableCoin.liveness)
        )
      : undefined;

  return safeParse(CalculatedStableCoinSchema, {
    collateralProofValidity,
  });
}
