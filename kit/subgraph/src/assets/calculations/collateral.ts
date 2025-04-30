import { BigDecimal } from "@graphprotocol/graph-ts";
import { Deposit, StableCoin } from "../../../generated/schema";
import { setValueWithDecimals } from "../../utils/decimals";

export function collateralCalculatedFields(stableCoin: StableCoin): StableCoin {
  stableCoin.collateralRatio = stableCoin.collateral.equals(BigDecimal.zero())
    ? BigDecimal.fromString("100")
    : stableCoin.totalSupply
        .div(stableCoin.collateral)
        .times(BigDecimal.fromString("100"));

  setValueWithDecimals(
    stableCoin,
    "freeCollateral",
    stableCoin.collateralExact.minus(stableCoin.totalSupplyExact),
    stableCoin.decimals
  );

  return stableCoin;
}

export function depositCollateralCalculatedFields(deposit: Deposit): Deposit {
  deposit.collateralRatio = deposit.collateral.equals(BigDecimal.zero())
    ? BigDecimal.fromString("100")
    : deposit.totalSupply
        .div(deposit.collateral)
        .times(BigDecimal.fromString("100"));

  setValueWithDecimals(
    deposit,
    "freeCollateral",
    deposit.collateralExact.minus(deposit.totalSupplyExact),
    deposit.decimals
  );

  return deposit;
}
