import { useMemo } from "react";
import { from, greaterThan } from "dnum";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

/**
 * Custom hook for calculating collateral-related values
 *
 * Extracts business logic from CollateralSheet component to improve
 * maintainability and testability.
 */
export function useCollateralValues(asset: Token) {
  const { decimals, collateral, totalSupply } = asset;

  const currentCollateral = useMemo(
    () => collateral?.collateral ?? from(0, decimals),
    [collateral, decimals]
  );

  const currentSupply = totalSupply;

  const utilization = useMemo(() => {
    if (!greaterThan(currentCollateral, from(0, decimals))) return 0;
    const percent =
      (Number(currentSupply[0]) / Number(currentCollateral[0])) * 100;
    return Math.min(100, Math.round(percent));
  }, [currentCollateral, currentSupply, decimals]);

  return {
    currentCollateral,
    currentSupply,
    utilization,
    decimals,
  };
}
