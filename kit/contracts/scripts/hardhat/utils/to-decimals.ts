import { Address } from "viem";

export function toDecimals(amount: bigint, decimals: number): bigint {
  return amount * 10n ** BigInt(decimals);
}
