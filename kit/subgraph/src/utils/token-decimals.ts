import { Address } from "@graphprotocol/graph-ts";
import { DEFAULT_TOKEN_DECIMALS } from "../config/token";
import { fetchToken } from "../token/fetch/token";

export function getTokenDecimals(tokenAddress: Address): i32 {
  return tokenAddress.equals(Address.zero())
    ? DEFAULT_TOKEN_DECIMALS
    : fetchToken(tokenAddress).decimals;
}
