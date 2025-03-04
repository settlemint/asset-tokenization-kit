import { BigDecimal } from "@graphprotocol/graph-ts";
import { StableCoin } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";

export function collateralCalculatedFields(stableCoin: StableCoin): StableCoin {
  stableCoin.collateralRatio = stableCoin.collateral.equals(BigDecimal.zero())
    ? BigDecimal.fromString("100")
    : stableCoin.totalSupply
        .div(stableCoin.collateral)
        .times(BigDecimal.fromString("100"));

  stableCoin.freeCollateralExact = stableCoin.collateralExact.minus(
    stableCoin.totalSupplyExact
  );
  stableCoin.freeCollateral = toDecimals(
    stableCoin.freeCollateralExact,
    stableCoin.decimals
  );
  return stableCoin;
}
