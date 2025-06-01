import { BigInt } from "@graphprotocol/graph-ts";
import { setBigNumber } from "../../utils/bignumber";
import { Token } from "../../../../generated/schema";

export function increaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.plus(amount),
    token.decimals,
  );

  token.save();
}

export function decreaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.minus(amount),
    token.decimals,
  );

  token.save();
}
