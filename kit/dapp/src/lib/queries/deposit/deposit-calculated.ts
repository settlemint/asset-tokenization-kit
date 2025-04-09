import { safeParse } from "@/lib/utils/typebox";
import { addSeconds } from "date-fns";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import type {
  CalculatedDeposit,
  OffChainDeposit,
  OnChainDeposit,
} from "./deposit-schema";
import { CalculatedDepositSchema } from "./deposit-schema";
/**
 * Calculates additional fields for tokenized deposit tokens
 *
 * @param onChainDeposits - On-chain tokenized deposit data
 * @param offChainDeposits - Off-chain tokenized deposit data (optional)
 * @returns Calculated fields for the tokenized deposit token
 */
export async function depositsCalculateFields(
  onChainDeposits: OnChainDeposit[],
  _offChainDeposits?: (OffChainDeposit | undefined)[]
): Promise<Map<string, CalculatedDeposit>> {
  const prices = await getAssetsPricesInUserCurrency(
    onChainDeposits.map((deposit) => deposit.id)
  );

  return onChainDeposits.reduce((acc, deposit) => {
    // Calculate collateral proof validity date
    const collateralProofValidity =
      Number(deposit.lastCollateralUpdate) > 0
        ? addSeconds(
            new Date(Number(deposit.lastCollateralUpdate) * 1000),
            Number(deposit.liveness)
          )
        : undefined;

    const price = prices.get(deposit.id);

    const calculatedDeposit = safeParse(CalculatedDepositSchema, {
      collateralProofValidity,
      price,
    });
    acc.set(deposit.id, calculatedDeposit);
    return acc;
  }, new Map<string, CalculatedDeposit>());
}
