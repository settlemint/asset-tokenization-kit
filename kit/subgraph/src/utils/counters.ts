import { BigInt, Entity } from "@graphprotocol/graph-ts";

export function increase(
  entity: Entity,
  fieldName: string,
  amount: BigInt = BigInt.fromI32(1)
): void {
  entity.setBigInt(fieldName, entity.getBigInt(fieldName).plus(amount));
}

export function decrease(
  entity: Entity,
  fieldName: string,
  amount: BigInt = BigInt.fromI32(1)
): void {
  entity.setBigInt(fieldName, entity.getBigInt(fieldName).minus(amount));
}
