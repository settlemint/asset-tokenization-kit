import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DEFAULT_TOKEN_DECIMALS } from "../config/token";
import { fetchToken } from "../token/fetch/token";

export function getTokenDecimals(tokenAddress: Address): i32 {
  return tokenAddress.equals(Address.zero())
    ? DEFAULT_TOKEN_DECIMALS
    : fetchToken(tokenAddress).decimals;
}

export function toBigDecimal(value: BigInt, decimals: i32): BigDecimal {
  const precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();
  return value.divDecimal(precision);
}
