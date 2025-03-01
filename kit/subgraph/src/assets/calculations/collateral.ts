import { BigDecimal } from "@graphprotocol/graph-ts";
import { StableCoin } from "../../../generated/schema";

export function collateralCalculatedFields(stableCoin: StableCoin) {
  const ratio = stableCoin.totalSupply.equals(BigDecimal.zero())
    ? BigDecimal.fromString("100")
    : stableCoin.collateral.div(stableCoin.totalSupply);
  stableCoin.collateralRatio = ratio;

  const freeCollateral = stableCoin.collateral.minus(stableCoin.totalSupply);
  const freeCollateralExact = stableCoin.collateralExact.minus(
    stableCoin.totalSupplyExact
  );
  stableCoin.freeCollateral = freeCollateral;
  stableCoin.freeCollateralExact = freeCollateralExact;
}
