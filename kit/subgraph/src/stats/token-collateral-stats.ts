import {
  Token,
  TokenCollateral,
  TokenCollateralStatsData,
} from "../../generated/schema";
import { setBigNumber } from "../utils/bignumber";

export function trackTokenCollateralStats(
  token: Token,
  collateral: TokenCollateral
): void {
  if (!collateral.expiryTimestamp || !collateral.collateralExact) {
    return;
  }

  const statsData = new TokenCollateralStatsData(1);
  statsData.token = token.id;

  statsData.expiryTimestamp = collateral.expiryTimestamp!;

  setBigNumber(
    statsData,
    "collateral",
    collateral.collateralExact!,
    token.decimals
  );
  setBigNumber(
    statsData,
    "collateralAvailable",
    collateral.collateralExact!.minus(token.totalSupplyExact),
    token.decimals
  );
  setBigNumber(
    statsData,
    "collateralUsed",
    token.totalSupplyExact,
    token.decimals
  );

  statsData.save();
}
