import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenCollateral } from "../../../../generated/schema";
import { setBigNumber } from "../../utils/bignumber";

export function fetchCollateral(
  address: Address,
  initialDecimals: number = 18
): TokenCollateral {
  let collateral = TokenCollateral.load(address);

  if (!collateral) {
    collateral = new TokenCollateral(address);
    collateral.issuer = Address.zero();
    setBigNumber(collateral, "amount", BigInt.zero(), initialDecimals);
    collateral.expiryTimestamp = BigInt.zero();
    collateral.save();
  }

  return collateral;
}
