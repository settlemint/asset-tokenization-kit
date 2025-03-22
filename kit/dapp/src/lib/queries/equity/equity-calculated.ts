import type {
  CalculatedEquity,
  OffChainEquity,
  OnChainEquity,
} from "./equity-schema";

/**
 * Calculates additional fields for equity tokens
 *
 * @param onChainEquity - On-chain equity data
 * @param offChainEquity - Off-chain equity data (optional)
 * @returns Calculated fields for the equity token
 */
export function equityCalculateFields(
  onChainEquity: OnChainEquity,
  _offChainEquity?: OffChainEquity
): CalculatedEquity {
  // Calculate ownership concentration from top holders
  const topHoldersSum = onChainEquity.holders.reduce(
    (sum, holder) => sum + holder.valueExact,
    0n
  );

  const concentration =
    onChainEquity.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / onChainEquity.totalSupplyExact);

  return {
    concentration,
  };
}
