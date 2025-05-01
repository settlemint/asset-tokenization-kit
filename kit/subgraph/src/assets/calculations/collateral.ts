import { BigDecimal, BigInt, Entity } from "@graphprotocol/graph-ts";
import { setValueWithDecimals } from "../../utils/decimals";

export function calculateCollateral(
  asset: Entity,
  collateralExact: BigInt,
  totalSupplyExact: BigInt,
  decimals: number
): void {
  const collateralRatio = collateralExact.equals(BigInt.zero())
    ? BigInt.fromString("100")
    : totalSupplyExact.div(collateralExact).times(BigInt.fromString("100"));

  asset.setBigDecimal(
    "collateralRatio",
    BigDecimal.fromString(collateralRatio.toString())
  );

  setValueWithDecimals(
    asset,
    "freeCollateral",
    collateralExact.minus(totalSupplyExact),
    decimals
  );
}
