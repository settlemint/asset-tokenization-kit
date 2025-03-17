import { BigDecimal } from "@graphprotocol/graph-ts";
import { StableCoin, TokenizedDeposit } from "../../../generated/schema";
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

export function tokenizedDepositCollateralCalculatedFields(tokenizedDeposit: TokenizedDeposit): TokenizedDeposit {
  tokenizedDeposit.collateralRatio = tokenizedDeposit.collateral.equals(BigDecimal.zero())
    ? BigDecimal.fromString("100")
    : tokenizedDeposit.totalSupply
        .div(tokenizedDeposit.collateral)
        .times(BigDecimal.fromString("100"));

  tokenizedDeposit.freeCollateralExact = tokenizedDeposit.collateralExact.minus(
    tokenizedDeposit.totalSupplyExact
  );
  tokenizedDeposit.freeCollateral = toDecimals(
    tokenizedDeposit.freeCollateralExact,
    tokenizedDeposit.decimals
  );
  return tokenizedDeposit;
}
