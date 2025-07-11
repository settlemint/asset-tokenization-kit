import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { createUpcomingAction, generateActionId } from "../actions";

/**
 * Creates an action for bond maturity
 */
export function createBondMaturityAction(
  transactionHash: Bytes,
  logIndex: BigInt,
  tokenAddress: Bytes,
  maturityDate: BigInt,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  relatedEvent: Bytes
): void {
  let actionId = generateActionId(transactionHash, logIndex, "-bond-maturity");

  createUpcomingAction(
    actionId,
    "Bond Maturity Due",
    "Bond tokens are approaching maturity and can be redeemed",
    createdBy,
    deployedInTransaction,
    maturityDate,
    relatedEvent,
    null,
    tokenAddress
  );
}
