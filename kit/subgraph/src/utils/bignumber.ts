import { type BigDecimal, BigInt, type Entity } from '@graphprotocol/graph-ts';

function toDecimals(value: BigInt, decimals: number): BigDecimal {
  const precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();
  return value.divDecimal(precision);
}

export function setBigNumber(
  entity: Entity,
  fieldName: string,
  value: BigInt,
  decimals: number
): void {
  entity.setBigInt(fieldName.concat('Exact'), value);
  entity.setBigDecimal(fieldName, toDecimals(value, decimals));
}
