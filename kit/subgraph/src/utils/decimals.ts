import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function toDecimals(value: BigInt, decimals: number): BigDecimal {
  const precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();
  return value.divDecimal(precision);
}
